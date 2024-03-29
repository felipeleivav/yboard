<template>
  <div class="d-flex flex-column h-100">
    <div class="overflow-auto flex-grow-1">
      <draggable
        animation="200"
        @change="draggableChange()"
        v-model="linkFolders"
      >
        <div
          v-for="(folder, i) in linkFolders"
          :key="i"
          :class="{ 'pb-2': folder.open }"
        >
          <div
            @mouseover="folderHover = i"
            @mouseleave="folderHover = false"
            class="d-flex flex-row justify-content-between clickable"
            @click="
              folder.open = !folder.open;
              changedItem();
            "
          >
            <div
              class="d-flex flex-row my-2 align-items-center"
              style="min-width: 0"
            >
              <i
                class="bi pe-2"
                :class="folder.open ? 'bi-folder' : 'bi-folder-symlink'"
              ></i>
              <div class="text-truncate" v-if="editItem !== i">
                <span v-if="folder.name">{{ folder.name }}</span>
                <span v-if="!folder.name" class="text-muted fst-italic">
                  empty
                </span>
              </div>
              <input
                :id="`links-folder-input-${i}`"
                v-if="editItem === i"
                type="text"
                class="form-control form-control-sm"
                placeholder="Folder name"
                @click.stop
                @blur="editItem = false"
                @keyup.enter="editItem = false"
                @keyup.esc="editItem = false"
                @change="changedItem()"
                v-model="folder.name"
              />
              <span
                v-if="folderHover === i && editItem !== i"
                class="badge rounded-circle bg-primary ms-2"
              >
                {{ folder.links.length }}
              </span>
            </div>
            <div
              v-if="(folderHover === i || deleteItem === i) && editItem !== i"
              class="pe-1 d-flex flex-row align-items-center"
            >
              <button
                class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
                @click.stop="editFolder(i)"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
                @click.stop="deleteFolder(i)"
                :class="{ 'btn-danger': deleteItem === i }"
              >
                <i class="bi bi-trash2"></i>
              </button>
              <div v-if="folder.links.length > 0" class="vr m-2" />
              <button
                v-if="folder.links.length > 0"
                class="btn btn-sm btn-primary py-0 px-1 ms-1 rounded"
                @click.stop="addLink(i)"
              >
                <i class="bi bi-bookmark-plus"></i>
              </button>
            </div>
          </div>
          <draggable
            tag="ul"
            class="list-group position-relative"
            animation="200"
            group="links"
            @change="draggableChange()"
            v-model="folder.links"
            v-show="folder.open"
            style="border-bottom-left-radius: 0; border-bottom-right-radius: 0"
          >
            <li
              v-for="(link, j) in folder.links"
              :key="j"
              class="
                list-group-item
                clickable
                d-flex
                flex-row
                justify-content-between
              "
              @mouseover="linkHover = `${i}-${j}`"
              @mouseleave="linkHover = false"
              @click="openLink(link.url)"
            >
              <div class="flex-grow-1" style="min-width: 0">
                <div v-show="editItem !== `${i}-${j}`" class="text-truncate">
                  <span v-show="link.title">{{ link.title }}</span>
                  <span v-show="!link.title" class="text-muted fst-italic">
                    empty
                  </span>
                </div>
                <input
                  :id="`links-folder-input-${i}-${j}`"
                  v-show="editItem === `${i}-${j}`"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Link description"
                  @keyup.enter="
                    $el.querySelector(`#links-folder-input-${i}-${j}-l`).focus()
                  "
                  @keyup.esc="editItem = false"
                  @change="changedItem()"
                  @click.stop
                  v-model="link.title"
                />
                <div class="d-flex flex-row" style="font-size: 0.8em">
                  <div class="text-truncate" v-show="editItem !== `${i}-${j}`">
                    <a
                      v-show="link.url"
                      :href="link.url"
                      target="_blank"
                      @click.prevent
                    >
                      {{ link.url }}
                    </a>
                    <span v-show="!link.url" class="text-muted fst-italic">
                      empty
                    </span>
                  </div>
                  <input
                    :id="`links-folder-input-${i}-${j}-l`"
                    v-show="editItem === `${i}-${j}`"
                    type="text"
                    class="form-control form-control-sm mt-3"
                    placeholder="URL"
                    @keyup.enter="editItem = false"
                    @keyup.esc="editItem = false"
                    @change="changedItem()"
                    @click.stop
                    v-model="link.url"
                  />
                </div>
              </div>
              <div
                v-if="
                  (linkHover === `${i}-${j}` && editItem !== `${i}-${j}`) ||
                  deleteItem === `${i}-${j}`
                "
                class="d-flex flex-row align-items-center"
              >
                <button
                  class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
                  @click.stop="editLink(`${i}-${j}`)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
                  :class="{ 'btn-danger': deleteItem === `${i}-${j}` }"
                  @click.stop="deleteLink(i, j)"
                >
                  <i class="bi bi-trash2"></i>
                </button>
              </div>
            </li>
            <button
              v-if="folder.links.length === 0"
              class="
                btn btn-sm btn-light
                w-100
                d-flex
                flex-column
                justify-content-center
              "
              style="border-color: #ddd"
              @click="addLink(i)"
            >
              <i class="bi bi-bookmark-plus w-100"></i>
              <span class="w-100 text-uppercase fs-08em"> Add link </span>
            </button>
          </draggable>
        </div>
      </draggable>
      <div v-if="!linkFolders || linkFolders.length === 0">
        <button
          class="
            btn btn-sm btn-light
            w-100
            d-flex
            flex-column
            justify-content-center
          "
          style="border-color: #ddd"
          @click="addFolder()"
        >
          <i class="bi bi-folder-plus w-100"></i>
          <span class="w-100 text-uppercase fs-08em"> Add folder </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

