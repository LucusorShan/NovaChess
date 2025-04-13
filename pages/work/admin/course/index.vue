<template>
  <view class="course-admin-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="iconfont icon-left"></text>
      </view>
      <view class="title">
        <text>课程管理</text>
      </view>
      <view class="header-right">
        <view class="add-btn" @click="addNewCourse">
          <text class="iconfont icon-add"></text>
        </view>
      </view>
    </view>
    
    <!-- 搜索和过滤区域 -->
    <view class="filter-section">
      <view class="search-box">
        <text class="iconfont icon-search"></text>
        <input 
          type="text" 
          placeholder="搜索课程名称或描述" 
          v-model="searchKeyword"
          @input="searchCourses"
        />
      </view>
      
      <!-- 分类标签 -->
      <scroll-view class="category-scroll" scroll-x="true" show-scrollbar="false">
        <view class="category-tabs">
          <view 
            class="tab-item" 
            :class="{ active: currentCategory === 'all' }"
            @click="filterByCategory('all')"
          >
            <text>全部</text>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentCategory === 'basic' }"
            @click="filterByCategory('basic')"
          >
            <text>基础</text>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentCategory === 'advanced' }"
            @click="filterByCategory('advanced')"
          >
            <text>进阶</text>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentCategory === 'strategy' }"
            @click="filterByCategory('strategy')"
          >
            <text>策略</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 课程列表 -->
    <scroll-view class="course-list" scroll-y="true" enable-back-to-top="true" :refresher-enabled="true" @refresherpulling="onPulling" @refresherrefresh="onRefresh" @refresherrestore="onRestore" @refresherabort="onAbort">
      <!-- 课程卡片 -->
      <view 
        class="course-card" 
        v-for="(course, index) in filteredCourseList" 
        :key="course.id"
        :style="{ animationDelay: index * 0.05 + 's' }"
      >
        <view class="course-info" @click="editCourse(course)">
          <view class="course-icon">
            <image :src="course.icon" mode="aspectFit"></image>
          </view>
          <view class="course-content">
            <view class="course-title">
              <text>{{ course.title }}</text>
              <view class="course-badge" 
                :class="{
                  'badge-basic': course.category === 'basic',
                  'badge-advanced': course.category === 'advanced',
                  'badge-strategy': course.category === 'strategy',
                  'badge-default': !['basic', 'advanced', 'strategy'].includes(course.category)
                }">
                {{ getCategoryName(course.category) }}
              </view>
            </view>
            <view class="course-desc">
              <text>{{ course.description }}</text>
            </view>
            <view class="course-meta">
              <view class="meta-item">
                <text class="iconfont icon-time"></text>
                <text>{{ getStepsCount(course) }}个步骤</text>
              </view>
            </view>
          </view>
        </view>
        <view class="course-actions">
          <view class="action-btn edit-btn" @click="editCourse(course)">
            <text class="iconfont icon-edit" style="font-weight: bold;">编辑</text>
          </view>
          <view class="action-btn delete-btn" @click="confirmDeleteCourse(course, index)">
            <text class="iconfont icon-delete" style="font-weight: bold;">删除</text>
          </view>
        </view>
      </view>
      
      <!-- 无数据提示 -->
      <view class="empty-tip" v-if="filteredCourseList.length === 0">
        <image src="/static/images/empty.png" mode="aspectFit"></image>
        <text>暂无课程数据</text>
        <view class="add-empty-btn" @click="addNewCourse">创建第一个课程</view>
      </view>
      
      <!-- 底部加载提示 -->
      <view class="loading-more" v-if="filteredCourseList.length > 0">
        <text>-- 没有更多课程了 --</text>
      </view>
    </scroll-view>
    
    <!-- 浮动添加按钮 -->
    <view class="float-add-btn" @click="addNewCourse">
      <text class="iconfont icon-add">+</text>
    </view>
    
    <!-- 确认删除弹窗 -->
    <view class="modal-overlay" v-if="showDeleteModal" @click="cancelDelete"></view>
    <view class="delete-modal" v-if="showDeleteModal">
      <view class="modal-content">
        <view class="modal-icon">
          <text class="iconfont icon-warning"></text>
        </view>
        <view class="modal-title">确认删除</view>
        <view class="modal-message">
          <text>确定要删除"{{ courseToDelete.title }}"吗？此操作无法撤销。</text>
        </view>
        <view class="modal-actions">
          <view class="cancel-btn" @click="cancelDelete">取消</view>
          <view class="confirm-btn" @click="deleteCourse">删除</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import TopSpacing from '@/components/TopSpacing.vue'
