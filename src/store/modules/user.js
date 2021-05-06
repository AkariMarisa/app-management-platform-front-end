import { login } from "@/api/login";

const state = {
    userId: 0,
    token: ""
}

const getters = {
    getUserId(state) {
        return state.userId
    },
    getToken(state) {
        return state.token
    }
}

const mutations = {
    setUserId(state, userId) {
        state.userId = userId
    },
    setToken(state, token) {
        state.token = token
    }
}

const actions = {
    login({ commit }, { username, password }) {
        return new Promise((resolve, reject) => {
            login({
                username,
                password
            })
                .then(resp => {
                    commit("setUserId", resp.data.userId)
                    commit("setToken", resp.data.token)
                    resolve(resp.data)
                })
                .catch((err) => {
                    reject(err)
                });

        })
    },
    logout({ commit }) {
        commit("setUserId", null)
        commit("setToken", null)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    getters,
    actions
}