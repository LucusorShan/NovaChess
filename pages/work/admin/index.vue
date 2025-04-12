<template>
  <view class="admin-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-left"></text>
      </view>
      <view class="title">
        <text>NovaChess-CourSet</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <!-- 管理员信息区 -->
    <view class="admin-profile">
      <view class="admin-avatar">
        <image src="/static/images/match/avatar-user.png" mode="aspectFill"></image>
      </view>
      <view class="admin-info">
        <view class="admin-name">管理员</view>
        <view class="admin-role">课程编辑权限</view>
      </view>
    </view>
    
    <!-- 快捷统计信息 -->
    <view class="stat-cards">
      <view class="stat-card">
        <view class="stat-number">12</view>
        <view class="stat-label">已有课程</view>
      </view>
      <view class="stat-card">
        <view class="stat-number">86</view>
        <view class="stat-label">学习人次</view>
      </view>
      <view class="stat-card">
        <view class="stat-number">4</view>
        <view class="stat-label">今日新课</view>
      </view>
    </view>
    
    <!-- 管理模块列表 -->
    <view class="admin-modules">      
      <view class="module-list">
        <view class="module-item" @click="goToCourseManagement">
          <view class="module-icon course-icon">
            <text class="iconfont icon-book">C</text>
          </view>
          <view class="module-content">
            <view class="module-title">
              <text>课程管理</text>
            </view>
            <view class="module-desc">
              <text>添加、编辑和管理学习课程</text>
            </view>
          </view>
          <view class="module-action">
            <text class="iconfont icon-right"></text>
          </view>
        </view>
        
        <view class="module-item" @click="goToTacticsManagement">
          <view class="module-icon tactics-icon">
            <text class="iconfont icon-strategy">S</text>
          </view>
          <view class="module-content">
            <view class="module-title">
              <text>战术管理</text>
            </view>
            <view class="module-desc">
              <text>管理战术练习和挑战</text>
            </view>
          </view>
          <view class="module-action">
            <text class="iconfont icon-right"></text>
          </view>
        </view>

        <view class="module-item" @click="goToUserManagement">
          <view class="module-icon user-icon">
            <text class="iconfont icon-user"></text>
          </view>
          <view class="module-content">
            <view class="module-title">
              <text>用户管理</text>
            </view>
            <view class="module-desc">
              <text>管理系统用户和权限</text>
            </view>
          </view>
          <view class="module-action">
            <text class="iconfont icon-right"></text>
          </view>
        </view>
      </view>
    </view>
    

    <!-- 底部导航栏 -->
    <tab-bar active-tab="learn"></tab-bar>
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
      statusBarHeight: 0
    }
  },
  onLoad() {
    console.log('管理员主页加载...')
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 检查管理员权限
    if (!this.checkAdminPermission()) {
      console.log('权限校验失败，非管理员用户')
      uni.showToast({
        title: '无权访问管理界面',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      console.log('权限校验通过，当前用户是管理员')
    }
  },
  methods: {
    // 检查管理员权限
    checkAdminPermission() {
      return checkRole(['admin'])
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 前往课程管理
    goToCourseManagement() {
      uni.navigateTo({
        url: '/pages/work/admin/course/index'
      })
    },
    
    // 前往战术管理
    goToTacticsManagement() {
      uni.navigateTo({
        url: '/pages/work/admin/tactics/index'
      })
    },
    
    // 前往用户管理
    goToUserManagement() {
      uni.navigateTo({
        url: '/pages/work/admin/user/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E3A50 0%, #27496D 100%);
  display: flex;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  flex-direction: column;
  padding-bottom: 130rpx;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  
  .back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .iconfont {
      color: #ffffff;
      font-size: 44rpx;
    }
  }
  
  .title {
    flex: 1;
    text-align: center;
    
    text {
      color: #ffffff;
      font-size: 44rpx;
      font-weight: bold;
    }
  }
  
  .header-right {
    width: 80rpx;
  }
}

/* 管理员信息区 */
.admin-profile {
  display: flex;
  align-items: center;
  padding: 20rpx 40rpx;
  margin: 0 30rpx 30rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  
  .admin-avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    overflow: hidden;
    margin-right: 30rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    
    image {
      width: 100%;
      height: 100%;
    }
  }
  
  .admin-info {
    .admin-name {
      font-size: 36rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10rpx;
    }
    
    .admin-role {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.7);
      background-color: rgba(139, 195, 74, 0.2);
      display: inline-block;
      padding: 6rpx 20rpx;
      border-radius: 30rpx;
    }
  }
}

/* 统计卡片 */
.stat-cards {
  display: flex;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-bottom: 40rpx;
  
  .stat-card {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20rpx;
    padding: 30rpx 20rpx;
    text-align: center;
    margin: 0 10rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
    
    .stat-number {
      font-size: 48rpx;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 10rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

/* 管理模块 */
.admin-modules {
  flex: 1;
  padding: 0 30rpx;
  
  .module-list {
    .module-item {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 20rpx;
      padding: 30rpx;
      margin-bottom: 30rpx;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
      
      &:active {
        transform: scale(0.98);
      }
      
      .module-icon {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 30rpx;
        
        &.course-icon {
          background: #8bc34a;
        }
        
        &.tactics-icon {
          background: #8bc34a;
        }
        
        &.user-icon {
          background: #8bc34a;
        }
        
        .iconfont {
          color: #ffffff;
          font-size: 48rpx;
        }
      }
      
      .module-content {
        flex: 1;
        
        .module-title {
          margin-bottom: 10rpx;
          
          text {
            color: #EEE;
            font-size: 36rpx;
            font-weight: bold;
          }
        }
        
        .module-desc {
          text {
            color: #DDD;
            font-size: 26rpx;
          }
        }
      }
      
      .module-action {
        .iconfont {
          color: #999999;
          font-size: 36rpx;
        }
      }
    }
  }
}

/* 版本信息 */
.version-info {
  text-align: center;
  padding: 30rpx 0;
  
  text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.5);
  }
}
</style> 