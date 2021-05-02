<template>
  <div class="spinner-box" v-bind:class="{ show: showSpinner }">
    <div class="center">
      <div>
        <ProgressSpinner strokeWidth="4" />
      </div>
    </div>
  </div>
</template>
<script>
import ProgressSpinner from "primevue/progressspinner";
export default {
  name: "Spinner",
  components: { ProgressSpinner },
  data() {
    return { showSpinner: false };
  },
  methods: {
    open() {
      this.showSpinner = true;
    },
    close() {
      this.showSpinner = false;
    },
  },
};
</script>
<style scoped>
.spinner-box {
  background-color: #ffffff;
  opacity: 0;
  z-index: -1;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  transition: opacity 0.2s, z-index 0.2s;
}
.spinner-box.show {
  opacity: 0.9;
  z-index: 2;
}
.spinner-box .center {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>