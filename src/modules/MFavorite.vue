<script setup lang="ts">
import {ref, reactive, computed, onMounted, VNodeChild, h} from 'vue'
import {NTree, NIcon, NScrollbar, NDropdown, NSkeleton,} from 'naive-ui'
import type {TreeOption} from 'naive-ui'
import {FavoriteData} from "@/types";
import {GM_getValue, GM_setValue} from "$";
import MManage from "@/components/MManage.vue";
import {useMMStore} from "@/stores/mmStore";
import requests from "@/requests";


const mmStore = useMMStore();

let isLoading = ref(true);
let draggable = ref(true);

const mmDropDownOptions = ref([
  {
    label: '刷新',
    key: 'reload',
  },
  {
    label: '收藏夹管理',
    key: 'manage'
  }
])
let mmTreeData = ref<TreeOption[]>([])

let mmDefaultExpandedKeys = reactive<string[]>([]);
let mmManageShow = ref(false)

const categoryEm = {
  class: 'mod',
  mod: 'class',
  modpack: 'modpack',
}


/**
 * 收藏 - 关闭
 */
const handleClose = () => {
  mmStore.setPanelShow('showFavorite', false)
}

/**
 * 刷新
 */
const handleReload = () => {
  isLoading.value = true;
  mmTreeData.value = [];
  getFavoriteFold();
}

const eventClose = () => {
  mmManageShow.value = false
  handleReload()
}
/**
 * 获取用户收藏文件夹列表
 */
const getFavoriteFold = async () => {
  let u = "https://center.mcmod.cn/frame/CenterFavoriteFold/";
  let d = {
    uid: mmStore.userID,
    data: JSON.stringify({})
  }

  let res: any = await requests(u, d)
  let {state, html} = res
  if (state !== 0) return;

  let node = new DOMParser().parseFromString(html, 'text/html');
  let nodeList = node.querySelectorAll('.favorite-fold-list ul > a')
  let _favList: Array<any> = []

  nodeList.forEach((n, i) => {
    let favID = n.getAttribute('data-id');
    let favName = n.querySelector('li span[class="title"]')?.getAttribute('title');

    // x 个模组, x 个整合包
    let c = n.querySelector('li span[class="count"]')?.getAttribute('title');
    let modCount: Number = 0, modPackCount: Number = 0
    if (c) {
      c.split(',').forEach((o: string) => {
        let modMatch = o.match(/(\d+).个模组/)
        if (modMatch && modMatch.length) modCount = parseInt(modMatch[1])

        let modPackMatch = o.match(/(\d+).个整合包/)
        if (modPackMatch && modPackMatch.length) modPackCount = parseInt(modPackMatch[1])
      })
    }

    _favList.push({
      key: favID,
      label: favName,
      modCount,
      modPackCount,
      isLeaf: false,
    })
  })
  if (!_favList.length) return
  parseData(_favList)
}

/**
 * 加载 Mod|整合包 信息
 * @param node
 */
const onLoadData = async (node: TreeOption) => {
  return new Promise<void>(async (resolve) => {
    let {key, modCount, modPackCount, children} = node
    if (children) {
      resolve();
      return;
    }

    let modArr: Array<any> = []
    const getFavList = async (category: string) => {
      let u = "https://center.mcmod.cn/frame/CenterFavoriteSoltPage/";
      let d = {
        uid: mmStore.userID,
        data: JSON.stringify({
          fold: key,
          category: category
        })
      }

      let res: any = await requests(u, d)
      let {state, html} = res
      if (state !== 0) return;
      let childrenNode = new DOMParser().parseFromString(html, 'text/html');
      let nodeList = childrenNode.querySelectorAll('.favorite-slot-ul li')

      nodeList.forEach(n => {
        let modID = n.getAttribute('data-id')
        let modURL = n.querySelector('span[class="cover"] a')?.getAttribute('href')
        let _modInfoNode = n.querySelector('span[class="cover"] img')
        let modPic = _modInfoNode?.getAttribute('src');
        let modName = _modInfoNode?.getAttribute('alt');

        modArr.push({
          label: modName,
          key: modID,
          modPic,
          modURL,
          mode: category === 'class' ? 'mod' : 'modpack',
          parentKey: key,
          isLeaf: true,
        });
      })
    }

    if (modCount) {
      modArr.push({
        label: `模组 (${modCount})`,
        mode: 'mod',
        parentKey: key,
        disabled: true,
        isLeaf: true,
      })
      await getFavList('class')
    }
    if (modPackCount) {
      modArr.push({
        label: `整合包 (${modPackCount})`,
        mode: 'modpack',
        parentKey: key,
        disabled: true,
        isLeaf: true,
      })
      await getFavList('modpack')
    }

    if (modCount === 0 && modPackCount === 0) {
      modArr.push({
        label: `这个收藏夹是空的。`,
        disabled: true,
        isLeaf: true,
      })
    }

    node.children = modArr
    resolve()
  })
}

