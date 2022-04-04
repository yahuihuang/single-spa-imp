import { getAppChanges } from "../applications/app.helpers.js";

export function reroute() {
  // reroute中 我需要知道 要掛載那個應用 & 要卸載那個應用

  // 根據當前所有應用過濾出不同的應用類型
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges();
  console.log(appsToLoad, appsToMount, appsToUnmount);
}
