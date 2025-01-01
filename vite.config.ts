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
        match: ['https://*.mcmod.cn/*'],
        require: 'https://kit.fontawesome.com/d4dda3d6cc.js',
        connect: 'center.mcmod.cn',
      },
      build: {
        fileName: "mcmod-tools.user.js",
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js')
            .concat('https://unpkg.com/vue-demi@latest/lib/index.iife.js')
            .concat(util.dataUrl(';window.Vue=Vue;')),

          pinia: cdn.jsdelivr('Pinia', 'dist/pinia.iife.prod.js'),
          "naive-ui": cdn.unpkg('naive', 'dist/index.prod.js')
        },
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
});
