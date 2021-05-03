<template>
  <div class="upload-mask" v-bind:class="{ show: showUploadDialog }">
    <div class="flipcard" v-bind:class="{ flip: flip }">
      <div class="dialog">
        <div class="flipcard-front">
          <div class="close-button hand" @click="close">
            <em class="pi pi-times"></em>
          </div>
          <div class="app-info">
            <div class="upper-box p-pb-5">
              <div class="left">
                <div class="icon">
                  <img
                    :src="appInfo.icon"
                    width="128"
                    height="128"
                    :alt="appInfo.name"
                  />
                </div>
              </div>
              <div class="right">
                <div class="version">
                  {{ appInfo.versionName }} (Build {{ appInfo.versionCode }})
                  <span v-if="appInfo.type === 'apple'"
                    >{{ iosEvn[appInfo.env]
                    }}<span v-if="appInfo.env === 'development'"
                      >- {{ appInfo.provisionedDevices.length }} 个 UDID</span
                    ></span
                  >
                </div>
                <div class="package-name">{{ appInfo.packageName }}</div>
                <div class="name">
                  <InputText
                    class="p-inputtext-lg"
                    type="text"
                    v-model="appInfo.name"
                    style="width: 100%"
                  />
                </div>
              </div>
            </div>
            <div class="lower-box p-pt-4 p-grid">
              <div class="p-col-2 h-center">
                <label for="url">短链接</label>
              </div>
              <div class="p-col-10">
                <div class="p-inputgroup">
                  <span class="p-inputgroup-addon">
                    {{ urlPrefix }}
                  </span>
                  <InputText
                    id="url"
                    class="p-inputtext-lg p-col-6"
                    v-model="appInfo.shortUrl"
                  />
                </div>
              </div>
              <div class="p-col-2 h-center">
                <label for="remark">更新日志</label>
              </div>
              <div class="p-col-10">
                <Textarea
                  id="remark"
                  v-model="appInfo.updateLog"
                  :autoResize="true"
                  rows="7"
                  style="width: 100%; max-height: 200px"
                />
              </div>
            </div>
          </div>
          <div
            class="upload-button hand"
            v-bind:class="{ disable: disableUpload }"
            @click="upload"
          >
            <em class="pi pi-cloud-upload p-mr-3" style="font-size: 1.5rem"></em
            ><span>开始上传</span>
          </div>
        </div>
        <div class="flipcard-back">
          <img class="loading-img" alt="loading" src="@/assets/rocket.gif" />
          <ProgressBar class="progress-bar" :value="progress"
            ><span>你好世界! {{ progress }}%</span></ProgressBar
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import ProgressBar from "primevue/progressbar";
import math from "@/util/math";
import { checkAppInfoExist, createAppInfo } from "@/api/appInfo";
import { getNewShortUrl } from "@/api/shortUrl";
import { uploadAppUpdate } from "@/api/appUpdate";

