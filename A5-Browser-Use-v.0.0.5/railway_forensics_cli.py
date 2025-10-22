#!/usr/bin/env python3
"""
🚂 RAILWAY FORENSICS CLI
========================

Command-line interface for Railway deployment forensics and recovery.
Integrates with Railway CLI to provide automated diagnosis and fixes.

Usage:
    python railway_forensics_cli.py --service <service_name>
    python railway_forensics_cli.py --project <project_id> --auto-fix
    python railway_forensics_cli.py --logs --analyze
"""

import argparse
import asyncio
import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

from deployment_forensics_agent import DeploymentForensicsAgent

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RailwayForensicsCLI:
    """Railway CLI integration for deployment forensics"""
    
    def __init__(self):
        self.railway_available = self._check_railway_cli()
        self.project_id = None
        self.service_name = None
        
    def _check_railway_cli(self) -> bool:
        """Check if Railway CLI is available"""
        try:
            result = subprocess.run(['railway', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info(f"✅ Railway CLI found: {result.stdout.strip()}")
                return True
            else:
                logger.warning("❌ Railway CLI not found or not working")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            logger.warning("❌ Railway CLI not found")
            return False
    
    async def get_railway_logs(self, lines: int = 100) -> List[str]:
        """Get Railway service logs"""
        if not self.railway_available:
            logger.error("Railway CLI not available")
            return []
        
        try:
            cmd = ['railway', 'logs', '--lines', str(lines)]
            if self.service_name:
                cmd.extend(['--service', self.service_name])
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                logs = result.stdout.strip().split('\n')
                logger.info(f"✅ Retrieved {len(logs)} log lines")
                return logs
            else:
                logger.error(f"❌ Failed to get logs: {result.stderr}")
                return []
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Timeout getting logs")
            return []
        except Exception as e:
            logger.error(f"❌ Error getting logs: {e}")
            return []
    
    async def get_railway_variables(self) -> Dict[str, str]:
        """Get Railway environment variables"""
        if not self.railway_available:
            logger.error("Railway CLI not available")
            return {}
        
        try:
            cmd = ['railway', 'variables']
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                variables = {}
                lines = result.stdout.strip().split('\n')
                
                for line in lines:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.split('=', 1)
                        variables[key.strip()] = value.strip()
                
                logger.info(f"✅ Retrieved {len(variables)} environment variables")
                return variables
            else:
                logger.error(f"❌ Failed to get variables: {result.stderr}")
                return {}
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Timeout getting variables")
            return {}
        except Exception as e:
            logger.error(f"❌ Error getting variables: {e}")
            return {}
    
    async def get_railway_status(self) -> Dict[str, Any]:
        """Get Railway service status"""
        if not self.railway_available:
            logger.error("Railway CLI not available")
            return {}
        
        try:
            cmd = ['railway', 'status']
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                status = {
                    "raw_output": result.stdout,
                    "service_status": "unknown"
                }
                
                # Parse status from output
                output = result.stdout.lower()
                if "running" in output:
                    status["service_status"] = "running"
                elif "stopped" in output:
                    status["service_status"] = "stopped"
                elif "error" in output or "failed" in output:
                    status["service_status"] = "error"
                
                logger.info(f"✅ Service status: {status['service_status']}")
                return status
            else:
                logger.error(f"❌ Failed to get status: {result.stderr}")
                return {}
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Timeout getting status")
            return {}
        except Exception as e:
            logger.error(f"❌ Error getting status: {e}")
            return {}
    
    async def redeploy_service(self) -> bool:
        """Redeploy the Railway service"""
        if not self.railway_available:
            logger.error("Railway CLI not available")
            return False
        
        try:
            logger.info("🚀 Starting Railway redeployment...")
            cmd = ['railway', 'up']
            
            if self.service_name:
                cmd.extend(['--service', self.service_name])
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                logger.info("✅ Redeployment completed successfully")
                return True
            else:
                logger.error(f"❌ Redeployment failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("❌ Redeployment timeout")
            return False
        except Exception as e:
            logger.error(f"❌ Error during redeployment: {e}")
            return False
    
    async def set_environment_variable(self, key: str, value: str) -> bool:
        """Set a Railway environment variable"""
        if not self.railway_available:
            logger.error("Railway CLI not available")
            return False
        
        try:
            cmd = ['railway', 'variables', 'set', f"{key}={value}"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            
            if result.returncode == 0:
                logger.info(f"✅ Set environment variable: {key}")
                return True
            else:
                logger.error(f"❌ Failed to set {key}: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"❌ Timeout setting {key}")
            return False
        except Exception as e:
            logger.error(f"❌ Error setting {key}: {e}")
            return False
    
    async def run_forensics_with_railway_data(self) -> Dict[str, Any]:
        """Run forensics with Railway-specific data"""
        logger.info("🧠 Running Railway-enhanced forensics...")
        
        # Get Railway data
        logs = await self.get_railway_logs()
        variables = await self.get_railway_variables()
        status = await self.get_railway_status()
        
        # Initialize forensics agent
        agent = DeploymentForensicsAgent()
        
        # Override environment variables with Railway data
        if variables and agent.system_snapshot:
            agent.system_snapshot.environment_vars.update(variables)
        
        # Add Railway-specific diagnostic signals
        await self._add_railway_diagnostics(agent, logs, status)
        
        # Run full forensics
        report = await agent.perform_full_forensics()
        
        # Add Railway-specific data to report
        report['railway_data'] = {
            'logs': logs[-50:],  # Last 50 lines
            'variables': variables,
            'status': status,
            'cli_available': self.railway_available
        }
        
        return report
    
    async def _add_railway_diagnostics(self, agent, logs: List[str], status: Dict[str, Any]):
        """Add Railway-specific diagnostic signals"""
        from deployment_forensics_agent import DiagnosticLayer, Severity
        
        # Check service status
        if status.get('service_status') == 'stopped':
            agent._add_diagnostic_signal(
                signal="Railway service is stopped",
                source="railway_status",
                chain=["railway_platform", "service_status", "stopped"],
                remedy="Restart service with: railway up",
                confidence=0.9,
                severity=Severity.CRITICAL,
                layer=DiagnosticLayer.RUNTIME
            )
        elif status.get('service_status') == 'error':
            agent._add_diagnostic_signal(
                signal="Railway service has errors",
                source="railway_status",
                chain=["railway_platform", "service_status", "error"],
                remedy="Check logs and fix underlying issues",
                confidence=0.8,
                severity=Severity.HIGH,
                layer=DiagnosticLayer.RUNTIME
            )
        
        # Analyze logs for common issues
        if logs:
            log_text = '\n'.join(logs).lower()
            
            # Check for common error patterns
            if 'module not found' in log_text:
                agent._add_diagnostic_signal(
                    signal="Module not found error in logs",
                    source="python_imports",
                    chain=["railway_runtime", "python_imports", "missing_module"],
                    remedy="Check requirements.txt and ensure all dependencies are installed",
                    confidence=0.8,
                    severity=Severity.HIGH,
                    layer=DiagnosticLayer.DEPENDENCY_CHAIN
                )
            
            if 'port already in use' in log_text:
                agent._add_diagnostic_signal(
                    signal="Port already in use error",
                    source="port_conflict",
                    chain=["railway_runtime", "port_binding", "conflict"],
                    remedy="Check PORT environment variable and ensure it's unique",
                    confidence=0.9,
                    severity=Severity.HIGH,
                    layer=DiagnosticLayer.INFRASTRUCTURE
                )
            
            if 'out of memory' in log_text or 'memory error' in log_text:
                agent._add_diagnostic_signal(
                    signal="Memory error detected in logs",
                    source="memory_issue",
                    chain=["railway_runtime", "memory", "insufficient"],
                    remedy="Optimize memory usage or upgrade Railway plan",
                    confidence=0.8,
                    severity=Severity.HIGH,
                    layer=DiagnosticLayer.INFRASTRUCTURE
                )
            
            if 'connection refused' in log_text:
                agent._add_diagnostic_signal(
                    signal="Connection refused error",
                    source="network_connectivity",
                    chain=["railway_runtime", "network", "connection_refused"],
                    remedy="Check external service availability and network configuration",
                    confidence=0.7,
                    severity=Severity.MEDIUM,
                    layer=DiagnosticLayer.EXTERNAL_INTEGRATIONS
                )
    
    async def auto_fix_issues(self, report: Dict[str, Any]) -> bool:
        """Automatically fix issues where possible"""
        logger.info("🔧 Attempting auto-fix for detected issues...")
        
        fixes_applied = 0
        total_fixes = len(report.get('immediate_fixes', []))
        
        for fix in report.get('immediate_fixes', []):
            if fix['priority'] in ['critical', 'high']:
                logger.info(f"🔧 Applying fix: {fix['issue']}")
                
                # Apply specific fixes based on the issue
                if 'environment' in fix['issue'].lower():
                    # Try to set missing environment variables
                    if 'OPENAI_API_KEY' in fix['issue']:
                        # This would need user input in real scenario
                        logger.warning("⚠️ OPENAI_API_KEY needs manual configuration")
                    elif 'PORT' in fix['issue']:
                        success = await self.set_environment_variable('PORT', '8888')
                        if success:
                            fixes_applied += 1
                
                elif 'port' in fix['issue'].lower():
                    # Port-related fixes
                    logger.info("🔧 Port issue detected - may require manual intervention")
                
                elif 'dependency' in fix['issue'].lower():
                    # Dependency fixes
                    logger.info("🔧 Dependency issue detected - may require manual intervention")
        
        logger.info(f"✅ Applied {fixes_applied}/{total_fixes} automatic fixes")
        return fixes_applied > 0

async def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(description='Railway Deployment Forensics CLI')
    parser.add_argument('--service', help='Railway service name')
    parser.add_argument('--project', help='Railway project ID')
    parser.add_argument('--logs', action='store_true', help='Show recent logs')
    parser.add_argument('--analyze', action='store_true', help='Run full forensics analysis')
    parser.add_argument('--auto-fix', action='store_true', help='Attempt to auto-fix issues')
    parser.add_argument('--redeploy', action='store_true', help='Redeploy service after analysis')
    parser.add_argument('--output', help='Output file for JSON report')
    
    args = parser.parse_args()
    
    # Initialize CLI
    cli = RailwayForensicsCLI()
    cli.service_name = args.service
    cli.project_id = args.project
    
    if args.logs:
        logs = await cli.get_railway_logs()
        print("\n".join(logs))
        return
    
    if args.analyze:
        # Run forensics analysis
        report = await cli.run_forensics_with_railway_data()
        
        # Print human-readable summary
        cli_instance = DeploymentForensicsAgent()
        cli_instance.print_human_readable_summary(report)
        
        # Save report if requested
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"\n📄 Report saved to: {args.output}")
        
        # Auto-fix if requested
        if args.auto_fix:
            await cli.auto_fix_issues(report)
        
        # Redeploy if requested
        if args.redeploy:
            success = await cli.redeploy_service()
            if success:
                print("✅ Service redeployed successfully")
            else:
                print("❌ Service redeployment failed")
    
    else:
        # Default: run basic forensics
        agent = DeploymentForensicsAgent()
        report = await agent.perform_full_forensics()
        agent.print_human_readable_summary(report)

if __name__ == "__main__":
    asyncio.run(main())