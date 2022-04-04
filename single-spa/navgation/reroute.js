import {
  getAppChanges,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
} from "../applications/app.helpers.js";

function flattenFnArray(fns) {
  fns = Array.isArray(fns) ? fns : [fns];
  return function (customProps) {
    return fns.reduce(
      // 將多個promise組合成一個promise
      (resultPromise, fn) => resultPromise.then(() => fn(customProps)),
      Promise.resolve()
    );
  };
}

function toLoadPromise(app) {
  return Promise.resolve().then(() => {
    // 取得應用expose協議 (Hook)
    console.log("app.status: " + app.status);
    if (app.status != NOT_LOADED) {
      // 只有是NOT_LOADED的時才需要加載
      return app;
    }

    app.status = LOADING_SOURCE_CODE;

    // 只會加載一次
    app.loadApp().then((val) => {
      let { bootstrap, mount, unmount } = val;
      console.log("****");
      console.log(bootstrap, mount, unmount);

      app.status = NOT_BOOTSTRAPPED;
      app.bootstrap = flattenFnArray(bootstrap);
      app.mount = flattenFnArray(mount);
      app.unmount = flattenFnArray(unmount);
      bootstrap();
    });
  });
}

export function reroute() {
  // reroute中 我需要知道 要掛載那個應用 & 要卸載那個應用

  // 根據當前所有應用過濾出不同的應用類型
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges();
  console.log(appsToLoad, appsToMount, appsToUnmount);

  // 預加載
  return loadApps(); // 應用加載，就是把應用用Hook拿到 (systemjs, jsonp, fetch)

  function loadApps() {
    console.log("in loadApps()");
    console.log(appsToLoad);
    const loadPromises = appsToLoad.map(toLoadPromise);
    return Promise.all(loadPromises);
  }
}