const parseData = (treeData: TreeOption[]) => {
  let gmFavList: FavoriteData[] = GM_getValue("favList");
  let mmFavList: TreeOption[];

  if (gmFavList && gmFavList.length) {
    // 收藏列表展示
    mmFavList = treeData.filter((item: TreeOption) => {
      let o = gmFavList.find((i: FavoriteData) => i.favID === item.key)
      if (o && o.folderHidden === false) {
        return {
          ...item
        }
      }
    })

    // 收藏管理表格更新
    gmFavList = treeData.map((item: TreeOption) => {
      let o = gmFavList.find((i: FavoriteData) => i.favID === item.key)
      return {
        favID: item.key,
        favName: item.label,
        folderHidden: o ? o.folderHidden : false,
        folderExpand: o ? o.folderExpand : false
      }
    }) as FavoriteData[]

    // 获取默认展开项
    mmDefaultExpandedKeys = gmFavList
      .filter((item: FavoriteData) => item.folderExpand)
      .map((item: FavoriteData) => item.favID) as string[]

  } else {
    gmFavList = treeData.map((item: TreeOption) => {
      return {
        favID: item.key,
        favName: item.label,
        folderHidden: false,
        folderExpand: false
      }
    }) as FavoriteData[]

    mmFavList = treeData
  }


  GM_setValue("favList", gmFavList);
  mmStore.setFavoriteData(gmFavList)
  mmTreeData.value = mmFavList
  isLoading.value = false
}

const handleDropDownSelect = (key: string) => {
  switch (key) {
    case 'manage':
      mmManageShow.value = true
      break;
    case 'reload':
      handleReload()
      break;
  }

}

const treeRenderSwitcherIcon = (node: { option: TreeOption, expanded: boolean, selected: boolean }): VNodeChild => {
  const {expanded} = node
  let nodeIcon = h("i", {
    class: `fas fa-folder${expanded ? '-open' : ''}`,
  })
  return [nodeIcon]
}

const treeRenderLabel = (node: { option: TreeOption, checked: boolean, selected: boolean }): VNodeChild => {
  const {key, label, modPic, modURL, modCount, modPackCount} = node.option
  if (modURL) {
    let nodeImg = h("img", {class: "mm-fav-cover", src: modPic})
    let nodeTitle = h("span", {class: "mm-fav-label"}, label)

    let nodeA = h("a", {
      href: modURL,
      title: label,
      target: "_blank"
    }, h("div", {class: "mm-fav-list"}, [nodeImg, nodeTitle]))
    return [nodeA]
  }

  if (!modURL) {
    let nodeArr = [h("span", {class: "mm-fav-label-lv1"}, label)]

    if (modCount) {
      let nodeModCount = h("span", {
        class: "mm-fav-label-icon",
        title: "模组"
      }, [h("i", {class: "fa fa-cubes"}), " x" + modCount])
      nodeArr.push(nodeModCount)
    }
    if (modPackCount) {
      let nodeModPackCount = h("span", {
        class: "mm-fav-label-icon",
        title: "整合包"
      }, [h("i", {class: "fa fa-file-zip-o"}), " x" + modPackCount])
      nodeArr.push(nodeModPackCount)
    }

    return nodeArr
  }


}

const findSiblingsAndIndex = (node: TreeOption, nodes?: TreeOption[]): [TreeOption[], number] | [null, null] => {
  if (!nodes) return [null, null];

  for (let i = 0; i < nodes.length; ++i) {
    const siblingNode = nodes[i]
    if (siblingNode.key === node.key)
      return [nodes, i]
    const [siblings, index] = findSiblingsAndIndex(node, siblingNode.children)
    if (siblings && index !== null)
      return [siblings, index]
  }
  return [null, null]
}

