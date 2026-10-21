// @ts-check
import { defineConfig } from 'astro/config'

export default defineConfig({
  // 用户主页仓库 byte-love.github.io 部署在根路径，不需要 base
  site: 'https://byte-love.github.io',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
})
