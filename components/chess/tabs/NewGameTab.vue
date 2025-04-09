<!-- components/chess/tabs/NewGameTab.vue (继续) -->
<template>
  <view class="tab-content">
    <!-- 判断是否显示好友tab -->
    <view v-if="showFriendsTab">
      <friends-tab 
        @back="showFriendsTab = false"
        @select-friend="onSelectFriend"
        @share-invite-link="onShareInviteLink"
      />
    </view>
    
    <!-- 判断是否显示好友游戏设置界面 -->
    <view v-else-if="showFriendGameSettings">
      <view class="friend-game-settings">
        <!-- 返回按钮和标题 -->
        <view class="friend-header">
          <view class="back-button" @click="showFriendGameSettings = false; showFriendsTab = true;">
            <uni-icons type="left" size="20" color="#AAAAAA"></uni-icons>
          </view>
          <view class="title">
            <text class="title-text">和Ta玩</text>
          </view>
        </view>
        
        <!-- 选择的好友信息 -->
        <view class="selected-friend">
          <image class="friend-avatar" :src="selectedFriend.avatar" mode="aspectFit"></image>
          <view class="friend-info">
            <text class="friend-name">{{ selectedFriend.name }}</text>
            <text class="friend-rating">({{ selectedFriend.rating }})</text>
          </view>
        </view>
        
        <!-- 时间选择模块 -->
        <view class="time-selector" @click="showTimeSelector">
          <image class="clock-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9011.png" mode="aspectFit"></image>
          <text class="time-text">{{ timeControl }}</text>
          <text class="dropdown-icon">＜</text>
        </view>
        
        <!-- 游戏模式选择 -->
        <view class="game-mode-section" @click="showModeSelector">
          <view class="mode-card">
            <image class="mode-icon" :src="'/static/images/match/pieces/' + (gameMode === 'standard' ? 'black-pawn' : 'black-knight') + '.png'" mode="aspectFit"></image>
            <text class="mode-text">{{ gameMode === 'standard' ? '标准模式' : '快速模式' }}</text>
            <text class="mode-arrow">＜</text>
          </view>
        </view>
        
        <!-- I play as 选择 -->
        <view class="play-as-section">
          <text class="section-title">I play as</text>
          <view class="colors-wrapper">
            <view class="color-option" :class="{ selected: playAs === 'white' }" @click="onSelectPlayAs('white')">
              <view class="white-piece"></view>
            </view>
            <view class="color-option" :class="{ selected: playAs === 'random' }" @click="onSelectPlayAs('random')">
              <view class="random-piece">
                <text class="random-text">?</text>
              </view>
            </view>
            <view class="color-option" :class="{ selected: playAs === 'black' }" @click="onSelectPlayAs('black')">
              <view class="black-piece"></view>
            </view>
          </view>
        </view>
        
        <!-- 开玩按钮 -->
        <view class="play-button" @click="onInviteFriend">
          <text class="button-text">开玩!</text>
        </view>
      </view>
    </view>
    
    <!-- 判断是否正在匹配中 -->
    <view v-else-if="matching">
      <!-- 匹配中状态卡片 -->
      <view class="matching-card-inline">
        <!-- 如果是好友对战模式，显示好友头像 -->
        <image v-if="selectedFriend.id > 0" class="friend-avatar" :src="selectedFriend.avatar" mode="aspectFit"></image>
        <image v-else class="piece-icon" src="/static/images/match/pieces/white-pawn.png" mode="aspectFit"></image>
        
        <view class="matching-time">{{ timeControl }}</view>
        <view class="matching-status">等待加入...</view>
        <view class="cancel-button" @click="onCancelMatching">取消</view>
      </view>

      <!-- 如果是好友对战，显示邀请链接 -->
      <view v-if="selectedFriend.id > 0" class="invite-link-container" @click="onShareInviteLink">
        <view class="invite-link-button">
          <uni-icons type="link" size="20" color="#EEEEEE"></uni-icons>
          <text class="invite-link-text">发出邀请链接</text>
          <uni-icons type="redo-filled" size="20" color="#AAAAAA"></uni-icons>
        </view>
      </view>
      
      <!-- 如果是天梯赛，显示段位积分信息 -->
      <view v-if="isLeaderboardMode" class="leaderboard-stats">
        <view class="stat-item">
          <image class="trophy-icon" src="https://pic1.imgdb.cn/item/67f352a90ba3d5a1d7ef1418.png" mode="aspectFit"></image>
          <text class="stat-label">场次</text>
          <text class="stat-value">129</text>
        </view>
        <view class="stat-item">
          <image class="points-icon" src="/static/images/match/points.png" mode="aspectFit"></image>
          <text class="stat-label">积分</text>
          <text class="stat-value">335</text>
        </view>
        <view class="stat-item">
          <image class="winrate-icon" src="/static/images/match/winrate.png" mode="aspectFit"></image>
          <text class="stat-label">胜率</text>
          <text class="stat-value">50.5%</text>
        </view>
      </view>
    </view>

    <!-- 未匹配状态时显示游戏设置选项 -->
    <view v-else>
      <!-- 判断是否展开更多选项 -->
      <view v-if="showMoreOptions">
        <!-- 游戏模式选择 -->
        <view class="game-mode-section" @click="showModeSelector">
          <view class="mode-card">
            <image class="mode-icon" :src="'/static/images/match/pieces/' + (gameMode === 'standard' ? 'black-pawn' : 'black-knight') + '.png'" mode="aspectFit"></image>
            <text class="mode-text">{{ gameMode === 'standard' ? '标准模式' : '快速模式' }}</text>
            <text class="mode-arrow">＜</text>
          </view>
        </view>
        
        <!-- 指定对手 -->
        <view class="option-section">
          <input class="opponent-input" placeholder="输入用户名称" placeholder-style="color: rgba(255,255,255,0.5);" />
        </view>
      </view>
      
      <!-- 时间选择模块 -->
      <view class="time-selector" @click="showTimeSelector">
        <image class="clock-icon" src="https://pic1.imgdb.cn/item/67f3c5ffe381c3632bee9011.png" mode="aspectFit"></image>
        <text class="time-text">{{ timeControl }}</text>
        <text class="dropdown-icon">＜</text>
      </view>
      
      <!-- I play as 选择 -->
      <view v-if="showMoreOptions" class="play-as-section">
        <text class="section-title">I play as</text>
        <view class="colors-wrapper">
          <view class="color-option" :class="{ selected: playAs === 'white' }" @click="onSelectPlayAs('white')">
            <view class="white-piece"></view>
          </view>
          <view class="color-option" :class="{ selected: playAs === 'random' }" @click="onSelectPlayAs('random')">
            <view class="random-piece">
              <text class="random-text">?</text>
            </view>
          </view>
          <view class="color-option" :class="{ selected: playAs === 'black' }" @click="onSelectPlayAs('black')">
            <view class="black-piece"></view>
          </view>
        </view>
      </view>

      <!-- 开玩按钮 -->
      <view class="play-button" @click="onStartGame">
        <text class="button-text">开玩!</text>
      </view>
      
      <!-- 展开更多 -->
      <view class="expand-more" @click="onToggleMoreOptions">
        <text class="expand-text">{{ showMoreOptions ? '收起选项' : '展开更多' }}</text>
        <text class="expand-icon" :style="{ transform: showMoreOptions ? 'rotate(90deg)' : 'rotate(0)' }"> ▽ </text>
      </view>
      
      <!-- 社交按钮: 和好友一起玩/天梯赛 -->
      <view class="social-buttons">
        <!-- 和好友一起玩 -->
        <view class="social-button" @click="onPlayWithFriend">
          <image class="button-icon" src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9022.png" mode="aspectFit"></image>
          <text class="button-text">和好友一起玩</text>
        </view>
        
        <!-- 天梯赛 -->
        <view class="social-button" @click="onPlayLadder">
          <image class="button-icon" src="https://pic1.imgdb.cn/item/67f3c61ee381c3632bee9020.png" mode="aspectFit"></image>
          <text class="button-text">天梯赛</text>
        </view>
      </view>
    </view>
    
    <!-- 时间选择弹出层 -->
    <uni-popup ref="timePopup" type="center">
      <view class="popup-content">
        <view class="popup-title">选择时间控制</view>
        <view class="popup-options">
          <view class="popup-option" :class="{ 'selected': timeControl === '10 min' }" @click="onSelectTime('10 min')">
            <text class="option-text">10 min</text>
          </view>
          <view class="popup-option" :class="{ 'selected': timeControl === '15 min' }" @click="onSelectTime('15 min')">
            <text class="option-text">15 min</text>
          </view>
          <view class="popup-option" :class="{ 'selected': timeControl === '30 min' }" @click="onSelectTime('30 min')">
            <text class="option-text">30 min</text>
          </view>
        </view>
        <view class="popup-close" @click="closeTimePopup">确定</view>
      </view>
    </uni-popup>
    
    <!-- 模式选择弹出层 -->
    <uni-popup ref="modePopup" type="center">
      <view class="popup-content">
        <view class="popup-title">选择游戏模式</view>
        <view class="popup-options">
          <view class="popup-option" :class="{ 'selected': gameMode === 'standard' }" @click="onSelectMode('standard')">
            <image class="option-icon" src="/static/images/match/pieces/black-pawn.png" mode="aspectFit"></image>
            <text class="option-text">标准模式</text>
          </view>
          <view class="popup-option" :class="{ 'selected': gameMode === 'quick' }" @click="onSelectMode('quick')">
            <image class="option-icon" src="/static/images/match/pieces/black-knight.png" mode="aspectFit"></image>
            <text class="option-text">快速模式</text>
          </view>
        </view>
        <view class="popup-close" @click="closeModePopup">确定</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import uniPopup from '@/components/uni-popup/uni-popup.vue';
