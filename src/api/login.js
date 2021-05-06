import request from './request';

export function login(params) {
    return request.post("/login", null, { params })
}