<template>
  <div class="room-container" :style="backgroundAttr">
    <div id="bg-playback-container" v-if="background.type === 'youtube'">
      <iframe
        id="bg-playback"
        allowfullscreen="1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title="YouTube Playback"
        :src="`https://www.youtube.com/embed/${youtubeId}?autoplay=1&amp;controls=0&amp;start=10&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;iv_load_policy=3&amp;modestbranding=1&amp;loop=1&amp;enablejsapi=1&amp;widgetid=1`"
        width="100%"
        height="100%"
        frameborder="0"
      ></iframe>
    </div>

    <div class="loading-overlay" v-if="!apps">
      <div class="spinner-border text-light" role="status"></div>
      <div class="pt-3"><p class="text-white">Connecting to room...</p></div>
    </div>

    <div class="titlebar-container d-flex flex-column">
      <div class="d-flex">
        <button class="btn btn-sm btn-dark border border-light rounded fw-bold">
          YB
        </button>
        <div class="vr mx-3" />
        <button
          v-show="!editTitle"
          class="btn btn-sm btn-muted font-monospace bg-light fw-bold"
          @mouseover="showEditTitle = true"
          @mouseleave="showEditTitle = false"
          @click="
            editTitle = true;
            $nextTick(() => $el.querySelector('#room-title-input').focus());
          "
        >
          {{ description }}
          <i v-show="showEditTitle" class="bi bi-pencil ms-2 fs-08em"></i>
        </button>
        <input
          id="room-title-input"
          v-show="editTitle"
          type="text"
          class="form-control form-control-sm font-monospace"
          placeholder="Room's description"
          v-model="description"
          @blur="editTitle = false"
          @keyup.enter="editTitle = false"
          @keyup.esc="editTitle = false"
          size="100"
          style="width: 400px"
        />
      </div>
    </div>

    <div class="settings-button-container">
      <div class="btn-group-vertical pt-3">
        <button
          class="btn btn-sm btn-light border fs-08em"
          @click="openSettings()"
        >
          <i class="bi bi-sliders"></i>
        </button>
        <button
          class="btn btn-sm btn-light border fs-08em"
          @click="minimizeAll()"
        >
          <i class="bi bi-box-arrow-in-down-left"></i>
        </button>
      </div>
    </div>

    <div class="toolbar-container">
      <div class="btn-group-vertical border border-muted bg-light rounded">
        <button
          v-for="(app, i) in apps"
          :key="i"
          type="button"
          class="btn app-button border-0"
          :class="{ 'btn-dark': app.active, 'btn-muted': !app.active }"
          @click="toggleMinimize(app)"
        >
          <i class="bi" :class="`bi-${app.icon} w-100`"></i>
          <span class="app-title w-100">{{ app.title }}</span>
        </button>
      </div>
    </div>

    <div
      v-for="userState in users"
      :key="userState.id"
      :id="`cursor-${userState.id}`"
      class="d-flex flex-column text-center user-cursor"
    >
      <i class="bi bi-cursor-fill"></i>
      <span>{{ userState.user.name }}</span>
    </div>

    <div class="awareness-container">
      <img
        class="me-1"
        style="border-radius: 30px"
        v-for="userState in users"
        :key="userState.id"
        v-tooltip.bottom="`${userState.user.name}`"
        :src="`https://ui-avatars.com/api/?name=${userState.user.name}&background=random&size=24&bold=true`"
      />
      <img
        style="border: 2px orange solid; border-radius: 30px"
        :src="`https://ui-avatars.com/api/?name=${username}&background=random&size=32&bold=true`"
        @mouseover="showExitButton = true"
        v-if="!showExitButton"
      />
      <button
        v-tooltip.bottom="`${username}`"
        class="
          btn btn-sm btn-dark
          rounded-circle
          d-flex
          justify-content-center
          align-items-center
        "
        style="width: 36px; height: 36px"
        @mouseleave="showExitButton = false"
        v-if="showExitButton"
        @click="exit()"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>

    <AppInstance
      v-for="(app, i) in apps"
      :key="i"
      :ref="app.component"
      :app="app"
      :username="username"
      :awareness="yjs.wsp.awareness"
      @activate="toggleActiveApp($event, app)"
    />

    <!-- todo: refactor, this whole thing should be in a separate component -->
    <div class="modal fade" id="settingsModal" style="z-index: 99999">
      <div
        class="
          modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable
        "
      >
        <div class="modal-content">
          <div class="modal-header border-0 py-2 px-3">
            <div
              class="
                modal-title
                text-uppercase
                user-select-none
                fw-bold
                fs-08em
              "
            >
              <i class="bi bi-sliders pe-2 fs-1em"></i>
              Room settings
            </div>
            <button
              type="button"
              class="btn btn-sm btn-muted rounded-circle"
              data-bs-dismiss="modal"
            >
              <i class="bi bi-box-arrow-in-down-left fs-1em"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="fw-bold pb-1">Set background</div>
            <div class="input-group input-group-sm rounded">
              <button
                class="btn btn-sm btn-light border dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i :class="`bi bi-${selectedBgOpt.icon} fs-09em`"></i>
                {{ selectedBgOpt.name }}
              </button>
              <ul class="dropdown-menu dropdown-menu-dark p-0">
                <li
                  v-for="(bgOpt, i) in backgroundOptions"
                  :key="i"
                  @click="changeBgType(bgOpt)"
                >
                  <a class="dropdown-item fs-09em" href="#">
                    <i :class="`bi bi-${bgOpt.icon} fs-09em`"></i>
                    {{ bgOpt.name }}
                  </a>
                </li>
              </ul>
              <input
                type="text"
                class="form-control"
                v-model="background.value"
              />
              <button
                v-if="background.type === 'image'"
                class="btn btn-sm border border-muted"
                @click="background.stretch = !background.stretch"
                :class="
                  background.stretch ? 'btn-primary' : 'btn-outline-secondary'
                "
              >
                <i class="fs-1em bi bi-arrows-angle-expand"></i>
              </button>
              <button
                v-if="background.type === 'youtube'"
                class="btn btn-sm border border-muted"
                @click="background.sound = !background.sound"
                :class="
                  background.sound ? 'btn-primary' : 'btn-outline-secondary'
                "
              >
                <i
                  class="fs-1em bi"
                  :class="
                    background.sound
                      ? 'bi-volume-up-fill'
                      : 'bi-volume-mute-fill'
                  "
                ></i>
              </button>
              <button
                class="btn btn-sm btn-muted border border-muted"
                v-if="backgroundChanged"
                @click="restoreBackground()"
              >
                <i class="bi bi-backspace-fill fs-08em"></i>
              </button>
            </div>
            <div class="fw-bold pt-3 pb-1">Colors</div>
            <div class="btn-group border rounded w-100">
              <button
                v-for="(color, i) in backgrounds.colors"
                :key="i"
                type="button"
                class="btn btn-sm"
                :style="{ backgroundColor: color }"
                @click="
                  background.value = color;
                  background.type = 'color';
                "
              >
                &nbsp;
              </button>
            </div>
            <div
              class="
                d-flex
                flex-row
                justify-content-between
                align-items-center
                pt-3
                pb-1
              "
            >
              <div class="fw-bold">Patterns</div>
              <a
                href="http://www.colourlovers.com/patterns"
                target="_blank"
                class="primary-link fs-08em"
              >
                Search more <i class="bi bi-box-arrow-up-right fs-08em"></i>
              </a>
            </div>
            <div class="btn-group border rounded w-100">
              <button
                v-for="(image, i) in backgrounds.images"
                :key="i"
                type="button"
                class="btn"
                :style="{ backgroundImage: 'url(' + image + ')' }"
                @click="
                  background.stretch = false;
                  background.value = image;
                  background.type = 'image';
                "
              >
                &nbsp;
              </button>
            </div>
            <div
              class="
                d-flex
                flex-row
                justify-content-between
                align-items-center
                pt-3
                pb-1
              "
            >
              <div class="fw-bold">YouTube</div>
              <a
                href="https://www.youtube.com/results?search_query=lofi+jazz+cafe"
                target="_blank"
                class="primary-link fs-08em"
              >
                Search more <i class="bi bi-box-arrow-up-right fs-08em"></i>
              </a>
            </div>
            <div class="btn-group border rounded w-100">
              <button
                v-for="(video, i) in backgrounds.youtube"
                :key="i"
                type="button"
                class="btn"
                :style="{
                  backgroundImage: 'url(' + video.thumbnail + ')',
                  backgroundPosition: 'center',
                  height: '70px',
                }"
                @click="
                  background.value = video.url;
                  background.type = 'youtube';
                "
              >
                &nbsp;
                <span v-if="video.live" class="badge bg-danger">
                  <i class="bi bi-broadcast-pin"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";
