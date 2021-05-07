<template>
  <div class="root">
    <div class="top-box">
      <div class="hcenter">
        <div class="icoBox">
          <!-- 应用图标 -->
          <img
            :src="appInfo.icon"
            :alt="appInfo.name"
            style="width: 100px; height: 100px"
          />
        </div>
        <div class="info-box">
          <div class="appInfo">
            <!-- 下载链接 -->
            <div
              class="appInfo-info hand"
              style="color: #f8ba0b"
              v-tooltip.top="'复制到粘帖板'"
              @click="toCopyUrl"
            >
              {{ appDownloadUrl }}
            </div>
            <!-- 应用下载量 -->
            <div class="appInfo-info">
              <div>
                <text
                  style="border-right: 1px solid #909399; padding-right: 6px"
                >
                  下载量
                </text>
                <text style="padding-left: 6px">{{ appDownloadCount }}</text>
              </div>
            </div>
            <!-- 应用平台 -->
            <div v-if="appInfo.type === 'apple'" class="appInfo-info">iOS</div>
            <div v-if="appInfo.type === 'android'" class="appInfo-info">
              Android
            </div>
            <!-- 应用包名 -->
            <div class="appInfo-info">
              <div>
                <text
                  v-if="appInfo.type === 'apple'"
                  style="border-right: 1px solid #909399; padding-right: 6px"
                >
                  BundleID
                </text>
                <text
                  v-if="appInfo.type === 'android'"
                  style="border-right: 1px solid #909399; padding-right: 6px"
                >
                  PackageName
                </text>
                <text style="padding-left: 10px">
                  {{ appInfo.packageName }}
                </text>
              </div>
            </div>
          </div>
          <div class="appInfob">
            <!-- 应用名称 -->
            <div class="appName">
              {{ appInfo.name }}
            </div>
            <!-- 应用下载按钮 -->
            <div>
              <Button
                icon="pi pi-eye"
                label="预览"
                @click="toOverview"
                class="p-button-raised p-button-rounded p-px-3 p-mr-3"
              />
              <Button
                icon="pi pi-trash"
                label="删除"
                @click="deleteDisplay = true"
                class="p-button-raised p-button-rounded p-button-danger p-px-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 下方的应用版本历史记录 -->
    <div class="update-history-box">
      <div class="triangle"></div>
      <Timeline :value="appUpdateList">
        <template #marker>
          <span class="timeLine-icon">
            <em class="pi pi-cloud-upload"></em>
          </span>
        </template>
        <template #content="{ item }">
          <div style="padding: 10px 0 40px 20px">
            <div style="font-size: 1.3em; color: #4a4a4a">
              {{ item.versionName + " (Build " + item.versionCode + ")" }}
            </div>
            <div style="font-size: 0.8em; color: #9b9b9b; padding: 10px 0">
              {{ item.createdAt }}
            </div>
            <!-- 当前版本的更新日志 -->
            <div class="log-box" v-bind:class="{ 'show-log': item.updateLog }">
              {{ item.updateLog }}
            </div>
            <div v-if="editId === item.id">
              <Textarea v-model="item.updateLog" rows="5" cols="60"></Textarea>
              <div
                class="timeLine-but"
                style="width: 50px"
                @click="toSave(item)"
              >
                保存
              </div>
            </div>
            <div v-else style="display: flex; align-items: center">
              <div
                class="timeLine-but"
                @click="toEdit(item)"
                v-tooltip.top="'编辑更新日志'"
              >
                <em class="pi pi-file-o"></em>
              </div>
              <div
                class="timeLine-but"
                @click="toDownloadCurrentVersion(item)"
                v-tooltip.top="'下载源文件'"
              >
                <em class="pi pi-cloud-download p-mr-1"></em>
                {{ fileSizeInMB(item.fileSize) }} MB
              </div>
              <!-- 只能在当前应用不是线上版本的时候显示 -->
              <div
                v-if="!item.isOnlineVersion"
                class="timeLine-but"
                @click="toOnline(item)"
              >
                <em class="pi pi-cloud p-mr-1"></em>
                上线
              </div>
            </div>
          </div>
        </template>
      </Timeline>
    </div>
  </div>

  <BlockUI :blocked="blocked" :fullScreen="true"></BlockUI>

  <Dialog header="确定" :modal="true" v-model:visible="deleteDisplay">
    <div>确定要删除此应用吗?</div>
    <div class="p-mt-2" style="color: #ff0000; font-size: 1.2em">
      删除操作将删除应用信息及其所有的版本文件.
    </div>
    <template #footer>
      <Button
        label="确定"
        icon="pi pi-check"
        @click="toDelete"
        class="p-button-danger"
      />
      <Button
        label="取消"
        icon="pi pi-times"
        @click="deleteDisplay = false"
        class="p-button-text"
        autofocus
      />
    </template>
  </Dialog>
</template>
<script>
import Timeline from "primevue/timeline";
import Button from "primevue/button";
import Tooltip from "primevue/tooltip";
import Textarea from "primevue/textarea";
import BlockUI from "primevue/blockui";
import Dialog from "primevue/dialog";
import math from "@/util/math";
import { getUrlPrefix } from "@/api/systemParam";
import { getDownloadCounts } from "@/api/downloadRecord";
import { getAppInfoById, deleteApp } from "@/api/appInfo";
import {
  getAppUpdateList,
  updateLog,
  makeOnline,
  downloadFile,
} from "@/api/appUpdate";
import fileDownload from "js-file-download";
import { toClipboard } from "@soerenmartius/vue3-clipboard";

