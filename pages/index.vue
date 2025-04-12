<template>
  <view class="home-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 用户信息区 -->
    <view class="user-info-section">
      <view class="user-avatar-name">
        <image class="user-avatar" src="https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png" mode="aspectFill"></image>
        <view class="user-name-signature">
          <view class="user-name">
            <text class="user-tag">GM</text>
            <text class="user-name-text">NikoTheodorou</text>
          </view>
          <text class="user-signature">这个地方是个性签名......</text>
        </view>
      </view>
      
      <view class="user-status-info">
        <view class="user-status">
          <text class="status-label">在线状态</text>
          <text class="status-value">Online Now</text>
        </view>
        <view class="user-register">
          <text class="register-label">注册时间</text>
          <text class="register-value">Nov 12, 2023</text>
        </view>
      </view>
    </view>
    
    <!-- 统计数据区 -->
    <view class="stats-section">
      <view class="season-trophy">
        <image class="trophy-icon" src="https://pic1.imgdb.cn/item/67f3c667e381c3632bee903e.png" mode="aspectFit"></image>
      </view>
      <view class="stats-item">
        <text class="stats-label">场次</text>
        <text class="stats-value">129</text>
      </view>
      <view class="stats-item">
        <text class="stats-label">积分</text>
        <text class="stats-value">335</text>
      </view>
      <view class="stats-item">
        <text class="stats-label">胜率</text>
        <text class="stats-value">50.5%</text>
      </view>
    </view>
    
    <!-- 历史对局区 -->
    <view class="history-section">
      <view class="history-header">
        <text class="history-title">历史对局</text>
        <text class="history-more">...</text>
      </view>
      
      <view class="match-table">
        <view class="table-header">
          <text class="cell-player">棋手</text>
          <text class="cell-result">结果</text>
          <text class="cell-steps">步数</text>
          <text class="cell-date">日期</text>
        </view>
        
        <!-- 对局记录1 -->
        <view class="match-record" @tap="goToReplay('match1')">
          <view class="match-players">
            <view class="match-row">
              <view class="cell-player">
                <view class="player-indicator win"></view>
                <view class="player-info">
                  <text class="player-name">NikoTheodo</text>
                  <text class="player-rating">(3072)</text>
                </view>
              </view>
              <text class="cell-result">1</text>
              <text class="cell-steps">25</text>
              <text class="cell-date">25-03-26</text>
            </view>
            <view class="match-row opponent">
              <view class="cell-player">
                <view class="player-indicator lose"></view>
                <view class="player-info">
                  <text class="player-name">theloyalwolf</text>
                  <text class="player-rating">(2952)</text>
                </view>
              </view>
              <text class="cell-result">0</text>
              <text class="cell-steps"></text>
              <text class="cell-date"></text>
            </view>
          </view>
          <view class="match-result win">
            <text class="result-text">胜</text>
          </view>
        </view>
        
        <!-- 对局记录2 -->
        <view class="match-record" @tap="goToReplay('match2')">
          <view class="match-players">
            <view class="match-row">
              <view class="cell-player">
                <view class="player-indicator win"></view>
                <view class="player-info">
                  <text class="player-name">NikoTheodo</text>
                  <text class="player-rating">(3072)</text>
                </view>
              </view>
              <text class="cell-result">1</text>
              <text class="cell-steps">25</text>
              <text class="cell-date">25-03-26</text>
            </view>
            <view class="match-row opponent">
              <view class="cell-player">
                <view class="player-indicator lose"></view>
                <view class="player-info">
                  <text class="player-name">theloyalwolf</text>
                  <text class="player-rating">(2952)</text>
                </view>
              </view>
              <text class="cell-result">0</text>
              <text class="cell-steps"></text>
              <text class="cell-date"></text>
            </view>
          </view>
          <view class="match-result lose">
            <text class="result-text">负</text>
          </view>
        </view>
        
        <!-- 对局记录3 -->
        <view class="match-record" @tap="goToReplay('match3')">
          <view class="match-players">
            <view class="match-row">
              <view class="cell-player">
                <view class="player-indicator win"></view>
                <view class="player-info">
                  <text class="player-name">NikoTheodo</text>
                  <text class="player-rating">(3072)</text>
                </view>
              </view>
              <text class="cell-result">1</text>
              <text class="cell-steps">25</text>
              <text class="cell-date">25-03-26</text>
            </view>
            <view class="match-row opponent">
              <view class="cell-player">
                <view class="player-indicator lose"></view>
                <view class="player-info">
                  <text class="player-name">theloyalwolf</text>
                  <text class="player-rating">(2952)</text>
                </view>
              </view>
              <text class="cell-result">0</text>
              <text class="cell-steps"></text>
              <text class="cell-date"></text>
            </view>
          </view>
          <view class="match-result win">
            <text class="result-text">胜</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-btn" @click="handleLogout">
      <image class="logout-icon" src="https://pic1.imgdb.cn/item/67f3c667e381c3632bee903d.png" mode="aspectFit"></image>
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script>
import TopSpacing from '@/components/TopSpacing.vue'

