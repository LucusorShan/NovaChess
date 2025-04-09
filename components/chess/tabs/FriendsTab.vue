<!-- components/chess/tabs/FriendsTab.vue -->
<template>
  <view class="friends-tab">
    <!-- 返回和标题区域 -->
    <view class="header">
      <view class="back-button" @click="onBack">
        <uni-icons type="left" size="20" color="#AAAAAA"></uni-icons>
      </view>
      <view class="title">
        <image class="handshake-icon" src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9022.png" mode="aspectFit"></image>
        <text class="title-text">和好友一起玩！</text>
      </view>
    </view>

    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="search-box">
        <uni-icons type="search" size="18" color="#AAAAAA"></uni-icons>
        <input 
          class="search-input" 
          type="text" 
          placeholder="通过名称搜索好友" 
          placeholder-style="color: rgba(255,255,255,0.5);"
          v-model="searchQuery"
          @input="onSearch"
        />
      </view>
    </view>

    <!-- 搜索结果区域 -->
    <view class="search-results">
      <view class="result-header">
        <text class="result-title">查找到的用户</text>
        <text class="result-count">{{ searchResults.length }}</text>
      </view>
      
      <!-- 用户列表 -->
      <view class="user-list">
        <view 
          v-for="(user, index) in searchResults" 
          :key="index" 
          class="user-item"
          @click="inviteFriend(user)"
        >
          <image class="user-avatar" :src="user.avatar" mode="aspectFit"></image>
          <view class="user-info">
            <text class="user-name">{{ user.name }}</text>
            <text class="user-rating">({{ user.rating }})</text>
          </view>
          <image v-if="user.badge" class="user-badge" :src="user.badge" mode="aspectFit"></image>
        </view>
      </view>
    </view>

    <!-- 链接邀请区域 -->
    <view class="invite-link-container" @click="shareInviteLink">
      <view class="invite-link-button">
        <uni-icons type="link" size="20" color="#EEEEEE"></uni-icons>
        <text class="invite-link-text">通过链接邀请好友加入</text>
        <uni-icons type="more-filled" size="20" color="#AAAAAA"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FriendsTab',
  data() {
    return {
      searchQuery: '',
      // 示例数据，实际应用中应该通过API获取
      searchResults: [
        {
          id: 1,
          name: 'ChessPlayer522009',
          rating: 2534,
          avatar: '/static/images/match/avatar-default.png',
          badge: '/static/images/match/badge-red.png'
        },
        {
          id: 2,
          name: 'riishadawda',
          rating: 827,
          avatar: '/static/images/match/avatar-default.png',
          badge: ''
        },
        {
          id: 3,
          name: 'DawDawMLG',
          rating: 679,
          avatar:'/static/images/match/avatar-default.png',
          badge: ''
        }
      ]
    }
  },
  methods: {
    // 返回上一页
    onBack() {
      this.$emit('back');
    },
    
    // 搜索用户
    onSearch() {
      // 实际应用中应通过API搜索用户
      console.log('搜索用户:', this.searchQuery);
      // 这里应该调用后端API进行搜索
    },
    
    // 邀请好友
    inviteFriend(user) {
      console.log('选择好友:', user.name);
      this.$emit('select-friend', user);
    },
    
    // 分享邀请链接
    shareInviteLink() {
      // 生成并分享邀请链接
      console.log('分享邀请链接');
      this.$emit('share-invite-link');
      
      // 在实际应用中，可以调用系统分享功能
      // uni.share({
      //   provider: 'weixin',
      //   scene: 'WXSceneSession',
      //   type: 0,
      //   title: '邀请你下棋',
      //   summary: '和我一起下棋吧！',
      //   imageUrl: '/static/images/match/chess-logo.png',
      //   href: 'https://yourapp.com/invite?code=12345',
      //   success: function (res) {
      //     console.log('分享成功');
      //   },
      //   fail: function (err) {
      //     console.log('分享失败', err);
      //   }
      // });
    }
  }
}
</script>

<style lang="scss" scoped>
.friends-tab {
  padding: 20rpx;
  color: #EEEEEE;
  
  .header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .back-button {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .title {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .handshake-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
      }
      
      .title-text {
        font-size: 36rpx;
        font-weight: bold;
        color: #FFFFFF;
      }
    }
  }
  
  .search-container {
    margin-bottom: 30rpx;
    
    .search-box {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8rpx;
      padding: 20rpx;
      
      .search-input {
        flex: 1;
        height: 60rpx;
        margin-left: 20rpx;
        color: #FFFFFF;
        font-size: 28rpx;
      }
    }
  }
  
  .search-results {
    margin-bottom: 30rpx;
    
    .result-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .result-title {
        font-size: 28rpx;
        color: #AAAAAA;
      }
      
      .result-count {
        margin-left: 20rpx;
        font-size: 28rpx;
        color: #FFFFFF;
      }
    }
    
    .user-list {
      .user-item {
        display: flex;
        align-items: center;
        padding: 20rpx 0;
        border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
        
        .user-avatar {
          width: 80rpx;
          height: 80rpx;
          border-radius: 40rpx;
          margin-right: 20rpx;
        }
        
        .user-info {
          flex: 1;
          
          .user-name {
            font-size: 32rpx;
            color: #FFFFFF;
            margin-bottom: 5rpx;
          }
          
          .user-rating {
            font-size: 24rpx;
            color: #AAAAAA;
          }
        }
        
        .user-badge {
          width: 40rpx;
          height: 40rpx;
        }
      }
    }
  }
  
  .invite-link-container {
    margin-top: 30rpx;
    
    .invite-link-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 8rpx;
      padding: 30rpx 20rpx;
      
      .invite-link-text {
        flex: 1;
        margin-left: 20rpx;
        font-size: 28rpx;
        color: #EEEEEE;
      }
    }
  }
}
</style> 