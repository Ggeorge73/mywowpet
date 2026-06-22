import subprocess
import time
import socket
import sys
import os
import io

# Force stdout/stderr to use UTF-8 encoding to prevent charmap errors on Windows logs
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def launch_chrome(headless=True):
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    profile_dir = r"C:\Users\gbeng\.gemini\antigravity\scratch\chrome-profile-smoke"
    
    # Clean lock file in profile if exists
    lock_file = os.path.join(profile_dir, "SingletonLock")
    if os.path.exists(lock_file):
        try:
            os.remove(lock_file)
            print("Removed existing SingletonLock file.")
        except Exception as e:
            print(f"Warning: could not remove lock file: {e}")

    args = [
        chrome_path,
        "--remote-debugging-port=9222",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--new-window",
        "--disable-popup-blocking"  # Allow checkout popup window to open
    ]
    if headless:
        args.append("--headless=new")
        args.append("--disable-gpu")
    
    args.append("about:blank")
    
    print(f"Launching Chrome (headless={headless})...")
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return proc

def wait_for_chrome():
    print("Waiting for port 9222 to open...")
    for _ in range(10):
        time.sleep(1)
        if is_port_open(9222):
            print("Port 9222 is open!")
            return True
    return False

def terminate_chrome(proc):
    if proc:
        print("Terminating Chrome...")
        try:
            proc.terminate()
            proc.wait(timeout=5)
            print("Chrome terminated successfully.")
        except Exception as e:
            print(f"Error terminating Chrome: {e}")

def main():
    # --- TEST 1: Site Audit ---
    print("=== STARTING TEST 1: Site Audit ===")
    chrome_proc = launch_chrome(headless=True)
    if not wait_for_chrome():
        print("Error: Failed to launch Chrome for Test 1.")
        terminate_chrome(chrome_proc)
        sys.exit(1)
        
    print("\nRunning test_site.js audit script...")
    try:
        test_proc = subprocess.run(["node", "test_site.js"], capture_output=True, encoding="utf-8", timeout=60)
        print("\n--- Test Site Output ---")
        print(test_proc.stdout)
        if test_proc.stderr:
            print("\n--- Test Site Errors ---")
            print(test_proc.stderr)
    except subprocess.TimeoutExpired:
        print("Error: test_site.js execution timed out.")
    except Exception as e:
        print(f"Error executing test_site.js: {e}")
        
    terminate_chrome(chrome_proc)
    time.sleep(2)  # Wait for port to clear

    # --- TEST 2: Shopify Checkout Integration ---
    print("\n=== STARTING TEST 2: Shopify Checkout Flow ===")
    chrome_proc = launch_chrome(headless=True)
    if not wait_for_chrome():
        print("Error: Failed to launch Chrome for Test 2.")
        terminate_chrome(chrome_proc)
        sys.exit(1)
        
    print("\nRunning test_shopify_checkout_flow.js integration test...")
    try:
        checkout_proc = subprocess.run(["node", "../test_shopify_checkout_flow.js"], capture_output=True, encoding="utf-8", timeout=90)
        print("\n--- Checkout Flow Output ---")
        print(checkout_proc.stdout)
        if checkout_proc.stderr:
            print("\n--- Checkout Flow Errors ---")
            print(checkout_proc.stderr)
    except subprocess.TimeoutExpired:
        print("Error: test_shopify_checkout_flow.js execution timed out.")
    except Exception as e:
        print(f"Error executing test_shopify_checkout_flow.js: {e}")
        
    terminate_chrome(chrome_proc)

if __name__ == "__main__":
    main()
