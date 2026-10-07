#!/usr/bin/env bash
# One-time Google Cloud setup for businessbrokers.com.gh.
#   Cloud Run (Django + built React app)  ->  Cloud SQL for PostgreSQL  ->  Cloud Storage (adviser photos)
#   Global external Application Load Balancer with a Google-managed certificate in front.
# Run from the project root:  PROJECT_ID=my-project ./deploy/gcp-setup.sh
# Every step is safe to read first. Re-running after a partial failure will report "already exists" for finished steps.
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID}"
REGION="${REGION:-africa-south1}"            # Johannesburg, closest to Ghana. Use europe-west1 if you prefer cheaper Tier 1 pricing.
DOMAIN="businessbrokers.com.gh"
WWW="www.${DOMAIN}"
SERVICE="tbb-web"; JOB="tbb-manage"; SA_NAME="tbb-web"
SQL_INSTANCE="tbb-db"; DB_NAME="tbb"; DB_USER="tbb"
BUCKET="${PROJECT_ID}-tbb-media"
REPO="tbb"; IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}/web:latest"
SA="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SQL_CONN="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"
gcloud config set project "$PROJECT_ID" >/dev/null

echo "== 1. APIs"
gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com \
  cloudbuild.googleapis.com secretmanager.googleapis.com compute.googleapis.com

echo "== 2. Service account"
gcloud iam service-accounts create "$SA_NAME" --display-name="TBB website" 2>/dev/null || true
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$SA" --role=roles/cloudsql.client --condition=None >/dev/null

echo "== 3. Cloud SQL (PostgreSQL 16)"
if ! gcloud sql instances describe "$SQL_INSTANCE" >/dev/null 2>&1; then
  gcloud sql instances create "$SQL_INSTANCE" --database-version=POSTGRES_16 --edition=ENTERPRISE \
    --tier=db-g1-small --region="$REGION" --storage-auto-increase --backup-start-time=02:00 \
    --retained-backups-count=14 --enable-point-in-time-recovery --deletion-protection
fi
gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE" 2>/dev/null || true
DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-28)"
if gcloud sql users list --instance="$SQL_INSTANCE" --format='value(name)' | grep -qx "$DB_USER"; then
  echo "DB user exists; leaving its password and the db-password secret unchanged."
else
  gcloud sql users create "$DB_USER" --instance="$SQL_INSTANCE" --password="$DB_PASSWORD"
  printf '%s' "$DB_PASSWORD" | gcloud secrets create db-password --data-file=- --replication-policy=automatic
fi

echo "== 4. Secrets"
if ! gcloud secrets describe django-secret-key >/dev/null 2>&1; then
  python3 -c "import secrets; print(secrets.token_urlsafe(64), end='')" | gcloud secrets create django-secret-key --data-file=- --replication-policy=automatic
fi
for s in django-secret-key db-password; do
  gcloud secrets add-iam-policy-binding "$s" --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor >/dev/null
done

echo "== 5. Media bucket (public read: adviser photos are public content)"
gcloud storage buckets create "gs://$BUCKET" --location="$REGION" --uniform-bucket-level-access 2>/dev/null || true
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member="serviceAccount:$SA" --role=roles/storage.objectAdmin >/dev/null
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --member=allUsers --role=roles/storage.objectViewer >/dev/null

echo "== 6. Build image"
gcloud artifacts repositories create "$REPO" --repository-format=docker --location="$REGION" 2>/dev/null || true
gcloud builds submit --tag "$IMAGE" .

COMMON_ENV="^@^DJANGO_ALLOWED_HOSTS=${DOMAIN},${WWW}@CSRF_TRUSTED_ORIGINS=https://${DOMAIN},https://${WWW}@DB_HOST=/cloudsql/${SQL_CONN}@DB_NAME=${DB_NAME}@DB_USER=${DB_USER}@GS_BUCKET_NAME=${BUCKET}@DEFAULT_FROM_EMAIL=website@${DOMAIN}"
SECRETS="DJANGO_SECRET_KEY=django-secret-key:latest,DB_PASSWORD=db-password:latest"

