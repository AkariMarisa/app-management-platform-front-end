<template>
  <div class="body">
    <div class="h">
      <div class="bottom-shadow"></div>
      <div class="logo-box">
        <!-- 应用Logo -->
        <img :src="appInfo.icon" alt="" style="width: 100px; height: 100px" />
      </div>
      <div class="qrcode-box">
        <!-- 分享链接二维码 -->
        <qrcode-vue :value="appDownloadUrl" />
      </div>
    </div>
    <div class="enviroment">
      <span v-if="appInfo.type === 'apple'">
        {{ appUpdate.env === "development" ? "内测版" : "" }}
      </span>
    </div>
    <div style="color: #505556; display: flex; justify-content: center;">
      <em
        v-if="appInfo.type === 'android'"
        class="pi pi-android"
        style="font-size: 1.5em; display: flex; align-items: center"
      ></em>
      <em
        v-else-if="appInfo.type === 'apple'"
        class="pi pi-apple"
        style="font-size: 1.5em; display: flex; align-items: center"
      ></em>
      <span class="p-ml-2" style="font-size: 2em">{{ appInfo.name }}</span>
    </div>
    <div class="tip-bar">
      <div style="width: 360px; font-size: 14px; color: #a9b1b3">扫描二维码下载</div>
      <div style="width: 360px; font-size: 14px; color: #a9b1b3">
        或用手机浏览器输入这个网址:
        <!-- 分享链接 -->
        <text style="font-size: 14px; color: #000; margin-left: 5px">
          {{ appDownloadUrl }}
        </text>
      </div>
    </div>
    <div style="padding-top:20px; font-size: 14px; text-align: center; color: #a9b1b3">
      {{
        appUpdate.versionName +
        " ( Build " +
        appUpdate.versionCode +
        " ) - " +
        fileSizeInMB(appUpdate.fileSize) +
        " MB"
      }}
    </div>
    <div style="font-size: 14px; text-align: center; color: #a9b1b3">
      更新于: {{ appUpdate.createdAt }}
    </div>
    <div style="font-size: 14px; text-align: center; margin-top: 20px; margin-bottom: 20px">
      <Button
        icon="pi pi-download"
        label="下载安装"
        class="p-button-raised p-button-rounded p-px-6"
        @click="toDownload"
      />
    </div>
  </div>

</template>
<script>
import Button from "primevue/button";
import QrcodeVue from "qrcode.vue";
import math from "@/util/math";
import { getUrlPrefix } from "@/api/systemParam";
import { getAppInfoByShortUrl } from "@/api/appInfo";
import { downloadFile } from "@/api/appUpdate";
import fileDownload from "js-file-download";

export default {
  components: { Button, QrcodeVue },
  name: "AppInfo",
  props: {
    shortUrl: String,
  },
  data() {
    return {
      urlPrefix: "",
      appDownloadUrl: "",
      appInfo: {
        createdAt: "",
        currentUpdate: null,
        env: "",
        fileSize: 0,
        icon: "",
        id: 0,
        name: "",
        packageName: "",
        shortUrl: "",
        type: "",
        versionCode: 0,
        versionName: "",
      },
      appUpdate: {
        createdAt: "",
        env: "",
        fileName: "",
        fileSize: 0,
        id: 0,
        minimumOSVersion: "",
        provisionedDevices: "",
        updateLog: "",
        versionCode: 0,
        versionName: "",
      },
    };
  },
  created() {
    // 获取短链接前缀
    this.getBaseShortUrl();
  },
  methods: {
    getBaseShortUrl() {
      // 获取URL前缀
      getUrlPrefix()
        .then((resp) => {
          this.urlPrefix = resp.data[0].value;

          // 根据短链接查询应用信息
          this.getAppInfo();
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "获取URL前缀错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    getAppInfo() {
      getAppInfoByShortUrl({
        shortUrl: this.shortUrl,
      })
        .then((resp) => {
          this.appUpdate = resp.data;
          this.appInfo = resp.data.appInfo;
          this.appDownloadUrl = this.urlPrefix + this.appInfo.shortUrl;
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "获取应用信息错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    fileSizeInMB(fileSize) {
      return math.divide(fileSize, 1024 * 1024).toFixed(2);
    },
    toDownload() {
      const fileExtensionName = this.appUpdate.fileName.split(".")[1];
      const fileName =
        this.appInfo.name +
        "_" +
        this.appUpdate.versionName +
        "." +
        fileExtensionName;
      // 这里要直接下载这个应用文件, 因为有可能下载的是没有上线的版本
      downloadFile({
        appUpdateId: this.appUpdate.id,
      })
        .then((resp) => {
          fileDownload(resp.data, fileName);
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "无法下载应用文件",
              detail: err.response.status == 404 ? "文件不存在, 请联系管理员" : err.response.data,
              life: 3000,
            });
          }
        });
    },
  },
};
</script>
<style scoped>
.body {
  width: 450px;
  margin: auto;
  line-height: 1.9;
}
.h {
  height: 280px;
  width: 280px;
  margin: 20px auto;
  position: relative;
}
.bottom-shadow {
  height: 180px;
  width: 240px;
  position: absolute;
  top: 50px;
  left: 20px;
  border-radius: 24px;
  transform: rotate(45deg);
  z-index: -1;
  background-color: #eff2f2;
}
.logo-box {
  padding: 20px;
  width: 140px;
  height: 140px;
  background: #ffffff;
  border-radius: 24px;
  z-index: 2;
}
.qrcode-box {
  padding: 20px;
  width: 140px;
  height: 140px;
  float: right;
  border-radius: 24px;
  background-color: #eff2f2;
  z-index: 2;
  transition: 0.25s;
}
.h:hover .qrcode-box {
  transform: scale(1.6);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
}
.enviroment {
  height: 40px;
}
.tip-bar {
  padding: 20px 0;
  border-bottom: 1px solid #dbdbdb;
}
.tip-bar div {
  margin: auto;
}
</style>