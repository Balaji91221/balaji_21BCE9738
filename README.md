# Turn-Based Chess-like Game with Websocket Communication

## Overview
This repository features a turn-based chess-like game implemented with a server-client architecture using Websockets for real-time communication. The game is played on a 5x5 grid with three types of characters: Pawns, Hero1, and Hero2, each having distinct movement and attack patterns. The goal is to eliminate all of the opponent's characters.

### Events Handled
1. **Game Initialization**: Sets up the game board and starts a new game.
2. **Player Move**: Processes player moves and updates the game state.
3. **Game State Update**: Broadcasts the updated game state to all clients.
4. **Invalid Move Notification**: Alerts the player if their move is invalid.
5. **Game Over Notification**: Announces the winner and the end of the game.

## Implementation Details

### Server Implementation
- **Game Logic**: Handled using TypeScript in the `server` directory, including move processing and game state management.
- **Express Server**: Manages HTTP requests and serves the client application.
- **Socket.io**: Facilitates real-time communication between server and clients.

### Web Client Implementation
- **React**: Builds the user interface in the `client` directory.
- **TypeScript**: Ensures type safety and robustness in both client and server code.
- **Tailwind CSS**: Utilizes a utility-first CSS framework for styling.

### Handling Edge Cases
- **Simultaneous Moves**: Ensured by allowing only one player to move at a time.
- **Disconnections**: Clients can reconnect, and their previous state is restored.
- **Invalid Actions**: Moves are validated on both client and server sides to prevent illegal actions.

## Bonus Challenges
- [ ] **Hero3**: Introduce a new character type with complex movement patterns.
- [ ] **Dynamic Team Composition**: Allow players to select their team composition at the start.
- [x] **Spectator Mode**: Implemented for observing ongoing games.
- [ ] **Chat Feature**: Add for player communication.
- [ ] **AI Opponent**: Basic AI for single-player mode.
- [ ] **Replay System**: Enable players to review past games.

## Code Quality

### Single Responsibility Principle
Each function and module adheres to the Single Responsibility Principle:
- **Services**: Core game mechanics and state management are separated from request handling.
- **Utils**: Helper functions are used across modules to avoid duplication.

### Server-Side Error Handling
- **Error Propagation**: Functions return error values alongside results for explicit handling.
- **Detailed Logging**: Errors are logged with detailed context and stack traces.
- **Validation**: Input is validated at the controller level to prevent invalid data.

