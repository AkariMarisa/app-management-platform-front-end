<template>
  <div v-if="['Login', 'AppDownload'].indexOf($route.name) < 0" id="nav">
    <!-- 添加路由链接 -->
    <router-link to="/">首页</router-link>
    <!-- 添加用户中心 -->
  </div>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>
