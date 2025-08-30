import React, { useState, useImperativeHandle, forwardRef } from 'react';

type Piece = {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
};

type ChessBoardProps = {
  onPlayerChange: (player: 'white' | 'black') => void;
  onReset: () => void;
};

export type ChessBoardRef = {
  resetGame: () => void;
};

const ChessBoard = forwardRef<ChessBoardRef, ChessBoardProps>(({ onPlayerChange, onReset }, ref) => {
  const createInitialBoard = (): (Piece | null)[][] => [
    [
      { type: 'rook', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'queen', color: 'black' },
      { type: 'king', color: 'black' },
      { type: 'bishop', color: 'black' },
      { type: 'knight', color: 'black' },
      { type: 'rook', color: 'black' },
    ],
    [
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
      { type: 'pawn', color: 'black' },
    ],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    [
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
      { type: 'pawn', color: 'white' },
    ],
    [
      { type: 'rook', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'queen', color: 'white' },
      { type: 'king', color: 'white' },
      { type: 'bishop', color: 'white' },
      { type: 'knight', color: 'white' },
      { type: 'rook', color: 'white' },
    ],
  ];

  const initialBoard = createInitialBoard();

  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<{ row: number; col: number } | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [gameOver, setGameOver] = useState<{ winner: 'white' | 'black' | null; reason: string } | null>(null);

  const getPieceSymbol = (piece: Piece | null): string => {
    if (!piece) return '';
    const symbols: Record<string, string> = {
      'pawn-white': '♙',
      'pawn-black': '♟',
      'rook-white': '♖',
      'rook-black': '♜',
      'knight-white': '♘',
      'knight-black': '♞',
      'bishop-white': '♗',
      'bishop-black': '♝',
      'queen-white': '♕',
      'queen-black': '♛',
      'king-white': '♔',
      'king-black': '♚',
    };
    return symbols[`${piece.type}-${piece.color}`];
  };

  const getPieceStyle = (piece: Piece | null, isLight: boolean): string => {
    if (!piece) return '';

    if (piece.color === 'white') {
      // White pieces: black color for clear distinction
      return 'text-black drop-shadow-sm';
    } else {
      // Black pieces: blue color for clear distinction
      return 'text-blue-600 drop-shadow-sm';
    }
  };

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number, testBoard?: (Piece | null)[][]): boolean => {
    const boardToCheck = testBoard || board;
    const piece = boardToCheck[fromRow][fromCol];
    if (!piece || piece.color !== currentPlayer) return false;

    const targetPiece = boardToCheck[toRow][toCol];
    if (targetPiece && targetPiece.color === piece.color) return false;

    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Move forward one square
        if (fromCol === toCol && toRow === fromRow + direction && !targetPiece) return true;

        // Initial double move
        if (fromCol === toCol && fromRow === startRow && toRow === fromRow + 2 * direction && !targetPiece) {
          // Check if path is clear for double move
          const middleRow = fromRow + direction;
          return !boardToCheck[middleRow][fromCol];
        }

        // Capture diagonally
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && targetPiece && targetPiece.color !== piece.color) return true;

        return false;

      case 'rook':
        // Horizontal or vertical movement
        if (fromRow === toRow || fromCol === toCol) {
          return isPathClear(fromRow, fromCol, toRow, toCol, boardToCheck);
        }
        return false;

      case 'knight':
        // L-shaped movement
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) return true;
        return false;

      case 'bishop':
        // Diagonal movement
        if (rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol, boardToCheck);
        }
        return false;

      case 'queen':
        // Horizontal, vertical, or diagonal
        if (fromRow === toRow || fromCol === toCol || rowDiff === colDiff) {
          return isPathClear(fromRow, fromCol, toRow, toCol, boardToCheck);
        }
        return false;

      case 'king':
        // One square in any direction
        if (rowDiff <= 1 && colDiff <= 1) return true;
        return false;

      default:
        return false;
    }
  };

  const isPathClear = (fromRow: number, fromCol: number, toRow: number, toCol: number, testBoard?: (Piece | null)[][]): boolean => {
    const boardToCheck = testBoard || board;
    const rowStep = fromRow === toRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
    const colStep = fromCol === toCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      if (boardToCheck[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }

    return true;
  };

  const isKingInCheck = (kingColor: 'white' | 'black'): boolean => {
    return wouldKingBeInCheck(board, kingColor);
  };

  const isCheckmate = (kingColor: 'white' | 'black'): boolean => {
    if (!isKingInCheck(kingColor)) return false;

    // Check if the king can move to any safe square
    let kingRow = -1;
    let kingCol = -1;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.type === 'king' && piece.color === kingColor) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }

    // Check all possible moves for the king
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        if (dRow === 0 && dCol === 0) continue;

        const newRow = kingRow + dRow;
        const newCol = kingCol + dCol;

        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const targetPiece = board[newRow][newCol];
          if (!targetPiece || targetPiece.color !== kingColor) {
            // Simulate the move
            const tempBoard = board.map(r => [...r]);
            tempBoard[newRow][newCol] = board[kingRow][kingCol];
            tempBoard[kingRow][kingCol] = null;

            // Check if king would still be in check
            let stillInCheck = false;
            for (let row = 0; row < 8; row++) {
              for (let col = 0; col < 8; col++) {
                const piece = tempBoard[row][col];
                if (piece && piece.color !== kingColor) {
                  if (isValidMove(row, col, newRow, newCol, tempBoard)) {
                    stillInCheck = true;
                    break;
                  }
                }
              }
              if (stillInCheck) break;
            }

            if (!stillInCheck) return false;
          }
        }
      }
    }

    return true; // No safe moves found
  };


  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return; // Prevent moves when game is over

    if (selectedSquare) {
      if (selectedSquare.row === row && selectedSquare.col === col) {
        setSelectedSquare(null);
      } else if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
        // Simulate the move
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = board[selectedSquare.row][selectedSquare.col];
        newBoard[selectedSquare.row][selectedSquare.col] = null;

        // Check if this move would put our own king in check
        if (!wouldKingBeInCheck(newBoard, currentPlayer)) {
          // Check if we're capturing a king
          const capturedPiece = board[row][col];
          const isKingCapture = capturedPiece && capturedPiece.type === 'king';

          setBoard(newBoard);
          const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';
          setCurrentPlayer(nextPlayer);
          onPlayerChange(nextPlayer);
          setSelectedSquare(null);

          // Check for king capture (immediate win)
          if (isKingCapture) {
            setGameOver({
              winner: currentPlayer,
              reason: 'King Captured'
            });
          }
          // Check for checkmate
          else if (isCheckmate(nextPlayer)) {
            setGameOver({
              winner: currentPlayer,
              reason: 'Checkmate'
            });
          } else if (isKingInCheck(nextPlayer)) {
            alert(`${nextPlayer.charAt(0).toUpperCase() + nextPlayer.slice(1)} is in check!`);
          }
        } else {
          // Move would put own king in check - invalid
          alert("Invalid move: would put your king in check!");
        }
      } else {
        setSelectedSquare({ row, col });
      }
    } else {
      const piece = board[row][col];
      if (piece && piece.color === currentPlayer) {
        setSelectedSquare({ row, col });
      }
    }
  };

  const wouldKingBeInCheck = (testBoard: (Piece | null)[][], kingColor: 'white' | 'black'): boolean => {
    const [kingRow, kingCol] = findKing(testBoard, kingColor);
    const opponentColor = kingColor === 'white' ? 'black' : 'white';

    // Check if any opponent piece can attack the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col];
        if (piece && piece.color === opponentColor) {
          if (isValidMove(row, col, kingRow, kingCol, testBoard)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const findKing = (testBoard: (Piece | null)[][], color: 'white' | 'black'): [number, number] => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = testBoard[row][col];
        if (piece && piece.type === 'king' && piece.color === color) {
          return [row, col];
        }
      }
    }
    return [-1, -1];
  };

  const resetGame = () => {
    setBoard(initialBoard.map(r => [...r]));
    setCurrentPlayer('white');
    setSelectedSquare(null);
    setGameOver(null);
    onPlayerChange('white');
    onReset();
  };

  // Expose reset function to parent
  useImperativeHandle(ref, () => ({
    resetGame,
  }));

  return (
    <div className="relative inline-block">
      <div className="inline-block border-4 border-amber-900 rounded-lg shadow-2xl bg-amber-900 p-1 md:p-2">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              return (
                <div
                  key={colIndex}
                  className={`w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center text-3xl md:text-4xl lg:text-5xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isLight ? 'bg-amber-50' : 'bg-amber-700'
                  } ${isSelected ? 'ring-4 ring-blue-400 shadow-lg' : 'hover:shadow-md'}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  <span className={getPieceStyle(piece, isLight)}>
                    {getPieceSymbol(piece)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">
              {gameOver.reason === 'King Captured' ? '👑' : (gameOver.winner === 'white' ? '⚫' : '🔵')}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {gameOver.winner === 'white' ? '⚫ Black Pieces' : '🔵 Blue Pieces'} Win!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {gameOver.reason === 'King Captured' ? '👑 King Captured!' : 'Game Over by Checkmate'}
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-semibold shadow-md hover:shadow-lg text-lg"
            >
              🎮 Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';

export default ChessBoard;