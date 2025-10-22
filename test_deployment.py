#!/usr/bin/env python3
"""
Comprehensive deployment test script for XavierOS
Tests all functionality to ensure production readiness
"""

import requests
import json
import time
import sys
import subprocess
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_server_startup():
    """Test if server starts correctly"""
    print("🚀 Testing server startup...")
    
    # Start server in background
    env = os.environ.copy()
    env['PORT'] = '8000'
    
    process = subprocess.Popen([
        'python3', '-m', 'uvicorn', 'app:app', 
        '--host', '0.0.0.0', '--port', '8000'
    ], env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for server to start
    time.sleep(3)
    
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Server started successfully")
            return process, True
        else:
            print(f"❌ Server health check failed: {response.status_code}")
            return process, False
    except Exception as e:
        print(f"❌ Server startup failed: {e}")
        return process, False

def test_endpoints(base_url="http://localhost:8000"):
    """Test all API endpoints"""
    print("🔍 Testing API endpoints...")
    
    tests = []
    
    # Test root endpoint
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            if 'name' in data and data['name'] == 'XavierOS':
                tests.append(("Root endpoint", True, ""))
            else:
                tests.append(("Root endpoint", False, "Invalid response format"))
        else:
            tests.append(("Root endpoint", False, f"Status: {response.status_code}"))
    except Exception as e:
        tests.append(("Root endpoint", False, str(e)))
    
    # Test Lucy info
    try:
        response = requests.get(f"{base_url}/lucy/info")
        if response.status_code == 200:
            data = response.json()
            if 'name' in data and data['name'] == 'Lucy':
                tests.append(("Lucy info", True, ""))
            else:
                tests.append(("Lucy info", False, "Invalid response format"))
        else:
            tests.append(("Lucy info", False, f"Status: {response.status_code}"))
    except Exception as e:
        tests.append(("Lucy info", False, str(e)))
    
    # Test Project X info
    try:
        response = requests.get(f"{base_url}/project-x/info")
        if response.status_code == 200:
            data = response.json()
            if 'name' in data and data['name'] == 'Project X':
                tests.append(("Project X info", True, ""))
            else:
                tests.append(("Project X info", False, "Invalid response format"))
        else:
            tests.append(("Project X info", False, f"Status: {response.status_code}"))
    except Exception as e:
        tests.append(("Project X info", False, str(e)))
    
    # Test Lucy WCAG check
    try:
        test_html = '<html lang="en"><head><title>Test</title></head><body><h1>Test</h1><p>Content</p></body></html>'
        response = requests.post(
            f"{base_url}/lucy/check",
            json={"html_content": test_html},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            if 'total_issues' in data and 'score' in data:
                tests.append(("Lucy WCAG check", True, f"Score: {data['score']}"))
            else:
                tests.append(("Lucy WCAG check", False, "Invalid response format"))
        else:
            tests.append(("Lucy WCAG check", False, f"Status: {response.status_code}"))
    except Exception as e:
        tests.append(("Lucy WCAG check", False, str(e)))
    
    # Test Project X eBook generation
    try:
        ebook_request = {
            "metadata": {
                "title": "Test Book",
                "author": "Test Author",
                "language": "en"
            },
            "chapters": [
                {
                    "title": "Chapter 1",
                    "content": "<p>Test content</p>",
                    "order": 1
                }
            ],
            "format": "epub"
        }
        response = requests.post(
            f"{base_url}/project-x/generate",
            json=ebook_request,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            if 'success' in data and data['success']:
                tests.append(("Project X eBook generation", True, f"File: {data['filename']}"))
            else:
                tests.append(("Project X eBook generation", False, data.get('message', 'Unknown error')))
        else:
            tests.append(("Project X eBook generation", False, f"Status: {response.status_code}"))
    except Exception as e:
        tests.append(("Project X eBook generation", False, str(e)))
    
    # Print results
    for test_name, success, message in tests:
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
    
    return all(test[1] for test in tests)

def test_error_handling(base_url="http://localhost:8000"):
    """Test error handling"""
    print("🛡️ Testing error handling...")
    
    tests = []
    
    # Test empty HTML content
    try:
        response = requests.post(
            f"{base_url}/lucy/check",
            json={"html_content": ""},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 400:
            tests.append(("Empty HTML error handling", True, ""))
        else:
            tests.append(("Empty HTML error handling", False, f"Expected 400, got {response.status_code}"))
    except Exception as e:
        tests.append(("Empty HTML error handling", False, str(e)))
    
    # Test empty chapters
    try:
        response = requests.post(
            f"{base_url}/project-x/generate",
            json={"metadata": {"title": "Test"}, "chapters": []},
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 400:
            tests.append(("Empty chapters error handling", True, ""))
        else:
            tests.append(("Empty chapters error handling", False, f"Expected 400, got {response.status_code}"))
    except Exception as e:
        tests.append(("Empty chapters error handling", False, str(e)))
    
    # Print results
    for test_name, success, message in tests:
        status = "✅" if success else "❌"
        print(f"{status} {test_name}: {message}")
    
    return all(test[1] for test in tests)

def test_concurrent_requests(base_url="http://localhost:8000"):
    """Test concurrent request handling"""
    print("⚡ Testing concurrent requests...")
    
    def make_request(i):
        try:
            response = requests.get(f"{base_url}/health", timeout=10)
            return i, response.status_code == 200
        except Exception as e:
            return i, False
    
    # Make 10 concurrent requests
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(make_request, i) for i in range(10)]
        results = [future.result() for future in as_completed(futures)]
    
    successful = sum(1 for _, success in results if success)
    print(f"✅ Concurrent requests: {successful}/10 successful")
    
    return successful >= 8  # Allow for some failures

def main():
    """Run all tests"""
    print("🧪 Starting comprehensive deployment tests for XavierOS\n")
    
    # Start server
    process, server_ok = test_server_startup()
    if not server_ok:
        print("❌ Server startup failed, aborting tests")
        if process:
            process.terminate()
        sys.exit(1)
    
    try:
        # Run tests
        endpoint_tests = test_endpoints()
        error_tests = test_error_handling()
        concurrent_tests = test_concurrent_requests()
        
        # Summary
        print("\n📊 Test Summary:")
        print(f"{'✅' if endpoint_tests else '❌'} Endpoint tests")
        print(f"{'✅' if error_tests else '❌'} Error handling tests")
        print(f"{'✅' if concurrent_tests else '❌'} Concurrent request tests")
        
        all_passed = endpoint_tests and error_tests and concurrent_tests
        
        if all_passed:
            print("\n🎉 All tests passed! Application is ready for deployment.")
            exit_code = 0
        else:
            print("\n❌ Some tests failed. Please review the issues above.")
            exit_code = 1
    
    finally:
        # Clean up
        print("\n🧹 Cleaning up...")
        process.terminate()
        time.sleep(1)
        if process.poll() is None:
            process.kill()
    
    sys.exit(exit_code)

if __name__ == "__main__":
    main()