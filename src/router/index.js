import {createWebHistory, createRouter} from 'vue-router'
import Layout from '@/layout'

// 公共路由
export const constantRoutes = [
    {
        path: '/cockpit',
        component: () => import('@/views/cockpit'),
        hidden: true
    },
    {
        path: '',
        component: Layout,
        redirect: '/index',
        children: [
            {
                path: '/index',
                component: () => import('@/views/cockpit'),
                name: 'Index',
                meta: {title: '首页', icon: 'dashboard', affix: true}
            }
        ]
    },
    {
        path: '/cockpit',
        component: () => import('@/views/cockpit'),
        hidden: true
    },
    {
        path: '/cockpit2',
        component: () => import('@/views/cockpit2'),
        hidden: true
    },
    {
        path: '/cockpit3',
        component: () => import('@/views/cockpit3'),
        hidden: true
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes: constantRoutes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {top: 0}
        }
    },
});

export default router;
