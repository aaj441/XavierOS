#!/usr/bin/env python3
"""
🚂 RAILWAY DEPLOYMENT SETUP & CONFIGURATION
============================================

Automated setup script for Railway deployment with forensics integration.
Configures environment, dependencies, and deployment settings.

Usage:
    python setup_railway_deployment.py --init
    python setup_railway_deployment.py --configure
    python setup_railway_deployment.py --deploy
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RailwayDeploymentSetup:
    """Railway deployment setup and configuration manager"""
    
    def __init__(self, project_path: Path = None):
        self.project_path = project_path or Path.cwd()
        self.python_server_path = self.project_path / "Python_server"
        self.railway_config = {}
        
    def init_railway_project(self) -> bool:
        """Initialize Railway project"""
        logger.info("🚂 Initializing Railway project...")
        
        try:
            # Check if Railway CLI is available
            result = subprocess.run(['railway', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode != 0:
                logger.error("❌ Railway CLI not found. Please install it first.")
                return False
            
            # Initialize Railway project
            result = subprocess.run(['railway', 'init'], 
                                  cwd=self.project_path,
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                logger.info("✅ Railway project initialized successfully")
                return True
            else:
                logger.error(f"❌ Failed to initialize Railway project: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Timeout initializing Railway project")
            return False
        except Exception as e:
            logger.error(f"❌ Error initializing Railway project: {e}")
            return False
    
    def create_railway_config(self) -> bool:
        """Create Railway configuration files"""
        logger.info("📝 Creating Railway configuration...")
        
        try:
            # Create railway.json
            railway_config = {
                "build": {
                    "builder": "NIXPACKS"
                },
                "deploy": {
                    "startCommand": "cd Python_server && uvicorn main:app --host 0.0.0.0 --port $PORT",
                    "healthcheckPath": "/",
                    "healthcheckTimeout": 100,
                    "restartPolicyType": "ON_FAILURE",
                    "restartPolicyMaxRetries": 3
                }
            }
            
            railway_file = self.project_path / "railway.json"
            with open(railway_file, 'w') as f:
                json.dump(railway_config, f, indent=2)
            
            logger.info("✅ railway.json created")
            
            # Create Procfile for Railway
            procfile_content = "web: cd Python_server && uvicorn main:app --host 0.0.0.0 --port $PORT"
            procfile = self.project_path / "Procfile"
            with open(procfile, 'w') as f:
                procfile.write_text(procfile_content)
            
            logger.info("✅ Procfile created")
            
            # Create .railwayignore
            railwayignore_content = """# Ignore development files
*.pyc
__pycache__/
.env
.env.local
.env.development
.env.test
.env.production

# Ignore test files
test_*.py
*_test.py
tests/

# Ignore documentation
*.md
docs/

# Ignore assets
attached_assets/
Chrome_extension/

