// utils/chess/chessLogic.js
/**
 * 国际象棋逻辑处理工具类
 */

// 获取棋子颜色
export function getPieceColor(piece) {
  if (!piece) return null;
  return piece.startsWith('white') ? 'white' : 'black';
}

// 获取棋子类型
export function getPieceType(piece) {
  if (!piece) return null;
  return piece.split('-')[1];
}

// 判断位置是否在棋盘内
export function isValidPosition(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// 棋盘特殊状态记录
export const chessBoardState = {
  canCastle: {
    white: {
      kingMoved: false,
      leftRookMoved: false,
      rightRookMoved: false
    },
    black: {
      kingMoved: false,
      leftRookMoved: false,
      rightRookMoved: false
    }
  },
  enPassant: null
};

// 重置棋盘状态
export function resetChessBoardState() {
  chessBoardState.canCastle.white.kingMoved = false;
  chessBoardState.canCastle.white.leftRookMoved = false;
  chessBoardState.canCastle.white.rightRookMoved = false;
  chessBoardState.canCastle.black.kingMoved = false;
  chessBoardState.canCastle.black.leftRookMoved = false;
  chessBoardState.canCastle.black.rightRookMoved = false;
  chessBoardState.enPassant = null;
}

// 获取兵的有效移动
export function getPawnMoves(board, row, col, color) {
  const moves = [];
  const direction = color === 'white' ? -1 : 1; // 白色向上，黑色向下
  const startRow = color === 'white' ? 6 : 1; // 初始行

  // 前进一步
  if (isValidPosition(row + direction, col) && !board[row + direction][col]) {
    moves.push({ row: row + direction, col: col });

    // 初始位置可以前进两步
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col: col });
    }
  }

  // 左斜吃子
  if (isValidPosition(row + direction, col - 1)) {
    const targetPiece = board[row + direction][col - 1];
    if (targetPiece && getPieceColor(targetPiece) !== color) {
      moves.push({ row: row + direction, col: col - 1 });
    }

    // 吃过路兵
    if (!targetPiece && chessBoardState.enPassant &&
      chessBoardState.enPassant.row === row &&
      chessBoardState.enPassant.col === col - 1) {
      moves.push({
        row: row + direction,
        col: col - 1,
        isEnPassant: true,
        capturedPiecePos: { row: row, col: col - 1 }
      });
    }
  }

  // 右斜吃子
  if (isValidPosition(row + direction, col + 1)) {
    const targetPiece = board[row + direction][col + 1];
    if (targetPiece && getPieceColor(targetPiece) !== color) {
      moves.push({ row: row + direction, col: col + 1 });
    }

    // 吃过路兵
    if (!targetPiece && chessBoardState.enPassant &&
      chessBoardState.enPassant.row === row &&
      chessBoardState.enPassant.col === col + 1) {
      moves.push({
        row: row + direction,
        col: col + 1,
        isEnPassant: true,
        capturedPiecePos: { row: row, col: col + 1 }
      });
    }
  }

  return moves;
}

// 获取车的有效移动
export function getRookMoves(board, row, col, color) {
  const moves = [];
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 }   // 右
  ];

  for (const direction of directions) {
    getMovesInDirection(board, row, col, direction.row, direction.col, color, moves);
  }

  return moves;
}

