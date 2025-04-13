<template>
  <view class="chess-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <view class="chess-content">
    <!-- 上方对战区 -->
    <view class="battle-area">
      <!-- 对手信息 -->
        <player-info 
          :is-opponent="true"
          :player-name="opponentName"
          avatar="/static/images/match/avatar-default.png"
          :time="formatTime(opponentTimeRemaining)"
          :is-turn="(playAs === 'white' && currentPlayer === 'black') || (playAs === 'black' && currentPlayer === 'white')"
        />
        
        <!-- 棋盘区 -->
        <view class="board-container">
          <chess-board
            ref="chessBoard"
            :board-state="chessboard"
            :selected-position="selectedPosition"
            :valid-moves="validMoves"
            :last-move="lastMove"
            :current-player="currentPlayer"
            :play-as="playAs"
            :is-checkmated="isCheckmated"
            :checkmate-color="checkmateColor"
            @cell-click="handleCellClick"
            @promotion-move="handlePromotion"
          />
        </view>
      
      <!-- 玩家信息 -->
        <player-info 
          :is-opponent="false"
          :player-name="playerName"
          avatar="/static/images/match/avatar-user.png"
          flag="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9012.png"
          :time="formatTime(playerTimeRemaining)"
          :is-turn="(playAs === 'white' && currentPlayer === 'white') || (playAs === 'black' && currentPlayer === 'black')"
        />
    </view>
    
    <!-- 下方操作区 -->
    <view class="control-area">
      <!-- 主标签功能面板 -->
        <game-tabs
          :active-tab="activeTab"
          :tabs="currentTabList"
          @tab-change="switchTab"
        />
        
        <!-- 根据不同标签页显示不同内容 -->
        <view>
          <new-game-tab
            v-if="activeTab === 'newGame'"
            :time-control="timeControl"
            :game-mode="gameMode"
            :play-as="playAs"
            :show-more-options="showMoreOptions"
            :matching="matching"
            ref="newGameTabRef"
            @toggle-more-options="toggleMoreOptions"
            @select-game-mode="selectMode"
            @select-time="selectTime"
            @select-play-as="selectPlayAs"
            @start-game="startGame"
            @cancel-matching="cancelMatching"
            @play-with-friend="playWithFriend"
            @play-ladder="playLeaderboard"
          />
          
          <games-tab
            v-if="activeTab === 'games'"
            :games-list="gamesList"
          />
          
          <player-tab
            v-if="activeTab === 'players'"
            :players-list="playersList"
            @invite-friend="inviteFriend"
            @share-invite-link="shareInviteLink"
          />
          
          <match-tab
            v-if="activeTab === 'match'"
            :time-control="timeControl"
            :game-mode="gameMode"
            :play-as="playAs"
            :move-history="formattedMoveHistory"
            :opening-name="currentOpening"
            :player-name="playerName"
            :opponent-name="opponentName"
            :game-result="gameResult"
            :is-leaderboard-mode="isLeaderboardMode"
            @offer-draw="offerDraw"
            @resign="resignGame"
            @send-message="sendChatMessage"
            @request-new-game="startNewGame"
          />
        </view>
      </view>
      
      <!-- 测试按钮 - 用于开始对战并显示对战Tab -->
      <view class="debug-tools" v-if="!gameStarted">
        <view class="start-match-btn" @click="startMatchAndShowTab">开始对战</view>
        <view class="test-invitation-btn" @click="testInvitation('LucTestAccount')">测试邀请弹窗</view>
        <view class="gen-url-btn" @click="generateTestInvitationUrl">生成测试URL</view>
      </view>
      </view>
      
    <!-- 添加返回首页按钮 -->
    <view class="back-button" @click="backToHome">
      <uni-icons type="back" size="24" color="#fff"></uni-icons>
    </view>
    
    <!-- 胜利弹窗 -->
    <uni-popup ref="victoryPopup" type="center" background-color="#333" @close="handleResultClose">
      <view class="result-popup victory-popup">
        <view class="result-icon">
          <image src="/static/images/match/gold_trophy.png" mode="aspectFit"></image>
        </view>
        <view class="result-title">比赛胜出！</view>
        <view class="result-description">你"将死"了对手</view>
        
        <!-- 天梯赛积分变化 -->
        <view v-if="isLeaderboardMode" class="rating-display">
          <text class="rating-label">当前积分</text>
          <view class="rating-value-container">
            <text class="rating-value">{{ ratingChange ? ratingChange.before : 335 }}</text>
            <text v-if="ratingChange" class="rating-change positive">+ {{ ratingChange.change }}</text>
          </view>
        </view>
        
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="handleSummary">总结比赛</view>
          <view class="action-btn secondary-btn" @click="handleNewGame">新的一局</view>
        </view>
        <view class="popup-close" @click="closeResultPopup">
          <uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
        </view>
      </view>
    </uni-popup>
    
    <!-- 失败弹窗 -->
    <uni-popup ref="defeatPopup" type="center" background-color="#333" @close="handleResultClose">
      <view class="result-popup defeat-popup">
        <view class="result-title">遗憾告负...</view>
        <view class="result-description">你被"将死"了</view>
        
        <!-- 天梯赛积分变化 -->
        <view v-if="isLeaderboardMode" class="rating-display">
          <text class="rating-label">当前积分</text>
          <view class="rating-value-container">
            <text class="rating-value">{{ ratingChange ? ratingChange.before : 335 }}</text>
            <text v-if="ratingChange" class="rating-change negative">{{ ratingChange.change }}</text>
          </view>
        </view>
        
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="handleSummary">总结比赛</view>
          <view class="action-btn secondary-btn" @click="handleNewGame">新的一局</view>
        </view>
        <view class="popup-close" @click="closeResultPopup">
          <uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
        </view>
      </view>
    </uni-popup>
    
    <!-- 和棋弹窗 -->
    <uni-popup ref="drawPopup" type="center" background-color="#333" @close="handleResultClose">
      <view class="result-popup draw-popup">
        <view class="result-title">和棋</view>
        <view class="result-description">这把是平局</view>
        
        <!-- 天梯赛积分变化 -->
        <view v-if="isLeaderboardMode" class="rating-display">
          <text class="rating-label">当前积分</text>
          <view class="rating-value-container">
            <text class="rating-value">{{ ratingChange ? ratingChange.before : 335 }}</text>
            <text v-if="ratingChange" class="rating-change" :class="{'positive': ratingChange && ratingChange.change > 0, 'negative': ratingChange && ratingChange.change < 0}">
              {{ ratingChange && ratingChange.change > 0 ? '+' : '' }}{{ ratingChange ? ratingChange.change : 0 }}
            </text>
          </view>
        </view>
        
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="handleSummary">总结比赛</view>
          <view class="action-btn secondary-btn" @click="handleNewGame">新的一局</view>
        </view>
        <view class="popup-close" @click="closeResultPopup">
          <uni-icons type="closeempty" size="24" color="#fff"></uni-icons>
        </view>
      </view>
    </uni-popup>
    
    <!-- 引入通用底部导航栏 -->
    <tab-bar active-tab="play" @tab-change="handleTabChange"></tab-bar>
    
    <!-- 邀请弹窗 -->
    <invitation-popup 
      ref="invitationPopup"
      :inviter="currentInviter"
      @accept="handleAcceptInvitation"
      @decline="handleDeclineInvitation"
    />
  </view>
