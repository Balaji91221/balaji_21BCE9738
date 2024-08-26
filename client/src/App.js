import React, { useState, useCallback, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Initial Board Setup
const initialBoard = [
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', ''],
  ['', '', '', '', '']
];

const initialSetupA = ['A-P1', 'A-H1', 'A-H2', 'A-P2', 'A-P3'];
const initialSetupB = ['B-P1', 'B-H1', 'B-H2', 'B-P2', 'B-P3'];

const socket = io('https://balaji-21-bce-9738-avmk.vercel.app'); // Update with your backend URL

function App() {
  // Initialize board function
  const initializeBoard = (setupA, setupB) => {
    const newBoard = [...initialBoard];
    newBoard[0] = [...setupA];
    newBoard[4] = [...setupB];
    return newBoard;
  };

  // State hooks
  const [board, setBoard] = useState(initializeBoard(initialSetupA, initialSetupB));
  const [currentPlayer, setCurrentPlayer] = useState('A');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [availableMoves, setAvailableMoves] = useState([]);
  const [winner, setWinner] = useState(null);

  // Effect hook to handle socket events
  useEffect(() => {
    socket.on('updateBoard', (updatedBoard) => {
      setBoard(updatedBoard);
    });

    socket.on('message', (newMessage) => {
      setMessage(newMessage);
    });

    return () => {
      socket.off('updateBoard');
      socket.off('message');
    };
  }, []);

  // Handle move logic
  const handleMove = (character, move) => {
    if (!character || !character.startsWith(currentPlayer)) {
      setMessage(`It's ${currentPlayer}'s turn!`);
      return;
    }

    const [charRow, charCol] = findCharacter(character, board);

    if (charRow === null || charCol === null) {
      setMessage('Character not found!');
      return;
    }

    const [newRow, newCol] = calculateNewPosition(charRow, charCol, move, character);
    if (isValidMove(charRow, charCol, newRow, newCol, character)) {
      const newBoard = board.map(row => [...row]);
      let killedCharacter = null;

      const path = getPath(charRow, charCol, newRow, newCol, character);
      path.forEach(([row, col]) => {
        if (board[row][col].startsWith(opponentPlayer(currentPlayer))) {
          killedCharacter = board[row][col];
          newBoard[row][col] = '';
        }
      });

      if (board[newRow][newCol].startsWith(opponentPlayer(currentPlayer))) {
        killedCharacter = board[newRow][newCol];
      }

      newBoard[charRow][charCol] = '';
      newBoard[newRow][newCol] = character;

      const moveData = {
        character,
        move,
        from: [charRow, charCol],
        to: [newRow, newCol],
        killed: killedCharacter
      };

      setHistory(prevHistory => [...prevHistory, moveData]);
      setBoard(newBoard);
      setMessage('');
      setSelectedCharacter(null);
      setAvailableMoves([]);
      setCurrentPlayer(opponentPlayer(currentPlayer));

      socket.emit('move', {
        board: newBoard,
        message: `Player ${currentPlayer} made a move.`,
        moveData
      });

      if (checkWinningCondition(newBoard)) {
        setWinner(currentPlayer);
        setMessage(`${currentPlayer} wins!`);
        return;
      }
    } else {
      setMessage('Invalid Move!');
    }
  };

  // Find character location
  const findCharacter = (character, board) => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] === character) {
          return [i, j];
        }
      }
    }
    return [null, null];
  };

  // Calculate new position based on move
  const calculateNewPosition = (row, col, move, character) => {
    const type = character.split('-')[1];
    switch (type) {
      case 'P1':
      case 'P2':
      case 'P3':
        return movePawn(row, col, move);
      case 'H1':
        return moveHero1(row, col, move);
      case 'H2':
        return moveHero2(row, col, move);
      default:
        return [row, col];
    }
  };

  // Move functions for different character types
  const movePawn = (row, col, move) => {
    switch (move) {
      case 'L': return [row, col - 1];
      case 'R': return [row, col + 1];
      case 'F': return currentPlayer === 'A' ? [row + 1, col] : [row - 1, col];
      case 'B': return currentPlayer === 'A' ? [row - 1, col] : [row + 1, col];
      default: return [row, col];
    }
  };

  const moveHero1 = (row, col, move) => {
    switch (move) {
      case 'L': return [row, col - 2];
      case 'R': return [row, col + 2];
      case 'F': return currentPlayer === 'A' ? [row + 2, col] : [row - 2, col];
      case 'B': return currentPlayer === 'A' ? [row - 2, col] : [row + 2, col];
      default: return [row, col];
    }
  };

  const moveHero2 = (row, col, move) => {
    switch (move) {
      case 'FL': return currentPlayer === 'A' ? [row + 2, col - 2] : [row - 2, col + 2];
      case 'FR': return currentPlayer === 'A' ? [row + 2, col + 2] : [row - 2, col - 2];
      case 'BL': return currentPlayer === 'A' ? [row - 2, col - 2] : [row + 2, col + 2];
      case 'BR': return currentPlayer === 'A' ? [row - 2, col + 2] : [row + 2, col - 2];
      default: return [row, col];
    }
  };

  // Validate the move
  const isValidMove = (oldRow, oldCol, newRow, newCol, character) => {
    const withinBounds = newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5;
    if (!withinBounds) return false;

    const isEmptyOrOpponent = board[newRow] && (board[newRow][newCol] === '' || board[newRow][newCol].startsWith(opponentPlayer(currentPlayer)));
    return isEmptyOrOpponent;
  };

  // Get opponent player
  const opponentPlayer = (currentPlayer) => (currentPlayer === 'A' ? 'B' : 'A');

  // Check for winning condition
  const checkWinningCondition = (board) => {
    const opponent = opponentPlayer(currentPlayer);
    return !board.flat().some(cell => cell.startsWith(opponent));
  };

  // Get path for hero movement
  const getPath = (oldRow, oldCol, newRow, newCol, character) => {
    const type = character.split('-')[1];
    let path = [];
    if (type === 'H1' || type === 'H2') {
      const rowStep = newRow > oldRow ? 1 : newRow < oldRow ? -1 : 0;
      const colStep = newCol > oldCol ? 1 : newCol < oldCol ? -1 : 0;
      let r = oldRow + rowStep;
      let c = oldCol + colStep;
      while (r !== newRow || c !== newCol) {
        path.push([r, c]);
        r += rowStep;
        c += colStep;
      }
    }
    return path;
  };

  // Select character and set available moves
  const selectCharacter = (character) => {
    if (character.startsWith(currentPlayer)) {
      setSelectedCharacter(character);
      if (character.endsWith('H1')) {
        setAvailableMoves(['L', 'R', 'F', 'B']);
      } else if (character.endsWith('P1') || character.endsWith('P2') || character.endsWith('P3')) {
        setAvailableMoves(['L', 'R', 'F', 'B']);
      } else {
        setAvailableMoves(['FL', 'FR', 'BR', 'BL']);
      }
    } else {
      setMessage(`It's ${currentPlayer}'s turn!`);
    }
  };

  // Render component
  return (
    <div className="App">
      <h1>Turn-Based Chess-Like Game</h1>
      {winner && <h2 className="winner">{winner} wins!</h2>}
      <div className="board-and-history">
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${selectedCharacter === cell ? 'selected' : ''}`}
                  onClick={() => selectCharacter(cell)}
                >
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="controls">
          <h3>Selected Character: {selectedCharacter}</h3>
          <div className="move-buttons">
            {availableMoves.map((move, index) => (
              <button key={index} onClick={() => handleMove(selectedCharacter, move)}>
                {move}
              </button>
            ))}
          </div>
          {message && <p className="message">{message}</p>}
          <h3>Move History</h3>
          <div className="history">
            {history.map((entry, index) => (
              <div key={index} className="history-entry">
                {entry.character} moved {entry.move} from ({entry.from[0]}, {entry.from[1]}) to ({entry.to[0]}, {entry.to[1]}) {entry.killed && `and killed ${entry.killed}`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
