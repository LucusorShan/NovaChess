<template>
  <view class="replay-chess-board">
    <view class="board">
      <view v-for="(row, rowIndex) in 8" :key="rowIndex" class="board-row">
        <view 
          v-for="(col, colIndex) in 8" 
          :key="colIndex" 
          class="board-cell"
          :class="{ 
            'light': (rowIndex + colIndex) % 2 === 0, 
            'dark': (rowIndex + colIndex) % 2 === 1,
            'last-move-from': lastMove && lastMove.from.row === getBoardRow(rowIndex) && lastMove.from.col === getBoardCol(colIndex),
            'last-move-to': lastMove && lastMove.to.row === getBoardRow(rowIndex) && lastMove.to.col === getBoardCol(colIndex)
          }"
        >
          <!-- 左侧坐标 -->
          <text v-if="colIndex === 0" class="coordinate row-coordinate">{{ getRowCoordinate(rowIndex) }}</text>
          
          <!-- 底部坐标 -->
          <text v-if="rowIndex === 7" class="coordinate col-coordinate">{{ getColCoordinate(colIndex) }}</text>
          
          <image 
            v-if="boardState[getBoardRow(rowIndex)][getBoardCol(colIndex)]" 
            :src="'/static/images/match/pieces/' + boardState[getBoardRow(rowIndex)][getBoardCol(colIndex)] + '.png'" 
            class="chess-piece" 
            mode="aspectFit"
          ></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    boardState: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      default: () => ['1', '2', '3', '4', '5', '6', '7', '8']
    },
    columns: {
      type: Array,
      default: () => ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    },
    lastMove: {
      type: Object,
      default: null
    },
    playAs: {
      type: String,
      default: 'white'
    }
  },
  methods: {
    // 根据执棋颜色获取实际棋盘行（如果玩家执黑，棋盘需要翻转）
    getBoardRow(visualRow) {
      return this.playAs === 'black' ? 7 - visualRow : visualRow;
    },
    
    // 根据执棋颜色获取实际棋盘列（如果玩家执黑，棋盘需要翻转）
    getBoardCol(visualCol) {
      return this.playAs === 'black' ? 7 - visualCol : visualCol;
    },
    
    // 获取行坐标显示
    getRowCoordinate(visualRow) {
      return this.rows[this.playAs === 'black' ? visualRow : 7 - visualRow];
    },
    
    // 获取列坐标显示
    getColCoordinate(visualCol) {
      return this.columns[this.playAs === 'black' ? 7 - visualCol : visualCol];
    }
  },
  mounted() {
    // 初始化时发送事件通知父组件棋盘已准备好
    this.$emit('board-ready');
  }
}
</script>

<style lang="scss" scoped>
.replay-chess-board {
  position: relative;
  width: 100%;
  height: 100%;
  aspect-ratio: 1; /* 保持正方形比例 */
  transform: scale(1); /* 添加transform确保小程序渲染正确 */
  
  // 棋盘本体
  .board {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #b58863;
    border: 8rpx solid #604020;
    overflow: hidden;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.4); /* 添加阴影增强视觉效果 */
    
    .board-row {
      display: flex;
      height: 12.5%;
      width: 100%;
      
      .board-cell {
        width: 12.5%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        
        &.light {
          background-color: #f0d9b5;
        }
        
        &.dark {
          background-color: #b58863;
        }
        
        // 上一步移动起点和终点的高亮
        &.last-move-from, &.last-move-to {
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 0, 0.3);
            z-index: 1;
          }
        }
        
        .coordinate {
          position: absolute;
          font-size: 20rpx;
          font-weight: bold;
          z-index: 2;
        }
        
        .row-coordinate {
          left: 4rpx;
          top: 4rpx;
          color: #555;
        }
        
        .col-coordinate {
          right: 4rpx;
          bottom: 4rpx;
          color: #555;
        }
        
        .chess-piece {
          width: 80%; /* 调整棋子大小比例 */
          height: 80%;
          z-index: 2;
        }
      }
    }
  }
}
</style> 