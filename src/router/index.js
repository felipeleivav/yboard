import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/lobby'
  },
  {
    path: '/lobby',
    name: 'lobby',
    component: () => import(/* webpackChunkName: "lobby" */ '../views/LobbyView.vue'),
    alias: '/'
  },
  {
    path: '/join/:roomId',
    name: 'join',
    component: () => import(/* webpackChunkName: "join" */ '../views/JoinRoomView.vue')
  },
  {
    path: '/room/:roomId',
    name: 'room',
    component: () => import(/* webpackChunkName: "room" */ '../views/RoomView.vue')
  },
  {
    path: '/error/:roomId',
    name: 'error',
    component: () => import(/* webpackChunkName: "error" */ '../views/ErrorView.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  routes
});

export default router;
