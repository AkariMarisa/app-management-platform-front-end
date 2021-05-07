<template>
  <div class="root">
    <div class="home">
      <div class="p-text-center p-text-bold p-py-5" style="font-size: 1.3rem">
        欢迎使用XXX分发平台
      </div>
      <div class="p-text-center p-text-bold p-pb-5" style="color: #b0b0b0">
        <em class="pi pi-info-circle p-mr-2"></em>拖入文件到页面进行上传
      </div>

      <div class="toolbar self-center">
        <!-- 搜索控件区 -->
        <div class="filter">
          <SelectButton
            v-model="selectedPlatform"
            :options="platforms"
            optionLabel="brand"
            multiple
            @click="filterPlatform"
          >
            <template #option="slotProps">
              <div class="option">
                <em class="pi" v-bind:class="slotProps.option.icon"></em>
              </div>
            </template>
          </SelectButton>
        </div>

        <div>
          <span class="p-input-icon-left">
            <i class="pi pi-search p-pl-1"></i>
            <InputText
              class="p-inputtext"
              type="text"
              v-model="search.appName"
              placeholder="输入名称搜索"
              style="border-radius: 64px"
              @input="searchByName"
            />
          </span>
        </div>

        <!-- 统计区 -->
        <div class="downloads">
          <div>
            <div class="title">当日应用下载总量</div>
            <div class="counts">{{ appDownloadCount }}次</div>
          </div>
        </div>
      </div>

      <!-- App 列表 -->
      <div class="self-center">
        <p class="p-ml-3 p-text-bold">应用列表</p>
        <div class="p-grid p-mx-1 p-py-1">
          <!-- 每个应用卡片 -->
          <div class="p-col-4" v-for="(item, index) of list" :key="index">
            <div class="flipcard flipcard-3d">
              <div class="inner-card">
                <!-- 翻转正面 -->
                <Card class="flipcard-front hand">
                  <template #title>
                    <div style="display: flex; align-items: center">
                      <img class="appIcon" :alt="item.name" :src="item.icon" />
                      <span style="margin-left: 0.6em; z-index: 2">
                        {{ item.name }}
                      </span>
                    </div>
                    <div
                      class="appTypeBox"
                      :style="
                        item.type === 'android'
                          ? 'background-color:#99CC01;'
                          : 'background-color:#C3C3C3;'
                      "
                    >
                      <div class="triangle-cutter"></div>
                      <em
                        v-if="item.type === 'android'"
                        class="pi pi-android"
                      ></em>
                      <em
                        v-else-if="item.type === 'apple'"
                        class="pi pi-apple"
                      ></em>
                    </div>
                  </template>
                  <template #subtitle> {{ item.versionName }} </template>
                  <template #content>
                    {{
                      item.currentUpdate && item.currentUpdate.updateLog
                        ? item.currentUpdate.updateLog
                        : "暂无备注"
                    }}
                  </template>
                </Card>
                <!-- 翻转背面 -->
                <div class="flipcard-back hand app-op">
                  <Button
                    icon="pi pi-info-circle"
                    label="查看信息"
                    @click="toAppInfo(item)"
                    @tap="toAppInfo(item)"
                    class="p-button-raised p-button-rounded p-button-info p-p-2 p-mb-2"
                  />
                  <Button
                    icon="pi pi-download"
                    label="下载应用"
                    @click="toDownload(item)"
                    @tap="toDownload(item)"
                    class="p-button-raised p-button-rounded p-p-2 p-mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 拖拽文件遮照 -->
      <DragnDrop />
    </div>
  </div>
</template>

<script>
import SelectButton from "primevue/selectbutton";
import InputText from "primevue/inputtext";
import Card from "primevue/card";
import Button from "primevue/button";
import DragnDrop from "@/components/DragnDrop";
import { getDownloadCounts } from "@/api/downloadRecord";
import { getAppInfoList } from "@/api/appInfo";

