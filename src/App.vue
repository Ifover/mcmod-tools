<script setup lang="ts">
import MSidebar from "@/components/MSidebar.vue";
import MFavorite from "@/components/MFavorite.vue";

import {ref, reactive, onMounted} from "vue";
import {useMMStore} from "@/stores/mmStore";
import {NMessageProvider} from "naive-ui";

const mmStore = useMMStore();
// window.$message = useMessage()

let modalFavoriteShow = ref(false)

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
  }
}

/**
 * 关闭收藏窗口
 * @param b
 */
const handleFavoriteShow = (b: boolean) => {
  modalFavoriteShow.value = b
}
onMounted(() => {
  getUserID()
  if (!mmStore.userID) return;
  modalFavoriteShow.value = true
})
</script>

<template>

  <MSidebar v-if="!modalFavoriteShow"
            @event-favorite-show="handleFavoriteShow"></MSidebar>
  <MFavorite v-if="modalFavoriteShow"
             @event-favorite-show="handleFavoriteShow"></MFavorite>

</template>

<style lang="less" scoped>

</style>
