# 🧭 Server Dashboard UI

A simple and responsive UI to list all your servers and the services running on them.

## 📌 Why This Exists

I built this tool to manage multiple servers across various locations, each running different services. It became tedious to remember or track which URL belonged to which service. This dashboard simplifies that by providing a centralized view of all services with quick access links.

## ✨ Features

- 🔄 **Dynamic config reload** via `config.js`
- 🌗 **Light/Dark theme** toggle
- 📱 **Mobile-friendly** (portrait optimized)
- 🔍 **Search** through your services
- 📋 **Copy URL** with a single click

## 🚀 Getting Started

### 🔧 Development Build

```bash
yarn dev
```

### 🏗️ Production Build

```bash
yarn install
yarn build
npx serve@latest out
```

### 🌐 Serve Static Files

```bash
yarn install
yarn build
# Serve the /out directory using NGINX or a static server:
npx serve out
```

## 🐳 Run with Docker

### Build & Run with Docker

```bash
docker build -t server-dashboard .
docker run -d -p 3000:3000 server-dashboard
```

> Adjust the port (`3000`) as needed based on your Dockerfile config or desired host port.

### Run with Docker Compose

```bash
docker-compose up -d
```

This will build and run the service using the included `docker-compose.yaml` file.

## 🛠️ Configuration

The dashboard reads from a `config.js` file located in the `public/` directory (or wherever your build is served from).

No rebuild is required when updating the config—just reload the browser.

## ✌️ Final Note

> *"It ain't much, but not honest work :)"*  
> — but it sure keeps my URLs in one place.

![firefox_vJuX9HYG62](https://github.com/user-attachments/assets/19287405-89d6-4fc8-9ce4-2ba6cba41524)


