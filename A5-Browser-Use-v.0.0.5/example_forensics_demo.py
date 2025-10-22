#!/usr/bin/env python3
"""
🎭 FORENSICS SYSTEM DEMONSTRATION
=================================

Comprehensive demonstration of the Railway Deployment Forensics system.
Shows all features, diagnostic layers, and integration capabilities.

Usage:
    python example_forensics_demo.py
    python example_forensics_demo.py --scenario crash
    python example_forensics_demo.py --scenario healthy
    python example_forensics_demo.py --scenario memory
"""

import asyncio
import argparse
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from deployment_forensics_agent import DeploymentForensicsAgent, SystemSnapshot
from railway_forensics_cli import RailwayForensicsCLI

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ForensicsDemo:
    """Comprehensive demonstration of the forensics system"""
    
    def __init__(self):
        self.agent = DeploymentForensicsAgent()
        self.cli = RailwayForensicsCLI()
    
    def create_mock_scenario(self, scenario: str) -> SystemSnapshot:
        """Create mock system snapshots for different scenarios"""
        
        if scenario == "crash":
            # Scenario: Service crashed due to missing environment variables
            return SystemSnapshot(
                memory_usage={"total": 1000000000, "available": 800000000, "percent": 20.0},
                cpu_usage=15.0,
                disk_usage={"total": 10000000000, "used": 3000000000, "free": 7000000000, "percent": 30.0},
                network_connections=[],
                processes=[],  # No processes running
                environment_vars={"PATH": "/usr/bin", "HOME": "/home/user"},  # Missing API key
                port_bindings=[]  # No port bindings
            )
        
        elif scenario == "memory":
            # Scenario: High memory usage causing issues
            return SystemSnapshot(
                memory_usage={"total": 1000000000, "available": 50000000, "percent": 95.0},
                cpu_usage=85.0,
                disk_usage={"total": 10000000000, "used": 8000000000, "free": 2000000000, "percent": 80.0},
                network_connections=[],
                processes=[{"pid": 1234, "name": "python", "cpu_percent": 80.0, "memory_percent": 90.0}],
                environment_vars={"OPENAI_API_KEY": "sk-test123", "PORT": "8888"},
                port_bindings=[{"port": 8888, "address": "0.0.0.0", "pid": 1234}]
            )
        
        elif scenario == "dependency":
            # Scenario: Dependency conflicts
            return SystemSnapshot(
                memory_usage={"total": 1000000000, "available": 700000000, "percent": 30.0},
                cpu_usage=25.0,
                disk_usage={"total": 10000000000, "used": 4000000000, "free": 6000000000, "percent": 40.0},
                network_connections=[],
                processes=[{"pid": 1234, "name": "python", "cpu_percent": 5.0, "memory_percent": 10.0}],
                environment_vars={"OPENAI_API_KEY": "sk-test123", "PORT": "8888"},
                port_bindings=[{"port": 8888, "address": "0.0.0.0", "pid": 1234}]
            )
        
        elif scenario == "healthy":
            # Scenario: Healthy deployment
            return SystemSnapshot(
                memory_usage={"total": 1000000000, "available": 800000000, "percent": 20.0},
                cpu_usage=15.0,
                disk_usage={"total": 10000000000, "used": 3000000000, "free": 7000000000, "percent": 30.0},
                network_connections=[],
                processes=[{"pid": 1234, "name": "python", "cpu_percent": 5.0, "memory_percent": 10.0}],
                environment_vars={
                    "OPENAI_API_KEY": "sk-test123",
                    "PORT": "8888",
                    "PYTHON_VERSION": "3.11",
                    "PYTHONUNBUFFERED": "1"
                },
                port_bindings=[{"port": 8888, "address": "0.0.0.0", "pid": 1234}]
            )
        
        else:
            # Default: Mixed issues
            return SystemSnapshot(
                memory_usage={"total": 1000000000, "available": 600000000, "percent": 40.0},
                cpu_usage=45.0,
                disk_usage={"total": 10000000000, "used": 6000000000, "free": 4000000000, "percent": 60.0},
                network_connections=[],
                processes=[{"pid": 1234, "name": "python", "cpu_percent": 20.0, "memory_percent": 30.0}],
                environment_vars={"OPENAI_API_KEY": "sk-test123", "PORT": "8888"},
                port_bindings=[{"port": 8888, "address": "0.0.0.0", "pid": 1234}]
            )
    
    def create_mock_project_structure(self, scenario: str):
        """Create mock project structure for testing"""
        # Create Python_server directory
        python_server = Path("Python_server")
        python_server.mkdir(exist_ok=True)
        
        # Create main.py
        main_py_content = '''# main.py
import os
from fastapi import FastAPI
from datetime import datetime

app = FastAPI(title="AI Agent API with BrowserUse", version="1.0")

@app.get("/")
def read_root():
    return {"message": "AI Agent API is running"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8888)
'''
        (python_server / "main.py").write_text(main_py_content)
        
        # Create requirements.txt based on scenario
        if scenario == "dependency":
            requirements_content = '''fastapi==0.100.0
uvicorn==0.20.0
pydantic==2.0.0
openai==1.0.0
'''
        else:
            requirements_content = '''fastapi==0.115.6
uvicorn==0.22.0
pydantic==2.10.5
openai==1.59.5
browser-use==0.1.21
python-dotenv==1.0.1
'''
        
        (python_server / "requirements.txt").write_text(requirements_content)
        
        # Create .env.example
        env_example_content = '''OPENAI_API_KEY=yourAPIKeyHere
GEMINI_API_KEY=youtAPIKeyHere
PORT=8888
'''
        (python_server / ".env.example").write_text(env_example_content)
    
    async def demonstrate_basic_forensics(self, scenario: str):
        """Demonstrate basic forensics analysis"""
        print("\n" + "="*80)
        print("🧠 BASIC FORENSICS ANALYSIS DEMONSTRATION")
        print("="*80)
        
        # Set up mock scenario
        self.agent.system_snapshot = self.create_mock_scenario(scenario)
        self.agent.project_path = Path.cwd()
        self.create_mock_project_structure(scenario)
        
        # Run forensics
        print(f"\n🔍 Analyzing scenario: {scenario.upper()}")
        report = await self.agent.perform_full_forensics()
        
        # Print results
        self.agent.print_human_readable_summary(report)
        
        return report
    
    async def demonstrate_railway_integration(self):
        """Demonstrate Railway CLI integration"""
        print("\n" + "="*80)
        print("🚂 RAILWAY INTEGRATION DEMONSTRATION")
        print("="*80)
        
        # Check Railway CLI availability
        if self.cli.railway_available:
            print("✅ Railway CLI is available")
            
            # Demonstrate getting logs (mock)
            print("\n📋 Getting Railway logs...")
            logs = await self.cli.get_railway_logs()
            print(f"Retrieved {len(logs)} log lines")
            
            # Demonstrate getting variables (mock)
            print("\n🔧 Getting environment variables...")
            variables = await self.cli.get_railway_variables()
            print(f"Retrieved {len(variables)} environment variables")
            
            # Demonstrate getting status (mock)
            print("\n📊 Getting service status...")
            status = await self.cli.get_railway_status()
            print(f"Service status: {status.get('service_status', 'unknown')}")
            
        else:
            print("❌ Railway CLI not available - using mock data")
            
            # Mock Railway data
            mock_logs = [
                "2024-01-01 12:00:00 [INFO] Starting FastAPI application",
                "2024-01-01 12:00:01 [ERROR] Module not found: browser_use",
                "2024-01-01 12:00:02 [ERROR] Application crashed"
            ]
            
            mock_variables = {
                "OPENAI_API_KEY": "sk-test123",
                "PORT": "8888",
                "PYTHON_VERSION": "3.11"
            }
            
            mock_status = {
                "service_status": "error",
                "raw_output": "Service has errors"
            }
            
            print(f"\n📋 Mock logs ({len(mock_logs)} lines):")
            for log in mock_logs:
                print(f"  {log}")
            
            print(f"\n🔧 Mock variables ({len(mock_variables)}):")
            for key, value in mock_variables.items():
                print(f"  {key}={value}")
            
            print(f"\n📊 Mock status: {mock_status['service_status']}")
    
    async def demonstrate_diagnostic_layers(self):
        """Demonstrate each diagnostic layer"""
        print("\n" + "="*80)
        print("🔍 DIAGNOSTIC LAYERS DEMONSTRATION")
        print("="*80)
        
        # Set up mock scenario
        self.agent.system_snapshot = self.create_mock_scenario("crash")
        self.agent.project_path = Path.cwd()
        
        # Run each diagnostic layer individually
        layers = [
            ("Infrastructure", self.agent._diagnose_infrastructure),
            ("Build Process", self.agent._diagnose_build_process),
            ("Dependency Chain", self.agent._diagnose_dependency_chain),
            ("Runtime", self.agent._diagnose_runtime),
            ("External Integrations", self.agent._diagnose_external_integrations),
            ("Health & Recovery", self.agent._diagnose_health_recovery)
        ]
        
        for layer_name, layer_func in layers:
            print(f"\n🔍 Running {layer_name} diagnostics...")
            
            # Clear previous signals
            self.agent.diagnostic_signals = []
            
            # Run the layer
            await layer_func()
            
            # Show results
            layer_signals = [s for s in self.agent.diagnostic_signals if s.layer.value == layer_name.lower().replace(" ", "_").replace("&", "")]
            print(f"  Found {len(layer_signals)} issues:")
            
            for signal in layer_signals:
                print(f"    • [{signal.severity.value.upper()}] {signal.signal}")
                print(f"      Fix: {signal.remedy}")
    
    async def demonstrate_causal_trace(self):
        """Demonstrate causal trace analysis"""
        print("\n" + "="*80)
        print("🧭 CAUSAL TRACE ANALYSIS DEMONSTRATION")
        print("="*80)
        
        # Set up mock scenario with multiple issues
        self.agent.system_snapshot = self.create_mock_scenario("crash")
        self.agent.project_path = Path.cwd()
        
        # Run forensics to generate signals
        await self.agent.perform_full_forensics()
        
        # Demonstrate causal trace
        print("\n🔍 Performing causal trace analysis...")
        await self.agent._perform_causal_trace()
        
        # Show hypothesis generation
        print("\n🧠 Generating root cause hypotheses...")
        await self.agent._generate_hypotheses()
        
        print(f"\nGenerated {len(self.agent.hypotheses)} hypotheses:")
        for i, hypothesis in enumerate(self.agent.hypotheses, 1):
            print(f"\n[{i}] HYPOTHESIS:")
            print(f"    Symptom: {hypothesis.symptom}")
            print(f"    Cause: {hypothesis.likely_cause}")
            print(f"    Chain: {' → '.join(hypothesis.trigger_chain)}")
            print(f"    Fix: {hypothesis.fix}")
            print(f"    Confidence: {hypothesis.confidence:.1%}")
            print(f"    Test: {hypothesis.test_command}")
    
    async def demonstrate_devils_advocate(self):
        """Demonstrate devil's advocate protocol"""
        print("\n" + "="*80)
        print("💀 DEVIL'S ADVOCATE PROTOCOL DEMONSTRATION")
        print("="*80)
        
        # Set up mock scenario
        self.agent.system_snapshot = self.create_mock_scenario("crash")
        self.agent.project_path = Path.cwd()
        
        # Run forensics
        await self.agent.perform_full_forensics()
        
        # Generate hypotheses
        await self.agent._generate_hypotheses()
        
        print(f"\n🔍 Initial hypotheses: {len(self.agent.hypotheses)}")
        for hypothesis in self.agent.hypotheses:
            print(f"  • {hypothesis.symptom} (confidence: {hypothesis.confidence:.1%})")
        
        # Apply devil's advocate
        print("\n💀 Applying devil's advocate protocol...")
        await self.agent._devils_advocate_validation()
        
        print(f"\n🔍 After devil's advocate: {len(self.agent.hypotheses)}")
        for hypothesis in self.agent.hypotheses:
            print(f"  • {hypothesis.symptom} (confidence: {hypothesis.confidence:.1%})")
    
    async def demonstrate_json_output(self, scenario: str):
        """Demonstrate JSON output format"""
        print("\n" + "="*80)
        print("📄 JSON OUTPUT FORMAT DEMONSTRATION")
        print("="*80)
        
        # Set up mock scenario
        self.agent.system_snapshot = self.create_mock_scenario(scenario)
        self.agent.project_path = Path.cwd()
        
        # Run forensics
        report = await self.agent.perform_full_forensics()
        
        # Save JSON report
        report_file = f"forensics_demo_report_{scenario}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n📄 JSON report saved to: {report_file}")
        print(f"📊 Health score: {report['health_score']}/100")
        print(f"📈 Total issues: {report['summary']['total_signals']}")
        print(f"🔧 Immediate fixes: {len(report['immediate_fixes'])}")
        print(f"🧬 Preventive measures: {len(report['preventive_measures'])}")
        
        # Show sample JSON structure
        print(f"\n📋 Sample JSON structure:")
        print(json.dumps({
            "timestamp": report['timestamp'],
            "health_score": report['health_score'],
            "summary": report['summary'],
            "immediate_fixes": report['immediate_fixes'][:2],  # First 2 fixes
            "preventive_measures": report['preventive_measures'][:3]  # First 3 measures
        }, indent=2))
    
    async def run_complete_demonstration(self, scenario: str = "crash"):
        """Run complete demonstration"""
        print("🎭 RAILWAY DEPLOYMENT FORENSICS SYSTEM DEMONSTRATION")
        print("="*80)
        print(f"Scenario: {scenario.upper()}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("="*80)
        
        try:
            # 1. Basic forensics
            await self.demonstrate_basic_forensics(scenario)
            
            # 2. Railway integration
            await self.demonstrate_railway_integration()
            
            # 3. Diagnostic layers
            await self.demonstrate_diagnostic_layers()
            
            # 4. Causal trace
            await self.demonstrate_causal_trace()
            
            # 5. Devil's advocate
            await self.demonstrate_devils_advocate()
            
            # 6. JSON output
            await self.demonstrate_json_output(scenario)
            
            print("\n" + "="*80)
            print("🎉 DEMONSTRATION COMPLETED SUCCESSFULLY!")
            print("="*80)
            print("\n📋 What was demonstrated:")
            print("  ✅ Basic forensics analysis")
            print("  ✅ Railway CLI integration")
            print("  ✅ All 6 diagnostic layers")
            print("  ✅ Causal trace analysis")
            print("  ✅ Devil's advocate protocol")
            print("  ✅ JSON output format")
            print("  ✅ Human-readable summaries")
            print("  ✅ Root cause hypothesis generation")
            print("  ✅ Confidence scoring")
            print("  ✅ Test command generation")
            
            print("\n🚀 Next steps:")
            print("  1. Run: python deployment_forensics_agent.py")
            print("  2. Run: python railway_forensics_cli.py --analyze")
            print("  3. Run: python setup_railway_deployment.py --full-setup")
            print("  4. Run: python test_forensics_system.py")
            
        except Exception as e:
            print(f"\n❌ Demonstration failed: {e}")
            logger.exception("Demonstration error")

async def main():
    """Main demonstration entry point"""
    parser = argparse.ArgumentParser(description='Forensics System Demonstration')
    parser.add_argument('--scenario', choices=['crash', 'memory', 'dependency', 'healthy', 'mixed'], 
                       default='crash', help='Demo scenario to run')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    demo = ForensicsDemo()
    await demo.run_complete_demonstration(args.scenario)

if __name__ == "__main__":
    asyncio.run(main())