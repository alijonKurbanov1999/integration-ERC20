import { createRouter, createWebHistory } from 'vue-router'
import MainBlock from '../views/MainBlock'
import AppLoader from '../components/AppLoader'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/main',
      component: MainBlock,
      children: [
        { path: '/:loader?', component: AppLoader }
      ]
    }
  ]
})
