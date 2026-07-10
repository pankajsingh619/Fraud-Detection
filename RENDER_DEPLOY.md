# Deploying the Backend on Render

This repository contains Python backend scripts and utilities. The recommended approach to host the backend on Render is to expose a web service (e.g., FastAPI/Flask) that serves your API and a lightweight `/health` endpoint so the frontend can warm it on first load.

Example steps (FastAPI):

1. Create a minimal FastAPI app (if you don't already have one):

```py
# server/app.py
from fastapi import FastAPI

app = FastAPI()

@app.get('/health')
async def health():
    return {"status": "ok"}

# mount your existing endpoints here
```

2. Add a `requirements.txt` listing your runtime dependencies and `gunicorn` + `uvicorn` if needed.

3. Push to your Git repository and create a new Web Service on Render:
- Environment: `Python 3.x`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn -k uvicorn.workers.UvicornWorker server.app:app --bind 0.0.0.0:$PORT`

4. Set any required environment variables in the Render dashboard.

5. (Optional) Configure auto-deploy from your Git branch.

Why add `/health`?

- The frontend attempts to call `/health` on first load to warm the backend. If the backend is sleeping (free tier), this allows the frontend to display a friendly loading screen while Render spins the instance up and the service responds, avoiding UI timeouts.

Notes

- If your backend is already a different framework, add a simple `/health` or `/ping` route that returns `200 OK` quickly.
- For secure services, consider gating health responses with internal tokens or restricting by origin.
