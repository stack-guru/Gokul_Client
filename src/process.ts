import { Texture, Sprite } from "pixi.js";
import { app as PIXIApp } from "./main";
import { rgbToHex, randomNumber, adjustBrightnessRGB, drawDebugRect } from "./utils";
import {
    headTexture,
    eyesTexture,
    eyeTexture,
    bodyTexture1,
    bodyTexture2,
    bodyTexture3,
    bodyTexture4,
    bkTexture,
    glowTexture
} from "./asset";
import { GameObjects } from "./type";
import { HEAD_EYES } from "./constant";

let gId = 0;
let prevData = null;
let gameObjects: GameObjects = {
    units: {},
    dynamics: {},
    statics: {}
};
let cameraX = 0;//camera target
let cameraY = 0;
let pivotX = 0;
let pivotY = 0;
let mySnakeH = null;
let mySnakeId = -1;
const DEBUG = false;

function CreateCircle(texture: Texture, x: number, y: number, z: number, scale = 1, rot = 0) {
    // gId++;
    // const sprite = new Sprite(texture);
    // sprite.position.set(x, y); // Set x and y coordinates
    // sprite.anchor.set(0.5); // Set anchor point to the center for rotation/scaling around the center
    // sprite.scale.set(scale); // Double the size
    // sprite.rotation = rot;//Math.PI / 4; // Rotate 45 degrees
    // sprite.zIndex = z; // Lower zIndex
    // //PIXIApp.stage.addChild(sprite);
    // PIXICam.addChild(sprite);

    // sprite.REMOVE = 0;//flag to remove
    // return sprite;
}

