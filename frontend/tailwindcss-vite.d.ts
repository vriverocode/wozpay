declare module '@tailwindcss/vite' {
  import type { PluginOption } from 'vite'

  const tailwindcss: () => PluginOption

  export default tailwindcss
}
