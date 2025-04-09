<template>
  <view class="lesson-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 棋盘区域 -->
    <view class="chess-board-area">
      <chess-board
        ref="chessBoard"
        :board-state="boardState"
        :selected-position="selectedPosition"
        :valid-moves="validMoves"
        :last-move="lastMove"
        :current-player="currentPlayer"
        :play-as="'white'"
        @cell-click="handleCellClick"
      />
      
      <!-- 课程完成弹窗 -->
      <view v-if="showCompletionModal" class="lesson-completion-modal">
        <view class="modal-content">
          <view class="close-btn" @click="showCompletionModal = false">
            <text class="iconfont icon-close"></text>
          </view>
          <view class="completion-title">课程完成</view>
          <view class="medal-icon">
            <image src="/static/images/learn/medal.png" mode="aspectFit"></image>
          </view>
          <view class="progress-text">{{ completionInfo.current }} of {{ completionInfo.total }} lessons</view>
          <view class="continue-btn" @click="nextLesson">
            <text>学习下篇</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 教学卡片区域 -->
    <view class="teaching-card">
      <!-- 标题区 -->
      <view class="card-header">
        <view class="back-btn" @click="goBack">
          <text class="iconfont icon-left"></text>
        </view>
        <view class="title">
          <text>{{ lessonInfo.title }}</text>
        </view>
        <view class="sound-btn" @click="toggleSound">
          <text class="iconfont" :class="isSoundOn ? 'icon-sound' : 'icon-sound-off'"></text>
        </view>
      </view>
      
      <!-- 教练指导区 -->
      <view class="coach-guidance">
        <view class="avatar">
          <image :src="currentRobotAvatar" mode="aspectFit"></image>
        </view>
        <view class="message-bubble" :class="{'error-message': currentMessage.isError}">
          <text>{{ currentMessage.text }}</text>
        </view>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-section">
        <text class="progress-text">挑战 {{ currentStep }}/{{ totalSteps }}</text>
        <view class="progress-bar">
          <view class="progress-fill" :style="{width: `${(currentStep / totalSteps) * 100}%`}"></view>
        </view>
      </view>
      
      <!-- 按钮区 -->
      <view class="button-section">
        <view v-if="showHintBtn" class="hint-btn" @click="showHint">
          <text class="iconfont icon-lightbulb"></text>
          <text>提示</text>
        </view>
        
        <view v-if="actionState === 'initial' && currentStep === 1 && !lessonStarted" class="action-btn primary-btn" @click="startLesson">
          <text>学一下！</text>
        </view>
        
        <view v-if="actionState === 'retry'" class="action-btn error-btn" @click="retryStep">
          <text>重试</text>
        </view>
        
        <view v-if="actionState === 'next'" class="action-btn primary-btn" @click="nextStep">
          <text>下一步</text>
          <text class="iconfont icon-right"></text>
        </view>
        
        <view v-if="actionState === 'next-lesson'" class="action-btn primary-btn" @click="nextLesson">
          <text>下一课</text>
          <text class="iconfont icon-double-right"></text>
        </view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <tab-bar active-tab="learn"></tab-bar>
  </view>
</template>

<script>
import ChessBoard from '@/components/chess/ChessBoard.vue';
import TopSpacing from '@/components/TopSpacing.vue';
import TabBar from '@/components/TabBar.vue';
import { getInitialChessboard, getPieceType, getPieceColor, getValidMoves } from '@/utils/chess/cheesLogic.js';

// 添加棋子移动相关的函数
function getPawnMoves(board, row, col, color) {
  const moves = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // 向前移动一格
  if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col]) {
    moves.push({ row: row + direction, col: col });
    
    // 初始位置可以移动两格
    if (row === startRow && !board[row + 2 * direction][col]) {
      moves.push({ row: row + 2 * direction, col: col });
    }
  }

  // 吃子移动（对角线）
  const captureMoves = [
    { row: row + direction, col: col - 1 },
    { row: row + direction, col: col + 1 }
  ];

  for (const move of captureMoves) {
    if (move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8) {
      const targetPiece = board[move.row][move.col];
      if (targetPiece && getPieceColor(targetPiece) !== color) {
        moves.push(move);
      }
    }
  }

  return moves;
}

