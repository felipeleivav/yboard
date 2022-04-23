<template>
  <div class="d-flex flex-column h-100">
    <div class="overflow-auto flex-grow-1"></div>
    <div class="d-flex pt-3 justify-content-between">
      <div class="input-group">
        <span class="input-group-text">
          <i class="bi bi-stopwatch"></i>
        </span>
        <input type="text" class="form-control" placeholder="Mins" />
      </div>
      <div class="input-group ms-3">
        <div class="input-group-text">
          <input
            class="form-check-input mt-0"
            type="checkbox"
            v-model="repeat"
          />
          <i class="bi bi-arrow-repeat ps-2"></i>
        </div>
        <input
          :disabled="!repeat"
          type="text"
          class="form-control"
          placeholder="Mins"
        />
      </div>
      <div class="dropdown ms-3">
        <button
          class="btn btn-dark dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
        >
          <i
            class="bi pe-1"
            :class="forWho === 'me' ? 'bi-person-fill' : 'bi-people-fill'"
          ></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-dark">
          <li>
            <a class="dropdown-item" role="button" @click="forWho = 'me'">
              <i class="bi bi-person-fill"></i> Just for me
            </a>
          </li>
          <li>
            <a class="dropdown-item" role="button" @click="forWho = 'all'">
              <i class="bi bi-people-fill"></i> For everyone
            </a>
          </li>
        </ul>
      </div>
      <button class="btn btn-primary ms-3">Add</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "TimerApp",
  data: () => ({
    mins: null,
    repeat: false,
    repeatMins: null,
    forWho: "me",
  }),
};
</script>