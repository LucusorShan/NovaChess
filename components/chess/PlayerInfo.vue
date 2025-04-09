<!-- components/chess/PlayerInfo.vue -->
<template>
  <view class="player-info" :class="{ 'opponent': isOpponent, 'current': !isOpponent, 'is-turn': isTurn, 'waiting': isWaiting }">
    <image class="avatar" :src="avatar" mode="aspectFill"></image>
    <view class="player-details">
      <text class="player-name" :class="{ 'waiting-text': isWaiting }">{{ playerName }}</text>
      <image v-if="flag && !isWaiting" class="flag" :src="flag" mode="aspectFit"></image>
    </view>
    <view class="timer" :class="{ 'active-timer': isTurn, 'waiting-timer': isWaiting }">{{ time }}</view>
  </view>
</template>

<script>
export default {
  props: {
    isOpponent: {
      type: Boolean,
      default: false
    },
    playerName: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    },
    flag: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: '10:00'
    },
    isTurn: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 判断是否处于等待对手状态
    isWaiting() {
      return this.playerName === '等待对手加入';
    }
  }
}
</script>

<style lang="scss" scoped>
.player-info {
  display: flex;
  align-items: center;
  padding: 10rpx 10rpx 10rpx 30rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  position: relative;
  
  &.is-turn::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 10rpx;
    height: 100%;
    background-color: #81B64C;
    border-radius: 5rpx 0 0 5rpx;
  }
  
  &.waiting {
    background-color: rgba(255, 255, 255, 0.05);
    border: 1rpx dashed rgba(255, 255, 255, 0.2);
  }
  
  &.opponent {
    margin-bottom: 10rpx;
  }
  
  &.current {
    margin-top: 10rpx;
  }
  
  .avatar {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50rpx;
    
    .waiting & {
      opacity: 0.6;
    }
  }
  
  .player-details {
    display: flex;
    align-items: center;
    margin-left: 20rpx;
    
    .player-name {
      color: white;
      font-size: 28rpx;
      
      &.waiting-text {
        color: rgba(255, 255, 255, 0.6);
        font-style: italic;
      }
    }
    
    .flag {
      width: 40rpx;
      height: 40rpx;
      margin-left: 10rpx;
    }
  }
  
  .timer {
    margin-left: auto;
    margin-right: 10rpx;
    color: white;
    font-family: Noto Sans SC;
    background-color: rgba(10, 7, 7, 0.2);
    padding: 15rpx;
    border-radius: 10rpx;
    font-size: 46rpx;
    font-weight: 550;
    transition: all 0.3s ease;
    
    &.active-timer {
      background-color: rgba(129, 182, 76, 0.3);
      box-shadow: 0 0 10rpx rgba(129, 182, 76, 0.5);
    }
    
    &.waiting-timer {
      opacity: 0.6;
      background-color: rgba(10, 7, 7, 0.1);
    }
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.waiting .player-name {
  animation: pulse 2s infinite;
}
</style>