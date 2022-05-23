<template>
  <div class="d-flex flex-row h-100 border border-muted rounded">
    <div
      class="d-flex flex-column h-100 border-end border-muted"
      style="width: 35%"
    >
      <div class="list-group flex-grow-1">
        <button
          type="button"
          class="
            list-group-item list-group-item-action
            border-0 border-bottom
            rounded-0
          "
          :class="{ active: editingNote === note }"
          v-for="(note, i) in noteList"
          :key="i"
          @click="editNote(i)"
        >
          {{ i }}
        </button>
      </div>
      <button
        class="btn btn-sm btn-primary p-0"
        style="border-radius: 0 0 0 5px"
        @click="addNote()"
      >
        <i class="bi bi-plus" />
      </button>
    </div>
    <div style="width: 65%">
      <div v-show="editingNote" class="h-100">
        <div id="note-editor" class="border-0"></div>
      </div>
      <div
        v-if="!editingNote"
        class="
          d-flex
          justify-content-center
          align-items-center
          h-100
          user-select-none
        "
      >
        <span class="text-uppercase" style="font-size: 0.8em; color: lightgray"
          >Select a note</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import * as Y from "yjs";
import { QuillBinding } from "y-quill";
import Quill from "quill";
import QuillCursors from "quill-cursors";

Quill.register("modules/cursors", QuillCursors);
const QUILL_CFG = { modules: { cursors: true, toolbar: false }, theme: "snow" };

export default {
  name: "NotesApp",
  props: {
    sync: Object,
    awareness: Object,
  },
  data: () => ({
    editingNote: null,
    notes: null,
    noteList: null,
    quill: null,
    quillBinding: null,
  }),
  created() {
    const init = () => {
      const newMap = new Y.Map();
      this.sync.set("notes", newMap);
      return newMap;
    };
    this.notes = this.sync.get("notes") || init();
    this.notes.observe(this.refreshNoteList);

    this.refreshNoteList();
  },
  mounted() {
    this.quill = new Quill(this.$el.querySelector("#note-editor"), QUILL_CFG);
    window.addEventListener("blur", this.blurEditor);
  },
  beforeDestroy() {
    window.removeEventListener("blur", this.blurEditor);
  },
  methods: {
    addNote() {
      this.notes.set(`${this.notes.size}`, new Y.Text());
    },
    editNote(i) {
      this.editingNote = this.notes.get(`${i}`);
      this.quillBinding = new QuillBinding(
        this.editingNote,
        this.quill,
        this.awareness
      );
    },
    blurEditor() {
      this.quill.blur();
    },
    refreshNoteList() {
      this.noteList = Array.from(this.notes.values());
    },
  },
};
</script>

<style scoped>
#note-editor {
  font-family: var(--bs-font-sans-serif);
  font-size: 1em;
}
</style>
I