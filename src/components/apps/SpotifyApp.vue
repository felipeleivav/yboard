<template>
  <div id="spotify-app-container" class="bg-black" style="height: 100%">
    <iframe
      v-if="embedUrl"
      :src="embedUrl"
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
        id="spotifyapp-playlist-url"
        type="text"
        placeholder="Spotify playlist URL..."
        class="flex-grow-1 form-control"
        :class="{ 'is-invalid': invalidPlaylistUrl }"
        v-model="playlistUrl"
        @keyup.enter="setPlaylist(true)"
        @keyup.esc="togglePlaylistChange()"
      />

      <div
        class="invalid-tooltip fs-08em py-0 px-2 rounded-pill"
        style="top: 70%"
      >
        Invalid playlist URL
      </div>
      <button class="btn btn-sm btn-dark" @click="setPlaylist(true)">
        <i class="bi bi-disc"></i>
      </button>
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
import * as _ from "lodash";
import { Modal } from "bootstrap";

const DEFAULT_PL = "https://open.spotify.com/playlist/7hvzAFo7QOpfQ8ebQzXoj4";
const SPOTIFY_ORIGIN = "https://open.spotify.com";

export default {
  name: "SpotifyApp",
  props: {
    sync: Object,
  },
  data: () => ({
    warningModal: null,
    displayPlaylistChange: false,
    playlistUrl: null,
    embedUrl: null,
    invalidPlaylistUrl: false,
  }),
  watch: {
    displayPlaylistChange(newVal) {
      if (!newVal) {
        if (this.invalidPlaylistUrl) {
          this.playlistUrl = null;
          this.invalidPlaylistUrl = false;
        }
      }
    },
  },
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

    this.playlistUrl = this.sync.get("playlistUrl") || DEFAULT_PL;
    this.setPlaylist();
    if (this.playlistUrl === DEFAULT_PL) this.playlistUrl = "";

    this.sync.observe((event) => {
      if (event.keysChanged.has("playlistUrl")) {
        const aux = this.sync.get("playlistUrl");
        if (aux !== this.playlistUrl) {
          this.playlistUrl = aux;
          this.setPlaylist();
        }
      }
    });
  },
  methods: {
    showWarning() {
      this.warningModal.toggle();
      // a little trick to display modal inside app container instead of viewport...
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

      if (this.displayPlaylistChange) {
        this.$nextTick(() =>
          this.$el.querySelector("#spotifyapp-playlist-url").focus()
        );
      }
    },
    setPlaylist(sync = false) {
      try {
        if (!this.playlistUrl) throw new Error();
        const spotifyUrl = new URL(this.playlistUrl);
        if (spotifyUrl.origin !== SPOTIFY_ORIGIN) throw new Error();
        const [type, id] = _.slice(_.split(spotifyUrl.pathname, "/"), 1);
        this.embedUrl = `https://open.spotify.com/embed/${type}/${id}?theme=0`;
        this.invalidPlaylistUrl = false;
        if (sync) this.sync.set("playlistUrl", this.playlistUrl);
        this.displayPlaylistChange = false;
      } catch (e) {
        this.invalidPlaylistUrl = true;
      }
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