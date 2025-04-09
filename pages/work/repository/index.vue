<template>
  <view class="repository-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部课程引导模块 -->
    <view class="header-section">
      <view class="progress-path">
        <image class="rook-icon" src="/static/images/chess/rook.png" mode="aspectFit"></image>
        <view class="title-container">
          <text class="title">学习下棋</text>
        </view>
      </view>
      <view class="start-course-btn" @click="startCourse">
        <text>开始课程</text>
      </view>
    </view>
    
    <!-- 中部课程展示模块 -->
    <view class="main-section">
      <!-- 标签切换 -->
      <view class="tabs">
        <view class="tab" :class="{active: activeTab === 'repository'}" @click="switchTab('repository')">
          <text>课程库</text>
          <view class="underline" v-if="activeTab === 'repository'"></view>
        </view>
        <view class="tab" :class="{active: activeTab === 'guide'}" @click="switchTab('guide')">
          <text>指导</text>
          <view class="underline" v-if="activeTab === 'guide'"></view>
        </view>
      </view>
      
      <!-- 分类图标区域 -->
      <view class="category-icons">
        <view 
          class="icon-item" 
          v-for="(category, index) in categories" 
          :key="index" 
          @click="switchCategory(category)"
          :class="{active: currentCategory === category.name}"
        >
          <image :src="category.icon" mode="aspectFit"></image>
          <text>{{ category.name }}</text>
        </view>
      </view>
      
      <!-- 课程卡片列表 -->
      <view class="course-list">
        <view 
          class="course-card" 
          v-for="(course, index) in filteredCourses" 
          :key="index" 
          @click="viewCourse(course)"
        >
          <view class="course-image">
            <image :src="course.image" mode="aspectFill"></image>
          </view>
          <view class="course-content">
            <view class="course-title">{{ course.title }}</view>
            <view class="course-desc">{{ course.description }}</view>
            <view class="course-meta">
              <view class="course-author">
                <image v-if="course.authorAvatar" :src="course.authorAvatar" mode="aspectFit" class="author-avatar"></image>
                <text>{{ course.author }}</text>
              </view>
              <view class="course-level">
                <text>{{ course.level }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 分页指示器 -->
      <view class="pagination">
        <view 
          class="page-dot" 
          v-for="n in totalPages" 
          :key="n" 
          :class="{active: currentPage === n}"
          @click="goToPage(n)"
        ></view>
      </view>
    </view>
    
    <!-- 底部导航栏 -->
    <tab-bar active-tab="learn"></tab-bar>
  </view>
</template>

<script>
import TopSpacing from '@/components/TopSpacing.vue';
import TabBar from '@/components/TabBar.vue';

export default {
  components: {
    TopSpacing,
    TabBar
  },
  data() {
    return {
      statusBarHeight: 0,
      activeTab: 'repository',
      currentCategory: '全部',
      currentPage: 1,
      totalPages: 4,
      categories: [
        { name: '全部', icon: '/static/images/learn/chess-library.png' },
        { name: '开局', icon: '/static/images/learn/chess-move.png' },
        { name: '战术', icon: '/static/images/learn/knight-move.png' },
        { name: '策略', icon: '/static/images/learn/graduation-cap.png' },
        { name: '残局', icon: '/static/images/chess/king.png' },
        { name: '大师', icon: '/static/images/match/crown.png' },
      ],
      courses: [
        {
          id: 1,
          title: 'Play Like Gukesh Dommaraju',
          description: 'Dive deeper into the best games of the world\'s youngest challenger!',
          author: 'GM Williams',
          authorAvatar: '/static/images/match/avatar-user.png',
          level: 'Mastery',
          image: '/static/images/chess/board.png',
          category: '大师'
        },
        {
          id: 2,
          title: 'Jan\'s Four Knights',
          description: 'Grandmaster Jan Gustafsson teaches you how to react to 1.e4 c5 for the most principled players! This is essential viewing if you play either side!',
          author: 'GM Gustafsson',
          authorAvatar: '/static/images/match/avatar-user.png',
          level: 'Mastery',
          image: '/static/images/chess/knight.png',
          category: '开局'
        },
        {
          id: 3,
          title: 'Gambit Buffet',
          description: 'Grandmaster Simon Williams provides an introduction to gambits and the most exciting chess games from chess history!',
          author: 'Simon Williams',
          authorAvatar: '/static/images/match/avatar-user.png',
          level: 'Mastery',
          image: '/static/images/chess/board.png',
          category: '战术'
        }
      ]
    }
  },
  computed: {
    filteredCourses() {
      if (this.currentCategory === '全部') {
        return this.courses;
      }
      return this.courses.filter(course => course.category === this.currentCategory);
    }
  },
  onLoad() {
    const systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
  },
  methods: {
    startCourse() {
      uni.navigateTo({
        url: '/pages/work/learn/index'
      });
    },
    switchTab(tab) {
      this.activeTab = tab;
    },
    switchCategory(category) {
      this.currentCategory = category.name;
      this.currentPage = 1;
    },
    viewCourse(course) {
      // 查看课程详情逻辑
      console.log('查看课程：', course.title);
      uni.navigateTo({
        url: `/pages/work/repository/detail?id=${course.id}`
      });
    },
    goToPage(page) {
      this.currentPage = page;
    }
  }
}
</script>

<style lang="scss" scoped>
.repository-container {
  min-height: 100vh;
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* 顶部课程引导模块 */
.header-section {
  padding: 30rpx;
  
  .progress-path {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .rook-icon {
      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;
    }
    
    .title-container {
      .title {
        color: #ffffff;
        font-size: 32rpx;
        font-weight: bold;
      }
    }
  }
  
  .start-course-btn {
    background-color: #8BC34A;
    border-radius: 10rpx;
    padding: 24rpx 0;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    
    text {
      color: #ffffff;
      font-size: 32rpx;
      font-weight: bold;
    }
  }
}

/* 中部课程展示模块 */
.main-section {
  flex: 1;
  padding: 0 30rpx;
  
  /* 标签切换 */
  .tabs {
    display: flex;
    margin-bottom: 40rpx;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    .tab {
      padding: 20rpx 0;
      margin-right: 60rpx;
      position: relative;
      
      text {
        color: #ffffff;
        font-size: 28rpx;
      }
      
      &.active {
        .underline {
          position: absolute;
          bottom: -2rpx;
          left: 0;
          width: 100%;
          height: 4rpx;
          background-color: #ffffff;
        }
      }
    }
  }
  
  /* 分类图标区域 */
  .category-icons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30rpx;
    margin-bottom: 40rpx;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.7;
      transition: opacity 0.3s;
      
      &.active {
        opacity: 1;
      }
      
      image {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 10rpx;
      }
      
      text {
        color: #ffffff;
        font-size: 24rpx;
      }
    }
  }
  
  /* 课程卡片列表 */
  .course-list {
    .course-card {
      background-color: rgba(33, 33, 33, 0.7);
      border-radius: 16rpx;
      margin-bottom: 30rpx;
      overflow: hidden;
      
      .course-image {
        height: 300rpx;
        width: 100%;
        position: relative;
        
        image {
          width: 100%;
          height: 100%;
        }
      }
      
      .course-content {
        padding: 20rpx;
        
        .course-title {
          color: #ffffff;
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
        }
        
        .course-desc {
          color: rgba(255, 255, 255, 0.7);
          font-size: 24rpx;
          margin-bottom: 20rpx;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .course-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .course-author {
            display: flex;
            align-items: center;
            
            .author-avatar {
              width: 40rpx;
              height: 40rpx;
              border-radius: 50%;
              margin-right: 10rpx;
            }
            
            text {
              color: rgba(255, 255, 255, 0.6);
              font-size: 24rpx;
            }
          }
          
          .course-level {
            text {
              color: #FFD700;
              font-size: 24rpx;
              font-weight: bold;
            }
          }
        }
      }
    }
  }
  
  /* 分页指示器 */
  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30rpx;
    margin-bottom: 30rpx;
    
    .page-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      margin: 0 10rpx;
      
      &.active {
        background-color: #ffffff;
      }
    }
  }
}
</style>