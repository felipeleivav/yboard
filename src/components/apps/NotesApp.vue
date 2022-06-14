<template>
  <div class="d-flex flex-row h-100 border-top border-muted rounded-bottom">
    <div
      v-if="showNotes"
      class="d-flex flex-column h-100 border-end border-muted"
      style="width: 35%; max-width: 170px"
      @mouseover="notesHover = true"
      @mouseleave="notesHover = false"
    >
      <div class="list-group flex-grow-1 rounded-0 overflow-auto">
        <button
          type="button"
          class="
            list-group-item list-group-item-action
            border-0 border-bottom
            rounded-0
            d-flex
            flex-row
          "
          v-for="{ id, note, title } in noteList"
          :key="id"
          :class="{ active: editingNote === note }"
          @click="editNote(id)"
          @mouseover="noteHover = id"
          @mouseleave="noteHover = false"
        >
          <div v-if="title" class="flex-grow-1 text-truncate">
            {{ title }}
          </div>
          <div
            v-else
            class="flex-grow-1 text-truncate fst-italic"
            :class="editingNote === note ? 'text-white' : 'text-muted'"
          >
            write here
          </div>
          <!-- todo: refactor this, too many method calls -->
          <span
            v-if="
              getNoteUserCount(id) > 0 && noteHover !== id && deleteItem !== id
            "
            class="badge rounded-pill bg-secondary"
          >
            <i
              class="bi"
              :class="
                getNoteUserCount(id) > 1 ? 'bi-people-fill' : 'bi-person-fill'
              "
            ></i>
            {{ getNoteUserCount(id) > 1 ? getNoteUserCount(id) : "" }}
          </span>
          <button
            v-if="noteHover === id || deleteItem === id"
            class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
            @click.stop="deleteNote(id, note)"
            :class="{
              'btn-danger': deleteItem === id,
              'text-white': editingNote === note,
            }"
          >
            <i class="bi bi-trash2"></i>
          </button>
        </button>
      </div>
      <button
        v-show="notesHover || !noteList || noteList.length === 0"
        class="btn btn-sm btn-primary p-0"
        style="border-radius: 0 0 0 5px"
        @click="addNote()"
      >
        <i class="bi bi-plus" />
      </button>
    </div>
    <div :style="{ width: showNotes ? '65%' : '100%' }">
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
        <span class="text-uppercase" style="font-size: 0.8em; color: lightgray">
          Select a note
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import * as Y from "yjs";
import * as _ from "lodash";
import Quill from "quill";
import { QuillBinding } from "y-quill";
import QuillCursors from "quill-cursors";
import { nanoid } from "nanoid";

Quill.register("modules/cursors", QuillCursors);
const QUILL_CFG = { modules: { cursors: true, toolbar: false }, theme: "snow" };

export default {
  name: "NotesApp",
  props: {
    sync: Object,
    awareness: Object,
    username: String,
  },
  data: () => ({
    editingNote: null,
    notes: null,
    noteList: null,
    quill: null,
    quillBinding: null,
    usersPerNote: null,
    // ui mechanics
    notesHover: false,
    noteHover: false,
    deleteItem: null,
    discardDeleteTimeout: null,
    showNotes: null,
    icons: [{}, {}],
  }),
  watch: {
    editingNote: {
      handler() {
        this.refreshNoteList();
        this.togglePinButton();
      },
      deep: true,
    },
    showNotes() {
      const icon = this.showNotes ? "chevron-bar-left" : "chevron-right";
      this.icons[0] = { icon, callback: this.toggleNotes };
      this.$emit("setHeaderButtons", this.icons);
    },
  },
  created() {
    this.$emit("setPadding", false);

    const init = () => {
      const newMap = new Y.Map();
      this.sync.set("notes", newMap);
      return newMap;
    };
    this.notes = this.sync.get("notes") || init();
    this.notes.observe(this.refreshNoteList);

    this.refreshNoteList();

    this.showNotes = true; // trigger watcher

    this.awareness.on("change", () => {
      const states = _.filter(
        Array.from(this.awareness.getStates().values()),
        (s) => s.noteId && s.cursor && s.user.name !== this.username
      );
      this.usersPerNote = _.countBy(states, "noteId");
    });
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
      this.notes.set(nanoid(), new Y.Text());
    },
    editNote(id) {
      if (this.editingNote === this.notes.get(id)) {
        this.killQuill();
        this.editingNote = null;
      } else {
        this.killQuill();
        this.editingNote = this.notes.get(id);
        this.quillBinding = new QuillBinding(
          this.editingNote,
          this.quill,
          this.awareness
        );
        this.awareness.setLocalStateField("noteId", id);
      }
    },
    deleteNote(id, note) {
      if (this.deleteItem === id) {
        if (note === this.editingNote) this.killQuill();
        this.notes.delete(id);
        this.editingNote = null;
        this.deleteItem = false;
      } else {
        this.deleteItem = id;
        this.deleteTimeout();
      }
    },
    getNoteUserCount(id) {
      return _.has(this.usersPerNote, id) ? this.usersPerNote[id] : 0;
    },
    blurEditor() {
      this.quill.blur();
    },
    refreshNoteList() {
      this.noteList = _.map(Array.from(this.notes.entries()), ([id, note]) => ({
        id,
        note,
        title: note.toString().split("\n", 1)[0],
      })).sort((n1, n2) => {
        const s1 = _.startsWith(n1.title, "📌");
        const s2 = _.startsWith(n2.title, "📌");
        return s1 && !s2 ? -1 : !s1 && s2 ? 1 : 0;
      });
    },
    deleteTimeout() {
      clearTimeout(this.discardDeleteTimeout);
      this.discardDeleteTimeout = setTimeout(() => {
        this.deleteItem = false;
      }, 5000);
    },
    toggleNotes() {
      this.showNotes = !this.showNotes;
    },
    killQuill() {
      if (this.quillBinding) {
        this.quillBinding.destroy();
        this.quillBinding = null;
      }
    },
    togglePinButton() {
      const title = this.editingNote?.toString().split("\n", 1)[0];
      if (this.editingNote && !_.startsWith(title, "📌")) {
        this.icons[1] = { icon: "pin", callback: this.pinCurrentNote };
        this.$emit("setHeaderButtons", this.icons);
      } else {
        this.icons[1] = {};
        this.$emit("setHeaderButtons", this.icons);
      }
    },
    pinCurrentNote() {
      this.editingNote.insert(0, "📌 ");
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
