<!-- components/chess/tabs/PlayersTab.vue -->
<template>
  <view class="tab-content">
    <!-- 子选项卡 -->
    <view class="sub-tabs">
      <view class="sub-tab" 
        :class="{ 'active': activeSubTab === 'friends' }" 
        @click="switchSubTab('friends')">
        <text class="sub-tab-text">我的好友</text>
      </view>
      <view class="sub-tab" 
        :class="{ 'active': activeSubTab === 'allPlayers' }" 
        @click="switchSubTab('allPlayers')">
        <text class="sub-tab-text">所有玩家</text>
      </view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-bar">
      <image class="search-icon" src="/static/images/match/search.png" mode="aspectFit"></image>
      <input class="search-input" placeholder="通过名称搜索用户" placeholder-style="color: rgba(255,255,255,0.5);" />
    </view>
    
    <!-- 好友列表 -->
    <view v-if="activeSubTab === 'friends'" class="players-list">
      <view v-for="(player, index) in friendsList" :key="index" class="player-item" @click="showPlayerDetail(player)">
        <image class="player-avatar" :src="player.avatar" mode="aspectFill"></image>
        <view class="player-info">
          <view class="player-name-container">
            <image v-if="player.isVip" class="vip-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9010.png" mode="aspectFit"></image>
            <text class="player-name">{{player.name}} ({{player.rating}})</text>
          </view>
          <image class="country-flag" :src="player.flag" mode="aspectFit"></image>
        </view>
        <view class="player-status" :class="{ 'status-playing': player.status === '对战中' }">
          <text class="status-text">{{player.status}}</text>
        </view>
      </view>
    </view>
    
    <!-- 所有玩家列表 -->
    <view v-if="activeSubTab === 'allPlayers'" class="players-list">
      <view v-for="(player, index) in allPlayersList" :key="index" class="player-item" @click="showPlayerDetail(player)">
        <image class="player-avatar" :src="player.avatar" mode="aspectFill"></image>
        <view class="player-info">
          <view class="player-name-container">
            <image v-if="player.isVip" class="vip-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee900d.png" mode="aspectFit"></image>
            <text class="player-name">{{player.name}} ({{player.rating}})</text>
          </view>
          <image class="country-flag" :src="player.flag" mode="aspectFit"></image>
        </view>
        <view class="player-status" :class="{ 'status-playing': player.status === '对战中' }">
          <text class="status-text">{{player.status}}</text>
        </view>
      </view>
    </view>
    
    <!-- 用户详情弹窗 -->
    <uni-popup ref="playerDetailPopup" type="center" class="custom-popup">
      <view class="player-detail-popup" v-if="selectedPlayer">
        <view class="player-header">
          <image class="player-large-avatar" :src="selectedPlayer.avatar" mode="aspectFill"></image>
          <view class="player-title">
            <text class="player-title-text">
              <text v-if="selectedPlayer.title" class="player-title-prefix">{{selectedPlayer.title}} </text>
              {{selectedPlayer.name}}
            </text>
            <text class="player-signature">{{selectedPlayer.signature || '这个地方是个性签名...'}}</text>
          </view>
        </view>
        
        <view class="player-info-row">
          <view class="info-item">
            <text class="info-label">在线状态</text>
            <text class="info-value">{{selectedPlayer.onlineStatus || 'Online Now'}}</text>
          </view>
          <view class="info-item">
            <text class="info-label">注册时间</text>
            <text class="info-value">{{selectedPlayer.registerDate || 'Nov 12, 2023'}}</text>
          </view>
        </view>
        
        <view class="player-actions">
          <view v-if="!isPlayerFriend && selectedPlayer" class="more-options-btn" @click="showMoreOptions">
            <text class="more-options-text">...</text>
          </view>
          <view class="message-btn" @click="sendMessage">
            <text class="action-text">发消息</text>
          </view>
          <view v-if="isPlayerFriend" class="invite-btn" @click="inviteGame">
            <text class="action-text">+邀请对战</text>
          </view>
          <view v-else class="add-friend-btn" @click="addFriend">
            <text class="action-text">加好友</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  props: {
    playersList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeSubTab: 'friends', // 默认显示我的好友
      selectedPlayer: null,    // 当前选中的玩家
      isPlayerFriend: false,   // 选中的玩家是否是好友
      friendsList: [
        { 
          id: 1, 
          name: 'Bigfish1995', 
          rating: '2807', 
          avatar: '/static/images/match/avatar-default.png',
          flag: 'https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9012.png',
          status: '对战中',
          isVip: true,
          title: 'GM',
          signature: '这个地方是个性签名...',
          onlineStatus: 'Online Now',
          registerDate: 'Nov 12, 2023'
        },
        { 
          id: 2, 
          name: 'CogieMekutune', 
          rating: '2799', 
          avatar: '/static/images/match/avatar-default.png',
          flag: '/static/images/match/flag-jp.png',
          status: '在线',
          isVip: true,
          title: 'GM',
          signature: '这个地方是个性签名...',
          onlineStatus: 'Online Now',
          registerDate: 'Nov 12, 2023'
        },
        { 
          id: 3, 
          name: 's4pOud', 
          rating: '2720', 
          avatar: '/static/images/match/avatar-default.png',
          flag: '/static/images/match/flag-de.png',
          status: '在线',
          isVip: false,
          signature: '这个地方是个性签名...',
          onlineStatus: 'Online Now',
          registerDate: 'Nov 12, 2023'
        }
      ],
      allPlayersList: [
        { 
          id: 4, 
          name: 'GigaQuparadze', 
          rating: '2798', 
          avatar: '/static/images/match/avatar-default.png',
          flag: '/static/images/match/flag-gb.png',
          status: '在线',
          isVip: true,
          title: 'GM',
          signature: '这个地方是个性签名...',
          onlineStatus: 'Online Now',
          registerDate: 'Nov 12, 2023'
        },
        { 
          id: 5, 
          name: 'PerplexingPerfection', 
          rating: '2794', 
          avatar: '/static/images/match/avatar-default.png',
          flag: '/static/images/match/flag-us.png',
          status: '在线',
          isVip: true,
          title: 'GM',
          signature: '这个地方是个性签名...',
          onlineStatus: 'Online Now',
          registerDate: 'Nov 12, 2023'
        },
        { 
          id: 6, 
          name: 'alexrustemov', 
          rating: '2730', 
          avatar: '/static/images/match/avatar-default.png',
          flag: '/static/images/match/flag-ru.png',
          status: '在线',
          isVip: false,
          signature: '这个地方是个性签名...',
          onlineStatus: 'Online Now',
          registerDate: 'Nov 12, 2023'
        }
      ]
    }
  },
  methods: {
    // 切换子标签页
    switchSubTab(tab) {
      this.activeSubTab = tab;
    },
    
    // 显示玩家详情
    showPlayerDetail(player) {
      this.selectedPlayer = player;
      // 检查是否是好友
      this.isPlayerFriend = this.friendsList.some(friend => friend.id === player.id);
      this.$refs.playerDetailPopup.open();
    },
    
    // 发送消息
    sendMessage() {
      uni.showToast({
        title: '消息功能尚未开发',
        icon: 'none'
      });
      this.$refs.playerDetailPopup.close();
    },
    
    // 邀请对战
    inviteGame() {
      uni.showToast({
        title: '已发送对战邀请',
        icon: 'none'
      });
      this.$refs.playerDetailPopup.close();
    },
    
    // 添加好友
    addFriend() {
      uni.showToast({
        title: '已发送好友请求',
        icon: 'none'
      });
      this.$refs.playerDetailPopup.close();
    },
    
    // 显示更多选项
    showMoreOptions() {
      uni.showToast({
        title: '更多选项功能尚未开发',
        icon: 'none'
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../../styles/chess/chess-common.scss";

// 子选项卡
.sub-tabs {
  display: flex;
  justify-content: space-around;
  border-bottom: 1px solid rgba(255, 255, 255, 0.9);
  margin-bottom: 30rpx;
  
  .sub-tab {
    padding: 20rpx 30rpx 40rpx 30rpx;
    flex: 1;
    text-align: center;
    position: relative;
    
    .sub-tab-text {
      color: rgba(255, 255, 255, 0.5);
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 20rpx;
    }
    
    &.active {
      .sub-tab-text {
        color: #fff;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60%;
        height: 4rpx;
        background-color: #fff;
      }
    }
  }
}

// 搜索栏
.search-bar {
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 10rpx;
  padding: 15rpx 20rpx;
  margin: 0 auto 30rpx;
  width: 100%;
  
  .search-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 10rpx;
  }
  
  .search-input {
    flex: 1;
    color: #fff;
    font-size: 28rpx;
  }
}

// 玩家列表
.players-list {
  width: 100%;
  margin: 0 auto;
  
  .player-item {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    
    .player-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
    }
    
    .player-info {
      flex: 1;
      margin-left: 20rpx;
      display: flex;
      align-items: center;
      
      .player-name-container {
        display: flex;
        align-items: center;
        margin-right: 10rpx;
        
        .vip-icon {
          width: 30rpx;
          height: 30rpx;
          margin-right: 10rpx;
        }
        
        .player-name {
          color: #fff;
          font-size: 28rpx;
          font-weight: bold;
        }
      }
      
      .country-flag {
        width: 30rpx;
        height: 20rpx;
      }
    }
    
    .player-status {
      margin-left: auto;
      
      .status-text {
        color: #fff;
        font-size: 24rpx;
      }
      
      &.status-playing .status-text {
        color: #ff6b6b;
      }
    }
  }
}

// 玩家详情弹窗
.player-detail-popup {
  width: 580rpx;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 0rpx;
  padding: 30rpx;
  
  .player-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .player-large-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
    }
    
    .player-title {
      margin-left: 20rpx;
      
      .player-title-text {
        color: #fff;
        font-size: 32rpx;
        font-weight: bold;
        
        .player-title-prefix {
          color: #ff6b6b;
        }
      }
      
      .player-signature {
        color: #ccc;
        font-size: 24rpx;
        display: block;
        margin-top: 10rpx;
      }
    }
  }
  
  .player-info-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30rpx;
    
    .info-item {
      display: flex;
      flex-direction: column;
      
      .info-label {
        color: #ccc;
        font-size: 24rpx;
        margin-bottom: 10rpx;
      }
      
      .info-value {
        color: #fff;
        font-size: 24rpx;
      }
    }
  }
  
  .player-actions {
    display: flex;
    justify-content: space-between;
    
    .more-options-btn, .message-btn, .invite-btn, .add-friend-btn {
      padding: 20rpx 0;
      text-align: center;
      border-radius: 10rpx;
    }
    
    .more-options-btn {
      width: 80rpx;
      background-color: #333;
      
      .more-options-text {
        color: #fff;
        font-size: 32rpx;
      }
    }
    
    .message-btn {
      flex: 1;
      background-color: #333;
      margin: 0 20rpx;
      
      .action-text {
        color: #fff;
        font-size: 28rpx;
      }
    }
    
    .invite-btn, .add-friend-btn {
      flex: 2;
      background-color: #81B64C;
      
      .action-text {
        color: #fff;
        font-size: 28rpx;
      }
    }
  }
}

/* 重写uni-popup的样式 */

</style>