<template>
  <div
    v-if="['Login', 'AppDownload'].indexOf($route.name) < 0"
    id="nav"
    class="nav"
  >
    <!-- 路由链接 -->
    <div class="links">
      <router-link to="/">
        <div class="home-link">
          <img src="@/assets/logo.png" class="home-logo" />
          <div class="home-tag">XXX分发平台</div>
        </div>
      </router-link>
    </div>
    <!-- 用户中心 -->
    <div class="user-center hand">
      <em class="pi pi-user p-mr-2"></em>
      <span>用户中心</span>
      <div class="dropdown-menu">
        <ul>
          <li>
            <div @click="openUrlPrefixDialog">
              <em class="pi pi-share-alt p-mr-2"></em>修改分享链接
            </div>
          </li>
          <li>
            <div @click="changePasswordDisplay = true">
              <em class="pi pi-key p-mr-2"></em>修改密码
            </div>
          </li>
          <li>
            <div @click="logoutDisplay = true">
              <em class="pi pi-sign-out p-mr-2"></em>登出
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <router-view />

  <BlockUI :blocked="blocked" :fullScreen="true"></BlockUI>

  <!-- 修改分享链接 -->

  <Dialog
    header="修改分享链接"
    :modal="true"
    :closable="false"
    v-model:visible="modifyUrlPrefixDisplay"
  >
    <div class="input-group">
      <div class="input-item">
        <label for="urlPrefix">分享链接</label>
        <InputText
          id="urlPrefix"
          class="p-inputtext"
          type="text"
          v-model="urlPrefix"
          placeholder="请输入分享链接"
        />
      </div>
    </div>
    <template #footer>
      <Button
        label="提交"
        icon="pi pi-check"
        @click="submitModify"
        class="p-button-text"
      />
      <Button
        label="取消"
        icon="pi pi-times"
        @click="cancelModify"
        class="p-button-text"
        autofocus
      />
    </template>
  </Dialog>

  <Dialog
    header="修改密码"
    :modal="true"
    :closable="false"
    v-model:visible="changePasswordDisplay"
  >
    <div class="input-group">
      <div class="input-item">
        <label for="oldPassword">原密码</label>
        <InputText
          id="oldPassword"
          class="p-inputtext"
          type="password"
          v-model="oldPassword"
          placeholder="请输入原密码"
        />
      </div>
      <div class="input-item">
        <label for="newPassword">新密码</label>
        <InputText
          id="newPassword"
          class="p-inputtext"
          type="password"
          v-model="newPassword"
          placeholder="请输入新密码"
        />
      </div>
      <div class="input-item">
        <label for="reNewPassword">重复输入新密码</label>
        <InputText
          id="reNewPassword"
          class="p-inputtext"
          type="password"
          v-model="reNewPassword"
          placeholder="请重复输入新密码"
        />
      </div>
    </div>
    <template #footer>
      <Button
        label="提交"
        icon="pi pi-check"
        @click="submitChange"
        class="p-button-text"
      />
      <Button
        label="取消"
        icon="pi pi-times"
        @click="cancelChange"
        class="p-button-text"
        autofocus
      />
    </template>
  </Dialog>

  <Dialog header="确定" :modal="true" v-model:visible="logoutDisplay">
    <div>真的要退出吗?</div>
    <template #footer>
      <Button
        label="是的, 我要退出"
        icon="pi pi-check"
        @click="logout"
        class="p-button-text"
      />
      <Button
        label="不要, 我点错了"
        icon="pi pi-times"
        @click="logoutDisplay = false"
        class="p-button-text"
        autofocus
      />
    </template>
  </Dialog>

  <Toast position="top-center" />
</template>

<script>
import Toast from "primevue/toast";
import BlockUI from "primevue/blockui";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { getUrlPrefix, updateUrlPrefix } from "@/api/systemParam";
import CryptoJS from "crypto-js";
import { changePassword } from "@/api/password";