const DEFAULT_FOLDER = [{ open: true, name: "Main folder", links: [] }];

export default {
  name: "LinksApp",
  components: {
    draggable,
  },
  props: {
    sync: Object,
  },
  data: () => ({
    linkFolders: [],
    linkHover: false,
    folderHover: false,
    editItem: false,
    deleteItem: false,
    discardDeleteTimeout: null,
  }),
  watch: {
    linkFolders(newVal) {
      const iconBtn =
        newVal && newVal.length > 0
          ? [{ icon: "folder-plus", callback: this.addFolder }]
          : [];
      this.$emit("setHeaderButtons", iconBtn);
    },
  },
  created() {
    this.linkFolders = this.sync.get("folders") || DEFAULT_FOLDER;

    this.sync.observe((event) => {
      if (event.keysChanged.has("folders")) {
        this.linkFolders = this.sync.get("folders");
      }
    });
  },
  methods: {
    draggableChange() {
      this.editItem = false;
      this.deleteItem = false;
      this.sync.set("folders", this.linkFolders);
    },
    openLink(url) {
      if (url) window.open(url);
    },
    addFolder() {
      this.linkFolders.push({ open: true, name: "", links: [] });
      this.sync.set("folders", this.linkFolders);

      this.editItem = this.linkFolders.length - 1;
      this.focusOnEdit();
    },
    addLink(i) {
      this.linkFolders[i].links.push({ title: "", url: "" });
      this.sync.set("folders", this.linkFolders);

      this.editItem = `${i}-${this.linkFolders[i].links.length - 1}`;
      this.focusOnEdit();
    },
    editFolder(i) {
      this.editItem = i;
      this.focusOnEdit();
    },
    editLink(ij) {
      this.editItem = ij;
      this.focusOnEdit();
    },
    deleteFolder(i) {
      if (this.deleteItem === i) {
        this.linkFolders.splice(i, 1);
        this.sync.set("folders", this.linkFolders);
        this.deleteItem = false;
      } else {
        this.deleteItem = i;
        this.deleteTimeout();
      }
    },
    deleteLink(i, j) {
      if (this.deleteItem === `${i}-${j}`) {
        this.linkFolders[i].links.splice(j, 1);
        this.sync.set("folders", this.linkFolders);
        this.deleteItem = false;
      } else {
        this.deleteItem = `${i}-${j}`;
        this.deleteTimeout();
      }
    },
    deleteTimeout() {
      clearTimeout(this.discardDeleteTimeout);
      this.discardDeleteTimeout = setTimeout(() => {
        this.deleteItem = false;
      }, 5000);
    },
    focusOnEdit() {
      this.$nextTick(() => {
        this.$el.querySelector(`#links-folder-input-${this.editItem}`).focus();
      });
    },
    changedItem() {
      this.sync.set("folders", this.linkFolders);
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
