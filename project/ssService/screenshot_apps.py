import Quartz
from CoreFoundation import CFURLCreateWithFileSystemPath, kCFURLPOSIXPathStyle
from CoreServices import kUTTypePNG
from Cocoa import NSRunningApplication, NSApplicationActivateAllWindows, NSApplicationActivateIgnoringOtherApps
import time
import os

def writeCGImageToFile(cgimage, path):
    url = CFURLCreateWithFileSystemPath(
        None, path, kCFURLPOSIXPathStyle, False
    )
    dest = Quartz.CGImageDestinationCreateWithURL(url, kUTTypePNG, 1, None)
    Quartz.CGImageDestinationAddImage(dest, cgimage, None)
    Quartz.CGImageDestinationFinalize(dest)

def capture_window(window_id, output_file):
    print(f"Attempting to capture window {window_id}")
    screenshot = Quartz.CGWindowListCreateImage(
        Quartz.CGRectNull,
        Quartz.kCGWindowListOptionIncludingWindow,
        window_id,
        Quartz.kCGWindowImageBoundsIgnoreFraming | Quartz.kCGWindowImageShouldBeOpaque
    )
    if screenshot:
        writeCGImageToFile(screenshot, output_file)
        print(f"✅ Successfully saved {output_file}")
        return True
    print(f"❌ Failed to capture window {window_id}")
    return False

def main():
    if not Quartz.CGPreflightScreenCaptureAccess():
        print("⚠️ Enable Screen Recording permissions in System Settings first!")
        print("Path to enable: System Settings → Privacy & Security → Screen Recording")
        return
    
    print("Starting screenshot capture...")
    script_dir = os.getcwd()
    print(f"Output directory: {script_dir}")
    
    for app in NSRunningApplication.runningApplicationsWithBundleIdentifier_(""):
        app_name = app.localizedName()
        if not app_name:
            continue
        
        # Skip system apps
        if app_name in ["Finder", "Dock", "Window Server"]:
            continue
            
        print(f"\nProcessing application: {app_name} (PID: {app.processIdentifier()})")
        
        # Activate the app
        activated = app.activateWithOptions_(NSApplicationActivateAllWindows | NSApplicationActivateIgnoringOtherApps)
        print(f"Activation {'succeeded' if activated else 'failed'} - waiting 2 seconds")
        time.sleep(2)  # Increased delay
        
        # Get window list
        window_list = Quartz.CGWindowListCopyWindowInfo(
            Quartz.kCGWindowListOptionAll,
            Quartz.kCGNullWindowID
        )
        
        captured = 0
        for window in window_list:
            # Convert to mutable dict
            window = dict(window)
            
            # Check window belongs to app
            if window.get('kCGWindowOwnerPID') != app.processIdentifier():
                continue
                
            # Filter criteria
            is_normal_window = window.get('kCGWindowLayer', 9999) == 0
            is_onscreen = window.get('kCGWindowIsOnscreen', False)
            
            if is_normal_window and is_onscreen:
                window_id = window['kCGWindowNumber']
                output_path = os.path.join(
                    script_dir,
                    f"{app_name.replace(' ', '_')}_{window_id}.png"
                )
                
                if capture_window(window_id, output_path):
                    captured += 1
        
        print(f"Captured {captured} windows for {app_name}")

if __name__ == "__main__":
    main()
    print("\nCapture process completed. Check working directory for screenshots.")