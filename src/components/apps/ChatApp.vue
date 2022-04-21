<template>
  <div class="d-flex flex-column h-100">
    <div ref="chatbox" class="overflow-auto flex-grow-1">
      <div style="height: 100px">
        <div v-for="(message, i) in messages" :key="i">
          <b>{{ message.username }}> </b>
          {{ message.content }}
        </div>
      </div>
    </div>
    <div class="d-flex pt-3">
      <input
        type="text"
        class="form-control"
        v-model="newMessage"
        maxlength="50"
        placeholder="Enter message..."
        @keyup.enter="sendMessage()"
      />
      <button class="btn btn-primary ms-3" @click="sendMessage()">
        <i class="bi bi-send"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "ChatApp",
  props: {
    sync: Object,
    username: String,
  },
  data: () => ({
    messages: [],
    newMessage: "",
  }),
  created() {
    this.messages = this.sync.get("messages") || [];

    this.sync.observe((event) => {
      if (event.keysChanged.has("messages")) {
        this.messages = this.sync.get("messages");
        this.scrollToBottom();
      }
    });
  },
  methods: {
    sendMessage() {
      if (this.newMessage !== "") {
        this.messages.push({
          username: this.username,
          content: this.newMessage,
        });
        this.sync.set("messages", this.messages);
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
  },
};
</script>
