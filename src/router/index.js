import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Schedule from '@/views/Schedule.vue'
import Congregation from '@/views/Congregation.vue'
import Help from '@/views/Help.vue'

import routes from './routes'
import { authenticationGuard, congregationGuard } from './guards'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: routes.HOME,
      component: Home,
      meta: { open: true }
    },
    {
      path: '/login',
      name: routes.LOGIN,
      component: Login,
      meta: { open: true }
    },
    {
      path: '/schedule',
      name: routes.SCHEDULE,
      component: Schedule
    },
    {
      path: '/congregation',
      name: routes.CONGREGATION,
      component: Congregation
    },
    {
      path: '/help',
      name: routes.HELP,
      component: Help
    }
  ]
})

router.beforeEach(authenticationGuard)
router.beforeEach(congregationGuard)

export default router
