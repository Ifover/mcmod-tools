<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import HelloWorld from './components/HelloWorld.vue';
// import viteLogoUrl from './assets/vite.svg';
// import vueLogoUrl from './assets/vue.svg';
import {ref, reactive, nextTick, onMounted} from "vue";
import requests from "./requests";
import {useUserStore} from "./stores/userStore";
import type {TreeProps} from 'ant-design-vue';

const userStore = useUserStore();

let modalShow = ref(true)

const expandedKeys = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);
let treeFavData = ref<TreeProps['treeData']>([])

type DataRef = {
  favID: string | undefined
  favName: string | undefined
  modCount: number | 0
  modPackCount: number | 0
  key: string | undefined
  title: string | undefined
  children: any | undefined
  isLeaf?: boolean
}

/**
 * 获取用户ID
 */
const getUserID = () => {
  let userUrlNode = document.querySelector('.top-username a')
  if (!userUrlNode) return null;
  let url = userUrlNode.getAttribute('href');

  let arr = url?.match(/\d+/)
  if (arr?.length) {
    userStore.actionUserID(arr[0])
  }
}
/**
 * 获取用户收藏文件夹列表
 */
const getFavoriteFold = async () => {
  let u = "https://center.mcmod.cn/frame/CenterFavoriteFold/";
  let d = {
    uid: userStore.userID,
    data: JSON.stringify({})
  }

  let res: any = {}
  res = await requests(u, d)
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
      favID,
      favName,
      title: favName,
      modCount,
      modPackCount,
    })
  })

  treeFavData.value = _favList
}

/**
 * 加载 Mod|整合包 信息
 * @param treeNode
 */
const onLoadData: TreeProps['loadData'] = treeNode => {
  return new Promise<void>(async resolve => {
    let {favID, favName, modCount, modPackCount, key, title, children, isLeaf} = treeNode.dataRef as DataRef
    if (children) {
      resolve();
      return;
    }

    let modArr: Array<any> = []

    const getFavList = async (category: string) => {
      let u = "https://center.mcmod.cn/frame/CenterFavoriteSoltPage/";
      let d = {
        uid: userStore.userID,
        data: JSON.stringify({
          fold: key,
          category: category
        })
      }

      let res: any = {}
      res = await requests(u, d)
      let {state, html} = res
      if (state !== 0) return;
      let node = new DOMParser().parseFromString(html, 'text/html');
      let nodeList = node.querySelectorAll('.favorite-slot-ul li')

      nodeList.forEach(n => {
        let modID = n.getAttribute('data-id')
        let modURL = n.querySelector('span[class="cover"] a')?.getAttribute('href')
        let _modInfoNode = n.querySelector('span[class="cover"] img')
        let modPic = _modInfoNode?.getAttribute('src');
        let modName = _modInfoNode?.getAttribute('alt');
        // console.log(modID, modPic, modURL, modName);

        modArr.push({
          title: modName,
          key: modID,
          modPic,
          modURL,
          class: 'mm_tree_lv2',
          isLeaf: true,
        });
      })
    }
    if (modCount) {
      modArr.push({
        title: `模组 (${modCount})`,
        disabled: true,
        class: 'mm_tree_lv2',
        isLeaf: true,
      })
      await getFavList('class')
    }

    if (modPackCount) {
      modArr.push({
        title: `整合包 (${modPackCount})`,
        disabled: true,
        class: 'mm_tree_lv2',
        isLeaf: true,
      })
      await getFavList('modpack')
    }

    if (modCount === 0 && modPackCount === 0) {
      modArr.push({
        title: `这个收藏夹是空的。`,
        disabled: true,
        class: 'mm_tree_lv2',
        isLeaf: true,
      })
    }

    if (treeNode.dataRef) treeNode.dataRef.children = modArr
    resolve();
  });
};

onMounted(() => {
  getUserID()
  if (!userStore.userID) return;
  // userID.value = id
  getFavoriteFold()
})

const handleTreeSelect: TreeProps['onSelect'] = (sKeys, info) => {
  expandedKeys.value = sKeys as string[];
}


</script>

