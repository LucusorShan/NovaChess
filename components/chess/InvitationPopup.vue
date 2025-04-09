<!-- components/chess/InvitationPopup.vue -->
<template>
  <uni-popup ref="invitationPopup" type="center" background-color="#333" @close="onClose">
    <view class="invitation-popup">
      <view class="invitation-title">对战邀请</view>
      
      <view class="invitation-content">
        <image class="inviter-avatar" :src="inviter.avatar || '/static/images/match/avatar-default.png'" mode="aspectFit"></image>
        <view class="inviter-name">{{ inviter.name || '未知玩家' }}</view>
        <view class="invitation-info">邀请你进行对战</view>
        <view class="time-control">
          <image class="clock-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9011.png" mode="aspectFit"></image>
          <text class="time-text">{{ inviter.timeControl || '10 min' }}</text>
        </view>
      </view>
      
      <view class="invitation-actions">
        <view class="action-btn decline-btn" @click="onDecline">
          <text class="btn-text">拒绝</text>
        </view>
        <view class="action-btn accept-btn" @click="onAccept">
          <text class="btn-text">接受</text>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'InvitationPopup',
  props: {
    inviter: {
      type: Object,
      default: () => ({
        id: 0,
        name: '',
        rating: 0,
        avatar: '',
        timeControl: '10 min'
      })
    }
  },
  methods: {
    // 打开弹窗
    open() {
      this.$refs.invitationPopup.open('center');
    },
    
    // 关闭弹窗
    close() {
      this.$refs.invitationPopup.close();
    },
    
    // 接受邀请
    onAccept() {
      this.$emit('accept', this.inviter);
      this.close();
    },
    
    // 拒绝邀请
    onDecline() {
      this.$emit('decline', this.inviter);
      this.close();
    },
    
    // 弹窗关闭事件
    onClose() {
      this.$emit('close');
    }
  }
}
</script>

<style lang="scss" scoped>
.invitation-popup {
  width: 550rpx;
  background-color: #333;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.3);
  
  .invitation-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #FFFFFF;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .invitation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 40rpx;
    
    .inviter-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      margin-bottom: 20rpx;
      border: 2rpx solid rgba(255, 255, 255, 0.2);
    }
    
    .inviter-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #FFFFFF;
      margin-bottom: 10rpx;
    }
    
    .invitation-info {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 20rpx;
    }
    
    .time-control {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 30rpx;
      padding: 10rpx 30rpx;
      
      .clock-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
      }
      
      .time-text {
        font-size: 28rpx;
        color: #FFFFFF;
      }
    }
  }
  
  .invitation-actions {
    display: flex;
    justify-content: space-between;
    
    .action-btn {
      flex: 1;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10rpx;
      
      .btn-text {
        font-size: 30rpx;
        font-weight: bold;
      }
    }
    
    .decline-btn {
      background-color: rgba(255, 255, 255, 0.1);
      margin-right: 20rpx;
      
      .btn-text {
        color: #FFFFFF;
      }
    }
    
    .accept-btn {
      background-color: #81B64C;
      
      .btn-text {
        color: #FFFFFF;
      }
    }
  }
}
</style> 