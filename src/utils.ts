export function rgbToHex(red: number, green: number, blue: number) {
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export function randomNumber(n: number) {
    return Math.floor(Math.random() * n);
}

export function adjustBrightnessRGB(red: number, green: number, blue: number, amount: number) {
    // Increase or decrease each component by 'amount'
    let newR = red + amount;
    let newG = green + amount;
    let newB = blue + amount;

    // Clamp values to 0-255 range
    newR = Math.min(255, Math.max(0, newR));
    newG = Math.min(255, Math.max(0, newG));
    newB = Math.min(255, Math.max(0, newB));

    return rgbToHex(newR, newG, newB);//{ r: newR, g: newG, b: newB };
}