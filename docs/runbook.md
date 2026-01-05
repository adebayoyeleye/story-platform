# Production Runbook

This runbook covers common operational actions for the Oracle Cloud VM deployment.

## Services (Typical)
- `nginx`
- `content-service`
- `frontend`
- `mongodb` (if self-hosted; Atlas in prod is also an option)

> Your exact service names depend on `docker-compose.prod.yml`.

---

## SSH to the VM
```bash
ssh ubuntu@<your-vm-host>

Go to app directory
cd /home/ubuntu/app

Pull latest images
docker compose -f docker-compose.prod.yml pull

Restart / Recreate services
docker compose -f docker-compose.prod.yml up -d --force-recreate

Reload Nginx
docker compose exec -T nginx nginx -s reload

View logs
docker compose -f docker-compose.prod.yml logs -f content-service
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f frontend

Health checks (if actuator enabled)
curl -s http://localhost:8080/actuator/health


If nginx proxies /api, you can also test:

curl -s http://localhost/api/actuator/health

Disk cleanup (safe-ish)
docker image prune -f

Rollback (Phase 2+ recommended approach)

Phase 1 uses latest tags which makes rollback harder.
In Phase 2 we will:

tag images with immutable versions (e.g. commit SHA)

pin compose to specific tags for controlled rollback