import $ from "jquery";
import * as _ from "lodash";
import { DateTime } from "luxon";
import getYouTubeID from "get-youtube-id";
import * as apps from "@/assets/apps.json";
import * as backgrounds from "@/assets/backgrounds.json";
import AppInstance from "@/components/AppInstance";
import YjsService from "@/services/YjsService";

const DEFAULT_DESC = "Room's description";
const DEFAULT_BG = {
  type: "color",
  value: backgrounds.colors[_.random(backgrounds.colors.length - 1)],
  sound: true,
  stretch: false,
};

export default {
  name: "RoomView",
  components: {
    AppInstance,
  },
  data: () => ({
    apps: null,
    yjs: null,
    roomSync: null,
    username: null,
    // ui room data
    roomId: null,
    users: [],
    description: DEFAULT_DESC,
    background: DEFAULT_BG,
    // ui mechanics
    settingsModal: null,
    originalBackground: null,
    youtubeId: null,
    youtubePlayer: null,
    showEditTitle: false,
    editTitle: false,
    showExitButton: false,
    // options
    backgrounds,
    backgroundOptions: [
      { name: "Color", type: "color", icon: "palette" },
      { name: "Image URL", type: "image", icon: "card-image" },
      { name: "YouTube URL", type: "youtube", icon: "youtube" },
    ],
  }),
  watch: {
    description(newVal) {
      this.roomSync.set("description", newVal);
    },
    computedBackground: {
      handler(newVal, oldVal) {
        if (
          (newVal.type === "youtube" && oldVal.type !== "youtube") ||
          (newVal.type === "youtube" && newVal.value !== oldVal.value)
        ) {
          this.youtubeId = getYouTubeID(newVal.value);
          this.$nextTick(() => {
            this.youtubePlayer = new window.YT.Player("bg-playback", {
              events: {
                onReady: ({ target }) =>
                  !newVal.sound ? target.mute() : target.unMute(),
                onStateChange: ({ target }) =>
                  !newVal.sound ? target.mute() : target.unMute(),
              },
            });
          });
        }

        this.$nextTick(() => {
          // nextTick() because youtubeId might have been changed
          if (this.youtubePlayer) {
            newVal.sound
              ? this.youtubePlayer.unMute()
              : this.youtubePlayer.mute();
          }
        });

        this.roomSync.set("background", newVal);
      },
      deep: true,
    },
  },
  computed: {
    computedBackground() {
      return _.cloneDeep(this.background);
    },
    selectedBgOpt() {
      return _.find(this.backgroundOptions, { type: this.background.type });
    },
    backgroundChanged() {
      const o = (bg) => _.omit(bg, "sound");
      return !_.isEqual(o(this.originalBackground), o(this.background));
    },
    backgroundAttr() {
      if (!this.background) {
        return {};
      } else if (this.background.type === "color") {
        return { backgroundColor: this.background.value };
      } else if (this.background.type === "image") {
        const stretch = this.background.stretch
          ? {
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "cover",
            }
          : {};
        return {
          backgroundImage: "url(" + this.background.value + ")",
          ...stretch,
        };
      } else {
        return { backgroundColor: "white" };
      }
    },
  },
  created() {
    $(document).ready(() => {
      if (document.getElementById("settingsModal"))
        this.settingsModal = new Modal(
          document.getElementById("settingsModal")
        );
    });

    this.roomId = this.$route.params.roomId;
    this.username = localStorage.getItem(this.roomId)
      ? JSON.parse(localStorage.getItem(this.roomId)).username
      : null;

    if (!this.username) {
      this.$router.push(`/lobby?join=${this.roomId}`);
      return;
    }

    const room = JSON.parse(localStorage.getItem(this.roomId));
    room.lastAccess = DateTime.now();
    localStorage.setItem(this.roomId, JSON.stringify(room));

    this.yjs = new YjsService();

    this.yjs
      .getConnectedDoc(this.roomId)
      .then((doc) => {
        this.apps = _.map(apps, (app) => ({
          ...app,
          sync: doc.getMap(app.component),
          window: {},
          active: false,
        }));

        const initBackground = (bg) => {
          this.roomSync.set("background", bg);
          return bg;
        };

        this.roomSync = doc.getMap("roomConfig");
        this.description = this.roomSync.get("description") || this.description;
        this.background =
          this.roomSync.get("background") || initBackground(this.background);

        this.roomSync.observe((event) => {
          if (event.keysChanged.has("description")) {
            this.description = this.roomSync.get("description") || DEFAULT_DESC;
          }
          if (event.keysChanged.has("background")) {
            if (!_.isEqual(this.background, this.roomSync.get("background"))) {
              this.background = this.roomSync.get("background");
              this.originalBackground = _.clone(this.background);
            }
          }
        });
      })
      .catch(() => this.$router.push(`/error/${this.roomId}`));

    this.yjs.startAwareness({
      username: this.username,
      listener: (changes, state) => {
        _.each(changes.added, (c) => {
          this.users.push({ id: c, ...state.get(c) });
        });
        _.each(changes.updated, (c) => {
          const ui = _.findIndex(this.users, { id: c });
          this.users[ui] = { id: c, ...state.get(c) };
          $(`#cursor-${c}`).css({
            top: this.users[ui].roomCursor.y,
            left: this.users[ui].roomCursor.x,
          });
        });
        _.each(changes.removed, (c) => {
          this.users = _.filter(this.users, (u) => u.id !== c);
        });
      },
    });

    window.onbeforeunload = () => {
      this.yjs.stopAwareness();
    };
  },
  beforeDestroy() {
    if (this.yjs) this.yjs.stopAwareness();
  },
  methods: {
    toggleActiveApp(active, app) {
      app.active = active;
    },
    toggleMinimize(app) {
      this.$refs[app.component][0].toggleMinimize();
    },
    openSettings() {
      this.originalBackground = _.clone(this.background);
      this.settingsModal.toggle();
    },
    minimizeAll() {
      _.each(this.apps, (app) => this.$refs[app.component][0].minimize());
    },
    changeBgType(bgOpt) {
      if (this.background.type !== bgOpt.type) {
        this.background.value = "";
        this.background.type = bgOpt.type;
        this.background.stretch = false;
      }
    },
    restoreBackground() {
      this.background = _.clone(this.originalBackground);
    },
    exit() {
      this.$router.push("/lobby");
    },
  },
};
</script>