export default {
  name: "App",
  components: { Toast, BlockUI, Dialog, InputText, Button },
  data() {
    return {
      modifyUrlPrefixDisplay: false,
      changePasswordDisplay: false,
      blocked: false,
      urlPrefix: "",
      salt: "librem-paradise",
      oldPassword: "",
      newPassword: "",
      reNewPassword: "",
      logoutDisplay: false,
    };
  },
  methods: {
    openUrlPrefixDialog() {
      this.modifyUrlPrefixDisplay = true;
      // 加载短链接
      getUrlPrefix()
        .then((resp) => {
          this.urlPrefix = resp.data[0].value;
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "加载短链接错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    submitModify() {
      if (!this.urlPrefix) {
        this.$toast.add({
          severity: "error",
          summary: "修改分享链接错误",
          detail: "分享链接不能为空",
          life: 3000,
        });
        return;
      }

      this.blocked = true;
      updateUrlPrefix(this.urlPrefix)
        .then(() => {
          this.blocked = false;
          this.modifyUrlPrefixDisplay = false;
          this.$toast.add({
            severity: "success",
            summary: "更新成功",
            life: 3000,
          });
        })
        .catch((err) => {
          this.blocked = false;
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "修改密码错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    cancelModify() {
      this.urlPrefix = "";
      this.modifyUrlPrefixDisplay = false;
    },
    submitChange() {
      if (this.oldPassword == this.newPassword) {
        this.$toast.add({
          severity: "error",
          summary: "修改密码错误",
          detail: "新密码不能与旧密码一致",
          life: 3000,
        });
        return;
      }

      if (this.newPassword != this.reNewPassword) {
        this.$toast.add({
          severity: "error",
          summary: "修改密码错误",
          detail: "两次密码输入不一致",
          life: 3000,
        });
        return;
      }

      const encryptedOldPassword = CryptoJS.MD5(
        this.oldPassword + this.salt
      ).toString();

      const encryptedNewPassword = CryptoJS.MD5(
        this.newPassword + this.salt
      ).toString();

      const encryptedReNewPassword = CryptoJS.MD5(
        this.reNewPassword + this.salt
      ).toString();

      this.blocked = true;
      changePassword({
        userId: this.$store.getters["user/getUserId"],
        oldPassword: encryptedOldPassword,
        newPassword: encryptedNewPassword,
        reNewPassword: encryptedReNewPassword,
      })
        .then(() => {
          this.blocked = false;
          this.changePasswordDisplay = false;
          this.$store
            .dispatch("user/logout")
            .then(() => {
              this.$router.push("/Login");
            })
            .catch((err) => {
              console.log(err);
              this.$router.push("/Login");
            });
        })
        .catch((err) => {
          this.blocked = false;
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "修改密码错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    cancelChange() {
      this.oldPassword = "";
      this.newPassword = "";
      this.reNewPassword = "";
      this.changePasswordDisplay = false;
    },
    logout() {
      this.logoutDisplay = false;
      this.$store
        .dispatch("user/logout")
        .then(() => {
          this.$router.push("/Login");
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "登出失败",
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
.nav {
  display: flex;
  align-content: center;
  justify-content: space-between;
  width: 1000px;
  margin: 0 auto;
  background-color: #ffffff;
}
.links {
  margin-left: 20px;
}
.links a:link {
  text-decoration: none;
  color: #38393f;
}
.links a:visited {
  text-decoration: none;
  color: #38393f;
}
.links a:hover {
  text-decoration: none;
  color: #38393f;
}
.links a:active {
  text-decoration: none;
  color: #38393f;
}
.links .home-link {
  display: flex;
}
.links .home-logo {
  width: 64px;
  height: 64px;
}
.links .home-tag {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  font-size: 1.2em;
  font-weight: 600;
  margin-left: 12px;
  color: #777777;
}
.user-center {
  margin-right: 20px;
  padding: 1em;
  color: #838383;
  position: relative;
}
.user-center .dropdown-menu {
  display: none;
  position: absolute;
  left: 0;
  margin-top: 1em;
  width: 120%;
}
.user-center:hover .dropdown-menu {
  display: block;
  box-shadow: #ebebeb 0 0 10px 5px;
  border-radius: 8px;
  background-color: #ffffff;
  z-index: 1;
}
.user-center .dropdown-menu ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.user-center .dropdown-menu ul li {
  border-bottom: #d1d1d1 1px solid;
  padding: 10px;
  font-size: 0.8em;
}
.user-center .dropdown-menu ul li:first-child {
  border-radius: 8px 8px 0 0;
}
.user-center .dropdown-menu ul li:last-child {
  border-bottom: 0;
  border-radius: 0 0 8px 8px;
}
.user-center .dropdown-menu ul li:hover {
  background-color: #f1f1f1;
}
.input-group .input-item {
  font-size: 0.8em;
  padding: 8px 0;
}
.input-group .input-item input {
  width: 100%;
}
</style>