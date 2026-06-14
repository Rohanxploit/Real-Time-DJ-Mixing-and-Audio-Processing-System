import os
import re

replacements = [

    (r"from './components/Deck'", r"from './components/Deck/Deck'"),
    (r"from './components/Mixer'", r"from './components/Mixer/Mixer'"),
    (r"from './components/TrackLibrary'", r"from './components/Library/TrackLibrary'"),
    
   
    (r"from '../lib/utils'", r"from '../../lib/utils'"),
    (r"from '../lib/audioEngine'", r"from '../../lib/audioEngine'"),
    
    
    (r"from './useWaveSurfer'", r"from '../../hooks/useWaveSurfer'"),
    (r"from './usePlaybackEngine'", r"from '../../hooks/usePlaybackEngine'"),
    (r"from './useFileLoader'", r"from '../../hooks/useFileLoader'"),
    

    (r"from '../lib/audioEngine'", r"from '../lib/audioEngine'"), 
    
   
    (r"from './deckTypes'", r"from '../../types/deck'"),
    (r"from '../deckTypes'", r"from '../../types/deck'"),
    (r"from '../types/deck'", r"from '../../types/deck'"),
]


hook_replacements = [
    (r"from './deckTypes'", r"from '../types/deck'"),
]


library_replacements = [
    (r"from './Deck'", r"from '../../types/deck'"), 
]

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    if filepath.endswith('App.tsx'):
        new_content = new_content.replace("from './components/Deck'", "from './components/Deck/Deck'")
        new_content = new_content.replace("from './components/Mixer'", "from './components/Mixer/Mixer'")
        new_content = new_content.replace("from './components/TrackLibrary'", "from './components/Library/TrackLibrary'")
    elif 'hooks/' in filepath:
        new_content = new_content.replace("from './deckTypes'", "from '../types/deck'")
    elif 'Library/' in filepath:
        new_content = new_content.replace("from '../lib/utils'", "from '../../lib/utils'")
        new_content = new_content.replace("from './Deck'", "from '../../types/deck'") 
    elif 'Deck/' in filepath:
        new_content = new_content.replace("from '../lib/utils'", "from '../../lib/utils'")
        new_content = new_content.replace("from '../lib/audioEngine'", "from '../../lib/audioEngine'")
        new_content = new_content.replace("from './useWaveSurfer'", "from '../../hooks/useWaveSurfer'")
        new_content = new_content.replace("from './usePlaybackEngine'", "from '../../hooks/usePlaybackEngine'")
        new_content = new_content.replace("from './useFileLoader'", "from '../../hooks/useFileLoader'")
        new_content = new_content.replace("from './deckTypes'", "from '../../types/deck'")
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
