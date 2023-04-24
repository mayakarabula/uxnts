import { uxn_halt } from './devices/system';
import { base, keepFlag, opCodes, returnFlag, shortFlag } from './opCodes';
import { deo_mask, dei_mask, uxn_deo, uxn_dei } from './uxnemu'

export const PAGE_PROGRAM = 0x0100

export function POKE2(d: number[], addr: number, v: number) {
    d[addr] = (v >> 8);
    d[addr + 1] = (v);
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

export function uxn_eval(u: Uxn, pc: number): number {
    let ins: number, m2: number, k: number;
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
      k = keepFlag(ins) //(ins & 0x80);
      s = returnFlag(ins) ? u.rst : u.wst // s = ins & 0x40 ? u.rst : u.wst;
      // opc = (!(ins & 0x1f) ? 0 - (ins >> 5) : ins & 0x3f);

      console.log({ ins, opCodes, op: opCodes[ins], base: base(ins), baseOp: opCodes[base(ins) || 0] })

      switch (ins) {
        case opCodes.BRK:     return 1
        case opCodes.JCI:     pc += (s.dat[s.ptr--] * PEEK2(u.ram.slice(pc)) + 2); break;
        case opCodes.JMI:     pc += (PEEK2(u.ram.slice(pc)) + 2); break;
        case opCodes.JSI:     PUSH2(u.rst, pc + 2); pc += (pc + PEEK2(u.ram.slice(pc)) + 2); break;
        case opCodes.LIT:     PUSH(s, u.ram[pc++]); break;
        case opCodes.LIT2:    PUSH2(s, PEEK2(u.ram.slice(pc))); pc += 2; break;
        case opCodes.LITr:    PUSH(s, u.ram[pc++]); break;
        case opCodes.LIT2r:   PUSH2(s, PEEK2(u.ram.slice(pc))); pc += 2; break;
      }

      const short = shortFlag(ins)

      if (short) {
        switch (base(ins)) {
          case opCodes.INC:     t = T(); SET(1, 0); PUT(0, t + 1); break;
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
          case opCodes.JMP:     t = T(); SET(1, -1); pc += t; break;
          case opCodes.JCN:     t = T(); n = N(); SET(2, -2); pc += n * t; break;
          case opCodes.JSR:     t = T(); SET(1, -1); PUSH2(u.rst, pc); pc += t; break;
          case opCodes.STH:     t = T(); SET(1, -1); PUSH((ins & 0x40 ? u.wst : u.rst), t); break;
          case opCodes.LDZ:     t = T(); SET(1, 0); PUT(0, u.ram[t]); break;
          case opCodes.STZ:     t = T(); n = N(); SET(2,-2); u.ram[t] = (n); break;
          case opCodes.LDR:     t = T(); SET(1, 0); PUT(0, u.ram[pc + t]); break;
          case opCodes.STR:     t = T(); n = N(); SET(2,-2); u.ram[pc + t] = (n); break;
          case opCodes.LDA:     t = T2(); SET(2,-1); PUT(0, u.ram[t]); break;
          case opCodes.STA:     t = T2(); n = L(); SET(3,-3); u.ram[t] = (n); break;
          case opCodes.DEI:     t = T(); SET(1, 0); DEI(0, t); break;
          case opCodes.DEO:     t = T(); n = N(); SET(2,-2); DEO(t, n); break;
          case opCodes.ADD:     t = T(); n = N(); SET(2,-1); PUT(0, n + t); break;
          case opCodes.SUB:     t = T(); n = N(); SET(2,-1); PUT(0, n - t); break;
          case opCodes.MUL:     t = T(); n = N(); SET(2,-1); PUT(0, n * t); break;
          case opCodes.DIV:     t = T(); n = N(); SET(2,-1); if(!t) HALT(3); PUT(0, n / t); break;
          case opCodes.AND:     t = T(); n = N(); SET(2,-1); PUT(0, n & t); break;
          case opCodes.ORA:     t = T(); n = N(); SET(2,-1); PUT(0, n | t); break;
          case opCodes.EOR:     t = T(); n = N(); SET(2,-1); PUT(0, n ^ t); break;
          case opCodes.SFT:     t = T(); n = N(); SET(2,-1); PUT(0, n >> (t & 0xf) << (t >> 4)); break;
        }
      } else {
        switch (base(ins)) {
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
          case opCodes.LDR:     t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(pc + t))); break;
          case opCodes.STR:     t = T(); n = H2(); SET(3,-3); POKE2(u.ram, (pc + t), n); break;
          case opCodes.LDA:     t = T2(); SET(2, 0); PUT2(0, PEEK2(u.ram.slice(t))); break;
          case opCodes.STA:     t = T2(); n = N2(); SET(4,-4); POKE2(u.ram, (t), n); break;
          case opCodes.DEI:     t = T(); SET(1, 1); DEI(1, t); DEI(0, t + 1); break;
          case opCodes.DEO:     t = T(); n = N(); l = L(); SET(3,-3); DEO(t, l); DEO(t + 1, n); break;
          case opCodes.ADD:     t = T2(); n = N2(); SET(4,-2); PUT2(0, n + t); break;
          case opCodes.SUB:     t = T2(); n = N2(); SET(4,-2); PUT2(0, n - t); break;
          case opCodes.MUL:     t = T2(); n = N2(); SET(4,-2); PUT2(0, n * t); break;
          case opCodes.DIV:     t = T2(); n = N2(); SET(4,-2); if(!t) HALT(3); PUT2(0, n / t); break;
          case opCodes.AND:     t = T2(); n = N2(); SET(4,-2); PUT2(0, n & t); break;
          case opCodes.ORA:     t = T2(); n = N2(); SET(4,-2); PUT2(0, n | t); break;
          case opCodes.EOR:     t = T2(); n = N2(); SET(4,-2); PUT2(0, n ^ t); break;
          case opCodes.SFT:     t = T(); n = H2(); SET(3,-1); PUT2(0, n >> (t & 0xf) << (t >> 4)); break;
        }
      }
    }
}

export function uxn_boot(u: Uxn, ram: number[])
{
	u.ram = ram;

	return 1;
}