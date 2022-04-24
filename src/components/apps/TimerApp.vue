<template>
  <div class="d-flex flex-column h-100">
    <div class="overflow-auto flex-grow-1">
      <div class="card h-100">
        <div
          class="
            card-body
            d-flex
            flex-row
            justify-content-between
            align-items-center
            py-2
            px-3
          "
        >
          <div class="d-flex flex-row align-items-center">
            <button class="btn btn-primary">
              <i class="bi bi-play-fill fs-3"></i>
            </button>
            <div class="mt-2">
              <span class="fs-1 fw-bold ps-3">00:00</span>
              <span class="ps-2">/ 00:00</span>
            </div>
          </div>
        </div>
        <div
          class="progress"
          style="
            height: 5px;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
          "
        >
          <div class="progress-bar" role="progressbar" style="width: 25%"></div>
        </div>
      </div>
    </div>
    <div class="d-flex pt-3 justify-content-between">
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-stopwatch"></i>
        </span>
        <input type="text" class="form-control" placeholder="Mins" />
      </div>
      <div class="input-group ms-3">
        <div class="input-group-text">
          <input
            class="form-check-input mt-0"
            type="checkbox"
            v-model="repeat"
          />
          <i class="bi bi-arrow-repeat ps-2"></i>
        </div>
        <input
          :disabled="!repeat"
          type="text"
          class="form-control"
          placeholder="Mins"
        />
      </div>
      <button class="btn btn-primary ms-3">Set</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimerApp",
  data: () => ({
    mins: null,
    repeat: false,
    repeatMins: null,
    forWho: "me",
  }),
};
</script>
