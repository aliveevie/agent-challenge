# 🚀 Deployment Guide - Arbitrage Bot Pro

Complete guide for deploying **Arbitrage Bot Pro** to the Nosana Network and other platforms.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Build](#docker-build)
4. [Nosana Deployment](#nosana-deployment)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)
7. [Production Checklist](#production-checklist)

---

## 📋 Prerequisites

### Required Software

- **Node.js** 20+ 
- **pnpm** 9+ (recommended) or yarn
- **Docker** 24+
- **Git**
- **Ollama** (for local testing)

### Nosana Account Setup

1. Create account at [nosana.io](https://nosana.io)
2. Get testnet tokens from faucet
3. Set up wallet connection
4. Generate API credentials

### API Keys & Credentials

```env
# Ollama (Nosana)
NOS_OLLAMA_API_URL=https://your-nosana-ollama-endpoint
NOS_MODEL_NAME_AT_ENDPOINT=qwen3:8b

# Optional: OpenAI (for production)
OPENAI_API_KEY=sk-...

# Optional: Exchange APIs (for live trading)
BINANCE_API_KEY=...
BINANCE_API_SECRET=...
COINBASE_API_KEY=...
COINBASE_API_SECRET=...
```

---

## 💻 Local Development

### Step 1: Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd agent-challenge

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env`:

```env
# Local Ollama
OLLAMA_API_URL=http://localhost:11434
MODEL_NAME_AT_ENDPOINT=qwen3:8b

# Or use Nosana
NOS_OLLAMA_API_URL=https://your-endpoint
NOS_MODEL_NAME_AT_ENDPOINT=qwen3:8b
```

### Step 3: Start Ollama (Local)

```bash
# Pull the model
ollama pull qwen3:8b

# Start Ollama server
ollama serve
```

### Step 4: Run Development Servers

```bash
# Terminal 1: Start agent backend
pnpm dev:agent

# Terminal 2: Start Next.js UI
pnpm dev:ui
```

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Agent API**: http://localhost:4111
- **MCP Server**: http://localhost:4111/mcp

### Development Tips

```bash
# Watch for changes
pnpm dev:agent --watch

# Debug mode
LOG_LEVEL=debug pnpm dev:agent

# Check agent status
curl http://localhost:4111/health
```

---

## 🐳 Docker Build

### Step 1: Review Dockerfile

The provided `Dockerfile` includes:
- Multi-stage build for optimization
- Node.js 20 Alpine base
- Proper caching layers
- Health checks
- Non-root user

### Step 2: Build Image

```bash
# Build for local testing
docker build -t arbitrage-bot-pro:latest .

# Build for specific platform
docker build --platform linux/amd64 -t arbitrage-bot-pro:latest .

# Build with build args
docker build \
  --build-arg NODE_ENV=production \
  -t arbitrage-bot-pro:latest .
```

### Step 3: Test Locally

```bash
# Run container
docker run -p 3000:3000 -p 4111:4111 \
  -e OLLAMA_API_URL="http://host.docker.internal:11434" \
  -e MODEL_NAME_AT_ENDPOINT="qwen3:8b" \
  arbitrage-bot-pro:latest

# Check logs
docker logs -f <container-id>

# Execute commands inside
docker exec -it <container-id> /bin/sh
```

### Step 4: Push to Registry

```bash
# Tag for your registry
docker tag arbitrage-bot-pro:latest your-registry.com/arbitrage-bot-pro:latest

# Login to registry
docker login your-registry.com

# Push image
docker push your-registry.com/arbitrage-bot-pro:latest
```

---

## ☁️ Nosana Deployment

### Step 1: Prepare Job Definition

Create `nos_job_def/arbitrage-job.json`:

```json
{
  "version": "1.0",
  "name": "arbitrage-bot-pro",
  "image": "your-registry.com/arbitrage-bot-pro:latest",
  "env": {
    "NOS_OLLAMA_API_URL": "{{OLLAMA_URL}}",
    "NOS_MODEL_NAME_AT_ENDPOINT": "qwen3:8b",
    "NODE_ENV": "production"
  },
  "resources": {
    "cpu": "2",
    "memory": "4Gi",
    "storage": "10Gi"
  },
  "ports": [
    {
      "containerPort": 3000,
      "protocol": "TCP",
      "name": "web"
    },
    {
      "containerPort": 4111,
      "protocol": "TCP",
      "name": "agent"
    }
  ],
  "healthCheck": {
    "path": "/api/health",
    "port": 3000,
    "initialDelaySeconds": 30,
    "periodSeconds": 10
  },
  "replicas": 1,
  "restartPolicy": "Always"
}
```

### Step 2: Configure Nosana CLI

```bash
# Install Nosana CLI
npm install -g @nosana/cli

# Login to Nosana
nosana login

# Verify account
nosana account info
```

### Step 3: Deploy to Nosana

```bash
# Submit job
nosana job create \
  --file nos_job_def/arbitrage-job.json \
  --network testnet

# Check job status
nosana job status <job-id>

# View logs
nosana job logs <job-id>

# List all jobs
nosana job list
```

### Step 4: Access Deployed Application

```bash
# Get job details
nosana job get <job-id>

# Find public URL in output
# Example: https://arbitrage-bot-<id>.nosana.network
```

### Step 5: Monitor Deployment

```bash
# Watch logs in real-time
nosana job logs <job-id> --follow

# Check resource usage
nosana job metrics <job-id>

# View events
nosana job events <job-id>
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NOS_OLLAMA_API_URL` | Nosana Ollama endpoint | `https://ollama.nosana.network` |
| `NOS_MODEL_NAME_AT_ENDPOINT` | Model name | `qwen3:8b` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Web server port | `3000` |
| `AGENT_PORT` | Agent API port | `4111` |
| `LOG_LEVEL` | Logging level | `info` |
| `MAX_SLIPPAGE` | Max slippage % | `0.5` |
| `MIN_PROFIT_PERCENT` | Min profit % | `0.5` |

### Security Best Practices

```bash
# Use secrets management
nosana secret create BINANCE_API_KEY "your-key"
nosana secret create BINANCE_API_SECRET "your-secret"

# Reference in job definition
{
  "env": {
    "BINANCE_API_KEY": "{{BINANCE_API_KEY}}",
    "BINANCE_API_SECRET": "{{BINANCE_API_SECRET}}"
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Agent Not Connecting

```bash
# Check agent health
curl http://localhost:4111/health

# Verify Ollama connection
curl $NOS_OLLAMA_API_URL/api/tags

# Check logs
docker logs <container> | grep -i error
```

**Solution**:
- Verify `NOS_OLLAMA_API_URL` is correct
- Ensure model is loaded: `ollama list`
- Check network connectivity

#### 2. Port Conflicts

```bash
# Find process using port
lsof -i :3000
lsof -i :4111

# Kill process
kill -9 <pid>
```

**Solution**:
- Change ports in `.env`
- Stop conflicting services

#### 3. Memory Issues

```bash
# Check memory usage
docker stats

# Increase memory limit
docker run -m 4g ...
```

**Solution**:
- Increase allocated memory
- Reduce concurrent operations
- Clear caches

#### 4. Slow Response Times

**Symptoms**:
- Agent responses take >10s
- UI freezes during operations

**Solution**:
```bash
# Check model load
ollama ps

# Verify CPU/Memory
docker stats

# Optimize model
# Use smaller model: qwen3:4b instead of qwen3:8b
```

#### 5. Build Failures

```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t arbitrage-bot-pro .

# Check disk space
df -h
```

---

## ✅ Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Docker image built successfully
- [ ] Local testing completed
- [ ] Documentation updated
- [ ] Secrets properly managed
- [ ] Logging configured
- [ ] Monitoring setup

### Deployment

- [ ] Image pushed to registry
- [ ] Job definition validated
- [ ] Resources allocated properly
- [ ] Health checks configured
- [ ] Ports exposed correctly
- [ ] SSL/TLS certificates ready
- [ ] Domain configured (if custom)

### Post-Deployment

- [ ] Application accessible
- [ ] Health endpoint responding
- [ ] Logs flowing properly
- [ ] Metrics collecting
- [ ] Agents responding
- [ ] UI loading correctly
- [ ] Database connected (if applicable)
- [ ] External APIs working

### Monitoring

- [ ] Set up alerts for:
  - High error rates
  - Slow response times
  - Resource exhaustion
  - Failed trades
  - API rate limits

- [ ] Configure dashboards for:
  - Request rates
  - Success/failure rates
  - Latency percentiles
  - Resource usage
  - Profit tracking

### Security

- [ ] API keys secured
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Input validation active
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] HTTPS enforced
- [ ] Regular security audits

---

## 📊 Performance Optimization

### Image Size Optimization

```dockerfile
# Use Alpine base
FROM node:20-alpine

# Multi-stage build
FROM node:20-alpine AS builder
# ... build steps
FROM node:20-alpine AS runtime
COPY --from=builder /app/dist ./dist
```

### Caching Strategy

```dockerfile
# Copy package files first
COPY package*.json ./
RUN pnpm install

# Then copy source
COPY . .
```

### Resource Tuning

```json
{
  "resources": {
    "cpu": "2",           // Adjust based on load
    "memory": "4Gi",      // Start with 4GB
    "storage": "10Gi"     // Increase if needed
  }
}
```

---

## 🔄 Updates & Rollbacks

### Deploy New Version

```bash
# Build new version
docker build -t arbitrage-bot-pro:v2 .

# Push to registry
docker push your-registry.com/arbitrage-bot-pro:v2

# Update job
nosana job update <job-id> \
  --image your-registry.com/arbitrage-bot-pro:v2
```

### Rollback

```bash
# Revert to previous version
nosana job update <job-id> \
  --image your-registry.com/arbitrage-bot-pro:v1

# Or create new job with old image
nosana job create --file nos_job_def/arbitrage-job-v1.json
```

---

## 📞 Support

### Resources

- **Documentation**: [Full Docs](https://github.com/your-repo)
- **Nosana Docs**: [nosana.io/docs](https://nosana.io/docs)
- **Discord**: [Join Community](#)
- **Issues**: [GitHub Issues](#)

### Getting Help

1. Check this guide first
2. Search existing issues
3. Join Discord for real-time help
4. Create GitHub issue with:
   - Environment details
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior

---

## 🎉 Success!

Your **Arbitrage Bot Pro** is now deployed and running on Nosana Network!

**Next Steps:**
1. Monitor initial performance
2. Optimize based on metrics
3. Scale as needed
4. Share your success!

**Happy Trading! 🚀💰**

