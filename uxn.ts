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
    ptr: Uint8;

    constructor () {
        this.dat = u8FromNumbers(new Array(255));
        this.ptr = new Uint8(0);
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
declare function uxn_halt(u: Uxn, ins: number, err: number, addr: Uint16): number;

declare function uxn_boot(u: Uxn, ram: Uint8[]): number;

function uxn_eval(u: Uxn, pc: Uint16): number {
    let ins: number, m2: number, opc: number, k: number;
    let t: number, n: number, l: number, tmp: number;
    let s: Stack;
    let z: Stack = new Stack();

    if(!pc || u.dev[0x0f]) return 0;

    /* Registers

    [ . ][ . ][ . ][ L ][ N ][ T ] <
    [ . ][ . ][ . ][   H2   ][ T ] <
    [   L2   ][   N2   ][   T2   ] <

    */
    const T = () => s.dat[s.ptr.val - 1].val;
    const N = () => s.dat[s.ptr.val - 2].val;
    const L = () => s.dat[s.ptr.val - 3].val;
    const H2 = () => (s.dat[s.ptr.val - 3].val << 8) | s.dat[s.ptr.val - 2].val;
    const T2 = () => (s.dat[s.ptr.val - 2].val << 8) | s.dat[s.ptr.val - 1].val;
    const N2 = () => (s.dat[s.ptr.val - 4].val << 8) | s.dat[s.ptr.val- 3].val;
    const L2 = () => (s.dat[s.ptr.val - 6].val << 8) | s.dat[s.ptr.val - 5].val;

    const HALT = (c: number): number => uxn_halt(u, ins, c, new Uint8(pc.val - 1));
    const SET = (mul: number, add: number): void => { 
      if (mul > s.ptr.val) HALT(1);
      tmp = (s.ptr.val + k * mul + add);
      if (tmp > 254) HALT(2);
      s.ptr = new Uint16(tmp); 
    };
    const PUT = (offset: number, value: number) => { 
      s.dat[s.ptr.val - 1 - offset] = new Uint8(value); 
    };
    const PUT2 = (offset: number, value: number) => {
      const tmp = value; 
      s.dat[s.ptr.val - offset - 2] = new Uint8(tmp >> 8);
      s.dat[s.ptr.val - offset - 1] = new Uint8(tmp); 
    }
    const PUSH = (x: Stack, value: number) => { 
      z = x;
      if (z.ptr.val > 254) HALT(2);
      z.dat[z.ptr.val++] = new Uint8(value); 
    }
    const PUSH2 = (x: Stack, value: number) => { 
      z = x;
      if(s.ptr.val > 253) HALT(2);
      tmp = value; 
      z.dat[z.ptr.val] = new Uint8(tmp >> 8);
      z.dat[z.ptr.val + 1] = new Uint8(tmp);
      z.ptr.val += 2; 
    }
    const DEO = (address: number, value: number) => {
      u.dev[address] = new Uint8(value);
      if ((deo_mask[address >> 4].val >> (address & 0xf)) & 0x1) uxn_deo(u, address);
    }
    const DEI = (address: number, value: number) => {
      PUT(address, ((dei_mask[value >> 4].val >> (value & 0xf)) & 0x1) ? uxn_dei(u, value) : u.dev[value].val);
    }

    // for(;;) {
        ins = (u.ram[pc.val++].val & 0xff);
        k = (ins & 0x80);
        s = ins & 0x40 ? u.rst : u.wst;
        opc = (!(ins & 0x1f) ? 0 - (ins >> 5) : ins & 0x3f);
        
        switch(opc) {
            /* IMM */
            case 0x00: /* BRK   */ return 1;
            case 0xff: /* JCI   */ pc.val += (s.dat[s.ptr.val--].val * PEEK2(u.ram.slice(pc.val)).val + 2); break;
            case 0xfe: /* JMI   */ pc.val += (PEEK2(u.ram.slice(pc.val)).val + 2); break;
            case 0xfd: /* JSI   */ PUSH2(u.rst, pc.val + 2); pc.val += (pc.val + PEEK2(u.ram.slice(pc.val)).val + 2); break;
            case 0xfc: /* LIT   */ PUSH(s, u.ram[pc.val++].val); break;
            case 0xfb: /* LIT2  */ PUSH2(s, PEEK2(u.ram.slice(pc.val)).val); pc.val += 2; break;
            case 0xfa: /* LITr  */ PUSH(s, u.ram[pc.val++].val); break;
            case 0xf9: /* LIT2r */ PUSH2(s, PEEK2(u.ram.slice(pc.val)).val); pc.val += 2; break;
            /* ALU */
            case 0x01: /* INC  */ t = T(); SET(1, 0); PUT(0, t + 1); break;
            case 0x21:            t = T2(); SET(2, 0); PUT2(0, t + 1); break;
            case 0x02: /* POP  */ SET(1, -1); break;
            case 0x22:            SET(2, -2); break;
            case 0x03: /* NIP  */ t = T(); SET(2, -1); PUT(0, t); break;
            case 0x23:            t = T2(); SET(4, -2); PUT2(0, t); break;
            case 0x04: /* SWP  */ t = T(); n = N(); SET(2, 0); PUT(0, n); PUT(1, t); break;
            case 0x24:            t = T2(); n = N2(); SET(4, 0); PUT2(0, n); PUT2(2, t); break;
            case 0x05: /* ROT  */ t = T(); n = N(); l = L(); SET(3, 0); PUT(0, l); PUT(1, t); PUT(2, n); break;
            case 0x25:            t = T2(); n = N2(); l = L2(); SET(6, 0); PUT2(0, l); PUT2(2, t); PUT2(4, n); break;
            case 0x06: /* DUP  */ t = T(); SET(1, 1); PUT(0, t); PUT(1, t); break;
            case 0x26:            t = T2(); SET(2, 2); PUT2(0, t); PUT2(2, t); break;
            case 0x07: /* OVR  */ t = T(); n = N(); SET(2, 1); PUT(0, n); PUT(1, t); PUT(2, n); break;
            case 0x27:            t = T2(); n = N2(); SET(4, 2); PUT2(0, n); PUT2(2, t); PUT2(4, n); break;
            case 0x08: /* EQU  */ t = T(); n = N(); SET(2, -1); PUT(0, n == t ? 1 : 0); break;
            case 0x28:            t = T2(); n = N2(); SET(4, -3); PUT(0, n == t ? 1 : 0); break;
            case 0x09: /* NEQ  */ t = T(); n = N(); SET(2, -1); PUT(0, n != t ? 0 : 1); break;
            case 0x29:            t = T2(); n = N2(); SET(4, -3); PUT(0, n != t ? 1 : 0); break;
            case 0x0a: /* GTH  */ t = T(); n = N(); SET(2, -1); PUT(0, n > t ? 1 : 0); break;
            case 0x2a:            t = T2(); n = N2(); SET(4, -3); PUT(0, n > t ? 1 : 0); break;
            case 0x0b: /* LTH  */ t = T(); n = N(); SET(2, -1); PUT(0, n < t ? 1 : 0); break;
            case 0x2b:            t = T2(); n = N2(); SET(4, -3); PUT(0, n < t ? 1 : 0); break;
            case 0x0c: /* JMP  */ t = T(); SET(1, -1); pc.val += t; break;
            case 0x2c:            t = T2(); SET(2, -2); pc.val = t; break;
            case 0x0d: /* JCN  */ t = T(); n = N(); SET(2, -2); pc.val += n * t; break;
            case 0x2d:            t = T2(); n = L(); SET(3, -3); if(n) pc.val = t; break;
            case 0x0e: /* JSR  */ t = T(); SET(1, -1); PUSH2(u.rst, pc.val); pc.val += t; break;
            case 0x2e:            t = T2(); SET(2, -2); PUSH2(u.rst, pc.val); pc.val = t; break;
            case 0x0f: /* STH  */ t = T(); SET(1, -1); PUSH((ins & 0x40 ? u.wst : u.rst), t); break;
            case 0x2f:            t = T2(); SET(2, -2); PUSH2((ins & 0x40 ? u.wst : u.rst), t); break;
            case 0x10: /* LDZ  */ t = T(); SET(1, 0); PUT(0, u.ram[t].val); break;
            
          }
            
    // }
    
    return 0
}
