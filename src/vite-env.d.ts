/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />
//// <reference types="vite-plugin-monkey/global" />

import { MessageApi } from 'naive-ui';

declare global {
  interface Window {
    $message: MessageApi;
  }
}