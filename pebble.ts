let output = ''
let error = ''

const out = (c: string) => {
    output += c;

    simply.text({ title: output, subtitle: '' });
}

const outError = (c: string) => {
    error += c;

    simply.text({ title: error, subtitle: '' });
}

// Short reports whether the opcode has the short flag set.
const shortFlag = (b: number): boolean => ((b & 0x20) > 0) && ((b & 0x9f) > 0) ? false : true

// Return reports whether the opcode has the return flag set.
const returnFlag = (b: number): boolean => (b & 0x40) > 0 && (b & 0x9f) > 0

// Keep reports whether the opcode has the keep flag set.
const keepFlag = (b: number): number => ((b & 0x80) > 0 && (b & 0x1f) > 0) ? 1 : 0

// Base returns the opcode without any flags set.
const base = (b: number) => {
	if ((b & 0x1f) > 0)
        return b & 0x1f
    
    if ((b & 0x9f) == 0)
        return b

    if ((b & 0x9f) == 0x80)
        return opCodes.LIT
        
    //uxn_halt("unreachable")
}

enum opCodes {
    BRK,
	INC,
	POP,
	NIP,
	SWP,
	ROT,
	DUP,
	OVR,
	EQU,
	NEQ,
	GTH,
	LTH,
	JMP,
	JCN,
	JSR,
	STH,
	LDZ,
	STZ,
	LDR,
	STR,
	LDA,
	STA,
	DEI,
	DEO,
	ADD,
	SUB,
	MUL,
	DIV,
	AND,
	ORA,
	EOR,
	SFT,
	JCI,
	INC2,
	POP2,
	NIP2,
	SWP2,
	ROT2,
	DUP2,
	OVR2,
	EQU2,
	NEQ2,
	GTH2,
	LTH2,
	JMP2,
	JCN2,
	JSR2,
	STH2,
	LDZ2,
	STZ2,
	LDR2,
	STR2,
	LDA2,
	STA2,
	DEI2,
	DEO2,
	ADD2,
	SUB2,
	MUL2,
	DIV2,
	AND2,
	ORA2,
	EOR2,
	SFT2,
	JMI,
	INCr,
	POPr,
	NIPr,
	SWPr,
	ROTr,
	DUPr,
	OVRr,
	EQUr,
	NEQr,
	GTHr,
	LTHr,
	JMPr,
	JCNr,
	JSRr,
	STHr,
	LDZr,
	STZr,
	LDRr,
	STRr,
	LDAr,
	STAr,
	DEIr,
	DEOr,
	ADDr,
	SUBr,
	MULr,
	DIVr,
	ANDr,
	ORAr,
	EORr,
	SFTr,
	JSI,
	INC2r,
	POP2r,
	NIP2r,
	SWP2r,
	ROT2r,
	DUP2r,
	OVR2r,
	EQU2r,
	NEQ2r,
	GTH2r,
	LTH2r,
	JMP2r,
	JCN2r,
	JSR2r,
	STH2r,
	LDZ2r,
	STZ2r,
	LDR2r,
	STR2r,
	LDA2r,
	STA2r,
	DEI2r,
	DEO2r,
	ADD2r,
	SUB2r,
	MUL2r,
	DIV2r,
	AND2r,
	ORA2r,
	EOR2r,
	SFT2r,
	LIT,
	INCk,
	POPk,
	NIPk,
	SWPk,
	ROTk,
	DUPk,
	OVRk,
	EQUk,
	NEQk,
	GTHk,
	LTHk,
	JMPk,
	JCNk,
	JSRk,
	STHk,
	LDZk,
	STZk,
	LDRk,
	STRk,
	LDAk,
	STAk,
	DEIk,
	DEOk,
	ADDk,
	SUBk,
	MULk,
	DIVk,
	ANDk,
	ORAk,
	EORk,
	SFTk,
	LIT2,
	INC2k,
	POP2k,
	NIP2k,
	SWP2k,
	ROT2k,
	DUP2k,
	OVR2k,
	EQU2k,
	NEQ2k,
	GTH2k,
	LTH2k,
	JMP2k,
	JCN2k,
	JSR2k,
	STH2k,
	LDZ2k,
	STZ2k,
	LDR2k,
	STR2k,
	LDA2k,
	STA2k,
	DEI2k,
	DEO2k,
	ADD2k,
	SUB2k,
	MUL2k,
	DIV2k,
	AND2k,
	ORA2k,
	EOR2k,
	SFT2k,
	LITr,
	INCkr,
	POPkr,
	NIPkr,
	SWPkr,
	ROTkr,
	DUPkr,
	OVRkr,
	EQUkr,
	NEQkr,
	GTHkr,
	LTHkr,
	JMPkr,
	JCNkr,
	JSRkr,
	STHkr,
	LDZkr,
	STZkr,
	LDRkr,
	STRkr,
	LDAkr,
	STAkr,
	DEIkr,
	DEOkr,
	ADDkr,
	SUBkr,
	MULkr,
	DIVkr,
	ANDkr,
	ORAkr,
	EORkr,
	SFTkr,
	LIT2r,
	INC2kr,
	POP2kr,
	NIP2kr,
	SWP2kr,
	ROT2kr,
	DUP2kr,
	OVR2kr,
	EQU2kr,
	NEQ2kr,
	GTH2kr,
	LTH2kr,
	JMP2kr,
	JCN2kr,
	JSR2kr,
	STH2kr,
	LDZ2kr,
	STZ2kr,
	LDR2kr,
	STR2kr,
	LDA2kr,
	STA2kr,
	DEI2kr,
	DEO2kr,
	ADD2kr,
	SUB2kr,
	MUL2kr,
	DIV2kr,
	AND2kr,
	ORA2kr,
	EOR2kr,
	SFT2kr
}


