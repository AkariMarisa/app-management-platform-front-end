import request from "./request";

export function getNewShortUrl() {
    return request.get("/shortUrl/generate")
}