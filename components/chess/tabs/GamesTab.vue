<!-- components/chess/tabs/GamesTab.vue -->
<template>
  <view class="tab-content">
    <!-- 子选项卡 -->
    <view class="sub-tabs">
      <view class="sub-tab" 
        :class="{ 'active': activeSubTab === 'history' }" 
        @click="switchSubTab('history')">
        <text class="sub-tab-text">对局历史</text>
      </view>
      <view class="sub-tab" 
        :class="{ 'active': activeSubTab === 'watch' }" 
        @click="switchSubTab('watch')">
        <text class="sub-tab-text">观看比赛</text>
      </view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-bar">
      <image class="search-icon" src="/static/images/match/search.png" mode="aspectFit"></image>
      <input class="search-input" placeholder="通过名称搜索对局" placeholder-style="color: rgba(255,255,255,0.5);" />
    </view>
    
    <!-- 对局历史列表 -->
    <view v-if="activeSubTab === 'history'" class="games-list">
      <view 
        v-for="(game, index) in historyGames" 
        :key="index" 
        class="game-item"
        @click="gotoReplay(game.id)"
      >
        <view class="time-icon">
          <image class="clock-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9011.png" mode="aspectFit"></image>
        </view>
        <view class="game-info">
          <view class="players-info">
            <text class="player-name">{{game.player1}} ({{game.rating1}})</text>
            <text class="vs-text">{{game.score}}</text>
            <text class="player-name">{{game.player2}} ({{game.rating2}})</text>
          </view>
        </view>
        <view class="game-duration">
          <text class="duration-text">{{game.duration}}</text>
        </view>
      </view>
    </view>
    
    <!-- 观看比赛列表 -->
    <view v-if="activeSubTab === 'watch'" class="games-list">
      <view 
        v-for="(game, index) in liveGames" 
        :key="index" 
        class="game-item"
        @click="watchLive(game.id)"
      >
        <view class="time-icon">
          <image class="clock-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9011.png" mode="aspectFit"></image>
        </view>
        <view class="game-info">
          <view class="player-row">
            <text class="player-name">{{game.player1}} ({{game.rating1}})</text>
            <image class="flag" :src="game.flag1" mode="aspectFit"></image>
          </view>
          <view class="player-row">
            <text class="player-name">{{game.player2}} ({{game.rating2}})</text>
            <image class="flag" :src="game.flag2" mode="aspectFit"></image>
          </view>
        </view>
        <view class="game-duration">
          <text class="duration-text">{{game.duration}}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    gamesList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      activeSubTab: 'history', // 默认显示对局历史
      historyGames: [
        { 
          id: '1001', 
          player1: 'lucasshanchuxiong', 
          rating1: '221', 
          player2: 'dawas39', 
          rating2: '410', 
          score: '0-1', 
          duration: '10 min' 
        },
        { 
          id: '1002', 
          player1: 'Wang_JB', 
          rating1: '1530', 
          player2: 'GrandMaster2023', 
          rating2: '1498', 
          score: '1-0', 
          duration: '15 min' 
        },
        { 
          id: '1003', 
          player1: 'ChessMaster88', 
          rating1: '1842', 
          player2: 'theloyalwolf', 
          rating2: '1820', 
          score: '½-½', 
          duration: '5 min' 
        }
      ],
      liveGames: [
        { 
          id: '2001', 
          player1: 'rekonwa', 
          rating1: '2390', 
          player2: 'EdwardWarren1926', 
          rating2: '2388', 
          flag1: '/static/images/match/flag-pl.png', 
          flag2: '/static/images/match/flag-us.png', 
          duration: '10 min' 
        },
        { 
          id: '2002', 
          player1: 'Orosz_Milos_Mark', 
          rating1: '2383', 
          player2: 'vibhoor', 
          rating2: '2370', 
          flag1: '/static/images/match/flag-hu.png', 
          flag2: '/static/images/match/flag-in.png', 
          duration: '10 min' 
        },
        { 
          id: '2003', 
          player1: 'NikoTheodo', 
          rating1: '2390', 
          player2: 'theloyalwolf', 
          rating2: '2388', 
          flag1: '/static/images/match/flag-pl.png', 
          flag2: '/static/images/match/flag-us.png', 
          duration: '10 min' 
        }
      ]
    }
  },
  methods: {
    // 切换子标签页
    switchSubTab(tab) {
      this.activeSubTab = tab;
    },
    
    // 跳转到回放界面
    gotoReplay(id) {
      uni.navigateTo({
        url: `/pages/play/replay/index?id=${id}`
      });
    },
    
    // 跳转到观看直播界面
    watchLive(id) {
      uni.navigateTo({
        url: `/pages/play/replay/index?id=${id}&live=true`
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
  width:100%;
  margin: 0 auto;
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
      margin-bottom: 20rpx
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
  background-color: rgba(255, 255, 255, 0.1);
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

// 对局列表
.games-list {
  width: 100%;
  margin: 0 auto;
  
  .game-item {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    
    .time-icon {
      width: 40rpx;
      height: 40rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 20rpx;
      
      .clock-icon {
        width: 40rpx;
        height: 40rpx;
      }
    }
    
    .game-info {
      flex: 1;
      
      .players-info {
        display: flex;
        align-items: center;
        
        .player-name {
          color: #fff;
          font-size: 22rpx;
          font-weight: bold;
        }
        
        .vs-text {
          margin: 0 10rpx;
          color: #ff6b6b;
          font-size: 16rpx;
          font-weight: bold;
        }
      }
      
      .player-row {
        display: flex;
        align-items: center;
        margin-bottom: 6rpx;
        
        .player-name {
          color: #fff;
          font-size:22rpx;
          font-weight: bold;
          margin-right: 10rpx;
        }
        
        .flag {
          width: 32rpx;
          height: 24rpx;
        }
      }
    }
    
    .game-duration {
      margin-left: 20rpx;
      
      .duration-text {
        color: #fff;
        font-size: 24rpx;
      }
    }
  }
}
</style>