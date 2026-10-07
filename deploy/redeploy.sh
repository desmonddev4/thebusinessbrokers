#!/usr/bin/env bash
# Ship a code change: rebuild, run migrations, roll out the new revision.
set -euo pipefail
PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID}"; REGION="${REGION:-africa-south1}"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/tbb/web:$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"
gcloud builds submit --project="$PROJECT_ID" --tag "$IMAGE" .
gcloud run jobs update tbb-manage --project="$PROJECT_ID" --region="$REGION" --image="$IMAGE"
gcloud run jobs execute tbb-manage --project="$PROJECT_ID" --region="$REGION" --wait   # migrate; seed leaves admin edits alone
gcloud run deploy tbb-web --project="$PROJECT_ID" --region="$REGION" --image="$IMAGE"
