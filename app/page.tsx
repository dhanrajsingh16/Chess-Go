'use client';

import { useState, useRef } from 'react';
import ChessBoard, { ChessBoardRef } from '../components/ChessBoard';

export default function Home() {
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const chessBoardRef = useRef<ChessBoardRef | null>(null);

  const handlePlayerChange = (player: 'white' | 'black') => {
    setCurrentPlayer(player);
  };

  const handleReset = () => {
    if (chessBoardRef.current) {
      chessBoardRef.current.resetGame();
    }
    setCurrentPlayer('white');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-8">
      <h1 className="text-5xl font-bold mb-8 text-amber-900 drop-shadow-lg">♔ Chess Go ♛</h1>
      <ChessBoard
        ref={chessBoardRef}
        onPlayerChange={handlePlayerChange}
        onReset={() => {}}
      />
      <div className="mt-8 text-center bg-white rounded-lg shadow-lg p-6 min-w-64">
        <p className="text-xl mb-4 font-semibold text-gray-800">
          Current Turn: <span className={`font-bold ${currentPlayer === 'white' ? 'text-black' : 'text-blue-600'}`}>
            {currentPlayer === 'white' ? '⚫ Black Pieces' : '🔵 Blue Pieces'}
          </span>
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg"
        >
          🔄 New Game
        </button>
      </div>
    </div>
  );
}
