<!-- 通用底部导航栏组件 -->
<template>
  <view class="bottom-nav">
    <view class="nav-item" :class="{ active: activeTab === 'home' }" @click="handleTabClick('home')">
      <image class="nav-icon" src="https://pic1.imgdb.cn/item/67f3c58ae381c3632bee8fe0.png" mode="aspectFit"></image>
      <text class="nav-text">主页</text>
    </view>
    <view class="nav-item" :class="{ active: activeTab === 'play' }" @click="handleTabClick('play')">
      <image class="nav-icon" src="https://pic1.imgdb.cn/item/67f3c58ae381c3632bee8fdf.png" mode="aspectFit"></image>
      <text class="nav-text">开玩</text>
    </view>
    <view class="nav-item" :class="{ active: activeTab === 'learn' }" @click="handleTabClick('learn')">
      <image class="nav-icon" src="https://pic1.imgdb.cn/item/67f3c58ae381c3632bee8fdd.png" mode="aspectFit"></image>
      <text class="nav-text">进步</text>
    </view>
    <view class="nav-item" :class="{ active: activeTab === 'social' }" @click="handleTabClick('social')">
      <image class="nav-icon" src="https://pic1.imgdb.cn/item/67f3c58ae381c3632bee8fde.png" mode="aspectFit"></image>
      <text class="nav-text">消息</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    activeTab: {
      type: String,
      default: 'home'
    }
  },
  methods: {
    handleTabClick(tab) {
      this.$emit('tab-change', tab);
      
      // 导航到对应页面
      const pages = {
        'home': '/pages/index',
        'play': '/pages/play/index',
        'learn': '/pages/work/index',
        'social': '/pages/mail/index'
      };
      
      if (pages[tab]) {
        uni.switchTab({
          url: pages[tab]
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color:zrgba(0,0,0,0.8);
  display: flex;
  justify-content: space-around;

  z-index: 999;
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10rpx 0;
    opacity: 0.5;
    
    &.active {
      opacity: 1;
    }
    
    .nav-icon {
      width: 50rpx;
      height: 50rpx;
      margin-bottom: 5rpx;
    }
    
    .nav-text {
      font-size: 24rpx;
      color: #EEEEEE;
    }
  }
}
</style> 