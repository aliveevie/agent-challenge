# 🐳 Docker Build & Deployment Guide

## Prerequisites

1. ✅ Docker installed and running
2. ✅ Docker Hub account created
3. ✅ Logged into Docker Hub: `docker login`

## Step 1: Build the Docker Image

```bash
# Navigate to project directory
cd agent-challenge

# Build the Docker image (replace YOUR_USERNAME with your Docker Hub username)
docker build -t YOUR_USERNAME/arbitrage-bot-pro:latest .
```

**Build Time:** ~5-10 minutes (depending on your system)

**What happens during build:**
- ✅ Installs all Node.js dependencies
- ✅ Builds Next.js frontend
- ✅ Builds Mastra agent server
- ✅ Configures production environment
- ✅ Sets up non-root user for security
- ✅ Exposes ports 3000 (UI) and 4111 (Agent)

## Step 2: Test Locally

```bash
# Run the container locally to test
docker run -p 3000:3000 -p 4111:4111 YOUR_USERNAME/arbitrage-bot-pro:latest
```

**Access the application:**
- 🌐 Frontend: http://localhost:3000
- 🤖 Agent Playground: http://localhost:4111

**Test checklist:**
- [ ] Frontend loads successfully
- [ ] Can interact with the AI agent
- [ ] Virtual trading account activates
- [ ] Price data loads from exchanges
- [ ] Arbitrage opportunities display
- [ ] No errors in console

Press `Ctrl+C` to stop the container when testing is complete.

## Step 3: Push to Docker Hub

```bash
# Login to Docker Hub (if not already logged in)
docker login

# Push the image
docker push YOUR_USERNAME/arbitrage-bot-pro:latest
```

**Verify:** Check your Docker Hub repository to ensure the image uploaded successfully.

## Step 4: Deploy to Nosana

### Method A: Nosana Dashboard (Recommended)

1. **Open Nosana Dashboard**
   - Go to: https://dashboard.nosana.com/deploy

2. **Expand Job Definition**
   - Click the `Expand` button

3. **Edit Job Configuration**
   - Open `nos_job_def/nosana_mastra_job_definition.json`
   - Update the `image` field with your Docker Hub image:
   
   ```json
   {
     "version": "1.0",
     "type": "container",
     "meta": {
       "trigger": "cli"
     },
     "ops": [
       {
         "type": "container/run",
         "id": "arbitrage-bot-pro",
         "args": {
           "image": "YOUR_USERNAME/arbitrage-bot-pro:latest",
           "gpu": true,
           "expose": 3000
         }
       }
     ]
   }
   ```

4. **Copy & Paste Job Definition**
   - Copy the entire JSON from the file
   - Paste into the Nosana Dashboard

5. **Select GPU**
   - Choose an available GPU from the dropdown
   - Recommended: NVIDIA 3090 or better

6. **Deploy!**
   - Click the `Deploy` button
   - Wait for the job to be picked up by a Nosana node
   - Monitor the deployment status

### Method B: Nosana CLI

```bash
# Install Nosana CLI (if not already installed)
npm install -g @nosana/cli

# Deploy using CLI
nosana job post \
  --file ./nos_job_def/nosana_mastra_job_definition.json \
  --market nvidia-3090 \
  --timeout 30
```

## Step 5: Access Your Deployed Application

After successful deployment, Nosana will provide:
- **Job ID**: Unique identifier for your deployment
- **Access URL**: Public URL to access your application
- **Node Info**: Details about the Nosana node running your container

**Example Access URL:**
```
https://your-job-id.node.k8s.prd.nos.ci
```

## Monitoring & Debugging

### Check Container Logs

```bash
# Via Nosana Dashboard
# Navigate to your job and view the logs tab

# Via Nosana CLI
nosana job logs <JOB_ID>
```

### Common Issues & Solutions

#### Issue: Build fails with "ENOENT: no such file or directory"
**Solution:** Ensure all files are committed to git before building

#### Issue: Container starts but UI doesn't load
**Solution:** Check if port 3000 is exposed correctly in Dockerfile and job definition

#### Issue: "Cannot connect to LLM"
**Solution:** Verify OLLAMA_API_URL environment variable is set correctly

#### Issue: Out of memory during build
**Solution:** Increase Docker Desktop memory allocation (Settings > Resources)

## Environment Variables

The following environment variables are configured in the Dockerfile:

```env
# LLM Configuration
OLLAMA_API_URL=https://3yt39qx97wc9hqwwmylrphi4jsxrngjzxnbw.node.k8s.prd.nos.ci/api
MODEL_NAME_AT_ENDPOINT=qwen3:8b

# Telemetry (Disabled)
DISABLE_TELEMETRY=true
POSTHOG_DISABLED=true
MASTRA_TELEMETRY_DISABLED=true
DO_NOT_TRACK=1

# Node Environment
NODE_ENV=production
```

## Container Specifications

- **Base Image:** node:lts
- **Build Type:** Multi-stage (optimized)
- **User:** Non-root (appuser:1001)
- **Ports:** 3000 (UI), 4111 (Agent)
- **Working Directory:** /app
- **Entry Point:** npm start
- **Estimated Size:** ~800MB

## Security Features

✅ **Non-root user:** Container runs as `appuser` (UID 1001)
✅ **No secrets in image:** All API keys via environment variables
✅ **Minimal attack surface:** Production dependencies only
✅ **Layer caching:** Optimized build with pnpm caching

## Performance Optimization

- **Multi-stage build:** Separates build and runtime environments
- **Dependency caching:** Uses pnpm fetch for faster builds
- **Production mode:** Optimized Next.js and Mastra builds
- **Source maps:** Enabled for debugging without bloat

## Deployment Checklist

Before deploying to Nosana, ensure:

- [ ] Code is committed and pushed to GitHub
- [ ] All tests pass locally
- [ ] Docker image builds successfully
- [ ] Container runs correctly locally
- [ ] Image is pushed to Docker Hub
- [ ] Job definition JSON is updated
- [ ] README is updated with deployment URL
- [ ] Video demo is recorded
- [ ] Social media post is prepared

## Next Steps After Deployment

1. **Test the deployed application** thoroughly
2. **Capture screenshots** of the running application
3. **Record your video demo** showing the deployed version
4. **Update README** with the deployment URL
5. **Create social media post** with #NosanaAgentChallenge
6. **Submit to SuperTeam** with all required links

## Support

If you encounter issues:

- 📚 Check [Nosana Docs](https://docs.nosana.io)
- 💬 Ask in [Discord](https://discord.com/channels/236263424676331521/1354391113028337664)
- 🐛 Review [Nosana CLI GitHub](https://github.com/nosana-ci/nosana-cli)

---

**Good luck with your deployment!** 🚀

*Your Arbitrage Bot Pro is about to go live on decentralized infrastructure!* 💰

