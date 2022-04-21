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

export default {
  name: "JoinRoomView",
  data: () => ({
    roomId: null,
    username: null,
  }),
  created() {
    this.roomId = this.$route.params.roomId;
    this.username = localStorage.getItem(this.roomId);
  },
  computed: {
    invalidUsername() {
      return !_.isEmpty(this.username) && !/^[A-Za-z0-9]+$/.test(this.username);
    },
  },
  methods: {
    joinRoom() {
      if (!this.invalidUsername) {
        localStorage.setItem(this.roomId, this.username);
        this.$router.push(`/room/${this.roomId}`);
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
