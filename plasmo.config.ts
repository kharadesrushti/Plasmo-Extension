import { defineManifest } from "@plasmo/config"

export default defineManifest({
  manifest_version: 3,
  name: "LinkedIn Auto Commenter",
  version: "1.0.0",
  permissions: ["storage", "scripting", "activeTab"],
  host_permissions: ["https://www.linkedin.com/*"],
  background: {
    service_worker: "background.ts"
  },
  action: {
    default_popup: "popup.html"
  }
})
