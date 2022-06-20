<template>
  <div class="h-100">
    <div class="w-100 h-100">
      <svg id="drawapp-canvas" class="w-100 h-100"></svg>
    </div>

    <div
      v-if="showPalette"
      class="d-flex flex-row justify-content-center w-100"
      style="position: absolute; bottom: -40px"
    >
      <div class="input-group w-auto" v-if="!paletteEdition">
        <button
          v-for="color in colors"
          :key="color"
          class="btn btn-sm btn-dark w-auto"
          :style="{
            color,
            'border-bottom':
              selectedColor === color ? `2px solid ${color}` : 'none  ',
          }"
          @click="selectedColor = color"
        >
          <i class="bi bi-circle-fill"></i>
        </button>
        <button
          class="btn btn-sm btn-dark w-auto"
          @click="
            inputPalette = palette;
            paletteEdition = true;
            $nextTick(() => {
              $el.querySelector('#drawapp-input-palette').focus();
            });
          "
        >
          <i class="bi bi-hash"></i>
        </button>
      </div>
      <div class="input-group w-75" v-if="paletteEdition">
        <input
          id="drawapp-input-palette"
          type="text"
          placeholder="#00FF00, #BDBDBD..."
          class="flex-grow-1 form-control form-control-sm"
          v-model="inputPalette"
          @keyup.enter="savePalette()"
          @keyup.esc="paletteEdition = false"
        />
        <button class="btn btn-sm btn-dark" @click="savePalette()">
          <i class="bi bi-arrow-return-left"></i>
        </button>
        <button class="btn btn-sm btn-dark" @click="restorePalette()">
          <i class="bi bi-arrow-counterclockwise"></i>
        </button>
        <button class="btn btn-sm btn-dark" @click="paletteEdition = false">
          <i class="bi bi-x"></i>
        </button>
        <a
          class="btn btn-sm btn-dark text-uppercase fw-bold fs-08em"
          href="https://www.colourlovers.com/palettes"
          target="_blank"
        >
          <i class="bi bi-box-arrow-up-right pe-1"></i> More palettes
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import * as Y from "yjs";
import * as _ from "lodash";
import { getStroke } from "perfect-freehand";

// this app is based on dmonad's Awesome Drawing App
// https://replit.com/@dmonad/Awesome-Drawing-App#script.js
// actually, this whole thing is based on dmonad's awesome Yjs library

const getSvgPath = (stroke) => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};

const strokeStyle = {
  size: 8,
  thinning: 0,
  smoothing: 0.9,
  streamline: 0.9,
  easing: (t) => t,
  start: {
    taper: 0,
    easing: (t) => t,
    cap: true,
  },
  end: {
    taper: 0,
    easing: (t) => t,
    cap: true,
  },
};

const getSvgStroke = (s) => getSvgPath(getStroke(s, strokeStyle));

const DEFAULT_PALETTE = "#2470C4, #E67E22, #F1C40F, #E74C3C, #01C94F, #000000";

export default {
  name: "DrawApp",
  props: {
    sync: Object,
  },
  data: () => ({
    svg: null,
    strokes: null,
    currentStroke: null,
    showPalette: false,
    palette: "",
    colors: [],
    selectedColor: null,
    paletteEdition: false,
    inputPalette: "",
  }),
  created() {
    this.$emit("setPadding", false);
    this.$emit("setHeaderButtons", [
      { icon: "trash2", callback: this.clear },
      { icon: "eraser", callback: this.undo },
      {
        icon: "palette",
        callback: this.togglePalette,
      },
    ]);

    const init = () => {
      this.sync.set("palette", DEFAULT_PALETTE);
      return this.sync.get("palette");
    };
    this.palette = this.sync.get("palette") || init();
    this.colors = _.uniq(_.map(_.split(this.palette, ","), _.trim));
    this.selectedColor = this.colors[0];

    this.sync.observe((event) => {
      if (event.keysChanged.has("palette")) {
        this.colors = _.uniq(
          _.map(_.split(this.sync.get("palette"), ","), _.trim)
        );
        this.selectedColor = this.colors[0];
      }
    });
  },
  mounted() {
    this.svg = this.$el.querySelector("#drawapp-canvas");

    const init = () => {
      const newArr = new Y.Array();
      this.sync.set("strokes", newArr);
      return newArr;
    };
    this.strokes = this.sync.get("strokes") || init();
    _.each(this.strokes.toArray(), this.renderStroke);

    this.strokes.observe((event) => {
      if (event.changes.deleted.size > 0) {
        this.$el
          .querySelectorAll("#drawapp-canvas path")
          .forEach((p) => p.remove());
        _.each(this.strokes.toArray(), this.renderStroke);
        // todo: this could be optimized by removing only the deleted path (add ids to path?)
      } else {
        event.changes.added.forEach((item) => {
          _.each(item.content.getContent(), this.renderStrokeLive);
        });
      }
    });

    this.svg.addEventListener("pointerdown", this.pointerDown);
    this.svg.addEventListener("pointermove", this.pointerMove);
  },
  beforeDestroy() {
    this.svg.removeEventListener("pointerdown", this.pointerDown);
    this.svg.removeEventListener("pointermove", this.pointerMove);
  },
  methods: {
    renderStroke(stroke) {
      const svgPath = this.createSVGPath(stroke.get("color"));
      svgPath.setAttribute("d", getSvgStroke(stroke.get("path").toArray()));
    },
    renderStrokeLive(stroke) {
      const svgPath = this.createSVGPath(stroke.get("color"));
      svgPath.setAttribute("d", getSvgStroke(stroke.get("path").toArray()));
      stroke.get("path").observe(() => {
        svgPath.setAttribute("d", getSvgStroke(stroke.get("path").toArray()));
      });
      stroke.observe((event) => {
        if (event.keysChanged.has("color")) {
          svgPath.setAttribute("fill", stroke.get("color"));
        }
      });
    },
    undo() {
      if (this.strokes.length > 0) {
        this.strokes.delete(this.strokes.length - 1, 1);
      }
    },
    clear() {
      this.strokes.delete(0, this.strokes.length);
    },
    pointerDown(event) {
      this.currentStroke = new Y.Map();
      this.currentStroke.set("color", this.selectedColor);
      const currentPath = new Y.Array();
      currentPath.push([[event.offsetX, event.offsetY, event.pressure]]);
      this.currentStroke.set("path", currentPath);
      this.strokes.push([this.currentStroke]);
    },
    pointerMove(event) {
      if (event.buttons !== 1) {
        this.currentStroke = null;
      } else if (this.currentStroke) {
        const path = [[event.offsetX, event.offsetY, event.pressure]];
        this.currentStroke.get("path").push(path);
      }
    },
    createSVGPath(color) {
      const svgPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      svgPath.setAttribute("fill", color);
      this.svg.appendChild(svgPath);
      return svgPath;
    },
    togglePalette() {
      this.showPalette = !this.showPalette;
    },
    savePalette() {
      this.sync.set("palette", this.inputPalette);
      this.paletteEdition = false;
    },
    restorePalette() {
      this.sync.set("palette", DEFAULT_PALETTE);
      this.paletteEdition = false;
    },
  },
};
</script>