export default {
  components: { Timeline, Button, Textarea, BlockUI, Dialog },
  directives: {
    tooltip: Tooltip,
  },
  name: "AppInfo",
  props: {
    appId: String,
  },
  data() {
    return {
      deleteDisplay: false,
      blocked: false,
      urlPrefix: "",
      appDownloadCount: 0,
      appDownloadUrl: "",
      appInfo: {},
      appUpdateList: [],
      hideLog: true,
      editId: "",
      oldLog: "",
    };
  },
  created() {
    // 获取短链接前缀
    this.getBaseUrlPrefix();
    // 获取应用下载量
    this.getAppDownloadCount();
    // 获取应用更新列表
    this.getAppUpdates();
  },
  methods: {
    getBaseUrlPrefix() {
      // 获取URL前缀
      getUrlPrefix()
        .then((resp) => {
          this.urlPrefix = resp.data[0].value;

          // 获取应用信息
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
    getAppDownloadCount() {
      // 加载当前所有应用的下载总量
      getDownloadCounts({
        appInfoId: this.appId,
      })
        .then((resp) => {
          this.appDownloadCount = resp.data;
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "获取下载总量错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    getAppInfo() {
      getAppInfoById({
        appInfoId: this.appId,
      })
        .then((resp) => {
          if (resp.data && resp.data.id != 0) {
            this.appInfo = resp.data;
            this.appDownloadUrl = this.urlPrefix + this.appInfo.shortUrl;
          }
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
    getAppUpdates() {
      getAppUpdateList({
        appInfoId: this.appId,
      })
        .then((resp) => {
          this.appUpdateList = resp.data;
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
    toCopyUrl() {
      toClipboard(this.appDownloadUrl);
    },
    toOverview() {
      this.$router.push("/s/" + this.appInfo.shortUrl);
    },
    toDelete() {
      this.blocked = true;
      // 删除应用
      deleteApp({
        appInfoId: this.appId,
      })
        .then(() => {
          this.blocked = false;
          this.$router.replace("/");
        })
        .catch((err) => {
          this.blocked = false;
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "无法下载应用文件",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    toDownloadCurrentVersion(e) {
      const fileExtensionName = e.fileName.split(".")[1];
      const fileName =
        this.appInfo.name + "_" + e.versionName + "." + fileExtensionName;
      // 这里要直接下载这个应用文件, 因为有可能下载的是没有上线的版本
      downloadFile({
        appUpdateId: e.id,
      })
        .then((resp) => {
          fileDownload(resp.data, fileName);
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "无法下载应用文件",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    toEdit(e) {
      this.hideLog = true;
      this.editId = e.id;
      this.oldLog = e.updateLog;
    },
    toSave(e) {
      this.hideLog = false;
      this.editId = "";

      //  如果日志没有修改过, 就不用更新了
      if (this.oldLog.trim() == e.updateLog.trim()) {
        // 如果是一堆空格, 则直接变成空
        if (!e.updateLog.trim()) {
          e.updateLog = "";
        }
        return;
      }

      // 更新服务端日志
      let formData = new FormData();
      formData.append("log", e.updateLog.trim());

      updateLog({ appUpdateId: e.id }, formData)
        .then(() => {
          this.getAppUpdates();
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "更新日志失败",
              detail: err.response.data,
              life: 3000,
            });
          }
        })
        .finally(() => {
          console.log("clear log");
          this.oldLog = "";
        });
    },
    toOnline(e) {
      // 调用服务端上线接口
      makeOnline({
        appInfoId: this.appId,
        appUpdateId: e.id,
      })
        .then(() => {
          this.getAppUpdates();
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "标记上线失败",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
  },
};
</script>
<style>
.p-timeline-event-opposite {
  display: none;
}
</style>
<style scoped>
.root {
  background-color: #f8f8f8;
}
.top-box {
  background-color: #ffffff;
  border-bottom: 1px solid #e7e7e7;
}
.hcenter {
  width: 800px;
  margin: auto;
  display: flex;
  height: 200px;
}
.icoBox {
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.info-box {
  width: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.appInfo {
  height: 40px;
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
}
.appInfo-info {
  border: 1px solid #909399;
  border-radius: 5px;
  font-size: 12px;
  padding: 3px 7px;
  color: #9b9b9b;
  margin-right: 12px;
  height: 26px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.appInfob {
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.appInfob .appName {
  font-size: 1.8em;
  color: #9b9b9b;
}
.update-history-box {
  width: 800px;
  margin: auto;
  padding: 60px 20px 20px 20px;
  margin: auto;
  position: relative;
}
.triangle {
  position: absolute;
  top: -13px;
  left: 32px;
  width: 24px;
  height: 24px;
  border: 1px solid #e7e7e7;
  border-right: none;
  border-bottom: none;
  background-color: #f8f8f8;
  transform: rotate(45deg);
}
.log-box {
  display: none;
  font-size: 0.9em;
}
.show-log {
  display: block;
  padding: 10px 0;
}
.timeLine-but {
  border: 1px solid #afafaf;
  border-radius: 15px;
  padding: 5px 10px;
  font-size: 14px;
  margin-right: 10px;
  color: #9c9c9c;
  cursor: pointer;
  display: flex;
  justify-content: center;
}
.timeLine-icon {
  border: 2px solid rgba(151, 151, 151, 0.2);
  border-radius: 50%;
  width: 3em;
  height: 3em;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
.timeLine-icon em {
  color: #9c9c9c;
}
</style>