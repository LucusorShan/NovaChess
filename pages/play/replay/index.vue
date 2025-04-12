<template>
  <view class="chess-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <view class="chess-content">
      <!-- 标题区域 -->
      <view class="title-area">
        <text class="title">观战</text>
      </view>

      <!-- 上方对战区 -->
      <view class="battle-area">
        <!-- 对手信息 -->
        <player-info 
          :is-opponent="true"
          :player-name="game.player1Name"
          :avatar="game.player1Avatar"
          :rating="game.player1Rating"
          :time="game.player1Time"
          :is-turn="currentMoveIndex % 2 === 0"
        />
        
        <!-- 棋盘区域 -->
        <view class="board-area">
          <!-- 评估条 -->
          <view v-if="showEvaluation" class="evaluation-bar" @tap="toggleEvaluationDetails">
            <view class="eval-fill" :style="{ height: evaluationHeight + '%' }">
              <text class="eval-text">{{ formatEvaluation(evaluation) }}</text>
            </view>
            
            <view v-if="showEvaluationDetails" class="evaluation-details">
              <view class="eval-header">引擎评估</view>
              <view class="eval-info">
                <text>引擎: 简易评估</text>
                <text>评分: {{ formatEvaluation(evaluation) }}</text>
                <text>形势: {{ evaluationDescription }}</text>
              </view>
            </view>
          </view>
          
          <view class="board-container">
            <replay-chess-board
              :board-state="boardState"
              :last-move="currentMove"
              :play-as="playAs"
            />
          </view>
        </view>
        
        <!-- 玩家信息 -->
        <player-info 
          :is-opponent="false"
          :player-name="game.player2Name"
          :avatar="game.player2Avatar"
          :rating="game.player2Rating"
          :time="game.player2Time"
          :is-turn="currentMoveIndex % 2 === 1"
        />
      </view>
      
      <!-- 下方记录区 -->
      <view class="control-area">
        <!-- 对局信息 -->
        <view class="match-info">
          <view class="info-row">
            <text class="info-label">评估</text>
            <switch :checked="showEvaluation" @change="toggleEvaluation" color="#81b64c" />
          </view>
          <view class="info-row">
            <text class="info-label">开局方式</text>
            <text class="info-value">{{ currentOpeningName || '博格印度防御' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">引擎深度</text>
            <text class="info-value">depth={{ engineDepth }} | Stockfish 17 Lite</text>
          </view>
        </view>

        <!-- 视角切换 
        <view class="control-row">
          <text class="control-label">视角</text>
          <view class="perspective-switch">
            <view class="perspective-option" 
              :class="{ 'active': playAs === 'white' }" 
              @click="switchPerspective('white')">
              <image class="piece-icon" src="/static/images/match/pieces/white-king.png" mode="aspectFit"></image>
              <text>白方</text>
            </view>
            <view class="perspective-option" 
              :class="{ 'active': playAs === 'black' }" 
              @click="switchPerspective('black')">
              <image class="piece-icon" src="/static/images/match/pieces/black-king.png" mode="aspectFit"></image>
              <text>黑方</text>
            </view>
          </view>
        </view>
        --> 
        <!-- 走棋记录 -->
        <scroll-view class="moves-list" scroll-y>
          <view class="moves-container">
            <view 
              v-for="(move, index) in game.moves" 
              :key="index"
              class="move-item"
              :class="{ active: currentMoveIndex === index }"
              @tap="jumpToMove(index)"
            >
              <view class="move-header">
                <text class="move-number">{{ Math.floor(index/2) + 1 }}.</text>
                <text class="move-notation">{{ move.notation }}</text>
              </view>
              <view class="move-details">
                <text class="move-time">{{ move.time }}s</text>
                <text class="eval-value" :class="{ positive: move.evaluation > 0 }">
                  {{ formatEvaluation(move.evaluation) }}
                </text>
              </view>
            </view>
          </view>
        </scroll-view>

        <!-- 控制栏 -->
        <view class="control-bar">
          <button class="ctrl-btn" @tap="toStart">
            <text class="iconfont">⏮</text>
          </button>
          <button class="ctrl-btn" @tap="prevMove">
            <text class="iconfont">⏪</text>
          </button>
          <button class="ctrl-btn" @tap="nextMove">
            <text class="iconfont">⏩</text>
          </button>
          <button class="ctrl-btn" @tap="toEnd">
            <text class="iconfont">⏭</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 返回按钮 -->
    <view class="back-button" @click="backToHome">
      <uni-icons type="back" size="24" color="#fff"></uni-icons>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar active-tab="play" @tab-change="handleTabChange"></tab-bar>
  </view>
</template>

<script>
import TopSpacing from '@/components/TopSpacing.vue'
import PlayerInfo from '@/components/chess/PlayerInfo.vue'
import ReplayChessBoard from '@/components/chess/replay/ReplayChessBoard.vue'
import TabBar from '@/components/TabBar.vue'
import { getInitialChessboard } from '@/utils/chess/cheesLogic'

export default {
  components: {
    TopSpacing,
    PlayerInfo,
    ReplayChessBoard,
    TabBar
  },
  data() {
    return {
      statusBarHeight: 0,
      game: {
        player1Name: '',
        player2Name: '',
        player1Rating: 0,
        player2Rating: 0,
        player1Avatar: '',
        player2Avatar: '',
        player1Time: '10:00',
        player2Time: '10:00',
        moves: []
      },
      currentMoveIndex: -1,
      currentFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentMove: null,
      showEvaluation: false,
      engineDepth: 20,
      evaluation: 0,
      boardState: getInitialChessboard(),
      currentPlayer: 'white',
      stockfish: null,
      evalDatabase: {},
      openingDatabase: {},
      currentOpeningName: '',
      showEvaluationDetails: false,
      playAs: 'white',
      isLiveMode: false,  // 是否是观看直播模式
      gameId: '',         // 游戏ID
    }
  },
  computed: {
    gameStatus() {
      if (this.currentMoveIndex === -1) return '对局开始'
      if (this.currentMoveIndex >= this.game.moves.length - 1) return '对局结束'
      return '对局进行中'
    },
    evaluationHeight() {
      const eval_value = this.evaluation
      const max_eval = 5
      const percentage = 50 + (eval_value / max_eval) * 50
      return Math.min(Math.max(percentage, 0), 100)
    },
    evaluationDescription() {
      const eval_value = this.evaluation;
      
      if (eval_value === 0) return '局势均衡';
      
      if (eval_value > 0) {
        if (eval_value < 0.5) return '白方略有优势';
        if (eval_value < 1.5) return '白方有优势';
        if (eval_value < 3) return '白方明显优势';
        if (eval_value < 5) return '白方决定性优势';
        return '白方胜势';
      } else {
        const absEval = Math.abs(eval_value);
        if (absEval < 0.5) return '黑方略有优势';
        if (absEval < 1.5) return '黑方有优势';
        if (absEval < 3) return '黑方明显优势';
        if (absEval < 5) return '黑方决定性优势';
        return '黑方胜势';
      }
    }
  },
  onLoad(options) {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 获取传递的参数
    this.gameId = options.id || ''
    this.isLiveMode = options.live === 'true'
    
    // 加载对局数据
    this.loadGameData(this.gameId)
  },
  methods: {
    loadGameData(gameId) {
      console.log('加载对局数据:', gameId, '是否直播模式:', this.isLiveMode)
      
      // 根据是否是直播模式，加载不同的数据
      if (this.isLiveMode) {
        // 加载直播数据
        this.loadLiveGameData(gameId)
      } else {
        // 加载历史对局数据
        this.loadHistoryGameData(gameId)
      }
    },
    
    loadHistoryGameData(gameId) {
      // 模拟加载历史对局数据
      // 这里可以添加API请求，获取真实数据
      this.game = {
        player1Name: 'NikoTheodo',
        player2Name: 'theloyalwolf',
        player1Rating: 3072,
        player2Rating: 2952,
        player1Avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png',
        player2Avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png',
        player1Time: '10:00',
        player2Time: '10:00',
        moves: [
          { notation: 'e4', from: 'e2', to: 'e4', time: 1.2, evaluation: 0.3 },
          { notation: 'c5', from: 'c7', to: 'c5', time: 0.8, evaluation: 0.1 },
          { notation: 'Nf3', from: 'g1', to: 'f3', time: 1.5, evaluation: 0.4 }
        ]
      }
      this.initializeReplay()
    },
    
    loadLiveGameData(gameId) {
      // 模拟加载直播数据
      // 这里可以添加WebSocket连接，实时获取对局数据
      this.game = {
        player1Name: 'NikoTheodo',
        player2Name: 'theloyalwolf',
        player1Rating: 3072,
        player2Rating: 2952,
        player1Avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png',
        player2Avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png',
        player1Time: '3:45',
        player2Time: '4:12',
        moves: [
          { notation: 'e4', from: 'e2', to: 'e4', time: 1.2, evaluation: 0.3 },
          { notation: 'c5', from: 'c7', to: 'c5', time: 0.8, evaluation: 0.1 }
        ]
      }
      this.initializeReplay()
      
      // 设置模拟的实时数据更新
      if (this.isLiveMode) {
        setTimeout(() => {
          console.log('模拟新的棋步')
          this.game.moves.push({ notation: 'Nf3', from: 'g1', to: 'f3', time: 1.5, evaluation: 0.4 })
          this.jumpToMove(this.game.moves.length - 1)
        }, 5000)
      }
    },
    toggleEvaluation(e) {
      this.showEvaluation = e.detail.value
    },
    formatEvaluation(eval_value) {
      if (eval_value === 0) return '0.0'
      return eval_value > 0 ? '+' + eval_value.toFixed(1) : eval_value.toFixed(1)
    },
    initializeReplay() {
      this.currentMoveIndex = -1
      this.boardState = getInitialChessboard()
      this.currentMove = null
      this.currentPlayer = 'white'
      this.evaluation = 0
      this.currentOpeningName = '开局阶段'
      
      // 加载开局库
      this.loadOpeningDatabase()
    },
    jumpToMove(index) {
      this.currentMoveIndex = index
      
      // 更新棋盘状态
      if (index >= 0) {
        const move = this.game.moves[index]
        this.currentMove = {
          from: { row: move.from[1] - 1, col: move.from.charCodeAt(0) - 97 },
          to: { row: move.to[1] - 1, col: move.to.charCodeAt(0) - 97 }
        }
        
        // 更新评估值
        this.updateEvaluation(index)
        
        // 更新开局名称
        if (index < 10) { // 只在前10步尝试识别开局
          this.identifyOpening(this.currentFen)
        }
      } else {
        this.evaluation = 0
        this.currentOpeningName = '开局阶段'
      }
      
      this.currentPlayer = index % 2 === 0 ? 'black' : 'white'
    },
    prevMove() {
      if (this.currentMoveIndex > -1) {
        this.jumpToMove(this.currentMoveIndex - 1)
      }
    },
    nextMove() {
      if (this.currentMoveIndex < this.game.moves.length - 1) {
        this.jumpToMove(this.currentMoveIndex + 1)
      }
    },
    toStart() {
      this.jumpToMove(-1)
    },
    toEnd() {
      this.jumpToMove(this.game.moves.length - 1)
    },
    backToHome() {
      uni.navigateBack()
    },
    handleTabChange(tab) {
      uni.switchTab({
        url: tab.path
      })
    },
    // 初始化象棋评估引擎
    initStockfish() {
      // 小程序简化方案 - 使用预计算的评估值
      // 无需引入完整引擎，仅需加载预先计算好的开局评估库
      this.loadEvaluationData();
    },
    
    // 加载预计算的评估库
    loadEvaluationData() {
      // 模拟加载预计算的评估库
      this.evalDatabase = {
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': 0.3, // e4
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': 0.1, // 回应 c5
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2': 0.4, // Nf3
        // 更多常见开局位置...
      };
      
      console.log('评估库加载完成');
    },
    
    // 根据特定位置查询评估值
    getEvaluationForPosition(fen) {
      // 简化的FEN格式（仅取前半部分）
      const simpleFen = fen.split(' ')[0];
      
      // 查找匹配项或返回默认值
      for (const [storedFen, evalValue] of Object.entries(this.evalDatabase)) {
        const storedSimpleFen = storedFen.split(' ')[0];
        if (storedSimpleFen === simpleFen) {
          return evalValue;
        }
      }
      
      // 如果没有找到匹配项，使用简单的启发式计算
      return this.calculateSimpleEvaluation(fen);
    },
    
    // 简单的启发式评估
    calculateSimpleEvaluation(fen) {
      const pieces = fen.split(' ')[0];
      let value = 0;
      
      // 简单的材料差值计算
      const pieceValues = {
        'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 0,
        'p': -1, 'n': -3, 'b': -3, 'r': -5, 'q': -9, 'k': 0
      };
      
      for (const char of pieces) {
        if (pieceValues[char]) {
          value += pieceValues[char];
        }
      }
      
      // 转换为兵值表示
      return value / 10; // 适当缩小差距
    },
    
    // 更新评估值
    updateEvaluation(moveIndex) {
      if (moveIndex >= 0 && moveIndex < this.game.moves.length) {
        this.evaluation = this.game.moves[moveIndex].evaluation;
      } else {
        this.evaluation = 0;
      }
    },
    
    // 加载开局库
    loadOpeningDatabase() {
      // 模拟简单的开局库
      this.openingDatabase = {
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR': '国王兵开局',
        'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR': '王后兵开局',
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR': '西西里防御',
        'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R': '西西里防御，闭门系统',
        'rnbqkb1r/pp1ppppp/5n2/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R': '西西里防御，掘子变例'
      };
    },
    
    // 识别当前局面的开局
    identifyOpening(fen) {
      const position = fen.split(' ')[0]; // 只取位置部分
      
      if (this.openingDatabase[position]) {
        this.currentOpeningName = this.openingDatabase[position];
        return this.openingDatabase[position];
      }
      
      // 默认开局名称
      if (this.currentMoveIndex < 2) {
        this.currentOpeningName = '标准开局';
      }
      
      return this.currentOpeningName;
    },
    toggleEvaluationDetails() {
      this.showEvaluationDetails = !this.showEvaluationDetails;
    },
    // 切换观看视角
    switchPerspective(perspective) {
      this.playAs = perspective;
    }
  },
  
  mounted() {
    // 初始化简化版评估引擎
    this.initStockfish();
  },
  
  beforeDestroy() {
    // 清理引擎资源
    this.destroyStockfish();
  }
}
</script>

<style lang="scss" scoped>
.chess-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1e1e1e;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.chess-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.title-area {
  padding: 20rpx 0;
  text-align: center;

  .title {
    font-size: 36rpx;
    color: #fff;
    font-weight: bold;
  }
}

.battle-area {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 100%;
}

.board-area {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  width: 100%;
  padding: 0 10rpx;
  box-sizing: border-box;
  position: relative;

  .evaluation-bar {
    width: 40rpx;
    height: 650rpx; /* 固定高度与棋盘保持一致 */
    background-color: #000;
    margin-right: 12rpx;
    border-radius: 6rpx;
    overflow: visible;
    position: relative;
    flex-shrink: 0;
    display: flex;

    .eval-fill {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background-color: #4a4a4a;
      transition: height 0.3s ease;

      .eval-text {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 20rpx;
        color: #fff;
        writing-mode: vertical-rl;
        text-orientation: mixed;
      }
    }
    
    .evaluation-details {
      position: absolute;
      left: 50rpx;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.85);
      border-radius: 10rpx;
      padding: 20rpx;
      width: 280rpx;
      z-index: 100;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
      
      .eval-header {
        font-size: 28rpx;
        color: #fff;
        margin-bottom: 12rpx;
        font-weight: bold;
        text-align: center;
      }
      
      .eval-info {
        display: flex;
        flex-direction: column;
        gap: 10rpx;
        
        text {
          font-size: 24rpx;
          color: #ddd;
        }
      }
    }
  }

  .board-container {
    width: calc(100% - 52rpx);
    max-width: 650rpx;
    aspect-ratio: 1;
    background-color: #2a2a2a;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  }
}

.control-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20rpx;
  margin-top: 20rpx;
  overflow: hidden;
}

.match-info {
  padding: 20rpx;
  border-bottom: 1px solid #3a3a3a;

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 24rpx;
      color: #EEE;
      font-weight: bold;
    }

    .info-value {
      font-size: 24rpx;
      color: #fff;
    }
  }
}

