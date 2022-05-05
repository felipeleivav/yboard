<template>
  <div class="d-flex flex-column h-100">
    <div ref="chatbox" class="overflow-auto flex-grow-1">
      <div style="height: 100px; font-size: 0.9em">
        <div class="font-monospace" v-for="(message, i) in messages" :key="i">
          <b>{{ message.username }}> </b>
          {{ message.content }}
        </div>
      </div>
    </div>
    <div class="d-flex pt-3">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          v-model="newMessage"
          maxlength="50"
          placeholder="Write a message..."
          @keyup.enter="sendMessage()"
        />
        <button class="btn btn-primary" @click="sendMessage()">
          <i class="bi bi-send"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";

export default {
  name: "ChatApp",
  props: {
    sync: Object,
    username: String,
  },
  data: () => ({
    messages: [],
    newMessage: "",
    buzz: null,
  }),
  created() {
    this.buzz = new Audio(require("@/assets/bell.wav"));

    this.messages = this.sync.get("messages") || [];

    this.sync.observe((event) => {
      if (event.keysChanged.has("messages")) {
        const newMessages = this.sync.get("messages");
        const diff = newMessages.slice(this.messages.length);
        this.messages = newMessages;
        this.scrollToBottom();

        if (_.find(diff, { content: "/hey" })) this.buzz.play();
      }
    });

    this.$emit("setHeaderButtons", [{ icon: "bell", callback: this.sendBuzz }]);
  },
  methods: {
    sendMessage() {
      if (this.newMessage !== "") {
        this.sync.set("messages", [
          ...this.messages,
          {
            username: this.username,
            content: this.newMessage,
          },
        ]);
        this.newMessage = "";
        this.scrollToBottom();
      }
    },
    scrollToBottom() {
      var element = this.$refs.chatbox;
      if (element) {
        this.$nextTick(() => {
          element.scrollTop = element.scrollHeight;
        });
      }
    },
    sendBuzz() {
      this.newMessage = "/hey";
      this.sendMessage();
    },
  },
};
</script>
