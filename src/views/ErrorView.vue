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
        <h3 class="card-title">Error joining room</h3>
        <div class="mb-3">
          <p>Couldn't connect to the room server. Please try again.</p>
        </div>
        <button class="btn btn-primary" @click="retry()">Retry</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ErrorView",
  data: () => ({
    roomId: null,
  }),
  created() {
    this.roomId = this.$route.params.roomId;
  },
  methods: {
    retry() {
      this.$router.push(`/join/${this.roomId}`);
    },
  },
};
</script>

<style scoped>
.custom-bg {
  background-color: azure;
}
</style>
