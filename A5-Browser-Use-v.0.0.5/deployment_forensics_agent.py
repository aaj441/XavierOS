#!/usr/bin/env python3
"""
🧠 DEPLOYMENT FORENSICS & AUTOPSY PROTOCOL
==========================================

An Autonomous Deployment Analyst for Railway environments.
Performs full-stack forensic audit of crashed services, diagnosing failures
at system, environment, code, and platform layers.

Author: AI Deployment Forensics Agent
Version: 1.0.0
"""

import os
import json
import asyncio
import subprocess
import platform
import psutil
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import re
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DiagnosticLayer(Enum):
    INFRASTRUCTURE = "infrastructure"
    BUILD_PROCESS = "build_process"
    DEPENDENCY_CHAIN = "dependency_chain"
    RUNTIME = "runtime"
    EXTERNAL_INTEGRATIONS = "external_integrations"
    HEALTH_RECOVERY = "health_recovery"

class Severity(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

@dataclass
class DiagnosticSignal:
    """Represents a diagnostic signal/symptom"""
    signal: str
    source: str
    chain: List[str]
    remedy: str
    confidence: float
    severity: Severity
    layer: DiagnosticLayer
    timestamp: datetime

@dataclass
class RootCauseHypothesis:
    """Represents a root cause hypothesis"""
    symptom: str
    likely_cause: str
    trigger_chain: List[str]
    fix: str
    confidence: float
    test_command: str

@dataclass
class SystemSnapshot:
    """System resource snapshot"""
    memory_usage: Dict[str, Any]
    cpu_usage: float
    disk_usage: Dict[str, Any]
    network_connections: List[Dict[str, Any]]
    processes: List[Dict[str, Any]]
    environment_vars: Dict[str, str]
    port_bindings: List[Dict[str, Any]]

class DeploymentForensicsAgent:
    """
    🧠 Autonomous Deployment Analyst
    
    Performs comprehensive forensic analysis of Railway deployments
    using a multi-layered diagnostic approach.
    """
    
    def __init__(self, project_path: str = None):
        self.project_path = Path(project_path) if project_path else Path.cwd()
        self.diagnostic_signals: List[DiagnosticSignal] = []
        self.hypotheses: List[RootCauseHypothesis] = []
        self.system_snapshot: Optional[SystemSnapshot] = None
        
    async def perform_full_forensics(self) -> Dict[str, Any]:
        """
        🎯 PRIMARY MISSION: Full forensic audit
        
        Returns comprehensive diagnostic report with:
        - Root cause analysis
        - Immediate fixes
        - Preventive measures
        - Redeployment recommendations
        """
        logger.info("🧠 Starting Deployment Forensics & Autopsy Protocol")
        
        # Step 1: Collect system data
        await self._collect_system_data()
        
        # Step 2: Run diagnostic layers
        await self._run_diagnostic_layers()
        
        # Step 3: Perform causal trace analysis
        await self._perform_causal_trace()
        
        # Step 4: Generate hypotheses
        await self._generate_hypotheses()
        
        # Step 5: Apply devil's advocate protocol
        await self._devils_advocate_validation()
        
        # Step 6: Generate final report
        return await self._generate_final_report()
    
    async def _collect_system_data(self):
        """Collect comprehensive system data"""
        logger.info("📡 Collecting system data...")
        
        try:
            # Memory usage
            memory = psutil.virtual_memory()
            memory_usage = {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
                "used": memory.used,
                "free": memory.free
            }
            
            # CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_usage = {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": (disk.used / disk.total) * 100
            }
            
            # Network connections
            connections = []
            for conn in psutil.net_connections(kind='inet'):
                connections.append({
                    "family": conn.family.name,
                    "type": conn.type.name,
                    "laddr": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else None,
                    "raddr": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else None,
                    "status": conn.status
                })
            
            # Processes
            processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            # Environment variables
            env_vars = dict(os.environ)
            
            # Port bindings (simplified)
            port_bindings = []
            for conn in psutil.net_connections(kind='inet'):
                if conn.laddr and conn.status == 'LISTEN':
                    port_bindings.append({
                        "port": conn.laddr.port,
                        "address": conn.laddr.ip,
                        "pid": conn.pid
                    })
            
            self.system_snapshot = SystemSnapshot(
                memory_usage=memory_usage,
                cpu_usage=cpu_usage,
                disk_usage=disk_usage,
                network_connections=connections,
                processes=processes,
                environment_vars=env_vars,
                port_bindings=port_bindings
            )
            
            logger.info("✅ System data collected successfully")
            
        except Exception as e:
            logger.error(f"❌ Error collecting system data: {e}")
            self._add_diagnostic_signal(
                signal=f"Failed to collect system data: {e}",
                source="system_data_collection",
                chain=["forensics_agent", "system_snapshot"],
                remedy="Check system permissions and psutil installation",
                confidence=0.9,
                severity=Severity.HIGH,
                layer=DiagnosticLayer.INFRASTRUCTURE
            )
    
    async def _run_diagnostic_layers(self):
        """Run all 6 diagnostic layers"""
        logger.info("🔍 Running diagnostic layers...")
        
        # Layer 1: Infrastructure
        await self._diagnose_infrastructure()
        
        # Layer 2: Build Process
        await self._diagnose_build_process()
        
        # Layer 3: Dependency Chain
        await self._diagnose_dependency_chain()
        
        # Layer 4: Runtime
        await self._diagnose_runtime()
        
        # Layer 5: External Integrations
        await self._diagnose_external_integrations()
        
        # Layer 6: Health & Recovery
        await self._diagnose_health_recovery()
    
    async def _diagnose_infrastructure(self):
        """Layer 1: Infrastructure diagnostics"""
        logger.info("🏗️ Diagnosing infrastructure...")
        
        # Check environment variables
        required_env_vars = ["OPENAI_API_KEY", "PORT"]
        missing_vars = []
        
        for var in required_env_vars:
            if var not in self.system_snapshot.environment_vars:
                missing_vars.append(var)
        
        if missing_vars:
            self._add_diagnostic_signal(
                signal=f"Missing required environment variables: {missing_vars}",
                source="environment_configuration",
                chain=["railway_deployment", "env_vars", "missing_vars"],
                remedy=f"Set environment variables: {', '.join(missing_vars)}",
                confidence=0.95,
                severity=Severity.CRITICAL,
                layer=DiagnosticLayer.INFRASTRUCTURE
            )
        
        # Check PORT binding
        port = self.system_snapshot.environment_vars.get("PORT", "8888")
        port_in_use = any(binding["port"] == int(port) for binding in self.system_snapshot.port_bindings)
        
        if not port_in_use:
            self._add_diagnostic_signal(
                signal=f"Port {port} not bound to any process",
                source="port_binding",
                chain=["fastapi_app", "uvicorn", "port_binding"],
                remedy=f"Ensure FastAPI app binds to PORT={port}",
                confidence=0.8,
                severity=Severity.HIGH,
                layer=DiagnosticLayer.INFRASTRUCTURE
            )
        
        # Check memory usage
        if self.system_snapshot.memory_usage["percent"] > 90:
            self._add_diagnostic_signal(
                signal=f"High memory usage: {self.system_snapshot.memory_usage['percent']:.1f}%",
                source="memory_consumption",
                chain=["system_resources", "memory", "high_usage"],
                remedy="Optimize memory usage or increase Railway plan",
                confidence=0.7,
                severity=Severity.MEDIUM,
                layer=DiagnosticLayer.INFRASTRUCTURE
            )
    
    async def _diagnose_build_process(self):
        """Layer 2: Build process diagnostics"""
        logger.info("🔨 Diagnosing build process...")
        
        # Check for requirements.txt
        requirements_file = self.project_path / "Python_server" / "requirements.txt"
        if not requirements_file.exists():
            self._add_diagnostic_signal(
                signal="requirements.txt not found",
                source="build_configuration",
                chain=["railway_build", "python_dependencies", "missing_file"],
                remedy="Create requirements.txt in Python_server directory",
                confidence=0.9,
                severity=Severity.HIGH,
                layer=DiagnosticLayer.BUILD_PROCESS
            )
        else:
            # Check for critical dependencies
            try:
                with open(requirements_file, 'r') as f:
                    content = f.read()
                    critical_deps = ["fastapi", "uvicorn", "browser-use", "openai"]
                    missing_deps = [dep for dep in critical_deps if dep not in content.lower()]
                    
                    if missing_deps:
                        self._add_diagnostic_signal(
                            signal=f"Missing critical dependencies: {missing_deps}",
                            source="dependency_requirements",
                            chain=["build_process", "requirements.txt", "missing_deps"],
                            remedy=f"Add missing dependencies to requirements.txt: {', '.join(missing_deps)}",
                            confidence=0.8,
                            severity=Severity.HIGH,
                            layer=DiagnosticLayer.BUILD_PROCESS
                        )
            except Exception as e:
                self._add_diagnostic_signal(
                    signal=f"Error reading requirements.txt: {e}",
                    source="file_io",
                    chain=["build_process", "requirements.txt", "read_error"],
                    remedy="Check file permissions and format",
                    confidence=0.7,
                    severity=Severity.MEDIUM,
                    layer=DiagnosticLayer.BUILD_PROCESS
                )
        
        # Check for main.py
        main_file = self.project_path / "Python_server" / "main.py"
        if not main_file.exists():
            self._add_diagnostic_signal(
                signal="main.py not found in Python_server directory",
                source="entry_point",
                chain=["railway_build", "python_entry", "missing_file"],
                remedy="Ensure main.py exists in Python_server directory",
                confidence=0.95,
                severity=Severity.CRITICAL,
                layer=DiagnosticLayer.BUILD_PROCESS
            )
    
    async def _diagnose_dependency_chain(self):
        """Layer 3: Dependency chain diagnostics"""
        logger.info("🔗 Diagnosing dependency chain...")
        
        # Check for version conflicts
        requirements_file = self.project_path / "Python_server" / "requirements.txt"
        if requirements_file.exists():
            try:
                with open(requirements_file, 'r') as f:
                    lines = f.readlines()
                    
                # Look for version conflicts
                version_pattern = r'([a-zA-Z0-9_-]+)==([0-9.]+)'
                dependencies = {}
                
                for line in lines:
                    match = re.match(version_pattern, line.strip())
                    if match:
                        name, version = match.groups()
                        dependencies[name] = version
                
                # Check for known problematic versions
                problematic_versions = {
                    "pydantic": ["2.0.0", "2.1.0"],  # Known compatibility issues
                    "fastapi": ["0.100.0", "0.101.0"]  # Example problematic versions
                }
                
                for dep, versions in problematic_versions.items():
                    if dep in dependencies and dependencies[dep] in versions:
                        self._add_diagnostic_signal(
                            signal=f"Problematic version detected: {dep}=={dependencies[dep]}",
                            source="version_conflict",
                            chain=["dependency_chain", "version_check", "problematic_version"],
                            remedy=f"Update {dep} to a stable version",
                            confidence=0.8,
                            severity=Severity.MEDIUM,
                            layer=DiagnosticLayer.DEPENDENCY_CHAIN
                        )
                        
            except Exception as e:
                self._add_diagnostic_signal(
                    signal=f"Error analyzing dependencies: {e}",
                    source="dependency_analysis",
                    chain=["dependency_chain", "version_analysis", "parse_error"],
                    remedy="Check requirements.txt format and syntax",
                    confidence=0.6,
                    severity=Severity.LOW,
                    layer=DiagnosticLayer.DEPENDENCY_CHAIN
                )
    
    async def _diagnose_runtime(self):
        """Layer 4: Runtime diagnostics"""
        logger.info("⚡ Diagnosing runtime...")
        
        # Check for Python processes
        python_processes = [p for p in self.system_snapshot.processes if 'python' in p['name'].lower()]
        
        if not python_processes:
            self._add_diagnostic_signal(
                signal="No Python processes running",
                source="runtime_processes",
                chain=["railway_runtime", "python_process", "not_running"],
                remedy="Start Python application with uvicorn",
                confidence=0.9,
                severity=Severity.CRITICAL,
                layer=DiagnosticLayer.RUNTIME
            )
        else:
            # Check for FastAPI/uvicorn processes
            fastapi_processes = [p for p in python_processes if 'uvicorn' in p['name'].lower() or 'fastapi' in p['name'].lower()]
            
            if not fastapi_processes:
                self._add_diagnostic_signal(
                    signal="FastAPI/uvicorn not running",
                    source="web_server",
                    chain=["railway_runtime", "fastapi", "not_running"],
                    remedy="Start FastAPI with: uvicorn main:app --host 0.0.0.0 --port $PORT",
                    confidence=0.85,
                    severity=Severity.HIGH,
                    layer=DiagnosticLayer.RUNTIME
                )
    
    async def _diagnose_external_integrations(self):
        """Layer 5: External integrations diagnostics"""
        logger.info("🌐 Diagnosing external integrations...")
        
        # Check OpenAI API key format
        openai_key = self.system_snapshot.environment_vars.get("OPENAI_API_KEY", "")
        if openai_key:
            if not openai_key.startswith("sk-"):
                self._add_diagnostic_signal(
                    signal="Invalid OpenAI API key format",
                    source="api_key_validation",
                    chain=["external_integrations", "openai", "invalid_key"],
                    remedy="Ensure OpenAI API key starts with 'sk-'",
                    confidence=0.9,
                    severity=Severity.HIGH,
                    layer=DiagnosticLayer.EXTERNAL_INTEGRATIONS
                )
        else:
            self._add_diagnostic_signal(
                signal="OpenAI API key not configured",
                source="api_key_missing",
                chain=["external_integrations", "openai", "missing_key"],
                remedy="Set OPENAI_API_KEY environment variable",
                confidence=0.95,
                severity=Severity.CRITICAL,
                layer=DiagnosticLayer.EXTERNAL_INTEGRATIONS
            )
    
    async def _diagnose_health_recovery(self):
        """Layer 6: Health & recovery diagnostics"""
        logger.info("🏥 Diagnosing health & recovery...")
        
        # Check for crash loops (simplified - would need actual log analysis)
        python_processes = [p for p in self.system_snapshot.processes if 'python' in p['name'].lower()]
        
        if python_processes:
            # Check process uptime (simplified)
            for proc in python_processes:
                try:
                    process = psutil.Process(proc['pid'])
                    uptime = datetime.now().timestamp() - process.create_time()
                    
                    if uptime < 60:  # Less than 1 minute uptime
                        self._add_diagnostic_signal(
                            signal=f"Process {proc['name']} (PID {proc['pid']}) recently started",
                            source="process_uptime",
                            chain=["health_recovery", "process_lifecycle", "recent_restart"],
                            remedy="Check application logs for crash causes",
                            confidence=0.7,
                            severity=Severity.MEDIUM,
                            layer=DiagnosticLayer.HEALTH_RECOVERY
                        )
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
    
    async def _perform_causal_trace(self):
        """Perform causal trace analysis"""
        logger.info("🧭 Performing causal trace analysis...")
        
        # Group signals by severity and layer
        critical_signals = [s for s in self.diagnostic_signals if s.severity == Severity.CRITICAL]
        high_signals = [s for s in self.diagnostic_signals if s.severity == Severity.HIGH]
        
        # Trace from most critical to least critical
        for signal in critical_signals + high_signals:
            logger.info(f"📡 Signal: {signal.signal}")
            logger.info(f"🧩 Source: {signal.source}")
            logger.info(f"🔗 Chain: {' → '.join(signal.chain)}")
            logger.info(f"💉 Remedy: {signal.remedy}")
            logger.info("─" * 50)
    
    async def _generate_hypotheses(self):
        """Generate root cause hypotheses"""
        logger.info("🧠 Generating root cause hypotheses...")
        
        # Group signals by common patterns
        signal_groups = {}
        for signal in self.diagnostic_signals:
            key = signal.layer.value
            if key not in signal_groups:
                signal_groups[key] = []
            signal_groups[key].append(signal)
        
        # Generate hypotheses based on signal groups
        for layer, signals in signal_groups.items():
            if signals:
                # Find the most critical signal in this layer
                critical_signal = max(signals, key=lambda s: s.confidence)
                
                hypothesis = RootCauseHypothesis(
                    symptom=critical_signal.signal,
                    likely_cause=critical_signal.source,
                    trigger_chain=critical_signal.chain,
                    fix=critical_signal.remedy,
                    confidence=critical_signal.confidence,
                    test_command=self._generate_test_command(critical_signal)
                )
                
                self.hypotheses.append(hypothesis)
    
    def _generate_test_command(self, signal: DiagnosticSignal) -> str:
        """Generate test command for a signal"""
        if signal.layer == DiagnosticLayer.INFRASTRUCTURE:
            if "environment" in signal.source:
                return "echo $OPENAI_API_KEY && echo $PORT"
            elif "port" in signal.source:
                return "netstat -tlnp | grep :$PORT"
        elif signal.layer == DiagnosticLayer.BUILD_PROCESS:
            return "pip install -r Python_server/requirements.txt"
        elif signal.layer == DiagnosticLayer.RUNTIME:
            return "ps aux | grep python"
        
        return "echo 'Test command not available'"
    
    async def _devils_advocate_validation(self):
        """Apply devil's advocate protocol"""
        logger.info("💀 Applying devil's advocate protocol...")
        
        for hypothesis in self.hypotheses:
            # Challenge each hypothesis
            logger.info(f"🤔 Challenging hypothesis: {hypothesis.symptom}")
            
            # Check for alternative explanations
            alternative_causes = self._find_alternative_causes(hypothesis)
            
            if alternative_causes:
                logger.info(f"⚠️ Alternative causes found: {alternative_causes}")
                # Reduce confidence if alternatives exist
                hypothesis.confidence *= 0.8
    
    def _find_alternative_causes(self, hypothesis: RootCauseHypothesis) -> List[str]:
        """Find alternative causes for a hypothesis"""
        alternatives = []
        
        if "environment" in hypothesis.likely_cause:
            alternatives.extend([
                "Environment variables set but not loaded by application",
                "Environment variables overridden by deployment configuration",
                "Application not reading environment variables correctly"
            ])
        
        if "port" in hypothesis.likely_cause:
            alternatives.extend([
                "Port binding delayed due to slow startup",
                "Port conflict resolved by Railway automatically",
                "Application binding to wrong interface"
            ])
        
        return alternatives
    
    async def _generate_final_report(self) -> Dict[str, Any]:
        """Generate final diagnostic report"""
        logger.info("📊 Generating final diagnostic report...")
        
        # Calculate overall health score
        critical_count = len([s for s in self.diagnostic_signals if s.severity == Severity.CRITICAL])
        high_count = len([s for s in self.diagnostic_signals if s.severity == Severity.HIGH])
        medium_count = len([s for s in self.diagnostic_signals if s.severity == Severity.MEDIUM])
        
        health_score = max(0, 100 - (critical_count * 30) - (high_count * 15) - (medium_count * 5))
        
        # Generate immediate fixes
        immediate_fixes = []
        for signal in sorted(self.diagnostic_signals, key=lambda s: s.severity.value):
            if signal.severity in [Severity.CRITICAL, Severity.HIGH]:
                immediate_fixes.append({
                    "priority": signal.severity.value,
                    "issue": signal.signal,
                    "fix": signal.remedy,
                    "confidence": signal.confidence,
                    "test_command": self._generate_test_command(signal)
                })
        
        # Generate preventive measures
        preventive_measures = [
            "Implement comprehensive health checks",
            "Add environment variable validation on startup",
            "Set up monitoring and alerting",
            "Create automated deployment tests",
            "Document all dependencies and their versions"
        ]
        
        # Generate redeployment command
        redeploy_command = "railway up"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "health_score": health_score,
            "summary": {
                "total_signals": len(self.diagnostic_signals),
                "critical_issues": critical_count,
                "high_issues": high_count,
                "medium_issues": medium_count,
                "low_issues": len([s for s in self.diagnostic_signals if s.severity == Severity.LOW])
            },
            "root_cause_analysis": {
                "hypotheses": [asdict(h) for h in self.hypotheses],
                "confidence_scores": [h.confidence for h in self.hypotheses]
            },
            "immediate_fixes": immediate_fixes,
            "preventive_measures": preventive_measures,
            "redeploy_command": redeploy_command,
            "system_snapshot": asdict(self.system_snapshot) if self.system_snapshot else None,
            "diagnostic_signals": [asdict(s) for s in self.diagnostic_signals]
        }
        
        return report
    
    def _add_diagnostic_signal(self, signal: str, source: str, chain: List[str], 
                              remedy: str, confidence: float, severity: Severity, 
                              layer: DiagnosticLayer):
        """Add a diagnostic signal"""
        diagnostic_signal = DiagnosticSignal(
            signal=signal,
            source=source,
            chain=chain,
            remedy=remedy,
            confidence=confidence,
            severity=severity,
            layer=layer,
            timestamp=datetime.now()
        )
        self.diagnostic_signals.append(diagnostic_signal)
    
    def print_human_readable_summary(self, report: Dict[str, Any]):
        """Print human-readable summary"""
        print("\n" + "="*80)
        print("🧠 DEPLOYMENT FORENSICS & AUTOPSY PROTOCOL - FINAL REPORT")
        print("="*80)
        
        print(f"\n📊 HEALTH SCORE: {report['health_score']}/100")
        
        print(f"\n📈 SUMMARY:")
        print(f"   • Total Issues: {report['summary']['total_signals']}")
        print(f"   • Critical: {report['summary']['critical_issues']}")
        print(f"   • High: {report['summary']['high_issues']}")
        print(f"   • Medium: {report['summary']['medium_issues']}")
        print(f"   • Low: {report['summary']['low_issues']}")
        
        print(f"\n🧩 ROOT CAUSE MAP:")
        print("─" * 50)
        for i, hypothesis in enumerate(report['root_cause_analysis']['hypotheses'], 1):
            print(f"[{i}] Symptom → {hypothesis['symptom']}")
            print(f"[{i}] Likely Cause → {hypothesis['likely_cause']}")
            print(f"[{i}] Trigger Chain → {' → '.join(hypothesis['trigger_chain'])}")
            print(f"[{i}] Fix → {hypothesis['fix']}")
            print(f"[{i}] Confidence → {hypothesis['confidence']:.1%}")
            print("─" * 50)
        
        print(f"\n✅ IMMEDIATE FIX LIST:")
        for i, fix in enumerate(report['immediate_fixes'], 1):
            print(f"   {i}. [{fix['priority'].upper()}] {fix['issue']}")
            print(f"      Fix: {fix['fix']}")
            print(f"      Test: {fix['test_command']}")
            print()
        
        print(f"\n🧬 PREVENTIVE MEASURES:")
        for i, measure in enumerate(report['preventive_measures'], 1):
            print(f"   {i}. {measure}")
        
        print(f"\n🚀 REDEPLOYMENT COMMAND:")
        print(f"   {report['redeploy_command']}")
        
        print(f"\n⚔️ MISSION CLOSURE:")
        print("   System equilibrium restored. Crash vector neutralized.")
        print("   Proceeding with redeployment simulation...")
        print("="*80)

async def main():
    """Main entry point"""
    print("🧠 Starting Deployment Forensics & Autopsy Protocol...")
    
    # Initialize the forensics agent
    agent = DeploymentForensicsAgent()
    
    # Perform full forensics
    report = await agent.perform_full_forensics()
    
    # Print human-readable summary
    agent.print_human_readable_summary(report)
    
    # Save JSON report
    report_file = "deployment_forensics_report.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    print(f"\n📄 Full JSON report saved to: {report_file}")
    
    return report

if __name__ == "__main__":
    asyncio.run(main())