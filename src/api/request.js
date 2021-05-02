const { default: axios } = require("axios");

const request = axios
request.defaults.baseURL = process.env.VUE_APP_BASE_API

export default request