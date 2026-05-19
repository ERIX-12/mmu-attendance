import os
import sys
import subprocess
import json

# Define paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(BASE_DIR, "mobile_app", "assets", "images", "logo.png")
ANDROID_RES_DIR = os.path.join(BASE_DIR, "mobile_app", "android", "app", "src", "main", "res")
IOS_APPICON_DIR = os.path.join(BASE_DIR, "mobile_app", "ios", "Runner", "Assets.xcassets", "AppIcon.appiconset")

def install_and_import(package):
    try:
        import PIL
        from PIL import Image
    except ImportError:
        print(f"[*] Package '{package}' (Pillow) is required but not installed.")
        print(f"[*] Attempting to install '{package}' via pip...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"[+] Successfully installed '{package}'!")
        except Exception as e:
            print(f"[!] Failed to auto-install '{package}': {e}")
            print(f"[!] Please run: pip install {package} and try again.")
            sys.exit(1)

# Ensure Pillow is installed
install_and_import("Pillow")
from PIL import Image

def generate_android_icons(src_image):
    print("\n--- Generating Android Launcher Icons ---")
    
    # Android mipmap targets and their sizes
    android_targets = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    
    for folder, size in android_targets.items():
        target_dir = os.path.join(ANDROID_RES_DIR, folder)
        if not os.path.exists(target_dir):
            os.makedirs(target_dir)
            print(f"[+] Created directory: {folder}")
            
        target_path = os.path.join(target_dir, "ic_launcher.png")
        try:
            # Resize image to square size with LANCZOS high-quality resampling
            resized_img = src_image.resize((size, size), Image.Resampling.LANCZOS)
            resized_img.save(target_path, "PNG")
            print(f" [✔] Generated {folder}/ic_launcher.png ({size}x{size})")
        except Exception as e:
            print(f" [❌] Failed to generate {folder}/ic_launcher.png: {e}")

def generate_ios_icons(src_image):
    print("\n--- Generating iOS Launcher Icons ---")
    
    contents_json_path = os.path.join(IOS_APPICON_DIR, "Contents.json")
    if not os.path.exists(contents_json_path):
        print(f"[!] Contents.json not found at {contents_json_path}")
        print("[!] Creating directory and standard Contents.json...")
        os.makedirs(IOS_APPICON_DIR, exist_ok=True)
        # Create standard Contents.json
        contents_data = {
            "images": [
                {"size": "20x20", "idiom": "iphone", "filename": "Icon-App-20x20@2x.png", "scale": "2x"},
                {"size": "20x20", "idiom": "iphone", "filename": "Icon-App-20x20@3x.png", "scale": "3x"},
                {"size": "29x29", "idiom": "iphone", "filename": "Icon-App-29x29@1x.png", "scale": "1x"},
                {"size": "29x29", "idiom": "iphone", "filename": "Icon-App-29x29@2x.png", "scale": "2x"},
                {"size": "29x29", "idiom": "iphone", "filename": "Icon-App-29x29@3x.png", "scale": "3x"},
                {"size": "40x40", "idiom": "iphone", "filename": "Icon-App-40x40@2x.png", "scale": "2x"},
                {"size": "40x40", "idiom": "iphone", "filename": "Icon-App-40x40@3x.png", "scale": "3x"},
                {"size": "60x60", "idiom": "iphone", "filename": "Icon-App-60x60@2x.png", "scale": "2x"},
                {"size": "60x60", "idiom": "iphone", "filename": "Icon-App-60x60@3x.png", "scale": "3x"},
                {"size": "20x20", "idiom": "ipad", "filename": "Icon-App-20x20@1x.png", "scale": "1x"},
                {"size": "20x20", "idiom": "ipad", "filename": "Icon-App-20x20@2x.png", "scale": "2x"},
                {"size": "29x29", "idiom": "ipad", "filename": "Icon-App-29x29@1x.png", "scale": "1x"},
                {"size": "29x29", "idiom": "ipad", "filename": "Icon-App-29x29@2x.png", "scale": "2x"},
                {"size": "40x40", "idiom": "ipad", "filename": "Icon-App-40x40@1x.png", "scale": "1x"},
                {"size": "40x40", "idiom": "ipad", "filename": "Icon-App-40x40@2x.png", "scale": "2x"},
                {"size": "76x76", "idiom": "ipad", "filename": "Icon-App-76x76@1x.png", "scale": "1x"},
                {"size": "76x76", "idiom": "ipad", "filename": "Icon-App-76x76@2x.png", "scale": "2x"},
                {"size": "83.5x83.5", "idiom": "ipad", "filename": "Icon-App-83.5x83.5@2x.png", "scale": "2x"},
                {"size": "1024x1024", "idiom": "ios-marketing", "filename": "Icon-App-1024x1024@1x.png", "scale": "1x"}
            ],
            "info": {
                "version": 1,
                "author": "xcode"
            }
        }
        with open(contents_json_path, 'w') as f:
            json.dump(contents_data, f, indent=2)
    else:
        with open(contents_json_path, 'r') as f:
            contents_data = json.load(f)

    # Generate each image specified in Contents.json
    for image_info in contents_data.get("images", []):
        filename = image_info.get("filename")
        if not filename:
            continue
            
        size_str = image_info.get("size")
        scale_str = image_info.get("scale", "1x")
        
        # Parse size and scale
        try:
            width, height = map(float, size_str.lower().split("x"))
            scale = float(scale_str.replace("x", ""))
            
            pixel_width = int(round(width * scale))
            pixel_height = int(round(height * scale))
            
            target_path = os.path.join(IOS_APPICON_DIR, filename)
            
            # Resize image with LANCZOS high-quality resampling
            resized_img = src_image.resize((pixel_width, pixel_height), Image.Resampling.LANCZOS)
            
            # Remove transparency if needed for iOS Store icon (but usually standard PNG works)
            # Standard iOS app icons should not have transparent pixels. Let's make it support standard PNG with background or raw alpha.
            # We'll save it as direct PNG.
            resized_img.save(target_path, "PNG")
            print(f" [✔] Generated {filename} ({pixel_width}x{pixel_height})")
        except Exception as e:
            print(f" [❌] Failed to generate iOS icon {filename}: {e}")

def main():
    print("=" * 60)
    print("      MMU ATTENDANCE APP ICON GENERATOR")
    print("=" * 60)
    
    if not os.path.exists(LOGO_PATH):
        print(f"[!] Source splash image not found at: {LOGO_PATH}")
        sys.exit(1)
        
    print(f"[+] Found source splash image at: {LOGO_PATH}")
    
    try:
        with Image.open(LOGO_PATH) as img:
            # Convert to RGBA to ensure alpha channel support
            img = img.convert("RGBA")
            
            # Generate Android and iOS icons
            generate_android_icons(img)
            generate_ios_icons(img)
            
            print("\n" + "=" * 60)
            print("[★] SUCCESS: All mobile app launcher icons have been generated!")
            print("[★] The splash image now also acts as the app's home icon.")
            print("=" * 60)
    except Exception as e:
        print(f"[!] Error processing the image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
