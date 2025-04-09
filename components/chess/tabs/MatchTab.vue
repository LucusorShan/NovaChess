<!-- components/chess/tabs/MatchTab.vue -->
<template>
  <view class="tab-content match-tab">
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
        <scroll-view scroll-y class="moves-scroll" :show-scrollbar="false">
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
                  <text class="move-time">{{ move.white.time }}</text>
                </view>
              </view>
              
              <!-- 黑方走棋 -->
              <view class="move-column black-move" v-if="move.black">
                <view class="move-notation">
                  <image v-if="move.black.piece" class="piece-icon" :src="getPieceIcon(move.black.piece)" mode="aspectFit"></image>
                  <text>{{ move.black.notation }}</text>
                  <text class="move-time">{{ move.black.time }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 操作按钮，游戏结束时隐藏 -->
    <view class="action-buttons" v-if="!gameResult">
      <view class="draw-button" @click="offerDraw">
        <text class="button-text">Draw 和棋</text>
      </view>
      <view class="resign-button" @click="resign">
        <text class="button-text">Resign投降</text>
      </view>
    </view>
    
    <!-- 游戏结果显示，仅在游戏结束时显示 -->
    <view class="game-result" v-if="gameResult">
      <view class="result-card">
        <text class="result-text">{{ gameResult }}</text>
        <view class="new-game-button" @click="requestNewGame">
          <text class="button-text">再来一局</text>
        </view>
      </view>
    </view>
    
    <!-- 聊天及新对局信息栏 -->
    <view class="chat-container">
      <!-- 新对局信息 -->
      <view class="match-notification">
        <text class="notification-text">新对局: {{ opponentName }} VS. {{ playerName }} ({{ timeControl }})</text>
      </view>
      
      <!-- 聊天记录 -->
      <scroll-view class="chat-messages" scroll-y scroll-with-animation :scroll-top="scrollTop">
        <view v-for="(msg, index) in chatMessages" :key="index" class="chat-message">
          <view v-if="msg.type === 'chat'" class="player-message">
            <text class="message-sender">{{ msg.sender }}:</text>
            <text class="message-content">{{ msg.content }}</text>
          </view>
          <view v-else-if="msg.type === 'system'" class="system-message">
            <text class="system-text">{{ msg.content }}</text>
          </view>
        </view>
      </scroll-view>
      
      <!-- 消息输入框 -->
      <view class="message-input-container">
        <input 
          class="message-input" 
          type="text" 
          v-model="newMessage" 
          placeholder="发送消息..." 
          @confirm="sendMessage"
        />
        <view class="send-button" @click="sendMessage">
          <uni-icons type="paperplane" size="20" color="#fff"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    openingName: {
      type: String,
      default: 'Anglo-Scandinavian Defense'
    },
    moveHistory: {
      type: Array,
      default: () => []
    },
    playerName: {
      type: String,
      default: 'LUCASSHANCHUXIONG'
    },
    opponentName: {
      type: String,
      default: 'DIVAN90JAKKELD'
    },
    timeControl: {
      type: String,
      default: '10 MIN'
    },
    gameResult: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      chatMessages: [
        { type: 'system', content: '对局已开始' }
      ],
      newMessage: '',
      scrollTop: 0,
      pieceIcons: {
        'white-pawn': 'https://pic1.imgdb.cn/item/67f3d0a2e381c3632bee955f.png',
        'white-knight': 'https://pic1.imgdb.cn/item/67f3d0a2e381c3632bee955e.png',
        'white-bishop': 'https://pic1.imgdb.cn/item/67f3d0a3e381c3632bee9568.png',
        'white-rook': 'https://pic1.imgdb.cn/item/67f3d0a3e381c3632bee9567.png',
        'white-queen': 'https://pic1.imgdb.cn/item/67f3d0a2e381c3632bee9566.png',
        'white-king': 'https://pic1.imgdb.cn/item/67f3d0a3e381c3632bee9569.png',
        'black-pawn': 'https://pic1.imgdb.cn/item/67f3d091e381c3632bee954e.png',
        'black-knight': 'https://pic1.imgdb.cn/item/67f3d092e381c3632bee954f.png',
        'black-bishop': 'https://pic1.imgdb.cn/item/67f3d092e381c3632bee9550.png',
        'black-rook': 'https://pic1.imgdb.cn/item/67f3d092e381c3632bee9552.png',
        'black-queen': 'https://pic1.imgdb.cn/item/67f3d092e381c3632bee9551.png',
        'black-king': 'https://pic1.imgdb.cn/item/67f3d092e381c3632bee9553.png'
      }
    }
  },
  methods: {
    // 获取棋子图标
    getPieceIcon(piece) {
      return this.pieceIcons[piece] || '';
    },
    
    // 提出和棋
    offerDraw() {
      this.$emit('offer-draw');
      this.addSystemMessage(`${this.playerName} 提出和棋`);
    },
    
    // 投降
    resign() {
      this.$emit('resign');
      this.addSystemMessage(`${this.playerName} 认输`);
    },
    
    // 请求新对局
    requestNewGame() {
      this.$emit('request-new-game');
    },
    
    // 发送聊天消息
    sendMessage() {
      if (!this.newMessage.trim()) return;
      
      const message = {
        type: 'chat',
        sender: this.playerName.toLowerCase(),
        content: this.newMessage
      };
      
      this.chatMessages.push(message);
      this.$emit('send-message', this.newMessage);
      this.newMessage = '';
      this.scrollToBottom();
    },
    
    // 添加系统消息
    addSystemMessage(content) {
      this.chatMessages.push({
        type: 'system',
        content
      });
      this.scrollToBottom();
    },
    
    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        // 模拟滚动到底部的行为
        this.scrollTop = 9999;
      });
    }
  },
  mounted() {
    this.scrollToBottom();
    
    // 如果有游戏结果，显示对应消息
    if (this.gameResult) {
      this.addSystemMessage(this.gameResult);
    }
  },
  watch: {
    // 监听游戏结果变化，添加系统消息
    gameResult(newValue) {
      if (newValue) {
        this.addSystemMessage(newValue);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.match-tab {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: #EEE;
  
  .match-info {
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10rpx;
    margin-bottom: 20rpx;
    
    .opening-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx;
      border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
      
      .opening-text {
        color: #EEE;
        font-size: 28rpx;
        font-weight: bold;
      }
      
      .info-icon {
        width: 36rpx;
        height: 36rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 18rpx;
      }
    }
    
    .moves-record {
      padding: 0 10rpx;
      max-height: 400rpx;
      overflow: hidden;
      
      .moves-scroll {
        height: 400rpx;
      }
      
      .no-moves {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100rpx;
        color: #aaa;
        font-size: 28rpx;
      }
      
      .move-item {
        display: flex;
        padding: 10rpx 0;
        border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
        
        .move-number {
          width: 40rpx;
          color: #aaa;
          font-size: 28rpx;
          padding-top: 6rpx;
        }
        
        .move-detail {
          flex: 1;
          display: flex;
          flex-direction: row;
          
          .move-column {
            display: flex;
            margin: 0 10rpx;
            
            .move-notation {
              display: flex;
              align-items: center;
              font-size: 28rpx;
              font-weight: bold;
              color: #fff;
              
              .piece-icon {
                width: 30rpx;
                height: 30rpx;
                margin-right: 5rpx;
              }
              
              .move-time {
                color: #aaa;
                font-size: 22rpx;
                margin-left: 5rpx;
              }
            }
          }
          
          .white-move {
            margin-right: 15rpx;
          }
          
          .black-move {
            margin-left: 15rpx;
          }
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    width: 100%;
    border-radius: 20rpx;
    
    .draw-button, .resign-button {
      flex: 1;
      padding: 30rpx 20rpx;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10;
      
      .button-text {
        color: #fff;
        font-size: 28rpx;
        font-weight: 550;
      }
    }
    
    .draw-button {
      margin-right: 2rpx;
    }
    
    .resign-button {
      margin-left: 2rpx;
    }
  }
  
  // 游戏结果样式
  .game-result {
    display: flex;
    justify-content: center;
    margin-bottom: 20rpx;
    width: 100%;
    
    .result-card {
      width: 100%;
      padding: 30rpx 20rpx;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10rpx;
      text-align: center;
      align-items: center;
   
      
      .result-text {
        color: #EEE;
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 20rpx;
      }
      
      .new-game-button {
        margin: 20rpx auto;
        padding: 20rpx 0;
        background-color: #81B64C;
        border-radius: 6rpx;
        width: 90%;
        
        .button-text {
          color: #fff;
          font-weight: bold;
          font-size: 28rpx;
        }
      }
    }
  }
  
  .chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 0;
    width: 100%;
    padding: 10rpx;
    
    .match-notification {
      padding: 15rpx 10rpx;
      margin-bottom: 15rpx;
      border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
      
      .notification-text {
        color: #EEE;
        font-size: 24rpx;
      }
    }
    
    .chat-messages {
      flex: 1;
      padding: 10rpx;
      
      .chat-message {
        margin-bottom: 16rpx;
        
        .player-message {
          display: flex;
          
          .message-sender {
            color: #81B64C;
            font-size: 24rpx;
            font-weight: bold;
            margin-right: 10rpx;
          }
          
          .message-content {
            color: #fff;
            font-size: 24rpx;
          }
        }
        
        .system-message {
          padding: 10rpx;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 6rpx;
          
          .system-text {
            color: #81B64C;
            font-size: 24rpx;
          }
        }
      }
    }
    
    .message-input-container {
      display: flex;
      align-items: center;
      padding: 10rpx;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 10rpx;
      
      .message-input {
        flex: 1;
        height: 60rpx;
        color: #fff;
        font-size: 24rpx;
        background-color: rgba(80, 80, 80, 0.5);
        padding: 0 20rpx;
        border-radius: 30rpx;
      }
      
      .send-button {
        width: 60rpx;
        height: 60rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10rpx;
      }
    }
  }
}
</style> 