import { checkRole } from '@/utils/permission'

export default {
  components: {
    TopSpacing
  },
  data() {
    return {
      statusBarHeight: 0,
      searchKeyword: '',
      currentCategory: 'all',
      showDeleteModal: false,
      courseToDelete: null,
      deleteIndex: -1,
      refreshing: false,
      courseList: [
        {
          id: 'king-moves',
          title: '国王的移动',
          description: '学习国王如何在棋盘上移动，掌握这个基本但重要的棋子走法',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e5.png',
          category: 'basic',
          steps: [
            {
              type: 'intro',
              message: '国王是棋盘上最重要的棋子。如果你的国王被将军且无法脱离，你就输掉了比赛！让我们来学习国王的走法。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-king', position: { row: 4, col: 4 } }
                ]
              }
            },
            {
              type: 'task',
              message: '国王可以沿任何方向移动一格。请将国王从e4移动到f4（向右一格）。',
              expectedMove: {
                from: { row: 4, col: 4 },
                to: { row: 4, col: 5 }
              },
              correctMessage: 'Kf4 是正确的！国王可以向任何方向移动一格。',
              errorMessage: '不正确，国王只能移动一格。请尝试将国王从e4移动到f4（向右）。',
              hintMessage: '点击国王，然后点击右侧的f4格子。'
            }
          ]
        },
        {
          id: 'queen-moves',
          title: '皇后的移动',
          description: '学习皇后如何在棋盘上移动，掌握这个最强棋子的所有走法技巧',
          icon: 'https://pic1.imgdb.cn/item/67f3d477e381c3632bee96e6.png',
          category: 'basic',
          steps: [
            {
              type: 'intro',
              message: '皇后是棋盘上最强大的棋子，可以沿着横向、纵向以及对角线方向移动任意格数。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-queen', position: { row: 4, col: 4 } }
                ]
              }
            }
          ]
        },
        {
          id: 'pin-tactic',
          title: '钉子战术',
          description: '学习如何使用钉子战术限制对手棋子移动，提高战术意识',
          icon: 'https://pic1.imgdb.cn/item/67f3d491e381c3632bee96f9.png',
          category: 'advanced',
          steps: [
            {
              type: 'intro',
              message: '钉子战术是指一个棋子因为移动会导致更重要的棋子遭受攻击而被迫固定在原地的战术。',
              boardSetup: {
                clear: true,
                pieces: [
                  { piece: 'white-bishop', position: { row: 0, col: 2 } },
                  { piece: 'black-knight', position: { row: 3, col: 5 } },
                  { piece: 'black-king', position: { row: 7, col: 7 } }
                ]
              }
            }
          ]
        },
        {
          id: 'opening-strategy',
          title: '开局策略',
          description: '学习国际象棋开局的基本原则和常见战略，为整盘棋奠定基础',
          icon: 'https://pic1.imgdb.cn/item/67f3d490e381c3632bee96f8.png',
          category: 'strategy',
          steps: [
            {
              type: 'intro',
              message: '良好的开局是成功的关键。控制中心、发展棋子、保护国王是开局阶段的核心原则。',
              boardSetup: {
                clear: false
              }
            }
          ]
        }
      ]
    }
  },
  computed: {
    filteredCourseList() {
      let result = this.courseList
      
      // 根据分类筛选
      if (this.currentCategory !== 'all') {
        result = result.filter(course => course.category === this.currentCategory)
      }
      
      // 根据关键词搜索
      if (this.searchKeyword.trim()) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(course => 
          course.title.toLowerCase().includes(keyword) || 
          course.description.toLowerCase().includes(keyword)
        )
      }
      
      return result
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    // 检查管理员权限
    if (!this.checkAdminPermission()) {
      uni.showToast({
        title: '无权访问管理界面',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
    
    // 加载课程数据
    this.loadCourseData()
  },
  methods: {
    // 检查管理员权限
    checkAdminPermission() {
      return checkRole(['admin'])
    },
    
    // 加载课程数据
    loadCourseData() {
      // 这里可以添加从服务器加载课程数据的逻辑
      // 目前使用模拟数据
      console.log('加载课程数据')
    },
    
    // 根据分类筛选课程
    filterByCategory(category) {
      this.currentCategory = category
    },
    
    // 搜索课程
    searchCourses() {
      // 由于使用了计算属性，这里不需要额外的代码
    },
    
    // 获取分类名称
    getCategoryName(category) {
      const categoryMap = {
        'basic': '基础',
        'advanced': '进阶',
        'strategy': '策略'
      }
      return categoryMap[category] || category
    },
    
    // 获取分类样式类
    getCategoryClass(category) {
      return {
        'basic': 'badge-basic',
        'advanced': 'badge-advanced',
        'strategy': 'badge-strategy'
      }[category] || 'badge-default'
    },
    
    // 获取步骤数
    getStepsCount(course) {
      return course.steps ? course.steps.length : 0
    },
    
    // 添加新课程
    addNewCourse() {
      uni.navigateTo({
        url: '/pages/work/admin/course/edit?mode=add'
      })
    },
    
    // 编辑课程
    editCourse(course) {
      uni.navigateTo({
        url: `/pages/work/admin/course/edit?mode=edit&id=${course.id}`
      })
    },
    
    // 确认删除课程
    confirmDeleteCourse(course, index) {
      this.courseToDelete = course
      this.deleteIndex = index
      this.showDeleteModal = true
    },
    
    // 取消删除
    cancelDelete() {
      this.showDeleteModal = false
      this.courseToDelete = null
      this.deleteIndex = -1
    },
    
    // 删除课程
    deleteCourse() {
      if (this.deleteIndex > -1) {
        // 实际场景中应该调用API删除课程
        this.courseList.splice(this.deleteIndex, 1)
        
        uni.showToast({
          title: '课程已删除',
          icon: 'success'
        })
        
        // 关闭确认弹窗
        this.showDeleteModal = false
        this.courseToDelete = null
        this.deleteIndex = -1
      }
    },
    
    // 下拉刷新相关方法
    onPulling(e) {
      console.log('下拉刷新中...')
    },
    
    onRefresh(e) {
      this.refreshing = true
      setTimeout(() => {
        this.loadCourseData()
        this.refreshing = false
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        })
      }, 1000)
    },
    
    onRestore(e) {
      console.log('刷新还原')
    },
    
    onAbort(e) {
      console.log('刷新终止')
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.course-admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1E3A50 0%, #27496D 100%);
  background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
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
      font-weight: bold;
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
    .add-btn {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      
      .iconfont {
        color: #ffffff;
        font-size: 44rpx;
      }
    }
  }
}

/* 搜索和过滤区域 */
.filter-section {
  padding: 0 30rpx;
  margin-bottom: 20rpx;
  
  .search-box {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 10rpx;
    padding: 15rpx 30rpx;
    margin-bottom: 20rpx;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    .iconfont {
      color: rgba(255, 255, 255, 0.7);
      font-size: 30rpx;
      margin-right: 10rpx;
    }
    
    input {
      flex: 1;
      height: 60rpx;
      color: #ffffff;
      font-size: 28rpx;
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

/* 分类标签 */
.category-scroll {
  width: 100%;
  white-space: nowrap;
  
  .category-tabs {
    display: inline-flex;
    padding: 10rpx 0;
    
    .tab-item {
      padding: 10rpx 30rpx;
      margin-right: 15rpx;
      border-radius: 10rpx;
      background-color: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      
      text {
        color: rgba(255, 255, 255, 0.7);
        font-size: 26rpx;
      }
      
      &.active {
        background-color: #8BC34A;
        box-shadow: 0 4rpx 10rpx rgba(139, 195, 74, 0.3);
        
        text {
          color: #ffffff;
          font-weight: bold;
        }
      }
    }
  }
}

/* 课程列表 */
.course-list {
  flex: 1;
  padding: 0 30rpx;
  margin-bottom: 120rpx;
  
  /* 课程卡片 */
  .course-card {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 20rpx;
    padding: 0;
    margin-bottom: 30rpx;
    overflow: hidden;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.3);
    animation: fadeIn 0.5s ease forwards;
    opacity: 0;
    transform: translateY(20rpx);
    
    .course-info {
      display: flex;
      padding: 30rpx;
      position: relative;
    }
    
    .course-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 20rpx;
      background-color: rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20rpx;
      overflow: hidden;
      
      image {
        width: 80rpx;
        height: 80rpx;
      }
    }
    
    .course-content {
      flex: 1;
      
      .course-title {
        display: flex;
        align-items: center;
        margin-bottom: 10rpx;
        
        text {
          color: #EEE;
          font-size: 32rpx;
          font-weight: bold;
          margin-right: 15rpx;
        }
        
        .course-badge {
          font-size: 22rpx;
          padding: 4rpx 15rpx;
          border-radius: 10rpx;
          font-weight: bold;
          color: #ffffff;
          
          &.badge-basic {
            background-color: #8BC34A33;
          }
          
          &.badge-advanced {
            background-color: #FF980033;
          }
          
          &.badge-strategy {
            background-color: #2196F333;
          }
        }
      }
      
      .course-desc {
        margin-bottom: 15rpx;
        
        text {
          color: #DDDDDD;
          font-size: 26rpx;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      .course-meta {
        display: flex;
        
        .meta-item {
          display: flex;
          align-items: center;
          margin-right: 30rpx;
          
          .iconfont {
            color: #999999;
            font-size: 24rpx;
            margin-right: 5rpx;
          }
          
          text {
            color: #999999;
            font-size: 24rpx;
          }
        }
      }
    }
    
    .course-actions {
      display: flex;
      justify-content: space-between;
      padding: 15rpx 0;
      background-color: rgba(0, 0, 0, 0.1);
      border-top: 1px solid #f0f0f044;
      
      .action-btn {
        flex: 1;
        height: 70rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.3s ease;
        
        &:active {
          opacity: 0.7;
        }
        
        .iconfont {
          font-size: 30rpx;
          margin-right: 10rpx;
        }
        
        &.edit-btn {
          color: #8BC34A;
          border-right: 1px solid #f0f0f0;
        }
        
        &.delete-btn {
          color: #616161;
        }
      }
    }
  }
  
  /* 无数据提示 */
  .empty-tip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    
    image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
      opacity: 0.7;
    }
    
    text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 30rpx;
      margin-bottom: 30rpx;
    }
    
    .add-empty-btn {
      padding: 15rpx 40rpx;
      background-color: #8BC34A;
      border-radius: 40rpx;
      color: #ffffff;
      font-size: 28rpx;
    }
  }
  
  /* 底部加载提示 */
  .loading-more {
    text-align: center;
    padding: 30rpx 0;
    
    text {
      color: rgba(255, 255, 255, 0.5);
      font-size: 24rpx;
    }
  }
}

/* 浮动添加按钮 */
.float-add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #8BC34A 0%, #689F38 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 6rpx 20rpx rgba(139, 195, 74, 0.4);
  z-index: 99;
  transition: transform 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
  
  .iconfont {
    color: #ffffff;
    font-size: 48rpx;
  }
}

/* 删除确认弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 999;
}

.delete-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  z-index: 1000;
  
  .modal-content {
    background-color: #ffffff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .modal-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      background-color: rgba(255, 87, 34, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 30rpx;
      
      .iconfont {
        color: #FF5722;
        font-size: 60rpx;
      }
    }
    
    .modal-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333333;
      margin-bottom: 20rpx;
    }
    
    .modal-message {
      text-align: center;
      margin-bottom: 40rpx;
      
      text {
        color: #666666;
        font-size: 28rpx;
      }
    }
    
    .modal-actions {
      display: flex;
      width: 100%;
      
      .cancel-btn, .confirm-btn {
        flex: 1;
        height: 80rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 40rpx;
        font-size: 28rpx;
        margin: 0 10rpx;
      }
      
      .cancel-btn {
        background-color: #f5f5f5;
        color: #666666;
      }
      
      .confirm-btn {
        background-color: #FF5722;
        color: #ffffff;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
