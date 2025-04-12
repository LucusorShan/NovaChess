<template>
  <view class="play-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <!-- 顶部标题区 -->
    <view class="header">
      <text class="title">此刻开始</text>
      <image class="title-icon" src="https://pic1.imgdb.cn/item/67f3c634e381c3632bee9029.png" mode="aspectFit"></image>
    </view>
    
    <!-- 功能模块区 -->
    <view class="modules">
      <!-- 在线匹配 -->
      <view class="module-item" @click="handleModuleClick('online')">
        <view class="module-icon lightning-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c64fe381c3632bee9039.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">在线匹配</text>
          <text class="module-subtitle">用你的技巧来和玩家对战</text>
        </view>
      </view>
      
      <!-- 人机对战 -->
      <view class="module-item" @click="handleModuleClick('robot')">
        <view class="module-icon robot-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c4fae381c3632bee8f9d.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">人机对战</text>
          <text class="module-subtitle">机器人陪你从菜鸟到大师</text>
        </view>
      </view>
      
      <!-- 邀请好友 -->
      <view class="module-item" @click="handleModuleClick('invite')">
        <view class="module-icon handshake-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9022.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">邀请好友</text>
          <text class="module-subtitle">叫上好基友来一把</text>
        </view>
      </view>
      
      <!-- 天梯赛 -->
      <view class="module-item" @click="handleModuleClick('ladder')">
        <view class="module-icon trophy-icon">
          <image src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9020.png" mode="aspectFit"></image>
        </view>
        <view class="module-content">
          <text class="module-title">天梯赛</text>
          <text class="module-subtitle">胜者为王，败者加油</text>
        </view>
      </view>
      
      <!-- 底部辅助功能 -->
      <view class="bottom-tools">
        <view class="tool-item" @click="handleToolClick('history')">
          <image class="tool-icon" src="https://pic1.imgdb.cn/item/67f3c64fe381c3632bee9038.png" mode="aspectFit"></image>
          <text class="tool-text">游戏历史</text>
        </view>
        <view class="tool-item" @click="handleToolClick('rank')">
          <image class="tool-icon" src="https://pic1.imgdb.cn/item/67f3d224e381c3632bee95ee.png" mode="aspectFit"></image>
          <text class="tool-text">排行榜</text>
        </view>
      </view>
    </view>
    
    <!-- 添加历史对局弹窗 -->
    <uni-popup ref="historyPopup" type="center">
      <view class="popup-container history-popup">
        <view class="popup-header">
          <text class="popup-title">历史对局</text>
          <view class="close-btn" @click="closePopup('history')">
            <image src="https://pic1.imgdb.cn/item/67f3c64fe381c3632bee9038.png" mode="aspectFit"></image>
          </view>
        </view>
        
        <view class="games-list">
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
      </view>
    </uni-popup>
    
    <!-- 添加排行榜弹窗 -->
    <uni-popup ref="rankPopup" type="center">
      <view class="popup-container rank-popup">
        <view class="popup-header">
          <text class="popup-title">排行榜</text>
          <view class="close-btn" @click="closePopup('rank')">
            <image src="https://pic1.imgdb.cn/item/67f3c64fe381c3632bee9038.png" mode="aspectFit"></image>
          </view>
        </view>
        
        <view class="rank-list">
          <view 
            v-for="player in rankingList" 
            :key="player.rank" 
            class="rank-item"
          >
            <text class="rank-number" :class="{'top1': player.rank === 1, 'top2': player.rank === 2, 'top3': player.rank === 3}">{{player.rank}}</text>
            <image class="player-avatar" :src="player.avatar" mode="aspectFill"></image>
            <view class="player-info">
              <text class="player-name">{{player.name}}</text>
              <view class="player-country">
                <image class="country-flag" :src="`/static/images/flags/${player.country}.png`" mode="aspectFit"></image>
                <text class="country-name">{{player.country.toUpperCase()}}</text>
              </view>
            </view>
            <text class="player-rating">{{player.rating}}</text>
          </view>
        </view>
        
        <view class="user-rank-section">
          <view class="rank-item user-rank">
            <text class="rank-number">{{userRanking.rank}}</text>
            <image class="player-avatar" :src="userRanking.avatar" mode="aspectFill"></image>
            <view class="player-info">
              <text class="player-name">{{userRanking.name}}</text>
              <view class="player-country">
                <image class="country-flag" :src="`/static/images/flags/${userRanking.country}.png`" mode="aspectFit"></image>
                <text class="country-name">{{userRanking.country.toUpperCase()}}</text>
              </view>
            </view>
            <text class="player-rating">{{userRanking.rating}}</text>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import TopSpacing from '@/components/TopSpacing.vue'
import UniPopup from '@/components/uni-popup/uni-popup.vue'

