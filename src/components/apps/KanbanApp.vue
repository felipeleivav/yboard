<template>
  <div class="d-flex flex-row h-100">
    <draggable
      tag="ul"
      class="d-flex flex-row h-100 ps-0"
      animation="200"
      @change="draggableChange()"
      v-model="kanbanColumns"
    >
      <li
        v-for="(column, i) in kanbanColumns"
        :key="i"
        :id="`col-${i}`"
        class="card kanban-column me-3 d-flex flex-column"
        @mouseover="showAddTask = i"
        @mouseleave="showAddTask = false"
      >
        <div
          class="card-header fw-bolder d-flex flex-row justify-content-between"
          @mouseover="showItemOptions = i"
          @mouseleave="showItemOptions = false"
        >
          <div v-show="editItem !== i">
            <span v-show="column.name">{{ column.name }}</span>
            <span v-show="!column.name" class="text-muted fst-italic">
              empty
            </span>
          </div>
          <input
            :id="`kanban-input-${i}`"
            v-show="editItem === i"
            type="text"
            class="form-control form-control-sm"
            placeholder="Column name"
            @blur="editItem = false"
            @keyup.enter="editItem = false"
            @keyup.esc="editItem = false"
            @change="changedItem()"
            v-model="column.name"
          />

          <div
            v-show="
              (showItemOptions === i && editItem !== i) || deleteItem === i
            "
          >
            <button
              class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
              @click="editAnItem(i)"
            >
              <i class="bi bi-pencil" />
            </button>
            <button
              class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
              @click="deleteAColumn(i)"
              :class="{ 'btn-danger': deleteItem === i }"
            >
              <i class="bi bi-trash3" />
            </button>
          </div>
        </div>
        <draggable
          tag="ul"
          class="
            list-group list-group-flush
            kanban-column-tasks
            flex-grow-1
            border-bottom-0
          "
          animation="200"
          group="tasks"
          @change="draggableChange()"
          v-model="column.tasks"
        >
          <li
            v-for="(task, j) in column.tasks"
            :key="j"
            class="
              list-group-item
              d-flex
              flex-row
              justify-content-between
              task-item
            "
            @mouseover="showItemOptions = `${i}-${j}`"
            @mouseleave="showItemOptions = false"
          >
            <div v-show="editItem !== `${i}-${j}`">
              <span v-show="task.name">{{ task.name }}</span>
              <span v-show="!task.name" class="text-muted fst-italic">
                empty
              </span>
            </div>
            <input
              :id="`kanban-input-${i}-${j}`"
              v-show="editItem === `${i}-${j}`"
              type="text"
              class="form-control form-control-sm"
              placeholder="Task name"
              @blur="editItem = false"
              @keyup.enter="editItem = false"
              @keyup.esc="editItem = false"
              @change="changedItem()"
              v-model="task.name"
            />
            <div
              v-show="
                (showItemOptions === `${i}-${j}` && editItem !== `${i}-${j}`) ||
                deleteItem === `${i}-${j}`
              "
            >
              <button
                class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
                @click="editAnItem(`${i}-${j}`)"
              >
                <i class="bi bi-pencil" />
              </button>
              <button
                class="btn btn-sm btn-muted py-0 px-1 rounded-circle"
                :class="{ 'btn-danger': deleteItem === `${i}-${j}` }"
                @click="deleteAnItem(i, j)"
              >
                <i class="bi bi-trash3" />
              </button>
            </div>
          </li>
        </draggable>
        <button
          class="btn btn-muted p-0"
          style="border-radius: 0 0 5px 5px"
          v-show="showAddTask === i"
          @click="addTaskToColumn(column, i)"
        >
          <i class="bi bi-plus-circle" />
        </button>
      </li>
    </draggable>
    <div class="pe-3">
      <button
        class="btn btn-light h-100 d-flex flex-column justify-content-center"
        style="border-color: #ddd"
        @click="addColumn()"
      >
        <i class="bi bi-plus-circle"></i>
        <span v-show="kanbanColumns.length === 0">Add new column</span>
      </button>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";

export default {
  name: "KanbanApp",
  components: {
    draggable,
  },
  props: {
    sync: Object,
  },
  data: () => ({
    kanbanColumns: [],
    showAddTask: false,
    showItemOptions: false,
    editItem: false,
    deleteItem: false,
    discardDeleteTimeout: null,
    colKey: 0,
  }),
  created() {
    this.kanbanColumns = this.sync.get("columns") || [];

    this.sync.observe((event) => {
      if (event.keysChanged.has("columns")) {
        this.kanbanColumns = this.sync.get("columns");
      }
    });
  },
  methods: {
    draggableChange() {
      this.editItem = false;
      this.deleteItem = false;

      this.sync.set("columns", this.kanbanColumns);
    },
    addColumn() {
      this.kanbanColumns.push({ name: "", tasks: [] });
      this.sync.set("columns", this.kanbanColumns);

      this.editItem = this.kanbanColumns.length - 1;

      this.$nextTick(() => {
        this.$el.querySelector(`#kanban-input-${this.editItem}`).focus();
      });
    },
    addTaskToColumn(column, i) {
      column.tasks.push({ name: "" });
      this.sync.set("columns", this.kanbanColumns);

      this.editItem = `${i}-${column.tasks.length - 1}`;

      this.$nextTick(() => {
        this.$el.querySelector(`#kanban-input-${this.editItem}`).focus();
      });
    },
    editAnItem(columnTask) {
      this.editItem = columnTask;

      this.$nextTick(() => {
        this.$el.querySelector(`#kanban-input-${this.editItem}`).focus();
      });
    },
    deleteAColumn(i) {
      if (this.deleteItem === i) {
        this.kanbanColumns.splice(i, 1);
        this.sync.set("columns", this.kanbanColumns);

        this.deleteItem = false;
      } else {
        this.deleteItem = i;
        this.deleteTimeout();
      }
    },
    deleteAnItem(i, j) {
      if (this.deleteItem === `${i}-${j}`) {
        this.kanbanColumns[i].tasks.splice(j, 1);
        this.sync.set("columns", this.kanbanColumns);

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
    changedItem() {
      this.sync.set("columns", this.kanbanColumns);
    },
  },
};
</script>

<style scoped>
.kanban-column {
  width: 220px;
  min-width: 200px;
}

.task-item {
  border-top: 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 1px solid #ddd !important;
}
</style>
