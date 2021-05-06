const { default: axios } = require("axios");
import store from '@/store/index';

const request = axios
request.defaults.baseURL = process.env.VUE_APP_BASE_API

request.interceptors.request.use(
    config => {

        const token = store.getters['user/getToken']
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        return config
    },
    error => {
        console.error(error)
        return Promise.reject(error)
    }
)

export default request