<template>
  <div id="spotify-app-container" class="bg-black" style="height: 100%">
    <iframe
      style="border-radius: 12px"
      src="https://open.spotify.com/embed/playlist/7hvzAFo7QOpfQ8ebQzXoj4?utm_source=generator&theme=0"
      width="100%"
      height="100%"
      frameBorder="0"
      allowfullscreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    ></iframe>

    <div
      v-if="displayPlaylistChange"
      class="bg-light border border-info rounded d-flex flex-row input-group"
    >
      <input
        type="text"
        placeholder="Spotify playlist URL..."
        class="flex-grow-1 form-control"
      />
      <button class="btn btn-sm btn-dark"><i class="bi bi-disc"></i></button>
      <button class="btn btn-sm btn-dark" @click="togglePlaylistChange()">
        <i class="bi bi-x"></i>
      </button>
    </div>

    <div class="modal fade" id="warningModal" style="z-index: 99999">
      <div class="modal-dialog modal-dialog-centered justify-content-center">
        <div class="modal-content w-75">
          <div class="modal-header border-0 py-2 px-3">
            <div class="modal-title user-select-none">
              <div><i class="bi bi-emoji-frown fs-2em"></i></div>
              <div class="pb-2">
                Playback synchronization between multiple users is still a work
                in progress.
              </div>
              <div class="pb-2">Future releases may include this feature.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
import { Modal } from "bootstrap";

export default {
  name: "SpotifyApp",
  props: {
    sync: Object,
  },
  data: () => ({
    warningModal: null,
    displayPlaylistChange: false,
  }),
  created() {
    this.$emit("setPadding", false);
    this.$emit("setOverflowAuto", false);
    this.$emit("setHeaderButtons", [
      { icon: "music-note-list", callback: this.togglePlaylistChange },
      { icon: "exclamation-triangle", callback: this.showWarning },
    ]);

    $(document).ready(() => {
      if (document.getElementById("warningModal"))
        this.warningModal = new Modal(document.getElementById("warningModal"));
    });
  },
  methods: {
    showWarning() {
      this.warningModal.toggle();
      // a little trick to display modal inside app container...
      $("#spotify-app-container").addClass("after-modal-appended");
      $(".modal-backdrop").appendTo("#spotify-app-container");
      $(".modal-backdrop").css({
        position: "absolute",
        width: "100%",
        height: "100%",
      });
      $("body").removeClass("modal-open");
    },
    togglePlaylistChange() {
      this.displayPlaylistChange = !this.displayPlaylistChange;
    },
  },
};
</script>

<style scoped>
.modal {
  position: absolute !important;
}

.after-modal-appended {
  position: relative;
}
</style>