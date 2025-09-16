import { unpack, pack } from "msgpackr";

let SKIP_MS = false;//Debug
let PING: any = 0;

//REFERENCE - > https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state
const RENDER_DELAY = 100;

const gameUpdates: any[] = [];
let gameStart = 0;
let firstServerTimestamp = 0;

function initState() {
    gameStart = 0;
    firstServerTimestamp = 0;
}

function processGameUpdate(update: any) {
    if (!firstServerTimestamp) {
        firstServerTimestamp = update.t;
        gameStart = Date.now();
    }
    gameUpdates.push(update);

    // Keep only one game update before the current server time
    const base = getBaseUpdate();
    if (base > 0) {
        gameUpdates.splice(0, base);
    }
}

function currentServerTime() {
    return firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;
}

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
function getBaseUpdate() {
    const serverTime = currentServerTime();
    for (let i = gameUpdates.length - 1; i >= 0; i--) {
        if (gameUpdates[i].t <= serverTime) {
            return i;
        }
    }
    return -1;
}

function getCurrentState() {
    if (!firstServerTimestamp) {
        //return {};
        return null;
    }

    const base = getBaseUpdate();
    const serverTime = currentServerTime();

    // If base is the most recent update we have, use its state.
    // Else, interpolate between its state and the state of (base + 1).
    if (base < 0) {
        return gameUpdates[gameUpdates.length - 1];
    } else if (base === gameUpdates.length - 1) {
        return gameUpdates[base];
    } else {
        const baseUpdate = gameUpdates[base];
        const next = gameUpdates[base + 1];
        const r = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);
        //console.log(r)

        let units: { [id: string]: any } = {};
        //function MathLerp(start, end, amt) { return (1-amt)*start+amt*end }
        for (let id in baseUpdate.units) {
            if (baseUpdate.units.hasOwnProperty(id)) {
                let obj = baseUpdate.units[id];
                if (next.units.hasOwnProperty(id)) {
                    let nobj = next.units[id]
                    //x, y only
                    obj[1] = obj[1] + (nobj[1] - obj[1]) * r;
                    obj[2] = obj[2] + (nobj[2] - obj[2]) * r;
                    units[id] = obj;
                }

                //interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
                //let v1 = object1[key] + (object2[key] - object1[key]) * ratio;
                //obj.x = //obj.tx;//MathLerp(obj.x, obj.tx, LERPP);
                //obj.y = obj.ty;//MathLerp(obj.y, obj.ty, LERPP);
            }
        }
        baseUpdate.units = units;//replaced lerped


        //LERPP = r;
        return baseUpdate;//full update
        //{
        //me: interpolateObject(baseUpdate.me, next.me, r),
        //others: interpolateObjectArray(baseUpdate.others, next.others, r),
        //bullets: interpolateObjectArray(baseUpdate.bullets, next.bullets, r),
        //};
    }
}

function interpolateObject(object1: any, object2: any, ratio: any) {
    if (!object2) {
        return object1;
    }

    const interpolated: { [key: string]: any } = {};
    Object.keys(object1).forEach(key => {
        if (key === 'direction') {
            interpolated[key] = interpolateDirection(object1[key], object2[key], ratio);
        } else {
            interpolated[key] = object1[key] + (object2[key] - object1[key]) * ratio;
        }
    });
    return interpolated;
}

function interpolateObjectArray(objects1: any, objects2: any, ratio: any) {
    return objects1.map((o: any) => interpolateObject(o, objects2.find((o2: any) => o.id === o2.id), ratio));
}

// Determines the best way to rotate (cw or ccw) when interpolating a direction.
// For example, when rotating from -3 radians to +3 radians, we should really rotate from
// -3 radians to +3 - 2pi radians.
function interpolateDirection(d1: any, d2: any, ratio: any) {
    const absD = Math.abs(d2 - d1);
    if (absD >= Math.PI) {
        // The angle between the directions is large - we should rotate the other way
        if (d1 > d2) {
            return d1 + (d2 + 2 * Math.PI - d1) * ratio;
        } else {
            return d1 - (d2 - 2 * Math.PI - d1) * ratio;
        }
    } else {
        // Normal interp
        return d1 + (d2 - d1) * ratio;
    }
}

async function blobToArrayBuffer(blob: any) {
    try {
        const arrayBuffer = await blob.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        console.error("Error converting Blob to ArrayBuffer:", error);
        throw error;
    }
}

export function setupWebsocket(onUpdate: (id: number, x: number, y: number, view: any) => void) {
    console.log('connecting websocket...')
    // Replace with your WebSocket server address (e.g., ws://localhost:8080)
    //socket = new WebSocket('ws://localhost:3000');
    let HOST = "ws://localhost:3000";//default
    if (location.hostname !== "localhost") {
        HOST = "ws://" + location.hostname + "/ws/";//use HTTP for speed not HTTPS
    }
    //if(location.host === "game.iceturtlestudios.com"){
    //HOST = "wss://game.iceturtlestudios.com:3000/";
    //HOST = "wss://game.iceturtlestudios.com/ws/";//over HTTPS
    //}

    console.log(HOST)
    const socket = new WebSocket(HOST);
    socket.binaryType = "arraybuffer";

    setInterval(() => {
        const sendTime = Date.now();
        socket.send(JSON.stringify({ type: "ping", timestamp: sendTime }));
    }, 1000); // Send a ping every few seconds

    socket.onopen = (event) => {
        //messagesDiv.innerHTML += '<p>Connected to WebSocket server.</p>';
    };

    socket.onmessage = async (event) => {
        try {
            let d = unpack(new Uint8Array(event.data));

            switch (d.type) {
                case "fast_update":
                    if (SKIP_MS) {
                        processGameUpdate(d);

                        //console.log(d.t);
                        let update = getCurrentState();
                        if (update !== null) {
                            //console.log([d.id, d.x, d.y, d.view]);

                            // encode from JS Object to MessagePack (Uint8Array)
                            //var buffer = msgpack.encode({foo: "bar"});

                            // decode from MessagePack (Uint8Array) to JS Object
                            //var array = new Uint8Array([0x81, 0xA3, 0x66, 0x6F, 0x6F, 0xA3, 0x62, 0x61, 0x72]);
                            //var data = msgpack.decode(array);

                            onUpdate(update.id, update.x, update.y, update.view)
                        }
                        else { console.log("NO STATE") }
                    }
                    else {
                        onUpdate(d.id, d.x, d.y, d.view)
                    }
                    break;
                case "pong":
                    const receiveTime = Date.now();
                    const ping = receiveTime - d.timestamp;
                    //console.log(`Ping: ${ping}ms`);
                    PING = ping + "ms";
                    break
            }
        } catch (err) {
            if (err instanceof RangeError && err.message.includes("BUFFER_SHORTAGE")) {
                console.error("MessagePack decoding error: Incomplete buffer, BUFFER_SHORTAGE.");
                // Handle the incomplete buffer scenario, e.g., request more data, or discard.

            } else {
                console.error("An unexpected error occurred during MessagePack decoding:", err);
                //throw err; // Re-throw other errors if not specifically handled
            }
            return null; // Or throw a custom error, or return a default value
        }
    };

    socket.onclose = (event) => {
        //messagesDiv.innerHTML += '<p>Disconnected from WebSocket server.</p>';
    };

    socket.onerror = (error) => {
        //messagesDiv.innerHTML += `<p style="color: red;">WebSocket Error: ${error}</p>`;
    };

}