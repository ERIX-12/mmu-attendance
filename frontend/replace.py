import os
import re

directory = r'c:\Users\DELL\Desktop\MMU STUDENT ATTENDANCE\frontend\src'
replacements = {
    r'rgba\(255,\s*255,\s*255,\s*0\.06\)': 'rgba(0,0,0,0.08)',
    r'rgba\(255,\s*255,\s*255,\s*0\.08\)': 'rgba(0,0,0,0.08)',
    r'rgba\(255,\s*255,\s*255,\s*0\.1\)': 'rgba(0,0,0,0.08)',
    r'rgba\(255,\s*255,\s*255,\s*0\.2\)': 'rgba(0,0,0,0.12)',
    r'rgba\(19,\s*25,\s*41,\s*0\.9\)': 'rgba(255,255,255,0.95)',
    r'#0A0E1A': '#F4F7F9',
    r'#131929': '#FFFFFF',
    r"background: \s*'linear-gradient\(135deg, #0A0E1A 0%, #0D1B40 50%, #0A0E1A 100%\)'": "background: 'linear-gradient(135deg, #f4f7f9 0%, #e0e7ee 50%, #f4f7f9 100%)'",
    r"color:\s*'#fff'": "color: '#ffffff'",
    r"background: alpha\('#1565C0', 0\.1\)": "background: alpha('#0b52a1', 0.05)",
    r"linear-gradient\(135deg, #1565C0 0%, #003C8F 100%\)": "linear-gradient(135deg, #0b52a1 0%, #2e9bf4 100%)",
    r"colors: \['#fff',": "colors: ['#1e293b',",
    r"rgba\(255,255,255,0\.8\)": "rgba(0,0,0,0.8)",
    r"rgba\(255,255,255,0\.6\)": "rgba(0,0,0,0.6)"
}

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(('.js', '.jsx', '.css')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            original = content
            for old, new in replacements.items():
                content = re.sub(old, new, content)
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {path}')
