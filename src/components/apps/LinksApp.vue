<template>
  <div class="d-flex flex-column h-100">
    <div class="overflow-auto flex-grow-1">
      <draggable animation="200" v-model="linkFolders">
        <div
          v-for="(folder, i) in linkFolders"
          :key="i"
          :class="{ 'pb-2': folder.open }"
        >
          <div
            @mouseover="folderHover = i"
            @mouseleave="folderHover = false"
            class="d-flex flex-row justify-content-between clickable mt-1"
            :class="{ 'pb-2': folder.open }"
            @click="folder.open = !folder.open"
          >
            <div class="d-flex flex-row align-items-center">
              <i
                class="bi pe-2"
                :class="folder.open ? 'bi-folder' : 'bi-folder-symlink'"
              ></i>
              <div v-show="editItem !== i">
                <span v-show="folder.name">{{ folder.name }}</span>
                <span v-show="!folder.name" class="text-muted fst-italic">
                  empty
                </span>
              </div>
              <input
                :id="`links-folder-input-${i}`"
                v-show="editItem === i"
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
            </div>
            <div
              v-if="folderHover === i || editItem === i || deleteItem === i"
              class="pe-1"
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
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
          <draggable
            tag="ul"
            class="list-group"
            animation="200"
            group="links"
            v-model="folder.links"
            v-show="folder.open"
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
              @click="openLink(link.link)"
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
                      v-show="link.link"
                      :href="link.link"
                      target="_blank"
                      @click.prevent
                    >
                      {{ link.link }}
                    </a>
                    <span v-show="!link.link" class="text-muted fst-italic">
                      empty
                    </span>
                  </div>
                  <input
                    :id="`links-folder-input-${i}-${j}-l`"
                    v-show="editItem === `${i}-${j}`"
                    type="text"
                    class="form-control form-control-sm mt-3"
                    placeholder="URL"
                    @blur="editItem = false"
                    @keyup.enter="editItem = false"
                    @keyup.esc="editItem = false"
                    @change="changedItem()"
                    @click.stop
                    v-model="link.link"
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
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </li>
            <li
              v-if="folder.links.length === 0"
              class="
                list-group-item
                text-center
                pt-3
                pb-3
                text-muted text-uppercase
              "
              style="font-size: 0.8em"
            >
              Empty
            </li>
            <div v-if="linkHover === `${i}-${folder.links.length - 1}`">
              wow
            </div>
          </draggable>
        </div>
      </draggable>
      <div :class="{ 'pt-3': linkFolders.length > 0 }">
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
          <i class="bi bi-folder-plus"></i>
          <span v-show="linkFolders.length === 0">Add new folder</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "LinksApp",
  components: {
    draggable,
  },
  props: {
    sync: Object,
  },
  data: () => ({
    linkFolders: [
      {
        open: true,
        name: "default",
        links: [
          {
            title: "Dropdowns en bootstrap",
            link: "https://getbootstrap.com/docs/5.1/components/dropdowns/",
          },
          {
            title: "Ubuntu 22 descargar",
            link: "https://www.omgubuntu.co.uk/2022/04/ubuntu-22-04-lts-is-now-available-to-download",
          },
          {
            title: "Curso COBOL",
            link: "https://github.com/openmainframeproject/cobol-programming-course",
          },
        ],
      },
      {
        open: true,
        name: "otra cat",
        links: [
          {
            title: "Dropdowns en bootstrap 2",
            link: "https://getbootstrap.com/docs/5.1/components/dropdowns/",
          },
        ],
      },
      {
        open: true,
        name: "folder vacia",
        links: [],
      },
    ],
    linkHover: false,
    folderHover: false,
    editItem: false,
    deleteItem: false,
    discardDeleteTimeout: null,
  }),
  methods: {
    openLink(link) {
      window.open(link);
    },
    addFolder() {
      this.linkFolders.push({ open: true, name: "", links: [] });

      this.editItem = this.linkFolders.length - 1;

      this.$nextTick(() => {
        this.$el.querySelector(`#links-folder-input-${this.editItem}`).focus();
      });
    },
    editFolder(i) {
      this.editItem = i;

      this.$nextTick(() => {
        this.$el.querySelector(`#links-folder-input-${this.editItem}`).focus();
      });
    },
    editLink(j) {
      this.editItem = j;

      this.$nextTick(() => {
        this.$el.querySelector(`#links-folder-input-${this.editItem}`).focus();
      });
    },
    deleteFolder(i) {
      if (this.deleteItem === i) {
        this.linkFolders.splice(i, 1);

        this.deleteItem = false;
      } else {
        this.deleteItem = i;
        this.deleteTimeout();
      }
    },
    deleteLink(i, j) {
      if (this.deleteItem === `${i}-${j}`) {
        this.linkFolders[i].links.splice(j, 1);

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
    changedItem() {},
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
