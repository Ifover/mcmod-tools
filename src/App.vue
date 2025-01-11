<script setup lang="ts">
import MSidebar from "@/components/MSidebar.vue";
import MFavorite from "@/modules/MFavorite.vue";
import MSettings from "@/modules/MSettings.vue";

import {ref, reactive, onMounted, watch, nextTick} from "vue";
import {useMMStore} from "@/stores/mmStore";
import {GM_getValue} from "$";

const mmStore = useMMStore();

let isLogged = ref(false)

/**
 * 获取用户ID
 */
const getUserID = () => {
  let userUrlNode = document.querySelector('.top-username a') || document.querySelector('.header-user-avatar a');
  if (!userUrlNode) return null;
  let url = userUrlNode.getAttribute('href');

  let arr = url?.match(/\d+/)
  if (arr?.length) {
    mmStore.setUserID(arr[0])
    isLogged.value = true
  }
}
const showFavorite = () => {
  let favShowMode = GM_getValue('favShowMode');
  // console.log(favShowMode);
  switch (favShowMode) {
    case 1:
      // 仅首页
      let {host, pathname} = location;
      if (host === "www.mcmod.cn" && pathname === "/") {
        mmStore.setPanelShow('showFavorite', true)
      }
      break;
    case 2:
      // 手动
      mmStore.setPanelShow('showFavorite', false)
      break;
    default:
      // 全局 和 未设置的情况下
      mmStore.setPanelShow('showFavorite', true)
      break;
  }
}

onMounted(() => {
  getUserID()
  if (!isLogged.value) return;
  showFavorite()
})

</script>

<template>
  <MSidebar/>
  <MFavorite v-if="mmStore.showFavorite"/>
  <MSettings v-if="mmStore.showSettings"/>
</template>

<style lang="less" scoped>

</style>
