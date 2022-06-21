<template>
  <div
    class="
      custom-bg
      container-fluid
      h-100
      d-flex
      align-items-center
      justify-content-center
    "
  >
    <div class="h-100 d-flex flex-column" style="width: 500px">
      <div class="h-25"></div>
      <div class="card border-1 border-info mb-3">
        <div class="card-body">
          <div class="d-flex flex-row" v-if="joinRoomId">
            <div class="input-group pe-3 flex-grow-1 position-relative">
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': invalidUsername }"
                id="username"
                v-model="username"
                placeholder="Choose your username..."
                maxlength="20"
                @keyup.enter="joinRoom()"
              />
              <div
                class="invalid-tooltip fs-08em py-0 px-2 rounded-pill"
                style="top: 70%"
              >
                Letters and numbers only
              </div>
              <span
                class="input-group-text"
                style="max-width: 40%"
                v-tooltip.bottom="joinRoomId"
              >
                <span class="text-truncate">@{{ joinRoomId }}</span>
              </span>
              <button
                class="btn btn-sm btn-dark"
                type="button"
                @click="
                  joinRoomId = null;
                  username = null;
                  $router.push('/lobby');
                "
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
            <button
              class="btn btn-primary text-uppercase fw-bold text-nowrap"
              style="font-size: 0.8rem"
              @click="joinRoom()"
            >
              Join room
            </button>
          </div>
          <div class="d-flex flex-row" v-if="!joinRoomId">
            <div class="pe-3 flex-grow-1 position-relative">
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': invalidUsername }"
                id="username"
                v-model="username"
                placeholder="Choose your username..."
                maxlength="20"
                @keyup.enter="createRoom()"
              />
              <div
                class="invalid-tooltip fs-08em py-0 px-2 rounded-pill"
                style="top: 70%"
              >
                Letters and numbers only
              </div>
            </div>
            <button
              class="btn btn-dark text-uppercase fw-bold"
              style="font-size: 0.8rem"
              @click="createRoom()"
            >
              Create new room
            </button>
          </div>
          <div
            class="overflow-auto flex-grow-1 mt-3"
            style="max-height: 200px"
            v-if="rooms.length > 0"
          >
            <ul class="list-group">
              <button
                class="
                  list-group-item
                  d-flex
                  flex-row
                  justify-content-between
                  align-items-center
                  fw-bold
                  text-uppercase
                "
                style="height: 51px; font-size: 0.9em"
                v-for="room in latestRooms"
                :key="room.id"
                @click="loadJoinRoom(room.id)"
                @mouseover="showRoomOptions = room.id"
                @mouseleave="
                  showRoomOptions = false;
                  displayCopyToast = false;
                "
              >
                <div class="text-truncate pe-3">
                  {{ room.username }}
                  <span style="color: lightgray"> @ {{ room.id }}</span>
                </div>
                <div>
                  <button
                    class="btn btn-sm btn-outline-danger rounded-circle me-2"
                    :class="{
                      'btn-danger text-white': deleteItem === room.id,
                    }"
                    type="button"
                    v-if="showRoomOptions === room.id || deleteItem === room.id"
                    @click.stop="removeRoom(room.id)"
                  >
                    <i class="bi bi-trash2-fill"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-dark rounded-circle"
                    type="button"
                    v-if="showRoomOptions === room.id || deleteItem === room.id"
                    @click.stop="copyRoomLink(room.id)"
                  >
                    <i class="bi bi-link-45deg"></i>
                  </button>
                </div>
                <span
                  class="badge bg-dark"
                  style="position: absolute; right: 60px"
                  :class="
                    displayCopyToast === room.id ? 'd-inline-block' : 'd-none'
                  "
                >
                  <i class="bi bi-check-circle-fill me-1"></i>
                  Copied
                </span>
              </button>
              <a
                class="
                  list-group-item
                  bg-dark
                  text-white
                  fw-bold
                  text-uppercase
                  d-flex
                  justify-content-center
                  p-0
                "
                style="font-size: 0.8em; cursor: pointer"
                v-if="!showAllRooms && rooms.length > 5"
                @click="showAllRooms = true"
              >
                Show all ({{ rooms.length - 5 }})
              </a>
            </ul>
          </div>
        </div>
      </div>
      <div class="text-center text-white">
        created with <i class="bi bi-heart"></i> by
        <a
          href="https://github.com/felipeleivav/yboard"
          target="_blank"
          class="link-info"
        >
          felipe
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import { DateTime } from "luxon";
import { customAlphabet } from "nanoid";

export default {
  name: "LobbyView",
  data: () => ({
    idGenerator: customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 20),
    username: null,
    rooms: [],
    joinRoomId: null,
    showRoomOptions: false,
    deleteItem: false,
    discardDeleteTimeout: null,
    showAllRooms: false,
    displayCopyToast: false,
  }),
  computed: {
    invalidUsername() {
      return !/^[A-Za-z0-9]+$/.test(this.username);
    },
    latestRooms() {
      return this.showAllRooms ? this.rooms : this.rooms.slice(0, 5);
    },
  },
  created() {
    this.loadRooms();
    this.joinRoomId = this.$route.query.join;

    if (this.joinRoomId) {
      const room = localStorage.getItem(this.joinRoomId);
      this.username = room ? JSON.parse(room).username : null;
    }
  },
  methods: {
    loadRooms() {
      const millis = (r) => DateTime.fromISO(r.lastAccess).toMillis();
      this.rooms = _.map(_.toPairs({ ...localStorage }), (p) => ({
        id: p[0],
        ...JSON.parse(p[1]),
      })).sort((r1, r2) => millis(r2) - millis(r1));
    },
    createRoom() {
      if (!this.invalidUsername && !_.isEmpty(this.username)) {
        const roomId = this.idGenerator();
        localStorage.setItem(
          roomId,
          JSON.stringify({
            username: this.username,
            lastAccess: DateTime.now(),
          })
        );
        this.$router.push(`/room/${roomId}`);
      }
    },
    joinRoom() {
      if (!this.invalidUsername && !_.isEmpty(this.username)) {
        localStorage.setItem(
          this.joinRoomId,
          JSON.stringify({
            username: this.username,
            lastAccess: DateTime.now(),
          })
        );
        this.$router.push(`/room/${this.joinRoomId}`);
      }
    },
    loadJoinRoom(roomId) {
      this.joinRoomId = roomId;
      const room = localStorage.getItem(roomId);
      this.username = room ? JSON.parse(room).username : null;

      this.$router.push(`/lobby?join=${roomId}`);
    },
    removeRoom(roomId) {
      if (this.deleteItem === roomId) {
        localStorage.removeItem(roomId);
        this.loadRooms();
        this.deleteItem = false;
      } else {
        this.deleteItem = roomId;
        this.deleteTimeout();
      }
    },
    deleteTimeout() {
      clearTimeout(this.discardDeleteTimeout);
      this.discardDeleteTimeout = setTimeout(() => {
        this.deleteItem = false;
      }, 5000);
    },
    copyRoomLink(roomId) {
      navigator.clipboard.writeText(`${location.origin}/room/${roomId}`);

      this.displayCopyToast = roomId;
      setTimeout(() => {
        this.displayCopyToast = false;
      }, 1000);
    },
  },
};
</script>

<style scoped>
.custom-bg {
  background: #222244;
}

.list-group-item:hover {
  background-color: snow;
}
</style>
