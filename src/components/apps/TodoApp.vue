<template>
  <div class="d-flex flex-column h-100">
    <div class="overflow-auto flex-grow-1">
      <draggable
        tag="ul"
        class="list-group"
        animation="200"
        @change="draggableChange()"
        v-model="tasks"
      >
        <li
          v-for="(task, i) in tasks"
          :key="i"
          :id="`task-${i}`"
          class="list-group-item d-flex flex-row align-items-center"
          @click="toggleTaskState(task)"
        >
          <input
            class="form-check-input me-1 me-2 flex-shrink-0"
            type="checkbox"
            :checked="task.done"
          />
          <span :class="{ 'task-done': task.done }">{{ task.name }}</span>
        </li>
      </draggable>
      <div
        v-if="tasks.length === 0"
        class="
          d-flex
          justify-content-center
          align-items-center
          h-100
          user-select-none
        "
      >
        <span class="text-uppercase fs-08em" style="color: lightgray">
          No tasks
        </span>
      </div>
    </div>
    <div class="d-flex pt-3">
      <div class="input-group">
        <input
          type="text"
          class="form-control first-item-radius"
          v-model="newTask"
          maxlength="50"
          placeholder="Enter task name..."
          @keyup.enter="addTask()"
        />
        <button class="btn btn-primary last-item-radius" @click="addTask()">
          <i class="bi bi-plus"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import draggable from "vuedraggable";

export default {
  name: "TodoApp",
  components: {
    draggable,
  },
  props: {
    sync: Object,
  },
  data: () => ({
    tasks: [],
    newTask: "",
  }),
  computed: {
    checkedTasks() {
      return _.some(this.tasks, { done: true });
    },
  },
  watch: {
    checkedTasks(newVal) {
      const iconBtn = newVal
        ? [{ icon: "trash2", callback: this.clearDoneTasks }]
        : [];
      this.$emit("setHeaderButtons", iconBtn);
    },
  },
  created() {
    this.tasks = this.sync.get("tasks") || [];

    this.sync.observe((event) => {
      if (event.keysChanged.has("tasks")) {
        this.tasks = this.sync.get("tasks");
      }
    });
  },
  methods: {
    draggableChange() {
      this.sync.set("tasks", this.tasks);
    },
    addTask() {
      if (this.newTask !== "") {
        this.tasks.push({ name: this.newTask, done: false });
        this.sync.set("tasks", this.tasks);
        this.newTask = "";
      }
    },
    toggleTaskState(task) {
      task.done = !task.done;
      this.sync.set("tasks", this.tasks);
    },
    clearDoneTasks() {
      this.tasks = _.filter(this.tasks, (t) => !t.done);
      this.sync.set("tasks", this.tasks);
    },
  },
};
</script>

<style scoped>
.task-done {
  text-decoration: line-through;
  color: gray;
}
</style>
