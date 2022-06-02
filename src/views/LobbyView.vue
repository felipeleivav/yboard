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
    <div class="card border-1 border-secondary" style="width: 500px">
      <div class="card-body">
        <div class="d-flex flex-row">
          <div class="pe-3 flex-grow-1">
            <input
              type="text"
              class="form-control"
              :class="{ 'is-invalid': invalidUsername }"
              id="username"
              v-model="username"
              placeholder="Enter username..."
              maxlength="20"
              @keyup.enter="createRoom()"
            />
            <div class="invalid-feedback">Letters and numbers only</div>
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
            v-for="room in rooms"
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
    showRoomOptions: false,
    deleteItem: false,
    discardDeleteTimeout: null,
  }),
  computed: {
    invalidUsername() {
      return !/^[A-Za-z0-9]+$/.test(this.username);
    },
  },
  created() {
    this.loadRooms();
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
