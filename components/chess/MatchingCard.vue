<!-- components/chess/MatchingCard.vue -->
<template>
  <view :class="['matching-card', { 'inline': inline }]">
    <image class="piece-icon" :src="pieceIcon" mode="aspectFit"></image>
    <view class="matching-time">{{ timeControl }}</view>
    <view class="matching-status">{{ statusText }}</view>
    <view class="cancel-button" @click="onCancel">{{ cancelText }}</view>
  </view>
</template>

<script>
export default {
  props: {
    inline: {
      type: Boolean,
      default: false
    },
    pieceIcon: {
      type: String,
      default: '/static/images/match/pieces/white-pawn.png'
    },
    timeControl: {
      type: String,
      default: '10 min'
    },
    statusText: {
      type: String,
      default: '等待加入...'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  methods: {
    onCancel() {
      this.$emit('cancel');
    }
  }
}
</script>

<style lang="scss" scoped>
.matching-card {
  width: 85%;
  background-color: rgba(200, 200, 200, 0.8);
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
  
  &:not(.inline) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }
  
  &.inline {
    margin: 20rpx auto 30rpx;
    width: 95%;
  }
  
  .piece-icon {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
  }
  
  .matching-time {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .matching-status {
    font-size: 32rpx;
    color: #555;
    margin-bottom: 40rpx;
  }
  
  .cancel-button {
    width: 80%;
    padding: 20rpx 0;
    background-color: #fff;
    color: #333;
    border-radius: 10rpx;
    font-size: 32rpx;
    text-align: center;
  }
}
</style>