export default {
  components: {
    TopSpacing
  },
  data() {
    return {
      statusBarHeight: 0
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已退出登录',
              icon: 'none'
            });
            // 实际退出逻辑
            // uni.removeStorageSync('token');
            // uni.reLaunch({
            //   url: '/pages/login'
            // });
          }
        }
      });
    },
    goToReplay(matchId) {
      console.log('跳转到回看界面:', matchId)
      uni.navigateTo({
        url: `/pages/play/replay/index?id=${matchId}`,
        success: () => {
          console.log('跳转成功')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
}

// 用户信息区
.user-info-section {
  display: flex;
  flex-direction: column;
  background-color: rgba(40, 25, 12, 0.6);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .user-avatar-name {
    display: flex;
    margin-bottom: 30rpx;
    
    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 20rpx;
    }
    
    .user-name-signature {
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      
      .user-name {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
        
        .user-tag {
          background-color: #a31212;
          color: white;
          font-size: 28rpx;
          padding: 0 10rpx;
          border-radius: 6rpx;
          margin-right: 10rpx;
        }
        
        .user-name-text {
          color: white;
          font-size: 36rpx;
          font-weight: bold;
        }
      }
      
      .user-signature {
        color: #cccccc;
        font-size: 32rpx;
      }
    }
  }
  
  .user-status-info {
    display: flex;
    justify-content: space-around;
    
    .user-status, .user-register {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .status-label, .register-label {
        color: white;
        font-size: 28rpx;
        margin-bottom: 10rpx;
      }
      
      .status-value, .register-value {
        color: white;
        font-size: 28rpx;
      }
    }
  }
}

// 统计数据区
.stats-section {
  display: flex;
  background-color: rgba(40, 25, 12, 0.6);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .season-trophy {
    display: flex;
    justify-content: center;
    align-items: center;
    
    .trophy-icon {
      width: 100rpx;
      height: 100rpx;
    }
  }
  
  .stats-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stats-label {
      color: white;
      font-size: 36rpx;
      margin-bottom: 10rpx;
    }
    
    .stats-value {
      color: white;
      font-size: 50rpx;
      font-weight: bold;
    }
  }
}

// 历史对局区
.history-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(40, 25, 12, 0.6);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .history-title {
      color: white;
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .history-more {
      color: white;
      font-size: 36rpx;
    }
  }
  
  .match-table {
    flex: 1;
    
    .table-header {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      background-color: rgba(60, 60, 60, 0.5);
      
      text {
        color: white;
        font-size: 24rpx;
        font-weight: bold;
      }
      
      .cell-player {
        flex: 3;
        padding-left: 20rpx;
      }
      
      .cell-result, .cell-steps, .cell-date {
        flex: 1;
        text-align: center;
      }
    }
    
    .match-record {
      display: flex;
      margin: 30rpx auto;
      position: relative;
      
      .match-players {
        flex: 1;
      }
      
      .match-result {
        position: absolute;
        right: 35%;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
        
        &.win {
          .result-text {
            color: #81b64c;
            font-size: 24rpx;
            font-weight: bold;
          }
        }
        
        &.lose {
          .result-text {
            color: #e84118;
            font-size: 22rpx;
            font-weight: bold;
          }
        }
      }
    }
    
    .match-row {
      display: flex;
      align-items: center;
      padding: 0rpx 0;
      
      &.opponent {
        padding-top: 0;
        margin-bottom: 0rpx;
      }
      
      .cell-player {
        flex: 3;
        display: flex;
        align-items: center;
        padding-left: 20rpx;
        
        .player-indicator {
          width: 20rpx;
          height: 20rpx;
          border-radius: 4rpx;
          margin-right: 15rpx;
          
          &.win {
            background-color: #81b64c;
          }
          
          &.lose {
            background-color: #a2a2a2;
          }
        }
        
        .player-info {
          display: flex;
          
          .player-name {
            color: white;
            font-size: 24rpx;
            margin-right: 10rpx;
          }
          
          .player-rating {
            color: #cccccc;
            font-size: 24rpx;
          }
        }
      }
      
      .cell-result, .cell-steps, .cell-date {
        flex: 1;
        color: white;
        font-size: 24rpx;
        text-align: center;
        justify-content: center;
      }
    }
  }
}

// 退出登录按钮
.logout-btn {
  display: flex;
  align-items: center;
    justify-content: center;
  margin-bottom: 40rpx;
  
  .logout-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 10rpx;
  }
  
  .logout-text {
    color: white;
    font-size: 36rpx;
  }
}
</style>
