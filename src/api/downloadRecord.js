import request from "./request";

export function getDownloadCounts(params) {
    return request.get('/appDownload/count', { params })
}