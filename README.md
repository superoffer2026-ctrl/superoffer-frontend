# SuperOffer Frontend

Independent Angular frontend deployment for Dokploy.

## Dokploy configuration

- Service type: Application
- Build type: Dockerfile
- Build path/context: `/frontend`
- Dockerfile: `/frontend/Dockerfile`
- Internal port: `80`
- Health check: `/health`

Set the runtime environment variable below in Dokploy:

```text
SUPER_OFFER_API_URL=https://your-backend-domain/api/v1
```

The frontend container writes this value to `config.js` when it starts, so the backend address can change without rebuilding Angular.