// 获取马的有效移动
export function getKnightMoves(board, row, col, color) {
  const moves = [];
  const offsets = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];

  for (const offset of offsets) {
    const newRow = row + offset.row;
    const newCol = col + offset.col;

    if (isValidPosition(newRow, newCol)) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || getPieceColor(targetPiece) !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

// 获取象的有效移动
export function getBishopMoves(board, row, col, color) {
  const moves = [];
  const directions = [
    { row: -1, col: -1 }, // 左上
    { row: -1, col: 1 },  // 右上
    { row: 1, col: -1 },  // 左下
    { row: 1, col: 1 }    // 右下
  ];

  for (const direction of directions) {
    getMovesInDirection(board, row, col, direction.row, direction.col, color, moves);
  }

  return moves;
}

// 获取后的有效移动
export function getQueenMoves(board, row, col, color) {
  // 后的移动是车和象的结合
  return [...getRookMoves(board, row, col, color), ...getBishopMoves(board, row, col, color)];
}

// 获取王的有效移动
export function getKingMoves(board, row, col, color) {
  const moves = [];

  // 普通移动（周围8个方向）
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;

      const newRow = row + i;
      const newCol = col + j;

      if (isValidPosition(newRow, newCol)) {
        const targetPiece = board[newRow][newCol];
        if (!targetPiece || getPieceColor(targetPiece) !== color) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    }
  }

  // 王车易位逻辑
  const kingMoved = color === 'white' ? chessBoardState.canCastle.white.kingMoved : chessBoardState.canCastle.black.kingMoved;

  if (!kingMoved) {
    const backRow = color === 'white' ? 7 : 0;

    // 确保王在正确的初始位置
    if (row === backRow && col === 4) {
      // 王车易位（短易位）
      const kingSideClear = !board[backRow][5] && !board[backRow][6];
      const kingSideRookMoved = color === 'white' ?
        chessBoardState.canCastle.white.rightRookMoved :
        chessBoardState.canCastle.black.rightRookMoved;

      if (kingSideClear && !kingSideRookMoved && board[backRow][7] && getPieceType(board[backRow][7]) === 'rook') {
        // 检查路径是否安全（不能穿过被攻击的格子）
        const underAttack = isPositionUnderAttack(board, backRow, 5, color) ||
          isPositionUnderAttack(board, backRow, 6, color);

        if (!underAttack) {
          moves.push({
            row: backRow,
            col: 6,
            isCastling: true,
            rookFrom: { row: backRow, col: 7 },
            rookTo: { row: backRow, col: 5 }
          });
        }
      }

      // 王车易位（长易位）
      const queenSideClear = !board[backRow][1] && !board[backRow][2] && !board[backRow][3];
      const queenSideRookMoved = color === 'white' ?
        chessBoardState.canCastle.white.leftRookMoved :
        chessBoardState.canCastle.black.leftRookMoved;

      if (queenSideClear && !queenSideRookMoved && board[backRow][0] && getPieceType(board[backRow][0]) === 'rook') {
        // 检查路径是否安全
        const underAttack = isPositionUnderAttack(board, backRow, 2, color) ||
          isPositionUnderAttack(board, backRow, 3, color);

        if (!underAttack) {
          moves.push({
            row: backRow,
            col: 2,
            isCastling: true,
            rookFrom: { row: backRow, col: 0 },
            rookTo: { row: backRow, col: 3 }
          });
        }
      }
    }
  }

  return moves;
}

// 获取车的移动状态
function getStateForRook(color, side) {
  if (color === 'white') {
    return side === 'left' ? chessBoardState.canCastle.white.leftRookMoved : chessBoardState.canCastle.white.rightRookMoved;
  } else {
    return side === 'left' ? chessBoardState.canCastle.black.leftRookMoved : chessBoardState.canCastle.black.rightRookMoved;
  }
}

// 检查位置是否受到攻击
function isPositionUnderAttack(board, row, col, color) {
  const oppositeColor = color === 'white' ? 'black' : 'white';

  // 检查八个方向的攻击（车、象、后、王）
  const directions = [
    { row: -1, col: 0 }, { row: 1, col: 0 }, // 上下
    { row: 0, col: -1 }, { row: 0, col: 1 }, // 左右
    { row: -1, col: -1 }, { row: -1, col: 1 }, // 左上右上
    { row: 1, col: -1 }, { row: 1, col: 1 } // 左下右下
  ];

  for (const dir of directions) {
    let newRow = row + dir.row;
    let newCol = col + dir.col;
    let steps = 1;

    while (isValidPosition(newRow, newCol)) {
      const piece = board[newRow][newCol];

      if (piece) {
        const pieceColor = getPieceColor(piece);
        const pieceType = getPieceType(piece);

        if (pieceColor === oppositeColor) {
          // 如果是直线上的车或后
          if ((Math.abs(dir.row) === 1 && dir.col === 0) || (dir.row === 0 && Math.abs(dir.col) === 1)) {
            if (pieceType === 'rook' || pieceType === 'queen') {
              return true;
            }
          }
          // 如果是斜线上的象或后
          else if (Math.abs(dir.row) === 1 && Math.abs(dir.col) === 1) {
            if (pieceType === 'bishop' || pieceType === 'queen') {
              return true;
            }
          }

          // 如果是第一步并且是王
          if (steps === 1 && pieceType === 'king') {
            return true;
          }
        }

        // 有棋子挡住了，停止检查这个方向
        break;
      }

      newRow += dir.row;
      newCol += dir.col;
      steps++;
    }
  }

  // 检查马的攻击
  const knightOffsets = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];

  for (const offset of knightOffsets) {
    const newRow = row + offset.row;
    const newCol = col + offset.col;

    if (isValidPosition(newRow, newCol)) {
      const piece = board[newRow][newCol];
      if (piece && getPieceColor(piece) === oppositeColor && getPieceType(piece) === 'knight') {
        return true;
      }
    }
  }

  // 检查兵的攻击
  const pawnAttackOffsets = color === 'white' ?
    [{ row: -1, col: -1 }, { row: -1, col: 1 }] : // 白棋检查上方斜向的黑兵
    [{ row: 1, col: -1 }, { row: 1, col: 1 }];    // 黑棋检查下方斜向的白兵

  for (const offset of pawnAttackOffsets) {
    const newRow = row + offset.row;
    const newCol = col + offset.col;

    if (isValidPosition(newRow, newCol)) {
      const piece = board[newRow][newCol];
      if (piece && getPieceColor(piece) === oppositeColor && getPieceType(piece) === 'pawn') {
        return true;
      }
    }
  }

  return false;
}

