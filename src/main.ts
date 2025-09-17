import { Application } from "pixi.js";
import { setupWebsocket } from "./websocket";
import { initAssets } from "./asset";
import { onUpdate, setupGraphic, process } from "./game";
import { generateBackgroundSpots, drawBackground } from "./object/background";
import { getRandomVibrantColor } from "./object/snake";
import { Snake } from "./object/snake";
import { Food } from "./object/food";

// Create a new application
export const app = new Application();

(async () => {
  /*
    // Initialize the application
    await app.init({ background: "#1099bb", resizeTo: window });
    // Append the application canvas to the document body
    document.getElementById("pixi-container")!.appendChild(app.canvas);
  */
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');

  if (ctx) {
    // ctx.fillStyle = '#RRGGBB'; // Replace RRGGBB with your desired hex color code
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    generateBackgroundSpots();
    drawBackground(canvas, ctx);

    const randomColor = getRandomVibrantColor();
    const snake = new Snake(600, 256, randomColor); // used ONLY for drawing reference defaults
    snake.draw(ctx);

    const food = new Food(50, 50);
    food.draw(ctx);
  }

  await setupGraphic();
  await initAssets();
  setupWebsocket(onUpdate);

  app.ticker.add((time) => {
    process()
  });
})();
