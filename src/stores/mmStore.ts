import {defineStore} from 'pinia';


export const useMMStore = defineStore('mm', {
  state: () => ({
    userID: '0000',
    favoriteData: []
  }),
  actions: {
    setUserID(id: string) {
      this.userID = id;
    },
    setFavoriteData(data: any) {
      this.favoriteData = data;
    }
  }
})