const WIDTH = 64 * 8
const HEIGHT = 40 * 8

let FIXED_SIZE = 0;

class Layer {
	pixels: number[];
    changed: number = 0;

    constructor (width: number, height: number) {
        this.pixels = new Array(width * height).fill(0)
    }
};

class UxnScreen {
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

const uxn_screen = new UxnScreen();

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

function screen_palette(p: UxnScreen, addr: number[]): void {
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

function screen_mono(p: UxnScreen)
{
	p.mono = p.mono ? 0 : 1;
	screen_redraw(p);
}

function screen_dei(u: Uxn, addr: number)
{
	switch(addr) {
        case 0x22: return uxn_screen.width >> 8;
        case 0x23: return uxn_screen.width;
        case 0x24: return uxn_screen.height >> 8;
        case 0x25: return uxn_screen.height;
        default: return u.dev[addr];
	}
}

function screen_deo(ram: number[], d: number[], port: number)
{
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

const errors: string[] = [
	"underflow",
	"overflow",
	"division by zero"
];

function system_print(s: Stack, name: string): void {
  out(`<${name}>`);

  for (let i = 0; i < s.ptr; i++) {
    out(` ${s.dat[i].toString(16).padStart(2, '0')}`);
  }
  if (s.ptr === 0) {
    out(' empty');
  }
  out('\n');
}

function system_cmd(ram: number[], addr: number)
{
	if(ram[addr] == 0x01) {
		let i, length = PEEK2(ram.slice(addr + 1));
		const a_page = PEEK2(ram.slice(addr + 1 + 2));
    const a_addr = PEEK2(ram.slice(addr + 1 + 4));
		const b_page = PEEK2(ram.slice(addr + 1 + 6));
    const b_addr = PEEK2(ram.slice(addr + 1 + 8));
		const src = (a_page % RAM_PAGES) * 0x10000;
    const dst = (b_page % RAM_PAGES) * 0x10000;

		for(i = 0; i < length; i++)
			ram[dst + (b_addr + i)] = ram[src + (a_addr + i)];
	}
}

function system_inspect(u: Uxn)
{
	system_print(u.wst, "wst");
	system_print(u.rst, "rst");
}

function system_load(u: Uxn): number {
  const f = [128,112,128,24,23,128,101,128,24,23,128,98,128,24,23,128,98,128,24,23,128,108,128,24,23,128,101,128,24,23,128,60,128,24,23,128,51,128,24,23,128,85,128,24,23,128,88,128,24,23,128,78,128,24,23,128,10,128,24,23];

  if (!f) {
    return 0;
  }

  u.ram = (new Array(0x100000).fill(0))

  for (let i = 0; i < f.length; i ++) {
    u.ram[PAGE_PROGRAM + i] = (f.at(i) || 0)
  }

  return 1;
}

/* IO */

function system_deo(u: Uxn, d: number[], port: number)
{
	switch(port) {
	case 0x3:
		system_cmd(u.ram, PEEK2(d.slice(2)));
		break;
	case 0xe:
		system_inspect(u);
		break;
	}
}

/* Error */

function uxn_halt(u: Uxn, instr: number, err: number, addr: number)
{
	const d = u.dev.slice(0x00);
	const handler = PEEK2(d);

	if(handler) {
		u.wst.ptr = 4;
		u.wst.dat[0] = addr >> 0x8;
		u.wst.dat[1] = addr & 0xff;
		u.wst.dat[2] = instr;
		u.wst.dat[3] = err;

		return uxn_eval(u, handler);
	} else {
		system_inspect(u);
		outError(`${(instr & 0x40) ? "Return-stack" : "Working-stack"} ${errors[err - 1]}, by ${instr.toString(16)} at 0x${addr.toString(16).padStart(4, '0')}.\n`);
	}
	return 0;
}


const PAGE_PROGRAM = 0x0100

const u16 = (a: number) => {
  const u = new Uint16Array(1) ; u[0] = a ; return u[0]
}

const u8 = (a: number) => {
  const u = new Uint8Array(1) ; u[0] = a ; return u[0]
}

function POKE2(d: number[], addr: number, v: number) {
  d[addr] = u16(v >> 8);
  d[addr + 1] = u16(v);
}

function PEEK2(d: number[]): number {
  return u16(u16(d[0] << 8) | u16(d[1]))
}

class Stack {
    dat: number[];
    ptr: number;

    constructor () {
        this.dat = (new Array(255).fill(0));
        this.ptr = 0;
    }
}

class Uxn {
    ram: number[];
    dev: number[];
    wst: Stack;
    rst: Stack;
    dei: (u: Uxn, addr: number) => number;
    deo: (u: Uxn, addr: number) => void;

    constructor (dei: any, deo: any) {
        this.ram = [];
        this.dev = (new Array(256));
        this.wst = new Stack();
        this.rst = new Stack();
        this.dei = dei;
        this.deo = deo;
    }
};

function uxn_eval(u: Uxn, pc: number): number {
    let ins: number, k: number; // u8
    let t: number, n: number, l: number, tmp: number; // u16
    let s: Stack = new Stack();
    let z: Stack = new Stack();

    if(!pc || u.dev[0x0f]) return 0;

    /* Registers

    [ . ][ . ][ . ][ L ][ N ][ T ] <
    [ . ][ . ][ . ][   H2   ][ T ] <
    [   L2   ][   N2   ][   T2   ] <

    */
    const T = () => u16(s.dat[s.ptr - 1]);
    const N = () => u16(s.dat[s.ptr - 2]);
    const L = () => u16(s.dat[s.ptr - 3])
    const H2 = () => u16(u16(s.dat[s.ptr - 3] << 8) | u16(s.dat[s.ptr - 2]))
    const T2 = () => u16(u16(s.dat[s.ptr - 2] << 8) | u16(s.dat[s.ptr - 1]))
    const N2 = () => u16(u16(s.dat[s.ptr - 4] << 8) | u16(s.dat[s.ptr - 3]))
    const L2 = () => u16(u16(s.dat[s.ptr - 6] << 8) | u16(s.dat[s.ptr - 5]))

    const HALT = (c: number): number => uxn_halt(u, ins, c, (pc - 1));
    
    const SET = (mul: number, add: number): void => { 
      if (mul > s.ptr) HALT(1);
      tmp = (u16(s.ptr + u16(u16(k * mul) + add)))
      if (tmp > 254) HALT(2);
      s.ptr = (tmp); 
    };

    const PUT = (offset: number, value: number) => { 
      s.dat[s.ptr - 1 - offset] = (value); 
    };

    const PUT2 = (offset: number, value: number) => {
      const tmp = value; 
      s.dat[s.ptr - offset - 2] = (tmp >> 8);
      s.dat[s.ptr - offset - 1] = (tmp); 
    }

    const PUSH = (x: Stack, value: number) => { 
      z = x;
      if (z.ptr > 254) HALT(2);
      z.dat[z.ptr] = u16(value); 
      z.ptr = u16(z.ptr + 1)
    }

    const PUSH2 = (x: Stack, value: number) => {
      z = x;
      if(s.ptr > 253) HALT(2);
      tmp = value; 
      z.dat[z.ptr] = u16(tmp >> 8);
      z.dat[z.ptr + 1] = u16(tmp);
      z.ptr = u16(z.ptr + 2); 
    }

    const DEO = (address: number, value: number) => {
      u.dev[address] = (value);
      if ((deo_mask[address >> 4] >> (address & 0xf)) & 0x1) uxn_deo(u, address);
    }

    const DEI = (address: number, value: number) => {
      PUT(address, ((dei_mask[value >> 4] >> (value & 0xf)) & 0x1) ? uxn_dei(u, value) : u.dev[value]);
    }

    for(;;) {
      ins = u8((u.ram[pc++]));
      k = keepFlag(ins)
      s = returnFlag(ins) ? u.rst : u.wst

      switch (ins) {
        case opCodes.BRK:     return 1
        case opCodes.JCI:
          if (s.dat[s.ptr] > 0) {
            pc = u16(PEEK2(u.ram.slice(pc)) + pc)
          }
          pc = u16(2 + pc)
          break;
        case opCodes.JMI:     pc = u16(pc + u16(PEEK2(u.ram.slice(pc)) + 2)); break;
        case opCodes.JSI:     PUSH2(u.rst, u16(pc + 2)); pc = u16(pc + u16(PEEK2(u.ram.slice(pc)) + 2)); break;
      }

      const short = shortFlag(ins)

      if (short) {
        switch (base(ins)) {
          case opCodes.LIT:     PUSH(s, u.ram[pc]); pc = u16(pc + 1); break;
          case opCodes.INC:     t = T(); SET(1, 0); PUT(0, u16(t + 1)); break;
          case opCodes.POP:     SET(1, -1); break;
          case opCodes.NIP:     t = T(); SET(2, -1); PUT(0, t); break;
          case opCodes.SWP:     t = T(); n = N(); SET(2, 0); PUT(0, n); PUT(1, t); break;
          case opCodes.ROT:     t = T(); n = N(); l = L(); SET(3, 0); PUT(0, l); PUT(1, t); PUT(2, n); break;
          case opCodes.DUP:     t = T(); SET(1, 1); PUT(0, t); PUT(1, t); break;          
          case opCodes.OVR:     t = T(); n = N(); SET(2, 1); PUT(0, n); PUT(1, t); PUT(2, n); break;
          case opCodes.EQU:     t = T(); n = N(); SET(2, -1); PUT(0, n == t ? 1 : 0); break;
          case opCodes.NEQ:     t = T(); n = N(); SET(2, -1); PUT(0, n != t ? 0 : 1); break;
          case opCodes.GTH:     t = T(); n = N(); SET(2, -1); PUT(0, n > t ? 1 : 0); break;
          case opCodes.LTH:     t = T(); n = N(); SET(2, -1); PUT(0, n < t ? 1 : 0); break;
          case opCodes.JMP:     t = T(); SET(1, -1); pc = u16(pc + t); break;
          case opCodes.JCN:     t = T(); n = N(); SET(2, -2); pc = u16(pc + u16(n * t)); break;
          case opCodes.JSR:     t = T(); SET(1, -1); PUSH2(u.rst, pc); pc = u16(pc + t); break;
          case opCodes.STH:     t = T(); SET(1, -1); PUSH((ins & 0x40 ? u.wst : u.rst), t); break;
          case opCodes.LDZ:     t = T(); SET(1, 0); PUT(0, u.ram[t]); break;
          case opCodes.STZ:     t = T(); n = N(); SET(2,-2); u.ram[t] = (n); break;
          case opCodes.LDR:     t = T(); SET(1, 0); PUT(0, u.ram[u16(pc + t)]); break;
          case opCodes.STR:     t = T(); n = N(); SET(2,-2); u.ram[u16(pc + t)] = (n); break;
          case opCodes.LDA:     t = T2(); SET(2,-1); PUT(0, u.ram[t]); break;
          case opCodes.STA:     t = T2(); n = L(); SET(3,-3); u.ram[t] = (n); break;
          case opCodes.DEI:     t = T(); SET(1, 0); DEI(0, t); break;
          case opCodes.DEO:     t = T(); n = N(); SET(2,-2); DEO(t, n); break;
          case opCodes.ADD:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n + t)); break;
          case opCodes.SUB:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n - t)); break;
          case opCodes.MUL:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n * t)); break;
          case opCodes.DIV:     t = T(); n = N(); SET(2,-1); if(!t) HALT(3); PUT(0, u16(n / t)); break;
          case opCodes.AND:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n & t)); break;
          case opCodes.ORA:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n | t)); break;
          case opCodes.EOR:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n ^ t)); break;
          case opCodes.SFT:     t = T(); n = N(); SET(2,-1); PUT2(0, u16(n >> u16(t & 0xf) << u16(t >> 4))); break;
        }
      } else {
        switch (base(ins)) {
          case opCodes.LIT:
            PUSH(s, u.ram[pc]); pc = u16(pc + 1);
            PUSH(s, u.ram[pc]); pc = u16(pc + 1);
            break;
          case opCodes.INC:     t = T2(); SET(2, 0); PUT2(0, t + 1); break;
          case opCodes.POP:     SET(2, -2); break;
          case opCodes.NIP:     t = T2(); SET(4, -2); PUT2(0, t); break;
          case opCodes.SWP:     t = T2(); n = N2(); SET(4, 0); PUT2(0, n); PUT2(2, t); break;
          case opCodes.ROT:     t = T2(); n = N2(); l = L2(); SET(6, 0); PUT2(0, l); PUT2(2, t); PUT2(4, n); break;
          case opCodes.DUP:     t = T2(); SET(2, 2); PUT2(0, t); PUT2(2, t); break;   
          case opCodes.OVR:     t = T2(); n = N2(); SET(4, 2); PUT2(0, n); PUT2(2, t); PUT2(4, n); break;
          case opCodes.EQU:     t = T2(); n = N2(); SET(4, -3); PUT(0, n == t ? 1 : 0); break;
          case opCodes.NEQ:     t = T2(); n = N2(); SET(4, -3); PUT(0, n != t ? 1 : 0); break;
          case opCodes.GTH:     t = T2(); n = N2(); SET(4, -3); PUT(0, n > t ? 1 : 0); break;
          case opCodes.LTH:     t = T2(); n = N2(); SET(4, -3); PUT(0, n < t ? 1 : 0); break;
          case opCodes.JMP:     t = T2(); SET(2, -2); pc = t; break;
          case opCodes.JCN:     t = T2(); n = L(); SET(3, -3); if(n) pc = t; break;
          case opCodes.JSR:     t = T2(); SET(2, -2); PUSH2(u.rst, pc); pc = t; break;
          case opCodes.STH:     t = T2(); SET(2, -2); PUSH2((ins & 0x40 ? u.wst : u.rst), t); break;
          case opCodes.LDZ:     t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(t))); break;
          case opCodes.STZ:     t = T(); n = H2(); SET(3,-3); POKE2(u.ram, t, n); break;
          case opCodes.LDR:     t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(u16(pc + t)))); break;
          case opCodes.STR:     t = T(); n = H2(); SET(3,-3); POKE2(u.ram, (u16(pc + t)), n); break;
          case opCodes.LDA:     t = T2(); SET(2, 0); PUT2(0, PEEK2(u.ram.slice(t))); break;
          case opCodes.STA:     t = T2(); n = N2(); SET(4,-4); POKE2(u.ram, (t), n); break;
          case opCodes.DEI:     t = T(); SET(1, 1); DEI(1, t); DEI(0, t + 1); break;
          case opCodes.DEO:     t = T(); n = N(); l = L(); SET(3,-3); DEO(t, l); DEO(t + 1, n); break;
          case opCodes.ADD:     t = T2(); n = N2(); SET(4,-2); PUT(0, u16(n + t)); break;
          case opCodes.SUB:     t = T2(); n = N2(); SET(4,-2); PUT2(0, u16(n - t)); break;
          case opCodes.MUL:     t = T2(); n = N2(); SET(4,-2); PUT2(0, u16(n * t)); break;
          case opCodes.DIV:     t = T2(); n = N2(); SET(4,-2); if(!t) HALT(3); PUT2(0, u16(n / t)); break;
          case opCodes.AND:     t = T2(); n = N2(); SET(4,-2); PUT2(0, u16(n & t)); break;
          case opCodes.ORA:     t = T2(); n = N2(); SET(4,-2); PUT2(0, u16(n | t)); break;
          case opCodes.EOR:     t = T2(); n = N2(); SET(4,-2); PUT2(0, u16(n ^ t)); break;
          case opCodes.SFT:     t = T(); n = H2(); SET(3,-1); PUT2(0, u16(n >> u16(t & 0xf) << u16(t >> 4))); break;
        }
      }
    }
}

