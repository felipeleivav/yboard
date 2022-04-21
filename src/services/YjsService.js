import * as Y from "yjs";
import config from "@/config";
import { WebsocketProvider } from "y-websocket";

class YjsService {

  wsp;
  mouseTracker;

  getConnectedDoc(roomId) {
    const doc = new Y.Doc();
    this.wsp = new WebsocketProvider(config.YJS_WEBSOCKET, roomId, doc);

    return new Promise((res, rej) => {
      this.wsp.on("status", e => {
        e.status === "connected" ? this.wsp.on("sync", () => res(doc)) : rej()
      });
    });
  }

  startAwareness({ username, listener }) {
    this.wsp.awareness.setLocalState({ username, cursor: { x: 0, y: 0 } });
    this.wsp.awareness.on("change", changes => {
      listener.apply(null, [changes, this.wsp.awareness.getStates()]);
    });

    this.mouseTracker = event => {
      const state = this.wsp.awareness.getLocalState();
      state.cursor.x = event.pageX;
      state.cursor.y = event.pageY;
      this.wsp.awareness.setLocalState(state);
    };
    window.addEventListener("mousemove", this.mouseTracker);
  }

  stopAwareness() {
    this.wsp.awareness.destroy();
    window.removeEventListener("mousemove", this.mouseTracker);
  }

}

export default YjsService;