# Ignore forensics reports
*_forensics_report.json
deployment_forensics_report.json
"""
            railwayignore = self.project_path / ".railwayignore"
            with open(railwayignore, 'w') as f:
                railwayignore.write_text(railwayignore_content)
            
            logger.info("✅ .railwayignore created")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating Railway configuration: {e}")
            return False
    
    def setup_environment_variables(self) -> bool:
        """Set up environment variables for Railway"""
        logger.info("🔧 Setting up environment variables...")
        
        try:
            # Read .env.example
            env_example = self.python_server_path / ".env.example"
            if not env_example.exists():
                logger.error("❌ .env.example not found")
                return False
            
            with open(env_example, 'r') as f:
                env_vars = {}
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
            
            # Set environment variables in Railway
            for key, value in env_vars.items():
                if value and value != "yourAPIKeyHere" and value != "youtAPIKeyHere":
                    # Only set if it's not a placeholder
                    result = subprocess.run(['railway', 'variables', 'set', f"{key}={value}"], 
                                          capture_output=True, text=True, timeout=15)
                    if result.returncode == 0:
                        logger.info(f"✅ Set {key}")
                    else:
                        logger.warning(f"⚠️ Failed to set {key}: {result.stderr}")
            
            # Set required Railway variables
            railway_vars = {
                "PORT": "8888",
                "PYTHON_VERSION": "3.11",
                "PYTHONUNBUFFERED": "1"
            }
            
            for key, value in railway_vars.items():
                result = subprocess.run(['railway', 'variables', 'set', f"{key}={value}"], 
                                      capture_output=True, text=True, timeout=15)
                if result.returncode == 0:
                    logger.info(f"✅ Set {key}={value}")
                else:
                    logger.warning(f"⚠️ Failed to set {key}: {result.stderr}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error setting up environment variables: {e}")
            return False
    
    def optimize_requirements(self) -> bool:
        """Optimize requirements.txt for Railway deployment"""
        logger.info("📦 Optimizing requirements.txt...")
        
        try:
            requirements_file = self.python_server_path / "requirements.txt"
            if not requirements_file.exists():
                logger.error("❌ requirements.txt not found")
                return False
            
            # Read current requirements
            with open(requirements_file, 'r') as f:
                lines = f.readlines()
            
            # Optimize for Railway deployment
            optimized_requirements = [
                "# Core FastAPI dependencies\n",
                "fastapi==0.115.6\n",
                "uvicorn[standard]==0.22.0\n",
                "python-dotenv==1.0.1\n",
                "\n",
                "# AI/ML dependencies\n",
                "openai==1.59.5\n",
                "langchain==0.3.14\n",
                "langchain-openai==0.2.14\n",
                "langchain-ollama==0.2.2\n",
                "langchain-google-genai==2.0.8\n",
                "browser-use==0.1.21\n",
                "\n",
                "# Data validation\n",
                "pydantic==2.10.5\n",
                "\n",
                "# System dependencies\n",
                "psutil==5.9.0\n",
                "\n",
                "# Optional: Add specific versions for stability\n",
                "# Uncomment if you encounter version conflicts\n",
                "# requests==2.31.0\n",
                "# httpx==0.24.1\n"
            ]
            
            # Write optimized requirements
            with open(requirements_file, 'w') as f:
                f.writelines(optimized_requirements)
            
            logger.info("✅ requirements.txt optimized for Railway")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error optimizing requirements: {e}")
            return False
    
    def create_startup_script(self) -> bool:
        """Create startup script for Railway"""
        logger.info("🚀 Creating startup script...")
        
        try:
            startup_script = self.python_server_path / "start.sh"
            startup_content = """#!/bin/bash

# Railway startup script
echo "🚂 Starting Railway deployment..."

# Set Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

# Start the application
echo "🚀 Starting FastAPI application..."
uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
"""
            
            with open(startup_script, 'w') as f:
                f.write(startup_content)
            
            # Make executable
            os.chmod(startup_script, 0o755)
            
            logger.info("✅ Startup script created")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating startup script: {e}")
            return False
    
    def create_health_check(self) -> bool:
        """Create health check endpoint"""
        logger.info("🏥 Creating health check...")
        
        try:
            # Read main.py
            main_file = self.python_server_path / "main.py"
            if not main_file.exists():
                logger.error("❌ main.py not found")
                return False
            
            with open(main_file, 'r') as f:
                content = f.read()
            
            # Add health check endpoint if not exists
            if "/health" not in content:
                health_endpoint = '''
# ----------------------------
# 11. Health Check Endpoint
# ----------------------------
@app.get("/health")
def health_check():
    """Health check endpoint for Railway"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "AI Agent API with BrowserUse",
        "version": "1.0"
    }
'''
                
                # Insert before the entry point
                if 'if __name__ == "__main__":' in content:
                    content = content.replace('if __name__ == "__main__":', health_endpoint + '\nif __name__ == "__main__":')
                else:
                    content += health_endpoint
                
                # Write back
                with open(main_file, 'w') as f:
                    f.write(content)
                
                logger.info("✅ Health check endpoint added")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating health check: {e}")
            return False
    
    def create_forensics_integration(self) -> bool:
        """Create forensics integration"""
        logger.info("🧠 Creating forensics integration...")
        
        try:
            # Create forensics endpoint in main.py
            main_file = self.python_server_path / "main.py"
            if not main_file.exists():
                logger.error("❌ main.py not found")
                return False
            
            with open(main_file, 'r') as f:
                content = f.read()
            
            # Add forensics endpoint if not exists
            if "/forensics" not in content:
                forensics_endpoint = '''