// 检查王是否被将军
export function isKingInCheck(board, color) {
  // 找到王的位置
  let kingRow = -1, kingCol = -1;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && getPieceColor(piece) === color && getPieceType(piece) === 'king') {
        kingRow = row;
        kingCol = col;
        break;
      }
    }
    if (kingRow !== -1) break;
  }

  // 检查王是否在棋盘上
  if (kingRow === -1 || kingCol === -1) return false;

  // 检查王的位置是否受到攻击
  return isPositionUnderAttack(board, kingRow, kingCol, color);
}

// 获取指定方向上的有效移动
export function getMovesInDirection(board, row, col, rowDir, colDir, color, moves) {
  let newRow = row + rowDir;
  let newCol = col + colDir;

  while (isValidPosition(newRow, newCol)) {
    const targetPiece = board[newRow][newCol];

    if (!targetPiece) {
      // 空格子，可以移动
      moves.push({ row: newRow, col: newCol });
    } else {
      // 有棋子
      if (getPieceColor(targetPiece) !== color) {
        // 对方棋子，可以吃
        moves.push({ row: newRow, col: newCol });
      }
      // 不管是己方还是对方棋子，都不能继续往这个方向移动了
      break;
    }

    newRow += rowDir;
    newCol += colDir;
  }
}

// 记录棋子移动并更新状态
export function recordMove(board, from, to, moveInfo = {}) {
  const piece = board[from.row][from.col];
  const pieceType = getPieceType(piece);
  const pieceColor = getPieceColor(piece);

  // 记录这步移动
  const move = {
    piece,
    from,
    to,
    captured: board[to.row][to.col],
    ...moveInfo
  };

  // 更新王和车的移动状态（用于王车易位判断）
  if (pieceType === 'king') {
    if (pieceColor === 'white') {
      chessBoardState.canCastle.white.kingMoved = true;
    } else {
      chessBoardState.canCastle.black.kingMoved = true;
    }

    // 处理王车易位
    if (moveInfo.isCastling && moveInfo.rookFrom && moveInfo.rookTo) {
      // 移动车
      board[moveInfo.rookTo.row][moveInfo.rookTo.col] = board[moveInfo.rookFrom.row][moveInfo.rookFrom.col];
      board[moveInfo.rookFrom.row][moveInfo.rookFrom.col] = null;

      // 记录车的移动信息
      move.rookMove = {
        piece: board[moveInfo.rookTo.row][moveInfo.rookTo.col],
        from: moveInfo.rookFrom,
        to: moveInfo.rookTo
      };
    }
  } else if (pieceType === 'rook') {
    const kingStartRow = pieceColor === 'white' ? 7 : 0;
    if (from.row === kingStartRow) {
      if (from.col === 0) { // 左车
        if (pieceColor === 'white') {
          chessBoardState.canCastle.white.leftRookMoved = true;
        } else {
          chessBoardState.canCastle.black.leftRookMoved = true;
        }
      } else if (from.col === 7) { // 右车
        if (pieceColor === 'white') {
          chessBoardState.canCastle.white.rightRookMoved = true;
        } else {
          chessBoardState.canCastle.black.rightRookMoved = true;
        }
      }
    }
  } else if (pieceType === 'pawn') {
    // 检查是否是兵前进两格（用于下一步判断吃过路兵）
    const startRow = pieceColor === 'white' ? 6 : 1;
    const moveDistance = Math.abs(from.row - to.row);

    if (from.row === startRow && moveDistance === 2) {
      // 记录吃过路兵的可能位置
      chessBoardState.enPassant = {
        row: pieceColor === 'white' ? from.row - 1 : from.row + 1,
        col: from.col
      };
    } else {
      chessBoardState.enPassant = null;
    }

    // 处理吃过路兵
    if (moveInfo.isEnPassant && moveInfo.capturedPiecePos) {
      board[moveInfo.capturedPiecePos.row][moveInfo.capturedPiecePos.col] = null;
      move.capturedEnPassant = true;
    }

    // 处理兵升变
    if (moveInfo.isPromotion && moveInfo.promoteTo) {
      // 将兵升变为指定棋子
      const promotedPiece = `${pieceColor}-${moveInfo.promoteTo}`;
      move.promotedTo = promotedPiece;
    } else if ((pieceColor === 'white' && to.row === 0) || (pieceColor === 'black' && to.row === 7)) {
      // 如果走到底线但没有指定升变，默认升变为后
      const promotedPiece = `${pieceColor}-queen`;
      move.promotedTo = promotedPiece;
      move.isPromotion = true;
    }
  }

  // 更新棋盘
  board[to.row][to.col] = move.promotedTo || piece;
  board[from.row][from.col] = null;

  return move;
}

