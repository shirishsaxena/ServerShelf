// Server Dashboard Configuration
// Edit this file and refresh the page - no rebuild needed!

window.dashboardConfig = {
  tabs: [
    {
      name: "Main Server",
      key: "main",
      id: "main-server",
      mainUrl: "http://192.168.0.100",
      icon: "home",
      tooltip: {
        title: "Primary Server",
        description: "Handles media and development workloads",
        location: "Data Center Alpha",
        specs: "Mini PC - Intel N100, 16GB RAM",
      },
      services: [
        {
          name: "Manga Server",
          url: "http://192.168.0.100:4000",
          description: "Access your favorite manga collections",
          icon: "📖",
          alt_url: "https://manga.example.com",
        },
        {
          name: "Media Library",
          url: "http://192.168.0.100:8096",
          description: "Stream your media with Jellyfin",
          icon: "🎬",
          alt_url: "https://media.example.com",
        },
        {
          name: "Torrent Client",
          url: "http://192.168.0.100:8080",
          description: "qBittorrent Web UI",
          icon: "⬇️",
        },
        {
          name: "VS Code Server",
          url: "http://192.168.0.100:8443",
          description: "Web-based development environment",
          icon: "💻",
        },
      ],
    },
    {
      name: "Backup Node",
      key: "backup",
      id: "backup-server",
      mainUrl: "https://backup.example.com",
      icon: "server",
      tooltip: {
        title: "Remote Backup Node",
        description: "Handles daily sync & archiving",
        location: "Cloud - Region B",
        specs: "VPS - 2vCPU, 4GB RAM, 80GB SSD",
      },
      services: [
        {
          name: "Reverse Proxy Dashboard",
          url: "https://proxy.example.com",
          description: "Manage tunnel routes and mappings",
          icon: "🔄",
        },
        {
          name: "Monitoring",
          url: "https://monitor.example.com",
          description: "Health metrics and logs",
          icon: "📊",
        },
        {
          name: "Syncthing",
          url: "https://sync.example.com",
          description: "Continuous file synchronization",
          icon: "🔁",
        },
      ],
    },
    {
      name: "Dev Server",
      key: "dev",
      id: "dev-server",
      mainUrl: "http://192.168.0.110",
      icon: "code",
      tooltip: {
        title: "Development Server",
        description: "Test environment for apps and tools",
        location: "Office Rack",
        specs: "Intel i5, 32GB RAM, 1TB SSD",
      },
      services: [
        {
          name: "Portainer",
          url: "http://192.168.0.110:9000",
          description: "Docker container management UI",
          icon: "🐳",
        },
        {
          name: "Gitea",
          url: "http://192.168.0.110:3000",
          description: "Self-hosted Git repository manager",
          icon: "🗂️",
        },
        {
          name: "Uptime Kuma",
          url: "http://192.168.0.110:3001",
          description: "Status page and uptime monitor",
          icon: "🟢",
        },
      ],
    },
    {
      name: "Media Storage",
      key: "media",
      id: "media-server",
      mainUrl: "http://192.168.0.120",
      icon: "film",
      tooltip: {
        title: "NAS for Media",
        description: "Storage for movies, TV, backups",
        location: "Storage Shelf",
        specs: "8-bay NAS with 40TB",
      },
      services: [
        {
          name: "Plex",
          url: "http://192.168.0.120:32400",
          description: "Plex Media Server",
          icon: "🎞️",
        },
        {
          name: "File Browser",
          url: "http://192.168.0.120:8081",
          description: "Simple web-based file manager",
          icon: "🗃️",
        },
        {
          name: "MinIO",
          url: "http://192.168.0.120:9001",
          description: "Object storage service (S3-compatible)",
          icon: "🪣",
        },
      ],
    },
    {
      name: "Cloud VPS",
      key: "vps",
      id: "cloud-vps",
      mainUrl: "https://vps.example.com",
      icon: "cloud",
      tooltip: {
        title: "Public-facing VPS",
        description: "Public API, proxy, and shared services",
        location: "Frankfurt, Germany",
        specs: "Cloud VPS - 2 vCPU, 8GB RAM",
      },
      services: [
        {
          name: "Nginx Proxy Manager",
          url: "https://nginx.example.com",
          description: "Manage SSL and proxy hosts",
          icon: "🛡️",
        },
        {
          name: "Cloudflare Tunnel",
          url: "https://tunnel.example.com",
          description: "Secure access via Cloudflare",
          icon: "🌐",
        },
        {
          name: "Mealie",
          url: "https://recipes.example.com",
          description: "Self-hosted recipe manager",
          icon: "🍽️",
        },
      ],
    }
  ],
}

// Auto-update localhost URLs to current hostname
if (typeof window !== "undefined") {
  const currentHost = window.location.hostname
  const currentProtocol = window.location.protocol

  window.dashboardConfig.tabs.forEach((tab) => {
    // Update main URL
    if (tab.mainUrl.includes("localhost")) {
      tab.mainUrl = tab.mainUrl.replace("localhost", currentHost)
    }

    // Update service URLs
    tab.services.forEach((service) => {
      if (service.url.includes("localhost")) {
        service.url = service.url.replace("localhost", currentHost)
      }
      if (service.alt_url && service.alt_url.includes("localhost")) {
        service.alt_url = service.alt_url.replace("localhost", currentHost)
      }
    })
  })
}