function uxn_boot(u: Uxn, ram: number[])
{
	u.ram = ram;

	return 1;
}


const RAM_PAGES = 0x10
const PAD = 4
const TIMEOUT_MS = 334
const BENCH = 0

let zoom = 1;
let stdin_event: number, audio0_event: number;
let exec_deadline: number, deadline_interval: number, ms_interval: number;

const deo_mask: number[] = [0xff08, 0x0300, 0xc028, 0x8000, 0x8000, 0x8000, 0x8000, 0x0000, 0x0000, 0x0000, 0xa260, 0xa260, 0x0000, 0x0000, 0x0000, 0x0000]
const dei_mask: number[] = [0x0000, 0x0000, 0x003c, 0x0014, 0x0014, 0x0014, 0x0014, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x07ff, 0x0000, 0x0000, 0x0000]

function emu_error(msg: string, err: string): number {
  outError(`Error ${msg}: ${err}`);
  return 1;
}

function console_deo(d: number[], port: number): void {
  switch (port) {
    case 0x8:
      out(String.fromCharCode(d[port]));
      return;
    case 0x9:
      outError(String.fromCharCode(d[port]));
      return;
  }
}

function uxn_dei(u: Uxn, addr: number): number {
  const p = u16(addr & 0x0f), d = u16(addr & 0xf0);
	
  switch(d) {
    case 0x20: return screen_dei(u, addr);
    // case 0x30: return audio_dei(0, u.dev.slice(d), p);
    // case 0x40: return audio_dei(1, u.dev.slice(d), p);
    // case 0x50: return audio_dei(2, u.dev.slice(d), p);
    // case 0x60: return audio_dei(3, u.dev.slice(d), p);
    // case 0xc0: return datetime_dei(u, addr);
	}
	return u.dev[addr];
}

