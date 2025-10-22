#!/usr/bin/env python3
"""
🧪 FORENSICS SYSTEM TEST SUITE
==============================

Comprehensive test suite for the deployment forensics system.
Tests all diagnostic layers, causal trace analysis, and Railway integration.

Usage:
    python test_forensics_system.py
    python test_forensics_system.py --verbose
    python test_forensics_system.py --test-railway
"""

import asyncio
import json
import os
import tempfile
import unittest
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
import logging

from deployment_forensics_agent import (
    DeploymentForensicsAgent, 
    DiagnosticLayer, 
    Severity,
    SystemSnapshot
)
from railway_forensics_cli import RailwayForensicsCLI

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TestDeploymentForensicsAgent(unittest.TestCase):
    """Test cases for the main forensics agent"""
    
    def setUp(self):
        """Set up test environment"""
        self.agent = DeploymentForensicsAgent()
        self.temp_dir = tempfile.mkdtemp()
        self.agent.project_path = Path(self.temp_dir)
        
        # Create mock system snapshot
        self.agent.system_snapshot = SystemSnapshot(
            memory_usage={"total": 1000000000, "available": 500000000, "percent": 50.0},
            cpu_usage=25.0,
            disk_usage={"total": 10000000000, "used": 5000000000, "free": 5000000000, "percent": 50.0},
            network_connections=[],
            processes=[],
            environment_vars={"PATH": "/usr/bin", "HOME": "/home/user"},
            port_bindings=[]
        )
    
    def tearDown(self):
        """Clean up test environment"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_agent_initialization(self):
        """Test agent initialization"""
        self.assertIsNotNone(self.agent)
        self.assertEqual(len(self.agent.diagnostic_signals), 0)
        self.assertEqual(len(self.agent.hypotheses), 0)
    
    def test_add_diagnostic_signal(self):
        """Test adding diagnostic signals"""
        self.agent._add_diagnostic_signal(
            signal="Test signal",
            source="test_source",
            chain=["test", "chain"],
            remedy="Test remedy",
            confidence=0.8,
            severity=Severity.HIGH,
            layer=DiagnosticLayer.INFRASTRUCTURE
        )
        
        self.assertEqual(len(self.agent.diagnostic_signals), 1)
        signal = self.agent.diagnostic_signals[0]
        self.assertEqual(signal.signal, "Test signal")
        self.assertEqual(signal.confidence, 0.8)
        self.assertEqual(signal.severity, Severity.HIGH)
    
    async def test_infrastructure_diagnostics(self):
        """Test infrastructure diagnostics"""
        # Test with missing environment variables
        await self.agent._diagnose_infrastructure()
        
        # Should detect missing OPENAI_API_KEY
        critical_signals = [s for s in self.agent.diagnostic_signals if s.severity == Severity.CRITICAL]
        self.assertGreater(len(critical_signals), 0)
        
        # Check for OPENAI_API_KEY signal
        openai_signals = [s for s in critical_signals if "OPENAI_API_KEY" in s.signal]
        self.assertGreater(len(openai_signals), 0)
    
    async def test_build_process_diagnostics(self):
        """Test build process diagnostics"""
        # Test without requirements.txt
        await self.agent._diagnose_build_process()
        
        # Should detect missing requirements.txt
        build_signals = [s for s in self.agent.diagnostic_signals if s.layer == DiagnosticLayer.BUILD_PROCESS]
        self.assertGreater(len(build_signals), 0)
        
        # Create requirements.txt and test again
        requirements_file = self.agent.project_path / "Python_server" / "requirements.txt"
        requirements_file.parent.mkdir(parents=True, exist_ok=True)
        requirements_file.write_text("fastapi==0.115.6\nuvicorn==0.22.0\n")
        
        # Clear previous signals
        self.agent.diagnostic_signals = []
        await self.agent._diagnose_build_process()
        
        # Should not have critical build issues now
        critical_build_signals = [s for s in self.agent.diagnostic_signals 
                                if s.layer == DiagnosticLayer.BUILD_PROCESS and s.severity == Severity.CRITICAL]
        self.assertEqual(len(critical_build_signals), 0)
    
    async def test_dependency_chain_diagnostics(self):
        """Test dependency chain diagnostics"""
        # Create requirements.txt with problematic versions
        requirements_file = self.agent.project_path / "Python_server" / "requirements.txt"
        requirements_file.parent.mkdir(parents=True, exist_ok=True)
        requirements_file.write_text("pydantic==2.0.0\nfastapi==0.100.0\n")
        
        await self.agent._diagnose_dependency_chain()
        
        # Should detect problematic versions
        dep_signals = [s for s in self.agent.diagnostic_signals if s.layer == DiagnosticLayer.DEPENDENCY_CHAIN]
        self.assertGreater(len(dep_signals), 0)
    
    async def test_runtime_diagnostics(self):
        """Test runtime diagnostics"""
        # Mock no Python processes
        self.agent.system_snapshot.processes = []
        
        await self.agent._diagnose_runtime()
        
        # Should detect no Python processes
        runtime_signals = [s for s in self.agent.diagnostic_signals if s.layer == DiagnosticLayer.RUNTIME]
        self.assertGreater(len(runtime_signals), 0)
        
        # Check for Python process signal
        python_signals = [s for s in runtime_signals if "Python processes" in s.signal]
        self.assertGreater(len(python_signals), 0)
    
    async def test_external_integrations_diagnostics(self):
        """Test external integrations diagnostics"""
        await self.agent._diagnose_external_integrations()
        
        # Should detect missing OpenAI API key
        ext_signals = [s for s in self.agent.diagnostic_signals if s.layer == DiagnosticLayer.EXTERNAL_INTEGRATIONS]
        self.assertGreater(len(ext_signals), 0)
        
        # Check for OpenAI API key signal
        openai_signals = [s for s in ext_signals if "OpenAI API key" in s.signal]
        self.assertGreater(len(openai_signals), 0)
    
    async def test_health_recovery_diagnostics(self):
        """Test health and recovery diagnostics"""
        await self.agent._diagnose_health_recovery()
        
        # Should run without errors
        self.assertIsNotNone(self.agent.diagnostic_signals)
    
    async def test_causal_trace_analysis(self):
        """Test causal trace analysis"""
        # Add some test signals
        self.agent._add_diagnostic_signal(
            signal="Test critical signal",
            source="test_source",
            chain=["test", "chain"],
            remedy="Test remedy",
            confidence=0.9,
            severity=Severity.CRITICAL,
            layer=DiagnosticLayer.INFRASTRUCTURE
        )
        
        await self.agent._perform_causal_trace()
        
        # Should complete without errors
        self.assertTrue(True)
    
    async def test_hypothesis_generation(self):
        """Test hypothesis generation"""
        # Add some test signals
        self.agent._add_diagnostic_signal(
            signal="Test signal",
            source="test_source",
            chain=["test", "chain"],
            remedy="Test remedy",
            confidence=0.8,
            severity=Severity.HIGH,
            layer=DiagnosticLayer.INFRASTRUCTURE
        )
        
        await self.agent._generate_hypotheses()
        
        # Should generate hypotheses
        self.assertGreater(len(self.agent.hypotheses), 0)
        
        hypothesis = self.agent.hypotheses[0]
        self.assertEqual(hypothesis.symptom, "Test signal")
        self.assertEqual(hypothesis.likely_cause, "test_source")
        self.assertEqual(hypothesis.confidence, 0.8)
    
    async def test_devils_advocate_validation(self):
        """Test devil's advocate validation"""
        # Add a test hypothesis
        from deployment_forensics_agent import RootCauseHypothesis
        hypothesis = RootCauseHypothesis(
            symptom="Test symptom",
            likely_cause="environment",
            trigger_chain=["test", "chain"],
            fix="Test fix",
            confidence=0.9,
            test_command="echo test"
        )
        self.agent.hypotheses = [hypothesis]
        
        await self.agent._devils_advocate_validation()
        
        # Should complete without errors
        self.assertTrue(True)
    
    async def test_full_forensics_workflow(self):
        """Test complete forensics workflow"""
        # Create minimal project structure
        (self.agent.project_path / "Python_server").mkdir(parents=True, exist_ok=True)
        (self.agent.project_path / "Python_server" / "main.py").write_text("# Test main.py")
        (self.agent.project_path / "Python_server" / "requirements.txt").write_text("fastapi==0.115.6\n")
        
        # Run full forensics
        report = await self.agent.perform_full_forensics()
        
        # Should generate a complete report
        self.assertIsInstance(report, dict)
        self.assertIn('health_score', report)
        self.assertIn('summary', report)
        self.assertIn('root_cause_analysis', report)
        self.assertIn('immediate_fixes', report)
        self.assertIn('preventive_measures', report)
        
        # Health score should be calculated
        self.assertIsInstance(report['health_score'], (int, float))
        self.assertGreaterEqual(report['health_score'], 0)
        self.assertLessEqual(report['health_score'], 100)