export function onUpdate(pId: number, x: number, y: number, data: any) {
    prevData = data; //SAVE
    let obj, id;
    const fspeed = 0.1;

    //MATCH SERVER COLORS
    const COLORS = [
        rgbToHex(255, 255, 255), // original white
        rgbToHex(255, 182, 193), // light pink
        rgbToHex(173, 216, 230), // light blue
        rgbToHex(144, 238, 144), // light green
        rgbToHex(255, 218, 185), // peach
        rgbToHex(221, 160, 221), // plum
        rgbToHex(255, 255, 224), // light yellow
        rgbToHex(176, 196, 222), // light steel blue
        rgbToHex(255, 192, 203), // pink
        rgbToHex(152, 251, 152)  // pale green
    ];
    const COLORS_RGB = [
        [255, 255, 255], // original white
        [255, 182, 193], // light pink
        [173, 216, 230], // light blue
        [144, 238, 144], // light green
        [255, 218, 185], // peach
        [221, 160, 221], // plum
        [255, 255, 224], // light yellow
        [176, 196, 222], // light steel blue
        [255, 192, 203], // pink
        [152, 251, 152]  // pale green
    ];

    for (id in data.dynamics) {
        if (data.dynamics.hasOwnProperty(id)) {
            obj = data.dynamics[id];
            if (gameObjects.dynamics.hasOwnProperty(id)) {
                let fObj = gameObjects.dynamics[id];
                fObj.tx = obj[1]; fObj.ty = obj[2];
                fObj.width = obj[5]; fObj.height = obj[6];

                //fade in / out
                if (fObj.ADIR === 0) {
                    fObj.alpha -= fspeed;
                    if (fObj.alpha < 0.2) {
                        fObj.alpha = 0.2;
                        fObj.ADIR = 1;
                    }
                } else {
                    fObj.alpha += fspeed;
                    if (fObj.alpha > 1) {
                        fObj.alpha = 1;
                        fObj.ADIR = 0;
                    }
                }
            }
            else {
                //console.log('CreateCircle ' + obj[0])
                //console.log(obj)
                //gameObjects.dynamics[id] = GFX.add.image(obj[1], obj[2], 'd' + obj[0]);//type
                gameObjects.dynamics[id] = CreateCircle(headTexture, obj[1], obj[2], obj[3], 1);
                //let COLORS =  ["f5e0dc", "f2cdcd", "f5c2e7", "cba6f7", "f38ba8", "eba0ac", "fab387", "f9e2af",
                //"a6e3a1", "94e2d5", "89dceb", "74c7ec", "89b4fa", "b4befe"];
                //COLORS = ['EAB999', '00ff88', 'ff4400', '0088ff', 'aa44ff', 'ffaa00']
                //sprite.alpha = 0.5;

                //{ name: 'Classic', color:  },                { name: 'Neon', color: '#00ff88' },                { name: 'Fire', color: '#ff4400' },
                //{ name: 'Ocean', color: '#0088ff' },                { name: 'Purple', color: '#aa44ff' },                { name: 'Gold', color: '#ffaa00' }

                gameObjects.dynamics[id].tint = COLORS[randomNumber(COLORS.length - 1)];//rgbToHex(RandInt(256), RandInt(256), RandInt(256));
                gameObjects.dynamics[id].tx = obj[1];
                gameObjects.dynamics[id].ty = obj[2];
                gameObjects.dynamics[id].width = obj[5]
                gameObjects.dynamics[id].height = obj[6];
                gameObjects.dynamics[id].TYPE = obj[0];
                gameObjects.dynamics[id].alpha = 0.5
                gameObjects.dynamics[id].ADIR = randomNumber(1);

                //Always glow
                //gameObjects.dynamics[id].filters = [PIXICam.GLOW_FILTER];//ON GLOW

                //gameObjects.dynamics[id].filters = [new PIXI.filters.BlurFilter(5)]; // Adjust blur amount
                //gameObjects.dynamics[id].blendMode = PIXI.BLEND_MODES.ADD;
                //if(obj[0] < 7){ gameObjects.dynamics[id].depth = 1; }
                //else {gameObjects.dynamics[id].depth = 2;}
            }
        }
    }

    let gspeed = 0.1;
    for (id in data.units) {
        if (data.units.hasOwnProperty(id)) {
            obj = data.units[id];
            if (gameObjects.units.hasOwnProperty(id)) { //update
                let existingObj = gameObjects.units[id];
                existingObj.tx = obj[1];
                existingObj.ty = obj[2];
                existingObj.width = obj[5];
                existingObj.height = obj[6];
                existingObj.rotation = obj[8];
                //                existingObj.rotation = obj[8] +  0.785398  * 2;

                if (existingObj.EYES !== null) {
                    existingObj.EYES.width = obj[5];
                    existingObj.EYES.height = obj[6];
                    existingObj.EYES.rotation = obj[8];
                }
                if (existingObj.EYES1 !== null) {
                    existingObj.EYES1.width = obj[5];
                    existingObj.EYES1.height = obj[6];
                    existingObj.EYES1.rotation = obj[8];
                }
                if (existingObj.EYES2 !== null) {
                    existingObj.EYES2.width = obj[5];
                    existingObj.EYES2.height = obj[6];
                    existingObj.EYES2.rotation = obj[8];
                }

                existingObj.GLOW.width = obj[5] * 2;
                existingObj.GLOW.height = obj[6] * 2;
                existingObj.GLOW.rotation = obj[8];

                if (obj[15] === 1) {// && existingObj.filters === null){
                    //                    existingObj.filters = [PIXICam.GLOW_FILTER];//ON GLOW
                    //console.log("ON")
                    //fade in / out GLOW
                    existingObj.GLOW.visible = true;
                    existingObj.GLOW.alpha = 1;
                    existingObj.GLOW.tint = existingObj.tint;
                    if (existingObj.GLOW_DIR === 0) {
                        //existingObj.GLOW.alpha -= gspeed;
                        //if(existingObj.GLOW.alpha < 0.5){existingObj.GLOW.alpha = 0.5; existingObj.GLOW_DIR = 1;}
                    }
                    else {
                        //existingObj.GLOW.alpha += gspeed;
                        //if(existingObj.GLOW.alpha > 1){existingObj.GLOW.alpha = 1; existingObj.GLOW_DIR = 0;}
                    }

                    //existingObj.alpha = (10 - obj[16]) * 0.2;
                    //console.log(existingObj.alpha)
                    const color = COLORS_RGB[obj[13]]
                    let addAmount: number = obj[16];
                    if (obj[16] === 0) {
                        addAmount = 10;
                    }
                    if (obj[16] === 1) {
                        addAmount = 9;
                    }
                    if (obj[16] === 2) {
                        addAmount = 8;
                    }
                    if (obj[16] === 3) {
                        addAmount = 7;
                    }
                    if (obj[16] === 4) {
                        addAmount = 6;
                    }
                    existingObj.tint = adjustBrightnessRGB(color[0], color[1], color[2], addAmount * 5 - 50);
                    //console.log(obj[16])
                    //let aff = existingObj.GLOW.alpha * 255;
                    //existingObj.tint = rgbToHex(aff, aff, aff );

                }
                if (obj[15] === 0) {// && existingObj.filters !== null){
                    //                    existingObj.filters = null;//OFF
                    //console.log("OFF")
                    //existingObj.GLOW.alpha = 0;
                    if (existingObj.tint !== existingObj.COLOR) {
                        existingObj.tint = existingObj.COLOR;
                    }
                    existingObj.GLOW.visible = false;
                    //existingObj.alpha = 1;//reset
                }

                //console.log(obj[8] - 0.785398  * 2);//45 degrees
                //let degrees = obj[8] * (180 / Math.PI)
                if (id === pId.toString()) {
                    //console.log(degrees)
                    // Move the camera to center on a specific point (e.g., player's position)
                    // You'll need to offset by half the screen dimensions to truly center
                    //cameraX = -obj[1] + PIXIApp.screen.width / 2;
                    //cameraY = -obj[2] + PIXIApp.screen.height / 2;
                    //cameraX = obj[1];
                    //cameraY = obj[2];
                    cameraX = -obj[1] + PIXIApp.screen.width / 2;
                    cameraY = -obj[2] + PIXIApp.screen.height / 2;
                    pivotX = obj[1];
                    pivotY = obj[2];
                    mySnakeH = obj;
                    mySnakeId = pId;
                    //console.log([cameraX, cameraY]);
                }
            } else { // create
                //console.log('CreateCircle ' + obj[0])
                //console.log(obj)
                //gameObjects.units[id] = GFX.add.image(obj[1], obj[2], 'd' + obj[0]);//type
                let tempObject: any;
                if (obj[14] === HEAD_EYES) {//Head/Eyes
                    tempObject = CreateCircle(headTexture, obj[1], obj[2], obj[3], 1);
                    if (id === pId.toString()) {//Extra Glow etc
                        tempObject.EYES = null;
                        tempObject.EYES1 = CreateCircle(eyeTexture, obj[1], obj[2], obj[3] + 1, 1);
                        tempObject.EYES1.width = obj[5]; tempObject.EYES1.height = obj[6];
                        tempObject.EYES2 = CreateCircle(eyeTexture, obj[1], obj[2], obj[3] + 1, 1);
                        tempObject.EYES2.width = obj[5]; tempObject.EYES2.height = obj[6];
                    }
                    else {
                        tempObject.EYES1 = null; tempObject.EYES2 = null;//non player
                        tempObject.EYES = CreateCircle(eyesTexture, obj[1], obj[2], obj[3] + 1, 1);
                        tempObject.EYES.width = obj[5];
                        tempObject.EYES.height = obj[6];
                    }
                }
                else {
                    tempObject = CreateCircle(bodyTexture4, obj[1], obj[2], obj[3], 1);
                    tempObject.EYES = null; tempObject.EYES1 = null; tempObject.EYES2 = null;
                }

                tempObject.GLOW = CreateCircle(glowTexture, obj[1], obj[2], obj[3] - 1, 1);
                tempObject.GLOW.alpha = 0.5;
                tempObject.GLOW_DIR = 0;//RandInt(1);
                tempObject.GLOW.width = obj[5] * 2;
                tempObject.GLOW.height = obj[6] * 2;
                tempObject.GLOW.rotation = obj[8];
                tempObject.GLOW.alpha = 0;

                //let COLORS =  ["f5e0dc", "f2cdcd", "f5c2e7", "cba6f7", "f38ba8", "eba0ac", "fab387", "f9e2af",
                //"a6e3a1", "94e2d5", "89dceb", "74c7ec", "89b4fa", "b4befe"];
                tempObject.tint = COLORS[obj[13]];//index based
                tempObject.COLOR = tempObject.tint;//Save Base color
                //COLORS[RandInt(COLORS.length - 1)];//rgbToHex(RandInt(256), RandInt(256), RandInt(256));

                tempObject.tx = obj[1];
                tempObject.ty = obj[2];
                tempObject.width = obj[5];
                tempObject.height = obj[6];
                tempObject.TYPE = obj[0];
                tempObject.rotation = obj[8];

                gameObjects.units[id] = tempObject;//save
                //if(obj[0] < 7){ gameObjects.units[id].depth = 1; }
                //else {gameObjects.units[id].depth = 2;}
            }
        }
    }

    //Debug
    //PIXIGfx.clear();
    if (DEBUG) {
        drawDebugRect(data.dynamics)
        drawDebugRect(data.units)

        let CellSize = 256;//Match server
        //        PIXIGfx.lineStyle(2, 0x00FF00); // 2px red border
        //let vwh = (CellSize * 2) + CellSize;
        //PIXIGfx.drawRect(pivotX - vwh/2,pivotY - vwh/2, vwh, vwh);
        //PIXIGfx.drawRect((PIXIApp.screen.width / 2) - vwh/2,(PIXIApp.screen.height / 2) - vwh/2, vwh, vwh);

    }
    //Bounds Always
    //PIXIGfx.lineStyle(1024, 0x800000); // 2px red border
    //PIXIGfx.drawRect(-512,-512, MapWH+1024, MapWH+1024);
    //PIXIGfx.lineStyle(50, 0xFF0000); // 2px red border
    //PIXIGfx.drawRect(0,0, MapWH, MapWH);
    //PIXIGfx.circle(MapWH/2,MapWH/2,MapWH/2).fill(0xFF0000).lineStyle(50)
}
