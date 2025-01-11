<script setup lang="ts">

import {NIcon, NSelect} from "naive-ui";
import {useMMStore} from "@/stores/mmStore";
import {onMounted, ref} from "vue";
import {GM_getValue, GM_setValue} from "$";

const mmStore = useMMStore();

const mmFavShowMode = ref<number>(0);
const mmFavShowModeList = [
  {label: '总是', value: 0,},
  {label: '仅首页', value: 1,},
  {label: '手动', value: 2,},
]

/**
 * 设置 - 关闭
 */
const handleClose = () => {
  mmStore.setPanelShow('showSettings', false)
}
const handleFavShowModeUpdate = (value: number) => {
  GM_setValue('favShowMode', value)
}
onMounted(() => {
  mmFavShowMode.value = GM_getValue('favShowMode') || 0
})

</script>

<template>
  <div id="mm-setting">
    <div class="mm-panel-header">
      <NIcon size="24">
        <i class="fa-solid fa-gear"/>
      </NIcon>
      <div class="mm-header-title">设置</div>

      <NIcon class="mm-close" size="18" title="关闭"
             @click="handleClose">
        <i class="fa-solid fa-xmark"/>
      </NIcon>
    </div>
    <div class="mm-panel-content">
      <div class="mm-setting-content">
        <h3 class="mm-setting-content-title">收藏显示模式</h3>
        <n-select class="mm-setting-content-value"
                  v-model:value="mmFavShowMode"
                  size="small"
                  :options="mmFavShowModeList"
                  @update:value="handleFavShowModeUpdate"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
#mm-setting {
  width: 320px;
  max-height: calc(100vh - 70px);
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  position: fixed;
  top: 60px;
  left: 10px;
  z-index: 11;

  .mm-panel-header {
    height: 46px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    gap: 8px;
    border-bottom: 1px solid rgba(136, 136, 136, 0.133);
    padding: 8px 12px;
    color: #000;
    fill: #000;

    .mm-header-title {
      font-size: 18px;
      font-weight: 600;
    }

    //.mm-more {
    //  margin-left: auto;
    //}

    .mm-close {
      margin-left: auto;
    }
  }

  .mm-panel-content {
    padding: 6px 12px;

    .mm-setting-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &-title {
        font-size: 14px;
      }

      &-value {
        width: 120px;
      }
    }
  }
}
</style>