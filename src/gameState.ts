import { GameObjects } from "./type";

export const GameState = {
    gId: 0,
    prevData: null as any,
    gameObjects: {
        units: {},
        dynamics: {},
        statics: {}
    } as GameObjects,
    // Objects: {},
    cameraX: 0, //camera target
    INPUT: null,
    cameraY: 0,
    pivotX: 0,
    pivotY: 0,
    mySnakeH: null,
    mySnakeId: -1,
    LERPP: 0.2,
    DEBUG: false,
    ViewW: 2048,
    ViewH: 2048,
    MapWH: 10000,
    PIXICam: null as any,
    PIXITiledBK: null as any,
}