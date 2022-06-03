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
        <button
          class="btn btn-dark text-uppercase fw-bold me-3"
          style="font-size: 0.9em"
          @click="retry()"
        >
          Retry
        </button>
        <button
          class="btn btn-outline-dark text-uppercase fw-bold"
          style="font-size: 0.9em"
          @click="$router.push('/lobby')"
        >
          Go to lobby
        </button>
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
      this.$router.push(`/lobby?join=${this.roomId}`);
    },
  },
};
</script>

<style scoped>
.custom-bg {
  background-image: url("http://static.colourlovers.com/images/patterns/864/864558.png?1273579140");
}
</style>
