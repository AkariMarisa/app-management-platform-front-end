const { default: axios } = require("axios");
import store from '@/store/index';
import router from '@/router/index';

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

request.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (error.response.status === 401) { // 鉴权失败
            router.replace("/Login")
        }
        return Promise.reject(error)
    }
)

export default request