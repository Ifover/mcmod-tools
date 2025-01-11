<script setup lang="ts">
import {ref} from "vue"
import {NButton, NFloatButton, NIcon} from 'naive-ui'
import {useMMStore} from "@/stores/mmStore";

const mmStore = useMMStore();

const handleOpen = (d: 'showFavorite' | 'showSettings') => {
  mmStore.$patch({
    showFavorite: false,
    showSettings: false,
  })
  mmStore.setPanelShow(d, true)
}
</script>

<template>
  <div class="mm-sidebar">
    <NFloatButton class="mm-btn" width="42" position="relative"
                  :class="{disabled : mmStore.showFavorite}"
                  :right="0" :bottom="0"
                  @click="handleOpen('showFavorite')">
      <NIcon size="26">
        <i class="fa-solid fa-heart"/>
      </NIcon>
    </NFloatButton>

    <NFloatButton class="mm-btn" width="42" position="relative"
                  :class="{disabled : mmStore.showSettings}"
                  :right="0" :bottom="0"
                  @click="handleOpen('showSettings')">
      <NIcon size="26">
        <i class="fa-solid fa-gear"></i>
      </NIcon>
    </NFloatButton>
  </div>
</template>

<style scoped lang="less">
.mm-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;

  position: fixed;
  left: 0;
  top: 286px;
  z-index: 10;
  transform: translateX(-60%);

  .mm-btn {
    height: 42px;
    transition: .3s ease-out;

    &:hover {
      transform: translateX(60%);
    }

    &.disabled {
      cursor: not-allowed;
      color: #999;
      opacity: 0.6;
    }
  }


  .mm-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    &.mm-fav {
      font-size: 26px;
      color: #ccc;
    }
  }

}
</style>