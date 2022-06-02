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
        <h3 class="card-title">Joining room</h3>
        <div class="mb-3">
          <label for="username" class="form-label"> Enter username </label>
          <input
            type="text"
            class="form-control"
            :class="{ 'is-invalid': invalidUsername }"
            id="username"
            v-model="username"
            maxlength="20"
            @keyup.enter="joinRoom()"
          />
          <div class="invalid-feedback">Letters and numbers only</div>
        </div>
        <button class="btn btn-primary" @click="joinRoom()">Join room</button>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import { DateTime } from "luxon";

export default {
  name: "JoinRoomView",
  data: () => ({
    roomId: null,
    username: null,
  }),
  created() {
    this.roomId = this.$route.params.roomId;
    this.username = JSON.parse(localStorage.getItem(this.roomId)).username;
  },
  computed: {
    invalidUsername() {
      return !/^[A-Za-z0-9]+$/.test(this.username);
    },
  },
  methods: {
    joinRoom() {
      if (!this.invalidUsername && !_.isEmpty(this.username)) {
        localStorage.setItem(
          this.roomId,
          JSON.stringify({
            username: this.username,
            lastAccess: DateTime.now(),
          })
        );
        this.$router.push(`/room/${this.roomId}`);
      }
    },
  },
};
</script>

<style scoped>
.custom-bg {
  background-color: azure;
}
</style>
