import {
  BOOTSTRAPPING,
  getAppChanges,
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPPED,
  NOT_LOADED,
  NOT_MOUNTED,
  shouldBeActive,
  UNMOUNTING,
} from "../applications/app.helpers.js";
import { started } from "../start.js";

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
    if (app.status !== NOT_LOADED) {
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

function toUnmountPromise(app) {
  return Promise.resolve().then(() => {
    // 如果非掛載狀態，直接跳出
    if (app.status !== MOUNTED) {
      return app;
    }
    app.status = UNMOUNTING; // 標記正在卸載，調用卸載邏輯，並且標記成未掛載
    app.unmount(app.customProps).then(() => {
      app.status = NOT_MOUNTED;
    });
  });
}

function toBootStrapPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_BOOTSTRAPPED) {
      return app;
    }
    app.status = BOOTSTRAPPING;
    return app.bootstrap(app.customProps).then(() => {
      app.status = NOT_MOUNTED;
      return app;
    });
  });
}

function toMountPromise(app) {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) {
      return app;
    }
    return app.bootstrap(app.customProps).then(() => {
      app.status = MOUNTED;
      return app;
    });
  });
}

function tryBootstrapAndMount(app, unmountPromises) {
  return Promise.resolve().then(() => {
    if (shouldBeActive(app)) {
      return toBootStrapPromise(app).then((app) =>
        unmountPromises.then((app) => toMountPromise(app))
      );
    }
  });
}

export function reroute() {
  // reroute中 我需要知道 要掛載那個應用 & 要卸載那個應用
  // 根據當前所有應用過濾出不同的應用類型
  const { appsToLoad, appsToMount, appsToUnmount } = getAppChanges(); // 每次肭需知道當前應用是否需掛載
  console.log("***************************");
  console.log(appsToLoad, appsToMount, appsToUnmount);
  console.log("started: " + started);
  if (started) {
    return performAppChanges();
  }

  // 預加載
  //   setTimeout(() => {
  //     console.log("timeout 1000 ");
  //   }, 1000);
  return loadApps(); // 應用加載，就是把應用用Hook拿到 (systemjs, jsonp, fetch)

  function loadApps() {
    console.log("in loadApps()");
    console.log(appsToLoad);
    const loadPromises = appsToLoad.map(toLoadPromise);
    return Promise.all(loadPromises);
  }

  function performAppChanges() {
    // 需要調用bootstrap, mount, unmount
    // 應用啟動了 需要卸載不需要的應用 => 卸載
    // 應用可能沒有加載過 (若沒加載，需要先加載) => 掛載需要的應用
    let unmountPromises = Promise.all(appsToUnmount.map(toUnmountPromise));

    console.log("appsToLoad: " + appsToLoad);
    appsToLoad.map((app) =>
      toLoadPromise(app)
        .then((app) => tryBootstrapAndMount(app, unmountPromises))
        .then(() => {
          console.log("加載完畢");
        })
    );

    appsToMount.map((app) => tryBootstrapAndMount(app, unmountPromises));
  }
}
