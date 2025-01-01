<script setup lang="ts">
import {ref, reactive, watch} from 'vue'
import {NModal, NTable, NIcon, NCheckbox} from 'naive-ui'
import {FavoriteData} from "@/types";

import {useMMStore} from "@/stores/mmStore";
import {GM_getValue, GM_setValue} from "$";

const mmStore = useMMStore();

let tableData = reactive<FavoriteData[]>([])


const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  },
})

const emits = defineEmits(["emitClose"])

watch(() => mmStore.favoriteData, (newV, oldV) => {
  tableData = [...newV] as FavoriteData[]
}, {deep: true})

const handleClose = () => {
  emits("emitClose", false)
}

const toggleHidden = (item: FavoriteData) => {
  item.folderHidden = !item.folderHidden
  if (item.folderHidden) {
    item.folderExpand = false
  }
  let gmFavList = GM_getValue("favList") as Array<[]>
  if (gmFavList) {
    let arr = gmFavList.map((o: any) => {
      if (item.favID === o.favID) {
        return {
          ...o,
          folderHidden: item.folderHidden,
          folderExpand: item.folderHidden && false
        }
      }
      return o
    })
    GM_setValue("favList", arr);
  }
}

const toggleExpand = (item: FavoriteData) => {
  item.folderExpand = !item.folderExpand
  let gmFavList = GM_getValue("favList") as Array<[]>
  if (gmFavList) {
    let arr = gmFavList.map((o: any) => {
      if (item.favID === o.favID) {
        return {
          ...o,
          folderExpand: item.folderExpand
        }
      }
      return o
    })
    GM_setValue("favList", arr);
  }
}
</script>

<template>
  <n-modal :show="props.showModal">
    <div class="mm-manage">
      <div class="mm-manage-header">
        <div class="mm-manage-header-title">收藏夹管理</div>
        <NIcon class="mm-close" size="18" title="关闭"
               @click="handleClose">
          <i class="fa-solid fa-xmark"/>
        </NIcon>
      </div>
      <div class="mm-manage-content">
        <div class="mm-description">
          Tips:
          <div>
            <NIcon style="margin-right: 3px;"><i class="fa-solid fa-eye-slash"/></NIcon>
            隐藏
          </div>
          <div>
            <NIcon style="margin-right: 3px;"><i class="fas fa-folder-open"/></NIcon>
            自动展开
          </div>
        </div>
        <n-table :bordered="true" :single-line="false">
          <thead>
          <tr>
            <th>收藏夹名</th>
            <th style="width: 80px;text-align: center">操作</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(i, k) in tableData" :key="k">
            <td>{{ i.favName }}</td>
            <td style="text-align: center">
              <div class="mm-icon-group">
                <NIcon class="mm-action-icon" @click="toggleHidden(i)">
                  <i class="fa-solid" :class="i.folderHidden ? 'fa-eye-slash' : 'fa-eye'"></i>
                </NIcon>

                <NIcon class="mm-action-icon" :class="{ disabled: i.folderHidden }"
                       :title="i.folderHidden ? '隐藏时自动展开禁用' : ''"
                       @click="i.folderHidden ? null : toggleExpand(i)">
                  <i class="fas" :class="i.folderExpand ? 'fa-folder-open' : 'fa-folder'"></i>
                </NIcon>
              </div>

            </td>
          </tr>
          </tbody>
        </n-table>

      </div>
    </div>
  </n-modal>
</template>

<style scoped lang="less">
.mm-manage {
  cursor: default;
  width: 420px;
  background-color: #fff;
  border-radius: 5px;

  .mm-manage-header {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    border-bottom: 1px solid #88888822;

    .mm-manage-header-title {
      font-size: 16px;
      font-weight: 600;
    }

    .mm-close {
      margin-left: auto;
    }
  }

  .mm-manage-content {
    padding: 10px 15px;

    .mm-description {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;

      & > div {
        background-color: #33333320;
        padding: 0 6px;
        border-radius: 4px;
      }
    }

    .mm-icon-group {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: center;

      .mm-action-icon {
        cursor: pointer;
        color: #666;
        transition: color 0.2s ease;

        &:hover:not(.disabled) {
          color: #18a058;
        }

        &.disabled {
          cursor: not-allowed;
          color: #999;
          opacity: 0.6;
        }
      }
    }


  }


}
</style>