echo "== 7. Migrate and load content (Cloud Run job)"
gcloud run jobs delete "$JOB" --region="$REGION" --quiet 2>/dev/null || true
gcloud run jobs create "$JOB" --region="$REGION" --image="$IMAGE" --service-account="$SA" \
  --set-cloudsql-instances="$SQL_CONN" --set-env-vars="$COMMON_ENV" --set-secrets="$SECRETS" \
  --command=sh --args="-c,python manage.py migrate --noinput && python manage.py seed_tbb"
gcloud run jobs execute "$JOB" --region="$REGION" --wait

echo "== 8. Cloud Run service"
gcloud run deploy "$SERVICE" --region="$REGION" --image="$IMAGE" --service-account="$SA" \
  --add-cloudsql-instances="$SQL_CONN" --set-env-vars="$COMMON_ENV" --set-secrets="$SECRETS" \
  --allow-unauthenticated --min-instances=1 --max-instances=5 --cpu=1 --memory=512Mi --concurrency=40
# Note: this set-env-vars call is the full environment. To add EMAIL_* / ENQUIRY_NOTIFY_EMAIL later use:
#   gcloud run services update tbb-web --region=$REGION --update-env-vars=ENQUIRY_NOTIFY_EMAIL=...

echo "== 9. Load balancer"
gcloud compute addresses create tbb-ip --global --ip-version=IPV4 2>/dev/null || true
gcloud compute network-endpoint-groups create tbb-neg --region="$REGION" --network-endpoint-type=serverless --cloud-run-service="$SERVICE" 2>/dev/null || true
gcloud compute backend-services create tbb-backend --load-balancing-scheme=EXTERNAL_MANAGED --global 2>/dev/null || true
gcloud compute backend-services add-backend tbb-backend --global --network-endpoint-group=tbb-neg --network-endpoint-group-region="$REGION" 2>/dev/null || true
gcloud compute url-maps create tbb-urlmap --default-service=tbb-backend 2>/dev/null || true
cat > /tmp/tbb-urlmap.yaml <<YAML
name: tbb-urlmap
defaultService: https://www.googleapis.com/compute/v1/projects/${PROJECT_ID}/global/backendServices/tbb-backend
hostRules:
- hosts: ["${WWW}"]
  pathMatcher: www-to-apex
pathMatchers:
- name: www-to-apex
  defaultUrlRedirect:
    hostRedirect: ${DOMAIN}
    redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
    httpsRedirect: true
YAML
gcloud compute url-maps import tbb-urlmap --global --source=/tmp/tbb-urlmap.yaml --quiet
gcloud compute ssl-certificates create tbb-cert --domains="${DOMAIN},${WWW}" --global 2>/dev/null || true
gcloud compute target-https-proxies create tbb-https-proxy --url-map=tbb-urlmap --ssl-certificates=tbb-cert 2>/dev/null || true
gcloud compute forwarding-rules create tbb-https --global --load-balancing-scheme=EXTERNAL_MANAGED --network-tier=PREMIUM \
  --address=tbb-ip --target-https-proxy=tbb-https-proxy --ports=443 2>/dev/null || true
cat > /tmp/tbb-http-redirect.yaml <<YAML
name: tbb-http-redirect
defaultUrlRedirect:
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
  httpsRedirect: true
YAML
gcloud compute url-maps import tbb-http-redirect --global --source=/tmp/tbb-http-redirect.yaml --quiet
gcloud compute target-http-proxies create tbb-http-proxy --url-map=tbb-http-redirect 2>/dev/null || true
gcloud compute forwarding-rules create tbb-http --global --load-balancing-scheme=EXTERNAL_MANAGED --network-tier=PREMIUM \
  --address=tbb-ip --target-http-proxy=tbb-http-proxy --ports=80 2>/dev/null || true

IP="$(gcloud compute addresses describe tbb-ip --global --format='value(address)')"
cat <<MSG

Done. Now add these DNS records where businessbrokers.com.gh is managed:

    ${DOMAIN}.      A      ${IP}
    ${WWW}.   A      ${IP}

The Google-managed certificate only issues once DNS points at ${IP}; allow up to an hour or so.
Check progress with:  gcloud compute ssl-certificates describe tbb-cert --global --format='value(managed.status,managed.domainStatus)'

When https://${DOMAIN} loads, lock the service to the load balancer (stops the raw run.app URL bypassing it):
    gcloud run services update ${SERVICE} --region=${REGION} --ingress=internal-and-cloud-load-balancing

Then create the admin login:  ./deploy/create-admin.sh
MSG
