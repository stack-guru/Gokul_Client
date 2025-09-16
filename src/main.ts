import { Application, Assets, Sprite } from "pixi.js";
import { setupWebsocket } from "./websocket";
import { initAssets } from "./asset";
import { onUpdate } from "./process";

// Create a new application
export const app = new Application();

(async () => {
  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  await initAssets();
  setupWebsocket(onUpdate);

  app.ticker.add((time) => {

  });
})();