export default {
  name: "Index",
  components: { SelectButton, InputText, Card, Button, DragnDrop },
  data() {
    return {
      selectedPlatform: null,
      platforms: [
        { name: "apple", icon: "pi-apple" },
        { name: "android", icon: "pi-android" },
      ],
      search: {
        platforms: [],
        appName: "",
      },
      inputDelayTimer: null,
      appDownloadCount: 0,
      list: [],
    };
  },
  created() {
    this.getDownloadCount();
    this.loadAppList();
  },
  methods: {
    getDownloadCount() {
      // 加载当前所有应用的下载总量
      getDownloadCounts()
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
    loadAppList(params) {
      // 加载当前所有app列表
      getAppInfoList(params)
        .then((resp) => {
          this.list = [];
          for (const appInfo of resp.data) {
            this.list.push({
              id: appInfo.id,
              name: appInfo.name,
              packageName: appInfo.packageName,
              versionCode: appInfo.versionCode,
              versionName: appInfo.versionName,
              icon: appInfo.icon,
              type: appInfo.type,
              shortUrl: appInfo.shortUrl,
              currentUpdate: appInfo.currentUpdate,
            });
          }
        })
        .catch((err) => {
          if (err.response) {
            this.$toast.add({
              severity: "error",
              summary: "获取应用列表错误",
              detail: err.response.data,
              life: 3000,
            });
          }
        });
    },
    toAppInfo(e) {
      this.$router.push("/AppInfo/" + e.id);
    },
    toDownload(e) {
      this.$router.push("/s/" + e.shortUrl);
    },
    buildRequestParam() {
      let platformNames = "";
      for (const platform of this.search.platforms) {
        platformNames += platform;
        platformNames += ",";
      }

      if (platformNames) {
        platformNames = platformNames.substring(0, platformNames.length - 1);
      }

      const param = {
        name: this.search.appName,
        appType: platformNames,
      };

      return param;
    },
    filterPlatform() {
      const platforms = this.selectedPlatform.map((i) => {
        return i.name;
      });
      this.search.platforms = platforms;

      // 根据查询条件重新加载应用列表
      this.loadAppList(this.buildRequestParam());
    },
    searchByName() {
      // 根据查询条件重新加载应用列表
      clearTimeout(this.inputDelayTimer);

      this.inputDelayTimer = setTimeout(() => {
        this.loadAppList(this.buildRequestParam());
      }, 1000);
    },
  },
};
</script>
<style scoped>
.root {
  background: #ffffff;
}
.home {
  background: #ffffff;
  min-height: calc(100vh - 21px);
  width: 1000px;
  margin: 0 auto;
}
.toolbar {
  display: flex;
  justify-content: space-between;
}
.toolbar .filter {
  margin-left: 30px;
}
.toolbar .downloads {
  margin-right: 30px;
}
.toolbar .downloads .title {
  color: #999999;
  font-size: 0.8rem;
}
.toolbar .downloads .counts {
  font-size: 1.8rem;
  text-align: right;
}
.appIcon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
}
.appTypeBox {
  position: absolute;
  top: 0;
  right: 0;
  width: 3.1rem;
  height: 3.1rem;
  text-align: right;
  border-radius: 0 3px;
  overflow: hidden;
  background-color: var(--primary-color);
  color: var(--primary-color-text);
}
.appTypeBox .triangle-cutter {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  width: 6rem;
  height: 6rem;
  transform: rotate(45deg);
  background-color: var(--primary-color-text);
}
.appTypeBox em {
  position: absolute;
  top: 8px;
  right: 6px;
  font-size: 0.9rem;
}
.flipcard-3d {
  perspective: 1000px;
}
.flipcard .inner-card {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-out 0.1s;
  transform-style: preserve-3d;
}
.flipcard:hover .inner-card {
  transform: rotateY(180deg);
}
.flipcard-front {
  background-color: #ffffff;
  backface-visibility: hidden;
}
.flipcard-back {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  background: #ffffff;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  z-index: 3;
}
.app-op {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>