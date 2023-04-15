import { deo_mask, dei_mask } from './uxncli'
import { Uint16, Uint8, u16FromNumbers, u8FromNumbers } from './tooling'

const PAGE_PROGRAM = 0x0100

function POKE2(d: Uint8[], v: number) {
    d[0] = new Uint8(v >> 8);
    d[1] = new Uint8(v);
  }

function PEEK2(d: Uint8[]): Uint8 {
    return new Uint8((d[0].val << 8) | d[1].val);
}

class Stack {
    dat: Uint8[];
    ptr: number;

    constructor () {
        this.dat = u8FromNumbers(new Array(255));
        this.ptr = 0;
    }
}

class Uxn {
    ram: Uint8[];
    dev: Uint8[];
    wst: Stack;
    rst: Stack;
    // dei: (u: Uxn, addr: number) => number;
    // deo: (u: Uxn, addr: number) => void;

    constructor () {
        this.ram = [];
        this.dev = u8FromNumbers(new Array(256));
        this.wst = new Stack();
        this.rst = new Stack();
    }
};

declare function uxn_dei(u: Uxn, addr: number): number;
declare function uxn_deo(u: Uxn, addr: number): void;
declare function uxn_halt(u: Uxn, ins: Uint8, err: number, addr: Uint16): number;

declare function uxn_boot(u: Uxn, ram: Uint8[]): number;

function uxn_eval(u: Uxn, pc: Uint16): number {
    let ins: Uint8, m2: Uint8, opc: Uint8, k: Uint8;
    let t: Uint16, n: Uint16, l: Uint16, tmp: Uint16;
    let s: Stack;
    const z: Stack = new Stack();

    if(!pc || u.dev[0x0f]) return 0;

    /* Registers

    [ . ][ . ][ . ][ L ][ N ][ T ] <
    [ . ][ . ][ . ][   H2   ][ T ] <
    [   L2   ][   N2   ][   T2   ] <

    */
    const T = () => s.dat[s.ptr - 1];
    const N = () => s.dat[s.ptr - 2];
    const L = () => s.dat[s.ptr - 3];
    const H2 = () => (s.dat[s.ptr - 3].val << 8) | s.dat[s.ptr - 2].val;
    const T2 = () => (s.dat[s.ptr - 2].val << 8) | s.dat[s.ptr - 1].val;
    const N2 = () => (s.dat[s.ptr - 4].val << 8) | s.dat[s.ptr - 3].val;
    const L2 = () => (s.dat[s.ptr - 6].val << 8) | s.dat[s.ptr - 5].val;

    const HALT = (c: number): number => uxn_halt(u, ins, c, new Uint8(pc.val - 1));
    const SET = (mul: number, add: number): void => { let tmp = s.ptr + k * mul + add; if (mul > s.ptr || tmp > 254) HALT(1); s.ptr = tmp; };
    const PUT = (offset: number, value: number) => { s.dat[s.ptr - 1 - offset] = new Uint8(value); };
    const PUT2 = (offset: number, value: number) => { const tmp = value; s.dat[s.ptr - offset - 2] = new Uint8(tmp >> 8); s.dat[s.ptr - offset - 1] = new Uint8(tmp); }
    // const PUSH = (x, value: number) => { if(s.ptr > 254) HALT(2); s.dat[s.ptr++] = value; }
    // const PUSH2 = (value: number) => { if(s.ptr > 253) HALT(2); const tmp = value; s.dat[s.ptr] = tmp >> 8; s.dat[s.ptr + 1] = tmp; s.ptr += 2; }
    const DEO = (address: number, value: number) => { u.dev[address] = new Uint8(value); if((deo_mask[address >> 4].val >> (address & 0xf)) & 0x1) uxn_deo(u, address); }
    const DEI = (address: number, value: number) => { PUT(address, ((dei_mask[value >> 4].val >> (value & 0xf)) & 0x1) ? uxn_dei(u, value) : u.dev[value]); }

    // for(;;) {
        ins = u.ram[pc.val++];
        k = new Uint8(ins.val & 0x80);
        s = ins.val & 0x40 ? u.rst : u.wst;
        opc = new Uint8(!(ins.val & 0x1f) ? 0 - (ins.val >> 5) : ins.val & 0x3f);
        
        switch(opc) {
            /* IMM */
            // case 0x00: /* BRK   */ return 1;
            // case 0xff: /* JCI   */ pc += s.dat[--s.ptr] * PEEK2(u.ram[pc]) + 2; break;
            // case 0xfe: /* JMI   */ pc += PEEK2(u.ram, pc) + 2; break;
            // case 0xfd: /* JSI   */ PUSH2(u.rst, pc + 2); pc += PEEK2(u.ram, pc) + 2; break;
            // case 0xfc: /* LIT   */ PUSH(s, u.ram[pc++]); break;
            // case 0xfb: /* LIT2  */ PUSH2(s, PEEK2(u.ram, pc)); pc += 2; break;
            // case 0xfa: /* LITr  */ PUSH(s, u.ram[pc++]); break;
            // case 0xf9: /* LIT2r */ PUSH2(s, PEEK2(u.ram, pc)); pc += 2; break;
        }
        
    // }
    
    return 0
}