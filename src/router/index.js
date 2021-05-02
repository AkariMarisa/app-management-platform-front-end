import { createWebHashHistory, createRouter } from 'vue-router'
import Index from '@/views/Index'
import Login from '@/views/Login'
import AppInfo from '@/views/AppInfo'
import AppDownload from '@/views/AppDownload'
import NotFound from '@/views/NotFound'

const routes = [
    {
        path: '/',
        name: 'Index',
        component: Index
    },
    {
        path: '/Login',
        name: 'Login',
        component: Login
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

export default router
