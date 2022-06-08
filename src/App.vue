<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.fs-08em {
  font-size: 0.8em !important;
}

.fs-09em {
  font-size: 0.9em !important;
}

.fs-1em {
  font-size: 1em !important;
}

.fs-2em {
  font-size: 2em !important;
}

.first-item-radius {
  border-top-left-radius: 20px !important;
  border-bottom-left-radius: 20px !important;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.last-item-radius {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  border-top-right-radius: 20px !important;
  border-bottom-right-radius: 20px !important;
}
</style>
