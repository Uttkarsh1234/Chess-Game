// App.js

import '../styles/App.css';
import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function App() {
  const [game, setGame] = useState(new Chess());
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  function safeGameMutate(modify) {
    setGame((g) => {
      const copy = new Chess(g.fen());
      modify(copy);
      return copy;
    });
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();

    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
      setGameOver(true);
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setWinner(winner);
      return;
    }

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];

    safeGameMutate((game) => {
      try {
        game.move(move);
      } catch (e) {
        console.error("Computer move failed:", e);
      }
    });
  }

  function onDrop(source, target) {
    if (gameOver) return false;

    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move({
      from: source,
      to: target,
      promotion: 'q',
    });

    if (move === null) return false;

    setGame(gameCopy);
    return true;
  }

  useEffect(() => {
    if (game.turn() === 'b' && !gameOver) {
      const timeout = setTimeout(makeRandomMove, 200);
      return () => clearTimeout(timeout);
    }
  }, [game, gameOver]);

  function restartGame() {
    setGame(new Chess());
    setGameOver(false);
    setWinner(null);
  }

  useEffect(() => {
    function handleKeyPress(event) {
      if (event.key === 'Enter') {
        restartGame();
      }
    }
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="app">
      <div className="header">
        <img src="https://media.geeksforgeeks.org/wp-content/cdn-uploads/20210420155809/gfg-new-logo.png" alt="Game Image" className="game-image" />
        <div className="game-info">
          <h1>GeeksforGeeks Chess Game</h1>
        </div>
      </div>
      <div className="chessboard-container">
        <div className="turn-indicator">
          {gameOver ? (
            <p>Game Over</p>
          ) : (
            <p>{game.turn() === 'w' ? "Your Turn" : "Opponent's Turn"}</p>
          )}
        </div>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
        {gameOver && (
          <div className="game-over">
            <p>Game Over</p>
            <p>Winner: {winner}</p>
            <p>Press Enter to restart</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;