function getRookMoves(board, row, col, color) {
  const moves = [];
  const directions = [
    { row: -1, col: 0 }, // 上
    { row: 1, col: 0 },  // 下
    { row: 0, col: -1 }, // 左
    { row: 0, col: 1 }   // 右
  ];

  for (const dir of directions) {
    let newRow = row + dir.row;
    let newCol = col + dir.col;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (getPieceColor(targetPiece) !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }

      newRow += dir.row;
      newCol += dir.col;
    }
  }

  return moves;
}

function getKnightMoves(board, row, col, color) {
  const moves = [];
  const possibleMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 },  { row: 1, col: 2 },
    { row: 2, col: -1 },  { row: 2, col: 1 }
  ];

  for (const move of possibleMoves) {
    const newRow = row + move.row;
    const newCol = col + move.col;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || getPieceColor(targetPiece) !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

function getBishopMoves(board, row, col, color) {
  const moves = [];
  const directions = [
    { row: -1, col: -1 }, // 左上
    { row: -1, col: 1 },  // 右上
    { row: 1, col: -1 },  // 左下
    { row: 1, col: 1 }    // 右下
  ];

  for (const dir of directions) {
    let newRow = row + dir.row;
    let newCol = col + dir.col;

    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (getPieceColor(targetPiece) !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }

      newRow += dir.row;
      newCol += dir.col;
    }
  }

  return moves;
}

function getQueenMoves(board, row, col, color) {
  // 皇后可以沿直线和对角线移动
  return [...getRookMoves(board, row, col, color), ...getBishopMoves(board, row, col, color)];
}

function getKingMoves(board, row, col, color) {
  const moves = [];
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ];

  for (const dir of directions) {
    const newRow = row + dir.row;
    const newCol = col + dir.col;

    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      if (!targetPiece || getPieceColor(targetPiece) !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }

  return moves;
}