export default {
  name: "UploadMask",
  components: { InputText, Textarea, ProgressBar },
  data() {
    return {
      showUploadDialog: false,
      disableUpload: true,
      isNewApp: false,
      flip: false,
      iosEvn: {
        development: "内测版",
        production: "正式版",
      },
      urlPrefix: "",
      appInfo: {
        id: "",
        name: "",
        packageName: "",
        type: "",
        icon: "",
        shortUrl: "",
        versionName: "",
        versionCode: 0,
        env: "",
        provisionedDevices: [],
        minimumOSVersion: "",
        updateLog: "",
      },
      appFile: null,
      progress: 0,
    };
  },
  methods: {
    open(urlPrefix, appInfo, appFile) {
      this.showUploadDialog = true;
      this.urlPrefix = urlPrefix;
      this.appInfo = appInfo;
      this.appFile = appFile;

      // 请求服务端确认当前应用是否已经存在
      checkAppInfoExist(appInfo.name, appInfo.packageName, appInfo.type)
        .then((resp) => {
          const isNewApp = resp.data == null || resp.data.id == 0;
          this.isNewApp = isNewApp;

          if (!isNewApp) {
            // 使用保存的应用信息, 并进行展示
            this.appInfo.id = resp.data.id;
            this.appInfo.shortUrl = resp.data.shortUrl;
          } else {
            // 请求服务端申请一个新的短链接
            this.generateShortUrl();
          }

          this.disableUpload = false;
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "核查错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    generateShortUrl() {
      getNewShortUrl()
        .then((resp) => {
          this.appInfo.shortUrl = resp.data;
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "生成短链接失败",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    close() {
      this.showUploadDialog = false;
      setTimeout(() => {
        this.flip = false;
        this.progress = 0;
        this.$emit("onClose");
      }, 200);
    },
    upload() {
      if (this.disableUpload) {
        return;
      }

      this.flip = true;

      // 上传到服务器

      let formData = new FormData();

      formData.append("file", this.appFile);

      formData.append(
        "appUpdate.versionName",
        this.appInfo.versionName ? this.appInfo.versionName : ""
      );
      formData.append(
        "appUpdate.versionCode",
        this.appInfo.versionCode ? this.appInfo.versionCode : ""
      );
      formData.append(
        "appUpdate.env",
        this.appInfo.env ? this.appInfo.env : ""
      );
      formData.append(
        "appUpdate.provisionedDevices",
        this.appInfo.provisionedDevices ? this.appInfo.provisionedDevices : ""
      );
      formData.append(
        "appUpdate.minimunOSVersion",
        this.appInfo.minimumOSVersion ? this.appInfo.minimumOSVersion : ""
      );
      formData.append(
        "appUpdate.updateLog",
        this.appInfo.updateLog ? this.appInfo.updateLog : ""
      );

      if (this.isNewApp) {
        // 如果不存在, 则上传使用新增接口

        formData.append(
          "appInfo.appId",
          this.appInfo.appId ? this.appInfo.appId : ""
        );
        formData.append(
          "appInfo.name",
          this.appInfo.name ? this.appInfo.name : ""
        );
        formData.append(
          "appInfo.packageName",
          this.appInfo.packageName ? this.appInfo.packageName : ""
        );
        formData.append(
          "appInfo.type",
          this.appInfo.type ? this.appInfo.type : ""
        );
        formData.append(
          "appInfo.icon",
          this.appInfo.icon ? this.appInfo.icon : ""
        );
        formData.append(
          "appInfo.shortUrl",
          this.appInfo.shortUrl ? this.appInfo.shortUrl : ""
        );

        createAppInfo(formData, this.updateProgress)
          .then((resp) => {
            setTimeout(() => {
              this.close();
              this.$router.push("/AppInfo/" + resp.data);
            }, 1000);
          })
          .catch((err) => {
            this.close();
            if (err.response) {
              this.$toast.add({
                severity: "error",
                summary: "上传错误",
                detail: err.response.data,
                life: 3000,
              });
            }
          });
      } else {
        // 如果存在, 则上传使用更新接口

        formData.append("appInfo.id", this.appInfo.id);

        uploadAppUpdate(formData, this.updateProgress)
          .then(() => {
            setTimeout(() => {
              this.close();
              this.$router.push("/AppInfo/" + this.appInfo.id);
            }, 1000);
          })
          .catch((err) => {
            this.close();
            if (err.response) {
              this.$toast.add({
                severity: "error",
                summary: "上传错误",
                detail: err.response.data,
                life: 3000,
              });
            }
          });
      }
    },
    updateProgress(progressEvent) {
      const { loaded, total } = progressEvent;
      let progress = math.divide(loaded, total);
      progress = math.multiply(progress, 100);

      this.progress = progress.toFixed(2);
    },
  },
};
</script>
<style scoped>
.upload-mask {
  background-color: rgba(255, 255, 255, 0);
  z-index: -1;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  transition: background-color 0.2s, z-index 0.2s;
}
.upload-mask.show {
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 2;
}
.upload-mask .dialog {
  position: relative;
  margin: 10% auto;
  width: 600px;
  height: 600px;
  background: #ffffffff;
  box-shadow: 0 1px 12px rgba(0, 0, 0, 0.12), 0 3px 20px rgba(0, 0, 0, 0.24);
  border-radius: 20px;
}
.upload-mask .dialog .close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #9b9b9b;
}
.upload-mask .dialog .close-button em {
  width: 1rem;
  height: 1rem;
  transition: transform 0.8s;
}
.upload-mask .dialog .close-button em:hover {
  transform: rotate(360deg);
}
.upload-mask .dialog {
  --upload-button-height: 70px;
}
.upload-mask .dialog .app-info {
  padding-top: 60px;
  padding-left: 50px;
  padding-right: 50px;
  padding-bottom: var(--upload-button-height);
}
.upload-mask .dialog .app-info .upper-box {
  display: flex;
  justify-content: space-between;
}
.upload-mask .dialog .app-info .upper-box .right {
  width: 100%;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.upload-mask .dialog .app-info .upper-box .right .version,
.package-name {
  color: #9b9b9b;
}
.upload-mask .dialog .app-info .lower-box {
  border-top: 1px solid #c9c9c9;
}
.upload-mask .dialog .app-info .lower-box label {
  color: #9b9b9b;
  font-weight: 600;
}
.upload-mask .dialog .upload-button {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  position: absolute;
  bottom: 0;
  width: 100%;
  height: var(--upload-button-height);
  border-radius: 0 0 20px 20px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-mask .dialog .upload-button.disable {
  background-color: var(--surface-600);
  cursor: not-allowed;
}
.flipcard {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}
.flipcard.flip {
  transform: rotateY(180deg);
}
.flipcard.flip .flipcard-front {
  display: none;
}
.flipcard .flipcard-back {
  display: none;
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  background: #ffffff;
  text-align: center;
  transform: rotateY(180deg);
}
.flipcard.flip .flipcard-back {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: space-between;
}
.flipcard .flipcard-back .loading-img {
  width: 200px;
  height: 200px;
  margin: 185px auto;
}
.flipcard .flipcard-back .progress-bar {
  height: 30px;
  border-radius: 0 0 20px 20px;
}
.flipcard .flipcard-back .progress-bar span {
  color: var(--primary-color-text);
}
</style>