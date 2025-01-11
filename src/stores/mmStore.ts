import {defineStore} from 'pinia';


export const useMMStore = defineStore('mm', {
  state: () => ({
    userID: '0000',
    favoriteData: [],

    showFavorite: false,
    showSettings: false,
  }),
  actions: {
    setUserID(id: string) {
      this.userID = id;
    },
    setFavoriteData(data: any) {
      this.favoriteData = data;
    },
    setPanelShow(data: 'showFavorite' | 'showSettings', b: boolean) {
      this[data] = b;
    }
  }
})