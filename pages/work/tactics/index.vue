<template>
  <view class="tactics-list-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-left"></text>
      </view>
      <view class="title">
        <text>战术训练</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <!-- 引导文本 -->
    <view class="guide-text">
      <text>通过这些课程学习国际象棋的战术技巧和策略</text>
    </view>
    
    <!-- 课程列表 -->
    <view class="lesson-list">
      <view 
        v-for="lesson in lessonList" 
        :key="lesson.id" 
        class="lesson-item"
        :class="{'completed': lesson.completed}"
        @click="goToLesson(lesson.id)"
      >
        <view class="lesson-icon">
          <image :src="lesson.icon" mode="aspectFit"></image>
        </view>
        <view class="lesson-content">
          <view class="lesson-title">
            <text>{{ lesson.title }}</text>
          </view>
          <view class="lesson-desc">
            <text>{{ lesson.description }}</text>
          </view>
        </view>
        <view class="lesson-status">
          <view v-if="lesson.completed" class="completed-icon">
            <text class="iconfont icon-check"></text>
          </view>
          <view v-else class="progress-icon">
            <text>{{ lesson.progress }}</text>
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

export default {
  components: {
    TopSpacing,
    TabBar
  },
  data() {
    return {
      statusBarHeight: 0,
      lessonList: [
        {
          id: 'defense',
          title: '防御战术',
          description: '学习如何防守对手的攻击并保护自己的棋子',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e5.png',
          completed: false,
          progress: '0/5'
        },
        {
          id: 'attack',
          title: '进攻战术',
          description: '学习如何发起有效的攻击并突破对手的防线',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e6.png',
          completed: false,
          progress: '0/5'
        },
        {
          id: 'control',
          title: '局面控制',
          description: '学习如何控制棋盘中心和关键格子',
          icon: 'https://pic1.imgdb.cn/item/67f3d491e381c3632bee96f9.png',
          completed: false,
          progress: '0/4'
        },
        {
          id: 'endgame',
          title: '残局技巧',
          description: '学习关键的残局技巧和策略',
          icon: 'https://pic1.imgdb.cn/item/67f3d490e381c3632bee96f8.png',
          completed: false,
          progress: '0/4'
        }
      ]
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    // 前往具体的课程
    goToLesson(lessonId) {
      uni.navigateTo({
        url: `/pages/work/tactics/lesson?lesson=${lessonId}`
      });
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.tactics-list-container {
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  padding-bottom: 30rpx;
}

/* 顶部导航栏 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  
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

/* 引导文本 */
.guide-text {
  padding: 0 50rpx;
  margin-bottom: 40rpx;
  
  text {
    color: #ffffff;
    font-size: 32rpx;
    text-align: center;
  }
}

/* 课程列表 */
.lesson-list {
  flex: 1;
  padding: 0 30rpx;
  
  .lesson-item {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
    
    &.completed {
      background-color: rgba(139, 195, 74, 0.3);
    }
    
    .lesson-icon {
      width: 90rpx;
      height: 90rpx;
      border-radius: 45rpx;
      background-color: #47474754;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 30rpx;
      
      image {
        width: 70rpx;
        height: 70rpx;
      }
    }
    
    .lesson-content {
      flex: 1;
      
      .lesson-title {
        margin-bottom: 10rpx;
        
        text {
          color: #333333;
          font-size: 36rpx;
          font-weight: bold;
        }
      }
      
      .lesson-desc {
        text {
          color: #666666;
          font-size: 28rpx;
        }
      }
    }
    
    .lesson-status {
      .completed-icon {
        width: 60rpx;
        height: 60rpx;
        border-radius: 30rpx;
        background-color: #8BC34A;
        display: flex;
        justify-content: center;
        align-items: center;
        
        .iconfont {
          color: #ffffff;
          font-size: 36rpx;
        }
      }
      
      .progress-icon {
        padding: 10rpx 20rpx;
        background-color: #f0f0f0;
        border-radius: 30rpx;
        
        text {
          color: #666666;
          font-size: 24rpx;
        }
      }
    }
  }
}
</style>