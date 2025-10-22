# 🧠 Railway Deployment Forensics & Recovery System

A comprehensive autonomous deployment analysis system for Railway environments. This system performs full-stack forensic audits of crashed services, diagnosing failures at system, environment, code, and platform layers.

## 🎯 Features

### 🔍 Diagnostic Layers
1. **Infrastructure** - Environment variables, CPU/memory, ports
2. **Build Process** - Dockerfile/Buildpacks, start commands
3. **Dependency Chain** - Version mismatches, package conflicts
4. **Runtime** - Logs, crash loops, OOM, connection issues
5. **External Integrations** - Databases, APIs, webhooks
6. **Health & Recovery** - Restart policies, health checks

### 🧭 Causal Trace Mode
- Traces backward from failure symptoms to root causes
- Maps dependencies and trigger chains
- Generates testable hypotheses with confidence scores

### 🚂 Railway Integration
- Direct Railway CLI integration
- Automated log analysis
- Environment variable management
- One-click redeployment

## 📁 Project Structure

```
A5-Browser-Use-v.0.0.5/
├── Python_server/                 # Main FastAPI application
│   ├── main.py                   # FastAPI server with forensics endpoint
│   ├── requirements.txt          # Python dependencies
│   └── .env.example             # Environment variables template
├── deployment_forensics_agent.py # Core forensics engine
├── railway_forensics_cli.py     # Railway CLI integration
├── setup_railway_deployment.py  # Automated setup script
├── test_forensics_system.py     # Comprehensive test suite
└── RAILWAY_FORENSICS_README.md  # This documentation
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Python_server
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 3. Run Forensics Analysis

```bash
# Basic forensics
python deployment_forensics_agent.py

# Railway-enhanced forensics
python railway_forensics_cli.py --analyze

# Auto-fix and redeploy
python railway_forensics_cli.py --analyze --auto-fix --redeploy
```

### 4. Set Up Railway Deployment

```bash
# Complete setup
python setup_railway_deployment.py --full-setup

# Deploy to Railway
python setup_railway_deployment.py --deploy
```

## 🧠 Core Components

### DeploymentForensicsAgent

The main forensics engine that performs comprehensive analysis:

```python
from deployment_forensics_agent import DeploymentForensicsAgent

agent = DeploymentForensicsAgent()
report = await agent.perform_full_forensics()
```

**Key Methods:**
- `perform_full_forensics()` - Complete diagnostic analysis
- `_diagnose_infrastructure()` - Infrastructure layer analysis
- `_diagnose_build_process()` - Build process analysis
- `_diagnose_dependency_chain()` - Dependency analysis
- `_diagnose_runtime()` - Runtime analysis
- `_diagnose_external_integrations()` - External service analysis
- `_diagnose_health_recovery()` - Health and recovery analysis

### RailwayForensicsCLI

Railway-specific integration and automation:

```python
from railway_forensics_cli import RailwayForensicsCLI

cli = RailwayForensicsCLI()
logs = await cli.get_railway_logs()
variables = await cli.get_railway_variables()
status = await cli.get_railway_status()
```

**Key Methods:**
- `get_railway_logs()` - Retrieve service logs
- `get_railway_variables()` - Get environment variables
- `get_railway_status()` - Check service status
- `redeploy_service()` - Redeploy service
- `set_environment_variable()` - Set env vars
- `run_forensics_with_railway_data()` - Enhanced analysis

## 🔧 Configuration

### Environment Variables

Required environment variables:

```bash
OPENAI_API_KEY=sk-your-openai-key-here
PORT=8888
PYTHON_VERSION=3.11
PYTHONUNBUFFERED=1
```

### Railway Configuration

The system creates several configuration files:

- `railway.json` - Railway deployment configuration
- `Procfile` - Process definition
- `.railwayignore` - Files to ignore during deployment

## 📊 Output Formats

### Human-Readable Summary

```
🧠 DEPLOYMENT FORENSICS & AUTOPSY PROTOCOL - FINAL REPORT
================================================================================

📊 HEALTH SCORE: 75/100

