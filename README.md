# makefun-spot-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mikaelkarlmax/makefun-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/mikaelkarlmax/makefun-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Twin Vista** — a spot the difference game. Two near-identical pictures stand side by side; the right-hand twin hides a handful of planted changes. Four hand-drawn scenes (Lake Dawn, Night Market, Coral Beach, Snowy Forest) hide 34 differences between them, from a vanished sun to a fox whose tail lost its white tip. Click a difference in either panel to ring it in both, race a draining clock, spend at most three hints a scene, and mind your misses: each one costs 3 seconds. Every scene is painted procedurally on canvas from the game's own code — no images, no libraries, no network — and every sound is synthesized live with WebAudio.

## Run it

Hand the game in (copies `game/` and `screenshots/` to the output folder and writes the dossier):

```sh
node main.ts
```

Play it locally by serving the game folder with the kit's tiny server, then opening the page:

```sh
node serve.ts
# open http://localhost:8080
```

Controls: mouse to click differences and buttons · `H` hint · `Space` pause / confirm · `R` restart scene · `M` mute. For screenshots and testing, `?scene=N&found=K` starts a scene with its first K differences already marked, and `?shot=start|play|end` stages one fixed frame of the game.

---

<sub>Entered on [make.fun](https://make.fun/?ref=q8z3gt64&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
