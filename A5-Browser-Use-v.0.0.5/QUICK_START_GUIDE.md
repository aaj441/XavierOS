# 🚀 Quick Start Guide - Railway Deployment Forensics System

## 🎯 What You Get

A complete autonomous deployment analysis system that:
- **Diagnoses** Railway deployment failures across 6 layers
- **Traces** root causes through causal analysis
- **Fixes** issues automatically where possible
- **Redeploys** services with confidence
- **Prevents** future failures

## ⚡ 30-Second Setup

```bash
# 1. Install dependencies
cd Python_server
pip install -r requirements.txt

# 2. Run forensics analysis
python ../deployment_forensics_agent.py

# 3. Set up Railway deployment
python ../setup_railway_deployment.py --full-setup

# 4. Deploy to Railway
python ../setup_railway_deployment.py --deploy
```

## 🔧 Common Use Cases

### 1. Diagnose a Crashed Service

```bash
# Basic diagnosis
python deployment_forensics_agent.py

# Railway-enhanced diagnosis
python railway_forensics_cli.py --analyze

# Auto-fix and redeploy
python railway_forensics_cli.py --analyze --auto-fix --redeploy
```

### 2. Set Up New Railway Project

```bash
# Complete setup
python setup_railway_deployment.py --full-setup

# Deploy
python setup_railway_deployment.py --deploy

# Monitor
railway logs
```

### 3. Run Tests

```bash
# All tests
python test_forensics_system.py

# With Railway integration
python test_forensics_system.py --test-railway

# Verbose output
python test_forensics_system.py --verbose
```

### 4. See Demo

```bash
# Crash scenario
python example_forensics_demo.py --scenario crash

# Memory issues
python example_forensics_demo.py --scenario memory

# Healthy deployment
python example_forensics_demo.py --scenario healthy
```

## 📊 Understanding the Output

### Health Score
- **90-100**: Excellent (minor issues)
- **70-89**: Good (some issues, but stable)
- **50-69**: Fair (multiple issues, needs attention)
- **30-49**: Poor (critical issues, likely unstable)
- **0-29**: Critical (service likely down)

### Issue Severity
- **CRITICAL**: Service won't start (missing API keys, port conflicts)
- **HIGH**: Service unstable (memory issues, dependency conflicts)
- **MEDIUM**: Performance issues (high CPU, slow responses)
- **LOW**: Minor issues (warnings, optimizations)

## 🚂 Railway Integration

### Environment Variables
```bash
# Set required variables
railway variables set OPENAI_API_KEY=your-key-here
railway variables set PORT=8888
railway variables set PYTHON_VERSION=3.11
```

### Monitoring
```bash
# Check logs
railway logs

# Check status
railway status

# Run forensics via API
curl https://your-app.railway.app/forensics
```

## 🔍 Diagnostic Layers Explained

1. **Infrastructure** - Environment, ports, memory, CPU
2. **Build Process** - Dependencies, start commands, configuration
3. **Dependency Chain** - Version conflicts, missing packages
4. **Runtime** - Process status, crash loops, errors
5. **External Integrations** - API keys, database connections
6. **Health & Recovery** - Restart policies, health checks

## 🧠 Causal Trace Mode

The system traces failures backward:
```
Symptom → Service crashed
Source → Missing OPENAI_API_KEY
Chain → Railway deployment → env_vars → missing_vars
Remedy → Set OPENAI_API_KEY environment variable
```

## 💀 Devil's Advocate Protocol

For each hypothesis, the system asks:
- "What else could cause this symptom?"
- "Are there alternative explanations?"
- "What hidden dependencies might be involved?"

## 📄 Output Formats

### Human-Readable
- Color-coded severity levels
- Step-by-step fix instructions
- Confidence scores
- Test commands

### JSON Report
- Machine-readable format
- Complete diagnostic data
- Integration-ready
- Structured for automation

## 🛠️ Troubleshooting

### Railway CLI Issues
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Check status
railway status
```

### Python Dependencies
```bash
# Install requirements
pip install -r Python_server/requirements.txt

# Check for conflicts
pip check
```

### Permission Issues
```bash
# Make scripts executable
chmod +x *.py

# Check file permissions
ls -la *.py
```

## 🎭 Demo Scenarios

### Crash Scenario
- Missing environment variables
- No processes running
- Port not bound
- **Expected Health Score**: 20-40

### Memory Scenario
- High memory usage (95%+)
- High CPU usage
- Process running but struggling
- **Expected Health Score**: 30-50

### Dependency Scenario
- Version conflicts
- Missing packages
- Import errors
- **Expected Health Score**: 40-60

### Healthy Scenario
- All environment variables set
- Processes running normally
- Low resource usage
- **Expected Health Score**: 80-100

## 🚀 Next Steps

1. **Run the demo** to see the system in action
2. **Set up your Railway project** with the automated setup
3. **Integrate forensics** into your deployment pipeline
4. **Monitor your service** with the health check endpoints
5. **Customize** the diagnostic rules for your specific needs

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the test suite to identify problems
3. Check the JSON forensics report for detailed diagnostics
4. Review the logs for specific error messages

---

**System equilibrium restored. Crash vector neutralized.**
**Proceeding with redeployment simulation...** 🚀