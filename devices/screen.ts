import { PEEK2, POKE2, Uxn } from "../uxn";

export const WIDTH = 64 * 8
export const HEIGHT = 40 * 8

let FIXED_SIZE = 0;

export class Layer {
	pixels: number[];
    changed: number = 0;

    constructor (width: number, height: number) {
        this.pixels = new Array(width * height).fill(0)
    }
};

export class UxnScreen {
	palette: number[] = new Array(4).fill(0);
    pixels: number[] = [];
	width: number;
    height: number;
	fg: Layer;
    bg: Layer;
	mono: number = 0

    constructor () {
        this.width = WIDTH
        this.height = HEIGHT
        this.fg = new Layer(WIDTH, HEIGHT);
        this.bg = new Layer(WIDTH, HEIGHT);
        this.pixels = new Array(WIDTH * HEIGHT).fill(0)
    }
};

export const uxn_screen = new UxnScreen();

const blending: number[][] = [
	[0, 0, 0, 0, 1, 0, 1, 1, 2, 2, 0, 2, 3, 3, 3, 0],
	[0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
	[1, 2, 3, 1, 1, 2, 3, 1, 1, 2, 3, 1, 1, 2, 3, 1],
	[2, 3, 1, 2, 2, 3, 1, 2, 2, 3, 1, 2, 2, 3, 1, 2],
];

const palette_mono: number[] = [
	0x0f000000, 0x0fffffff,
];

function screen_write(p: UxnScreen, layer: Layer, x: number, y: number, color: number)
{
	if(x < p.width && y < p.height) {
		const i = x + y * p.width;

		if(color != layer.pixels[i]) {
			layer.pixels[i] = color;
			layer.changed = 1;
		}
	}
}

function screen_fill(p: UxnScreen, layer: Layer, x1: number, y1: number, x2: number, y2: number, color: number)
{
	let v: number, h: number;

	for(v = y1; v < y2; v++)
		for(h = x1; h < x2; h++)
			screen_write(p, layer, h, v, color);

	layer.changed = 1;
}

function screen_wipe(p: UxnScreen, layer: Layer, x: number, y: number)
{
	screen_fill(p, layer, x, y, x + 8, y + 8, 0);
}

function screen_blit(p: UxnScreen, layer: Layer, x: number, y: number, sprite: number[], color: number, flipx: number, flipy: number, twobpp: number): void {
    let v: number, h: number, opaque = (color % 5) || !color;

    for(v = 0; v < 8; v++) {
        let c = sprite[v] | (twobpp ? (sprite[v + 8] << 8) : 0);

        for(h = 7; h >= 0; --h, c >>= 1) {
            let ch = (c & 1) | ((c >> 7) & 2);

            if(opaque || ch) {
                screen_write(p, layer, x + (flipx ? 7 - h : h), y + (flipy ? 7 - v : v), blending[ch][color]);
            }
        }
    }
}

export function screen_palette(p: UxnScreen, addr: number[]): void {
    for (let i = 0, shift = 4; i < 4; ++i, shift ^= 4) {
      const r = (addr[0 + Math.floor(i / 2)] >> shift) & 0x0f;
      const g = (addr[2 + Math.floor(i / 2)] >> shift) & 0x0f;
      const b = (addr[4 + Math.floor(i / 2)] >> shift) & 0x0f;

      p.palette[i] = 0x000000 | r << 16 | g << 8 | b;
      p.palette[i] |= p.palette[i] << 4;
    }

    p.fg.changed = p.bg.changed = 1;
}

function screen_resize(p: UxnScreen, width: number, height: number)
{
    p.bg.pixels = new Array(width * height).fill(0)
    p.fg.pixels = new Array(width * height).fill(0)
    p.pixels = new Array(width * height).fill(0)
  
    p.width = width;
    p.height = height;
    screen_fill(p, p.bg, 0, 0, p.width, p.height, 0);
    screen_fill(p, p.fg, 0, 0, p.width, p.height, 0);

    console.log('resize', p)
}

function screen_redraw(p: UxnScreen)
{
	let i, size = p.width * p.height, palette = new Array(4).fill(0);

	for(i = 0; i < 16; i++)
		palette[i] = p.palette[(i >> 2) ? (i >> 2) : (i & 3)];

	if(p.mono) {
		for(i = 0; i < size; i++)
			p.pixels[i] = palette_mono[(p.fg.pixels[i] ? p.fg.pixels[i] : p.bg.pixels[i]) & 0x1];
	} else {
		for(i = 0; i < size; i++)
			p.pixels[i] = palette[p.fg.pixels[i] << 2 | p.bg.pixels[i]];
	}

	p.fg.changed = p.bg.changed = 0;
}
  
function clamp(val: number, min: number, max: number)
{
	return (val >= min) ? (val <= max) ? val : max : min;
}

export function screen_mono(p: UxnScreen)
{
	p.mono = p.mono ? 0 : 1;
	screen_redraw(p);
}

export function screen_dei(u: Uxn, addr: number)
{
	switch(addr) {
        case 0x22: return uxn_screen.width >> 8;
        case 0x23: return uxn_screen.width;
        case 0x24: return uxn_screen.height >> 8;
        case 0x25: return uxn_screen.height;
        default: return u.dev[addr];
	}
}

export function screen_deo(ram: number[], d: number[], port: number)
{
    console.log('SCREN DEO', port)
	switch(port) {
	case 0x3:
		if(!FIXED_SIZE)
			screen_resize(uxn_screen, clamp(PEEK2(d.slice(2)), 1, 1024), uxn_screen.height);
		break;
	case 0x5:
		if(!FIXED_SIZE)
			screen_resize(uxn_screen, uxn_screen.width, clamp(PEEK2(d.slice(4)), 1, 1024));
		break;
	case 0xe: {
		let x = PEEK2(d.slice(0x8)), y = PEEK2(d.slice(0xa));
		let layer: Layer = (d[0xf] & 0x40) ? uxn_screen.fg : uxn_screen.bg;

		if(d[0xe] & 0x80)
			screen_fill(
                uxn_screen, 
                layer, 
                (d[0xe] & 0x10) ? 0 : x, (d[0xe] & 0x20) ? 0 : y, (d[0xe] & 0x10) ? x : uxn_screen.width, (d[0xe] & 0x20) ? y : uxn_screen.height, d[0xe] & 0x3)
            ;
		else {
			screen_write(uxn_screen, layer, x, y, d[0xe] & 0x3);
			if(d[0x6] & 0x01) POKE2(d, (0x8), x + 1); /* auto x+1 */
			if(d[0x6] & 0x02) POKE2(d, (0xa), y + 1); /* auto y+1 */
		}
		break;
	}
	case 0xf: {
		let x = PEEK2(d.slice(0x8)), y = PEEK2(d.slice(0xa)), dx, dy, addr = PEEK2(d.slice(0xc));
		let i, n, twobpp = !!(d[0xf] & 0x80) ? 1 : 0;
		let layer: Layer = (d[0xf] & 0x40) ? uxn_screen.fg : uxn_screen.bg;

		n = d[0x6] >> 4;
		dx = (d[0x6] & 0x01) << 3;
		dy = (d[0x6] & 0x02) << 2;

		if(addr > 0x10000 - ((n + 1) << (3 + twobpp)))
			return;
		for(i = 0; i <= n; i++) {
			if(!(d[0xf] & 0xf))
				screen_wipe(uxn_screen, layer, x + dy * i, y + dx * i);
			else {
				screen_blit(uxn_screen, layer, x + dy * i, y + dx * i, ram.slice(addr), d[0xf] & 0xf, d[0xf] & 0x10, d[0xf] & 0x20, twobpp);
				addr += (d[0x6] & 0x04) << (1 + twobpp);
			}
		}
		POKE2(d, (0xc), addr);   /* auto addr+length */
		POKE2(d, (0x8), x + dx); /* auto x+8 */
		POKE2(d, (0xa), y + dy); /* auto y+8 */
		break;
	}
	}
}
