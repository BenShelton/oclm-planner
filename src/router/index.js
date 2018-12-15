import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Schedule from '@/views/Schedule.vue'
import Congregation from '@/views/Congregation.vue'
import Help from '@/views/Help.vue'

import routes from './routes'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: routes.HOME,
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
