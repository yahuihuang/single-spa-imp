import { apps } from "./apps.js";

export const NOT_LOADED = "NOT_LOADED"; // 應用預設狀態是未加載狀態
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 正在加載文件資源
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 此時沒有調用bootstrap
export const BOOTSTRAPPING = "BOOTSTRAPPING"; // 正在啟動，此時bootstrap調用完畢，需要表示為沒有掛載
export const NOT_MOUNTED = "NOT_MOUNTED"; // 調用mount方法
export const MOUNTED = "MOUNTED"; // 掛載成功
export const UNMOUNTING = "UNMOUNTING"; // 卸載中，卸載後為NOT_MOUNTED

// 當前應用是否被掛載 : 是否為MOUNTED
export function isActive(app) {
  return app.status == MOUNTED;
}

// 路徑匹配到才會加載應用
export function shouldBeActive(app) {
  // 如果是true，則需進行加載
  return app.activeWhen(window.location);
}

export function getAppChanges() {
  // 拿不到所有app
  const appsToLoad = []; // 需加載列表
  const appsToMount = []; // 需掛載列表
  const appsToUnmount = []; // 需卸載列表
  apps.forEach((app) => {
    const appShouldBeActive = shouldBeActive(app); // 是否需加載
    switch (app.status) {
      case NOT_MOUNTED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app); // 沒有被加載是要去加載app, 若正在加載資源說明也沒有加載過
        }
        break;
      case NOT_BOOTSTRAPPED:
      case NOT_MOUNTED:
        if (appShouldBeActive) {
          appsToMount.push(app); // 沒啟動過且沒掛載過，說明要掛載他
        }
        break;
      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app); // 正在掛載中但路不匹配了，所以要卸載
        }
        break;
      default:
        break;
    }
  });

  return { appsToLoad, appsToMount, appsToUnmount };
}
