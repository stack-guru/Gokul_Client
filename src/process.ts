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

let GID = 0;
let DATA = null;
let OBJS: GameObjects = {
    units: {},
    dynamics: {},
    statics: {}
};
let CX = 0;//camera target
let CY = 0;
let PTX = 0;
let PTY = 0;
let MYSnakeH = null;
let MYSnakeID = -1;
const DEBUG = false;

function CreateCircle(texture: Texture, x: number, y: number, z: number, scale = 1, rot = 0) {
    // GID++;
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

export function onUpdate(pId: number, x: number, y: number, d: any) {
    DATA = d; //SAVE
    let obj, id;
    let fspeed = 0.1;

    //MATCH SERVER COLORS
    let COLORS = [
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
    let COLORS_RGB = [
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

    for (id in d.dynamics) {
        if (d.dynamics.hasOwnProperty(id)) {
            obj = d.dynamics[id];
            if (OBJS.dynamics.hasOwnProperty(id)) {
                let fObj = OBJS.dynamics[id];
                fObj.tx = obj[1]; fObj.ty = obj[2];
                fObj.width = obj[5]; fObj.height = obj[6];

                //fade in / out
                if (fObj.ADIR === 0) {
                    fObj.alpha -= fspeed;
                    if (fObj.alpha < 0.2) {
                        fObj.alpha = 0.2; fObj.ADIR = 1;
                    }
                } else {
                    fObj.alpha += fspeed;
                    if (fObj.alpha > 1) {
                        fObj.alpha = 1; fObj.ADIR = 0;
                    }
                }
            }
            else {
                //console.log('CreateCircle ' + obj[0])
                //console.log(obj)
                //OBJS.dynamics[id] = GFX.add.image(obj[1], obj[2], 'd' + obj[0]);//type
                OBJS.dynamics[id] = CreateCircle(headTexture, obj[1], obj[2], obj[3], 1);
                //let COLORS =  ["f5e0dc", "f2cdcd", "f5c2e7", "cba6f7", "f38ba8", "eba0ac", "fab387", "f9e2af",
                //"a6e3a1", "94e2d5", "89dceb", "74c7ec", "89b4fa", "b4befe"];
                //COLORS = ['EAB999', '00ff88', 'ff4400', '0088ff', 'aa44ff', 'ffaa00']
                //sprite.alpha = 0.5;

                //{ name: 'Classic', color:  },                { name: 'Neon', color: '#00ff88' },                { name: 'Fire', color: '#ff4400' },
                //{ name: 'Ocean', color: '#0088ff' },                { name: 'Purple', color: '#aa44ff' },                { name: 'Gold', color: '#ffaa00' }

                OBJS.dynamics[id].tint = COLORS[randomNumber(COLORS.length - 1)];//rgbToHex(RandInt(256), RandInt(256), RandInt(256));
                OBJS.dynamics[id].tx = obj[1];
                OBJS.dynamics[id].ty = obj[2];
                OBJS.dynamics[id].width = obj[5]
                OBJS.dynamics[id].height = obj[6];
                OBJS.dynamics[id].TYPE = obj[0];
                OBJS.dynamics[id].alpha = 0.5
                OBJS.dynamics[id].ADIR = randomNumber(1);

                //Always glow
                //OBJS.dynamics[id].filters = [PIXICam.GLOW_FILTER];//ON GLOW

                //OBJS.dynamics[id].filters = [new PIXI.filters.BlurFilter(5)]; // Adjust blur amount
                //OBJS.dynamics[id].blendMode = PIXI.BLEND_MODES.ADD;
                //if(obj[0] < 7){ OBJS.dynamics[id].depth = 1; }
                //else {OBJS.dynamics[id].depth = 2;}
            }
        }
    }
    let gspeed = 0.1;
    for (id in d.units) {
        if (d.units.hasOwnProperty(id)) {
            obj = d.units[id];
            if (OBJS.units.hasOwnProperty(id)) {
                let aObj = OBJS.units[id];
                aObj.tx = obj[1];
                aObj.ty = obj[2];
                aObj.width = obj[5];
                aObj.height = obj[6];
                aObj.rotation = obj[8];
                //                aObj.rotation = obj[8] +  0.785398  * 2;

                if (aObj.EYES !== null) { aObj.EYES.width = obj[5]; aObj.EYES.height = obj[6]; aObj.EYES.rotation = obj[8]; }
                if (aObj.EYES1 !== null) { aObj.EYES1.width = obj[5]; aObj.EYES1.height = obj[6]; aObj.EYES1.rotation = obj[8]; }
                if (aObj.EYES2 !== null) { aObj.EYES2.width = obj[5]; aObj.EYES2.height = obj[6]; aObj.EYES2.rotation = obj[8]; }

                aObj.GLOW.width = obj[5] * 2;
                aObj.GLOW.height = obj[6] * 2;
                aObj.GLOW.rotation = obj[8];

                if (obj[15] === 1) {// && aObj.filters === null){
                    //                    aObj.filters = [PIXICam.GLOW_FILTER];//ON GLOW
                    //console.log("ON")
                    //fade in / out GLOW
                    aObj.GLOW.visible = true;
                    aObj.GLOW.alpha = 1;
                    aObj.GLOW.tint = aObj.tint;
                    if (aObj.GLOW_DIR === 0) {
                        //aObj.GLOW.alpha -= gspeed;
                        //if(aObj.GLOW.alpha < 0.5){aObj.GLOW.alpha = 0.5; aObj.GLOW_DIR = 1;}
                    }
                    else {
                        //aObj.GLOW.alpha += gspeed;
                        //if(aObj.GLOW.alpha > 1){aObj.GLOW.alpha = 1; aObj.GLOW_DIR = 0;}
                    }

                    //aObj.alpha = (10 - obj[16]) * 0.2;
                    //console.log(aObj.alpha)
                    let cc = COLORS_RGB[obj[13]]
                    let vc = obj[16];
                    if (obj[16] === 0) { vc = 10; }
                    if (obj[16] === 1) { vc = 9; }
                    if (obj[16] === 2) { vc = 8; }
                    if (obj[16] === 3) { vc = 7; }
                    if (obj[16] === 4) { vc = 6; }
                    aObj.tint = adjustBrightnessRGB(cc[0], cc[1], cc[2], vc * 5 - 50);
                    //console.log(obj[16])
                    //let aff = aObj.GLOW.alpha * 255;
                    //aObj.tint = rgbToHex(aff, aff, aff );

                }
                if (obj[15] === 0) {// && aObj.filters !== null){
                    //                    aObj.filters = null;//OFF
                    //console.log("OFF")
                    //aObj.GLOW.alpha = 0;
                    if (aObj.tint !== aObj.COLOR) {
                        aObj.tint = aObj.COLOR;
                    }
                    aObj.GLOW.visible = false;
                    //aObj.alpha = 1;//reset
                }

                //console.log(obj[8] - 0.785398  * 2);//45 degrees
                //let degrees = obj[8] * (180 / Math.PI)
                if (id === pId.toString()) {
                    //console.log(degrees)
                    // Move the camera to center on a specific point (e.g., player's position)
                    // You'll need to offset by half the screen dimensions to truly center
                    //CX = -obj[1] + PIXIApp.screen.width / 2;
                    //CY = -obj[2] + PIXIApp.screen.height / 2;
                    //CX = obj[1];
                    //CY = obj[2];
                    CX = -obj[1] + PIXIApp.screen.width / 2;
                    CY = -obj[2] + PIXIApp.screen.height / 2;
                    PTX = obj[1];
                    PTY = obj[2];
                    MYSnakeH = obj;
                    MYSnakeID = pId;
                    //console.log([CX, CY]);
                }
            }
            else {
                //console.log('CreateCircle ' + obj[0])
                //console.log(obj)
                //OBJS.units[id] = GFX.add.image(obj[1], obj[2], 'd' + obj[0]);//type
                let UOBJ: any;
                if (obj[14] === 1) {//Head/Eyes
                    UOBJ = CreateCircle(headTexture, obj[1], obj[2], obj[3], 1);
                    if (id === pId.toString()) {//Extra Glow etc
                        UOBJ.EYES = null;
                        UOBJ.EYES1 = CreateCircle(eyeTexture, obj[1], obj[2], obj[3] + 1, 1);
                        UOBJ.EYES1.width = obj[5]; UOBJ.EYES1.height = obj[6];
                        UOBJ.EYES2 = CreateCircle(eyeTexture, obj[1], obj[2], obj[3] + 1, 1);
                        UOBJ.EYES2.width = obj[5]; UOBJ.EYES2.height = obj[6];
                    }
                    else {
                        UOBJ.EYES1 = null; UOBJ.EYES2 = null;//non player
                        UOBJ.EYES = CreateCircle(eyesTexture, obj[1], obj[2], obj[3] + 1, 1);
                        UOBJ.EYES.width = obj[5];
                        UOBJ.EYES.height = obj[6];
                    }
                }
                else {
                    UOBJ = CreateCircle(bodyTexture4, obj[1], obj[2], obj[3], 1);
                    UOBJ.EYES = null; UOBJ.EYES1 = null; UOBJ.EYES2 = null;
                }

                UOBJ.GLOW = CreateCircle(glowTexture, obj[1], obj[2], obj[3] - 1, 1);
                UOBJ.GLOW.alpha = 0.5;
                UOBJ.GLOW_DIR = 0;//RandInt(1);
                UOBJ.GLOW.width = obj[5] * 2;
                UOBJ.GLOW.height = obj[6] * 2;
                UOBJ.GLOW.rotation = obj[8];
                UOBJ.GLOW.alpha = 0;

                //let COLORS =  ["f5e0dc", "f2cdcd", "f5c2e7", "cba6f7", "f38ba8", "eba0ac", "fab387", "f9e2af",
                //"a6e3a1", "94e2d5", "89dceb", "74c7ec", "89b4fa", "b4befe"];
                UOBJ.tint = COLORS[obj[13]];//index based
                UOBJ.COLOR = UOBJ.tint;//Save Base color
                //COLORS[RandInt(COLORS.length - 1)];//rgbToHex(RandInt(256), RandInt(256), RandInt(256));

                UOBJ.tx = obj[1];
                UOBJ.ty = obj[2];
                UOBJ.width = obj[5];
                UOBJ.height = obj[6];
                UOBJ.TYPE = obj[0];
                UOBJ.rotation = obj[8];

                OBJS.units[id] = UOBJ;//save
                //if(obj[0] < 7){ OBJS.units[id].depth = 1; }
                //else {OBJS.units[id].depth = 2;}
            }
        }
    }

    //Debug
    //PIXIGfx.clear();
    if (DEBUG) {
        drawDebugRect(d.dynamics)
        drawDebugRect(d.units)

        let CellSize = 256;//Match server
        //        PIXIGfx.lineStyle(2, 0x00FF00); // 2px red border
        //let vwh = (CellSize * 2) + CellSize;
        //PIXIGfx.drawRect(PTX - vwh/2,PTY - vwh/2, vwh, vwh);
        //PIXIGfx.drawRect((PIXIApp.screen.width / 2) - vwh/2,(PIXIApp.screen.height / 2) - vwh/2, vwh, vwh);

    }
    //Bounds Always
    //PIXIGfx.lineStyle(1024, 0x800000); // 2px red border
    //PIXIGfx.drawRect(-512,-512, MapWH+1024, MapWH+1024);
    //PIXIGfx.lineStyle(50, 0xFF0000); // 2px red border
    //PIXIGfx.drawRect(0,0, MapWH, MapWH);
    //PIXIGfx.circle(MapWH/2,MapWH/2,MapWH/2).fill(0xFF0000).lineStyle(50)
}
