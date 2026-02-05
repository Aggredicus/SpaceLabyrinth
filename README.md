# SpaceLabyrinth

A retro-styled, replayable **space-knight roguelike** set inside an enormous satellite orbiting Earth.

## Features

- Pixel-terminal inspired GUI with ASCII scene art and event console.
- Multiple RPG class protocols at run start:
  - Ion Vanguard
  - Cipher Duelist
  - Starseer Templar
- Mission aims that alter encounter weighting and roleplay outcomes.
- Procedural entrance selection and randomized event chains.
- Persistent metaprogression with **Legacy Cores** stored in localStorage.
- Branching, narrative-heavy encounter scripts with combat, tech checks, and resolve checks.

## Run locally

Because this is a browser game, serve the folder with any static server and open the local URL.

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Gameplay loop

1. Choose a class and mission aim.
2. Enter from a random satellite access point.
3. Survive encounters through tactical choices.
4. Earn Legacy Cores from each run.
5. Start again with higher permanent power tier.
