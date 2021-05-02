import request from "./request";

export function getUrlPrefix() {
    return request.get('/systemParam', {
        params: {
            key: 'UrlPrefix'
        }
    })
}