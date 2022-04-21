<template>
  <div class="d-flex flex-column h-100">
    <div class="overflow-auto flex-grow-1">
      <ul id="todo-list" class="list-group" style="height: 50px" :key="listKey">
        <li
          v-for="(task, i) in tasks"
          :key="i"
          :id="`task-${i}`"
          class="list-group-item"
          @click="toggleTaskState(task)"
        >
          <input
            class="form-check-input me-1 me-2"
            type="checkbox"
            :checked="task.done"
          />
          <span :class="{ 'task-done': task.done }">{{ task.name }}</span>
        </li>
      </ul>
    </div>
    <button
      v-if="checkedTasks"
      type="button"
      class="btn btn-link btn-sm m-0 p-0"
      @click="clearDoneTasks()"
    >
      Clear finished
    </button>
    <div class="d-flex pt-3">
      <input
        type="text"
        class="form-control"
        v-model="newTask"
        maxlength="50"
        placeholder="Enter task name..."
        @keyup.enter="addTask()"
      />
      <button class="btn btn-primary ms-3" @click="addTask()">Add</button>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
import $ from "jquery";
import "jquery-ui/ui/widgets/sortable";
import "jquery-ui/themes/base/sortable.css";

export default {
  name: "TodoApp",
  props: {
    sync: Object,
  },
  data: () => ({
    tasks: [],
    newTask: "",
    listKey: 0,
  }),
  computed: {
    checkedTasks() {
      return _.some(this.tasks, { done: true });
    },
  },
  created() {
    this.tasks = this.sync.get("tasks") || [];

    this.sync.observe((event) => {
      if (event.keysChanged.has("tasks")) {
        this.tasks = this.sync.get("tasks");
      }
    });

    $(document).ready(() => {
      this.initSortability();
    });
  },
  methods: {
    initSortability() {
      $("#todo-list").sortable({
        helper: "clone", // w1
        update: () => {
          const list = $("#todo-list").sortable("toArray");
          const indexes = _.map(list, (t) => Number(_.split(t, "-")[1]));
          this.tasks = _.map(indexes, (i) => this.tasks[i]);
          this.sync.set("tasks", this.tasks);
          this.listKey += 1; // w2
          this.$nextTick(() => {
            this.initSortability(); // w3
          });
          // this is a workaround(3) for a workaround(2) for another workaround(1)
          // w1 - with cloned items (helper:clone) we prevent tasks being checked after sorting them
          // w2 - with helper:clone items were left incorrectly ordered, so we force
          //      a re-render by updating <ul>'s :key attribute
          // w3 - re-rendering the whole <ul> removes sortability, so we have to invoke
          //      sortable() again inside a $nextTick() in order to get the correct :key
        },
      });
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