</template>

<script>
// 导入通用导航栏组件
import TabBar from '@/components/TabBar.vue';
// 导入自定义组件
import ChessBoard from '@/components/chess/ChessBoard.vue';
import PlayerInfo from '@/components/chess/PlayerInfo.vue';
import GameTabs from '@/components/chess/GameTabs.vue';
import NewGameTab from '@/components/chess/tabs/NewGameTab.vue';
import GamesTab from '@/components/chess/tabs/GamesTab.vue';
import PlayerTab from '@/components/chess/tabs/PlayerTab.vue';
import MatchTab from '@/components/chess/tabs/MatchTab.vue';
import InvitationPopup from '@/components/chess/InvitationPopup.vue';
import TopSpacing from '@/components/TopSpacing.vue'

// 导入国际象棋逻辑
import { 
  getInitialChessboard, 
  getValidMoves, 
  getPieceColor, 
  getPieceType,
  recordMove,
  isKingInCheck,
  canCastle,
  getCastlingMoves,
  calculateAlgebraicNotation
} from '@/utils/chess/cheesLogic';

export default {
  components: {
    TabBar,
    ChessBoard,
    PlayerInfo,
    GameTabs,
    NewGameTab,
    GamesTab,
    PlayerTab,
    MatchTab,
    InvitationPopup,
    TopSpacing
  },
  data() {
    return {
      columns: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
      rows: ['8', '7', '6', '5', '4', '3', '2', '1'],
      showMoreOptions: false,
      activeTab: 'newGame', // 当前激活的标签: 'newGame', 'games', 'players'
      tabList: [
        { value: 'newGame', label: '新游戏', icon: 'https://pic1.imgdb.cn/item/67f3c61ee381c3632bee901f.png' },
        { value: 'games', label: '对局', icon: 'https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee900f.png' },
        { value: 'players', label: '玩家', icon: 'https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9021.png' },
        { value: 'match', label: '对战', icon: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ffa.png' } // 对战标签使用attack.png图标
      ],
      selectedPosition: null, // 选中的棋子位置 {row, col}
      validMoves: [], // 当前选中棋子的有效移动位置 [{row, col}]
      currentPlayer: 'white', // 当前玩家，'white'或'black'
      gameStarted: false, // 游戏是否已开始
      gameMode: 'standard', // 游戏模式: 'standard', 'quick'
      timeControl: '10 min', // 时间控制
      playAs: 'white', // 玩家执子颜色: 'white', 'black', 'random' - 默认为白色
      playerTimeRemaining: 600, // 玩家剩余时间（秒）
      opponentTimeRemaining: 600, // 对手剩余时间（秒）
      playerTimer: null, // 玩家计时器
      opponentTimer: null, // 对手计时器
      moveStartTime: null, // 记录当前回合开始时间
      playerName: 'LUCASSHANCHUXIONG', // 玩家名称
      opponentName: '等待对手加入', // 初始显示"等待对手加入"
      gameResult: null, // 游戏结果
      gamesList: [
        { id: 1, opponent: 'Bigfish1995', rating: 2807, status: '对战中' },
        { id: 2, opponent: 'CogieMekutune', rating: 2799, status: '在线' },
        { id: 3, opponent: 's4gVoid', rating: 2720, status: '在线' }
      ],
      playersList: [
        { id: 1, name: 'Bigfish1995', rating: 2807, country: 'cn' },
        { id: 2, name: 'CogieMekutune', rating: 2799, country: 'jp' },
        { id: 3, name: 's4gVoid', rating: 2720, country: 'de' }
      ],
      // 棋盘状态，使用二维数组表示
      chessboard: getInitialChessboard(),
      moveHistory: [], // 移动历史记录
      formattedMoveHistory: [], // 格式化后的移动历史
      initialBoardState: null, // 记录初始棋盘状态用于重置
      matching: false, // 是否正在匹配中
      lastMove: null, // 新增的lastMove属性
      specialMoves: {  // 特殊移动
        castling: [],  // 王车易位
        enPassant: null, // 吃过路兵
        promotion: {   // 兵升变
          pendingMove: null,
          showDialog: false
        }
      },
      currentOpening: 'Anglo-Scandinavian Defense',
      isCheckmated: false,  // 是否将杀状态
      checkmateColor: '',   // 被将杀的颜色
      
      // 当前邀请者信息
      currentInviter: {
        id: 0,
        name: '',
        rating: 0,
        avatar: '',
        timeControl: '10 min'
      },
      isLeaderboardMode: false,
      opponentRating: 0,
      playerRating: 335,
      ratingChange: null,
      statusBarHeight: 0
    }
  },
  computed: {
    // 计算当前显示的标签列表
    currentTabList() {
      // 如果游戏未开始，只显示前三个标签
      return this.gameStarted 
        ? this.tabList 
        : this.tabList.filter(tab => tab.value !== 'match');
    }
  },
  created() {
    // 保存初始棋盘状态
    this.initialBoardState = JSON.parse(JSON.stringify(this.chessboard));
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 页面加载时的处理
    if (options && options.mode) {
      // 如果是从邀请好友入口进入
      if (options.mode === 'invite' || options.mode === 'friends') {
        // 通过 setTimeout 确保界面完全渲染后再执行
        setTimeout(() => {
          this.activeTab = 'newGame';
          
          // 延迟300ms后自动触发好友邀请界面
          setTimeout(() => {
            if (this.$refs.newGameTabRef) {
              this.$refs.newGameTabRef.onPlayWithFriend();
            } else {
              this.playWithFriend();
            }
          }, 300);
        }, 100);
      }
      // 如果是从天梯赛入口进入
      else if (options.mode === 'ladder') {
        // 延迟执行以确保组件加载完成
        setTimeout(() => {
          this.activeTab = 'newGame';
          this.playLeaderboard();
        }, 100);
      }
    }
    
    // 处理邀请链接参数
    if (options && options.invitation) {
      try {
        // 尝试直接解析
        const inviter = JSON.parse(decodeURIComponent(options.invitation));
        setTimeout(() => {
          this.showInvitation(inviter);
        }, 1000);
      } catch (e) {
        console.error('解析邀请参数失败', e);
      }
    }
  },
  mounted() {
    // 监听棋盘准备好的事件
    this.$on('board-ready', this.handleBoardReady);
    
    // 监听兵升变事件
    this.$on('promotion-move', this.handlePromotion);
    
    // 模拟监听好友邀请
    this.simulateInvitationListener();
  },
  beforeDestroy() {
    // 移除事件监听
    this.$off('board-ready');
    this.$off('promotion-move');
  },
  methods: {
    // 格式化时间显示
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },
    
    // 处理底部导航栏的标签变化
    handleTabChange(tab) {
      console.log('导航到', tab);
      // 如有需要可以在这里添加其他逻辑
    },
    
    // 切换标签页
    switchTab(tab) {
      this.activeTab = tab;
    },
    
    // 切换显示更多选项
    toggleMoreOptions() {
      this.showMoreOptions = !this.showMoreOptions;
    },
    
    // 开始游戏
    startGame() {
      this.gameStarted = true;
      this.matching = true;
      
      // 重置棋盘到初始状态
      this.resetBoard();
      
      // 匹配开始时，显示等待对手加入
      this.opponentName = '等待对手加入';
      
      // 这里应该调用后端接口进行匹配，获取执棋方信息
      // 模拟后端返回匹配结果
      setTimeout(() => {
        // 模拟匹配成功，获取执棋方
        this.matching = false;
        
        // 假设接口返回的执棋方信息
        const matchResult = {
          success: true,
          playerColor: Math.random() < 0.5 ? 'white' : 'black', // 随机分配颜色
          opponentName: 'DIVAN90JAKKELD', // 从后端获取对手名称
          opponentRating: 2503
        };
        
        if (matchResult.success) {
          // 设置玩家执棋方
          this.playAs = matchResult.playerColor;
          
          // 更新对手信息
          this.opponentName = matchResult.opponentName;
          
          // 切换到对战标签
          this.activeTab = 'match';
          
          // 按规则白方先行，开始白方计时
          this.startWhiteTimer();
          
          uni.showToast({
            title: `匹配成功，您执${this.playAs === 'white' ? '白' : '黑'}子`,
            icon: 'none'
          });
        }
      }, 2000); // 模拟网络延迟
    },
    
    // 重置棋盘
    resetBoard() {
      this.chessboard = getInitialChessboard();
      this.currentPlayer = 'white'; // 游戏总是从白方开始
      this.selectedPosition = null;
      this.validMoves = [];
      this.moveHistory = [];
      this.formattedMoveHistory = [];
      this.lastMove = null;
      this.gameResult = null;
      this.isCheckmated = false;
      this.checkmateColor = '';
      
      // 重置对手名称为等待状态
      if (!this.matching && !this.gameStarted) {
        this.opponentName = '等待对手加入';
      }
      
      // 重置计时器
      this.playerTimeRemaining = 600; // 10分钟
      this.opponentTimeRemaining = 600;
      this.stopAllTimers();
    },
    
    // 停止所有计时器
    stopAllTimers() {
      if (this.playerTimer) {
        clearInterval(this.playerTimer);
        this.playerTimer = null;
      }
      if (this.opponentTimer) {
        clearInterval(this.opponentTimer);
        this.opponentTimer = null;
      }
    },
    
    // 启动白方计时器
    startWhiteTimer() {
      this.moveStartTime = new Date();
      this.stopAllTimers();
      
      // 根据玩家执棋方启动相应计时器
      if (this.playAs === 'white') {
        this.startPlayerTimer();
      } else {
        this.startOpponentTimer();
      }
    },
    
    // 启动黑方计时器
    startBlackTimer() {
      this.moveStartTime = new Date();
      this.stopAllTimers();
      
      // 根据玩家执棋方启动相应计时器
      if (this.playAs === 'black') {
        this.startPlayerTimer();
      } else {
        this.startOpponentTimer();
      }
    },
    
    // 启动玩家计时器
    startPlayerTimer() {
      this.stopAllTimers();
      this.playerTimer = setInterval(() => {
        if (this.playerTimeRemaining > 0) {
          this.playerTimeRemaining--;
        } else {
          // 时间耗尽，判负
          this.handleTimeout('player');
        }
      }, 1000);
    },
    
    // 启动对手计时器
    startOpponentTimer() {
      this.stopAllTimers();
      this.opponentTimer = setInterval(() => {
        if (this.opponentTimeRemaining > 0) {
          this.opponentTimeRemaining--;
        } else {
          // 时间耗尽，判负
          this.handleTimeout('opponent');
        }
      }, 1000);
    },
    
    // 处理超时
    handleTimeout(player) {
      this.stopAllTimers();
      
      // 设置游戏结果
      if (player === 'player') {
        this.gameResult = `${this.opponentName} 胜出（超时）`;
      } else {
        this.gameResult = `${this.playerName} 胜出（超时）`;
      }
      
      // 处理游戏结束
      this.handleGameEnd(player === 'player' ? 'defeat' : 'victory');
    },
    
    // 计算用时
    calculateTimeSpent() {
      if (!this.moveStartTime) return '0.0s';
      const timeSpent = (new Date() - this.moveStartTime) / 1000;
      return timeSpent.toFixed(1) + 's';
    },
    
    // 开始游戏并显示对战Tab
    startMatchAndShowTab() {
      this.gameStarted = true;
      this.matching = false; // 直接进入对战状态，不显示匹配中
      
      // 模拟随机分配玩家执棋方
      this.playAs = Math.random() < 0.5 ? 'white' : 'black';
      
      // 模拟对手信息
      this.opponentName = 'DIVAN90JAKKELD';
      
      // 重置棋盘
      this.resetBoard();
      
      // 切换到对战标签
      this.activeTab = 'match';
      
      // 白子先行
      this.currentPlayer = 'white';
      this.startWhiteTimer();
      
      uni.showToast({
        title: `对战已开始，您执${this.playAs === 'white' ? '白' : '黑'}子`,
        icon: 'none'
      });
    },
    
    // 记录走棋历史
    recordMoveHistory(from, to, piece, captured) {
      const pieceType = getPieceType(piece);
      const pieceColor = getPieceColor(piece);
      
      // 计算代数记谱法表示
      const notation = this.calculateNotation(from, to, piece, captured);
      
      // 计算用时
      const timeSpent = this.calculateTimeSpent();
      
      // 更新格式化的历史记录
      if (pieceColor === 'white') {
        this.formattedMoveHistory.push({
          moveNumber: this.formattedMoveHistory.length + 1,
          white: {
            notation: notation,
            time: timeSpent,
            piece: piece
          },
          black: null
        });
      } else {
        const lastMove = this.formattedMoveHistory[this.formattedMoveHistory.length - 1];
        lastMove.black = {
          notation: notation,
          time: timeSpent,
          piece: piece
        };
      }
      
      // 限制只显示最近的8步记录
      if (this.formattedMoveHistory.length > 8) {
        this.formattedMoveHistory = this.formattedMoveHistory.slice(-8);
      }
    },
    
    // 计算代数记谱法
    calculateNotation(from, to, piece, captured) {
      return calculateAlgebraicNotation(from, to, piece, this.chessboard, captured);
    },
    
    // 移动棋子
    movePiece(fromRow, fromCol, toRow, toCol, moveInfo = {}) {
      // 检查是否是兵升变
      const piece = this.chessboard[fromRow][fromCol];
      const isPawn = getPieceType(piece) === 'pawn';
      const isReachingEnd = (getPieceColor(piece) === 'white' && toRow === 0) || 
                            (getPieceColor(piece) === 'black' && toRow === 7);
      
      if (isPawn && isReachingEnd && !moveInfo.promoteTo) {
        // 显示升变对话框
        if (this.$refs.chessBoard) {
          const result = this.$refs.chessBoard.checkForPromotion({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol }
          });
          
          if (result) {
            // 升变对话框已显示，等待用户选择
            return;
          }
        }
      }
      
      // 记录被吃掉的棋子
      const capturedPiece = this.chessboard[toRow][toCol];
      
      // 检查是否吃掉对方的王
      if (capturedPiece && getPieceType(capturedPiece) === 'king') {
        // 记录将杀状态
        this.isCheckmated = true;
        this.checkmateColor = getPieceColor(capturedPiece);
        
        // 确定胜负
        // 如果当前移动的棋子是玩家执的颜色，则玩家胜利
        const movingColor = getPieceColor(piece);
        const isPlayerWinner = movingColor === this.playAs;
        
        // 设置游戏结果
        this.gameResult = isPlayerWinner ? `${this.playerName} 胜出（将杀）` : `${this.opponentName} 胜出（将杀）`;
        
        // 停止所有计时器
        this.stopAllTimers();
        
        // 使用玩家视角显示将杀特效
        if (this.$refs.chessBoard) {
          this.$refs.chessBoard.showCheckmate(true, this.checkmateColor);
        }
        
        // 2秒后显示结果弹窗
        setTimeout(() => {
          this.showResultPopup(isPlayerWinner ? 'victory' : 'defeat');
        }, 2000);
      }
      
      // 尝试移动棋子，记录移动结果
      const move = recordMove(this.chessboard, 
        { row: fromRow, col: fromCol }, 
        { row: toRow, col: toCol }, 
        moveInfo
      );
      
      // 记录移动历史
      this.moveHistory.push(move);
      
      // 记录走棋记录
      this.recordMoveHistory(
        { row: fromRow, col: fromCol },
        { row: toRow, col: toCol },
        piece,
        capturedPiece
      );
      
      // 切换玩家
      this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
      
      // 更新lastMove属性
      this.lastMove = move;
      
      // 如果游戏未结束，切换计时器并检查游戏结局
      if (!this.isCheckmated) {
        // 切换计时器 - 当前高亮的玩家开始计时
        if (this.currentPlayer === 'white') {
          this.startWhiteTimer();
        } else {
          this.startBlackTimer();
        }
        
        // 检查游戏结局
        this.checkGameOutcome();
      }
    },
    
    // 检查游戏结局
    checkGameOutcome() {
      // 检查将军、将杀、逼和等
      const isCheck = isKingInCheck(this.chessboard, this.currentPlayer);
      
      if (isCheck) {
        // 检查是否有合法移动
        const hasLegalMove = this.hasAnyLegalMove();
        
        if (!hasLegalMove) {
          // 将杀
          this.handleCheckmate();
        } else {
          // 将军
          this.handleCheck();
        }
      } else {
        // 检查是否为逼和
        const hasLegalMove = this.hasAnyLegalMove();
        if (!hasLegalMove) {
          // 逼和
          this.handleStalemate();
        }
      }
    },
    
    // 检查当前玩家是否有任何合法移动
    hasAnyLegalMove() {
      // 遍历所有棋子，检查是否有合法移动
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.chessboard[row][col];
          if (piece && getPieceColor(piece) === this.currentPlayer) {
            const moves = getValidMoves(this.chessboard, row, col);
            if (moves.length > 0) {
              return true;
            }
          }
        }
      }
      return false;
    },
    
    // 处理将军情况
    handleCheck() {
      uni.showToast({
        title: '将军！',
        icon: 'none'
      });
    },
    
    // 处理将杀情况
    handleCheckmate() {
      this.stopAllTimers();
      
      // 当前玩家（失败者）的颜色
      const loserColor = this.currentPlayer;
      
      // 获取胜利者颜色
      const winnerColor = loserColor === 'white' ? 'black' : 'white';
      
      // 确定玩家是否胜利
      const isPlayerWinner = winnerColor === this.playAs;
      
      // 设置结果消息
      this.gameResult = isPlayerWinner ? `${this.playerName} 胜出（将杀）` : `${this.opponentName} 胜出（将杀）`;
      
      // 记录将杀状态
      this.isCheckmated = true;
      this.checkmateColor = loserColor;
      
      // 使用玩家视角显示将杀特效
      if (this.$refs.chessBoard) {
        this.$refs.chessBoard.showCheckmate(true, this.checkmateColor);
      }
      
      // 处理游戏结束
      this.handleGameEnd(isPlayerWinner ? 'victory' : 'defeat');
    },
    
    // 处理逼和情况
    handleStalemate() {
      this.stopAllTimers();
      this.gameResult = '和棋（逼和）';
      
      // 处理游戏结束
      this.handleGameEnd('draw');
    },
    
    // 取消匹配
    cancelMatching() {
      this.gameStarted = false;
      this.matching = false;
      
      uni.showToast({
        title: '已取消匹配',
        icon: 'none'
      });
    },
    
    // 返回首页
    backToHome() {
      uni.switchTab({
        url: '/pages/index'
      });
    },
    
    // 选择游戏模式
    selectMode(mode) {
      this.gameMode = mode;
    },
    
    // 选择时间控制
    selectTime(time) {
      this.timeControl = time;
    },
    
    // 选择执子颜色
    selectPlayAs(color) {
      this.playAs = color;
    },
    
    // 与好友一起玩
    playWithFriend() {
      console.log('显示好友对战界面');
      // 已通过NewGameTab内的showFriendsTab控制显示界面
      // 不需要做额外操作
    },
    
    // 处理邀请好友
    inviteFriend(user) {
      console.log('邀请好友：', user);
      // 更新对手信息
      this.opponentName = user.name;
      
      // 显示匹配中状态
      this.matching = true;
      
      // 模拟等待对方接受邀请
      uni.showToast({
        title: `邀请已发送给 ${user.name}`,
        icon: 'none'
      });
      
      // 模拟对方接受邀请(实际应用中应通过websocket等方式接收好友接受邀请的通知)
      setTimeout(() => {
        this.acceptFriendInvite();
      }, 3000);
    },
    
    // 分享邀请链接
    shareInviteLink(friend) {
      // 生成邀请链接
      const inviteCode = this.generateInviteCode();
      let inviteLink = `app://chess/invitation?code=${inviteCode}`;
      
      // 如果有好友信息，添加到链接中
      if (friend && friend.id) {
        inviteLink += `&friend=${friend.name}`;
      }
      
      uni.showModal({
        title: '分享邀请链接',
        content: `邀请链接已生成: ${inviteLink}\n\n您可以复制此链接分享给好友`,
        confirmText: '复制链接',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.setClipboardData({
              data: inviteLink,
              success: () => {
                uni.showToast({
                  title: '链接已复制到剪贴板',
                  icon: 'success'
                });
              }
            });
          }
        }
      });
    },
    
    // 生成随机邀请码
    generateInviteCode() {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    },
    
    // 处理好友接受邀请
    acceptFriendInvite() {
      // 开始新对局
      this.resetBoard();
      this.gameStarted = true;
      this.matching = false;
      this.gameResult = null;
      this.isCheckmated = false;
      this.checkmateColor = '';
      
      // 切换到对战标签
      this.activeTab = 'match';
      
      // 开始计时
      this.startWhiteTimer();
      
      uni.showToast({
        title: `${this.opponentName} 已接受邀请，对局开始！`,
        icon: 'success'
      });
    },
    
    // 参加天梯赛
    playLeaderboard() {
      console.log('进入天梯赛匹配');
      
      // 设置为天梯赛模式
      this.isLeaderboardMode = true;
      
      // 直接进入匹配状态
      this.gameStarted = true;
      this.matching = true;
      
      // 使用默认配置：10分钟、标准模式、随机执子
      this.timeControl = '10 min';
      this.gameMode = 'standard';
      this.playAs = 'random';
      
      // 重置棋盘到初始状态
      this.resetBoard();
      
      // 匹配开始时，显示等待对手加入
      this.opponentName = '等待对手加入';
      
      // 模拟匹配过程
      setTimeout(() => {
        // 模拟匹配成功
        this.findLeaderboardOpponent();
      }, 3000);
    },
    
    // 匹配天梯赛对手
    findLeaderboardOpponent() {
      // 模拟从后端获取对手信息
      const opponentList = [
        { name: 'GrandMaster2000', rating: 2356 },
        { name: 'ChessWizard', rating: 1987 },
        { name: 'KnightRider', rating: 1876 },
        { name: 'QueenDomination', rating: 2145 },
        { name: 'BishopAttack', rating: 1756 }
      ];
      
      // 随机选择一个对手
      const randomOpponent = opponentList[Math.floor(Math.random() * opponentList.length)];
      
      // 设置匹配状态和对手信息
      this.matching = false;
      this.opponentName = randomOpponent.name;
      this.opponentRating = randomOpponent.rating;
      
      // 随机分配执棋方
      this.playAs = Math.random() < 0.5 ? 'white' : 'black';
      
      // 切换到对战标签
      this.activeTab = 'match';
      
      // 按规则白方先行，开始白方计时
      this.startWhiteTimer();
      
      uni.showToast({
        title: `天梯赛开始，您执${this.playAs === 'white' ? '白' : '黑'}子`,
        icon: 'none'
      });
    },
    
    // 提出和棋
    offerDraw() {
      uni.showModal({
        title: '和棋请求',
        content: '你确定要提出和棋吗？',
        success: (res) => {
          if (res.confirm) {
            // 这里模拟对手接受和棋请求
            setTimeout(() => {
              this.stopAllTimers();
              this.gameResult = '和棋（双方同意）';
              
              // 处理游戏结束
              this.handleGameEnd('draw');
            }, 1000);
          }
        }
      });
    },
    
    // 认输
    resignGame() {
      uni.showModal({
        title: '认输确认',
        content: '你确定要认输吗？',
        success: (res) => {
          if (res.confirm) {
            this.stopAllTimers();
            this.gameResult = `${this.opponentName} 胜出（认输）`;
            
            // 处理游戏结束
            this.handleGameEnd('defeat');
          }
        }
      });
    },
    
    // 发送聊天消息
    sendChatMessage(message) {
      console.log('发送聊天消息:', message);
      // 实际项目中应发送消息给服务器
    },
    
    // 开始新游戏
    startNewGame() {
      // 重置对局状态
      this.resetBoard();
      this.gameStarted = true;
      this.matching = false;
      this.gameResult = null;
      this.isCheckmated = false;
      this.checkmateColor = '';
      
      // 随机分配执棋方
      this.playAs = Math.random() < 0.5 ? 'white' : 'black';
      
      // 开始计时（白方先行）
      this.startWhiteTimer();
      
      uni.showToast({
        title: `新对局已开始，您执${this.playAs === 'white' ? '白' : '黑'}子`,
        icon: 'none'
      });
    },
    
    // 棋盘准备好的处理
    handleBoardReady() {
      // 可以在这里进行初始化工作
      console.log('棋盘已准备好');
    },
    
    // 处理兵升变
    handlePromotion(move) {
      const { from, to, promoteTo } = move;
      // 完成升变
      this.movePiece(from.row, from.col, to.row, to.col, { 
        promoteTo: promoteTo,
        isPromotion: true
      });
    },
    
    // 处理棋盘格子点击
    handleCellClick(position) {
      const { row, col } = position;
      const piece = this.chessboard[row][col];
      
      // 如果已经选中棋子，尝试移动
      if (this.selectedPosition) {
        // 如果点击的是同一个位置，取消选择
        if (this.selectedPosition.row === row && this.selectedPosition.col === col) {
          this.selectedPosition = null;
          this.validMoves = [];
          return;
        }
        
        // 如果点击的是有效移动位置，执行移动
        const validMove = this.validMoves.find(move => move.row === row && move.col === col);
        if (validMove) {
          // 检查是否有特殊移动属性
          const moveInfo = {};
          
          if (validMove.isCastling) {
            moveInfo.isCastling = true;
            moveInfo.rookFrom = validMove.rookFrom;
            moveInfo.rookTo = validMove.rookTo;
          } else if (validMove.isEnPassant) {
            moveInfo.isEnPassant = true;
            moveInfo.capturedPiecePos = validMove.capturedPiecePos;
            console.log('执行吃过路兵移动，被吃子位置:', validMove.capturedPiecePos);
          }
          
          // 执行移动
          this.movePiece(this.selectedPosition.row, this.selectedPosition.col, row, col, moveInfo);
          this.selectedPosition = null;
          this.validMoves = [];
          return;
        }
        
        // 如果点击的是同颜色的其他棋子，更新选择
        if (piece && getPieceColor(piece) === this.currentPlayer) {
          this.selectPiece(row, col);
          return;
        }
        
        // 否则，取消选择
        this.selectedPosition = null;
        this.validMoves = [];
      } 
      // 如果没有选中棋子，且点击了当前玩家的棋子，选中它
      else if (piece && getPieceColor(piece) === this.currentPlayer) {
        this.selectPiece(row, col);
      }
    },
    
    // 选择棋子
    selectPiece(row, col) {
      this.selectedPosition = { row, col };
      // 获取有效移动
      this.validMoves = getValidMoves(this.chessboard, row, col);
      
      // 检查是否有特殊移动
      this.checkForSpecialMoves(row, col);
    },
    
    // 检查特殊移动（王车易位、吃过路兵等）
    checkForSpecialMoves(row, col) {
      const piece = this.chessboard[row][col];
      const pieceType = getPieceType(piece);
      const pieceColor = getPieceColor(piece);
      
      // 通知棋盘组件清空之前的特殊移动标记
      this.$refs.chessBoard?.setCastlingPositions([]);
      this.$refs.chessBoard?.setEnPassantPosition(null);
      
      // 检查王车易位
      if (pieceType === 'king') {
        // 找出有效移动中的王车易位
        const castlingMoves = getCastlingMoves(this.chessboard, row, col, pieceColor);
        if (castlingMoves.length > 0) {
          this.$refs.chessBoard?.setCastlingPositions(castlingMoves);
        }
      }
      
      // 检查吃过路兵
      if (pieceType === 'pawn') {
        // 找出有效移动中的吃过路兵
        const enPassantMove = this.validMoves.find(move => move.isEnPassant);
        if (enPassantMove) {
          console.log('找到吃过路兵移动:', enPassantMove);
          // 传递完整的过路兵信息，包括目标位置和被吃掉的棋子位置
          this.$refs.chessBoard?.setEnPassantPosition({
            row: enPassantMove.row,
            col: enPassantMove.col,
            capturedPiecePos: enPassantMove.capturedPiecePos // 添加被吃掉的棋子位置信息
          });
          
          // 详细调试信息
          console.log('吃过路兵详情 - 当前位置:', {row, col}, 
            '目标位置:', {row: enPassantMove.row, col: enPassantMove.col}, 
            '被吃棋子位置:', enPassantMove.capturedPiecePos);
        } else {
          console.log('当前棋子没有吃过路兵的移动');
        }
      }
    },
    
    // 显示胜负结果弹窗
    showResultPopup(result) {
      switch(result) {
        case 'victory':
          this.$refs.victoryPopup.open('center');
          break;
        case 'defeat':
          this.$refs.defeatPopup.open('center');
          break;
        case 'draw':
          this.$refs.drawPopup.open('center');
          break;
      }
    },
    
    // 关闭结果弹窗
    closeResultPopup() {
      this.$refs.victoryPopup.close();
      this.$refs.defeatPopup.close();
      this.$refs.drawPopup.close();
    },
    
    // 处理比赛总结按钮
    handleSummary() {
      this.closeResultPopup();
      // 这里可以添加跳转到比赛总结页面的逻辑
      uni.showToast({
        title: '查看比赛总结',
        icon: 'none'
      });
    },
    
    // 处理新的一局按钮
    handleNewGame() {
      this.closeResultPopup();
      this.startNewGame();
    },
    
    // 处理结果弹窗关闭
    handleResultClose() {
      console.log('结果弹窗已关闭');
    },
    
    // 显示邀请弹窗
    showInvitation(inviter) {
      this.currentInviter = inviter;
      this.$refs.invitationPopup.open();
    },
    
    // 处理接受邀请
    handleAcceptInvitation(inviter) {
      console.log('接受邀请:', inviter);
      
      // 更新对手信息
      this.opponentName = inviter.name;
      if (inviter.timeControl) {
        this.timeControl = inviter.timeControl;
      }
      
      // 重置棋盘、开始游戏
      this.resetBoard();
      this.gameStarted = true;
      this.matching = false;
      this.gameResult = null;
      this.isCheckmated = false;
      this.checkmateColor = '';
      
      // 随机选择执棋方
      this.playAs = Math.random() < 0.5 ? 'white' : 'black';
      
      // 切换到对战标签
      this.activeTab = 'match';
      
      // 开始计时
      this.startWhiteTimer();
      
      uni.showToast({
        title: `对局已开始，您执${this.playAs === 'white' ? '白' : '黑'}子`,
        icon: 'success'
      });
    },
    
    // 处理拒绝邀请
    handleDeclineInvitation(inviter) {
      console.log('拒绝邀请:', inviter);
      uni.showToast({
        title: '已拒绝邀请',
        icon: 'none'
      });
    },
    
    // 测试邀请弹窗 (仅用于开发测试)
    testInvitation(userName = '') {
      const testInviter = {
        id: Math.floor(Math.random() * 1000) + 1,
        name: userName || `Player${Math.floor(Math.random() * 1000)}`,
        rating: Math.floor(Math.random() * 1500) + 1000,
        avatar: '/static/images/match/avatar-default.png',
        timeControl: ['5 min', '10 min', '15 min'][Math.floor(Math.random() * 3)]
      };
      
      this.showInvitation(testInviter);
    },
    
    // 模拟监听好友邀请
    simulateInvitationListener() {
      // 这里在实际应用中应该使用WebSocket等实时通讯技术
      // 用于接收服务器推送的好友邀请
      
      // 模拟接收URL参数中的邀请
      const query = uni.getStorageSync('pending_invitation');
      if (query) {
        uni.removeStorageSync('pending_invitation');
        
        // 解析邀请信息并显示弹窗
        try {
          const inviter = JSON.parse(query);
          setTimeout(() => {
            this.showInvitation(inviter);
          }, 1000);
        } catch (e) {
          console.error('无效的邀请信息', e);
        }
      }
      
      // 增加一个测试按钮点击事件
      uni.$on('test_invitation', (data) => {
        this.showInvitation(data.inviter);
      });
    },
    
    // 生成测试邀请URL (仅用于开发测试)
    generateTestInvitationUrl() {
      const testInviter = {
        id: Math.floor(Math.random() * 1000) + 1,
        name: 'LucTestAccount',
        rating: 236,
        avatar: '/static/images/match/avatar-default.png',
        timeControl: '10 min'
      };
      
      // 将邀请信息转为URL参数
      const invitationParam = encodeURIComponent(JSON.stringify(testInviter));
      const url = `/pages/play/match/index?invitation=${invitationParam}`;
      
      // 复制到剪贴板
      uni.setClipboardData({
        data: url,
        success: () => {
          uni.showToast({
            title: '测试URL已复制到剪贴板，可在新窗口打开',
            icon: 'none',
            duration: 2000
          });
        }
      });
      
      // 同时存储到本地缓存，用于模拟接收邀请
      uni.setStorageSync('pending_invitation', JSON.stringify(testInviter));
      
      return url;
    },
    
    // 处理游戏结束后的操作
    handleGameEnd(result) {
      // 停止计时器
      this.stopAllTimers();
      
      // 如果是天梯赛模式，先显示积分结算
      if (this.isLeaderboardMode) {
        // 延迟显示弹窗，给用户足够时间看到棋盘最终状态
        setTimeout(() => {
          this.showLeaderboardResult(result);
        }, 1500);
      } else {
        // 非天梯赛模式，直接显示普通结果弹窗
        setTimeout(() => {
          this.showResultPopup(result);
        }, 1000);
      }
    },
    
    // 显示天梯赛结果
    showLeaderboardResult(result) {
      // 计算积分变化
      let pointsChange = 0;
      
      if (result === 'victory') {
        // 胜利获得积分，基础15分加上根据对手积分的额外加成
        const basePoints = 15;
        const difficultyBonus = Math.max(0, Math.floor((this.opponentRating - 335) / 100));
        pointsChange = basePoints + difficultyBonus;
      } else if (result === 'defeat') {
        // 失败扣除积分，基础10分减去根据对手积分的减免
        const basePoints = -10;
        const difficultyBonus = Math.min(5, Math.max(0, Math.floor((this.opponentRating - 335) / 150)));
        pointsChange = basePoints + difficultyBonus;
      } else {
        // 和棋，积分变化较小
        pointsChange = Math.floor(Math.random() * 5) - 2; // -2到2之间的随机数
      }
      
      // 更新积分（实际应用中应该发送到服务器保存）
      this.playerRating = 335 + pointsChange;
      
      // 设置积分变化数据
      this.ratingChange = {
        before: 335,
        after: this.playerRating,
        change: pointsChange
      };
      
      // 显示普通结果弹窗，结果弹窗中已包含积分显示
      this.showResultPopup(result);
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/chess/chess-common.scss";

// 对战区域样式
.battle-area {
  display: flex;
  flex-direction: column;
  padding: 20rpx 10rpx;
  
  .board-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20rpx 0;
  }
}

