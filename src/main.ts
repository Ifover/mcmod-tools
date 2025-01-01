import {createApp} from 'vue';
import {createPinia} from "pinia";
import {createDiscreteApi} from 'naive-ui'

import './style.less';
import App from './App.vue';

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

const {message} = createDiscreteApi(['message']);
window.$message = message;

app.mount(
  (() => {
    const nodeDiv = document.createElement('div');
    nodeDiv.id = 'mm-main'
    document.body.append(nodeDiv);

    return nodeDiv;
  })(),
);