# ----------------------------
# 12. Forensics Endpoint
# ----------------------------
@app.get("/forensics")
async def run_forensics():
    """Run deployment forensics analysis"""
    try:
        from deployment_forensics_agent import DeploymentForensicsAgent
        agent = DeploymentForensicsAgent()
        report = await agent.perform_full_forensics()
        return report
    except Exception as e:
        return {"error": str(e), "message": "Forensics analysis failed"}
'''
                
                # Insert before the entry point
                if 'if __name__ == "__main__":' in content:
                    content = content.replace('if __name__ == "__main__":', forensics_endpoint + '\nif __name__ == "__main__":')
                else:
                    content += forensics_endpoint
                
                # Write back
                with open(main_file, 'w') as f:
                    f.write(content)
                
                logger.info("✅ Forensics endpoint added")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error creating forensics integration: {e}")
            return False
    
    def deploy_to_railway(self) -> bool:
        """Deploy to Railway"""
        logger.info("🚀 Deploying to Railway...")
        
        try:
            result = subprocess.run(['railway', 'up'], 
                                  cwd=self.project_path,
                                  capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("✅ Deployment successful!")
                logger.info(f"Deployment output: {result.stdout}")
                return True
            else:
                logger.error(f"❌ Deployment failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Deployment timeout")
            return False
        except Exception as e:
            logger.error(f"❌ Error during deployment: {e}")
            return False
    
    def run_full_setup(self) -> bool:
        """Run complete setup process"""
        logger.info("🚂 Starting complete Railway setup...")
        
        steps = [
            ("Creating Railway configuration", self.create_railway_config),
            ("Optimizing requirements", self.optimize_requirements),
            ("Creating startup script", self.create_startup_script),
            ("Creating health check", self.create_health_check),
            ("Creating forensics integration", self.create_forensics_integration),
        ]
        
        for step_name, step_func in steps:
            logger.info(f"📋 {step_name}...")
            if not step_func():
                logger.error(f"❌ Failed: {step_name}")
                return False
            logger.info(f"✅ Completed: {step_name}")
        
        logger.info("🎉 Railway setup completed successfully!")
        logger.info("\n📋 Next steps:")
        logger.info("1. Set your environment variables: railway variables set OPENAI_API_KEY=your_key")
        logger.info("2. Deploy: railway up")
        logger.info("3. Monitor: railway logs")
        logger.info("4. Run forensics: curl https://your-app.railway.app/forensics")
        
        return True

def main():
    """Main setup script"""
    parser = argparse.ArgumentParser(description='Railway Deployment Setup')
    parser.add_argument('--init', action='store_true', help='Initialize Railway project')
    parser.add_argument('--configure', action='store_true', help='Configure deployment')
    parser.add_argument('--deploy', action='store_true', help='Deploy to Railway')
    parser.add_argument('--full-setup', action='store_true', help='Run complete setup')
    parser.add_argument('--project-path', help='Project path (default: current directory)')
    
    args = parser.parse_args()
    
    project_path = Path(args.project_path) if args.project_path else Path.cwd()
    setup = RailwayDeploymentSetup(project_path)
    
    success = True
    
    if args.init:
        success &= setup.init_railway_project()
    
    if args.configure or args.full_setup:
        success &= setup.run_full_setup()
    
    if args.deploy:
        success &= setup.deploy_to_railway()
    
    if not any([args.init, args.configure, args.deploy, args.full_setup]):
        # Default: run full setup
        success = setup.run_full_setup()
    
    if success:
        print("\n🎉 Setup completed successfully!")
        return 0
    else:
        print("\n💥 Setup failed!")
        return 1

if __name__ == "__main__":
    exit(main())