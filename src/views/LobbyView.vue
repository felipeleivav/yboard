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
    <div
      class="card border-1 border-secondary overflow-auto"
      style="width: 500px; max-height: 80%"
    >
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
            <div class="invalid-tooltip">Letters and numbers only</div>
            <span
              class="input-group-text"
              style="max-width: 30%"
              v-tooltip.bottom="joinRoomId"
            >
              <span class="text-truncate">@{{ joinRoomId }}</span>
            </span>
            <button
              class="btn btn-sm btn-secondary"
              type="button"
              @click="
                joinRoomId = null;
                $router.push('/lobby');
              "
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
          <button
            class="btn btn-dark text-uppercase fw-bold text-nowrap"
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
            <div class="invalid-tooltip">Letters and numbers only</div>
          </div>
          <button
            class="btn btn-dark text-uppercase fw-bold"
            style="font-size: 0.8rem"
            @click="createRoom()"
          >
            Create new room
          </button>
        </div>
        <ul class="list-group pt-3" v-if="rooms.length > 0">
          <a
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
            :href="`room/${room.id}`"
            @mouseover="showRoomOptions = room.id"
            @mouseleave="showRoomOptions = false"
          >
            <div class="text-truncate pe-3">
              {{ room.username }}
              <span style="color: lightgray"> @ {{ room.id }}</span>
            </div>
            <button
              class="btn btn-sm btn-outline-danger rounded-circle"
              :class="{ 'btn-danger': deleteItem === room.id }"
              type="button"
              v-if="showRoomOptions === room.id || deleteItem === room.id"
              @click.prevent="removeRoom(room.id)"
            >
              <i class="bi bi-trash2-fill"></i>
            </button>
          </a>
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
  },
};
</script>

<style scoped>
.custom-bg {
  background-image: url("http://static.colourlovers.com/images/patterns/4077/4077687.png?1389270438");
}
.list-group-item:hover {
  background-color: snow;
}
</style>
