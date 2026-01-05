import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pagesにデプロイする場合、リポジトリ名をbaseに設定
  // 例: base: '/mountain-area-forecast/'
  // カスタムドメインの場合は base: '/' のまま
  base: '/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
