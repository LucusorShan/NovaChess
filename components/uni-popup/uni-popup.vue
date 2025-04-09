<template>
  <view v-if="showPopup" class="uni-popup" @touchmove.stop.prevent="clear">
    <view class="uni-popup-mask" @click="onTap"></view>
    <view class="uni-popup-wrapper" :class="[popupClass]">
      <view class="uni-popup-content">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniPopup',
  props: {
    // 开启动画
    animation: {
      type: Boolean,
      default: true
    },
    // 弹出层类型，可选值，center: 居中弹出层；bottom：底部弹出层
    type: {
      type: String,
      default: 'center'
    },
    // 是否开启自定义
    custom: {
      type: Boolean,
      default: false
    },
    // maskClick
    maskClick: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showPopup: false,
      popupClass: 'center'
    }
  },
  watch: {
    type: {
      handler: function(type) {
        this.popupClass = type
      },
      immediate: true
    }
  },
  methods: {
    clear() {},
    open() {
      this.showPopup = true
      this.$emit('change', {
        show: true
      })
    },
    close() {
      this.showPopup = false
      this.$emit('change', {
        show: false
      })
    },
    onTap() {
      if (!this.maskClick) return
      this.close()
    }
  }
}
</script>

<style lang="scss" scoped>
.uni-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  overflow: hidden;
  
  .uni-popup-mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
    opacity: 1;
  }
  
  .uni-popup-wrapper {
    position: absolute;
    
    &.center {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: 80%;
      max-height: 80%;
    }
    
    &.bottom {
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #ffffff;
      border-radius: 20rpx 20rpx 0 0;
    }
    
    .uni-popup-content {
      border-radius: 8rpx;
      overflow: hidden;
    }
  }
}
</style> 