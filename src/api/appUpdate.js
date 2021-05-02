import request from './request';

export function uploadAppUpdate(data, uploadProgressCallback) {
    return request.post('/appUpdate', data, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: uploadProgressCallback
    })
}

export function getAppUpdateList(params) {
    return request.get('/appUpdate/list', { params })
}

export function updateLog(params, data) {
    return request.put('/appUpdate/log', data, { params })
}

export function makeOnline(params) {
    return request.put('/appUpdate/online', null, { params })
}

export function downloadFile(params) {
    return request.get('/appUpdate/file', { params, responseType: 'blob' })
}