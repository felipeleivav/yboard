<template>
  <div class="room-container">
    <div class="loading-overlay" v-if="!apps">
      <div class="spinner-border text-light" role="status"></div>
      <div class="pt-3"><p class="text-white">Connecting to room...</p></div>
    </div>

    <div class="toolbar-container">
      <div class="btn-group-vertical bg-light">
        <button
          v-for="(app, i) in apps"
          :key="i"
          type="button"
          class="btn btn-outline-secondary app-button"
          :class="{ active: app.active }"
          @click="toggleMinimize(app)"
        >
          <i class="bi" :class="`bi-${app.icon} w-100`"></i>
          <span class="app-title w-100">{{ app.title }}</span>
        </button>
      </div>
    </div>

    <div
      v-for="user in users"
      :key="user.id"
      :id="`cursor-${user.id}`"
      class="d-flex flex-column text-center user-cursor"
    >
      <i class="bi bi-cursor-fill"></i>
      <span>{{ user.username }}</span>
    </div>

    <div class="awareness-container">
      <img
        class="me-1"
        style="border-radius: 30px"
        v-for="user in users"
        :key="user.id"
        v-tooltip.bottom="`${user.username}`"
        :src="`https://ui-avatars.com/api/?name=${user.username}&background=random&size=24&bold=true`"
      />
      <img
        style="border: 2px orange solid; border-radius: 30px"
        v-tooltip.bottom="`${username}`"
        :src="`https://ui-avatars.com/api/?name=${username}&background=random&size=32&bold=true`"
      />
    </div>

    <AppInstance
      v-for="(app, i) in apps"
      :key="i"
      :ref="app.component"
      :app="app"
      :username="username"
      @activate="toggleActiveApp($event, app)"
    />
  </div>
</template>

<script>
import $ from "jquery";
import * as _ from "lodash";
import * as apps from "@/assets/apps.json";
import AppInstance from "@/components/AppInstance";
import YjsService from "@/services/YjsService";

export default {
  name: "RoomView",
  components: {
    AppInstance,
  },
  data: () => ({
    apps: null,
    yjs: null,
    username: null,
    users: [],
  }),
  created() {
    const roomId = this.$route.params.roomId;
    this.username = localStorage.getItem(roomId);

    if (!this.username) {
      this.$router.push(`/join/${roomId}`);
      return;
    }

    this.yjs = new YjsService();

    this.yjs
      .getConnectedDoc(roomId)
      .then((doc) => {
        this.apps = _.map(apps, (app) => ({
          ...app,
          sync: doc.getMap(app.component),
          window: {},
          active: false,
        }));
      })
      .catch(() => this.$router.push(`/error/${roomId}`));

    this.yjs.startAwareness({
      username: this.username,
      listener: (changes, state) => {
        _.each(changes.added, (c) => {
          this.users.push({ id: c, ...state.get(c) });
        });
        _.each(changes.updated, (c) => {
          const ui = _.findIndex(this.users, { id: c });
          this.users[ui] = { id: c, ...state.get(c) };
          $(`#cursor-${c}`).css({
            top: this.users[ui].cursor.y,
            left: this.users[ui].cursor.x,
          });
        });
        _.each(changes.removed, (c) => {
          this.users = _.filter(this.users, (u) => u.id !== c);
        });
      },
    });

    window.onbeforeunload = () => {
      this.yjs.stopAwareness();
    };
  },
  methods: {
    toggleActiveApp(active, app) {
      app.active = active;
    },
    toggleMinimize(app) {
      this.$refs[app.component][0].toggleMinimize();
    },
  },
};
</script>

<style scoped>
.room-container {
  height: 100%;
  background: aliceblue;
}

.toolbar-container {
  position: absolute;
  z-index: 99999;
  display: flex;
  align-items: center;
  left: 10px;
  top: 50%;
  transform: translate(0, -50%);
}

.awareness-container {
  position: absolute;
  right: 10px;
  top: 5px;
}

i.bi {
  font-size: 1.5em;
}

.app-button {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 0.6em;
  text-transform: uppercase;
  font-weight: bold;
}

.loading-overlay {
  background-color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
}

.user-cursor {
  position: absolute;
  z-index: 9999999;
  transform: translate(-90%, -16%);
}

.user-cursor > span {
  border: 1px #0dcaf0 solid;
  border-radius: 5px;
  background: white;
  font-size: 0.6em;
  font-weight: bold;
  text-transform: uppercase;
  padding: 3px 3px 0px 3px;
}
</style>
