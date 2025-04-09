<template>
  <view class="rules-list-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-left"></text>
      </view>
      <view class="title">
        <text>规则入门</text>
      </view>
      <view class="header-right"></view>
    </view>
    
    <!-- 引导文本 -->
    <view class="guide-text">
      <text>通过这些课程学习国际象棋的基本规则和棋子走法</text>
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
          id: 'king-moves',
          title: '国王的移动',
          description: '学习国王如何在棋盘上移动',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e5.png',
          completed: true,
          progress: '1/5'
        },
        {
          id: 'queen-moves',
          title: '皇后的移动',
          description: '学习皇后如何在棋盘上移动',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e6.png',
          completed: true,
          progress: '1/5'
        },
        {
          id: 'rook-moves',
          title: '车的移动',
          description: '学习车如何在棋盘上移动',
          icon: 'https://pic1.imgdb.cn/item/67f3d491e381c3632bee96f9.png',
          completed: false,
          progress: '0/3'
        },
        {
          id: 'bishop-moves',
          title: '相的移动',
          description: '学习相如何在棋盘上移动',
          icon: 'https://pic1.imgdb.cn/item/67f3d490e381c3632bee96f8.png',
          completed: false,
          progress: '0/3'
        },
        {
          id: 'knight-moves',
          title: '马的移动',
          description: '学习马如何在棋盘上移动',
          icon: 'https://pic1.imgdb.cn/item/67f3d491e381c3632bee96fa.png',
          completed: false,
          progress: '0/3'
        },
        {
          id: 'pawn-moves',
          title: '兵的移动',
          description: '学习兵如何在棋盘上移动',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e4.png',
          completed: false,
          progress: '0/4'
        },
        {
          id: 'castling',
          title: '王车易位',
          description: '学习王车易位这一特殊走法',
          icon: 'https://pic1.imgdb.cn/item/67f3d54de381c3632bee973d.png',
          completed: false,
          progress: '0/2'
        },
        {
          id: 'en-passant',
          title: '吃过路兵',
          description: '学习吃过路兵这一特殊走法',
          icon: 'https://pic1.imgdb.cn/item/67f3d476e381c3632bee96e3.png',
          completed: false,
          progress: '0/2'
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
        url: `/pages/work/learn/rules?lesson=${lessonId}`
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
.rules-list-container {
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