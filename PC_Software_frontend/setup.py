import os
import shutil
import json
from pathlib import Path

def main():
    base_dir = Path(r"d:\Learning python libraries and frameworks\Django Projects\Crack-IT")
    src_dir = base_dir / "Webapp_frontend"
    dest_dir = base_dir / "PC_Software_frontend"

    # Copy all contents from frontend to PC_Software_frontend, excluding node_modules and dist
    for item in os.listdir(src_dir):
        if item in ['node_modules', 'dist', '.git', 'build_output.txt', 'electron', 'vite_check.txt']:
            continue
            
        s = src_dir / item
        d = dest_dir / item
        if s.is_dir():
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy2(s, d)

    print("Copied React frontend files to PC_Software_frontend.")

    # Now update the package.json in dest_dir to include Electron dependencies
    pkg_json_path = dest_dir / "package.json"
    if pkg_json_path.exists():
        with open(pkg_json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Update name and description
        data['name'] = 'pc-software-frontend'
        data['description'] = 'PC Software Frontend built with Electron and React'
        data['main'] = 'electron/main.cjs'
        
        # Add scripts
        if 'scripts' not in data:
            data['scripts'] = {}
        data['scripts']['electron:start'] = 'concurrently "vite" "wait-on tcp:5173 && electron . --dev"'
        data['scripts']['electron:build'] = 'vite build && electron-builder'
        
        # Add devDependencies
        if 'devDependencies' not in data:
            data['devDependencies'] = {}
            
        data['devDependencies']['electron'] = '^29.1.0'
        data['devDependencies']['electron-builder'] = '^24.13.3'
        data['devDependencies']['concurrently'] = '^8.2.2'
        data['devDependencies']['wait-on'] = '^7.2.0'
        
        # Add electron-builder configuration
        data['build'] = {
            "appId": "com.crackit.frontend",
            "productName": "Crack-IT",
            "directories": {
                "output": "release"
            },
            "win": {
                "target": ["nsis"]
            },
            "files": [
                "dist/**/*",
                "electron/**/*"
            ]
        }
        
        with open(pkg_json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        print("Updated package.json with Electron configurations.")

    # Update vite.config.js to include base: './'
    vite_cfg = dest_dir / "vite.config.js"
    if vite_cfg.exists():
        content = vite_cfg.read_text('utf-8')
        if 'base:' not in content:
            content = content.replace('defineConfig({', "defineConfig({\n  base: './',")
            vite_cfg.write_text(content, 'utf-8')
            print("Updated vite.config.js to set base path.")

    # Automatically swap BrowserRouter to HashRouter for Electron compatibility
    app_jsx = dest_dir / "src" / "App.jsx"
    if app_jsx.exists():
        content = app_jsx.read_text('utf-8')
        content = content.replace('BrowserRouter', 'HashRouter')
        app_jsx.write_text(content, 'utf-8')
        print("Updated App.jsx to use HashRouter for Electron.")

if __name__ == "__main__":
    main()
