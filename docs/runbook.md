# Production Runbook

## Restart Services
docker compose up -d

## View Logs
docker compose logs -f backend

## Health Check
curl http://localhost/actuator/health

## Rollback
docker compose pull
docker compose up -d

## Failure Domains
- Frontend failure → UI unavailable
- Backend failure → API returns 502
- Database failure → read/write errors