export default {
  components: {
    ChessBoard,
    TopSpacing,
    TabBar
  },
  data() {
    return {
      statusBarHeight: 0,
      lessonStarted: false,
      lessonParams: null, // 课程信息参数
      lessonInfo: null,
      
      // 所有课程
      lessons: {
        'defense': {
          id: 'defense',
          title: '防御战术',
          steps: [
            {
              type: 'intro',
              message: '防御是国际象棋中的关键技能。学会如何保护你的棋子并防止对手的攻击是成为一名强大棋手的基础。',
              boardSetup: {
                fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1'
              }
            },
            {
              type: 'task',
              message: '在这个局面中，黑方刚刚攻击了白方的e4卒子。你需要防御这个卒子。请选择正确的防御方式。',
              boardSetup: {
                fen: 'rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 6, col: 3 }, // d2
                to: { row: 4, col: 3 }    // d4
              },
              correctMessage: '正确！通过推进d4，你不仅防御了e4卒子，还反击了黑方的中心。这是一个积极的防御方式。',
              errorMessage: '这不是最佳的防御方式。考虑如何既能保护e4卒子，又能发展你的棋子。',
              hintMessage: '考虑推进d2-d4，这样可以支援e4卒子并控制中心。'
            },
            {
              type: 'task',
              message: '现在黑方攻击了你的d4卒子。请找出最佳的防御方式。',
              boardSetup: {
                fen: 'rnbqkbnr/ppp2ppp/8/3p4/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 2 }, // c1
                to: { row: 5, col: 0 }    // a3
              },
              correctMessage: '很好！通过Bc1-a3，你不仅防御了d4卒子，还发展了象，并威胁黑方的王翼。',
              errorMessage: '这不是最佳的防御方式。考虑如何既能保护d4卒子，又能发展你的棋子。',
              hintMessage: '考虑将白方的象移动到a3，这样可以保护d4卒子并发展棋子。'
            },
            {
              type: 'task',
              message: '黑方继续进攻，现在威胁要吃掉你的骑士。请找出最佳的防御方式。',
              boardSetup: {
                fen: 'rnbqkb1r/ppp2ppp/5n2/3p4/3PP3/B4N2/PPP2PPP/RN1QKB1R b KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 3 }, // d1
                to: { row: 5, col: 3 }    // d3
              },
              correctMessage: '出色的防御！通过Qd1-d3，你保护了f3骑士，并将皇后放在了一个更积极的位置。',
              errorMessage: '这不是最佳的防御方式。考虑如何保护f3骑士并发展你的棋子。',
              hintMessage: '考虑将皇后移动到d3，这样可以保护f3骑士并发展皇后。'
            },
            {
              type: 'task',
              message: '黑方继续施压，攻击你的e4卒子。请找出最佳的防御方式。',
              boardSetup: {
                fen: 'r1bqkb1r/ppp2ppp/2n2n2/3p4/3PP3/B2Q1N2/PPP2PPP/RN2KB1R b KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 4 }, // e1
                to: { row: 7, col: 6 }    // g1
              },
              correctMessage: '非常好！通过王翼易位(O-O)，你保护了你的王，并将车连接起来，为后续的攻防做好准备。',
              errorMessage: '这不是最佳的防御方式。考虑如何保护你的王并连接双车。',
              hintMessage: '考虑进行王翼易位(O-O)，这样可以保护你的王并连接双车。'
            },
            {
              type: 'conclusion',
              message: '恭喜你完成了防御战术的学习！你已经掌握了几个重要的防御原则：1) 积极防御，同时发展棋子；2) 使用小子保护大子；3) 保护王的安全；4) 连接双车增强防御。这些技巧将帮助你在实战中构建坚固的防线。'
            }
          ]
        },
        'attack': {
          id: 'attack',
          title: '进攻战术',
          steps: [
            {
              type: 'intro',
              message: '进攻是国际象棋中取胜的关键。学会如何组织有效的攻势可以帮助你突破对手的防线并赢得比赛。',
              boardSetup: {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'
              }
            },
            {
              type: 'task',
              message: '这是一个典型的意大利开局局面。白方现在有机会发起一次强有力的攻击。请找出最佳的进攻着法。',
              boardSetup: {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 4 }, // e1
                to: { row: 7, col: 6 }    // g1
              },
              correctMessage: '正确！王翼易位(O-O)是这个局面中最强的着法，它保护了王的安全，并将车带入战斗，为后续的攻击做准备。',
              errorMessage: '这不是最佳的进攻准备。考虑如何保护你的王并为攻击做准备。',
              hintMessage: '考虑进行王翼易位(O-O)，这样可以保护你的王并将车带入战斗。'
            },
            {
              type: 'task',
              message: '现在你的王安全了，是时候开始进攻了。请找出最具威胁的进攻着法。',
              boardSetup: {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 1'
              },
              expectedMove: {
                from: { row: 6, col: 3 }, // d2
                to: { row: 4, col: 3 }    // d4
              },
              correctMessage: '很好！通过d4，你攻击了黑方的中心，并为后续的攻击打开了通道。',
              errorMessage: '这不是最佳的进攻方式。考虑如何攻击黑方的中心并打开通道。',
              hintMessage: '考虑推进d2-d4，这样可以攻击黑方的中心并为后续攻击做准备。'
            },
            {
              type: 'task',
              message: '黑方防守了中心。现在是时候加强你的攻势了。请找出最具威胁的进攻着法。',
              boardSetup: {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/8/2BpP3/5N2/PPP2PPP/RNBQ1RK1 w - - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 3 }, // d1
                to: { row: 5, col: 3 }    // d3
              },
              correctMessage: '出色的进攻！通过Qd1-d3，你将皇后带入攻击阵型，威胁黑方的王翼。',
              errorMessage: '这不是最佳的进攻方式。考虑如何将皇后带入攻击并威胁黑方。',
              hintMessage: '考虑将皇后移动到d3，这样可以将皇后带入攻击并威胁黑方的王翼。'
            },
            {
              type: 'task',
              message: '黑方继续发展棋子。现在是时候发起决定性的攻击了。请找出最具威胁的进攻着法。',
              boardSetup: {
                fen: 'r1bqk2r/ppppbppp/2n2n2/8/2BpP3/3Q1N2/PPP2PPP/RNB2RK1 w - - 0 1'
              },
              expectedMove: {
                from: { row: 5, col: 3 }, // d3
                to: { row: 5, col: 7 }    // h3
              },
              correctMessage: '精彩的进攻！通过Qd3-h3，你将皇后移到了h3，直接威胁黑方的王翼，为后续的牺牲和攻击做好了准备。',
              errorMessage: '这不是最具威胁的进攻方式。考虑如何直接威胁黑方的王翼。',
              hintMessage: '考虑将皇后移动到h3，这样可以直接威胁黑方的王翼。'
            },
            {
              type: 'conclusion',
              message: '恭喜你完成了进攻战术的学习！你已经掌握了几个重要的进攻原则：1) 首先保证王的安全；2) 控制中心为攻击做准备；3) 将主力棋子带入攻击阵型；4) 针对对手的弱点发起攻击。这些技巧将帮助你在实战中组织有效的攻势。'
            }
          ]
        },
        'control': {
          id: 'control',
          title: '局面控制',
          steps: [
            {
              type: 'intro',
              message: '控制局面是国际象棋中的关键策略。通过控制关键格子和区域，你可以限制对手的行动并为自己创造有利局面。',
              boardSetup: {
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
              }
            },
            {
              type: 'task',
              message: '控制中心是国际象棋的基本原则。请走出一步能够控制中心的着法。',
              boardSetup: {
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 6, col: 4 }, // e2
                to: { row: 4, col: 4 }    // e4
              },
              correctMessage: '正确！e4是最常见的开局着法之一，它控制了中心的d5和f5格子，并为王翼棋子的发展打开了通道。',
              errorMessage: '这不是最佳的控制中心的方式。考虑如何用卒子控制中心格子。',
              hintMessage: '考虑推进e2-e4，这样可以控制中心的d5和f5格子。'
            },
            {
              type: 'task',
              message: '黑方也争夺中心控制权。现在你需要进一步加强对中心的控制。请找出最佳着法。',
              boardSetup: {
                fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 6 }, // g1
                to: { row: 5, col: 5 }    // f3
              },
              correctMessage: '很好！通过Ng1-f3，你不仅发展了骑士，还增强了对中心e5格的控制，同时为王翼易位做准备。',
              errorMessage: '这不是最佳的控制中心的方式。考虑如何发展棋子并控制中心格子。',
              hintMessage: '考虑将骑士移动到f3，这样可以控制中心的e5格并发展棋子。'
            },
            {
              type: 'task',
              message: '黑方继续发展棋子。现在你需要进一步控制中心并发展棋子。请找出最佳着法。',
              boardSetup: {
                fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 5 }, // f1
                to: { row: 4, col: 2 }    // c4
              },
              correctMessage: '出色的控制！通过Bf1-c4，你发展了象，控制了中心的d5格，并对黑方的f7弱点施加压力。',
              errorMessage: '这不是最佳的控制中心的方式。考虑如何发展棋子并控制中心格子。',
              hintMessage: '考虑将象移动到c4，这样可以控制中心的d5格并威胁黑方的f7弱点。'
            },
            {
              type: 'task',
              message: '黑方继续发展棋子。现在你需要完成发展并巩固对中心的控制。请找出最佳着法。',
              boardSetup: {
                fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 4 }, // e1
                to: { row: 7, col: 6 }    // g1
              },
              correctMessage: '非常好！通过王翼易位(O-O)，你保护了王的安全，并将车连接起来，完成了开局阶段的发展，为中局的战斗做好准备。',
              errorMessage: '这不是最佳的控制局面的方式。考虑如何保护王的安全并完成发展。',
              hintMessage: '考虑进行王翼易位(O-O)，这样可以保护王的安全并完成发展。'
            },
            {
              type: 'conclusion',
              message: '恭喜你完成了局面控制的学习！你已经掌握了几个重要的控制原则：1) 在开局阶段控制中心；2) 发展棋子时增强对中心的控制；3) 限制对手的活动空间；4) 完成发展并保证王的安全。这些技巧将帮助你在实战中掌握局面主动权。'
            }
          ]
        },
        'endgame': {
          id: 'endgame',
          title: '残局技巧',
          steps: [
            {
              type: 'intro',
              message: '残局是国际象棋中的最后阶段，通常棋盘上只剩下少量棋子。掌握残局技巧对于将优势转化为胜利至关重要。',
              boardSetup: {
                fen: '8/8/8/8/8/8/4P3/4K1k1 w - - 0 1'
              }
            },
            {
              type: 'task',
              message: '这是一个基本的王和卒对王的残局。白方要想获胜，需要正确地推进卒子。请走出正确的第一步。',
              boardSetup: {
                fen: '8/8/8/8/8/8/4P3/4K1k1 w - - 0 1'
              },
              expectedMove: {
                from: { row: 7, col: 4 }, // e1
                to: { row: 6, col: 4 }    // e2
              },
              correctMessage: '正确！在残局中，王的活动是关键。通过Ke1-e2，你将王移向前方，准备护送卒子前进。',
              errorMessage: '这不是最佳的残局处理方式。在残局中，王应该积极参与战斗。',
              hintMessage: '考虑将王移动到e2，这样可以更好地支持卒子的前进。'
            },
            {
              type: 'task',
              message: '黑方将王移到了f2位置。现在你需要继续推进。请走出最佳着法。',
              boardSetup: {
                fen: '8/8/8/8/8/8/4PK2/5k2 w - - 0 1'
              },
              expectedMove: {
                from: { row: 6, col: 4 }, // e2
                to: { row: 5, col: 4 }    // e3
              },
              correctMessage: '很好！通过e2-e3，你继续推进卒子，同时保持王对卒子的保护。',
              errorMessage: '这不是最佳的残局处理方式。考虑如何安全地推进卒子。',
              hintMessage: '考虑推进e2-e3，这样可以继续向前推进，同时保持王对卒子的保护。'
            },
            {
              type: 'task',
              message: '黑方继续阻挡，将王移到了e1位置。请找出最佳着法。',
              boardSetup: {
                fen: '8/8/8/8/8/4P3/5K2/4k3 w - - 0 1'
              },
              expectedMove: {
                from: { row: 6, col: 5 }, // f2
                to: { row: 5, col: 4 }    // e3
              },
              correctMessage: '出色的残局技巧！通过Kf2-e3，你将王移到了卒子前方，创造了关键的过河卒。',
              errorMessage: '这不是最佳的残局处理方式。考虑如何利用王来支持卒子过河。',
              hintMessage: '考虑将王移动到e3，这样可以支持卒子过河并限制黑王的活动空间。'
            },
            {
              type: 'task',
              message: '黑方将王移到了d1位置。现在是时候推进卒子了。请找出最佳着法。',
              boardSetup: {
                fen: '8/8/8/8/8/4K3/8/3k4 w - - 0 1'
              },
              expectedMove: {
                from: { row: 5, col: 4 }, // e3
                to: { row: 4, col: 4 }    // e4
              },
              correctMessage: '非常好！通过Ke3-e4，你继续向前推进，限制了黑王的活动空间，为后续的卒子升变做好准备。',
              errorMessage: '这不是最佳的残局处理方式。考虑如何继续限制黑王并为卒子升变做准备。',
              hintMessage: '考虑将王移动到e4，这样可以继续限制黑王的活动空间并为卒子升变做准备。'
            },
            {
              type: 'conclusion',
              message: '恭喜你完成了残局技巧的学习！你已经掌握了几个重要的残局原则：1) 在残局中，王应该积极参与战斗；2) 正确地推进卒子是获胜的关键；3) 创造过河卒可以为升变创造条件；4) 限制对手王的活动空间。这些技巧将帮助你在实战中将优势转化为胜利。'
            }
          ]
        }
      },
      
      // 棋盘状态
      boardState: [],
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      currentPlayer: 'white',
      
      // 课程状态
      currentStep: 1,
      totalSteps: 6,
      actionState: 'initial', // initial, retry, next, next-lesson
      showHintBtn: false,
      showCompletionModal: false,
      completionInfo: {
        current: 1,
        total: 1
      },
      
      // 消息状态
      currentMessage: {
        text: '',
        isError: false
      },
      
      // 声音控制
      isSoundOn: true,
      currentRobotAvatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png'
    }
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 根据参数加载对应的课程
    if (options.lesson) {
      const lessonId = options.lesson
      if (this.lessons[lessonId]) {
        this.lessonInfo = this.lessons[lessonId]
        this.totalSteps = this.lessonInfo.steps.length
        
        // 初始化课程
        this.initializeLesson()
      } else {
        uni.showToast({
          title: '课程不存在',
          icon: 'none'
        })
        setTimeout(() => {
          this.goBack()
        }, 1500)
      }
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        this.goBack()
      }, 1500)
    }
  },
  methods: {
    // 初始化课程
    initializeLesson() {
      const step = this.lessonInfo.steps[this.currentStep - 1]
      this.currentMessage.text = step.message
      this.currentMessage.isError = false
      
      // 设置棋盘和初始状态
      this.boardState = this.setupBoard(step.boardSetup)
      
      if (step.type === 'intro') {
        this.actionState = 'next'
      } else if (step.type === 'task') {
        this.actionState = 'initial'
        this.showHintBtn = true
      } else if (step.type === 'conclusion') {
        this.actionState = 'next-lesson'
      }
      
      // 重置选择状态
      this.selectedPosition = null
      this.validMoves = []
      this.lastMove = null
      
      // 输出调试信息
      if (step.expectedMove) {
        console.log('预期移动：', step.expectedMove);
        console.log('预期起始位置棋子：', this.boardState[step.expectedMove.from.row][step.expectedMove.from.col]);
        console.log('预期目标位置棋子：', this.boardState[step.expectedMove.to.row][step.expectedMove.to.col]);
      }
    },
    
    // 设置棋盘
    setupBoard(setup) {
      if (setup.fen) {
        // 从FEN字符串设置棋盘
        return this.fenToBoard(setup.fen)
      }
      return getInitialChessboard()
    },
    
    // FEN转棋盘状态
    fenToBoard(fen) {
      // 解析FEN字符串
      const parts = fen.split(' ');
      const boardPart = parts[0];
      const rows = boardPart.split('/');
      
      // 初始化一个8x8的空棋盘
      const board = Array(8).fill(null).map(() => Array(8).fill(null));
      
      // 填充棋盘
      for (let i = 0; i < 8; i++) {
        let col = 0;
        for (let j = 0; j < rows[i].length; j++) {
          const char = rows[i].charAt(j);
          
          if (!isNaN(parseInt(char))) {
            // 数字代表连续的空格子
            col += parseInt(char);
          } else {
            // 字母代表棋子
            const color = char === char.toUpperCase() ? 'white' : 'black';
            let pieceType = char.toLowerCase();
            
            // 映射棋子类型
            switch (pieceType) {
              case 'p': pieceType = 'pawn'; break;
              case 'r': pieceType = 'rook'; break;
              case 'n': pieceType = 'knight'; break;
              case 'b': pieceType = 'bishop'; break;
              case 'q': pieceType = 'queen'; break;
              case 'k': pieceType = 'king'; break;
            }
            
            board[i][col] = `${color}-${pieceType}`;
            col++;
          }
        }
      }
      
      return board;
    },
    
    // 处理格子点击
    handleCellClick(position) {
      console.log('点击位置：', position, '当前棋子：', this.boardState[position.row][position.col]);
      
      if (this.actionState !== 'initial') return
      
      const step = this.lessonInfo.steps[this.currentStep - 1]
      if (!step.expectedMove) return
      
      if (!this.selectedPosition) {
        // 选择起始位置
        const piece = this.boardState[position.row][position.col]
        if (!piece) return // 如果点击的是空格，直接返回
        
        // 检查是否点击了正确颜色的棋子
        const pieceColor = getPieceColor(piece)
        if (pieceColor !== this.currentPlayer) return
        
        this.selectedPosition = position
        this.validMoves = this.getValidMovesForPosition(position.row, position.col)
      } else {
        // 尝试移动
        const move = {
          from: this.selectedPosition,
          to: position
        }
        
        // 如果点击了同一个位置，取消选择
        if (move.from.row === move.to.row && move.from.col === move.to.col) {
          this.selectedPosition = null
          this.validMoves = []
          return
        }
        
        // 如果点击了相同颜色的棋子，更改选择
        const targetPiece = this.boardState[position.row][position.col]
        if (targetPiece && getPieceColor(targetPiece) === this.currentPlayer) {
          this.selectedPosition = position
          this.validMoves = this.getValidMovesForPosition(position.row, position.col)
          return
        }
        
        // 检查是否是有效的移动
        const isValidMove = this.validMoves.some(validMove => 
          validMove.row === move.to.row && validMove.col === move.to.col
        )
        
        // 执行移动
        this.makeMove(move, isValidMove)
        
        // 重置选择状态
        this.selectedPosition = null
        this.validMoves = []
      }
    },
    
    // 获取有效移动
    getValidMovesForPosition(row, col) {
      const piece = this.boardState[row][col];
      if (!piece) return [];
      
      const pieceType = getPieceType(piece);
      const pieceColor = getPieceColor(piece);
      
      switch (pieceType) {
        case 'pawn':
          return getPawnMoves(this.boardState, row, col, pieceColor);
        case 'rook':
          return getRookMoves(this.boardState, row, col, pieceColor);
        case 'knight':
          return getKnightMoves(this.boardState, row, col, pieceColor);
        case 'bishop':
          return getBishopMoves(this.boardState, row, col, pieceColor);
        case 'queen':
          return getQueenMoves(this.boardState, row, col, pieceColor);
        case 'king':
          return getKingMoves(this.boardState, row, col, pieceColor);
        default:
          return [];
      }
    },
    
    // 执行移动
    makeMove(move, isValidMove) {
      if (!isValidMove) {
        // 如果移动无效，不执行移动，只提示
        this.currentMessage.text = '这不是棋子的有效移动'
        this.currentMessage.isError = true
        return
      }
      
      // 保存目标位置的棋子，以便需要还原时使用
      const targetPiece = this.boardState[move.to.row][move.to.col]
      const sourcePiece = this.boardState[move.from.row][move.from.col]
      
      // 执行移动
      this.boardState[move.to.row][move.to.col] = sourcePiece
      this.boardState[move.from.row][move.from.col] = null
      
      // 记录最后一步移动
      this.lastMove = {
        from: { ...move.from },
        to: { ...move.to }
      }
      
      const step = this.lessonInfo.steps[this.currentStep - 1]
      
      // 检查移动是否正确
      const isCorrect = 
        move.from.row === step.expectedMove.from.row &&
        move.from.col === step.expectedMove.from.col &&
        move.to.row === step.expectedMove.to.row &&
        move.to.col === step.expectedMove.to.col
      
      // 控制台输出移动对比
      console.log('当前移动:', move);
      console.log('预期移动:', step.expectedMove);
      console.log('移动是否正确:', isCorrect);
      
      if (isCorrect) {
        this.currentMessage.text = step.correctMessage
        this.currentMessage.isError = false
        this.actionState = 'next'
      } else {
        // 如果移动错误，恢复棋盘状态
        this.boardState[move.from.row][move.from.col] = sourcePiece
        this.boardState[move.to.row][move.to.col] = targetPiece
        
        this.currentMessage.text = step.errorMessage
        this.currentMessage.isError = true
        this.actionState = 'retry'
        this.showHintBtn = true
      }
    },
    
    // 开始课程
    startLesson() {
      this.lessonStarted = true
      this.actionState = 'initial'
      this.showHintBtn = true
    },
    
    // 重试步骤
    retryStep() {
      const step = this.lessonInfo.steps[this.currentStep - 1]
      this.boardState = this.setupBoard(step.boardSetup)
      this.actionState = 'initial'
      this.selectedPosition = null
      this.validMoves = []
      this.lastMove = null
    },
    
    // 下一步
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++
        this.initializeLesson()
      } else {
        this.showCompletionModal = true
      }
    },
    
    // 下一课
    nextLesson() {
      this.goBack()
    },
    
    // 显示提示
    showHint() {
      const step = this.lessonInfo.steps[this.currentStep - 1]
      this.currentMessage.text = step.hintMessage
      this.currentMessage.isError = false
    },
    
    // 切换声音
    toggleSound() {
      this.isSoundOn = !this.isSoundOn
    },
    
    // 返回
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.lesson-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
}

