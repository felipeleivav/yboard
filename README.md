# Yboard

Yboard is a multiplayer desktop-like workspace.

It's based on the awesome CRDT implementation [Yjs](https://github.com/yjs/yjs) (hence the Y).

Yboard's intention is to explore how we interact with applications when (most of) the controls reflect a shared state among multiple peers.

[Try online demo.](https://yboard.lol)

![gif demo](https://i.imgur.com/RIkEKWi.gif)

## ⚙️ How it works

Yboard is a frontend-only project. Only requisite is a [websocket server](https://github.com/yjs/y-websocket).

This means a couple of things:

- Yboard directly connects to websocket server

- There is no authentication mechanisms nor additional backend logic implemented
- All the rooms are publicly accessible (only protected by a random unique id, thanks [nanoid](https://github.com/ai/nanoid))
- Since a room is basically a [shared document](https://docs.yjs.dev/api/y.doc), any user could eventually rewrite the whole document by writing their own client application

So please don't use YBoard for highly sensitive data or production environments.

This is experimental software, use it for fun and collaboration with your friends.

## 🎁 What's inside?

Yboard consists of a set of minimalist applications where multiple users can interact in real time:

- **TODO** - task manager
- **NOTES** - notes manager
- **KANBAN** - very simple kanban
- **LINKS** - bookmark manager
- **CHAT** - talk & alert users
- **TIMER** - synchronized timer
- **SPOTIFY** - embedded spotify player w/ synchronized playlists
- **DRAW** - a drawable whiteboard

## 🖥 Set up local environment

```sh
# clone & setup project
git clone git@github.com:felipeleivav/yboard.git
cd yboard
npm install

# run project
npm run serve

# execute yjs websocket server
./run-yws.sh
```

## 📝 How to write an app

WIP :)
