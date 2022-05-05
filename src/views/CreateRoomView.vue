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
    <div class="card" style="width: 300px">
      <div class="card-body">
        <h3 class="card-title">Creating room</h3>
        <div class="mb-3">
          <label for="username" class="form-label"> Enter username </label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': invalidUsername }"
            id="username"
            v-model="username"
            maxlength="20"
            @keyup.enter="createRoom()"
          />
          <div class="invalid-feedback">Letters and numbers only</div>
        </div>
        <button class="btn btn-primary" @click="createRoom()">
          Create room
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import { customAlphabet } from "nanoid";

export default {
  name: "CreateRoomView",
  data: () => ({
    idGenerator: customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 20),
    username: null,
  }),
  computed: {
    invalidUsername() {
      return !/^[A-Za-z0-9]+$/.test(this.username);
    },
  },
  methods: {
    createRoom() {
      if (!this.invalidUsername && !_.isEmpty(this.username)) {
        const roomId = this.idGenerator();
        localStorage.setItem(roomId, this.username);
        this.$router.push(`/room/${roomId}`);
      }
    },
  },
};
</script>

<style scoped>
.custom-bg {
  background-color: aliceblue;
}
</style>
