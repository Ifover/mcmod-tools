import {createApp} from 'vue';
import {createPinia} from "pinia";
import {Button, Tree} from "ant-design-vue";

import './style.less';
import App from './App.vue';

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(Button)
app.use(Tree)

const appScroll = (nodeDiv: any) => {
  const node: Element | null = document.querySelector('.center .main .news_block')
  if (node) {
    let top = node.getBoundingClientRect().top
    // console.log(top);
    let _top = 0
    switch (true) {
      case top >= 60 && top <= 270:
        _top = top
        break;
      case top < 60:
        _top = 70
        break;
      case top > 270:
        _top = 286
        break;
    }
    nodeDiv.style.top = `${_top}px`;
  }
}
app.mount(
  (() => {
    const nodeDiv = document.createElement('div');
    nodeDiv.id = 'app'
    document.body.append(nodeDiv);
    appScroll(nodeDiv)
    window.addEventListener('scroll', function () {
      appScroll(nodeDiv)
    })

    return nodeDiv;
  })(),
);
