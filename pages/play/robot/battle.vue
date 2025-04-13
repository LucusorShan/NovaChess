<template>
  <view class="battle-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部标题 -->
    <view class="header">
      <image class="coach-icon" src="https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9d.png" mode="aspectFit"></image>
      <text class="title">智能教练</text>
    </view>
    
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
          :time="robotTimer"
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
            @promotion-move="handlePromotion"
          />
        </view>
        
        <!-- 玩家信息（放在底部） -->
        <player-info 
          :is-opponent="false"
          :player-name="playerName"
          :avatar="playerAvatar"
          :flag="playerFlag"
          :time="playerTimer"
          :is-turn="!isRobotTurn"
        />
      </view>
    </view>
    
    <!-- 聊天和走棋记录区 -->
    <view class="interaction-section">
      <!-- 机器人聊天气泡 -->
      <view class="robot-chat-container">
        <image class="robot-chat-avatar" :src="robotAvatar" mode="aspectFill"></image>
        <view class="speech-bubble" v-if="currentRobotMessage">
          <text>{{ currentRobotMessage }}</text>
        </view>
      </view>
      
      <!-- 走棋记录 -->
      <view class="moves-record">
        <scroll-view scroll-y class="moves-scroll" :scroll-top="scrollTop">
          <view v-if="moveHistory.length === 0" class="no-moves">
            <text>棋局开始，等待第一步...</text>
          </view>
          <view v-for="(move, index) in moveHistory" :key="index" class="move-item">
            <text class="move-number">{{ move.moveNumber }}.</text>
            <view class="move-detail">
              <!-- 白方走棋 -->
              <view class="move-column white-move" v-if="move.white">
                <view class="move-notation">
                  <image v-if="move.white.piece" class="piece-icon" :src="getPieceIcon(move.white.piece)" mode="aspectFit"></image>
                  <text>{{ move.white.notation }}</text>
                </view>
              </view>
              
              <!-- 黑方走棋 -->
              <view class="move-column black-move" v-if="move.black">
                <view class="move-notation">
                  <image v-if="move.black.piece" class="piece-icon" :src="getPieceIcon(move.black.piece)" mode="aspectFit"></image>
                  <text>{{ move.black.notation }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
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
        </view>
        <view class="ctrl-row">
          <view class="ctrl-btn hint-btn" @click="showHint">
            <image class="btn-img" src="/static/images/robot/hint.png" mode="aspectFit"></image>
          </view>
          <view class="ctrl-btn resign-btn" @click="resignGame">
            <image class="btn-img" src="/static/images/robot/flag.png" mode="aspectFit"></image>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 胜利弹窗 -->
    <uni-popup ref="victoryPopup" type="center" background-color="#333" @close="handleResultClose">
      <view class="result-popup victory-popup">
        <view class="result-icon">
          <image src="/static/images/match/gold_trophy.png" mode="aspectFit"></image>
        </view>
        <view class="result-title">比赛胜出！</view>
        <view class="result-description">你"将死"了对手</view>
        
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="restartGame">重新开始</view>
          <view class="action-btn secondary-btn" @click="backToSelection">返回选择</view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 失败弹窗 -->
    <uni-popup ref="defeatPopup" type="center" background-color="#333" @close="handleResultClose">
      <view class="result-popup defeat-popup">
        <view class="result-title">遗憾告负...</view>
        <view class="result-description">你被"将死"了</view>
        
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="restartGame">重新开始</view>
          <view class="action-btn secondary-btn" @click="backToSelection">返回选择</view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 和棋弹窗 -->
    <uni-popup ref="drawPopup" type="center" background-color="#333" @close="handleResultClose">
      <view class="result-popup draw-popup">
        <view class="result-title">和棋</view>
        <view class="result-description">这把是平局</view>
        
        <view class="result-actions">
          <view class="action-btn primary-btn" @click="restartGame">重新开始</view>
          <view class="action-btn secondary-btn" @click="backToSelection">返回选择</view>
        </view>
      </view>
    </uni-popup>
    
    <!-- 投降确认弹窗 -->
    <uni-popup ref="resignPopup" type="dialog">
      <uni-popup-dialog
        title="确认投降"
        content="确定要认输这局游戏吗？"
        :before-close="true"
        @confirm="confirmResign"
        @close="cancelResign"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script>
import ChessBoard from '@/components/chess/ChessBoard.vue';
import PlayerInfo from '@/components/chess/PlayerInfo.vue';
import TopSpacing from '@/components/TopSpacing.vue'
import { 
  getPieceColor, 
  getPieceType, 
  getValidMoves,
  isKingInCheck,
  recordMove
} from '@/utils/chess/cheesLogic.js';

export default {
  components: {
    ChessBoard,
    PlayerInfo,
    TopSpacing
  },
  data() {
    return {
      statusBarHeight: 0,
      // 玩家信息
      playerName: '我',
      playerAvatar: '/static/images/match/avatar-user.png',
      playerFlag: 'https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9012.png',
      playerTimer: '10:00',
      playerColor: 'white',
      
      // 机器人信息
      robotId: '',
      robotName: '',
      robotAvatar: '',
      robotFlag: 'https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9012.png',
      robotTimer: '10:00',
      robotRating: '',
      
      // 游戏状态
      isRobotTurn: false,
      boardState: [],
      selectedPosition: null,
      validMoves: [],
      lastMove: null,
      currentPlayer: 'white',
      isCheckmated: false,
      checkmateColor: '',
      gameOver: false,
      
      // 走棋记录
      moveHistory: [],
      formattedMoveHistory: [],
      scrollTop: 0,
      
      // 复盘状态
      isReviewing: false,
      currentMoveIndex: -1,
      originalBoardState: [],
      
      // 机器人聊天
      robotMessages: [
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
      currentRobotMessage: '',
      messageTimeout: null
    };
  },
  onLoad(options) {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 获取传递的机器人信息
    this.robotId = options.robotId || 'neighbor';
    this.robotName = options.robotName || '邻居大叔';
    this.robotAvatar = options.robotAvatar || '/static/images/robot/neighbor.png';
    this.robotRating = options.robotRating || '1200';
    
    // 初始化棋盘
    this.initGame();
  },
  methods: {
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
      
      // 重置复盘状态
      this.isReviewing = false;
      this.currentMoveIndex = -1;
      
      // 清除机器人消息
      this.currentRobotMessage = '';
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      
      // 如果玩家执黑，机器人先行
      if (this.playerColor === 'black') {
        setTimeout(() => {
          this.robotMove();
        }, 1000);
      } else {
        // 显示欢迎消息
        this.showRobotMessage("欢迎挑战！请先行动吧。");
      }
    },
    
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

      // 添加过路兵检测的调试输出
      const piece = this.boardState[row][col];
      if (piece && getPieceType(piece) === 'pawn') {
        const color = getPieceColor(piece);
        const enPassantRow = color === 'white' ? 3 : 4; // 吃过路兵的行位置

        // 检查是否存在可能的吃过路兵移动
        const enPassantMoves = this.validMoves.filter(move => move.isEnPassant);
        
        console.log('当前选中的兵:', { row, col, color });
        console.log('可以吃过路兵的行:', enPassantRow);
        console.log('找到的吃过路兵移动:', enPassantMoves);
        
        if (enPassantMoves.length === 0) {
          console.log('当前棋子没有吃过路兵的移动');
        } else {
          console.log('存在可以吃过路兵的移动!', enPassantMoves);
        }
      }
    },
    
    // 移动棋子
    makeMove(from, to, moveInfo = {}) {
      const piece = this.boardState[from.row][from.col];
      if (!piece) return;
      
      // 记录被吃掉的棋子
      const capturedPiece = this.boardState[to.row][to.col];
      
      // 更新棋盘状态
      const move = recordMove(this.boardState, from, to, moveInfo);
      
      // 记录最后一步移动
      this.lastMove = move;
      
      // 记录走棋记录
      this.recordMoveHistory(from, to, piece, capturedPiece);
      
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
      // 检查是否将军
      const isCheck = isKingInCheck(this.boardState, this.currentPlayer);
      
      if (isCheck) {
        // 检查是否有合法移动
        const hasLegalMove = this.hasAnyLegalMove();
        
        if (!hasLegalMove) {
          // 将杀
          this.handleCheckmate();
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
      // 显示确认弹窗
      this.$refs.resignPopup.open();
    },
    
    // 确认投降
    confirmResign() {
      this.gameOver = true;
      this.showRobotMessage("不要气馁，下次再来挑战吧！");
      
      // 显示失败弹窗
      setTimeout(() => {
        this.$refs.defeatPopup.open();
      }, 1000);
    },
    
    // 取消投降
    cancelResign() {
      // 什么都不做，只关闭弹窗
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
    
    // 处理升变
    handlePromotion(move) {
      const { from, to, promoteTo } = move;
      
      // 执行带有升变信息的移动
      this.makeMove(from, to, { 
        promoteTo: promoteTo,
        isPromotion: true
      });
      
      // 机器人可能对此评论
      if (getPieceColor(this.boardState[to.row][to.col]) === this.playerColor) {
        this.showRobotMessage("哇！你获得了一个强大的棋子！");
      }
    },
    
    // 记录走棋历史
    recordMoveHistory(from, to, piece, captured) {
      const pieceType = getPieceType(piece);
      const pieceColor = getPieceColor(piece);
      
      // 计算代数记谱法表示
      const notation = this.calculateNotation(from, to, piece, captured);
      
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
        if (lastMove) {
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
    calculateNotation(from, to, piece, captured) {
      const pieceType = getPieceType(piece);
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      
      let notation = '';
      
      // 添加棋子类型符号（除了兵）
      if (pieceType !== 'pawn') {
        notation += pieceType.charAt(0).toUpperCase();
      }
      
      // 添加起始位置
      notation += files[from.col] + ranks[from.row];
      
      // 添加移动符号
      notation += captured ? 'x' : '-';
      
      // 添加目标位置
      notation += files[to.col] + ranks[to.row];
      
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
    
    // 复盘操作 - 前一步
    prevMove() {
      if (!this.isReviewing) {
        // 第一次进入复盘模式
        this.isReviewing = true;
        this.originalBoardState = JSON.parse(JSON.stringify(this.boardState));
        this.currentMoveIndex = this.moveHistory.length - 1;
      } else if (this.currentMoveIndex > 0) {
        // 向前回退一步
        this.currentMoveIndex--;
      } else {
        // 已经到第一步
        return;
      }
      
      // 重建到指定步骤的棋盘
      this.rebuildBoardToMove(this.currentMoveIndex);
    },
    
    // 复盘操作 - 后一步
    nextMove() {
      if (!this.isReviewing) {
        return;
      }
      
      if (this.currentMoveIndex < this.moveHistory.length - 1) {
        // 向后前进一步
        this.currentMoveIndex++;
        this.rebuildBoardToMove(this.currentMoveIndex);
      } else {
        // 已经是最后一步，退出复盘模式
        this.isReviewing = false;
        this.boardState = JSON.parse(JSON.stringify(this.originalBoardState));
      }
    },
    
    // 重建棋盘到指定步骤
    rebuildBoardToMove(moveIndex) {
      // 从初始棋盘开始重建
      const newBoard = this.initBoardState();
      
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
            rookTo: move.rookTo
          });
        }
      }
      
      // 更新棋盘状态
      this.boardState = newBoard;
    },
    
    // 重新开始游戏
    restartGame() {
      // 关闭所有弹窗
      this.$refs.victoryPopup.close();
      this.$refs.defeatPopup.close();
      this.$refs.drawPopup.close();
      
      // 重新初始化游戏
      this.initGame();
    },
    
    // 返回到选择界面
    backToSelection() {
      // 返回上一页（机器人选择页面）
      uni.navigateBack();
    },
    
    // 处理结果弹窗关闭
    handleResultClose() {
      // 可以在这里处理弹窗关闭后的逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
.battle-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #efefef;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  background-color: #b3b3b3;
  
  .coach-icon {
    width: 48rpx;
    height: 48rpx;
    margin-right: 10rpx;
  }
  
  .title {
    font-size: 36rpx;
    color: #fff;
    font-weight: bold;
  }
}

/* 棋盘对战区样式 */
.chess-section {
  padding: 20rpx;
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
    margin: 10rpx 0;
    height: auto;
    background-color: transparent;
  }
}

/* 互动区域样式 */
.interaction-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  margin-top: -20rpx;
}

/* 机器人聊天气泡 */
.robot-chat-container {
  display: flex;
  margin-bottom: 20rpx;
  align-items: flex-start;
  min-height: 100rpx;
  
  .robot-chat-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 40rpx;
    margin-right: 20rpx;
  }
  
  .speech-bubble {
    background-color: #f2f2f2;
    border-radius: 20rpx;
    padding: 20rpx;
    position: relative;
    max-width: 70%;
    
    &:before {
      content: '';
      position: absolute;
      left: -12rpx;
      top: 20rpx;
      width: 0;
      height: 0;
      border-top: 10rpx solid transparent;
      border-right: 20rpx solid #f2f2f2;
      border-bottom: 10rpx solid transparent;
    }
    
    text {
      font-size: 28rpx;
      color: #333;
    }
  }
}

/* 走棋记录样式 */
.moves-record {
  flex: 1;
  background-color: #f9f9f9;
  border-radius: 10rpx;
  margin-bottom: 20rpx;
  
  .moves-scroll {
    height: 300rpx;
    padding: 20rpx;
  }
  
  .no-moves {
    padding: 20rpx;
    text-align: center;
    color: #999;
    font-style: italic;
  }
  
  .move-item {
    display: flex;
    margin-bottom: 10rpx;
    
    .move-number {
      width: 60rpx;
      color: #999;
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
        
        .piece-icon {
          width: 40rpx;
          height: 40rpx;
          margin-right: 10rpx;
        }
        
        .move-time {
          margin-left: 10rpx;
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

/* 控制按钮样式 */
.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 40rpx;
  
  .ctrl-row {
    display: flex;
    justify-content: space-around;
    gap: 20rpx;
  }
  
  .ctrl-btn {
    flex: 1;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 10rpx;
    
    .btn-icon {
      font-size: 40rpx;
      color: #333;
    }
    
    .btn-img {
      width: 40rpx;
      height: 40rpx;
    }
    
    &.prev-btn, &.next-btn {
      background-color: #e0e0e0;
    }
    
    &.hint-btn {
      background-color: #81B64C;
    }
    
    &.resign-btn {
      background-color: #f44336;
    }
  }
}

/* 结果弹窗样式 */
.result-popup {
  width: 600rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
  
  .result-icon {
    margin-bottom: 30rpx;
    
    image {
      width: 120rpx;
      height: 120rpx;
    }
  }
  
  .result-title {
    font-size: 36rpx;
    color: #fff;
    margin-bottom: 20rpx;
    font-weight: bold;
  }
  
  .result-description {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 40rpx;
  }
  
  .result-actions {
    display: flex;
    justify-content: space-around;
    
    .action-btn {
      padding: 20rpx 40rpx;
      border-radius: 50rpx;
      font-size: 28rpx;
      
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

/* 棋盘区域样式 */
.board-container {
  position: relative;
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  overflow: hidden;
  background-color: #fff;
}
</style> 