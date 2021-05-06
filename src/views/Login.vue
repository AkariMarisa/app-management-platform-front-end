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
      <Button
        label="登 录"
        @click="toLogin"
        class="p-button-raised p-button-rounded"
      />
    </form>

    <Toast position="top-center" />
  </div>
</template>
<script>
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Toast from "primevue/toast";

export default {
  components: { Button, InputText, Toast },
  name: "Login",
  data() {
    return {
      userName: "",
      password: "",
    };
  },
  methods: {
    toLogin() {
      // TODO 加密密码

      this.$store
        .dispatch("user/login", {
          username: this.userName,
          password: this.password,
        })
        .then(() => {
          this.$router.push("/");
        })
        .catch((err) => {
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