📈 SUMMARY:
   • Total Issues: 3
   • Critical: 1
   • High: 1
   • Medium: 1
   • Low: 0

🧩 ROOT CAUSE MAP:
──────────────────────────────────────────────────
[1] Symptom → Missing required environment variables: ['OPENAI_API_KEY']
[1] Likely Cause → environment_configuration
[1] Trigger Chain → railway_deployment → env_vars → missing_vars
[1] Fix → Set environment variables: OPENAI_API_KEY
[1] Confidence → 95.0%
──────────────────────────────────────────────────
```

### JSON Diagnostic Report

```json
{
  "timestamp": "2024-01-01T12:00:00",
  "health_score": 75,
  "summary": {
    "total_signals": 3,
    "critical_issues": 1,
    "high_issues": 1,
    "medium_issues": 1
  },
  "root_cause_analysis": {
    "hypotheses": [...],
    "confidence_scores": [0.95, 0.8, 0.7]
  },
  "immediate_fixes": [...],
  "preventive_measures": [...],
  "redeploy_command": "railway up"
}
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
python test_forensics_system.py

# Verbose output
python test_forensics_system.py --verbose

# Test Railway integration
python test_forensics_system.py --test-railway
```

Test coverage includes:
- All diagnostic layers
- Causal trace analysis
- Railway CLI integration
- Integration scenarios
- Error handling

## 🚂 Railway Deployment

### Automated Setup

```bash
# Complete setup and deployment
python setup_railway_deployment.py --full-setup
python setup_railway_deployment.py --deploy
```

### Manual Setup

1. **Initialize Railway project:**
   ```bash
   railway init
   ```

2. **Set environment variables:**
   ```bash
   railway variables set OPENAI_API_KEY=your-key-here
   railway variables set PORT=8888
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

4. **Monitor:**
   ```bash
   railway logs
   ```

### Health Checks

The system includes health check endpoints:

- `GET /health` - Basic health check
- `GET /forensics` - Run forensics analysis via API

## 🔍 Diagnostic Examples

### Missing Environment Variables

**Symptom:** Service crashes on startup
**Detection:** `OPENAI_API_KEY not found in .env file`
**Fix:** `railway variables set OPENAI_API_KEY=your-key`

### Port Binding Issues

**Symptom:** Connection refused errors
**Detection:** `Port 8888 not bound to any process`
**Fix:** Ensure FastAPI binds to `0.0.0.0:$PORT`

### Dependency Conflicts

**Symptom:** Import errors in logs
**Detection:** `Module not found error in logs`
**Fix:** Check `requirements.txt` and install dependencies

### Memory Issues

**Symptom:** Out of memory errors
**Detection:** `High memory usage: 95.2%`
**Fix:** Optimize memory usage or upgrade Railway plan

## 🛠️ Troubleshooting

### Common Issues

1. **Railway CLI not found:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Permission denied:**
   ```bash
   chmod +x setup_railway_deployment.py
   ```

3. **Python dependencies:**
   ```bash
   pip install -r Python_server/requirements.txt
   ```

### Debug Mode

Enable debug logging:

```python
import logging
logging.getLogger().setLevel(logging.DEBUG)
```

## 📈 Monitoring & Alerts

### Health Score Calculation

The system calculates a health score (0-100) based on:
- Critical issues: -30 points each
- High issues: -15 points each
- Medium issues: -5 points each
- Low issues: -1 point each

### Automated Monitoring

Set up monitoring with:

```bash
# Check service health
curl https://your-app.railway.app/health

# Run forensics analysis
curl https://your-app.railway.app/forensics
```

## 🔮 Future Enhancements

- [ ] Real-time monitoring dashboard
- [ ] Automated rollback capabilities
- [ ] Integration with other cloud platforms
- [ ] Machine learning-based failure prediction
- [ ] Custom diagnostic plugins
- [ ] Slack/Discord notifications

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Run the test suite to identify problems
3. Create an issue with diagnostic output
4. Include the JSON forensics report

---

**System equilibrium restored. Crash vector neutralized.**
**Proceeding with redeployment simulation...** 🚀