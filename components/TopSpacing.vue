<template>
  <view class="top-spacing" :style="{ height: height + 'px' }"></view>
</template>

<script>
export default {
  name: 'TopSpacing',
  props: {
    height: {
      type: Number,
      default: 0
    }
  }
}
</script>

<style lang="scss" scoped>
.top-spacing {
  width: 100%;
}
</style> 