export default {
  components: {
    TopSpacing,
    UniPopup
  },
  data() {
    return {
      statusBarHeight: 0,
      // 添加历史对局数据
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
      // 排行榜数据
      rankingList: [
        { rank: 1, name: 'Bigfish1995', rating: 2807, country: 'cn', avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png' },
        { rank: 2, name: 'CogieMekutune', rating: 2799, country: 'jp', avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png' },
        { rank: 3, name: 's4gVoid', rating: 2720, country: 'de', avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png' },
        { rank: 4, name: 'theloyalwolf', rating: 2654, country: 'us', avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png' },
        { rank: 5, name: 'NikoTheodo', rating: 2630, country: 'pl', avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png' }
      ],
      // 用户排名
      userRanking: {
        rank: 328,
        name: '我的用户名',
        rating: 335,
        country: 'cn',
        avatar: 'https://pic1.imgdb.cn/item/67f3c5c7e381c3632bee8ff9.png'
      }
    }
  },
  onLoad() {
    // 获取状态栏高度
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
  },
  methods: {
    // 处理模块点击
    handleModuleClick(type) {
      switch (type) {
        case 'online':
          uni.navigateTo({
            url: '/pages/play/match/index'
          });
          break;
        case 'robot':
          uni.navigateTo({
            url: '/pages/play/robot/index'
          });
          break;
        case 'invite':
          // 跳转到好友对战界面
          uni.navigateTo({
            url: '/pages/play/match/index?mode=friends'
          });
          break;
        case 'ladder':
          // 直接跳转到天梯赛模式
          uni.navigateTo({
            url: '/pages/play/match/index?mode=ladder'
          });
          break;
      }
    },
    // 处理底部工具点击
    handleToolClick(type) {
      switch (type) {
        case 'history':
          // 打开历史弹窗
          this.$refs.historyPopup.open();
          break;
        case 'rank':
          // 打开排行榜弹窗
          this.$refs.rankPopup.open();
          break;
      }
    },
    // 跳转到回放页面
    gotoReplay(gameId) {
      uni.navigateTo({
        url: `/pages/play/replay/index?id=${gameId}`
      });
      // 关闭弹窗
      this.$refs.historyPopup.close();
    },
    // 关闭弹窗
    closePopup(type) {
      if (type === 'history') {
        this.$refs.historyPopup.close();
      } else if (type === 'rank') {
        this.$refs.rankPopup.close();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.play-container {
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
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .title {
    color: #ffffff;
    font-size: 64rpx;
    font-weight: bold;
    text-align: center;
  }
  
  .title-icon {
    width: 120rpx;
    height: 120rpx;
    margin-top: 40rpx;
  }
}

.modules {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .module-item {
    display: flex;
    align-items: center;
    background-color: rgba(0,0,0,0.2);
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
    }
    
    .module-content {
      margin-left: 30rpx;
      display: flex;
      flex-direction: column;
      
      .module-title {
        color: #ffffff;
        font-size: 44rpx;
        font-weight: 600;
        margin-bottom: 15rpx;
      }
      
      .module-subtitle {
        color: #cccccc;
        font-size: 32rpx;
      }
    }
  }
  
  .bottom-tools {
    display: flex;
    justify-content: center;
    margin-top: 40rpx;
    
    .tool-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 0 50rpx;
      
      .tool-icon {
        width: 60rpx;
        height: 60rpx;
        margin-bottom: 10rpx;
      }
      
      .tool-text {
        color: #ffffff;
        font-weight: bold;
        font-size: 32rpx;
      }
    }
  }
}

// 弹窗样式
.popup-container {
  width: 680rpx;
  background-color: rgba(30, 20, 10, 0.9);
  border-radius: 20rpx;
  padding: 30rpx;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .popup-title {
      color: white;
      font-size: 36rpx;
      font-weight: bold;
    }
    
    .close-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      
      image {
        width: 40rpx;
        height: 40rpx;
      }
    }
  }
}

// 历史对局弹窗样式
.history-popup {
  height: 800rpx;
  
  .games-list {
    max-height: 700rpx;
    overflow-y: scroll;
    
    .game-item {
      display: flex;
      align-items: center;
      padding: 15rpx 0;
      border-bottom: 1rpx solid rgba(255,255,255,0.1);
      
      .time-icon {
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
            color: white;
            font-size: 28rpx;
            max-width: 240rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .vs-text {
            color: #e1b964;
            margin: 0 10rpx;
            font-size: 28rpx;
          }
        }
      }
      
      .game-duration {
        .duration-text {
          color: #999;
          font-size: 24rpx;
        }
      }
    }
  }
}

// 排行榜弹窗样式
.rank-popup {
  height: 800rpx;
  
  .rank-list {
    max-height: 600rpx;
    overflow-y: scroll;
    
    .rank-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid rgba(255,255,255,0.1);
      
      &.user-rank {
        background-color: rgba(255,255,255,0.1);
        border-radius: 10rpx;
      }
      
      .rank-number {
        width: 80rpx;
        text-align: center;
        color: white;
        font-size: 32rpx;
        font-weight: bold;
        
        &.top1 { color: gold; }
        &.top2 { color: silver; }
        &.top3 { color: #cd7f32; }
      }
      
      .player-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 40rpx;
        margin: 0 20rpx;
      }
      
      .player-info {
        flex: 1;
        
        .player-name {
          color: white;
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
        }
        
        .player-country {
          display: flex;
          align-items: center;
          
          .country-flag {
            width: 30rpx;
            height: 20rpx;
            margin-right: 10rpx;
          }
          
          .country-name {
            color: #999;
            font-size: 24rpx;
          }
        }
      }
      
      .player-rating {
        color: #e1b964;
        font-size: 36rpx;
        font-weight: bold;
      }
    }
  }
  
  .user-rank-section {
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid rgba(255,255,255,0.2);
  }
}
</style> 