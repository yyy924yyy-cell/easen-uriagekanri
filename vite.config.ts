import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages の公開URL https://<user>.github.io/easen-uriagekanri/ に合わせたベースパス
const REPO_BASE_PATH = '/easen-uriagekanri/'

export default defineConfig({
  plugins: [react()],
  base: REPO_BASE_PATH,
})
