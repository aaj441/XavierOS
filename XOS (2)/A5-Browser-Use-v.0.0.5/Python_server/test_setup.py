#!/usr/bin/env python3
"""
Test script to verify A5-Browser-Use setup
Run this to check if everything is working correctly
"""

import os
import sys
import asyncio
from pathlib import Path

def test_imports():
    """Test if all required modules can be imported"""
    print("🔍 Testing imports...")
    try:
        from browser_use import Agent
        from browser_use.browser.browser import Browser, BrowserConfig
        from langchain_openai import ChatOpenAI
        from fastapi import FastAPI
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_environment():
    """Test environment configuration"""
    print("🔍 Testing environment...")
    
    # Load .env file
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found - you need to add your API keys")
        return False
    
    # Check if API key is set
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        print("⚠️  OPENAI_API_KEY not set in .env file")
        return False
    
    print("✅ Environment configured")
    return True

def test_browser_connection():
    """Test browser automation setup"""
    print("🔍 Testing browser connection...")
    try:
        from browser_use.browser.browser import Browser, BrowserConfig
        
        config = BrowserConfig(
            headless=True,
            disable_security=True
        )
        browser = Browser(config=config)
        print("✅ Browser connection successful")
        
        # Properly close browser
        asyncio.run(browser.close())
        print("✅ Browser closed successfully")
        return True
    except Exception as e:
        print(f"❌ Browser connection error: {e}")
        return False

def test_server():
    """Test FastAPI server setup"""
    print("🔍 Testing server setup...")
    try:
        from main import app
        print(f"✅ FastAPI app created: {app.title}")
        return True
    except Exception as e:
        print(f"❌ Server setup error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 A5-Browser-Use Setup Test")
    print("=" * 40)
    
    tests = [
        test_imports,
        test_environment,
        test_browser_connection,
        test_server
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 40)
    print(f"📊 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is ready.")
        print("\nTo start the server, run:")
        print("python3 -m uvicorn main:app --host 127.0.0.1 --port 8888 --workers 1")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()