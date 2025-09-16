import { Application, Assets, Sprite } from "pixi.js";
import { setupWebsocket } from "./websocket";
import { initAssets } from "./asset";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  // await initAssets();
  setupWebsocket();

  app.ticker.add((time) => {

  });
})();
