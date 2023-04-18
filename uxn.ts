import { deo_mask, dei_mask, uxn_deo, uxn_dei } from './uxncli'

export const PAGE_PROGRAM = 0x0100

export function POKE2(d: number[], v: number) {
    d[0] = (v >> 8);
    d[1] = (v);
  }

export function PEEK2(d: number[]): number {
    return ((d[0] << 8) | d[1]);
}

export class Stack {
    dat: number[];
    ptr: number;

    constructor () {
        this.dat = (new Array(255).fill(0));
        this.ptr = 0;
    }
}

export class Uxn {
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

declare function uxn_halt(u: Uxn, ins: number, err: number, addr: number): number;

export function uxn_eval(u: Uxn, pc: number): number {
    let ins: number, m2: number, opc: number, k: number;
    let t: number, n: number, l: number, tmp: number;
    let s: Stack = new Stack();
    let z: Stack = new Stack();

    if(!pc || u.dev[0x0f]) return 0;

    /* Registers

    [ . ][ . ][ . ][ L ][ N ][ T ] <
    [ . ][ . ][ . ][   H2   ][ T ] <
    [   L2   ][   N2   ][   T2   ] <

    */
    const T = () => s.dat[s.ptr - 1];
    const N = () => s.dat[s.ptr - 2];
    const L = () => s.dat[s.ptr - 3];
    const H2 = () => (s.dat[s.ptr - 3] << 8) | s.dat[s.ptr - 2];
    const T2 = () => (s.dat[s.ptr - 2] << 8) | s.dat[s.ptr - 1];
    const N2 = () => (s.dat[s.ptr - 4] << 8) | s.dat[s.ptr- 3];
    const L2 = () => (s.dat[s.ptr - 6] << 8) | s.dat[s.ptr - 5];

    const HALT = (c: number): number => uxn_halt(u, ins, c, (pc - 1));
    
    const SET = (mul: number, add: number): void => { 
      if (mul > s.ptr) HALT(1);
      tmp = (s.ptr + k * mul + add);
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
      z.dat[z.ptr++] = (value); 
    }

    const PUSH2 = (x: Stack, value: number) => { 
      z = x;
      if(s.ptr > 253) HALT(2);
      tmp = value; 
      z.dat[z.ptr] = (tmp >> 8);
      z.dat[z.ptr + 1] = (tmp);
      z.ptr += 2; 
    }

    const DEO = (address: number, value: number) => {
      u.dev[address] = (value);
      if ((deo_mask[address >> 4] >> (address & 0xf)) & 0x1) uxn_deo(u, address);
    }

    const DEI = (address: number, value: number) => {
      PUT(address, ((dei_mask[value >> 4] >> (value & 0xf)) & 0x1) ? uxn_dei(u, value) : u.dev[value]);
    }

    for(;;) {
        ins = (u.ram[pc++] & 0xff);
        k = (ins & 0x80);
        s = ins & 0x40 ? u.rst : u.wst;
        opc = (!(ins & 0x1f) ? 0 - (ins >> 5) : ins & 0x3f);

        switch(opc) {
            /* IMM */
            case -0x00: /* BRK   */ return 1;
            case -0x01: /* JCI   */ pc += (s.dat[s.ptr--] * PEEK2(u.ram.slice(pc)) + 2); break;
            case -0x02: /* JMI   */ pc += (PEEK2(u.ram.slice(pc)) + 2); break;
            case -0x03: /* JSI   */ PUSH2(u.rst, pc + 2); pc += (pc + PEEK2(u.ram.slice(pc)) + 2); break;
            case -0x04: /* LIT   */ PUSH(s, u.ram[pc++]); break;
            case -0x05: /* LIT2  */ PUSH2(s, PEEK2(u.ram.slice(pc))); pc += 2; break;
            case -0x06: /* LITr  */ PUSH(s, u.ram[pc++]); break;
            case -0x07: /* LIT2r */ PUSH2(s, PEEK2(u.ram.slice(pc))); pc += 2; break;
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
            case 0x0c: /* JMP  */ t = T(); SET(1, -1); pc += t; break;
            case 0x2c:            t = T2(); SET(2, -2); pc = t; break;
            case 0x0d: /* JCN  */ t = T(); n = N(); SET(2, -2); pc += n * t; break;
            case 0x2d:            t = T2(); n = L(); SET(3, -3); if(n) pc = t; break;
            case 0x0e: /* JSR  */ t = T(); SET(1, -1); PUSH2(u.rst, pc); pc += t; break;
            case 0x2e:            t = T2(); SET(2, -2); PUSH2(u.rst, pc); pc = t; break;
            case 0x0f: /* STH  */ t = T(); SET(1, -1); PUSH((ins & 0x40 ? u.wst : u.rst), t); break;
            case 0x2f:            t = T2(); SET(2, -2); PUSH2((ins & 0x40 ? u.wst : u.rst), t); break;
            case 0x10: /* LDZ  */ t = T(); SET(1, 0); PUT(0, u.ram[t]); break;
            case 0x30:            t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(t))); break;
            case 0x11: /* STZ  */ t = T(); n = N(); SET(2,-2); u.ram[t] = (n); break;
            case 0x31:            t = T(); n = H2(); SET(3,-3); POKE2(u.ram.slice(t), n); break;
            case 0x12: /* LDR  */ t = T(); SET(1, 0); PUT(0, u.ram[pc + t]); break;
            case 0x32:            t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(pc + t))); break;
            case 0x13: /* STR  */ t = T(); n = N(); SET(2,-2); u.ram[pc + t] = (n); break;
            case 0x33:            t = T(); n = H2(); SET(3,-3); POKE2(u.ram.slice(pc + t), n); break;
            case 0x14: /* LDA  */ t = T2(); SET(2,-1); PUT(0, u.ram[t]); break;
            case 0x34:            t = T2(); SET(2, 0); PUT2(0, PEEK2(u.ram.slice(t))); break;
            case 0x15: /* STA  */ t = T2(); n = L(); SET(3,-3); u.ram[t] = (n); break;
            case 0x35:            t = T2(); n = N2(); SET(4,-4); POKE2(u.ram.slice(t), n); break;
            case 0x16: /* DEI  */ t = T(); SET(1, 0); DEI(0, t); break;
            case 0x36:            t = T(); SET(1, 1); DEI(1, t); DEI(0, t + 1); break;
            case 0x17: /* DEO  */ t = T(); n = N(); SET(2,-2); DEO(t, n); break;
            case 0x37:            t = T(); n = N(); l = L(); SET(3,-3); DEO(t, l); DEO(t + 1, n); break;
            case 0x18: /* ADD  */ t = T(); n = N(); SET(2,-1); PUT(0, n + t); break;
            case 0x38:            t = T2(); n = N2(); SET(4,-2); PUT2(0, n + t); break;
            case 0x19: /* SUB  */ t = T(); n = N(); SET(2,-1); PUT(0, n - t); break;
            case 0x39:            t = T2(); n = N2(); SET(4,-2); PUT2(0, n - t); break;
            case 0x1a: /* MUL  */ t = T(); n = N(); SET(2,-1); PUT(0, n * t); break;
            case 0x3a:            t = T2(); n = N2(); SET(4,-2); PUT2(0, n * t); break;
            case 0x1b: /* DIV  */ t = T(); n = N(); SET(2,-1); if(!t) HALT(3); PUT(0, n / t); break;
            case 0x3b:            t = T2(); n = N2(); SET(4,-2); if(!t) HALT(3); PUT2(0, n / t); break;
            case 0x1c: /* AND */  t = T(); n = N(); SET(2,-1); PUT(0, n & t); break;
            case 0x3c:            t = T2(); n = N2(); SET(4,-2); PUT2(0, n & t); break;
            case 0x1d: /* ORA */  t = T(); n = N(); SET(2,-1); PUT(0, n | t); break;
            case 0x3d:            t = T2(); n = N2(); SET(4,-2); PUT2(0, n | t); break;
            case 0x1e: /* EOR */  t = T(); n = N(); SET(2,-1); PUT(0, n ^ t); break;
            case 0x3e:            t = T2(); n = N2(); SET(4,-2); PUT2(0, n ^ t); break;
            case 0x1f: /* SFT */  t = T(); n = N(); SET(2,-1); PUT(0, n >> (t & 0xf) << (t >> 4)); break;
            case 0x3f:            t = T(); n = H2(); SET(3,-1); PUT2(0, n >> (t & 0xf) << (t >> 4)); break;
          }
      }
}

export function uxn_boot(u: Uxn, ram: number[])
{
	u.ram = ram;

	return 1;
}