function uxn_deo(u: Uxn, addr: number): void {
  const p = u16(addr & 0x0f), d = u16(addr & 0xf0);

	switch(d) {
    case 0x00:
      system_deo(u, u.dev.slice(d), p);

      if(p > 0x7 && p < 0xe)
        screen_palette(uxn_screen, u.dev.slice(0x8));
      break;
    case 0x10: console_deo(u.dev.slice(d), p); break;
    case 0x20: screen_deo(u.ram, u.dev.slice(d), p); break;
    // case 0x30: audio_deo(0, u.dev.slice(d), p, u); break;
    // case 0x40: audio_deo(1, u.dev.slice(d), p, u); break;
    // case 0x50: audio_deo(2, u.dev.slice(d), p, u); break;
    // case 0x60: audio_deo(3, u.dev.slice(d), p, u); break;
    // case 0xa0: file_deo(0, u.ram, u.dev.slice(d), p); break;
    // case 0xb0: file_deo(1, u.ram, u.dev.slice(d), p); break;
	}
}

function draw () {
//   const canvas = document.getElementById('canvas') as HTMLCanvasElement

//   canvas.width = uxn_screen.width
//   canvas.height = uxn_screen.height

//   if (canvas) {
//     const ctx = canvas.getContext('2d')

//     if (ctx) {
//       for (let x = 0; x < WIDTH; x++) {
//         for (let y = 0; y < HEIGHT; y++) {
//           if (uxn_screen.bg.pixels[x + y * WIDTH]) {
//             ctx.fillStyle = `#${uxn_screen.palette[uxn_screen.bg.pixels[x + y * WIDTH]].toString(16)}`;
//             ctx.fillRect(x, y, 1, 1);
//           }

//           if (uxn_screen.fg.pixels[x + y * WIDTH]) {
//             ctx.fillStyle = `#${uxn_screen.palette[uxn_screen.fg.pixels[x + y * WIDTH]].toString(16)}`;
//             ctx.fillRect(x, y, 1, 1);
//           }
//         }
//       }
//     }
//   }
}

function main(): number {
  const u = new Uxn(uxn_dei, uxn_deo);

  if (!uxn_boot(u, (new Array(0x10000 * RAM_PAGES).fill(0)))) {
    return emu_error("Boot", "Failed");
  }

  if (!system_load(u)) {
    return emu_error("Load", "Failed");
  }

  if (!uxn_eval(u, (PAGE_PROGRAM))) {
    return u.dev[0x0f] & 0x7f;
  }

  // const screen_vector = PEEK2(u.dev.slice(0x20));

  // uxn_eval(u, screen_vector)

  draw()

  return 0
}

main()