<template>
  <div class="mm_sidebar" v-if="!modalShow">
    <i class="fa-solid fa-star mm_sidebar_fav"
       @click="modalShow = true"/>
  </div>
  <div class="mm_header" v-if="modalShow">
    <a-button class="mm_close" type="link" size="small"
              @click="modalShow = false">
      <i class="fa-solid fa-xmark"></i>
    </a-button>
  </div>
  <div class="mm_content" v-if="modalShow">
    <a-tree
      v-if="treeFavData && treeFavData.length"
      v-model:expandedKeys="expandedKeys"
      v-model:selectedKeys="selectedKeys"
      :blockNode="true"
      :show-line="false"
      :show-icon="false"
      :selectable="false"
      :tree-data="treeFavData"
      :load-data="onLoadData"
      @select="handleTreeSelect"
    >
      <template #switcherIcon="{expanded}">
        <i class="fas fa-folder-open" v-if="expanded"></i>
        <i class="fas fa-folder" v-else></i>
      </template>

      <template #title="{ title, key, modPic, modURL, modCount, modPackCount }">
        <template v-if="modURL">
          <!--          <a-tooltip></a-tooltip>-->
          <!--          <template #title>{{ title }}</template>-->
          <a target="_blank" :href="modURL" :title="title">
            <div class="mm_fav_li">
              <img v-if="modPic" class="mm_fav_cover" :src="modPic" :alt="title"/>
              <span class="mm_fav_title">{{ title }}</span>
            </div>
          </a>
        </template>
        <template v-else>
          <span>{{ title }}</span>
          <span v-if="modCount" title="模组" class="mm_title_icon">
            <i class="fa fa-cubes"/> x{{ modCount }}
          </span>
          <span v-if="modPackCount" title="整合包" class="mm_title_icon">
            <i class="fa fa-file-zip-o"/> x{{ modPackCount }}
          </span>
          <span class="mm_title_icon" v-if="modCount === 0 && modPackCount === 0">空收藏夹</span>
        </template>
      </template>
    </a-tree>
    <p v-else class="mm_empty">暂无收藏夹。</p>
  </div>
  <!--  <HelloWorld msg="Vite + Vue" />-->
</template>

<style lang="less" scoped>
@import "./style.less";

.mm_sidebar {
  cursor: pointer;
  position: fixed;
  left: -24px;

  &:hover {
    left: 0;
    transition: .3s ease-out;
  }

  .mm_sidebar_fav {
    box-sizing: content-box;
    width: 26px;
    height: 26px;
    font-size: 26px;
    padding: 8px;
    color: #ccc;
  }
}

.mm_header {
  height: 24px;
  border-radius: 4px 4px 0 0;
  //background-color: @bg-color;
  background-color: #cccccc;
  padding: 0 5px;
  text-align: right;

  .mm_close {
    cursor: pointer;
    color: #191919;
  }
}

.mm_content {
  max-height: 484px;
  overflow-y: scroll;
  padding: 0 8px 6px 8px;
  margin-top: 6px;

  .mm_fav_li {
    /*width: 300px;*/
    display: flex;
    align-items: center;
    padding: 2px 0;
    cursor: pointer;

    .mm_fav_cover {
      width: 60px;
      opacity: .77;
      margin-right: 6px;
    }

    .mm_fav_title {
      width: 182px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }


  }

  .mm_empty {
    text-align: center;
    padding: 12px 0;
  }
}

/* 滚动条美化 */
&::-webkit-scrollbar {
  width: 8px;
}

&::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  //border-radius: 0 0 4px 0;
}

&::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  //border-radius: 0 0 4px 0;
}


:deep(.mm_tree_lv2) {
  .ant-tree-switcher.ant-tree-switcher-noop {
    width: 12px;
  }

  .ant-tree-title {
    a {
      text-decoration: none;
      cursor: pointer;

      &:hover * {
        color: #2575f9;
      }
    }

  }

}

:deep(.ant-tree ) {
  background-color: transparent;

  .ant-tree-title {
    display: flex;
    align-items: center;

    a {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      //width: 230px;
    }

    .mm_title_icon {
      font-size: 12px;
      margin-left: 5px;
      color: #888;
    }
  }

  .ant-tree-treenode {
    &.ant-tree-treenode-switcher-close,
    &.ant-tree-treenode-switcher-open,
    &.ant-tree-treenode-disabled {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: @bg-color;
    }

    &.ant-tree-treenode-disabled {
      top: 28px;
    }
  }
}

</style>
