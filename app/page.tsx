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
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 p-4 overflow-hidden">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-8 text-amber-900 drop-shadow-lg text-center">♔ Chess Go ♛</h1>
      <ChessBoard
        ref={chessBoardRef}
        onPlayerChange={handlePlayerChange}
        onReset={() => {}}
      />
      <div className="mt-4 md:mt-8 text-center bg-white rounded-lg shadow-lg p-4 md:p-6 min-w-64 max-w-xs md:max-w-none">
        <p className="text-lg md:text-xl mb-3 md:mb-4 font-semibold text-gray-800">
          Current Turn: <span className={`font-bold ${currentPlayer === 'white' ? 'text-black' : 'text-blue-600'}`}>
            {currentPlayer === 'white' ? '⚫ Black Pieces' : '🔵 Blue Pieces'}
          </span>
        </p>
        <button
          onClick={handleReset}
          className="px-4 md:px-6 py-2 md:py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg text-sm md:text-base"
        >
          🔄 New Game
        </button>
      </div>
    </div>
  );
}
