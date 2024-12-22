import {defineStore} from 'pinia';


export const useUserStore = defineStore('user', {
  state: () => ({
    userID: '0000'
  }),
  actions: {
    actionUserID(id: string) {
      this.userID = id;
    }
  }
})