.chess-board-area {
  position: relative;
  width: 100%;
  padding: 20rpx;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  min-height: 750rpx;
  transform: translateZ(0);
}

/* 课程完成弹窗 */
.lesson-completion-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  
  .modal-content {
    background-color: #212121;
    border-radius: 20rpx;
    padding: 40rpx;
    width: 80%;
    max-width: 600rpx;
    position: relative;
    
    .close-btn {
      position: absolute;
      right: 20rpx;
      top: 20rpx;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .iconfont {
        color: #ffffff;
        font-size: 40rpx;
      }
    }
    
    .completion-title {
      color: #ffffff;
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 30rpx;
      text-align: center;
    }
    
    .medal-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 30rpx;
      
      image {
        width: 150rpx;
        height: 150rpx;
      }
    }
    
    .progress-text {
      color: #ffffff;
      font-size: 32rpx;
      margin-bottom: 30rpx;
      text-align: center;
    }
    
    .continue-btn {
      background-color: #8BC34A;
      border-radius: 40rpx;
      padding: 20rpx;
      text-align: center;
      
      text {
        color: #ffffff;
        font-size: 32rpx;
      }
    }
  }
}

/* 教学卡片区域 */
.teaching-card {
  background-color: rgba(33, 33, 33, 0.9);
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  margin: 0rpx 20rpx;
  flex: 1;
  z-index: 10;
}

