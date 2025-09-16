import { GameObjects } from "./type";

export const GameState = {
    gId: 0,
    prevData: null,
    gameObjects: {
        units: {},
        dynamics: {},
        statics: {}
    } as GameObjects,
    cameraX: 0, //camera target
    cameraY: 0,
    pivotX: 0,
    pivotY: 0,
    mySnakeH: null,
    mySnakeId: -1,
    DEBUG: false
}