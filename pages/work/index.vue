<template>
  <view class="learn-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部标题区 -->
    <view class="header">
      <image class="title-icon" src="https://pic1.imgdb.cn/item/67f3c634e381c3632bee9026.png" mode="aspectFit"></image>
      <text class="title">学习国际象棋</text>
    </view>
    
    <!-- 引导对话区 -->
    <view class="guide-dialog">
      <image class="avatar" src="https://pic1.imgdb.cn/item/67f3eb4ce381c3632beea0b4.png" mode="aspectFit"></image>
      <view class="dialog-bubble">
        <text class="dialog-text">让我教你如何下国际象棋吧！</text>
      </view>
    </view>
    
    <!-- 功能模块区 -->
    <view class="modules">
      <!-- 规则入门 -->
      <view class="module-item" @click="handleModuleClick('rules')">
        <view class="module-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c634e381c3632bee9029.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">规则入门</text>
        </view>
      </view>
      
      <!-- 基础战术 -->
      <view class="module-item" @click="handleModuleClick('tactics')">
        <view class="module-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c634e381c3632bee9028.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">基础战术</text>
        </view>
      </view>
      
      <!-- 资料仓库 -->
      <view class="module-item" @click="handleModuleClick('library')">
        <view class="module-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c634e381c3632bee9027.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">资料仓库</text>
        </view>
      </view>
      
      <!-- 管理入口，仅管理员可见 -->
      <view class="module-item admin-module" v-if="isAdmin" @click="goToAdmin">
        <view class="module-icon">
          <view class="iconfont icon-setting"></view>
        </view>
        <view class="module-content">
          <text class="module-title">课程管理</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TopSpacing from '@/components/TopSpacing.vue'
import TabBar from '@/components/TabBar.vue'
import { checkRole } from '@/utils/permission'

export default {
  components: {
    TopSpacing,
    TabBar
  },
  data() {
    return {
      statusBarHeight: 0,
      isAdmin: false
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 检查是否为管理员
    this.checkAdminRole()
  },
  
  // 每次进入页面时检查管理员权限
  onShow() {
    this.checkAdminRole()
  },
  
  methods: {
    // 检查管理员权限
    checkAdminRole() {
      // 从store获取角色信息
      const roles = this.$store.getters.roles || []
      console.log('当前用户角色:', roles)
      this.isAdmin = checkRole(['admin'])
    },
    
    // 前往学习模块
    goToLearn() {
      uni.navigateTo({
        url: '/pages/work/learn/index'
      })
    },
    
    // 前往管理界面
    goToAdmin() {
      console.log('正在跳转到管理界面...')
      try {
        uni.navigateTo({
          url: '/pages/work/admin/index',
          success: (res) => {
            console.log('跳转成功！', res)
          },
          fail: (err) => {
            console.error('跳转失败：', err)
            // 尝试使用不同的路由格式
            uni.navigateTo({
              url: './admin/index',
              success: (res) => {
                console.log('使用相对路径跳转成功！', res)
              },
              fail: (err2) => {
                console.error('使用相对路径也跳转失败：', err2)
                uni.showToast({
                  title: '无法访问管理页面',
                  icon: 'none'
                })
              }
            })
          }
        })
      } catch (error) {
        console.error('跳转异常：', error)
      }
    },
    
    // 处理模块点击
    handleModuleClick(type) {
      switch (type) {
        case 'rules':
          uni.navigateTo({
            url: '/pages/work/learn/index'
          });
          break;
        case 'tactics':
          uni.navigateTo({
            url: '/pages/work/tactics/index'
          });
          break;
        case 'library':
          uni.navigateTo({
            url: '/pages/work/repository/index'
          });
          break;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.learn-container {
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
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  
  .title-icon {
    width: 64rpx;
    height: 64rpx;
    margin-right: 20rpx;
  }
  
  .title {
    color: #ffffff;
    font-size: 64rpx;
    font-weight: bold;
    text-align: center;
  }
}

.guide-dialog {
  display: flex;
  align-items: flex-start;
  margin-bottom: 60rpx;
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    margin-right: 20rpx;
  }
  
  .dialog-bubble {
    background-color: #ffffff;
    border-radius: 30rpx;
    padding: 20rpx 30rpx;
    position: relative;
    max-width: 70%;
    
    &:before {
      content: '';
      position: absolute;
      left: -20rpx;
      top: 40rpx;
      border-width: 10rpx;
      border-style: solid;
      border-color: transparent #ffffff transparent transparent;
    }
    
    .dialog-text {
      color: #565656;
      font-size: 34rpx;
      font-weight: bold;
    }
  }
}

.modules {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .module-item {
    display: flex;
    align-items: center;
    background-color: rgba(67, 41, 21, 0.7);
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
      
      .iconfont {
        color: #ffffff;
        font-size: 60rpx;
      }
    }
    
    .module-content {
      margin-left: 30rpx;
      display: flex;
      flex-direction: column;
      
      .module-title {
        color: #ffffff;
        font-size: 48rpx;
      }
    }
    
    &.admin-module {
      background-color: rgba(0,0,0,0.2);
    }
  }
}

.card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 20rpx;
  margin-bottom: 30rpx;
  
  .card-icon {
    width: 90rpx;
    height: 90rpx;
    border-radius: 45rpx;
    background-color: rgba(33, 150, 243, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 20rpx;
    
    image {
      width: 50rpx;
      height: 50rpx;
    }
    
    &.admin-icon {
      background-color: rgba(255, 87, 34, 0.3);
      
      .iconfont {
        font-size: 40rpx;
        color: #FF5722;
      }
    }
  }
}
</style>