import FriendsTab from './FriendsTab.vue';

export default {
  components: {
    uniPopup,
    FriendsTab
  },
  props: {
    timeControl: {
      type: String,
      default: '10 min'
    },
    gameMode: {
      type: String,
      default: 'standard'
    },
    playAs: {
      type: String,
      default: 'random'
    },
    showMoreOptions: {
      type: Boolean,
      default: false
    },
    matching: {
      type: Boolean,
      default: false
    },
    isLeaderboardMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showFriendsTab: false,
      showFriendGameSettings: false,
      selectedFriend: {
        id: 0,
        name: '',
        rating: 0,
        avatar: '',
        badge: ''
      }
    }
  },
  methods: {
    onToggleMoreOptions() {
      this.$emit('toggle-more-options');
    },
    
    onStartGame() {
      this.$emit('start-game');
    },
    
    onCancelMatching() {
      this.$emit('cancel-matching');
    },
    
    showModeSelector() {
      this.$refs.modePopup.open();
    },
    
    closeModePopup() {
      this.$refs.modePopup.close();
    },
    
    onSelectMode(mode) {
      this.$emit('select-game-mode', mode);
      this.closeModePopup();
    },
    
    showTimeSelector() {
      this.$refs.timePopup.open('center');
    },
    
    closeTimePopup() {
      this.$refs.timePopup.close();
    },
    
    onSelectTime(time) {
      this.$emit('select-time', time);
      this.closeTimePopup();
    },
    
    onSelectPlayAs(color) {
      this.$emit('select-play-as', color);
    },
    
    // 处理选择好友
    onSelectFriend(user) {
      console.log('选择用户', user);
      this.selectedFriend = user;
      this.showFriendsTab = false;
      this.showFriendGameSettings = true;
    },
    
    // 处理邀请好友
    onInviteFriend() {
      console.log('邀请用户', this.selectedFriend);
      // 发送邀请，显示匹配中状态
      this.showFriendGameSettings = false;
      this.$emit('invite-friend', this.selectedFriend);
    },
    
    // 处理链接邀请
    onShareInviteLink() {
      console.log('分享邀请链接');
      this.$emit('share-invite-link', this.selectedFriend);
    },
    
    onPlayWithFriend() {
      this.showFriendsTab = true;
      this.$emit('play-with-friend');
    },
    
    onPlayLadder() {
      this.$emit('play-ladder');
    }
  }
}
</script>

