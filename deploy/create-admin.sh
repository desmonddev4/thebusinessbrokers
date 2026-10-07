#!/usr/bin/env bash
# Creates the first /admin/ login via the Cloud Run job. Run after gcp-setup.sh.
set -euo pipefail
PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID}"; REGION="${REGION:-africa-south1}"; JOB="tbb-manage"
read -rp "Admin username: " U; read -rp "Admin email: " E; read -rsp "Admin password (12+ characters): " P; echo
[ "${#P}" -ge 12 ] || { echo "Password too short"; exit 1; }
gcloud run jobs update "$JOB" --project="$PROJECT_ID" --region="$REGION" \
  --update-env-vars="^@^DJANGO_SUPERUSER_USERNAME=$U@DJANGO_SUPERUSER_EMAIL=$E@DJANGO_SUPERUSER_PASSWORD=$P" \
  --command=python --args="manage.py,createsuperuser,--noinput"
gcloud run jobs execute "$JOB" --project="$PROJECT_ID" --region="$REGION" --wait
# Put the job back to its normal command and remove the password from its environment.
gcloud run jobs update "$JOB" --project="$PROJECT_ID" --region="$REGION" \
  --remove-env-vars=DJANGO_SUPERUSER_USERNAME,DJANGO_SUPERUSER_EMAIL,DJANGO_SUPERUSER_PASSWORD \
  --command=sh --args="-c,python manage.py migrate --noinput && python manage.py seed_tbb"
echo "Admin created. Sign in at https://businessbrokers.com.gh/admin/"
