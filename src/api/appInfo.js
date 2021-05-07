import request from './request';

export function getAppInfoList(params) {
    return request.get('/appInfo/list', { params })
}

export function getAppInfoById(params) {
    return request.get('/appInfo', { params })
}

export function checkAppInfoExist(appName, packageName, appType) {
    return request.get('/appInfo/exist', {
        params: {
            name: appName,
            packageName,
            appType
        }
    })
}

export function createAppInfo(data, uploadProgressCallback) {
    return request.post('/appInfo', data, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: uploadProgressCallback
    })
}

export function getAppInfoByShortUrl(params) {
    return request.get('/appInfoByUrl', { params })
}

export function deleteApp(params) {
    return request.delete('appInfo', { params })
}