.moves-list {
  flex: 1;
  padding: 20rpx;

  .moves-container {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .move-item {
    display: flex;
    justify-content: space-between;
    padding: 16rpx;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 15rpx;
    transition: all 0.3s;

    &.active {
      background-color: rgba(129, 182, 76, 0.3);
      transform: scale(1.02);
      border-radius: 15rpx;
    }

    .move-header {
      display: flex;
      gap: 8rpx;

      .move-number {
        color: #888;
        font-size: 24rpx;
      }

      .move-notation {
        color: #fff;
        font-size: 24rpx;
        font-weight: 500;
      }
    }

    .move-details {
      display: flex;
      gap: 16rpx;
      align-items: center;

      .move-time {
        font-size: 24rpx;
        color: #888;
        background-color: #2a2a2a;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;
      }

      .eval-value {
        font-size: 24rpx;
        font-weight: bold;
        color: #c53b3bda;
        background-color: #2a2a2a;
        padding: 4rpx 12rpx;
        border-radius: 6rpx;

        &.positive {
          color: rgba(129, 182, 76);
        }
      }
    }
  }
}

.control-bar {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  padding: 20rpx;
  border-top: 1px solid #3a3a3a;

  .ctrl-btn {
    width: 100rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3a3a3a;
    border-radius: 50%;
    border: none;
    transition: all 0.3s;

    &:active {
      background-color: #4a4a4a;
      transform: scale(0.95);
    }

    .iconfont {
      font-size: 40rpx;
      color: #fff;
    }
  }
}

.back-button {
  position: fixed;
  top: 40rpx;
  left: 20rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  z-index: 100;
}

.perspective-switch {
  display: flex;
  justify-content: space-around;
  width: 200rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10rpx;
  padding: 10rpx;
  
  .perspective-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10rpx;
    border-radius: 6rpx;
    
    &.active {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .piece-icon {
      width: 40rpx;
      height: 40rpx;
      margin-bottom: 6rpx;
    }
    
    text {
      font-size: 20rpx;
      color: #fff;
    }
  }
}
</style> 