import os
import re

with open(r'C:\Users\pc\.gemini\antigravity\brain\c01c90fa-78d3-4b57-a1e0-dfea03cc3d98\system_config.md', 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'\*\*File:\*\*\s*`([^`]+)`.*?(```\w*\n.*?```)', re.DOTALL)
matches = pattern.findall(text)

docker_pattern = re.compile(r'####\s*`([^`]+)`.*?(```\w*\n.*?```)', re.DOTALL)
matches.extend(docker_pattern.findall(text))

target = r'e:\promgramming\Chulx'
for filename, code_block in matches:
    lines = code_block.split('\n')
    if lines[0].startswith('```'):
        lines = lines[1:]
    if lines[-1].startswith('```'):
        lines = lines[:-1]
    while lines and not lines[-1].strip():
        lines = lines[:-1]
    
    code = '\n'.join(lines) + '\n'
    filepath = os.path.join(target, filename.strip())
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
        f.write(code)
    print(f'Written: {filename}')
