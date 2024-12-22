import {GM_xmlhttpRequest} from "$";
import {useUserStore} from "@/stores/userStore";


const json2FormData = (json: any) => {
  return Object.keys(json).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
  }).join('&');
}


const request = (url: string, data: object) => {
  const userStore = useUserStore();

  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "POST",
      url,
      data: json2FormData(data),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Referer": `https://center.mcmod.cn/${userStore.userID}/`
      },
      responseType: 'json',
      onload: (response) => {
        if (response.responseText) {
          resolve(response.response);
        } else {
          reject(response);
        }
      },

    })
  })
}
export default request