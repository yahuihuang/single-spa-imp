import { reroute } from "../navgation/reroute.js";
import { NOT_MOUNTED } from "./app.helpers.js";

/**
 *
 * @param {*} appName 應用名稱
 * @param {*} loadApp 應用加載函數，此函數會返回bootstrap mount unmount
 * @param {*} activeWhen 當前什麼時候激活 location => location.hash == '#/a'
 * @param {*} customProps 用戶自定義參數
 */
export const apps = []; // 存放所有的應用
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  console.log("registerApplication()");

  const registeration = {
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_MOUNTED,
  };
  apps.push(registeration); // 保存到數組中，之後可以在數組裡需要的app的 bootstrap mount unmount

  // 需要加載應用， 註冊完畢後 需要進行應用的加載
  reroute(); // 重寫路徑，後續切換路由 要再次做這些事，single spa的核心；與導航相關
}
