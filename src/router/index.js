import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/views/Home.vue'
import Schedule from '@/views/Schedule.vue'
import Congregation from '@/views/Congregation.vue'
import Help from '@/views/Help.vue'

import routeNames from './routeNames'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: routeNames.HOME,
      component: Home
    },
    {
      path: '/schedule',
      name: routeNames.SCHEDULE,
      component: Schedule
    },
    {
      path: '/congregation',
      name: routeNames.CONGREGATION,
      component: Congregation
    },
    {
      path: '/help',
      name: routeNames.HELP,
      component: Help
    }
  ]
})
