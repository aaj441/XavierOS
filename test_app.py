#!/usr/bin/env python3
"""Test script to check app functionality"""

import sys
import json

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    try:
        import fastapi
        print("✓ FastAPI imported successfully")
    except ImportError as e:
        print(f"✗ FastAPI import error: {e}")
        return False
    
    try:
        import uvicorn
        print("✓ Uvicorn imported successfully")
    except ImportError as e:
        print(f"✗ Uvicorn import error: {e}")
        return False
    
    try:
        import lucy
        print("✓ Lucy module imported successfully")
    except ImportError as e:
        print(f"✗ Lucy import error: {e}")
        return False
    
    try:
        import project_x
        print("✓ Project X module imported successfully")
    except ImportError as e:
        print(f"✗ Project X import error: {e}")
        return False
    
    try:
        from bs4 import BeautifulSoup
        print("✓ BeautifulSoup imported successfully")
    except ImportError as e:
        print(f"✗ BeautifulSoup import error: {e}")
        return False
    
    try:
        import ebooklib
        print("✓ ebooklib imported successfully")
    except ImportError as e:
        print(f"✗ ebooklib import error: {e}")
        return False
    
    return True

def test_lucy_functionality():
    """Test Lucy WCAG checker"""
    print("\nTesting Lucy functionality...")
    try:
        from lucy import check_wcag_compliance
        
        test_html = """
        <html>
        <body>
            <img src="test.jpg">
            <h1>Test Page</h1>
            <p>This is a test</p>
        </body>
        </html>
        """
        
        report = check_wcag_compliance(test_html)
        print(f"✓ Lucy check completed. Found {report.total_issues} issues, score: {report.score}")
        return True
    except Exception as e:
        print(f"✗ Lucy test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_project_x_functionality():
    """Test Project X eBook generator"""
    print("\nTesting Project X functionality...")
    try:
        from project_x import create_ebook, eBookMetadata, Chapter
        
        metadata = eBookMetadata(
            title="Test Book",
            author="Test Author",
            language="en"
        )
        
        chapters = [
            Chapter(
                title="Chapter 1",
                content="<p>This is chapter 1 content.</p>",
                order=1
            )
        ]
        
        result = create_ebook(metadata, chapters, format="epub")
        if result.success:
            print(f"✓ Project X test completed. Generated: {result.filename}")
        else:
            print(f"✗ Project X failed: {result.message}")
        return result.success
    except Exception as e:
        print(f"✗ Project X test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_fastapi_app():
    """Test FastAPI app initialization"""
    print("\nTesting FastAPI app initialization...")
    try:
        import app
        print("✓ App module imported successfully")
        
        # Check if FastAPI app exists
        if hasattr(app, 'app'):
            print("✓ FastAPI app instance found")
            return True
        else:
            print("✗ FastAPI app instance not found")
            return False
    except Exception as e:
        print(f"✗ App initialization error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("Running XavierOS diagnostics...\n")
    
    tests = [
        ("Import Test", test_imports),
        ("Lucy Functionality Test", test_lucy_functionality),
        ("Project X Functionality Test", test_project_x_functionality),
        ("FastAPI App Test", test_fastapi_app)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*50}")
        print(f"Running: {test_name}")
        print('='*50)
        result = test_func()
        results.append((test_name, result))
    
    print(f"\n{'='*50}")
    print("Summary:")
    print('='*50)
    for test_name, result in results:
        status = "✓ PASSED" if result else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(result for _, result in results)
    if all_passed:
        print("\n✓ All tests passed! The application should work.")
    else:
        print("\n✗ Some tests failed. Please check the errors above.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())