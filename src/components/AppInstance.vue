<template>
  <div
    :id="`app-${app.component}`"
    class="card"
    style="position: absolute"
    @click="bringForward()"
    :class="{ 'd-none': window.minimized, 'border-info': isOnTop }"
  >
    <div
      class="
        drag-handler
        card-header
        user-select-none
        d-flex
        justify-content-between
        align-items-center
        p-0
      "
    >
      <div class="ps-2">
        <i class="bi" :class="`bi-${app.icon}`"></i>
        <span class="ps-2 text-uppercase fw-bold" style="font-size: 0.8em">{{
          app.title
        }}</span>
      </div>
      <div class="d-flex">
        <div class="d-flex flex-row-reverse">
          <div v-for="(button, i) in headerButtons" :key="i">
            <button
              class="btn btn-sm btn-muted h-100"
              v-if="button.callback"
              @click="button.callback"
            >
              <i :class="`bi bi-${button.icon}`"></i>
            </button>
          </div>
        </div>
        <div v-if="headerButtons.length > 0" class="vr my-2" />
        <button class="btn btn-sm btn-muted" @click="minimize()">
          <i class="bi bi-box-arrow-in-down-left"></i>
        </button>
      </div>
    </div>
    <div
      class="card-body overflow-auto"
      :class="[
        padding ? 'pt-1' : 'p-0',
        overflowAuto ? 'overflow-auto' : 'overflow-visible',
      ]"
    >
      <component
        :is="app.component"
        :sync="app.sync"
        :username="username"
        :awareness="awareness"
        @setHeaderButtons="headerButtons = clone($event)"
        @setPadding="padding = $event"
        @setOverflowAuto="overflowAuto = $event"
      />
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import * as _ from "lodash";
import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/resizable";
import "jquery-ui/themes/base/draggable.css";
import "jquery-ui/themes/base/resizable.css";

export default {
  name: "AppInstance",
  props: {
    app: Object,
    username: String,
    awareness: Object,
  },
  data: () => ({
    window: null,
    globalIndexZ: 0,
    padding: true,
    overflowAuto: true,
    headerButtons: [],
  }),
  watch: {
    window: {
      handler(newWin) {
        $(`#app-${this.app.component}`).css({
          width: newWin.width,
          height: newWin.height,
          top: newWin.top,
          left: newWin.left,
        });

        this.$emit("activate", !newWin.minimized);
        if (!newWin.minimized) this.bringForward();
      },
      deep: true,
    },
  },
  computed: {
    isOnTop() {
      const currentIndexZ = $(`#app-${this.app.component}`).css("zIndex");
      return Number(currentIndexZ) === Number(this.globalIndexZ);
    },
  },
  created() {
    this.$eventHub.$on("z-index", (newValue) => (this.globalIndexZ = newValue));

    this.window = this.app.sync.get("window") || {
      width: this.app.width,
      height: this.app.height,
      minWidth: this.app.minWidth || 10,
      minHeight: this.app.minHeight || 10,
      top: 68,
      left: 87,
      minimized: true,
      resizable: this.app.resizable !== undefined ? this.app.resizable : true,
    };

    this.$emit("activate", !this.window.minimized);

    $(document).ready(() => {
      const tp = _.throttle(this.move, 100);
      $(`#app-${this.app.component}`).draggable({
        drag: (e, ui) => tp(ui.position),
        handle: "div.drag-handler",
      });

      const ts = _.throttle(this.resize, 100);
      if (this.window.resizable) {
        $(`#app-${this.app.component}`).resizable({
          resize: (e, ui) => ts(ui.size),
          minWidth: this.app.minWidth,
          minHeight: this.app.minHeight,
        });
      }

      this.app.sync.observe((event) => {
        if (event.keysChanged.has("window")) {
          this.window = this.app.sync.get("window");
        }
      });
    });
  },
  methods: {
    move(position) {
      this.window.top = position.top;
      this.window.left = position.left;
      this.app.sync.set("window", this.window);
    },
    resize(size) {
      this.window.width = size.width;
      this.window.height = size.height;
      this.app.sync.set("window", this.window);
    },
    minimize() {
      this.window.minimized = true;
      this.app.sync.set("window", this.window);
    },
    toggleMinimize() {
      this.window.minimized = !this.window.minimized;
      this.app.sync.set("window", this.window);
    },
    restorePosition() {
      $(`#app-${this.app.component}`).css({ top: 68, left: 87 });
      this.window.top = 68;
      this.window.left = 87;
      this.app.sync.set("window", this.window);
    },
    bringForward() {
      const currentIndexZ = $(`#app-${this.app.component}`).css("zIndex");

      if (Number(currentIndexZ) !== Number(this.globalIndexZ)) {
        this.globalIndexZ++;
        $(`#app-${this.app.component}`).css("zIndex", this.globalIndexZ);
        this.$eventHub.$emit("z-index", this.globalIndexZ);
      }
    },
    clone(object) {
      return _.cloneDeep(object);
    },
  },
};
</script>

<style scoped>
.drag-handler {
  cursor: grabbing;
}

.card-header {
  background: white !important;
  border-bottom: 0;
}
</style>