<style lang="scss" scoped>
/* 直接引入公共样式 */
@import "../../../styles/chess/chess-common.scss";

// 好友游戏设置界面
.friend-game-settings {
  padding: 20rpx;
  
  .friend-header {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    .back-button {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .title {
      flex: 1;
      text-align: center;
      
      .title-text {
        font-size: 36rpx;
        color: #FFFFFF;
        font-weight: bold;
      }
    }
  }
  
  .selected-friend {
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10rpx;
    padding: 20rpx;
    margin: 30rpx auto;
    width: 95%;
    
    .friend-avatar {
      width: 150rpx;
      height: 150rpx;
      border-radius: 50rpx;
      margin: 40rpx;
    }
    
    .friend-info {
      flex: 1;
      
      .friend-name {
        font-size: 36rpx;
        color: #FFFFFF;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      
      .friend-rating {
        font-size: 28rpx;
        color: #AAAAAA;
      }
    }
  }
}

// 匹配中状态卡片（内嵌版本）
.matching-card-inline {
  width: 95%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20rpx auto 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
  
  .piece-icon {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
  }
  
  .friend-avatar {
    width: 120rpx;
    height: 120rpx;
    margin-bottom: 30rpx;
    border-radius: 60rpx;
  }
  
  .matching-time {
    font-size: 40rpx;
    font-weight: bold;
    color: #EEEEEE;
    margin-bottom: 20rpx;
  }
  
  .matching-status {
    font-size: 32rpx;
    color: #555;
    font-weight: bold;
    margin-bottom: 40rpx;
  }
  
  .cancel-button {
    width: 80%;
    padding: 20rpx 0;
    background-color: #fff;
    color: #333;
    border-radius: 10rpx;
    font-size: 32rpx;
    text-align: center;
  }
}

// 游戏模式选择部分
.game-mode-section {
  margin: 20rpx 0;
  align-items: center;
  justify-content: center;
  display: flex;
}

.mode-card {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  width: 95%;
  padding: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  
  .mode-icon {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
  
  .mode-text {
    flex: 1;
    font-size: 32rpx;
    color: #EEEEEE;
    font-weight: bold;
  }
  
  .mode-arrow {
    font-size: 32rpx;
    color: #999;
    transform: rotate(-90deg);
  }
}

// 指定对手
.option-section {
  margin: 20rpx auto;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  padding: 20rpx;
  width: 95%;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(255, 255, 255, 0.1);
  
  .opponent-input {
    width: 100%;
    color: #EEEEEE !important;
    background-color: transparent;
    padding: 10rpx;
    font-weight: bold;
    font-size: 32rpx;
    
    &::placeholder {
      color: rgba(255,255,255,0.5);
    }
  }
}

// 时间选择模块
.time-selector {
  display: flex;
  width: 95%; 
 
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  padding: 25rpx;
  margin: 20rpx auto;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  
  .clock-icon {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
  
  .time-text {
    flex: 1;
    color: #EEEEEE;
    font-weight: bold;
    font-size: 32rpx;
  }
  
  .dropdown-icon {
    color: #999;
    font-size: 32rpx;
    transform: rotate(-90deg);
  }
}

// 选择颜色
.play-as-section {
  margin: 20rpx auto;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  align-items: center;
  justify-content: center;
  display: flex;
  width: 95%;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  
  .section-title {
    color: #EEE;
    font-size: 32rpx;
    font-weight: bold;
    margin: 10rpx 0;
    text-align: center;
  }
  
  .colors-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    
    .color-option {
      width: 90rpx;
      height: 90rpx;
      margin: 0 20rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10rpx;
      border: 4rpx solid transparent;
      
      &.selected {
        border-color: #81B64C;
      }
      
      .white-piece, .black-piece, .random-piece {
        width: 90%;
        height: 90%;
        border-radius: 50%;
      }
      
      .white-piece {
        background-color: white;
        border: 2rpx solid #ccc;
      }
      
      .black-piece {
        background-color: black;
      }
      
      .random-piece {
        background: linear-gradient(to right, white 0%, white 50%, black 50%, black 100%);
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        
        .random-text {
          position: absolute;
          font-size: 40rpx;
          font-weight: bold;
          color: #444;
        }
      }
    }
  }
}

// 开玩按钮
.play-button {
  background-color: #81B64C;
  border-radius: 10rpx;
  width: 95%;
  padding: 30rpx 0;
  margin: 30rpx 0;
  text-align: center;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
  
  .button-text {
    color: white;
    font-size: 40rpx;
    font-weight: bold;
  }
}

// 展开更多
.expand-more {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30rpx 0 50rpx 0;
  
  .expand-text {
    color: #eeeeee6d;
    font-size: 28rpx;
    font-weight: bold;
    margin-right: 10rpx;
  }
  
  .expand-icon {
    color: white;
    font-size: 28rpx;
    transition: transform 0.3s;
  }
}

// 社交按钮样式（好友游戏和天梯赛）
.social-button {
  display: flex;
  align-items: center;
  width: 95%;
  padding: 30rpx;
  margin: 20rpx auto;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  
  .button-icon {
    width: 60rpx;
    height: 60rpx;
    margin-right: 20rpx;
  }
  
  .button-text {
    flex: 1;
    font-weight: bold;
    font-size: 34rpx;
    color: #fff;
    text-align: center;
  }
}

.invite-link-container {
  width: 95%;
  margin: 20rpx auto;
  
  .invite-link-button {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 10rpx;
    padding: 25rpx;
    
    .invite-link-text {
      flex: 1;
      margin-left: 20rpx;
      color: #EEEEEE;
      font-size: 28rpx;
      text-align: center;
    }
  }
}

.leaderboard-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10rpx;
  margin-bottom: 30rpx;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .trophy-icon, .points-icon, .winrate-icon {
      width: 60rpx;
      height: 60rpx;
      margin-bottom: 10rpx;
    }
    
    .stat-label {
      font-size: 28rpx;
      color: #AAAAAA;
    }
    
    .stat-value {
      font-size: 32rpx;
      font-weight: bold;
      color: #FFFFFF;
    }
  }
}
</style>