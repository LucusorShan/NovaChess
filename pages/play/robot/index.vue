<template>
  <view class="robot-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 主内容区域（设置两侧间距） -->
    <view class="main-content">
      <!-- 棋盘对战区 -->
      <view class="chess-section">
        <!-- 对战信息区 -->
        <view class="player-info-container">
          <!-- 对手信息（机器人放在上方） -->
          <player-info 
            :is-opponent="true"
            :player-name="robotName"
            :avatar="robotAvatar"
            :flag="robotFlag"
            :is-turn="isRobotTurn"
          />
          
          <!-- 棋盘区域 -->
          <view class="board-container">
            <chess-board 
              ref="chessBoard"
              :board-state="boardState"
              :selected-position="selectedPosition"
              :valid-moves="validMoves"
              :last-move="lastMove"
              :current-player="currentPlayer"
              :play-as="playerColor"
              :is-checkmated="isCheckmated"
              :checkmate-color="checkmateColor"
              @cell-click="handleCellClick"
            />
          </view>
          
          <!-- 玩家信息（放在底部） -->
          <player-info 
            :is-opponent="false"
            :player-name="playerName"
            :avatar="playerAvatar"
            :flag="playerFlag"
            :is-turn="!isRobotTurn"
          />
        </view>
      </view>
      
      <!-- 智能教练选择区 -->
      <view v-if="isSelectionMode" class="coach-section">
        <!-- 标题区 -->
        <view class="coach-title">
          <image class="coach-icon" src="https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9d.png" mode="aspectFit"></image>
          <text class="coach-heading">智能教练</text>
        </view>
        
        <!-- 机器人介绍区 -->
        <view class="robot-intro">
          <!-- 左侧头像 -->
          <image class="robot-avatar" :src="robotAvatar" mode="aspectFill"></image>
          
          <!-- 右侧气泡框及信息 -->
          <view class="robot-details">
            <!-- 气泡框自我介绍 -->
            <view class="speech-bubble">
              <text>这是一些机器人风格自我介绍</text>
            </view>
            
            <!-- 底部信息区域 -->
            <view class="robot-info">
              <!-- 名称 -->
              <text class="robot-name">{{ robotName }}</text>
              <!-- 积分 -->
              <text class="robot-rating">{{ robotRating }}</text>
              <!-- 国旗 -->
              <image v-if="robotFlag" class="robot-flag" :src="robotFlag" mode="aspectFit"></image>
            </view>
          </view>
        </view>
        
        <!-- 候选列表区 -->
        <view class="robot-candidates">
          <!-- 社区路人分组 -->
          <view class="candidate-group">
            <text class="group-title">社区路人</text>
            <view class="candidate-count">5 位候选</view>
            <scroll-view class="candidate-scroll" scroll-x="true">
              <view class="candidate-list">
                <view 
                  v-for="(robot, index) in casualRobots" 
                  :key="index" 
                  class="candidate-item"
                  :class="{ 'selected': selectedRobotId === robot.id }"
                  @click="selectRobot(robot.id)"
                >
                  <image class="candidate-avatar" :src="robot.avatar" mode="aspectFill"></image>
                  <image v-if="robot.locked" class="lock-icon" src="/static/images/robot/lock.png" mode="aspectFit"></image>
                </view>
              </view>
            </scroll-view>
          </view>
          
          <!-- 比赛常客分组 -->
          <view class="candidate-group">
            <text class="group-title">比赛常客</text>
            <view class="candidate-count">5 位候选</view>
            <scroll-view class="candidate-scroll" scroll-x="true">
              <view class="candidate-list">
                <view 
                  v-for="(robot, index) in expertRobots" 
                  :key="index" 
                  class="candidate-item"
                  :class="{ 'selected': selectedRobotId === robot.id }"
                  @click="selectRobot(robot.id)"
                >
                  <image class="candidate-avatar" :src="robot.avatar" mode="aspectFill"></image>
                  <image v-if="robot.locked" class="lock-icon" src="/static/images/robot/lock.png" mode="aspectFit"></image>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="action-button" @click="startGame">
          <text class="button-text">开玩</text>
        </view>
      </view>
      
      <!-- 智能教练对战区 -->
      <view v-else class="battle-section">
        <!-- 标题区 -->
        <view class="coach-title">
          <image class="coach-icon" src="https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9d.png" mode="aspectFit"></image>
          <text class="coach-heading">智能教练</text>
        </view>
        
        <!-- 机器人聊天气泡 -->
        <view class="robot-chat-container" v-if="currentRobotMessage">
          <image class="robot-chat-avatar" :src="robotAvatar" mode="aspectFill"></image>
          <view class="speech-bubble">
            <text>{{ currentRobotMessage }}</text>
          </view>
        </view>
        
        <!-- 棋局信息栏 -->
        <view class="match-info">
          <view class="opening-info">
            <text class="opening-text">开局: {{ openingName }}</text>
            <view class="info-icon">
              <uni-icons type="info" size="18" color="#fff"></uni-icons>
            </view>
          </view>
          
          <!-- 走棋记录 -->
          <view class="moves-record">
            <scroll-view 
              class="moves-scroll" 
              scroll-y="true"
              :scroll-top="scrollTop"
            >
              <view v-if="formattedMoveHistory.length === 0" class="no-moves">
                <text>棋局开始，等待第一步...</text>
              </view>
              <view 
                v-for="(move, index) in formattedMoveHistory" 
                :key="index"
                class="move-item"
              >
                <text class="move-number">{{ move.moveNumber }}.</text>
                <view class="move-detail">
                  <view class="move-column white-move" v-if="move.white">
                    <view class="move-notation">
                      <image class="piece-icon" :src="getPieceIcon(move.white.piece)" mode="aspectFit"></image>
                      <text>{{ move.white.notation }}</text>
                    </view>
                  </view>
                  <view class="move-column black-move" v-if="move.black">
                    <view class="move-notation">
                      <image class="piece-icon" :src="getPieceIcon(move.black.piece)" mode="aspectFit"></image>
                      <text>{{ move.black.notation }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>
        
        <!-- 控制按钮 -->
        <view class="control-buttons">
          <view class="ctrl-row">
            <view class="ctrl-btn prev-btn" @click="prevMove">
              <text class="btn-icon">←</text>
            </view>
            <view class="ctrl-btn next-btn" @click="nextMove">
              <text class="btn-icon">→</text>
            </view>
            <view class="ctrl-btn hint-btn" @click="showHint">
              <text class="btn-icon">💡</text>
            </view>
            <view class="ctrl-btn resign-btn" @click="resignGame">
              <text class="btn-icon">🏳️</text>
            </view>
          </view>
          <view class="ctrl-row">
            <view class="ctrl-btn restart-btn" @click="restartGame">
              <text>重新开始</text>
            </view>
            <view class="ctrl-btn back-btn" @click="backToSelection">
              <text>选择教练</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 结果弹窗 -->
    <uni-popup ref="victoryPopup" type="center" @change="handleResultClose">
      <view class="result-popup victory-popup">
        <!-- 标题区 -->
        <view class="result-title">
          <text>你打败了</text>
          <text>邻居大叔！</text>
        </view>
        
        <!-- 玩家对战信息 -->
        <view class="result-players">
          <view class="player-side">
            <image class="player-avatar" :src="robotAvatar" mode="aspectFill"></image>
            <text class="player-name">{{ robotName }}</text>
          </view>
          
          <view class="vs-text">
            <text>VS</text>
          </view>
          
          <view class="player-side">
            <image class="player-avatar" :src="playerAvatar" mode="aspectFill"></image>
            <text class="player-name">{{ playerName }}</text>
          </view>
        </view>
        
        <!-- 分数评级 -->
        <view class="result-rating">
          <view class="crown" v-for="i in 3" :key="i"></view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="restartGame">再来一局！</view>
          <view class="action-btn secondary-btn" @click="backToSelection">换个教练</view>
        </view>
      </view>
    </uni-popup>
    
    <uni-popup ref="defeatPopup" type="center" @change="handleResultClose">
      <view class="result-popup defeat-popup">
        <!-- 标题区 -->
        <view class="result-title">
          <text>赵德柱</text>
          <text>拿下了对局！</text>
        </view>
        
        <!-- 玩家对战信息 -->
        <view class="result-players">
          <view class="player-side winner-side">
            <image class="player-avatar" :src="robotAvatar" mode="aspectFill"></image>
            <view class="winner-mark"></view>
          </view>
          
          <view class="vs-text">
            <text>VS</text>
          </view>
          
          <view class="player-side">
            <image class="player-avatar" :src="playerAvatar" mode="aspectFill"></image>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="restartGame">再来一局！</view>
          <view class="action-btn secondary-btn" @click="backToSelection">换个教练</view>
        </view>
      </view>
    </uni-popup>
    
    <uni-popup ref="drawPopup" type="center" @change="handleResultClose">
      <view class="result-popup draw-popup">
        <view class="result-icon">
          <image src="/static/images/match/draw.png" mode="aspectFit"></image>
        </view>
        <view class="result-title">
          <text>和棋</text>
        </view>
        <view class="result-description">
          <text>双方实力旗鼓相当！</text>
        </view>
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="restartGame">再来一局</view>
          <view class="action-btn secondary-btn" @click="backToSelection">更换对手</view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 底部导航栏 -->
    <tab-bar activeTab="play"></tab-bar>
  </view>
</template>

<script>
import ChessBoard from '@/components/chess/ChessBoard.vue';
import PlayerInfo from '@/components/chess/PlayerInfo.vue';
import TabBar from '@/components/TabBar.vue';
import TopSpacing from '@/components/TopSpacing.vue'
import { 
  getPieceColor, 
  getPieceType, 
  getValidMoves,
  isKingInCheck,
  recordMove,
  resetChessBoardState
} from '@/utils/chess/cheesLogic.js';

export default {
  components: {
    ChessBoard,
    PlayerInfo,
    TabBar,
    TopSpacing
  },
  data() {
    return {
      statusBarHeight: 0,
      // 玩家信息
      playerName: '我',
      playerAvatar: '/static/images/match/avatar-user.png',
      playerFlag: 'https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9012.png',
      playerColor: 'white',
      
      // 机器人信息
      robotName: '邻居大叔',
      robotAvatar: '/static/images/robot/neighbor.png',
      robotFlag: 'https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9012.png',
      robotRating: '1200',
      
      // 游戏状态
      isRobotTurn: false,
      boardState: this.initBoardState(),
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      currentPlayer: 'white',
      isCheckmated: false,
      checkmateColor: '',
      
      // 机器人列表
      selectedRobotId: 'neighbor',
      casualRobots: [
        { id: 'neighbor', name: '邻居大叔', avatar: 'https://pic1.imgdb.cn/item/67f3c549e381c3632bee8fb8.png', rating: 1200, locked: false },
        { id: 'student', name: '单楚雄', avatar: 'https://pic1.imgdb.cn/item/67f3c549e381c3632bee8fb7.png', rating: 1300, locked: false },
        { id: 'librarian', name: '熊出山', avatar: 'https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8fa1.png', rating: 1400, locked: false },
        { id: 'chef', name: '出山熊', avatar: 'https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9e.png', rating: 1500, locked: false },
        { id: 'officer', name: 'Eva', avatar: 'https://pic1.imgdb.cn/item/67f3c549e381c3632bee8fba.png', rating: 1600, locked: true }
      ],
      expertRobots: [
        { id: 'master', name: '象棋大师', avatar: 'https://pic1.imgdb.cn/item/67f3c549e381c3632bee8fba.png', rating: 1800, locked: true },
        { id: 'professor', name: '象棋教授', avatar: 'https://pic1.imgdb.cn/item/67f3c549e381c3632bee8fb9.png', rating: 1900, locked: true },
        { id: 'champion', name: '地区冠军', avatar: 'https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9c.png', rating: 2000, locked: true },
        { id: 'grandmaster', name: '特级大师', avatar: 'https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9f.png', rating: 2200, locked: true },
        { id: 'legend', name: '传奇棋手', avatar: 'https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8fa0.png', rating: 2500, locked: true }
      ],
      
      // 界面状态
      isSelectionMode: true, // 新增：判断是否是选择模式还是对战模式
      
      // 对战模式的属性
      robotMessages: [ // 机器人对话集合
        "让我思考一下...",
        "这步棋很有趣！",
        "你下得很好！",
        "我要全力应对了。",
        "看来你比我厉害啊！",
        "这个局面很复杂。",
        "我犯了个错误！",
        "干得漂亮！",
        "我得小心一点了。",
        "这是个陷阱吗？"
      ],
      currentRobotMessage: '', // 当前机器人消息
      messageTimeout: null, // 消息定时器
      
      // 走棋记录
      moveHistory: [],
      formattedMoveHistory: [],
      scrollTop: 0,
      
      // 复盘状态
      isReviewing: false,
      currentMoveIndex: -1,
      originalBoardState: [],
      
      // 开局名称
      openingName: '标准开局',
      
      // 游戏结束
      gameOver: false,
      
      // 特殊走法
      specialMoves: {
        castling: [],  // 王车易位
        enPassant: null, // 吃过路兵
        promotion: {   // 兵升变
          pendingMove: null,
          showDialog: false
        }
      },
      
      // 升变选项
      promotionOptions: ['queen', 'rook', 'bishop', 'knight'] // 可选的升变棋子
    };
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // ... existing onLoad code ...
  },
  methods: {
    // 初始化棋盘状态
    initBoardState() {
      // 初始化一个8x8的棋盘数组
      const board = Array(8).fill().map(() => Array(8).fill(null));
      
      // 设置初始棋子位置
      // 白方棋子
      board[7][0] = 'white-rook';
      board[7][1] = 'white-knight';
      board[7][2] = 'white-bishop';
      board[7][3] = 'white-queen';
      board[7][4] = 'white-king';
      board[7][5] = 'white-bishop';
      board[7][6] = 'white-knight';
      board[7][7] = 'white-rook';
      for (let i = 0; i < 8; i++) {
        board[6][i] = 'white-pawn';
      }
      
      // 黑方棋子
      board[0][0] = 'black-rook';
      board[0][1] = 'black-knight';
      board[0][2] = 'black-bishop';
      board[0][3] = 'black-queen';
      board[0][4] = 'black-king';
      board[0][5] = 'black-bishop';
      board[0][6] = 'black-knight';
      board[0][7] = 'black-rook';
      for (let i = 0; i < 8; i++) {
        board[1][i] = 'black-pawn';
      }
      
      return board;
    },
    
    // 处理棋盘格子点击
    handleCellClick(position) {
      // 如果游戏已结束或正在复盘，不允许操作
      if (this.gameOver || this.isReviewing) return;
      
      // 如果是机器人回合，不允许操作
      if (this.isRobotTurn) return;
      
      const { row, col } = position;
      const piece = this.boardState[row][col];
      
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
          // 执行移动
          this.makeMove(this.selectedPosition, position, validMove);
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
      } else {
        // 选择棋子
        if (piece && getPieceColor(piece) === this.currentPlayer) {
          this.selectPiece(row, col);
        }
      }
    },
    
    // 选择棋子
    selectPiece(row, col) {
      this.selectedPosition = { row, col };
      // 获取有效移动
      this.validMoves = getValidMoves(this.boardState, row, col);
    },
    
    // 移动棋子
    makeMove(from, to, moveInfo = {}) {
      const piece = this.boardState[from.row][from.col];
      if (!piece) return;
      
      // 检查是否是兵升变
      const isPawn = getPieceType(piece) === 'pawn';
      const isReachingEnd = (getPieceColor(piece) === 'white' && to.row === 0) || 
                           (getPieceColor(piece) === 'black' && to.row === 7);
      
      if (isPawn && isReachingEnd && !moveInfo.promoteTo) {
        // 需要显示升变选择
        this.specialMoves.promotion.pendingMove = { from, to };
        this.$refs.promotionPopup.open('center');
        return;
      }
      
      // 记录被吃掉的棋子
      const capturedPiece = this.boardState[to.row][to.col];
      
      // 更新棋盘状态
      const move = recordMove(this.boardState, from, to, moveInfo);
      
      // 记录最后一步移动
      this.lastMove = move;
      
      // 记录走棋记录
      this.recordMoveHistory(from, to, piece, capturedPiece, moveInfo);
      
      // 根据走棋步数更新开局名称
      this.updateOpeningName();
      
      // 检查是否吃掉对方的王
      if (capturedPiece && getPieceType(capturedPiece) === 'king') {
        // 游戏结束
        this.gameOver = true;
        
        // 确定胜负
        const movingColor = getPieceColor(piece);
        const isPlayerWinner = movingColor === this.playerColor;
        
        if (isPlayerWinner) {
          this.showRobotMessage("你赢了！你吃掉了我的王。");
          // 显示将杀特效和胜利弹窗
          if (this.$refs.chessBoard) {
            this.$refs.chessBoard.showCheckmate(true, getPieceColor(capturedPiece));
          }
          setTimeout(() => {
            this.$refs.victoryPopup.open();
          }, 2000);
        } else {
          this.showRobotMessage("将军！我赢了。");
          // 显示将杀特效和失败弹窗
          if (this.$refs.chessBoard) {
            this.$refs.chessBoard.showCheckmate(true, getPieceColor(capturedPiece));
          }
          setTimeout(() => {
            this.$refs.defeatPopup.open();
          }, 2000);
        }
        
        // 不继续执行后续逻辑
        return;
      }
      
      // 如果有吃子，机器人可能说话
      if (capturedPiece) {
        if (getPieceColor(piece) === this.playerColor) {
          // 玩家吃了机器人的子
          this.showRobotMessage(this.getRandomCapturedMessage());
        } else {
          // 机器人吃了玩家的子
          this.showRobotMessage(this.getRandomCapturingMessage());
        }
      }
      
      // 切换玩家
      this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
      this.isRobotTurn = !this.isRobotTurn;
      
      // 检查游戏结局
      this.checkGameOutcome();
      
      // 如果轮到机器人，模拟机器人思考和走棋
      if (!this.gameOver && this.isRobotTurn) {
        setTimeout(() => {
          this.robotMove();
        }, 1500);
      }
      
      // 重置选择状态
      this.selectedPosition = null;
      this.validMoves = [];
    },
    
    // 机器人走棋（简化版，可以根据难度级别调整）
    robotMove() {
      // 显示思考中消息
      this.showRobotMessage("让我思考一下...");
      
      setTimeout(() => {
        // 获取所有机器人的棋子
        const robotPieces = [];
        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const piece = this.boardState[row][col];
            if (piece && getPieceColor(piece) === this.currentPlayer) {
              robotPieces.push({ row, col });
            }
          }
        }
        
        // 为每个棋子计算可能的移动
        let allMoves = [];
        robotPieces.forEach(piece => {
          const moves = getValidMoves(this.boardState, piece.row, piece.col);
          moves.forEach(move => {
            allMoves.push({
              from: piece,
              to: move,
              score: this.evaluateMove(piece, move)
            });
          });
        });
        
        // 根据分数排序移动
        allMoves.sort((a, b) => b.score - a.score);
        
        if (allMoves.length > 0) {
          // 选择得分最高的移动（添加一些随机性，不总是选最佳）
          const topMoves = allMoves.slice(0, Math.min(3, allMoves.length));
          const selectedMoveIndex = Math.floor(Math.random() * topMoves.length);
          const selectedMove = topMoves[selectedMoveIndex];
          
          // 执行移动
          this.makeMove(selectedMove.from, selectedMove.to);
        } else {
          // 没有可行的移动，游戏结束
          this.handleCheckmate(); // 或者和棋
        }
      }, 1000); // 思考时间
    },
    
    // 评估移动的得分（简单版本，可根据需要扩展）
    evaluateMove(from, to) {
      let score = 0;
      const piece = this.boardState[from.row][from.col];
      const targetPiece = this.boardState[to.row][to.col];
      
      // 基本策略：吃子比不吃子好
      if (targetPiece) {
        // 根据被吃棋子的价值评分
        score += this.getPieceValue(targetPiece);
      }
      
      // 中心控制
      const centerDistance = Math.abs(to.row - 3.5) + Math.abs(to.col - 3.5);
      score += (4 - centerDistance) * 0.1; // 越靠近中心分数越高
      
      // 随机因素，增加游戏变化性
      score += Math.random() * 0.5;
      
      return score;
    },
    
    // 获取棋子价值
    getPieceValue(piece) {
      const type = getPieceType(piece);
      switch (type) {
        case 'pawn': return 1;
        case 'knight': return 3;
        case 'bishop': return 3;
        case 'rook': return 5;
        case 'queen': return 9;
        case 'king': return 100; // 极高值确保优先保护王
        default: return 0;
      }
    },
    
    // 检查游戏结局
    checkGameOutcome() {
      // 检查是否是将军
      const isCheck = isKingInCheck(this.boardState, this.currentPlayer);
      
      if (isCheck) {
        // 如果是将军，检查是否将杀
        const hasLegalMove = this.hasAnyLegalMove();
        
        if (!hasLegalMove) {
          // 将杀
          this.handleCheckmate();
        } else {
          // 仅是将军
          if (this.currentPlayer === this.playerColor) {
            this.showRobotMessage("将军！小心你的王。");
            if (this.$refs.chessBoard) {
              this.$refs.chessBoard.showCheckmate(false, this.currentPlayer);
            }
          } else {
            this.showRobotMessage("哈哈，将军！");
            if (this.$refs.chessBoard) {
              this.$refs.chessBoard.showCheckmate(false, this.currentPlayer);
            }
          }
        }
      } else {
        // 检查是否为逼和（无子可动）
        const hasLegalMove = this.hasAnyLegalMove();
        if (!hasLegalMove) {
          // 逼和
          this.handleStalemate();
        }
      }
    },
    
    // 检查当前玩家是否有任何合法移动
    hasAnyLegalMove() {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.boardState[row][col];
          if (piece && getPieceColor(piece) === this.currentPlayer) {
            const moves = getValidMoves(this.boardState, row, col);
            if (moves.length > 0) {
              return true;
            }
          }
        }
      }
      return false;
    },
    
    // 处理将杀
    handleCheckmate() {
      // 设置游戏结束状态
      this.gameOver = true;
      this.isCheckmated = true;
      this.checkmateColor = this.currentPlayer;
      
      // 确定胜负方
      const isPlayerWin = this.checkmateColor !== this.playerColor;
      
      // 显示将杀动画
      if (this.$refs.chessBoard) {
        this.$refs.chessBoard.showCheckmate(true, this.checkmateColor);
      }
      
      // 机器人说话
      if (isPlayerWin) {
        this.showRobotMessage("你真厉害！我认输了。");
      } else {
        this.showRobotMessage("将军！我赢了这局。");
      }
      
      // 显示结果弹窗
      setTimeout(() => {
        if (isPlayerWin) {
          this.$refs.victoryPopup.open();
        } else {
          this.$refs.defeatPopup.open();
        }
      }, 2000);
    },
    
    // 处理逼和
    handleStalemate() {
      // 设置游戏结束状态
      this.gameOver = true;
      
      // 显示和棋消息
      this.showRobotMessage("看来是平局了！");
      
      // 显示和棋弹窗
      setTimeout(() => {
        this.$refs.drawPopup.open();
      }, 1500);
    },
    
    // 投降游戏
    resignGame() {
      // 游戏结束
      this.gameOver = true;
      this.showRobotMessage("不要气馁，下次再来挑战吧！");
      
      // 显示失败弹窗
      setTimeout(() => {
        this.$refs.defeatPopup.open();
      }, 1000);
    },
    
    // 显示提示
    showHint() {
      if (this.gameOver || this.isReviewing || this.isRobotTurn) return;
      
      // 查找玩家当前可用的最佳移动
      const bestMove = this.findBestPlayerMove();
      if (bestMove) {
        // 高亮提示的起始位置
        this.selectPiece(bestMove.from.row, bestMove.from.col);
        
        // 机器人给出提示
        this.showRobotMessage("我建议你考虑这个位置的棋子。");
      }
    },
    
    // 寻找玩家最佳移动
    findBestPlayerMove() {
      // 获取所有玩家的棋子
      const playerPieces = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = this.boardState[row][col];
          if (piece && getPieceColor(piece) === this.currentPlayer) {
            playerPieces.push({ row, col });
          }
        }
      }
      
      // 为每个棋子计算可能的移动
      let allMoves = [];
      playerPieces.forEach(piece => {
        const moves = getValidMoves(this.boardState, piece.row, piece.col);
        moves.forEach(move => {
          allMoves.push({
            from: piece,
            to: move,
            score: this.evaluateMove(piece, move)
          });
        });
      });
      
      // 根据分数排序移动
      allMoves.sort((a, b) => b.score - a.score);
      
      return allMoves.length > 0 ? allMoves[0] : null;
    },
    
    // 处理升变选择
    selectPromotionPiece(pieceType) {
      // 关闭升变弹窗
      this.$refs.promotionPopup.close();
      
      const pendingMove = this.specialMoves.promotion.pendingMove;
      if (!pendingMove) return;
      
      // 执行带有升变信息的移动
      this.makeMove(pendingMove.from, pendingMove.to, { 
        promoteTo: pieceType,
        isPromotion: true
      });
      
      // 清除升变状态
      this.specialMoves.promotion.pendingMove = null;
      
      // 机器人可能对此评论
      this.showRobotMessage("哇！你获得了一个强大的棋子！");
    },
    
    // 记录走棋历史
    recordMoveHistory(from, to, piece, captured, moveInfo = {}) {
      const pieceType = getPieceType(piece);
      const pieceColor = getPieceColor(piece);
      
      // 计算代数记谱法表示
      const notation = this.calculateNotation(from, to, piece, captured, moveInfo);
      
      // 存储完整移动信息
      this.moveHistory.push({
        piece: piece,
        from: from,
        to: to,
        captured: captured,
        notation: notation,
        ...moveInfo
      });
      
      // 更新格式化的历史记录
      if (pieceColor === 'white') {
        this.formattedMoveHistory.push({
          moveNumber: this.formattedMoveHistory.length + 1,
          white: {
            notation: notation,
            piece: piece
          },
          black: null
        });
      } else {
        const lastMove = this.formattedMoveHistory[this.formattedMoveHistory.length - 1];
        if (lastMove && lastMove.black === null) {
          lastMove.black = {
            notation: notation,
            piece: piece
          };
        } else {
          // 处理黑方先行的情况
          this.formattedMoveHistory.push({
            moveNumber: this.formattedMoveHistory.length + 1,
            white: null,
            black: {
              notation: notation,
              piece: piece
            }
          });
        }
      }
      
      // 更新滚动位置
      this.$nextTick(() => {
        this.scrollTop = 9999; // 滚动到底部
      });
    },
    
    // 计算代数记谱法
    calculateNotation(from, to, piece, captured, moveInfo = {}) {
      const pieceType = getPieceType(piece);
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      
      // 特殊情况：王车易位
      if (pieceType === 'king' && Math.abs(from.col - to.col) > 1) {
        return to.col > from.col ? 'O-O' : 'O-O-O'; // 短易位和长易位
      }
      
      let notation = '';
      
      // 添加棋子类型符号（除了兵）
      if (pieceType !== 'pawn') {
        const symbols = {
          'king': 'K',
          'queen': 'Q',
          'rook': 'R',
          'bishop': 'B',
          'knight': 'N'
        };
        notation += symbols[pieceType];
      } else if (captured) {
        // 兵吃子时，加上起始列
        notation += files[from.col];
      }
      
      // 添加吃子符号
      if (captured || moveInfo.isEnPassant) {
        notation += 'x';
      }
      
      // 添加目标位置
      notation += files[to.col] + ranks[to.row];
      
      // 添加升变信息
      if (moveInfo.isPromotion) {
        const promotePiece = moveInfo.promoteTo || 'queen';
        const symbols = {
          'queen': 'Q',
          'rook': 'R',
          'bishop': 'B',
          'knight': 'N'
        };
        notation += '=' + symbols[promotePiece];
      }
      
      // TODO: 添加将军和将杀符号
      
      return notation;
    },
    
    // 获取棋子图标
    getPieceIcon(piece) {
      if (!piece) return '';
      return `/static/images/match/pieces/${piece}.png`;
    },
    
    // 显示机器人消息
    showRobotMessage(message) {
      // 清除之前的消息超时
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      
      this.currentRobotMessage = message;
      
      // 设置消息显示时间
      this.messageTimeout = setTimeout(() => {
        this.currentRobotMessage = '';
      }, 5000);
    },
    
    // 获取随机被吃子消息
    getRandomCapturedMessage() {
      const messages = [
        "啊！我的棋子！",
        "哎呀，我得小心点。",
        "看来你比我厉害啊！",
        "好棋！",
        "这步我没考虑到。"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    },
    
    // 获取随机吃子消息
    getRandomCapturingMessage() {
      const messages = [
        "哈！我拿下了你的棋子。",
        "这步你没看到吧？",
        "看我的厉害！",
        "我找到了一个好机会。",
        "这是战术交换。"
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    },
    
    // 处理结果弹窗关闭
    handleResultClose(e) {
      // 弹窗关闭事件处理
      console.log('结果弹窗关闭');
    },
    
    // 更新开局名称
    updateOpeningName() {
      // 根据当前的走棋记录和局面判断开局名称
      // 这里只是一个简单示例，实际上可以有更复杂的开局数据库
      const moveCount = this.moveHistory.length;
      
      if (moveCount < 2) {
        this.openingName = '标准开局';
      } else if (moveCount === 2) {
        // 获取第一步的移动
        const firstMove = this.moveHistory[0];
        if (firstMove && getPieceType(firstMove.piece) === 'pawn') {
          // 检查是否是王翼兵开局
          if (firstMove.from.col === 4 && firstMove.to.col === 4) {
            this.openingName = '王后兵开局';
          } else if (firstMove.from.col === 3 && firstMove.to.col === 3) {
            this.openingName = '王兵开局';
          }
        }
      } else if (moveCount === 4) {
        // 这里可以添加更多开局判断
        const firstMoves = this.moveHistory.slice(0, 4);
        const pawnMoves = firstMoves.filter(move => getPieceType(move.piece) === 'pawn');
        const knightMoves = firstMoves.filter(move => getPieceType(move.piece) === 'knight');
        
        if (knightMoves.length >= 2) {
          this.openingName = '双骑士开局';
        } else if (pawnMoves.length === 4) {
          this.openingName = '双兵开局';
        }
      } else if (moveCount === 6) {
        // 更多复杂开局可以在这里判断
        // 例如西西里防御、法国防御等
        this.openingName = '发展开局';
      }
    },
    
    // 复盘操作 - 前一步
    prevMove() {
      if (this.moveHistory.length === 0) return;
      
      if (!this.isReviewing) {
        // 第一次进入复盘模式
        this.isReviewing = true;
        this.originalBoardState = JSON.parse(JSON.stringify(this.boardState));
        this.currentMoveIndex = this.moveHistory.length - 1;
      } else if (this.currentMoveIndex > 0) {
        // 向前回退一步
        this.currentMoveIndex--;
      } else {
        // 已经到初始位置
        this.currentMoveIndex = -1;
        this.rebuildBoardToMove(this.currentMoveIndex);
        return;
      }
      
      // 重建到指定步骤的棋盘
      this.rebuildBoardToMove(this.currentMoveIndex);
      
      // 显示复盘消息
      this.showRobotMessage("正在复盘: 第" + (this.currentMoveIndex + 1) + "步");
    },
    
    // 复盘操作 - 后一步
    nextMove() {
      if (this.moveHistory.length === 0) return;
      
      if (!this.isReviewing) {
        // 未处于复盘模式
        return;
      }
      
      if (this.currentMoveIndex < this.moveHistory.length - 1) {
        // 向后前进一步
        this.currentMoveIndex++;
        this.rebuildBoardToMove(this.currentMoveIndex);
        
        // 显示复盘消息
        this.showRobotMessage("正在复盘: 第" + (this.currentMoveIndex + 1) + "步");
      } else if (this.currentMoveIndex === this.moveHistory.length - 1) {
        // 已经是最后一步，退出复盘模式
        this.isReviewing = false;
        this.boardState = JSON.parse(JSON.stringify(this.originalBoardState));
        this.currentMoveIndex = -1;
        
        // 显示退出复盘消息
        this.showRobotMessage("已退出复盘模式");
      }
    },
    
    // 重建棋盘到指定步骤
    rebuildBoardToMove(moveIndex) {
      // 从初始棋盘开始重建
      const newBoard = this.initBoardState();
      
      if (moveIndex < 0) {
        // 回到初始状态
        this.boardState = newBoard;
        return;
      }
      
      // 应用到指定步骤的所有移动
      for (let i = 0; i <= moveIndex; i++) {
        const move = this.moveHistory[i];
        if (move) {
          // 应用移动
          recordMove(newBoard, move.from, move.to, {
            isPromotion: move.isPromotion,
            promoteTo: move.promoteTo,
            isCastling: move.isCastling,
            rookFrom: move.rookFrom,
            rookTo: move.rookTo,
            isEnPassant: move.isEnPassant,
            capturedPiecePos: move.capturedPiecePos
          });
        }
      }
      
      // 更新棋盘状态
      this.boardState = newBoard;
    },
    
    // 重新开始游戏
    restartGame() {
      // 关闭所有弹窗
      if (this.$refs.victoryPopup) this.$refs.victoryPopup.close();
      if (this.$refs.defeatPopup) this.$refs.defeatPopup.close();
      if (this.$refs.drawPopup) this.$refs.drawPopup.close();
      
      // 重新初始化游戏
      this.initGame();
    },
    
    // 返回到选择界面
    backToSelection() {
      // 切换回选择模式
      this.isSelectionMode = true;
    },
    
    // 选择机器人
    selectRobot(robotId) {
      // 检查机器人是否锁定
      const casualRobot = this.casualRobots.find(robot => robot.id === robotId);
      const expertRobot = this.expertRobots.find(robot => robot.id === robotId);
      const robot = casualRobot || expertRobot;
      
      if (robot && robot.locked) {
        uni.showToast({
          title: '该机器人尚未解锁',
          icon: 'none'
        });
        return;
      }
      
      this.selectedRobotId = robotId;
      
      // 更新选中的机器人信息
      if (robot) {
        this.robotName = robot.name;
        this.robotAvatar = robot.avatar;
        this.robotRating = robot.rating;
      }
    },
    
    // 开始游戏
    startGame() {
      // 找到选中的机器人信息
      const selectedRobot = [...this.casualRobots, ...this.expertRobots].find(robot => robot.id === this.selectedRobotId);
      
      if (!selectedRobot) {
        uni.showToast({
          title: '请先选择一个机器人',
          icon: 'none'
        });
        return;
      }
      
      // 更新机器人信息
      this.robotName = selectedRobot.name;
      this.robotAvatar = selectedRobot.avatar;
      this.robotRating = selectedRobot.rating;
      
      // 切换到对战模式
      this.isSelectionMode = false;
      
      // 初始化游戏
      this.initGame();
    },
    
    // 初始化游戏
    initGame() {
      // 初始化棋盘状态
      this.boardState = this.initBoardState();
      this.originalBoardState = JSON.parse(JSON.stringify(this.boardState));
      
      // 重置游戏状态
      this.selectedPosition = null;
      this.validMoves = [];
      this.lastMove = null;
      this.currentPlayer = 'white';
      this.isCheckmated = false;
      this.checkmateColor = '';
      this.gameOver = false;
      this.isRobotTurn = this.playerColor === 'black';
      
      // 重置走棋记录
      this.moveHistory = [];
      this.formattedMoveHistory = [];
      this.scrollTop = 0;
      this.openingName = '标准开局';
      
      // 重置复盘状态
      this.isReviewing = false;
      this.currentMoveIndex = -1;
      
      // 清除机器人消息
      this.currentRobotMessage = '';
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      
      // 重置特殊走法状态
      this.specialMoves.castling = [];
      this.specialMoves.enPassant = null;
      this.specialMoves.promotion.pendingMove = null;
      this.specialMoves.promotion.showDialog = false;
      
      // 重置棋盘特殊状态
      resetChessBoardState();
      
      // 如果玩家执黑，机器人先行
      if (this.playerColor === 'black') {
        setTimeout(() => {
          this.robotMove();
        }, 1000);
      } else {
        // 显示欢迎消息
        this.showRobotMessage("欢迎挑战！请先行动吧。");
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.robot-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
}

.main-content {
  padding: 30rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 棋盘对战区样式 */
.chess-section {
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.player-info-container {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  
  .board-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

/* 智能教练功能区样式 */
.coach-section {
  flex: 1;
  padding: 30rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 20rpx;
  margin-bottom: 100rpx;
  display: flex;
  flex-direction: column;
}

.coach-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  
  .coach-icon {
    width: 48rpx;
    height: 48rpx;
    margin-right: 10rpx;
  }
  
  .coach-heading {
    font-size: 36rpx;
    color: #EEE;
    font-weight: bold;
  }
}

.robot-intro {
  display: flex;
  margin-bottom: 30rpx;
  
  .robot-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    margin-right: 20rpx;
  }
  
  .robot-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .speech-bubble {
      background-color: #FFFFFF;
      border-radius: 20rpx;
      padding: 30rpx;
      margin: 20rpx;
      position: relative;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      
      &:before {
        content: '';
        position: absolute;
        left: -12rpx;
        top: 30rpx;
        width: 0;
        height: 0;
        border-top: 12rpx solid transparent;
        border-right: 20rpx solid #FFFFFF;
        border-bottom: 12rpx solid transparent;
      }
      
      text {
        font-size: 28rpx;
        color: #333;
      }
    }
    
    .robot-info {
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      
      .robot-name {
        font-size: 32rpx;
        color: #EEE;
        font-weight: bold;
        margin-right: 16rpx;
      }
      
      .robot-rating {
        font-size: 28rpx;
        color: #666666;
        margin-right: 10rpx;
      }
      
      .robot-flag {
        width: 40rpx;
        height: 40rpx;
      }
    }
  }
}

.robot-candidates {
  margin : 40rpx auto;
  padding: 20rpx;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  .candidate-group {
    margin-bottom: 40rpx;
    position: relative;
    
    .group-title {
      font-size: 32rpx;
      color: #EEE;
      margin-left: 20rpx;
      font-weight: bold;
      margin-bottom: 20rpx;
    }
    
    .candidate-count {
      position: absolute;
      top: 0;
      right: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
    
    .candidate-scroll {
      margin-top: 20rpx;
      width: 100%;
    }
    
    .candidate-list {
      display: flex;
      padding: 0 10rpx;
    }
    
    .candidate-item {
      position: relative;
      margin: 0 12rpx;
      
      &.selected {
        .candidate-avatar {
          border: 4rpx solid #81B64C;
        }
      }
      
      .candidate-avatar {
        width: 120rpx;
        height: 120rpx;
        border-radius: 16rpx;
      }
      
      .lock-icon {
        position: absolute;
        top: 5rpx;
        right: 5rpx;
        width: 32rpx;
        height: 32rpx;
      }
    }
  }
}

.action-button {
  width: 80%;
  height: 100rpx;
  background-color: #81B64C;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  margin-top: auto;
  margin-bottom: 20rpx;
  
  .button-text {
    color: #ffffff;
    font-size: 36rpx;
    font-weight: bold;
  }
}

.battle-section {
  flex: 1;
  padding: 30rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 20rpx;
  margin-bottom: 100rpx;
  display: flex;
  flex-direction: column;
}

.robot-chat-container {
  display: flex;
  margin-bottom: 30rpx;
  align-items: flex-start;
  min-height: 100rpx;
  
  .robot-chat-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    margin-right: 20rpx;
  }
  
  .speech-bubble {
    background-color: #FFFFFF;
    border-radius: 20rpx;
    padding: 20rpx;
    position: relative;
    max-width: 70%;
    
    &:before {
      content: '';
      position: absolute;
      left: -12rpx;
      top: 30rpx;
      width: 0;
      height: 0;
      border-top: 12rpx solid transparent;
      border-right: 20rpx solid #FFFFFF;
      border-bottom: 12rpx solid transparent;
    }
    
    text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.match-info {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  
  .opening-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .opening-text {
      font-size: 28rpx;
      color: #EEE;
      font-weight: bold;
    }
    
    .info-icon {
      margin-left: 10rpx;
    }
  }
  
  .moves-record {
    .moves-scroll {
      height: 300rpx;
    }
    
    .no-moves {
      padding: 20rpx;
      text-align: center;
      color: #CCC;
      font-style: italic;
    }
    
    .move-item {
      display: flex;
      margin-bottom: 15rpx;
      
      .move-number {
        width: 60rpx;
        color: #CCC;
        font-size: 24rpx;
        line-height: 50rpx;
      }
      
      .move-detail {
        flex: 1;
        display: flex;
      }
      
      .move-column {
        flex: 1;
        
        &.white-move {
          margin-right: 10rpx;
        }
        
        .move-notation {
          display: flex;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.1);
          padding: 10rpx;
          border-radius: 8rpx;
          
          .piece-icon {
            width: 30rpx;
            height: 30rpx;
            margin-right: 10rpx;
          }
          
          text {
            color: #EEE;
            font-size: 24rpx;
          }
        }
      }
    }
  }
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
  
  .ctrl-row {
    display: flex;
    justify-content: space-between;
    gap: 15rpx;
  }
  
  .ctrl-btn {
    flex: 1;
    height: 80rpx;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    text {
      color: #EEE;
      font-size: 28rpx;
    }
    
    .btn-icon {
      font-size: 32rpx;
    }
    
    &.hint-btn {
      background-color: #81B64C;
    }
    
    &.resign-btn {
      background-color: #e74c3c;
    }
    
    &.restart-btn, &.back-btn {
      height: 100rpx;
    }
  }
}

.promotion-dialog {
  width: 500rpx;
  background-color: rgba(0, 0, 0, 0.85);
  border-radius: 20rpx;
  padding: 30rpx;
  
  .promotion-title {
    color: #fff;
    font-size: 32rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .promotion-options {
    display: flex;
    justify-content: space-around;
    
    .promotion-option {
      width: 100rpx;
      height: 100rpx;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      image {
        width: 80rpx;
        height: 80rpx;
      }
      
      &:active {
        background-color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

.result-popup {
  width: 600rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
  background-color: rgba(30, 30, 30, 0.95);
  
  &.victory-popup {
    border: 4rpx solid #81B64C;
  }
  
  &.defeat-popup {
    border: 4rpx solid #e74c3c;
  }
  
  &.draw-popup {
    border: 4rpx solid #3498db;
  }
  
  .result-title {
    display: flex;
    flex-direction: column;
    font-size: 36rpx;
    color: #fff;
    margin-bottom: 40rpx;
    font-weight: bold;
    line-height: 1.5;
  }
  
  .result-players {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 40rpx;
    
    .player-side {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      &.winner-side {
        .player-avatar {
          border: 4rpx solid #81B64C;
        }
      }
      
      .player-avatar {
        width: 140rpx;
        height: 140rpx;
        border-radius: 10rpx;
        margin-bottom: 10rpx;
      }
      
      .player-name {
        font-size: 28rpx;
        color: #fff;
        margin-top: 10rpx;
      }
      
      .winner-mark {
        position: absolute;
        bottom: 40rpx;
        right: -10rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: #81B64C;
        border-radius: 50%;
        
        &:before {
          content: '✓';
          color: #fff;
          font-size: 24rpx;
        }
      }
    }
    
    .vs-text {
      font-size: 32rpx;
      color: rgba(255, 255, 255, 0.7);
      font-weight: bold;
    }
  }
  
  .result-rating {
    display: flex;
    justify-content: center;
    margin-bottom: 40rpx;
    
    .crown {
      width: 60rpx;
      height: 60rpx;
      margin: 0 10rpx;
      background-image: url('https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9010.png');
      background-size: contain;
      background-repeat: no-repeat;
    }
  }
  
  .result-actions {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .action-btn {
      padding: 25rpx 0;
      border-radius: 50rpx;
      font-size: 30rpx;
      font-weight: bold;
      
      &.primary-btn {
        background-color: #81B64C;
        color: #fff;
      }
      
      &.secondary-btn {
        background-color: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
}
</style> 