<template>
  <div class="home">
    <form class="form-box">
      <div class="title p-mb-6">欢迎使用XXX分发平台</div>
      <InputText
        class="p-inputtext-lg"
        type="text"
        v-model="userName"
        placeholder="请输入用户名"
      />
      <InputText
        class="p-inputtext-lg"
        type="password"
        v-model="password"
        autocomplete
        placeholder="请输入密码"
      />
      <!-- 只有开发模式下能看到, 生产版本不允许让用户看到这个信息 -->
      <div v-if="env === 'development'">
        <p>默认用户: admin</p>
        <p>默认密码: 123456</p>
      </div>
      <Button
        label="登 录"
        @click="toLogin"
        class="p-button-raised p-button-rounded"
      />
    </form>
    <BlockUI :blocked="blocked" :fullScreen="true"></BlockUI>
  </div>
</template>
<script>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import BlockUI from "primevue/blockui";
import CryptoJS from "crypto-js";

export default {
  components: { Button, InputText, BlockUI },
  name: "Login",
  data() {
    return {
      env: process.env["NODE_ENV"],
      blocked: false,
      userName: "",
      password: "",
      salt: "librem-paradise",
    };
  },
  methods: {
    toLogin() {
      this.blocked = true;

      // 加密密码
      const encryptedPassword = CryptoJS.MD5(
        this.password + this.salt
      ).toString();

      this.$store
        .dispatch("user/login", {
          username: this.userName,
          password: encryptedPassword,
        })
        .then(() => {
          this.blocked = false;
          this.$router.push("/");
        })
        .catch((err) => {
          this.blocked = false;
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "登陆失败",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
  },
};
</script>
<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-box {
  text-align: center;
  box-shadow: rgba(33, 33, 33, 0.2) 0 0 30px 10px;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.form-box .title {
  font-size: 1.5em;
}
.form-box input {
  border-radius: 6px;
  margin: 6px 0;
}
.form-box button {
  margin-top: 30px;
  padding: 10px 120px;
}
</style>