<!-- components/chess/GameTabs.vue -->
<template>
  <view class="game-tabs">
    <view 
      v-for="(tab, index) in tabs" 
      :key="index"
      class="tab" 
      :class="{ active: activeTab === tab.value }" 
      @click="switchTab(tab.value)"
    >
      <image class="tab-icon" :src="tab.icon" mode="aspectFit"></image>
      <text class="tab-text">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    activeTab: {
      type: String,
      required: true
    },
    tabs: {
      type: Array,
      required: true
    }
  },
  methods: {
    switchTab(tabValue) {
      this.$emit('tab-change', tabValue);
    }
  }
}
</script>

<style lang="scss" scoped>
.game-tabs {
  display: flex;
  justify-content: space-between;
  border-radius: 20rpx 20rpx  0rpx 0rpx;
  background-color: rgba(0, 0, 0, 0.40);
  
  .tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 0;
    
    &.active {
      background-color: rgba(143, 143, 143, 0.1);
    }
    
    .tab-icon {
      width: 60rpx;
      height: 60rpx;
      margin-bottom: 10rpx;
    }
    
    .tab-text {
      color: #fff;
      font-size: 28rpx;
    }
  }
}
</style>