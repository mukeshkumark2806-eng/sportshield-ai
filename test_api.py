import requests
import json
import time

BASE_URL = 'http://localhost:5000/api'
TEST_FILE_PATH = 'C:/Users/mukes/Desktop/HD-wallpaper-annamalai-ips-politician-annamalai.jpg'

def test_upload():
    print("Testing /api/upload/official...")
    try:
        with open(TEST_FILE_PATH, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/upload/official", files=files)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            return response.json()
    except Exception as e:
        print(f"Failed: {e}")
        return None

def test_detect():
    print("\nTesting /api/detect...")
    try:
        with open(TEST_FILE_PATH, 'rb') as f1, open(TEST_FILE_PATH, 'rb') as f2:
            files = {
                'official_file': f1,
                'suspicious_file': f2
            }
            response = requests.post(f"{BASE_URL}/detect", files=files)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            return response.json()
    except Exception as e:
        print(f"Failed: {e}")
        return None

if __name__ == "__main__":
    test_upload()
    time.sleep(1)
    test_detect()
