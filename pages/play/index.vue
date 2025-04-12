<template>
  <view class="play-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部标题区 -->
    <view class="header">
      <text class="title">此刻开始</text>
      <image class="title-icon" src="https://pic1.imgdb.cn/item/67f3c634e381c3632bee9029.png" mode="aspectFit"></image>
    </view>
    
    <!-- 功能模块区 -->
    <view class="modules">
      <!-- 在线匹配 -->
      <view class="module-item" @click="handleModuleClick('online')">
        <view class="module-icon lightning-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c64fe381c3632bee9039.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">在线匹配</text>
          <text class="module-subtitle">用你的技巧来和玩家对战</text>
        </view>
      </view>
      
      <!-- 人机对战 -->
      <view class="module-item" @click="handleModuleClick('robot')">
        <view class="module-icon robot-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9d.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">人机对战</text>
          <text class="module-subtitle">机器人陪你从菜鸟到大师</text>
        </view>
      </view>
      
      <!-- 邀请好友 -->
      <view class="module-item" @click="handleModuleClick('invite')">
        <view class="module-icon handshake-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9022.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">邀请好友</text>
          <text class="module-subtitle">叫上好基友来一把</text>
        </view>
      </view>
      
      <!-- 天梯赛 -->
      <view class="module-item" @click="handleModuleClick('ladder')">
        <view class="module-icon trophy-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9020.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">天梯赛</text>
          <text class="module-subtitle">胜者为王，败者加油</text>
        </view>
      </view>
      
      <!-- 底部辅助功能 -->
      <view class="bottom-tools">
        <view class="tool-item" @click="handleToolClick('history')">
          <image class="tool-icon" src="https://pic1.imgdb.cn/item/67f3c64fe381c3632bee9038.png" mode="aspectFit"></image>
          <text class="tool-text">游戏历史</text>
        </view>
        <view class="tool-item" @click="handleToolClick('rank')">
          <image class="tool-icon" src="https://pic1.imgdb.cn/item/67f3d224e381c3632bee95ee.png" mode="aspectFit"></image>
          <text class="tool-text">排行榜</text>
        </view>
      </view>
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
    // 处理模块点击
    handleModuleClick(type) {
      switch (type) {
        case 'online':
          uni.navigateTo({
            url: '/pages/play/match/index'
          });
          break;
        case 'robot':
          uni.navigateTo({
            url: '/pages/play/robot/index'
          });
          break;
        case 'invite':
          // 跳转到好友对战界面
          uni.navigateTo({
            url: '/pages/play/match/index?mode=friends'
          });
          break;
        case 'ladder':
          // 直接跳转到天梯赛模式
          uni.navigateTo({
            url: '/pages/play/match/index?mode=ladder'
          });
          break;
      }
    },
    // 处理底部工具点击
    handleToolClick(type) {
      switch (type) {
        case 'history':
          uni.showToast({
            title: '查看游戏历史',
            icon: 'none'
          });
          break;
        case 'rank':
          uni.showToast({
            title: '查看排行榜',
            icon: 'none'
          });
          break;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.play-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .title {
    color: #ffffff;
    font-size: 64rpx;
    font-weight: bold;
    text-align: center;
  }
  
  .title-icon {
    width: 120rpx;
    height: 120rpx;
    margin-top: 40rpx;
  }
}

.modules {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .module-item {
    display: flex;
    align-items: center;
    background-color: rgba(0,0,0,0.2);
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    
    .module-icon {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      
      image {
        width: 80rpx;
        height: 80rpx;
      }
    }
    
    .module-content {
      margin-left: 30rpx;
      display: flex;
      flex-direction: column;
      
      .module-title {
        color: #ffffff;
        font-size: 44rpx;
        font-weight: 600;
        margin-bottom: 15rpx;
      }
      
      .module-subtitle {
        color: #cccccc;
        font-size: 32rpx;
      }
    }
  }
  
  .bottom-tools {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
    
    .tool-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 50rpx;
      
      .tool-icon {
        width: 60rpx;
        height: 60rpx;
        margin-bottom: 10rpx;
      }
      
      .tool-text {
        color: #ffffff;
        font-weight: bold;
        font-size: 32rpx;
      }
    }
  }
}
</style> 