class TestRailwayForensicsCLI(unittest.TestCase):
    """Test cases for Railway CLI integration"""
    
    def setUp(self):
        """Set up test environment"""
        self.cli = RailwayForensicsCLI()
    
    def test_cli_initialization(self):
        """Test CLI initialization"""
        self.assertIsNotNone(self.cli)
        self.assertIsInstance(self.cli.railway_available, bool)
    
    @patch('subprocess.run')
    async def test_get_railway_logs(self, mock_run):
        """Test getting Railway logs"""
        # Mock successful Railway CLI response
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "2024-01-01 12:00:00 [INFO] Test log line 1\n2024-01-01 12:00:01 [ERROR] Test log line 2"
        mock_run.return_value = mock_result
        
        self.cli.railway_available = True
        logs = await self.cli.get_railway_logs()
        
        self.assertEqual(len(logs), 2)
        self.assertIn("Test log line 1", logs[0])
        self.assertIn("Test log line 2", logs[1])
    
    @patch('subprocess.run')
    async def test_get_railway_variables(self, mock_run):
        """Test getting Railway variables"""
        # Mock successful Railway CLI response
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "OPENAI_API_KEY=sk-test123\nPORT=8888\nNODE_ENV=production"
        mock_run.return_value = mock_result
        
        self.cli.railway_available = True
        variables = await self.cli.get_railway_variables()
        
        self.assertEqual(len(variables), 3)
        self.assertEqual(variables['OPENAI_API_KEY'], 'sk-test123')
        self.assertEqual(variables['PORT'], '8888')
        self.assertEqual(variables['NODE_ENV'], 'production')
    
    @patch('subprocess.run')
    async def test_get_railway_status(self, mock_run):
        """Test getting Railway status"""
        # Mock successful Railway CLI response
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "Service is running"
        mock_run.return_value = mock_result
        
        self.cli.railway_available = True
        status = await self.cli.get_railway_status()
        
        self.assertIn('service_status', status)
        self.assertEqual(status['service_status'], 'running')
    
    @patch('subprocess.run')
    async def test_redeploy_service(self, mock_run):
        """Test service redeployment"""
        # Mock successful Railway CLI response
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "Deployment successful"
        mock_run.return_value = mock_result
        
        self.cli.railway_available = True
        success = await self.cli.redeploy_service()
        
        self.assertTrue(success)
    
    @patch('subprocess.run')
    async def test_set_environment_variable(self, mock_run):
        """Test setting environment variables"""
        # Mock successful Railway CLI response
        mock_result = Mock()
        mock_result.returncode = 0
        mock_result.stdout = "Variable set successfully"
        mock_run.return_value = mock_result
        
        self.cli.railway_available = True
        success = await self.cli.set_environment_variable('TEST_VAR', 'test_value')
        
        self.assertTrue(success)

