<template>
  <div
    class="drag-n-drop"
    v-bind:class="{ show: showDragnDrop }"
    @dragover.stop.prevent
    @drop.stop.prevent="fileDropped"
  >
    <div class="outer-box">
      <div class="tip p-mb-6">请拖拽文件到此处进行上传</div>
      <em class="pi pi-upload" style="font-size: 1.5rem"></em>
    </div>

    <div class="drop-area"></div>
  </div>

  <!-- 加载遮照 -->
  <Spinner ref="spinner" />

  <!-- 上传app -->
  <UploadMask ref="uploadMask" @onClose="onUploadMaskClose" />
</template>
<script>
import Spinner from "./Spinner";
import UploadMask from "./UploadMask";
import { getUrlPrefix } from "@/api/systemParam";

export default {
  name: "DragnDrop",
  components: { Spinner, UploadMask },
  data() {
    return {
      showDragnDrop: false,
      isSpinnerOpened: false,
      isUploadMaskOpened: false,
      appFile: null,
      appInfo: {
        name: "",
        packageName: "",
        type: "",
        icon: "",
        versionName: "",
        versionCode: 0,
        env: "",
        provisionedDevices: [],
        minimumOSVersion: "",
      },
      urlPrefix: "",
    };
  },
  mounted() {
    document.addEventListener("dragenter", this.dragEnterHandler);
    document.addEventListener("dragleave", this.dragLeaveHandler);
  },
  beforeUnmount() {
    document.removeEventListener("dragenter", this.dragEnterHandler);
    document.removeEventListener("dragleave", this.dragLeaveHandler);
  },
  methods: {
    dragEnterHandler(e) {
      // console.log("drag enter");
      e.preventDefault();
      this.open();
    },
    dragLeaveHandler(e) {
      // console.log("drag leave");
      e.preventDefault();
      const { className } = e.target;
      if (className === "drop-area") {
        this.close();
      }
    },
    open() {
      if (!this.showDragnDrop) {
        // 需要确认当前上传等遮照是否开启, 只有当前没有其他遮照的情况下才能显示拖入遮照与开启拖入功能
        if (!this.isSpinnerOpened && !this.isUploadMaskOpened) {
          this.showDragnDrop = true;
        }
      }
    },
    close() {
      if (this.showDragnDrop) {
        this.showDragnDrop = false;
      }
    },
    openSpinner() {
      this.$refs.spinner.open();
      this.isSpinnerOpened = true;
    },
    closeSpinner() {
      this.$refs.spinner.close();
      this.isSpinnerOpened = false;
    },
    openUploadMask() {
      this.$refs.uploadMask.open(this.urlPrefix, this.appInfo, this.appFile);
      this.isUploadMaskOpened = true;
    },
    onUploadMaskClose() {
      this.isUploadMaskOpened = false;
    },
    fileDropped(e) {
      this.close();
      this.openSpinner();

      const file = e.dataTransfer.files[0];
      if (!file) {
        this.closeSpinner();
        return;
      }

      // 分析包信息
      const splits = (file.name || file).split(".");
      const fileType = splits[splits.length - 1].toLowerCase();
      if (fileType === "apk") {
        this.analyseApk(file);
      } else if (fileType === "ipa") {
        this.analyseIpa(file);
      } else {
        this.closeSpinner();
        this.$toast.add({
          severity: "error",
          summary: "格式错误",
          detail: "文件格式不是APK或IPA",
          life: 3000,
        });
      }
    },
    analyseApk(f) {
      const ApkParser = require("app-info-parser/src/apk");
      const parser = new ApkParser(f);
      parser
        .parse()
        .then((result) => {
          console.log(result);
          this.appFile = f;
          this.extractAppInfo(result, "android");
        })
        .catch((err) => {
          console.error(err);
        });
    },
    analyseIpa(f) {
      const IpaParser = require("app-info-parser/src/ipa");
      const parser = new IpaParser(f);
      parser
        .parse()
        .then((result) => {
          console.log(result);
          this.appFile = f;
          this.extractAppInfo(result, "apple");
        })
        .catch((err) => {
          console.error(err);
        });
    },
    extractAppInfo(app, type) {
      if (type === "android") {
        const { application, versionCode, versionName, icon } = app;

        const { metaData } = application; // 这里的metaData是个数组, 需要从数据中获取 name为 DCLOUD_STREAMAPP_CHANNEL 的值, 然后从中获取 uniapp 的 appid
        const dcloudStreamappChannel = metaData.find(
          (e) => e.name === "DCLOUD_STREAMAPP_CHANNEL"
        );

        const value = dcloudStreamappChannel.value;
        let appId;
        if (value.match(new RegExp("\\|", "g")).length == 3) {
          appId = value.split("|")[1];
        }

        this.appInfo = {
          appId,
          type: "android",
          name: application.label[0],
          packageName: app.package,
          versionCode,
          versionName,
          icon,
        };
      } else if (type === "apple") {
        const {
          CFBundleDisplayName,
          CFBundleIdentifier,
          CFBundleVersion,
          CFBundleShortVersionString,
          MinimumOSVersion,
          icon,
          marketChannel, // 从中获取 uniapp 的 appid
          mobileProvision,
        } = app;
        if (!mobileProvision || !mobileProvision.Entitlements) {
          this.closeSpinner();
          this.$toast.add({
            severity: "error",
            summary: "包信息错误",
            detail: "暂不支持越狱包",
            life: 3000,
          });
          return;
        }

        let appId;
        if (marketChannel.match(new RegExp("\\|", "g")).length == 3) {
          appId = marketChannel.split("|")[1];
        }

        this.appInfo = {
          appId,
          type: "apple",
          name: CFBundleDisplayName,
          packageName: CFBundleIdentifier,
          versionCode: CFBundleVersion,
          versionName: CFBundleShortVersionString,
          minimumOSVersion: MinimumOSVersion,
          icon,
          env: mobileProvision.Entitlements["aps-environment"],
          provisionedDevices: mobileProvision.ProvisionedDevices,
        };
      } else {
        console.error("不支持的文件类型, 无法进行解析 ", type);
        this.$toast.add({
          severity: "error",
          summary: "格式错误",
          detail: "不支持的文件类型, 无法进行解析",
          life: 3000,
        });
        return;
      }

      // 获取URL前缀
      getUrlPrefix().then((resp) => {
        this.urlPrefix = resp.data[0].value;

        setTimeout(() => {
          this.closeSpinner();
          this.openUploadMask();
        }, 2000);
      });
    },
  },
};
</script>
<style scoped>
.drag-n-drop {
  background-color: #ffffff;
  opacity: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  padding: 2rem;
  transition: opacity 0.2s, z-index 0.2s;
}
.drag-n-drop.show {
  opacity: 0.9;
  z-index: 2;
}
.drag-n-drop .outer-box {
  border: #000000 0.85rem dashed;
  width: 100%;
  height: 100%;
  border-radius: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.drag-n-drop .outer-box .tip {
  font-size: 2rem;
  align-items: center;
}
.drag-n-drop .drop-area {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;
}
</style>