import { reroute } from "./navgation/reroute.js";

export let started = false;

export function start() {
  started = true; //開始啟動
  console.log("start()");
  reroute();
}
