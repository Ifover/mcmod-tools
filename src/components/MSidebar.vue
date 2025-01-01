<script setup lang="ts">
import {ref} from "vue"
import {NButton, NFloatButton, NIcon} from 'naive-ui'

let modalShow = ref(false)

const emits = defineEmits(["eventFavoriteShow"])
const handleOpen = () => {
  emits("eventFavoriteShow", true)
}
</script>

<template>
  <div class="mm-sidebar" v-if="!modalShow">
    <NFloatButton class="mm-btn"
                  width="42" position="relative"
                  :right="0" :bottom="0"
                  @click="handleOpen">
      <NIcon size="26">
        <i class="fa-regular fa-heart"/>
      </NIcon>
    </NFloatButton>
  </div>
</template>

<style scoped lang="less">
.mm-sidebar {
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