const treeDrop = async (data: {
  node: TreeOption,
  dragNode: TreeOption,
  dropPosition: 'before' | 'inside' | 'after',
  event: DragEvent
}) => {
  draggable.value = false
  let {node, dragNode, dropPosition} = data
  // console.log(node, dragNode, dropPosition);
  // console.log(dragNode);
  let str
  if (node.mode !== dragNode.mode) {
    str = dragNode.mode === 'mod' ? "你不能把模组放到整合包内" : "你不能把整合包放到模组内"
  }
  if (node.parentKey !== dragNode.parentKey) {
    str = "你不能跨收藏夹操作"
    if (node.mode !== dragNode.mode) {
      str += dragNode.mode === 'mod' ? "，更不能把模组放到整合包内" : "，更不能把整合包放到模组内"
    }
  }
  if (str) {
    window.$message.warning(str)
    draggable.value = true
    return;
  }
  const [dragNodeSiblings, dragNodeIndex] = findSiblingsAndIndex(dragNode, mmTreeData.value)
  if (dragNodeSiblings === null || dragNodeIndex === null) return
  dragNodeSiblings.splice(dragNodeIndex, 1)
  if (dropPosition === 'after') {
    const [nodeSiblings, nodeIndex] = findSiblingsAndIndex(node, mmTreeData.value)
    if (nodeSiblings === null || nodeIndex === null) return;
    nodeSiblings.splice(nodeIndex + 1, 0, dragNode)
  }
  let arr: TreeOption[] = dragNodeSiblings.filter((o: TreeOption) => o.mode === dragNode.mode && !o.disabled)
  let objList: Record<number, string> = {}
  for (let i = 0; i < arr.length; i++) {
    objList[i] = arr[i].key as string
  }

  let u = "https://center.mcmod.cn/action/doFavoriteSortSlot/"
  let sortData = {
    data: JSON.stringify({
      fold: dragNode.parentKey,
      category: categoryEm[dragNode.mode as 'mod' | 'modpack'],
      list: objList
    })
  }
  // console.log(sortData);
  let res: any = await requests(u, sortData)
  let {state} = res
  draggable.value = true
  if (state !== 0) return;

  mmTreeData.value = Array.from(mmTreeData.value)
}
onMounted(() => {
  getFavoriteFold()
})
</script>

<template>
  <div id="mm-favorites">
    <div class="mm-panel-header">
      <NIcon size="24">
        <i class="fas fa-star"/>
      </NIcon>
      <div class="mm-header-title">收藏</div>
      <n-dropdown trigger="click"
                  :options="mmDropDownOptions"
                  @select="handleDropDownSelect">
        <NIcon class="mm-more" size="18" title="更多">
          <i class="fa-solid fa-ellipsis"/>
        </NIcon>
      </n-dropdown>


      <NIcon class="mm-close" size="18" title="关闭"
             @click="handleClose">
        <i class="fa-solid fa-xmark"/>
      </NIcon>
    </div>
    <div class="mm-panel-content" style="--height:calc(100vh - 122px)">
      <div class="mm-skeleton" v-if="isLoading">
        <NSkeleton text :repeat="2"></NSkeleton>
      </div>
      <NScrollbar v-else style="max-height: var(--height);">
        <n-tree
          block-line
          expand-on-click
          :default-expanded-keys="mmDefaultExpandedKeys"
          :draggable="true"
          :selectable="false"
          :data="mmTreeData"
          :on-load="onLoadData"
          :render-switcher-icon="treeRenderSwitcherIcon"
          :render-label="treeRenderLabel"
          @drop="treeDrop">
          <template #empty>
            <p class="mm-empty">暂无收藏夹。</p>
          </template>
        </n-tree>
      </NScrollbar>
    </div>
    <MManage :showModal="mmManageShow"
             @emit-close="eventClose"></MManage>

  </div>
</template>

<style scoped lang="less">
#mm-favorites {
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

    .mm-more {
      margin-left: auto;
    }

    //.mm-close {
    //  margin-left: auto;
    //}
  }

  .mm-panel-content {
    padding: 6px 12px;

    .mm-empty {
      text-align: center;
    }
  }
}

:deep(.n-tree) {
  .n-tree-node-switcher.n-tree-node-switcher--expanded {
    transform: none;
  }

  .n-tree-node-wrapper:has(.mm-fav-label-lv1) {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: #fff;

    &:has(.n-tree-node-switcher--hide) {
      top: 30px;
    }
  }


  a {
    text-decoration: none;

    &:hover * {
      color: #2575f9;
    }
  }

  .mm-fav-label-icon {
    font-size: 12px;
    margin-left: 8px;
    color: #888;
  }

  .mm-fav-list {
    display: flex;
    align-items: center;
    padding: 2px 0;
    cursor: pointer;

    .mm-fav-cover {
      width: 60px;
      opacity: .77;
      margin-right: 6px;
    }

    .mm-fav-label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }


}
</style>