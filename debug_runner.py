import subprocess
import time
import socket
import sys
import os

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def launch_chrome():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    profile_dir = r"C:\Users\gbeng\.gemini\antigravity\scratch\chrome-profile-smoke"
    
    lock_file = os.path.join(profile_dir, "SingletonLock")
    if os.path.exists(lock_file):
        try: os.remove(lock_file)
        except Exception: pass

    args = [
        chrome_path,
        "--remote-debugging-port=9222",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--headless=new",
        "--disable-gpu",
        "about:blank"
    ]
    
    print("Launching Chrome...")
    return subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    chrome_proc = launch_chrome()
    
    print("Waiting for port 9222...")
    for _ in range(10):
        time.sleep(1)
        if is_port_open(9222):
            print("Port 9222 open!")
            break
    else:
        print("Chrome failed to launch.")
        chrome_proc.terminate()
        sys.exit(1)
        
    print("Running node debug_shopify_checkout.js...")
    try:
        proc = subprocess.run(["node", "debug_shopify_checkout.js"], capture_output=True, encoding="utf-8", timeout=45)
        print("\n--- STDOUT ---")
        print(proc.stdout)
        if proc.stderr:
            print("\n--- STDERR ---")
            print(proc.stderr)
    except Exception as e:
        print(f"Execution error: {e}")
        
    print("Terminating Chrome...")
    chrome_proc.terminate()
    chrome_proc.wait()
    print("Done!")

if __name__ == "__main__":
    main()
