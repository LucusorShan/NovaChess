<template>
  <view class="rules-container">
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
        
        <view v-if="actionState === 'initial'" class="action-btn primary-btn" @click="startLesson">
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

export default {
  components: {
    ChessBoard,
    TopSpacing,
    TabBar
  },
  data() {
    return {
      statusBarHeight: 0,
      // 课程信息
      lessonInfo: {
        id: 'king-moves',
        title: '国王的移动',
        steps: [
          {
            type: 'intro',
            message: '国王是棋盘上最重要的棋子。如果你的国王被将军且无法脱离，你就输掉了比赛！让我们来学习国王的走法。',
            boardSetup: {
              // 清空棋盘，只放置需要的棋子
              clear: true,
              pieces: [
                { piece: 'white-king', position: { row: 4, col: 4 } }
              ]
            }
          },
          {
            type: 'task',
            message: '国王可以沿任何方向移动一格。请将国王从e4移动到f4（向右一格）。',
            expectedMove: {
              from: { row: 4, col: 4 },
              to: { row: 4, col: 5 }
            },
            correctMessage: 'Kf4 是正确的！国王可以向任何方向移动一格。',
            errorMessage: '不正确，国王只能移动一格。请尝试将国王从e4移动到f4（向右）。',
            hintMessage: '点击国王，然后点击右侧的f4格子。'
          },
          {
            type: 'task',
            message: '现在，请将国王从f4移动到f3（向下一格）。',
            expectedMove: {
              from: { row: 4, col: 5 },
              to: { row: 5, col: 5 }
            },
            correctMessage: 'Kf3 是正确的！国王可以垂直移动一格。',
            errorMessage: '不正确，请尝试将国王向下移动到f3位置。',
            hintMessage: '点击国王，然后点击下方的f3格子。'
          },
          {
            type: 'task',
            message: '接下来，请将国王从f3移动到e2（沿对角线移动）。',
            expectedMove: {
              from: { row: 5, col: 5 },
              to: { row: 6, col: 4 }
            },
            correctMessage: 'Ke2 是正确的！国王可以沿对角线移动一格。',
            errorMessage: '不正确，请尝试将国王沿对角线移动到e2位置。',
            hintMessage: '点击国王，然后点击左下方的e2格子。'
          },
          {
            type: 'task',
            message: '最后，请将国王从e2移动到d3（沿另一个对角线移动）。',
            expectedMove: {
              from: { row: 6, col: 4 },
              to: { row: 5, col: 3 }
            },
            correctMessage: 'Kd3 是正确的！国王可以向任何方向移动一格。',
            errorMessage: '不正确，请尝试将国王沿对角线移动到d3位置。',
            hintMessage: '点击国王，然后点击左上方的d3格子。'
          },
          {
            type: 'conclusion',
            message: '恭喜！你已经掌握了国王的走法。国王可以沿任何方向移动一格，包括水平、垂直和对角线方向。记住，保护你的国王是最重要的，因为一旦国王被将军且无法脱离，游戏就结束了！'
          }
        ]
      },
      
      // 所有可用的课程
      lessons: {
        'king-moves': {
          id: 'king-moves',
          title: '国王的移动',
          steps: [
            {
              type: 'intro',
              message: '国王是棋盘上最重要的棋子。如果你的国王被将军且无法脱离，你就输掉了比赛！让我们来学习国王的走法。',
              boardSetup: {
                // 清空棋盘，只放置需要的棋子
                clear: true,
                pieces: [
                  { piece: 'white-king', position: { row: 4, col: 4 } }
                ]
              }
            },
            {
              type: 'task',
              message: '国王可以沿任何方向移动一格。请将国王从e4移动到f4（向右一格）。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 4, col: 5 }
              },
              correctMessage: 'Kf4 是正确的！国王可以向任何方向移动一格。',
              errorMessage: '不正确，国王只能移动一格。请尝试将国王从e4移动到f4（向右）。',
              hintMessage: '点击国王，然后点击右侧的f4格子。'
            },
            {
              type: 'task',
              message: '现在，请将国王从f4移动到f3（向下一格）。',
              expectedMove: {
                from: { row: 4, col: 5 },
                to: { row: 5, col: 5 }
              },
              correctMessage: 'Kf3 是正确的！国王可以垂直移动一格。',
              errorMessage: '不正确，请尝试将国王向下移动到f3位置。',
              hintMessage: '点击国王，然后点击下方的f3格子。'
            },
            {
              type: 'task',
              message: '接下来，请将国王从f3移动到e2（沿对角线移动）。',
              expectedMove: {
                from: { row: 5, col: 5 },
                to: { row: 6, col: 4 }
              },
              correctMessage: 'Ke2 是正确的！国王可以沿对角线移动一格。',
              errorMessage: '不正确，请尝试将国王沿对角线移动到e2位置。',
              hintMessage: '点击国王，然后点击左下方的e2格子。'
            },
            {
              type: 'task',
              message: '最后，请将国王从e2移动到d3（沿另一个对角线移动）。',
              expectedMove: {
                from: { row: 6, col: 4 },
                to: { row: 5, col: 3 }
              },
              correctMessage: 'Kd3 是正确的！国王可以向任何方向移动一格。',
              errorMessage: '不正确，请尝试将国王沿对角线移动到d3位置。',
              hintMessage: '点击国王，然后点击左上方的d3格子。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经掌握了国王的走法。国王可以沿任何方向移动一格，包括水平、垂直和对角线方向。记住，保护你的国王是最重要的，因为一旦国王被将军且无法脱离，游戏就结束了！'
            }
          ]
        },
        'queen-moves': {
          id: 'queen-moves',
          title: '皇后的移动',
          steps: [
            {
              type: 'intro',
              message: '皇后是棋盘上最强大的棋子。它结合了车和象的走法，可以沿着任何直线方向移动任意格数。',
              boardSetup: {
                // 清空棋盘，只放置需要的棋子
                clear: true,
                pieces: [
                  { piece: 'white-queen', position: { row: 4, col: 4 } }
                ]
              }
            },
            {
              type: 'task',
              message: '皇后可以沿直线移动任意格数。请将皇后从e4移动到e8（向上四格）。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 0, col: 4 }
              },
              correctMessage: 'Qe8 是正确的！皇后可以垂直移动任意格数。',
              errorMessage: '不正确，请尝试将皇后垂直向上移动到e8位置。',
              hintMessage: '点击皇后，然后点击上方的e8格子。'
            },
            {
              type: 'task',
              message: '现在，请将皇后从e8移动到a8（向左四格）。',
              expectedMove: {
                from: { row: 0, col: 4 },
                to: { row: 0, col: 0 }
              },
              correctMessage: 'Qa8 是正确的！皇后可以水平移动任意格数。',
              errorMessage: '不正确，请尝试将皇后水平向左移动到a8位置。',
              hintMessage: '点击皇后，然后点击左侧的a8格子。'
            },
            {
              type: 'task',
              message: '接下来，请将皇后从a8移动到h1（沿对角线移动）。',
              expectedMove: {
                from: { row: 0, col: 0 },
                to: { row: 7, col: 7 }
              },
              correctMessage: 'Qh1 是正确的！皇后可以沿对角线移动任意格数。',
              errorMessage: '不正确，请尝试将皇后沿对角线移动到h1位置。',
              hintMessage: '点击皇后，然后点击右下角的h1格子。'
            },
            {
              type: 'task',
              message: '最后，请将皇后从h1移动到a1（水平移动）。',
              expectedMove: {
                from: { row: 7, col: 7 },
                to: { row: 7, col: 0 }
              },
              correctMessage: 'Qa1 是正确的！你已经掌握了皇后的各种移动方式。',
              errorMessage: '不正确，请尝试将皇后水平向左移动到a1位置。',
              hintMessage: '点击皇后，然后点击左侧的a1格子。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经掌握了皇后的走法。皇后可以沿任何直线方向（水平、垂直和对角线）移动任意格数，结合了车和象的能力。皇后是棋盘上最强大的棋子，善用它可以给对手带来巨大压力！'
            }
          ]
        },
        'rook-moves': {
          id: 'rook-moves',
          title: '车的移动',
          steps: [
            {
              type: 'intro',
              message: '车是一个强大的棋子，可以沿着横行和直列移动任意格数。战局开始时，每方有两个车，位于棋盘的四个角上。',
              boardSetup: {
                // 清空棋盘，只放置需要的棋子
                clear: true, 
                pieces: [
                  { piece: 'white-rook', position: { row: 4, col: 4 } }
                ]
              }
            },
            {
              type: 'task',
              message: '车可以沿直线水平或垂直移动任意格数。请将车从e4移动到e8（向上四格）。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 0, col: 4 }
              },
              correctMessage: 'Re8 是正确的！车可以垂直移动任意格数。',
              errorMessage: '不正确，车只能沿直线水平或垂直移动。请尝试将车从e4移动到e8。',
              hintMessage: '点击车，然后点击上方的e8格子。'
            },
            {
              type: 'task',
              message: '现在，请将车从e8移动到a8（水平向左移动）。',
              expectedMove: {
                from: { row: 0, col: 4 },
                to: { row: 0, col: 0 }
              },
              correctMessage: 'Ra8 是正确的！车可以水平移动任意格数。',
              errorMessage: '不正确，请尝试将车水平向左移动到a8位置。',
              hintMessage: '点击车，然后点击左侧的a8格子。'
            },
            {
              type: 'task',
              message: '最后，请将车从a8移动到a1（向下七格）。',
              expectedMove: {
                from: { row: 0, col: 0 },
                to: { row: 7, col: 0 }
              },
              correctMessage: 'Ra1 是正确的！车可以垂直移动任意格数，甚至穿越整个棋盘。',
              errorMessage: '不正确，请尝试将车垂直向下移动到a1位置。',
              hintMessage: '点击车，然后点击下方的a1格子。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经掌握了车的走法。车可以沿直线水平或垂直移动任意格数，但不能穿过其他棋子。车是非常强大的棋子，价值约为五个兵，尤其在开阔的局面中能发挥重要作用。'
            }
          ]
        },
        'bishop-moves': {
          id: 'bishop-moves',
          title: '相的移动',
          steps: [
            {
              type: 'intro',
              message: '相（象）是一个强大的棋子，可以沿着对角线移动任意格数。每方有两个相，一个走白格，一个走黑格。',
              boardSetup: {
                // 清空棋盘，只放置需要的棋子
                clear: true,
                pieces: [
                  { piece: 'white-bishop', position: { row: 4, col: 4 } }
                ]
              }
            },
            {
              type: 'task',
              message: '相只能沿对角线移动。请将相从e4移动到h7（右上对角线）。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 1, col: 7 }
              },
              correctMessage: 'Bh7 是正确的！相可以沿对角线移动任意格数。',
              errorMessage: '不正确，相只能沿对角线移动。请尝试将相从e4移动到h7。',
              hintMessage: '点击相，然后点击右上对角线的h7格子。'
            },
            {
              type: 'task',
              message: '现在，请将相从h7移动到a7（水平对角线移动）。',
              expectedMove: {
                from: { row: 1, col: 7 },
                to: { row: 1, col: 0 }
              },
              correctMessage: 'Ba7 是正确的！相可以在对角线上改变方向。',
              errorMessage: '不正确，请尝试将相沿对角线移动到a7位置。',
              hintMessage: '点击相，然后点击左侧的a7格子，沿对角线移动。'
            },
            {
              type: 'task',
              message: '最后，请将相从a7移动到h7（再次水平对角线移动）。',
              expectedMove: {
                from: { row: 1, col: 0 },
                to: { row: 1, col: 7 }
              },
              correctMessage: 'Bh7 是正确的！相可以沿对角线在棋盘上移动。',
              errorMessage: '不正确，请尝试将相沿对角线移动到h7位置。',
              hintMessage: '点击相，然后点击右侧的h7格子，沿对角线移动。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经掌握了相的走法。相只能沿对角线移动任意格数，但不能穿过其他棋子。每个相只能访问棋盘上一种颜色的格子。相的价值约为三个兵，在开阔的局面中特别有效。'
            }
          ]
        },
        'knight-moves': {
          id: 'knight-moves',
          title: '马的移动',
          steps: [
            {
              type: 'intro',
              message: '马有非常独特的走法，是唯一可以跳过其他棋子的棋子。马的走法形状像字母"L"。',
              boardSetup: {
                // 清空棋盘，只放置需要的棋子
                clear: true,
                pieces: [
                  { piece: 'white-knight', position: { row: 4, col: 4 } }
                ]
              }
            },
            {
              type: 'task',
              message: '马移动的方式是：先沿一个方向走两格，然后垂直转向走一格，形成"L"形。请将马从e4移动到f6。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 2, col: 5 }
              },
              correctMessage: 'Nf6 是正确的！马的走法形成了"L"形。',
              errorMessage: '不正确，马的走法是先沿一个方向走两格，然后垂直转向走一格。请尝试将马从e4移动到f6。',
              hintMessage: '点击马，然后点击右上方的f6格子，形成"L"形移动。'
            },
            {
              type: 'task',
              message: '马有多种可能的移动方向。现在，请将马从f6移动到h5。',
              expectedMove: {
                from: { row: 2, col: 5 },
                to: { row: 3, col: 7 }
              },
              correctMessage: 'Nh5 是正确的！马可以向不同方向移动，只要保持"L"形走法。',
              errorMessage: '不正确，请尝试将马按"L"形走法移动到h5位置。',
              hintMessage: '点击马，然后点击右侧的h5格子，形成"L"形移动。'
            },
            {
              type: 'task',
              message: '接下来，请将马从h5移动到f4。',
              expectedMove: {
                from: { row: 3, col: 7 },
                to: { row: 4, col: 5 }
              },
              correctMessage: 'Nf4 是正确的！马可以在棋盘上灵活移动。',
              errorMessage: '不正确，请尝试将马按"L"形走法移动到f4位置。',
              hintMessage: '点击马，然后点击左下方的f4格子，形成"L"形移动。'
            },
            {
              type: 'task',
              message: '最后，请将马从f4移动到d3。',
              expectedMove: {
                from: { row: 4, col: 5 },
                to: { row: 5, col: 3 }
              },
              correctMessage: 'Nd3 是正确的！马可以向任何方向移动，只要符合"L"形走法。',
              errorMessage: '不正确，请尝试将马按"L"形走法移动到d3位置。',
              hintMessage: '点击马，然后点击左下方的d3格子，形成"L"形移动。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经掌握了马的走法。马移动的方式是先沿一个方向走两格，然后垂直转向走一格，形成"L"形。马是唯一可以跳过其他棋子的棋子，这使它在拥挤的局面中非常有价值。马的价值约为三个兵。'
            }
          ]
        },
        'pawn-moves': {
          id: 'pawn-moves',
          title: '兵的移动',
          steps: [
            {
              type: 'intro',
              message: '兵是唯一一种向前移动但吃子方向与移动方向不同的棋子。虽然单个兵的力量不大，但它们一起组成了棋盘上的第一道防线。',
              boardSetup: {
                // 清空棋盘，放置需要的棋子
                clear: true,
                pieces: [
                  { piece: 'white-pawn', position: { row: 6, col: 4 } },
                  { piece: 'black-pawn', position: { row: 3, col: 3 } },
                  { piece: 'black-pawn', position: { row: 3, col: 5 } }
                ]
              }
            },
            {
              type: 'task',
              message: '兵通常向前移动一格。请将兵从e2移动到e3。',
              expectedMove: {
                from: { row: 6, col: 4 },
                to: { row: 5, col: 4 }
              },
              correctMessage: 'e3 是正确的！兵可以向前移动一格。',
              errorMessage: '不正确，兵只能向前移动。请尝试将兵从e2移动到e3。',
              hintMessage: '点击兵，然后点击上方的e3格子。'
            },
            {
              type: 'task',
              message: '当兵还在初始位置时，它可以选择向前移动一格或两格。让我们重置棋盘，请将新的兵从e2移动到e4（向前两格）。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-pawn', position: { row: 6, col: 4 } },
                  { piece: 'black-pawn', position: { row: 3, col: 3 } },
                  { piece: 'black-pawn', position: { row: 3, col: 5 } }
                ]
              },
              expectedMove: {
                from: { row: 6, col: 4 },
                to: { row: 4, col: 4 }
              },
              correctMessage: 'e4 是正确的！兵在初始位置时可以向前移动两格。',
              errorMessage: '不正确，请尝试将兵从e2直接移动到e4（向前两格）。',
              hintMessage: '点击兵，然后点击向前两格的e4位置。'
            },
            {
              type: 'task',
              message: '兵吃子的方向是沿对角线向前。请将兵从e4吃掉d5位置的黑兵。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 3, col: 3 }
              },
              correctMessage: '吃子成功！兵沿对角线向前吃子。',
              errorMessage: '不正确，兵吃子时沿对角线向前移动。请将兵从e4移动到d5吃掉黑兵。',
              hintMessage: '点击白兵，然后点击左上方d5位置的黑兵。'
            },
            {
              type: 'task',
              message: '现在，请将白兵从d5位置移动到d4。',
              expectedMove: {
                from: { row: 3, col: 3 },
                to: { row: 4, col: 3 }
              },
              correctMessage: '不对哦，兵只能向前移动，不能向后移动。',
              errorMessage: '不正确，兵不能向后移动。',
              hintMessage: '兵只能向前移动，不能向后移动。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经学会了兵的基本走法。兵只能向前移动，通常一次一格，但在初始位置可以选择移动两格。兵吃子时沿对角线向前移动，并且不能向后移动。当兵到达对方底线时，它可以升变为更强大的棋子（通常是皇后）。'
            }
          ]
        },
        'en-passant': {
          id: 'en-passant',
          title: '吃过路兵',
          steps: [
            {
              type: 'intro',
              message: '吃过路兵是国际象棋中一种特殊的吃子方式，它只适用于兵。当对方的兵从初始位置直接移动两格，并且落在你的兵旁边时，你可以选择吃掉这个"过路"的兵。',
              boardSetup: {
                // 清空棋盘，放置特定位置的棋子
                clear: true,
                pieces: [
                  { piece: 'white-pawn', position: { row: 3, col: 4 } }, // 白兵在e5位置
                  { piece: 'black-pawn', position: { row: 1, col: 3 } }, // 黑兵在d7位置
                  { piece: 'black-pawn', position: { row: 1, col: 5 } }  // 黑兵在f7位置
                ]
              }
            },
            {
              type: 'task',
              message: '首先，让我们移动黑方的兵。请将d7位置的黑兵移动到d5（向前两格）。',
              expectedMove: {
                from: { row: 1, col: 3 },
                to: { row: 3, col: 3 }
              },
              correctMessage: 'd5 是正确的！黑兵已经从初始位置向前移动了两格。',
              errorMessage: '不正确，请将d7位置的黑兵移动到d5（向前两格）。',
              hintMessage: '点击d7位置的黑兵，然后点击d5位置。'
            },
            {
              type: 'task',
              message: '现在白方可以执行吃过路兵。当一个兵从初始位置移动两格并落在你的兵旁边时，你可以选择吃掉这个"过路"的兵，就像它只移动了一格一样。请将白兵从e5移动到d6位置执行吃过路兵。',
              expectedMove: {
                from: { row: 3, col: 4 },
                to: { row: 2, col: 3 }
              },
              correctMessage: '吃过路兵成功！白兵已经吃掉了黑兵。',
              errorMessage: '不正确，请将白兵从e5移动到d6位置吃掉黑兵。',
              hintMessage: '点击e5位置的白兵，然后点击d6位置进行吃过路兵。'
            },
            {
              type: 'task',
              message: '让我们再来一次。首先，请将f7位置的黑兵移动到f5（向前两格）。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-pawn', position: { row: 3, col: 4 } }, // 白兵在e5位置
                  { piece: 'black-pawn', position: { row: 1, col: 5 } }  // 黑兵在f7位置
                ]
              },
              expectedMove: {
                from: { row: 1, col: 5 },
                to: { row: 3, col: 5 }
              },
              correctMessage: 'f5 是正确的！黑兵已经从初始位置向前移动了两格。',
              errorMessage: '不正确，请将f7位置的黑兵移动到f5（向前两格）。',
              hintMessage: '点击f7位置的黑兵，然后点击f5位置。'
            },
            {
              type: 'task',
              message: '现在，请将白兵从e5移动到f6位置执行吃过路兵。',
              expectedMove: {
                from: { row: 3, col: 4 },
                to: { row: 2, col: 5 }
              },
              correctMessage: '吃过路兵成功！白兵已经吃掉了黑兵。记住，吃过路兵必须在对方兵移动后立即执行，否则就失去了这个机会。',
              errorMessage: '不正确，请将白兵从e5移动到f6位置吃掉黑兵。',
              hintMessage: '点击e5位置的白兵，然后点击f6位置进行吃过路兵。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经学会了吃过路兵的规则。吃过路兵是国际象棋中一种特殊的吃子方式，只适用于兵。当对方的兵从初始位置直接移动两格，并且落在你的兵旁边时，你可以选择吃掉这个"过路"的兵，就像它只移动了一格一样。记住，吃过路兵必须在对方兵移动后立即执行，否则就失去了这个机会。'
            }
          ]
        },
        'castling': {
          id: 'castling',
          title: '王车易位',
          steps: [
            {
              type: 'intro',
              message: '王车易位是国际象棋中一种特殊的走法，它让你可以同时移动国王和车。这是国际象棋中唯一一种可以在一步中移动两个棋子的方法，主要用于加强国王的安全性。',
              boardSetup: {
                // 清空棋盘，放置特定位置的棋子
                clear: true,
                pieces: [
                  { piece: 'white-king', position: { row: 7, col: 4 } }, // 白王在e1位置
                  { piece: 'white-rook', position: { row: 7, col: 0 } }, // 白车在a1位置
                  { piece: 'white-rook', position: { row: 7, col: 7 } }  // 白车在h1位置
                ]
              }
            },
            {
              type: 'task',
              message: '王车易位有两种：短易位和长易位。短易位是王向车方向移动两格，车跳到王的另一侧。请执行短易位，将王从e1移动到g1，车从h1移动到f1。',
              expectedMove: {
                from: { row: 7, col: 4 },
                to: { row: 7, col: 6 }
              },
              correctMessage: '短易位成功！国王移动到了g1，车移动到了f1。',
              errorMessage: '不正确，请将国王从e1移动到g1执行短易位。',
              hintMessage: '点击e1位置的国王，然后点击g1位置执行短易位。'
            },
            {
              type: 'task',
              message: '现在让我们来学习长易位。长易位是王向后车方向移动两格，车跳到王的另一侧。请重置棋盘，执行长易位，将王从e1移动到c1，车从a1移动到d1。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-king', position: { row: 7, col: 4 } }, // 白王在e1位置
                  { piece: 'white-rook', position: { row: 7, col: 0 } }, // 白车在a1位置
                  { piece: 'white-rook', position: { row: 7, col: 7 } }  // 白车在h1位置
                ]
              },
              expectedMove: {
                from: { row: 7, col: 4 },
                to: { row: 7, col: 2 }
              },
              correctMessage: '长易位成功！国王移动到了c1，车移动到了d1。',
              errorMessage: '不正确，请将国王从e1移动到c1执行长易位。',
              hintMessage: '点击e1位置的国王，然后点击c1位置执行长易位。'
            },
            {
              type: 'task',
              message: '王车易位有几个条件：1. 国王和参与易位的车之前都没有移动过；2. 国王和车之间没有其他棋子；3. 国王没有被将军；4. 国王经过和到达的格子都不在对方的攻击范围内。让我们添加一个棋子阻碍易位。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-king', position: { row: 7, col: 4 } }, // 白王在e1位置
                  { piece: 'white-rook', position: { row: 7, col: 0 } }, // 白车在a1位置
                  { piece: 'white-bishop', position: { row: 7, col: 1 } } // 白相在b1位置，阻碍长易位
                ]
              },
              expectedMove: {
                from: { row: 7, col: 4 },
                to: { row: 7, col: 2 }
              },
              correctMessage: '无法执行长易位！因为国王和车之间有其他棋子（b1位置的相）。',
              errorMessage: '当国王和车之间有其他棋子时，不能执行王车易位。',
              hintMessage: '国王和车之间有其他棋子（b1位置的相），所以不能执行王车易位。'
            },
            {
              type: 'conclusion',
              message: '恭喜！你已经学习了王车易位的规则。王车易位是国际象棋中一种特殊的走法，可以同时移动国王和车，有短易位（王向右移两格）和长易位（王向左移两格）两种形式。记住王车易位的条件：1. 国王和参与易位的车之前都没有移动过；2. 国王和车之间没有其他棋子；3. 国王没有被将军；4. 国王经过和到达的格子都不在对方的攻击范围内。'
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
      
      // 课程进度
      currentStep: 0,
      totalSteps: 0,
      actionState: 'initial', // initial, retry, next, next-lesson
      showHintBtn: false,
      
      // 消息状态
      messages: [],
      currentMessage: { text: '', isError: false },
      
      // 机器人头像
      normalRobotAvatar: 'https://pic1.imgdb.cn/item/67f3eb4ce381c3632beea0b4.png',
      errorRobotAvatar: 'https://pic1.imgdb.cn/item/67f3eb4ce381c3632beea0b4.png',
      currentRobotAvatar: 'https://pic1.imgdb.cn/item/67f3eb4ce381c3632beea0b4.png',
      // 课程完成状态
      showCompletionModal: false,
      completionInfo: {
        current: 1,
        total: 8
      },
      
      // 声音控制
      isSoundOn: true,
      audioContext: null,

      completedLessons: {
        'king-moves': false,
        'queen-moves': false,
        'rook-moves': false, 
        'bishop-moves': false,
        'knight-moves': false,
        'pawn-moves': false,
        'en-passant': false,
        'castling': false
      }
    }
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 获取传入的课程ID
    if (options.lesson) {
      this.loadLesson(options.lesson);
    }
  },
  created() {
    // 初始化棋盘
    this.initBoard();
    
    // 设置总步骤数
    this.totalSteps = this.countTotalSteps();
    
    // 显示初始消息
    this.showInitialMessage();
    
    // 初始化音频上下文
    this.initAudioContext();
  },
  methods: {
    // 加载指定课程
    loadLesson(lessonId) {
      if (this.lessons[lessonId]) {
        this.lessonInfo = this.lessons[lessonId];
        
        // 重新初始化
        this.initBoard();
        this.totalSteps = this.countTotalSteps();
        this.currentStep = 0;
        this.showInitialMessage();
      } else {
        // 如果找不到课程，显示提示
        uni.showToast({
          title: '课程不存在',
          icon: 'none'
        });
        
        // 返回列表页
        setTimeout(() => {
          this.goBack();
        }, 1500);
      }
    },
    
    // 初始化棋盘
    initBoard() {
      // 创建空棋盘
      this.boardState = getInitialChessboard();
      
      const initialStep = this.lessonInfo.steps[0];
      const boardSetup = initialStep?.boardSetup || {};
      
      // 如果需要清空棋盘
      if (boardSetup.clear) {
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            this.boardState[row][col] = null;
          }
        }
      }
      
      // 如果有指定的棋子，放置它们
      if (boardSetup.pieces) {
        boardSetup.pieces.forEach(item => {
          this.boardState[item.position.row][item.position.col] = item.piece;
        });
      }
      
      // 如果不使用初始棋盘布局，而是只放置指定的棋子
      if (!boardSetup.useInitialSetup && !boardSetup.pieces && boardSetup.clear !== false) {
        // 清空棋盘
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            this.boardState[row][col] = null;
          }
        }
      }
    },
    
    // 初始化音频上下文
    initAudioContext() {
      this.audioContext = uni.createInnerAudioContext();
      this.audioContext.src = '/static/audio/move.mp3'; // 默认音效
      this.audioContext.autoplay = false;
    },
    
    // 切换声音开关
    toggleSound() {
      this.isSoundOn = !this.isSoundOn;
      
      // 提示用户声音状态已更改
      uni.showToast({
        title: this.isSoundOn ? '声音已开启' : '声音已关闭',
        icon: 'none',
        duration: 1500
      });
    },
    
    // 播放音效
    playSound(type = 'move') {
      if (!this.isSoundOn) return;
      
      const soundMap = {
        move: '/static/audio/move.mp3',
        correct: '/static/audio/correct.mp3',
        error: '/static/audio/error.mp3',
        complete: '/static/audio/complete.mp3'
      };
      
      this.audioContext.src = soundMap[type] || soundMap.move;
      this.audioContext.play();
    },
    
    // 计算总步骤数
    countTotalSteps() {
      return this.lessonInfo.steps.filter(step => step.type === 'task').length;
    },
    
    // 显示初始消息
    showInitialMessage() {
      const initialStep = this.lessonInfo.steps[0];
      this.currentMessage = {
        text: initialStep.message,
        isError: false
      };
      this.actionState = 'initial';
      this.currentRobotAvatar = this.normalRobotAvatar;
    },
    
    // 开始课程
    startLesson() {
      this.playSound('move');
      this.goToNextTaskStep();
    },
    
    // 前往下一个任务步骤
    goToNextTaskStep() {
      // 找到下一个任务类型的步骤
      let nextStepIndex = -1;
      let taskCount = 0;
      
      for (let i = 0; i < this.lessonInfo.steps.length; i++) {
        const step = this.lessonInfo.steps[i];
        if (step.type === 'task') {
          taskCount++;
          if (taskCount > this.currentStep) {
          nextStepIndex = i;
          break;
          }
        }
      }
      
      // 如果找到了下一步
      if (nextStepIndex !== -1) {
        const nextStep = this.lessonInfo.steps[nextStepIndex];
        this.currentMessage = {
          text: nextStep.message,
          isError: false
        };
        this.currentRobotAvatar = this.normalRobotAvatar;
        this.actionState = ''; // 清除按钮状态，让用户操作棋盘
        this.showHintBtn = true;
      } else {
        // 如果没有更多任务，显示结论
        this.showConclusion();
      }
    },
    
    // 显示结论
    showConclusion() {
      // 查找结论步骤
      const conclusionStep = this.lessonInfo.steps.find(step => step.type === 'conclusion');
      
      if (conclusionStep) {
        this.currentMessage = {
          text: conclusionStep.message,
          isError: false
        };
        this.currentRobotAvatar = this.normalRobotAvatar;
        this.actionState = 'next-lesson';
        this.showHintBtn = false;
      }
      
      // 播放完成音效
      this.playSound('complete');
      
      // 更新课程完成信息
      this.updateCompletionInfo();
      
      // 显示课程完成弹窗
      setTimeout(() => {
        this.showCompletionModal = true;
      }, 1500);
    },
    
    // 更新课程完成信息
    updateCompletionInfo() {
      // 这里可以添加逻辑来更新课程完成信息
      // 例如，根据当前课程ID，更新completionInfo
      const currentIndex = Object.keys(this.lessons).indexOf(this.lessonInfo.id);
      const totalLessons = Object.keys(this.lessons).length;
      
      if (currentIndex !== -1) {
        this.completionInfo.current = currentIndex + 1;
        this.completionInfo.total = totalLessons;
      }
      
      // 将完成状态存储到本地
      try {
        uni.setStorageSync(`lesson_${this.lessonInfo.id}_completed`, true);
      } catch (e) {
        console.error('保存课程完成状态失败', e);
      }
    },
    
    // 计算已完成的任务数
    countTasksCompleted() {
      let taskCount = 0;
      for (const step of this.lessonInfo.steps) {
        if (step.type === 'task') {
          taskCount++;
        }
      }
      
      return Math.min(this.currentStep, taskCount);
    },
    
    // 处理棋子移动
    handleCellClick(position) {
      // 如果正在显示初始消息或结论，不处理棋子移动
      if (this.actionState === 'initial' || this.actionState === 'next-lesson') {
        return;
      }
      
      // 如果已经选择了一个棋子，尝试移动
      if (this.selectedPosition) {
        // 如果点击了相同位置，取消选择
        if (this.selectedPosition.row === position.row && this.selectedPosition.col === position.col) {
          this.selectedPosition = null;
          this.validMoves = [];
          return;
        }
        
        // 检查是否是有效移动
        const isValidMove = this.validMoves.some(
          move => move.row === position.row && move.col === position.col
        );
        
        if (isValidMove) {
          this.movePiece(this.selectedPosition, position);
        } else {
          // 如果点击了其他有效位置（棋子），选择该棋子
          const clickedPiece = this.boardState[position.row][position.col];
          if (clickedPiece && getPieceColor(clickedPiece) === this.currentPlayer) {
            this.selectPiece(position);
          }
        }
      } else {
        // 如果没有选择棋子，检查点击位置是否有棋子
        const clickedPiece = this.boardState[position.row][position.col];
        if (clickedPiece && getPieceColor(clickedPiece) === this.currentPlayer) {
          this.selectPiece(position);
        }
      }
    },
    
    // 选择棋子
    selectPiece(position) {
      this.selectedPosition = position;
      this.validMoves = getValidMoves(this.boardState, position.row, position.col);
      this.playSound('move');
    },
    
    // 移动棋子
    movePiece(from, to) {
      // 获取当前活动步骤
      const activeTaskIndex = this.findActiveTaskIndex();
      if (activeTaskIndex === -1) return;
      
      const activeTask = this.lessonInfo.steps[activeTaskIndex];
      
      // 检查是否是期望的移动
      const isExpectedMove = 
        from.row === activeTask.expectedMove.from.row && 
        from.col === activeTask.expectedMove.from.col && 
        to.row === activeTask.expectedMove.to.row && 
        to.col === activeTask.expectedMove.to.col;
      
      if (isExpectedMove) {
        // 执行移动
        const piece = this.boardState[from.row][from.col];
        this.boardState[to.row][to.col] = piece;
        this.boardState[from.row][from.col] = null;
        
        // 更新最后移动
        this.lastMove = { from, to };
        
        // 播放正确音效
        this.playSound('correct');
        
        // 更新UI状态
        this.currentMessage = {
          text: activeTask.correctMessage,
          isError: false
        };
        this.currentRobotAvatar = this.normalRobotAvatar;
        
        // 清除选择状态
        this.selectedPosition = null;
        this.validMoves = [];
        
        // 更新步骤和进度
        this.currentStep++;
        
        // 显示下一步按钮
        setTimeout(() => {
          this.actionState = 'next';
        }, 500);
      } else {
        // 播放错误音效
        this.playSound('error');
        
        // 显示错误消息
        this.currentMessage = {
          text: activeTask.errorMessage,
          isError: true
        };
        this.currentRobotAvatar = this.errorRobotAvatar;
        this.actionState = 'retry';
        
        // 清除选择状态
        this.selectedPosition = null;
        this.validMoves = [];
      }
    },
    
    // 找到当前活动的任务索引
    findActiveTaskIndex() {
      let taskCount = 0;
      
      for (let i = 0; i < this.lessonInfo.steps.length; i++) {
        const step = this.lessonInfo.steps[i];
        if (step.type === 'task') {
          if (taskCount === this.currentStep) {
            return i;
          }
          taskCount++;
        }
      }
      
      return -1;
    },
    
    // 显示提示
    showHint() {
      const activeTaskIndex = this.findActiveTaskIndex();
      if (activeTaskIndex === -1) return;
      
      const activeTask = this.lessonInfo.steps[activeTaskIndex];
      
      // 显示提示消息
      this.currentMessage = {
        text: activeTask.hintMessage,
        isError: false
      };
      this.currentRobotAvatar = this.normalRobotAvatar;
      
      // 播放提示音效
      this.playSound('move');
    },
    
    // 重试当前步骤
    retryStep() {
      const activeTaskIndex = this.findActiveTaskIndex();
      if (activeTaskIndex === -1) return;
      
      const activeTask = this.lessonInfo.steps[activeTaskIndex];
      
      // 重置消息
      this.currentMessage = {
        text: activeTask.message,
        isError: false
      };
      this.currentRobotAvatar = this.normalRobotAvatar;
      this.actionState = 'next';
      this.showHintBtn = true;
      
      // 播放音效
      this.playSound('move');
    },
    
    // 下一步
    nextStep() {
      this.playSound('move');
      this.goToNextTaskStep();
    },
    
    // 下一课
    nextLesson() {
      // 这里可以跳转到下一课，或者返回课程列表
      this.playSound('move');
      this.goBack();
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.rules-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png'); // 木质背景
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
  background-color: transparent; // 透明背景显示木质背景
  min-height: 750rpx;
  transform: translateZ(0); // 解决小程序中渲染问题
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
  background-color: rgba(33, 33, 33, 0.9); // 添加透明度以稍微显示木质背景
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  margin: 0rpx 20rpx;
  flex: 1;
  z-index: 10; // 确保卡片显示在前面
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
    }
    
  .error-message {
    background-color: rgba(229, 57, 53, 0.8);
      
      &:before {
      border-color: transparent rgba(229, 57, 53, 0.8) transparent transparent;
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