<template>
  <view class="chess-register-container">
    <!-- 顶部间距 -->
    <top-spacing :height="statusBarHeight"></top-spacing>
    
    <view class="logo-content align-center justify-center flex">
      <image class="logo-image" :src="globalConfig.appInfo.logo" mode="widthFix"></image>
    </view>
    
    <view class="register-form-content">
      <view class="form-title">新用户注册</view>
      
      <view class="input-item flex align-center">
        <input v-model="registerForm.username" class="input" type="text" placeholder="创建用户名" maxlength="30" />
      </view>
      
      <view class="input-item flex align-center">
        <input v-model="registerForm.password" type="password" class="input" placeholder="创建密码" maxlength="20" />
      </view>
      
      <view class="input-item flex align-center">
        <input v-model="registerForm.confirmPassword" type="password" class="input" placeholder="确认密码" maxlength="20" />
      </view>
      
      <view class="input-item flex align-center captcha-container" v-if="captchaEnabled">
        <input v-model="registerForm.code" type="number" class="input captcha-input" placeholder="验证码" maxlength="4" />
        <view class="captcha-image"> 
          <image :src="codeUrl" @click="getCode" class="login-code-img"></image>
        </view>
      </view>
      
      <view class="action-btn">
        <button @click="handleRegister()" class="register-btn">注册账号</button>
      </view>
      
      <view class="login-link">
        <text @click="handleUserLogin" class="login-btn-link">使用已有账号登录</text>
      </view>
    </view>
    
    
  </view>
</template>

<script>
  import { getCodeImg, register } from '@/api/login'
  import TopSpacing from '@/components/TopSpacing.vue'

  export default {
    components: {
      TopSpacing
    },
    data() {
      return {
        statusBarHeight: 0,
        codeUrl: "",
        captchaEnabled: true,
        globalConfig: getApp().globalData.config,
        registerForm: {
          username: "",
          password: "",
          confirmPassword: "",
          code: "",
          uuid: ""
        }
      }
    },
    created() {
      this.getCode()
      // 获取状态栏高度
      const systemInfo = uni.getSystemInfoSync()
      this.statusBarHeight = systemInfo.statusBarHeight
    },
    methods: {
      // 用户登录
      handleUserLogin() {
        this.$tab.navigateTo(`/pages/login`)
      },
      // 获取图形验证码
      getCode() {
        getCodeImg().then(res => {
          this.captchaEnabled = res.captchaEnabled === undefined ? true : res.captchaEnabled
          if (this.captchaEnabled) {
            this.codeUrl = 'data:image/gif;base64,' + res.img
            this.registerForm.uuid = res.uuid
          }
        })
      },
      // 注册方法
      async handleRegister() {
        if (this.registerForm.username === "") {
          this.$modal.msgError("请输入您的账号")
        } else if (this.registerForm.password === "") {
          this.$modal.msgError("请输入您的密码")
        } else if (this.registerForm.confirmPassword === "") {
          this.$modal.msgError("请再次输入您的密码")
        } else if (this.registerForm.password !== this.registerForm.confirmPassword) {
          this.$modal.msgError("两次输入的密码不一致")
        } else if (this.registerForm.code === "" && this.captchaEnabled) {
          this.$modal.msgError("请输入验证码")
        } else {
          this.$modal.loading("注册中，请耐心等待...")
          this.register()
        }
      },
      // 用户注册
      async register() {
        register(this.registerForm).then(res => {
          this.$modal.closeLoading()
          uni.showModal({
          	title: "系统提示",
          	content: "恭喜你，您的账号 " + this.registerForm.username + " 注册成功！",
          	success: function (res) {
          		if (res.confirm) {
                uni.redirectTo({ url: `/pages/login` });
          		}
          	}
          })
        }).catch(() => {
          if (this.captchaEnabled) {
            this.getCode()
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  page {
    background-image: url('https://pic1.imgdb.cn/item/67f356300ba3d5a1d7ef164f.png');
    background-size: cover;
    background-position: center;
  }

  .chess-register-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 30rpx;

    .logo-content {
      width: 100%;
      padding-top: 10%;
      margin-bottom: 30rpx;

      .logo-image {
        width: 200rpx;
        height: 200rpx;
        border-radius: 8rpx;
      }
    }

    .register-form-content {
      width: 90%;
      display: flex;
      flex-direction: column;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 10rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
      padding: 40rpx 30rpx;
      
      .form-title {
        font-size: 42rpx;
        font-weight: bold;
        color: #EEE;
        margin-bottom: 40rpx;
        text-align: center;
      }

      .input-item {
        margin-bottom: 30rpx;
        height: 90rpx;
        border: 1rpx solid #dddddd44;
        border-radius: 8rpx;
        background-color: #ffffff22;
        overflow: hidden;

        .input {
          width: 100%;
          height: 100%;
          color: #EEE;
          font-size: 30rpx;
          padding: 0 30rpx;
        }
      }
      
      .captcha-container {
        display: flex;
        
        .captcha-input {
          flex: 1;
        }
        
        .captcha-image {
          width: 200rpx;
          height: 90rpx;
          
          .login-code-img {
            width: 100%;
            height: 100%;
          }
        }
      }

      .register-btn {
        width: 100%;
        height: 90rpx;
        background-color: #7fa650;
        color: white;
        font-size: 32rpx;
        font-weight: bold;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 20rpx;
        border: none;
      }
      
      .login-link {
        margin-top: 40rpx;
        text-align: center;
        
        .login-btn-link {
          font-size: 30rpx;
          color: #7fa650;
          text-decoration: none;
        }
      }
    }
    
    .xieyi {
      margin-top: 40rpx;
      font-size: 24rpx;
      
      .text-blue {
        color: #7fa650;
        margin: 0 6rpx;
      }
    }
  }
</style>