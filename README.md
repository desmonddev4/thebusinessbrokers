# Top Business Brokers Consult Limited: website

Django REST API + admin (`backend/`) and a React + Vite frontend (`frontend/`). PostgreSQL database.
In production one container serves everything on one origin: the React app, `/api/`, and `/admin/`.

## Run locally
```bash
docker compose up -d db                      # PostgreSQL 16 on localhost:5432 (tbb/tbb/tbb)
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
export DJANGO_DEBUG=1 DB_NAME=tbb DB_USER=tbb DB_PASSWORD=tbb DB_HOST=localhost   # see .env.example
python manage.py migrate && python manage.py seed_tbb && python manage.py createsuperuser
python manage.py runserver                   # API on :8000
cd ../frontend && npm install && npm run dev # site on :5173, proxies /api to :8000
```

## Content
`seed_tbb` loads the approved content (desks, advisers, directors, photos) and is safe to re-run: it never overwrites
records already in the database, so admin edits survive. `seed_tbb --force` resets them to the original content.
Edit desks, people (photos, qualifications) and read enquiries at `/admin/`.

## Deploy to Google Cloud (businessbrokers.com.gh)
Cloud Run + Cloud SQL (PostgreSQL) + Cloud Storage (photos) behind a global external Application Load Balancer.
```bash
export PROJECT_ID=your-gcp-project           # optionally REGION=europe-west1 (default africa-south1)
./deploy/gcp-setup.sh                        # one time: creates everything and prints the DNS records to add
./deploy/create-admin.sh                     # first admin login
./deploy/redeploy.sh                         # every later release
```
Email for enquiries: `gcloud run services update tbb-web --region=$REGION --update-env-vars=ENQUIRY_NOTIFY_EMAIL=...,EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend,EMAIL_HOST=...,EMAIL_HOST_USER=...`
(keep `EMAIL_HOST_PASSWORD` in Secret Manager and attach it with `--update-secrets`).
