import request from './request';

export function changePassword(params) {
    return request.put("/user/password", null, { params })
}