#!/usr/bin/env python3
"""
Script to run XavierOS app with proper configuration
"""

import os
import sys
import subprocess
import time

def check_port_availability(port):
    """Check if a port is available"""
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    return result != 0  # True if port is available

def find_available_port(start_port=8000, max_attempts=10):
    """Find an available port starting from start_port"""
    for i in range(max_attempts):
        port = start_port + i
        if check_port_availability(port):
            return port
    return None

def run_app():
    # Check current PORT env var
    current_port = os.getenv("PORT")
    if current_port:
        print(f"Current PORT environment variable: {current_port}")
        if not check_port_availability(int(current_port)):
            print(f"⚠️  Port {current_port} is already in use!")
            available_port = find_available_port()
            if available_port:
                print(f"✓ Found available port: {available_port}")
                os.environ["PORT"] = str(available_port)
            else:
                print("✗ Could not find an available port!")
                return 1
    else:
        # No PORT env var, use default
        os.environ["PORT"] = "8000"
    
    final_port = os.getenv("PORT")
    print(f"\n🚀 Starting XavierOS on port {final_port}...")
    print(f"📍 Local URL: http://localhost:{final_port}")
    print(f"📚 API Docs: http://localhost:{final_port}/docs")
    print(f"❤️  Health: http://localhost:{final_port}/health")
    print("\nPress Ctrl+C to stop the server.\n")
    
    # Run the app
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app:app",
            "--host", "0.0.0.0",
            "--port", final_port,
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped gracefully.")
    except Exception as e:
        print(f"\n✗ Error running server: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(run_app())