/* 卡片标题区 */
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  .back-btn, .sound-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      color: #ffffff;
      font-size: 40rpx;
    }
  }
  
  .title {
    flex: 1;
    text-align: center;
    
    text {
      color: #ffffff;
      font-size: 36rpx;
      font-weight: bold;
    }
  }
}

/* 教练指导区 */
.coach-guidance {
  display: flex;
  align-items: flex-start;
  margin: 45rpx auto;
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    margin-right: 20rpx;
    
    image {
      width: 100%;
      height: 100%;
      border-radius: 40rpx;
    }
  }
  
  .message-bubble {
    flex: 1;
    background-color: #4A4A4A;
    border-radius: 20rpx;
    padding: 30rpx;
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      left: -15rpx;
      top: 20rpx;
      border-width: 10rpx;
      border-style: solid;
      border-color: transparent #4A4A4A transparent transparent;
    }
    
    text {
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
      line-height: 1.4;
    }
    
    &.error-message {
      background-color: rgba(229, 57, 53, 0.8);
      
      &:before {
        border-color: transparent rgba(229, 57, 53, 0.8) transparent transparent;
      }
    }
  }
}

/* 进度条区域 */
.progress-section {
  margin: 30rpx auto;
  
  .progress-text {
    color: #ffffff;
    font-size: 28rpx;
    font-weight: bold;
    padding: 10rpx 20rpx;
    margin-bottom: 10rpx;
  }
  
  .progress-bar {
    height: 15rpx;
    margin: 10rpx 0rpx;
    background-color: rgba(74, 74, 74, 0.5);
    border-radius: 10rpx;
    overflow: hidden;
    position: relative;
    
    .progress-fill {
      height: 100%;
      background-color: #8BC34A;
      border-radius: 10rpx;
      transition: width 0.5s ease;
    }
  }
}

/* 按钮区域 */
.button-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  gap: 20rpx;
  
  .hint-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10rpx;
    padding: 20rpx 40rpx;
    flex: 1;
    max-width: 200rpx;
    
    .iconfont {
      color: #ffffff;
      font-size: 32rpx;
      margin-right: 10rpx;
    }
    
    text {
      color: #ffffff;
      font-size: 32rpx;
    }
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rpx;
    padding: 20rpx 30rpx;
    flex: 2;
    
    text {
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .iconfont {
      margin-left: 10rpx;
    }
  }
  
  .primary-btn {
    background-color: #8BC34A;
    
    text {
      color: #ffffff;
    }
  }
  
  .error-btn {
    background-color: rgba(229, 57, 53, 0.8);
    
    text {
      color: #ffffff;
    }
  }
}
</style>