<style scoped>
.room-container {
  height: 100%;
}

#bg-playback-container {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
}

#bg-playback {
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@media (min-aspect-ratio: 16/9) {
  #bg-playback {
    height: 86.25vw !important;
  }
}
@media (max-aspect-ratio: 16/9) {
  #bg-playback {
    width: 177.78vh !important;
    height: 120% !important;
  }
}

.user-cursor {
  position: absolute;
  z-index: 99998;
  transform: translate(-90%, -16%);
}

.titlebar-container {
  position: absolute;
  z-index: 997;
  top: 10px;
  left: 25px;
}

.settings-button-container {
  position: absolute;
  z-index: 996;
  top: 40px;
  left: 25px;
}

.toolbar-container {
  position: absolute;
  z-index: 995;
  display: flex;
  align-items: center;
  left: 10px;
  top: 50%;
  transform: translate(0, -50%);
}

.awareness-container {
  position: absolute;
  right: 10px;
  top: 5px;
}

i.bi {
  font-size: 1.5em;
}

.app-button {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 0.6em;
  text-transform: uppercase;
  font-weight: bold;
}

.loading-overlay {
  background-color: #222;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
}

.user-cursor > span {
  border: 1px #0dcaf0 solid;
  border-radius: 5px;
  background: white;
  font-size: 0.6em;
  font-weight: bold;
  text-transform: uppercase;
  padding: 3px 3px 0px 3px;
}
</style>
