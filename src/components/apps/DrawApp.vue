<template>
  <div class="w-100 h-100">
    <svg id="drawapp-canvas" class="w-100 h-100"></svg>
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
  size: 12,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t) => t,
  start: {
    taper: 0,
    easing: (t) => t,
    cap: true,
  },
  end: {
    taper: 100,
    easing: (t) => t,
    cap: true,
  },
};

const getSvgStroke = (s) => getSvgPath(getStroke(s), strokeStyle);

export default {
  name: "DrawApp",
  props: {
    sync: Object,
  },
  data: () => ({
    svg: null,
    strokes: null,
    currentStroke: null,
  }),
  created() {
    this.$emit("setPadding", false);
    this.$emit("setHeaderButtons", [
      { icon: "trash2", callback: this.clear },
      { icon: "eraser", callback: this.undo },
    ]);
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
      event.changes.added.forEach((item) => {
        _.each(item.content.getContent(), this.renderStrokeLive);
      });
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
      stroke.get("path").observe(() => {
        svgPath.setAttribute("d", getSvgStroke(stroke.get("path").toArray()));
      });
      stroke.observe((event) => {
        if (event.keysChanged.has("color")) {
          svgPath.setAttribute("fill", stroke.get("color"));
        }
      });
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
    undo() {},
    clear() {},
    pointerDown(event) {
      this.currentStroke = new Y.Map();
      this.currentStroke.set("color", "#00FF00");
      const currentPath = new Y.Array();
      currentPath.push([[event.offsetX, event.offsetY, event.pressure]]);
      this.currentStroke.set("path", currentPath);
      this.strokes.push([this.currentStroke]);
    },
    pointerMove(event) {
      if (event.buttons !== 1) {
        this.currentStroke = null;
      } else {
        const path = [[event.offsetX, event.offsetY, event.pressure]];
        this.currentStroke.get("path").push(path);
      }
    },
  },
};
</script>
