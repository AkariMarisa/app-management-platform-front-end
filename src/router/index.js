import { createWebHashHistory, createRouter } from 'vue-router'
import Index from '@/views/Index'
import Login from '@/views/Login'
import AppInfo from '@/views/AppInfo'
import AppDownload from '@/views/AppDownload'
import NotFound from '@/views/NotFound'
import store from '@/store/index'

const routes = [
    {
        path: '/Login',
        name: 'Login',
        component: Login
    },
    {
        path: '/',
        name: 'Index',
        component: Index
    },
    {
        path: '/AppInfo/:appId',
        name: 'AppInfo',
        component: AppInfo,
        props: true
    },
    {
        path: '/s/:shortUrl',
        name: 'AppDownload',
        component: AppDownload,
        props: true
    },
    {
        path: '/:catchAll(.*)',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const publicPages = ['/Login', '/s/:shortUrl']
    const authRequired = !publicPages.includes(to.path)
    const loggedIn = store.getters['user/getToken']

    if (authRequired && !loggedIn) {
        return next('/Login')
    }

    next()
})

export default router
