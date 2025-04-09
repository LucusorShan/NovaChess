<template>
  <view class="mail-container">
    <!-- 收件列表页 - 默认显示 -->
    <view class="inbox-page" v-if="currentPage === 'inbox'">
      <view class="inbox-header">
        <view class="new-message" @click="showNewMessage">
          <text>+ New Message</text>
        </view>
        <view class="inbox-tabs">
          <view class="tab active">
            <text>收件</text>
            <text class="tab-subtitle">Inbox</text>
          </view>
          <view class="tab">
            <text>未读</text>
            <text class="tab-subtitle">Unread</text>
          </view>
        </view>
      </view>
      
      <view class="message-list">
        <view class="message-item" @click="openChat('LucTestAccount')">
          <image class="avatar" src="/static/images/mail/avatar1.png" mode="aspectFill"></image>
          <view class="message-content">
            <view class="message-sender">LucTestAccount</view>
            <view class="message-brief">OK</view>
          </view>
          <view class="message-time">Just now</view>
        </view>
        
        <!-- 可以添加更多消息项 -->
      </view>
      
      <view class="all-messages">
        <text>All Messages</text>
      </view>
    </view>
    
    <!-- 聊天详情页 -->
    <view class="chat-page" v-if="currentPage === 'chat'">
      <view class="chat-header">
        <view class="back-btn" @click="backToInbox">
          <text class="back-icon">←</text>
        </view>
        <view class="chat-title">
          <text>和{{currentChat}}的聊天</text>
        </view>
        <view class="delete-chat" @click="deleteChat">
          <text>删除聊天</text>
        </view>
      </view>
      
      <view class="chat-messages">
        <view class="chat-message">
          <image class="avatar" src="/static/images/mail/avatar2.png" mode="aspectFill"></image>
          <view class="message-info">
            <view class="message-sender-time">
              <text class="sender">lucasshanchuxiong</text>
              <text class="time">14 minutes ago</text>
            </view>
            <view class="message-bubble">
              <text class="message-text">一条这是测试短信，这是yitiao暂暂</text>
            </view>
          </view>
        </view>
        
        <view class="chat-message">
          <image class="avatar" src="/static/images/mail/avatar1.png" mode="aspectFill"></image>
          <view class="message-info">
            <view class="message-sender-time">
              <text class="sender">{{currentChat}}</text>
              <text class="time">Just now</text>
            </view>
            <view class="message-bubble">
              <text class="message-text">got it</text>
            </view>
          </view>
        </view>
      </view>
      
      <view class="message-input-area">
        <view class="format-icons">
          <text class="format-icon">⊞</text>
          <text class="format-icon">⎘</text>
          <text class="format-icon">☺</text>
          <text class="format-icon">B</text>
          <text class="format-icon">I</text>
          <text class="format-icon">⎆</text>
          <text class="format-icon">⋮⋮</text>
        </view>
        <view class="input-box">
          <textarea class="message-input" placeholder="输入要发送的消息" v-model="messageText"></textarea>
        </view>
        <view class="send-btn" @click="sendMessage">
          <text>发送</text>
        </view>
      </view>
    </view>
    
    <!-- 新消息发送页 -->
    <view class="new-message-page" v-if="currentPage === 'new'">
      <view class="new-message-header">
        <view class="back-btn" @click="backToInbox">
          <text class="back-icon">←</text>
        </view>
        <view class="page-title">
          <text>发送新消息</text>
        </view>
      </view>
      
      <view class="recipient-input">
        <text class="to-label">To:</text>
        <input type="text" placeholder="—" v-model="recipient" />
      </view>
      
      <view class="message-input-area">
        <view class="format-icons">
          <text class="format-icon">⊞</text>
          <text class="format-icon">⎘</text>
          <text class="format-icon">☺</text>
          <text class="format-icon">B</text>
          <text class="format-icon">I</text>
          <text class="format-icon">⎆</text>
          <text class="format-icon">⋮⋮</text>
        </view>
        <view class="input-box">
          <textarea class="message-input" placeholder="输入要发送的消息" v-model="newMessageText"></textarea>
        </view>
        <view class="send-btn" @click="sendNewMessage">
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentPage: 'inbox', // 'inbox', 'chat', 'new'
      currentChat: '',
      messageText: '',
      recipient: '',
      newMessageText: ''
    }
  },
  methods: {
    // 显示新消息页面
    showNewMessage() {
      this.currentPage = 'new';
      this.recipient = '';
      this.newMessageText = '';
    },
    
    // 打开聊天详情
    openChat(username) {
      this.currentPage = 'chat';
      this.currentChat = username;
      this.messageText = '';
    },
    
    // 返回收件箱
    backToInbox() {
      this.currentPage = 'inbox';
    },
    
    // 发送消息
    sendMessage() {
      if (!this.messageText.trim()) {
        uni.showToast({
          title: '消息不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 这里应该有发送消息的逻辑
      uni.showToast({
        title: '消息已发送',
        icon: 'none'
      });
      
      this.messageText = '';
    },
    
    // 发送新消息
    sendNewMessage() {
      if (!this.recipient.trim()) {
        uni.showToast({
          title: '请输入收件人',
          icon: 'none'
        });
        return;
      }
      
      if (!this.newMessageText.trim()) {
        uni.showToast({
          title: '消息不能为空',
          icon: 'none'
        });
        return;
      }
      
      // 这里应该有发送消息的逻辑
      uni.showToast({
        title: '消息已发送',
        icon: 'none'
      });
      
      // 发送后返回收件箱
      this.backToInbox();
    },
    
    // 删除聊天
    deleteChat() {
      uni.showModal({
        title: '提示',
        content: '确定要删除此聊天吗？',
        success: (res) => {
          if (res.confirm) {
            // 这里应该有删除聊天的逻辑
            uni.showToast({
              title: '聊天已删除',
              icon: 'none'
            });
            this.backToInbox();
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.mail-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
  padding: 20rpx 30rpx 40rpx;
}

// 收件列表页样式
.inbox-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  
  .inbox-header {
    display: flex;
    flex-direction: column;
    padding: 20rpx 10rpx 30rpx;
    
    .new-message {
      color: white;
      font-size: 32rpx;
      margin-bottom: 30rpx;
      background-color: rgba(40, 25, 12, 0.7);
      padding: 16rpx 30rpx;
      border-radius: 40rpx;
      align-self: flex-start;
      display: flex;
      align-items: center;
      transition: all 0.3s;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
      
      &:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
    }
    
    .inbox-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: 10rpx;
      
      .tab {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20rpx 40rpx;
        color: rgba(255, 255, 255, 0.7);
        font-size: 32rpx;
        position: relative;
        transition: all 0.3s;
        
        &.active {
          color: white;
          font-weight: bold;
          
          &:after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 20%;
            width: 60%;
            height: 4rpx;
            background-color: #81B64C;
            border-radius: 4rpx;
          }
        }
        
        .tab-subtitle {
          font-size: 24rpx;
          color: rgba(204, 204, 204, 0.8);
          margin-top: 8rpx;
        }
      }
    }
  }
  
  .message-list {
    flex: 1;
    padding: 0 10rpx;
    
    .message-item {
      display: flex;
      align-items: center;
      background-color: rgba(40, 25, 12, 0.7);
      border-radius: 16rpx;
      padding: 24rpx;
      margin: 20rpx 0;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
      
      &:active {
        transform: translateY(2rpx);
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
      }
      
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 6rpx;
        background-color: #81B64C;
      }
      
      .avatar {
        width: 90rpx;
        height: 90rpx;
        border-radius: 45rpx;
        margin-right: 24rpx;
        border: 2rpx solid rgba(255, 255, 255, 0.3);
      }
      
      .message-content {
        flex: 1;
        
        .message-sender {
          color: white;
          font-size: 36rpx;
          margin-bottom: 8rpx;
          font-weight: 500;
        }
        
        .message-brief {
          color: rgba(204, 204, 204, 0.9);
          font-size: 32rpx;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 400rpx;
        }
      }
      
      .message-time {
        color: rgba(204, 204, 204, 0.7);
        font-size: 26rpx;
        align-self: flex-start;
        margin-top: 6rpx;
      }
    }
  }
  
  .all-messages {
    display: flex;
    justify-content: center;
    padding: 30rpx 0;
    
    text {
      color: white;
      font-size: 32rpx;
      background-color: rgba(40, 25, 12, 0.5);
      padding: 16rpx 40rpx;
      border-radius: 40rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    }
  }
}

// 聊天详情页样式
.chat-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  
  .chat-header {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(40, 25, 12, 0.7);
    border-radius: 16rpx 16rpx 0 0;
    margin-bottom: 10rpx;
    
    .back-btn {
      padding: 12rpx;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .back-icon {
        color: white;
        font-size: 40rpx;
      }
    }
    
    .chat-title {
      flex: 1;
      text-align: center;
      color: white;
      font-size: 36rpx;
      font-weight: 500;
    }
    
    .delete-chat {
      color: #ff6b6b;
      font-size: 30rpx;
      background-color: rgba(255, 107, 107, 0.1);
      padding: 10rpx 20rpx;
      border-radius: 30rpx;
    }
  }
  
  .chat-messages {
    flex: 1;
    padding: 20rpx 30rpx;
    overflow-y: auto;
    background-color: rgba(40, 25, 12, 0.4);
    border-radius: 0 0 16rpx 16rpx;
    
    .chat-message {
      display: flex;
      margin-bottom: 40rpx;
      
      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        margin-right: 20rpx;
        border: 2rpx solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
      }
      
      .message-info {
        flex: 1;
        
        .message-sender-time {
          display: flex;
          align-items: center;
          margin-bottom: 10rpx;
          
          .sender {
            color: rgba(255, 255, 255, 0.8);
            font-size: 28rpx;
            margin-right: 10rpx;
            font-weight: 500;
          }
          
          .time {
            color: rgba(204, 204, 204, 0.7);
            font-size: 24rpx;
          }
        }
        
        .message-bubble {
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 4rpx 20rpx 20rpx 20rpx;
          padding: 16rpx 24rpx;
          display: inline-block;
          max-width: 80%;
          box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
          position: relative;
          
          &:before {
            content: '';
            position: absolute;
            left: -6rpx;
            top: 0;
            width: 12rpx;
            height: 12rpx;
            background-color: rgba(255, 255, 255, 0.95);
            transform: rotate(45deg);
            border-radius: 2rpx;
          }
          
          .message-text {
            color: #333;
            font-size: 32rpx;
            line-height: 1.4;
          }
        }
      }
    }
  }
}

.message-input-area {
    padding: 20rpx;
    background-color: rgba(40, 25, 12, 0.7);
    border-radius: 16rpx;
    margin-top: 20rpx;
    box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.1);
    
    .format-icons {
      display: flex;
      padding: 10rpx 0;
      flex-wrap: wrap;
      
      .format-icon {
        color: rgba(255, 255, 255, 0.8);
        font-size: 32rpx;
        margin-right: 30rpx;
        margin-bottom: 10rpx;
        transition: all 0.2s;
        
        &:active {
          color: white;
          transform: scale(1.1);
        }
      }
    }
    
    .input-box {
      background-color: rgba(40, 25, 12, 0.5);
      border-radius: 16rpx;
      padding: 16rpx;
      margin: 16rpx 0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      .message-input {
        width: 100%;
        height: 150rpx;
        color: white;
        font-size: 32rpx;
        line-height: 1.4;
      }
    }
    
    .send-btn {
      background-color: #81B64C;
      color: white;
      text-align: center;
      padding: 18rpx 0;
      border-radius: 40rpx;
      font-size: 32rpx;
      margin-top: 16rpx;
      font-weight: 500;
      letter-spacing: 2rpx;
      box-shadow: 0 4rpx 12rp
    }
  }
// 新消息发送页样式
.new-message-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  
  .new-message-header {
    display: flex;
    align-items: center;
    padding: 30rpx 20rpx;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    background-color: rgba(40, 25, 12, 0.7);
    border-radius: 16rpx 16rpx 0 0;
    margin-bottom: 10rpx;
    
    .back-btn {
      padding: 12rpx;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .back-icon {
        color: white;
        font-size: 40rpx;
      }
    }
    
    .page-title {
      flex: 1;
      text-align: center;
      color: white;
      font-size: 36rpx;
      font-weight: 500;
    }
  }

  .recipient-input {
    display: flex;
    align-items: center;
    background-color: rgba(40, 25, 12, 0.7);
    padding: 24rpx 30rpx;
    border-radius: 0 0 16rpx 16rpx;
    margin-bottom: 20rpx;
    
    .to-label {
      color: white;
      font-size: 32rpx;
      margin-right: 20rpx;
      font-weight: 500;
    }
    
    input {
      flex: 1;
      color: white;
      font-size: 32rpx;
      height: 60rpx;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8rpx;
      padding: 0 20rpx;
    }
  }
  
  .message-input-area {
    padding: 20rpx;
    background-color: rgba(40, 25, 12, 0.7);
    margin-top: 0;
    flex: 1;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    
    .format-icons {
      display: flex;
      padding: 10rpx 0;
      flex-wrap: wrap;
      
      .format-icon {
        color: rgba(255, 255, 255, 0.8);
        font-size: 32rpx;
        margin-right: 30rpx;
        margin-bottom: 10rpx;
        transition: all 0.2s;
        
        &:active {
          color: white;
          transform: scale(1.1);
        }
      }
    }
  }
    .input-box {
      background-color: rgba(40, 25, 12, 0.5);
      border-radius: 16rpx;
      padding: 16rpx;
      margin: 16rpx 0;
      flex: 1;
      border: 1px solid rgba(255, 255, 255, 0.1);
      
      .message-input {
        width: 100%;
        height: 300rpx;
        color: white;
        font-size: 32rpx;
        line-height: 1.4;
      }
    }
    
    .send-btn {
      background-color: #81B64C;
      color: white;
      text-align: center;
      padding: 18rpx 0;
      border-radius: 40rpx;
      font-size: 32rpx;
      margin-top: 16rpx;
      font-weight: 500;
      letter-spacing: 2rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    }
  }

</style>