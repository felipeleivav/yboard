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
            <button
              v-if="running"
              class="btn btn-primary"
              @click="pauseTimer()"
            >
              <i class="bi bi-pause-fill fs-3"></i>
            </button>
            <button
              v-if="!running"
              class="btn btn-primary"
              @click="startTimer()"
            >
              <i class="bi bi-play-fill fs-3"></i>
            </button>
            <div class="mt-2 user-select-none">
              <span class="fs-1 fw-bold ps-3">{{
                remainingSeconds | toMmss
              }}</span>
              <span class="ps-2">/ {{ total | toMmss }}</span>
            </div>
          </div>
          <div class="mt-2">
            <i v-if="isDone" class="bi bi-check-all text-success"></i>
            <i v-if="isPaused" class="bi bi-pause text-danger blink"></i>
            <i
              v-if="onBreak"
              class="bi bi-moon-stars-fill text-warning ps-2"
            ></i>
            <i
              v-if="repeatable"
              class="bi bi-arrow-repeat text-primary ps-2"
            ></i>
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
          <div
            class="progress-bar"
            :class="{
              'progress-bar-striped progress-bar-animated': running,
              'bg-warning': onBreak,
              'bg-danger': isPaused,
              'bg-success': isDone,
            }"
            role="progressbar"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
      </div>
    </div>
    <div class="d-flex pt-3 justify-content-between">
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-stopwatch"></i>
        </span>
        <input
          type="text"
          class="form-control"
          placeholder="Mins"
          v-model="timerMins"
          @keypress="numberFilter"
        />
        <div class="input-group-text" @click="repeat = !repeat">
          <i class="bi bi-arrow-repeat"></i>
          <input
            class="form-check-input ms-2 mt-0"
            type="checkbox"
            v-model="repeat"
          />
        </div>
        <div class="input-group-text">
          <i class="bi bi-moon"></i>
        </div>
        <input
          :disabled="!repeat"
          type="text"
          class="form-control"
          placeholder="Mins"
          v-model="breakMins"
          @keypress="numberFilter"
        />
      </div>
      <button class="btn btn-primary ms-3" @click="setTimer()">Set</button>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import NumberFilterMixin from "@/mixins/number-filter.mixin";

export default {
  name: "TimerApp",
  mixins: [NumberFilterMixin],
  filters: {
    toMmss(time) {
      const p = (v) => _.padStart(v, 2, "0");
      const m = Math.floor(time / 60);
      const s = time - m * 60;
      return `${p(m)}:${p(s)}`;
    },
  },
  data: () => ({
    alert: null,
    // Inputs
    timerMins: null,
    repeat: false,
    breakMins: null,
    // Timer state
    repeatable: false,
    onBreak: false,
    running: false,
    start: null,
    pause: null,
    total: 0,
    delta: 0,
    interval: null,
  }),
  computed: {
    progressPercent() {
      return parseInt((this.delta / this.total) * 100);
    },
    remainingSeconds() {
      return this.total - this.delta;
    },
    validInput() {
      return this.timerMins && (!this.repeat || this.breakMins);
    },
    isPaused() {
      return (
        this.total > 0 && !this.running && (this.pause || this.delta === 0)
      );
    },
    isDone() {
      return this.total > 0 && !this.running && !this.pause && this.delta > 0;
    },
  },
  created() {
    this.alert = new Audio(require("@/assets/alert.wav"));

    this.timer = this.sync.get("timer");
  },
  methods: {
    setTimer() {
      if (this.validInput) {
        this.repeatable = this.repeat;
        this.onBreak = false;
        this.running = false;
        this.start = null;
        this.pause = null;
        this.total = this.timerMins * 60;
        this.delta = 0;
        clearInterval(this.interval);
      }
    },
    startTimer() {
      if (this.total > 0) {
        this.running = true;

        this.start =
          this.start === null
            ? Date.now()
            : this.start + (Date.now() - this.pause);

        this.interval = setInterval(() => {
          this.delta = Math.floor((Date.now() - this.start) / 1000);

          if (this.total - this.delta <= 0) {
            this.alert.play();

            this.running = false;
            this.start = null;
            this.pause = null;
            clearInterval(this.interval);

            if (this.repeatable) {
              this.delta = 0;
              this.total = this.breakMins * 60;
              this.onBreak = !this.onBreak;
              this.startTimer();
            }
          }
        }, 100);
      }
    },
    pauseTimer() {
      this.running = false;
      this.pause = Date.now();
      clearInterval(this.interval);
    },
  },
};
</script>

<style scoped>
.blink {
  animation: blinker 1s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
