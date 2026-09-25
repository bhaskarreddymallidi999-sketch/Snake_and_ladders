# Snakes & Ladders Game

A browser-based **Snakes & Ladders** game implemented with JavaScript. The game supports both **Player vs CPU** and **2 Player** modes, animated movement, ladders, snakes, dice rolling, sound effects, player customization, and a winner modal.

## Features

- 🎲 Animated dice rolling
- 🐍 Snakes and 🪜 ladders
- 🤖 Player vs Computer mode
- 👥 Two-player mode
- 🎨 Custom player names and colors
- 🔊 Sound toggle
- 🏆 Winner notification
- 🔄 Restart / play-again functionality
- ⚙️ Game setup/settings modal
- 📱 Responsive board rendering
- 🧩 Animated player movement
- 🎯 Extra turn when a player rolls a 6
- 💻 Source-code viewing and copy functionality

## Game Rules

- The game uses a 100-cell board.
- Players start at position 0.
- Each dice roll moves the active player forward.
- If a player lands on a ladder, they move up.
- If a player lands on a snake, they move down.
- A player must reach exactly cell 100 to win. If a roll would move beyond 100, the player stays in the current position.
- Rolling a 6 gives the player another turn.

## Snakes

| Start | End |
|---:|---:|
| 16 | 6 |
| 46 | 25 |
| 49 | 11 |
| 62 | 19 |
| 64 | 60 |
| 74 | 53 |
| 89 | 68 |
| 92 | 88 |
| 95 | 75 |
| 99 | 80 |

## Ladders

| Start | End |
|---:|---:|
| 2 | 38 |
| 7 | 14 |
| 8 | 31 |
| 15 | 26 |
| 21 | 42 |
| 28 | 84 |
| 36 | 44 |
| 51 | 67 |
| 71 | 91 |
| 78 | 98 |
| 87 | 94 |

## Game Modes

### Player vs CPU
The second player is controlled automatically by the computer.

### 2 Player Mode
Two human players can play against each other.

Player names and colors can be configured before starting the game.

## Main Game Logic

The JavaScript initializes the board, renders players and tokens, handles dice rolls, moves players step-by-step, applies snakes and ladders, manages turns, and displays the winner.

The game state includes:
- Current game mode
- Player information
- Player positions
- Current turn
- Dice/rolling state

The uploaded JavaScript contains the main game-state and interaction logic. fileciteturn0file0L1-L11

## Project Structure

A typical project setup can be:

```text
snakes-and-ladders/
├── index.html
├── script.js
├── style.css
└── README.md
```

The uploaded JavaScript can be used as the game's `script.js` logic file.

## Running the Game

1. Place the HTML, CSS, and JavaScript files in the same project folder.
2. Open `index.html` in a modern web browser.
3. Choose a game mode.
4. Enter player names and select colors.
5. Start the game.
6. Roll the dice and play.

No backend server is required for the JavaScript game logic.

## Controls

- **Roll Dice** — rolls the dice and moves the current player.
- **Dice** — clicking the dice also triggers a roll.
- **Restart** — resets all player positions.
- **Sound Toggle** — enables or disables game sounds.
- **Settings** — opens game setup.
- **Play Again** — starts another round after a winner is announced.

The event handlers for these controls are defined in the uploaded JavaScript. fileciteturn0file0L318-L367

## Customization

You can customize:

- Player names
- Player colors
- CPU or multiplayer mode
- Snakes and ladder positions
- Board styling
- Dice animations
- Sound effects

Player colors are configured through the game's color map, including emerald, rose, indigo, and amber themes. fileciteturn0file0L14-L18

## Technologies

- HTML
- CSS
- JavaScript
- SVG for board connections
- Font Awesome icons
- Browser DOM APIs

## Notes

The game expects the HTML page to contain the DOM elements referenced by the JavaScript, such as the board grid, dice controls, player list, setup modal, winner modal, and source-code modal.

The board is generated dynamically as a 10×10 grid, while SVG lines are used to visually connect snake and ladder positions. fileciteturn0file0L21-L64

## License

This project can be adapted and modified for personal or educational use. Add your preferred license here if you plan to publish or distribute the project.