// 获取指定位置棋子的有效移动
export function getValidMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const pieceType = getPieceType(piece);
  const color = getPieceColor(piece);

  switch (pieceType) {
    case 'pawn':
      return getPawnMoves(board, row, col, color);
    case 'rook':
      return getRookMoves(board, row, col, color);
    case 'knight':
      return getKnightMoves(board, row, col, color);
    case 'bishop':
      return getBishopMoves(board, row, col, color);
    case 'queen':
      return getQueenMoves(board, row, col, color);
    case 'king':
      return getKingMoves(board, row, col, color);
    default:
      return [];
  }
}

// 计算代数记谱法
export function calculateAlgebraicNotation(from, to, piece, board, captured) {
  const pieceType = getPieceType(piece);

  // 计算代数坐标 (a1, b2 等)
  // 列：0-7 对应 a-h
  // 行：0-7 对应 8-1 (注意这里的反转)
  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const fromCol = columns[from.col];
  const fromRow = 8 - from.row; // 从0开始的索引转换为1-8的行号，同时反转方向
  const toCol = columns[to.col];
  const toRow = 8 - to.row;

  // 特殊情况：王车易位
  if (pieceType === 'king' && Math.abs(from.col - to.col) > 1) {
    return to.col > from.col ? 'O-O' : 'O-O-O';
  }

  let notation = '';

  // 添加棋子符号（兵除外）
  if (pieceType !== 'pawn') {
    const symbols = {
      'king': 'K',
      'queen': 'Q',
      'rook': 'R',
      'bishop': 'B',
      'knight': 'N'
    };
    notation += symbols[pieceType];
  }

  // 检查是否需要消除歧义
  if (pieceType !== 'pawn' && pieceType !== 'king') {
    // 查找所有能移动到同一位置的相同类型的棋子
    const sameTypePieces = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === from.row && c === from.col) continue; // 排除当前棋子

        const otherPiece = board[r][c];
        if (!otherPiece) continue;

        // 检查是否是同类型同颜色的棋子
        if (getPieceType(otherPiece) === pieceType && getPieceColor(otherPiece) === getPieceColor(piece)) {
          const moves = getValidMoves(board, r, c);
          const canAlsoMoveThere = moves.some(move => move.row === to.row && move.col === to.col);

          if (canAlsoMoveThere) {
            sameTypePieces.push({ row: r, col: c });
          }
        }
      }
    }

    // 如果存在歧义，需要添加行、列进行消除
    if (sameTypePieces.length > 0) {
      // 检查是否可以只用列来消除歧义
      const sameCol = sameTypePieces.some(p => p.col === from.col);
      const sameRow = sameTypePieces.some(p => p.row === from.row);

      if (!sameCol) {
        notation += fromCol; // 只需要添加列
      } else if (!sameRow) {
        notation += fromRow; // 只需要添加行
      } else {
        notation += fromCol + fromRow; // 需要同时添加行和列
      }
    }
  }

  // 添加起始坐标（只有兵在吃子时才需要）
  if (captured && pieceType === 'pawn') {
    notation += fromCol;
  }

  // 吃子符号
  if (captured) {
    notation += 'x';
  }

  // 目标坐标
  notation += toCol + toRow;

  return notation;
}

// 获取初始棋盘状态
export function getInitialChessboard() {
  // 重置棋盘状态信息
  resetChessBoardState();

  // 返回棋盘布局 - 确保白方在下方（第7行），黑方在上方（第0行）
  // 注意：这里的行和列的索引与实际棋盘坐标的对应关系：
  // - 行：第0行对应棋盘的第8行，第7行对应棋盘的第1行
  // - 列：第0列对应棋盘的a列，第7列对应棋盘的h列
  return [
    ['black-rook', 'black-knight', 'black-bishop', 'black-queen', 'black-king', 'black-bishop', 'black-knight', 'black-rook'],
    ['black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn', 'black-pawn'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn', 'white-pawn'],
    ['white-rook', 'white-knight', 'white-bishop', 'white-queen', 'white-king', 'white-bishop', 'white-knight', 'white-rook']
  ];
}