"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
  ExternalLink,
  Globe,
  Server,
  Moon,
  Sun,
  Copy,
  Check,
  Search,
  X,
  Link,
  Home,
  MapPin,
  Database,
  Cloud,
  Menu,
  ChevronLeft,
  RefreshCw,
} from "lucide-react"
import { useTheme } from "next-themes"

interface Service {
  name: string
  url: string
  description: string
  alt_url?: string
  icon?: string
}

interface Tab {
  name: string
  key: string
  id: string
  mainUrl: string
  icon: string
  tooltip: {
    title: string
    description: string
    location: string
    specs: string
  }
  services: Service[]
}

interface Config {
  tabs: Tab[]
}

interface SearchResult {
  service: Service
  serverName: string
  serverKey: string
}

// Declare global window property
declare global {
  interface Window {
    dashboardConfig?: Config
  }
}

export default function ServerDashboard() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { toast } = useToast()

  // Load config from JavaScript file
  const loadConfig = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        setLoading(true)
        setError(null)

        // Remove existing script if it exists
        const existingScript = document.getElementById("config-script")
        if (existingScript) {
          existingScript.remove()
        }

        // Create and load script
        const script = document.createElement("script")
        script.id = "config-script"
        script.src = `/config.js?t=${Date.now()}` // Cache busting
        script.onload = () => {
          try {
            if (window.dashboardConfig) {
              setConfig(window.dashboardConfig)
              if (!activeTab && window.dashboardConfig.tabs.length > 0) {
                setActiveTab(window.dashboardConfig.tabs[0].key)
              }
              resolve()
            } else {
              throw new Error("Configuration not found in config.js")
            }
          } catch (err) {
            console.error("Failed to parse config:", err)
            setError(err instanceof Error ? err.message : "Failed to parse configuration")
            reject(err)
          } finally {
            setLoading(false)
          }
        }
        script.onerror = () => {
          const errorMsg = "Failed to load config.js file"
          console.error(errorMsg)
          setError(errorMsg)
          setLoading(false)
          reject(new Error(errorMsg))
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error("Failed to load config:", err)
        setError(err instanceof Error ? err.message : "Failed to load configuration")
        setLoading(false)
        reject(err)
      }
    })
  }

  // Load config on mount
  useEffect(() => {
    loadConfig().catch(() => {
      toast({
        title: "Configuration Error",
        description: "Failed to load server configuration. Please check the config.js file.",
        variant: "destructive",
      })
    })
  }, [])

  // Fix for theme toggle requiring double-click initially
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById("mobile-sidebar")
        const menuButton = document.getElementById("menu-button")

        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, sidebarOpen])

  // Haptic feedback for copy only
  const triggerHapticForCopy = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50) // Short vibration
    }
  }

  const openUrl = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const copyToClipboard = async (url: string, label: string) => {
    triggerHapticForCopy() // Only vibrate on copy

    try {
      // Mobile-optimized copy function
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback for mobile browsers
        const textArea = document.createElement("textarea")
        textArea.value = url
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        textArea.style.top = "-9999px"
        textArea.style.opacity = "0"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        // For mobile Safari
        textArea.setSelectionRange(0, 99999)

        const successful = document.execCommand("copy")
        document.body.removeChild(textArea)

        if (!successful) {
          throw new Error("Copy command failed")
        }
      }

      setCopiedUrl(url)
      toast({
        title: "✅ Copied!",
        description: `${label} URL copied`,
        duration: 1500,
      })
      setTimeout(() => setCopiedUrl(null), 1500)
    } catch (err) {
      console.error("Copy failed:", err)

      // Show URL in a prompt as fallback
      if (isMobile) {
        const userAgent = navigator.userAgent.toLowerCase()
        if (userAgent.includes("ios") || userAgent.includes("iphone") || userAgent.includes("ipad")) {
          // iOS fallback
          const range = document.createRange()
          const selection = window.getSelection()
          const div = document.createElement("div")
          div.textContent = url
          div.style.position = "fixed"
          div.style.left = "-9999px"
          document.body.appendChild(div)
          range.selectNodeContents(div)
          selection?.removeAllRanges()
          selection?.addRange(range)
          document.body.removeChild(div)
        }
      }

      toast({
        title: "Copy Failed",
        description: "Long press the URL to copy manually",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  // Get service icon - simplified to just use the icon property or fallback
  const getServiceIcon = (service: Service) => {
    return service.icon || "🌐"
  }

  const getTabIcon = (iconType: string) => {
    switch (iconType) {
      case "home":
        return <Home className="h-4 w-4" />
      case "location":
        return <MapPin className="h-4 w-4" />
      case "server":
        return <Database className="h-4 w-4" />
      case "cloud":
        return <Cloud className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  // Theme Toggle - completely fixed approach
  const toggleTheme = () => {
    if (!mounted) return

    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  // Tab change and close sidebar on mobile
  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey)
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  // Reload config
  const reloadConfig = () => {
    loadConfig()
      .then(() => {
        toast({
          title: "🔄 Reloaded",
          description: "Configuration reloaded from config.js",
          duration: 2000,
        })
      })
      .catch(() => {
        toast({
          title: "Reload Failed",
          description: "Failed to reload configuration",
          variant: "destructive",
          duration: 3000,
        })
      })
  }

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !config) return []

    const results: SearchResult[] = []
    const query = searchQuery.toLowerCase()

    config.tabs.forEach((tab) => {
      tab.services.forEach((service) => {
        const matchesName = service.name.toLowerCase().includes(query)
        const matchesDescription = service.description.toLowerCase().includes(query)
        const matchesUrl = service.url.toLowerCase().includes(query)
        const matchesAltUrl = service.alt_url?.toLowerCase().includes(query)

        if (matchesName || matchesDescription || matchesUrl || matchesAltUrl) {
          results.push({
            service,
            serverName: tab.name,
            serverKey: tab.key,
          })
        }
      })
    })

    return results
  }, [searchQuery, config])

  const clearSearch = () => {
    setSearchQuery("")
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-amber-200 dark:bg-amber-800 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const activeTabData = config?.tabs.find((tab) => tab.key === activeTab)

  // Loading state
  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:bg-gradient-to-br dark:from-stone-900 dark:to-amber-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading configuration...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:bg-gradient-to-br dark:from-stone-900 dark:to-amber-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Configuration Error</h2>
            <p className="text-muted-foreground mb-4">{error || "Failed to load server configuration"}</p>
            <Button onClick={reloadConfig} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:bg-gradient-to-br dark:from-stone-900 dark:to-amber-950">
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex h-screen">
          {/* Mobile Sidebar */}
          <div
            id="mobile-sidebar"
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-r border-emerald-200 dark:border-stone-700 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-emerald-200 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-600 dark:text-amber-600" />
                <h2 className="font-semibold text-emerald-800 dark:text-amber-500">Servers</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={reloadConfig} className="h-8 w-8">
                  <RefreshCw className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Tabs */}
            <div className="p-2 space-y-1">
              {config.tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.key
                      ? "bg-emerald-100 dark:bg-stone-800 text-emerald-800 dark:text-amber-500 border border-emerald-200 dark:border-stone-700"
                      : "hover:bg-emerald-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {getTabIcon(tab.icon)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tab.name}</div>
                    <div className="text-xs text-muted-foreground">{tab.services.length} services</div>
                  </div>
                  {activeTab === tab.key && (
                    <div className="w-2 h-2 bg-emerald-600 dark:bg-amber-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Theme Toggle in Sidebar */}
            <div className="absolute bottom-4 left-4 right-4">
              <Button variant="outline" onClick={toggleTheme} className="w-full justify-start gap-2">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 ml-2" />
                <span className="ml-6">Toggle Theme</span>
              </Button>
            </div>
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSidebarOpen(false)} />}

          {/* Mobile Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-emerald-200 dark:border-stone-700">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Button
                    id="menu-button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="h-8 w-8"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-600 dark:text-amber-600" />
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-amber-600 dark:to-yellow-600 bg-clip-text text-transparent">
                      Dashboard
                    </h1>
                  </div>
                </div>
                {activeTabData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getTabIcon(activeTabData.icon)}
                    <span className="font-medium">{activeTabData.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-auto p-4">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 text-base"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Search Results or Tab Content */}
              {searchQuery ? (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-semibold">Search Results</h2>
                    <Badge variant="outline">{searchResults.length} results</Badge>
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <Card
                          key={index}
                          className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/90 dark:bg-stone-800/60 backdrop-blur-sm"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl flex-shrink-0">{getServiceIcon(result.service)}</span>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-amber-500 transition-colors">
                                  {highlightText(result.service.name, searchQuery)}
                                </CardTitle>
                                <CardDescription className="text-sm mt-1 line-clamp-2">
                                  {highlightText(result.service.description, searchQuery)}
                                </CardDescription>
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {result.serverName}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            <div className="space-y-2">
                              <Button
                                onClick={() => openUrl(result.service.url)}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-base"
                                variant="default"
                              >
                                <span className="mr-2">Open Service</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>

                              {result.service.alt_url && (
                                <Button
                                  onClick={() => openUrl(result.service.alt_url!)}
                                  className="w-full h-12 border-emerald-200 hover:bg-emerald-50 dark:border-amber-600 dark:hover:bg-stone-700 text-base"
                                  variant="outline"
                                >
                                  <span className="mr-2">Alternative URL</span>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div
                                className="text-xs text-muted-foreground bg-muted/50 rounded p-3 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                                onClick={() => copyToClipboard(result.service.url, result.service.name)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="truncate flex-1 text-xs">
                                    {highlightText(result.service.url, searchQuery)}
                                  </div>
                                  {copiedUrl === result.service.url ? (
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                              {result.service.alt_url && (
                                <div
                                  className="text-xs text-muted-foreground bg-muted/50 rounded p-3 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                                  onClick={() =>
                                    copyToClipboard(result.service.alt_url!, `${result.service.name} (Alt)`)
                                  }
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="truncate flex-1 text-xs">
                                      Alt: {highlightText(result.service.alt_url, searchQuery)}
                                    </div>
                                    {copiedUrl === result.service.alt_url ? (
                                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No services found</h3>
                      <p className="text-muted-foreground">Try adjusting your search terms</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab Content */
                activeTabData && (
                  <div className="bg-white/70 dark:bg-stone-800/30 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-stone-700 p-4 shadow-lg">
                    <div className="flex flex-col gap-3 mb-6">
                      <div className="flex items-center gap-2">
                        {getTabIcon(activeTabData.icon)}
                        <h2 className="text-xl font-semibold text-emerald-800 dark:text-amber-500">
                          {activeTabData.name} Services
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-emerald-300 dark:border-amber-600 w-fit">
                          {activeTabData.services.length} services
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Link className="h-4 w-4 flex-shrink-0" />
                          <span className="font-mono text-xs truncate">{activeTabData.mainUrl}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(activeTabData.mainUrl, `${activeTabData.name} Server URL`)}
                            className="h-6 w-6 p-0 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activeTabData.services.map((service: Service, index: number) => (
                        <Card
                          key={index}
                          className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/90 dark:bg-stone-800/60 backdrop-blur-sm"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl flex-shrink-0">{getServiceIcon(service)}</span>
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-amber-500 transition-colors">
                                  {service.name}
                                </CardTitle>
                                <CardDescription className="text-sm mt-1 line-clamp-2">
                                  {service.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <Button
                                onClick={() => openUrl(service.url)}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-base"
                                variant="default"
                              >
                                <span className="mr-2">Open Service</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>

                              {service.alt_url && (
                                <Button
                                  onClick={() => openUrl(service.alt_url!)}
                                  className="w-full h-12 border-emerald-200 hover:bg-emerald-50 dark:border-amber-600 dark:hover:bg-stone-700 text-base"
                                  variant="outline"
                                >
                                  <span className="mr-2">Alternative URL</span>
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              )}

                              <div className="space-y-2">
                                <div
                                  className="text-xs text-muted-foreground bg-muted/50 rounded p-3 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                                  onClick={() => copyToClipboard(service.url, service.name)}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="truncate flex-1 text-xs">{service.url}</div>
                                    {copiedUrl === service.url ? (
                                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    )}
                                  </div>
                                </div>
                                {service.alt_url && (
                                  <div
                                    className="text-xs text-muted-foreground bg-muted/50 rounded p-3 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                                    onClick={() => copyToClipboard(service.alt_url!, `${service.name} (Alt)`)}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="truncate flex-1 text-xs">Alt: {service.alt_url}</div>
                                      {copiedUrl === service.alt_url ? (
                                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Layout - Clean Tab Design */
        <div className="w-full">
          <div className="flex items-center justify-center p-8 pb-4 relative">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-emerald-600 dark:text-amber-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-amber-600 dark:to-yellow-600 bg-clip-text text-transparent">
                Server Dashboard
              </h1>
            </div>
            <div className="absolute right-8 top-8 flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={reloadConfig} className="h-10 w-10">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Reload config</span>
              </Button>
              <Button variant="outline" size="icon" onClick={toggleTheme} className="h-10 w-10">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-muted-foreground text-lg">Manage and access all your services across multiple servers</p>
          </div>

          <div className="container mx-auto px-4 py-0">
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-10 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-semibold">Search Results</h2>
                  <Badge variant="outline">{searchResults.length} results</Badge>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((result, index) => (
                      <Card
                        key={index}
                        className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/90 dark:bg-stone-800/60 backdrop-blur-sm"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl flex-shrink-0">{getServiceIcon(result.service)}</span>
                            <div className="min-w-0 flex-1">
                              <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-amber-500 transition-colors">
                                {highlightText(result.service.name, searchQuery)}
                              </CardTitle>
                              <CardDescription className="text-sm mt-1 line-clamp-2">
                                {highlightText(result.service.description, searchQuery)}
                              </CardDescription>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {result.serverName}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          <div className="space-y-3">
                            <Button
                              onClick={() => openUrl(result.service.url)}
                              className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-sm"
                              variant="default"
                            >
                              <span className="mr-2">Open Service</span>
                              <ExternalLink className="h-4 w-4" />
                            </Button>

                            {result.service.alt_url && (
                              <Button
                                onClick={() => openUrl(result.service.alt_url!)}
                                className="w-full h-10 border-emerald-200 hover:bg-emerald-50 dark:border-amber-600 dark:hover:bg-stone-700 text-sm"
                                variant="outline"
                              >
                                <span className="mr-2">Alternative URL</span>
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div
                              className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                              onClick={() => copyToClipboard(result.service.url, result.service.name)}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate flex-1 text-xs">
                                  {highlightText(result.service.url, searchQuery)}
                                </div>
                                {copiedUrl === result.service.url ? (
                                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </div>
                            {result.service.alt_url && (
                              <div
                                className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                                onClick={() => copyToClipboard(result.service.alt_url!, `${result.service.name} (Alt)`)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="truncate flex-1 text-xs">
                                    Alt: {highlightText(result.service.alt_url, searchQuery)}
                                  </div>
                                  {copiedUrl === result.service.alt_url ? (
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No services found</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Tabs - Clean Design */}
            {!searchQuery && (
              <div className="mb-8">
                <div
                  className={`relative w-full grid h-auto p-2 bg-emerald-100 dark:bg-stone-800 rounded-xl border dark:border-stone-700 ${
                    config.tabs.length === 1
                      ? "grid-cols-1"
                      : config.tabs.length === 2
                        ? "grid-cols-2"
                        : config.tabs.length === 3
                          ? "grid-cols-3"
                          : config.tabs.length === 4
                            ? "grid-cols-4"
                            : config.tabs.length === 5
                              ? "grid-cols-5"
                              : config.tabs.length === 6
                                ? "grid-cols-6"
                                : config.tabs.length <= 8
                                  ? "grid-cols-4 lg:grid-cols-8"
                                  : "grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                  }`}
                >
                  {/* Custom Tab Buttons */}
                  {config.tabs.map((tab) => (
                    <TooltipProvider key={tab.key}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-medium transition-all duration-200 relative ${
                              activeTab === tab.key
                                ? "bg-white dark:bg-stone-700 text-emerald-800 dark:text-amber-500 shadow-sm border border-emerald-200 dark:border-amber-600"
                                : "text-emerald-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-stone-100 hover:bg-emerald-50 dark:hover:bg-stone-700 hover:scale-[1.02] z-10"
                            }`}
                          >
                            {getTabIcon(tab.icon)}
                            <span className="font-semibold">{tab.name}</span>
                            <Badge
                              className={`${
                                activeTab === tab.key
                                  ? "bg-emerald-100 text-emerald-700 font-semibold dark:bg-stone-600 dark:text-amber-300"
                                  : "bg-emerald-200 text-emerald-800 dark:bg-stone-600 dark:text-stone-200"
                              }`}
                            >
                              {tab.services.length}
                            </Badge>

                            {/* Subtle bottom indicator */}
                            {activeTab === tab.key && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 dark:bg-amber-600 rounded-b-lg"></div>
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <div className="space-y-2">
                            <h4 className="font-semibold">{tab.tooltip.title}</h4>
                            <p className="text-sm text-muted-foreground">{tab.tooltip.description}</p>
                            <div className="text-xs space-y-1">
                              <div>
                                <strong>Location:</strong> {tab.tooltip.location}
                              </div>
                              <div>
                                <strong>Specs:</strong> {tab.tooltip.specs}
                              </div>
                              <div>
                                <strong>URL:</strong> <code className="text-xs break-all">{tab.mainUrl}</code>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Tab Content */}
            {!searchQuery && activeTabData && (
              <div className="bg-white/70 dark:bg-stone-800/30 backdrop-blur-sm rounded-xl border border-emerald-200 dark:border-stone-700 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    {getTabIcon(activeTabData.icon)}
                    <h2 className="text-2xl font-semibold text-emerald-800 dark:text-amber-500">
                      {activeTabData.name} Services
                    </h2>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 dark:border-amber-600">
                    {activeTabData.services.length} services
                  </Badge>
                  <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <Link className="h-4 w-4 flex-shrink-0" />
                    <span className="font-mono text-sm truncate max-w-[200px] lg:max-w-none">
                      {activeTabData.mainUrl}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(activeTabData.mainUrl, `${activeTabData.name} Server URL`)}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTabData.services.map((service: Service, index: number) => (
                    <Card
                      key={index}
                      className="group hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-white/90 dark:bg-stone-800/60 backdrop-blur-sm"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl flex-shrink-0">{getServiceIcon(service)}</span>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-lg group-hover:text-emerald-600 dark:group-hover:text-amber-500 transition-colors">
                              {service.name}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 line-clamp-2">
                              {service.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <Button
                            onClick={() => openUrl(service.url)}
                            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-sm"
                            variant="default"
                          >
                            <span className="mr-2">Open Service</span>
                            <ExternalLink className="h-4 w-4" />
                          </Button>

                          {service.alt_url && (
                            <Button
                              onClick={() => openUrl(service.alt_url!)}
                              className="w-full h-10 border-emerald-200 hover:bg-emerald-50 dark:border-amber-600 dark:hover:bg-stone-700 text-sm"
                              variant="outline"
                            >
                              <span className="mr-2">Alternative URL</span>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}

                          <div className="space-y-2">
                            <div
                              className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                              onClick={() => copyToClipboard(service.url, service.name)}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate flex-1 text-xs">{service.url}</div>
                                {copiedUrl === service.url ? (
                                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                            </div>
                            {service.alt_url && (
                              <div
                                className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono cursor-pointer hover:bg-muted/70 transition-colors active:bg-muted/80"
                                onClick={() => copyToClipboard(service.alt_url!, `${service.name} (Alt)`)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="truncate flex-1 text-xs">Alt: {service.alt_url}</div>
                                  {copiedUrl === service.alt_url ? (
                                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <Copy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