class TestIntegrationScenarios(unittest.TestCase):
    """Integration test scenarios"""
    
    async def test_missing_openai_key_scenario(self):
        """Test scenario with missing OpenAI API key"""
        agent = DeploymentForensicsAgent()
        
        # Mock system snapshot without OpenAI key
        agent.system_snapshot = SystemSnapshot(
            memory_usage={"total": 1000000000, "available": 500000000, "percent": 50.0},
            cpu_usage=25.0,
            disk_usage={"total": 10000000000, "used": 5000000000, "free": 5000000000, "percent": 50.0},
            network_connections=[],
            processes=[],
            environment_vars={"PATH": "/usr/bin", "HOME": "/home/user"},
            port_bindings=[]
        )
        
        # Run forensics
        report = await agent.perform_full_forensics()
        
        # Should detect missing OpenAI key
        self.assertLess(report['health_score'], 100)
        self.assertGreater(len(report['immediate_fixes']), 0)
        
        # Check for OpenAI key fix
        openai_fixes = [fix for fix in report['immediate_fixes'] if 'OPENAI_API_KEY' in fix['issue']]
        self.assertGreater(len(openai_fixes), 0)
    
    async def test_port_binding_scenario(self):
        """Test scenario with port binding issues"""
        agent = DeploymentForensicsAgent()
        
        # Mock system snapshot with port issues
        agent.system_snapshot = SystemSnapshot(
            memory_usage={"total": 1000000000, "available": 500000000, "percent": 50.0},
            cpu_usage=25.0,
            disk_usage={"total": 10000000000, "used": 5000000000, "free": 5000000000, "percent": 50.0},
            network_connections=[],
            processes=[],
            environment_vars={"OPENAI_API_KEY": "sk-test123", "PORT": "8888"},
            port_bindings=[]  # No port bindings
        )
        
        # Run forensics
        report = await agent.perform_full_forensics()
        
        # Should detect port binding issues
        self.assertLess(report['health_score'], 100)
        
        # Check for port-related fixes
        port_fixes = [fix for fix in report['immediate_fixes'] if 'port' in fix['issue'].lower()]
        self.assertGreater(len(port_fixes), 0)
    
    async def test_healthy_deployment_scenario(self):
        """Test scenario with healthy deployment"""
        agent = DeploymentForensicsAgent()
        
        # Mock healthy system snapshot
        agent.system_snapshot = SystemSnapshot(
            memory_usage={"total": 1000000000, "available": 800000000, "percent": 20.0},
            cpu_usage=15.0,
            disk_usage={"total": 10000000000, "used": 3000000000, "free": 7000000000, "percent": 30.0},
            network_connections=[],
            processes=[{"pid": 1234, "name": "python", "cpu_percent": 5.0, "memory_percent": 10.0}],
            environment_vars={
                "OPENAI_API_KEY": "sk-test123",
                "PORT": "8888",
                "PATH": "/usr/bin"
            },
            port_bindings=[{"port": 8888, "address": "0.0.0.0", "pid": 1234}]
        )
        
        # Create project structure
        temp_dir = tempfile.mkdtemp()
        agent.project_path = Path(temp_dir)
        (agent.project_path / "Python_server").mkdir(parents=True, exist_ok=True)
        (agent.project_path / "Python_server" / "main.py").write_text("# Test main.py")
        (agent.project_path / "Python_server" / "requirements.txt").write_text("fastapi==0.115.6\nuvicorn==0.22.0\n")
        
        try:
            # Run forensics
            report = await agent.perform_full_forensics()
            
            # Should have high health score
            self.assertGreaterEqual(report['health_score'], 80)
            
        finally:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)

async def run_async_tests():
    """Run async test cases"""
    test_classes = [
        TestDeploymentForensicsAgent,
        TestRailwayForensicsCLI,
        TestIntegrationScenarios
    ]
    
    for test_class in test_classes:
        suite = unittest.TestLoader().loadTestsFromTestCase(test_class)
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        if not result.wasSuccessful():
            print(f"❌ Tests failed for {test_class.__name__}")
            return False
    
    print("✅ All tests passed!")
    return True

def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Run forensics system tests')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--test-railway', action='store_true', help='Test Railway integration')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    print("🧪 Starting Forensics System Test Suite...")
    
    # Run async tests
    success = asyncio.run(run_async_tests())
    
    if success:
        print("\n🎉 All tests completed successfully!")
        return 0
    else:
        print("\n💥 Some tests failed!")
        return 1

if __name__ == "__main__":
    exit(main())