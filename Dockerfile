# Stage 1: build the React app
FROM node:20-slim AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Django serves the API, the admin and the built React app on one origin
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=web /web/dist ./frontend_dist
RUN chmod +x start.sh
RUN DJANGO_SECRET_KEY=build-only python manage.py collectstatic --noinput \
 && useradd --system --no-create-home app \
 && mkdir -p /app/media \
 && chown -R app:app /app/media
USER app
ENV PORT=8080
CMD ["./start.sh"]
