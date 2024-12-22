import {defineConfig} from 'vite';
import path from 'path'
import vue from '@vitejs/plugin-vue';
import monkey, {cdn, util} from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'MC百科 - 便捷工具',
        author: 'ifover',
        icon: 'https://www.mcmod.cn/images/favicon.ico',
        namespace: 'https://github.com/ifover/UserScript',
        description: '在MC百科首页显示收藏列表，方便导航',
        license: 'GPL-3.0 License',
        match: ['https://*.mcmod.cn/'],
        require: 'https://kit.fontawesome.com/d4dda3d6cc.js',
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js')
            .concat('https://unpkg.com/vue-demi@latest/lib/index.iife.js')
            .concat(util.dataUrl(';window.Vue=Vue;'))
            .concat('https://unpkg.com/dayjs/dayjs.min.js')
            .concat('https://unpkg.com/dayjs/plugin/customParseFormat.js')
            .concat('https://unpkg.com/dayjs/plugin/weekday.js')
            .concat('https://unpkg.com/dayjs/plugin/localeData.js')
            .concat('https://unpkg.com/dayjs/plugin/weekOfYear.js')
            .concat('https://unpkg.com/dayjs/plugin/weekYear.js')
            .concat('https://unpkg.com/dayjs/plugin/advancedFormat.js')
            .concat('https://unpkg.com/dayjs/plugin/quarterOfYear.js'),

          pinia: cdn.jsdelivr('Pinia', 'dist/pinia.iife.prod.js'),
          "ant-design-vue": cdn.unpkg('antd', 'dist/antd.min.js')
        }
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always"
      }
    }
  },
  // optimizeDeps: {
  //   include: ['dayjs'], // 确保 dayjs 被正确打包
  // },
  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         dayjs: ['dayjs'], // 将 dayjs 打包为单独的模块
  //       },
  //     },
  //   },
  // },
});
