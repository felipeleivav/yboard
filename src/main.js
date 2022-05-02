import Vue from 'vue';
import App from './App.vue';
import router from './router';
import VTooltip from 'v-tooltip'

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

Vue.config.productionTip = false;

Vue.use(VTooltip)

Vue.prototype.$eventHub = new Vue();

import TodoApp from "@/components/apps/TodoApp";
import KanbanApp from "@/components/apps/KanbanApp";
import ChatApp from "@/components/apps/ChatApp";
import TimerApp from "@/components/apps/TimerApp";
import LinksApp from "@/components/apps/LinksApp";
Vue.component("TodoApp", TodoApp);
Vue.component("KanbanApp", KanbanApp);
Vue.component("ChatApp", ChatApp);
Vue.component("TimerApp", TimerApp);
Vue.component("LinksApp", LinksApp);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
