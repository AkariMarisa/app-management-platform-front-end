import request from "./request";

export function getUrlPrefix() {
    return request.get('/systemParam', {
        params: {
            key: 'UrlPrefix'
        }
    })
}

export function updateUrlPrefix(value) {
    return request.put('/systemParam', null, {
        params: {
            key: 'UrlPrefix',
            value
        }
    })
}