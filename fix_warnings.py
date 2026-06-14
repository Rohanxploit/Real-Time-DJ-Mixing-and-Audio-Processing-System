import os
import re

def fix_react_import(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
   
    new_content = re.sub(r"import React from 'react';\n?", "", content)
    
    new_content = re.sub(r"import React,\s*\{", "import {", new_content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed React import in {filepath}")

for file in ["DeckHeader.tsx", "HotCues.tsx", "PitchSlider.tsx", "TransportControls.tsx"]:
    fix_react_import(f"src/components/Deck/{file}")


with open("src/components/Deck/Deck.tsx", "r") as f:
    deck_content = f.read()


deck_content = re.sub(r"const \[trackName, setTrackName\]", "const [trackName]", deck_content)
deck_content = re.sub(r"const \[artistName, setArtistName\]", "const [artistName]", deck_content)

with open("src/components/Deck/Deck.tsx", "w") as f:
    f.write(deck_content)


with open("src/hooks/useFileLoader.ts", "r") as f:
    loader_content = f.read()


loader_content = re.sub(r",\s*HOT_CUE_COUNT", "", loader_content)
loader_content = re.sub(r"HOT_CUE_COUNT,\s*", "", loader_content)

with open("src/hooks/useFileLoader.ts", "w") as f:
    f.write(loader_content)