// 返回按钮
.back-button {
  position: fixed;
  top: 40rpx;
  left: 20rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
  z-index: 999;
}

// 测试按钮样式
.debug-tools {
  margin-top: 20rpx;
  padding: 20rpx;
  display: flex;
  justify-content: center;
  
  .start-match-btn, .test-invitation-btn, .gen-url-btn {
    background-color: #81B64C;
    color: #fff;
    font-size: 28rpx;
    padding: 20rpx 40rpx;
    border-radius: 10rpx;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
    margin: 0 10rpx;
    
    &:active {
      opacity: 0.8;
    }
  }
  
  .test-invitation-btn {
    background-color: #2196F3;
  }
  
  .gen-url-btn {
    background-color: #FF9800;
  }
}

// 添加胜负弹窗样式
.result-popup {
  width: 550rpx;
  padding: 40rpx 20rpx;
  border-radius: 20rpx;
  position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
  
  
  .result-icon {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 20rpx;
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .result-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #fff;
        margin-bottom: 10rpx;
      }
      
  .result-description {
    font-size: 30rpx;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 30rpx;
  }
  
  .result-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    
    .action-btn {
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 10rpx;
      font-size: 28rpx;
      margin-bottom: 16rpx;
    }
    
    .primary-btn {
      background-color: #81B64C;
      color: #fff;
    }
    
    .secondary-btn {
      background-color: #555;
      color: #fff;
    }
  }
  
  .popup-close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.victory-popup {
  background-color: rgba(0, 0, 0, 0.85);
  .result-title {
    color: #81B64C
  }
}

.defeat-popup {
  background-color: rgba(0, 0, 0, 0.85);
  
  .result-title {
    color: #999;
  }
}

.draw-popup {
  background-color: rgba(0, 0, 0, 0.85);
  .result-title {
    color: #EEE;
  }
}

// 天梯赛结果弹窗中的积分变化样式
.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90%;
  margin: 20rpx 0 30rpx;
  padding: 20rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  
  .rating-label {
    font-size: 30rpx;
    color: #AAAAAA;
    margin-bottom: 10rpx;
  }
  
  .rating-value-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .rating-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #FFFFFF;
  }
  
  .rating-change {
    font-size: 52rpx;
    font-weight: bold;
    margin-left: 15rpx;
    
    &.positive {
      color: #81B64C;
    }
    
    &.negative {
      color: #E53935;
    }
  }
}
</style>