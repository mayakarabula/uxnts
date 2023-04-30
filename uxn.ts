import { uxn_halt } from './devices/system';
import { base, keepFlag, opCodes, returnFlag, shortFlag } from './opCodes';
import { deo_mask, dei_mask, uxn_deo, uxn_dei } from './uxnemu'

export const PAGE_PROGRAM = 0x0100

export const u16 = (a: number) => {
  const u = new Uint16Array(1) ; u[0] = a ; return u[0]
}

export const u8 = (a: number) => {
  const u = new Uint8Array(1) ; u[0] = a ; return u[0]
}

export const s8 = (a: number) => {
  const s = new Int8Array(1) ; s[0] = a ; return s[0]
}

export function POKE2(d: number[], addr: number, v: number) {
  d[addr] = u16(v >> 8);
  d[addr + 1] = u8(v);
}

export function PEEK2(d: number[]): number {
  return u16(u16(d[0] << 8) | u16(d[1]))
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
    const H2 = () => PEEK2(s.dat.slice(s.ptr - 3))
    const T2 = () => PEEK2(s.dat.slice(s.ptr - 2))
    const N2 = () => PEEK2(s.dat.slice(s.ptr - 4))
    const L2 = () => PEEK2(s.dat.slice(s.ptr - 6))

    const HALT = (c: number): number => uxn_halt(u, ins, c, (pc - 1));
    
    const SET = (mul: number, add: number): void => { 
      if (mul > s.ptr) HALT(1);
      tmp = (u16(s.ptr + ((k * mul) + add)))
      if (tmp > 254) HALT(2);
      s.ptr = (tmp); 
    };

    const PUT = (offset: number, value: number) => { 
      s.dat[s.ptr - 1 - offset] = u16(value); 
    };

    const PUT2 = (offset: number, value: number) => {
      const tmp = value; 
      s.dat[s.ptr - offset - 2] = u16(tmp >> 8);
      s.dat[s.ptr - offset - 1] = u8(tmp); 
    }

    const PUSH = (x: Stack, value: number) => { 
      z = x;
      if (z.ptr > 254) HALT(2);
      z.dat[z.ptr] = u16(value); 
      z.ptr = u16(z.ptr + 1)
    }

    const PUSH2 = (x: Stack, value: number) => {
      z = x;
      
      if(z.ptr > 253) HALT(2);
      tmp = value; 

      z.dat[z.ptr] = u16(tmp >> 8);
      z.dat[z.ptr + 1] = u8(tmp);
      z.ptr = u16(z.ptr + 2); 
    }

    const DEO = (address: number, value: number) => {
      u.dev[address] = (value);
      if ((deo_mask[address >> 4] >> (address & 0xf)) & 0x1) uxn_deo(u, address);
    }

    const DEI = (address: number, value: number) => {
      PUT(address, ((dei_mask[value >> 4] >> (value & 0xf)) & 0x1) ? uxn_dei(u, value) : u.dev[value]);
    }

    console.log('starts computation for the ROM')

    for(;;) {
      ins = u8((u.ram[pc++]));
      k = keepFlag(ins)
      s = returnFlag(ins) ? u.rst : u.wst

      // console.log(opCodes[ins])
      // console.log("( ", s.dat.slice(0, s.ptr).map(i => i.toString(16).padStart(2, "0")).join(' '), " )")

      switch (ins) {
        case opCodes.BRK:     return 1
        case opCodes.JCI:

          pc = u16(pc + ((s.dat[s.ptr - 1] > 0 ? 1 : 0) * PEEK2(u.ram.slice(pc))) + 2 )
          s.ptr--

          break;
        case opCodes.JMI:     pc = u16(pc + u16(PEEK2(u.ram.slice(pc)) + 2)); break;
        case opCodes.JSI:     
          PUSH2(u.rst, u16(pc + 2));
          pc = u16(pc + u16(PEEK2(u.ram.slice(pc)) + 2)); 

          break;
      }

      const short = shortFlag(ins)

      if (short) {
        switch (base(ins)) {
          case opCodes.LIT:     
            PUSH(s, u.ram[pc]); 
            pc = u16(pc + 1); 
            break;
          case opCodes.INC:     
            t = T(); SET(1, 0); 
            PUT(0, u16(t + 1)); 
            break;
          case opCodes.POP:     SET(1, -1); break;
          case opCodes.NIP:     t = T(); SET(2, -1); PUT(0, t); break;
          case opCodes.SWP:     
          t = T(); n = N(); SET(2, 0); 
          PUT(0, n);
           PUT(1, t); break;
          case opCodes.ROT:     t = T(); n = N(); l = L(); SET(3, 0); PUT(0, l); PUT(1, t); PUT(2, n); break;
          case opCodes.DUP:     
            t = T(); SET(1, 1); 
            PUT(0, t); 
            PUT(1, t); 
            break;          
          case opCodes.OVR:     t = T(); n = N(); SET(2, 1); PUT(0, n); PUT(1, t); PUT(2, n); break;
          case opCodes.EQU:     t = T(); n = N(); SET(2, -1); PUT(0, n === t ? 1 : 0); break;
          case opCodes.NEQ:     t = T(); n = N(); SET(2, -1); PUT(0, n !== t ? 1 : 0); break;
          case opCodes.GTH:     
            t = T(); n = N(); SET(2, -1); 
            PUT(0, n > t ? 1 : 0);
            break;
          case opCodes.LTH:     t = T(); n = N(); SET(2, -1); PUT(0, n < t ? 1 : 0); break;
          case opCodes.JMP:     
            t = T(); SET(1, -1);
            pc = u16(pc + s8(t));
            break;
          case opCodes.JCN:     
            t = T(); n = N(); 
            SET(2, -2);

            if (n) {
              pc = u16(pc + s8(t)); 
            }
            
            break;
          case opCodes.JSR:     t = T(); SET(1, -1); PUSH2(u.rst, pc); pc = u16(pc + s8(t)); break;
          case opCodes.STH:     t = T(); SET(1, -1); PUSH((ins & 0x40 ? u.wst : u.rst), t); break;
          case opCodes.LDZ:     t = T(); SET(1, 0); PUT(0, u.ram[t]); break;
          case opCodes.STZ:     t = T(); n = N(); SET(2,-2); u.ram[t] = (n); break;
          case opCodes.LDR:     t = T(); SET(1, 0); PUT(0, u.ram[u16(pc + s8(t))]); break;
          case opCodes.STR:     t = T(); n = N(); SET(2,-2); u.ram[u16(pc + s8(t))] = (n); break;
          case opCodes.LDA:     t = T2(); SET(2,-1); PUT(0, u.ram[t]); break;
          case opCodes.STA:     t = T2(); n = L(); SET(3,-3); u.ram[t] = (n); break;
          case opCodes.DEI:     t = T(); SET(1, 0); DEI(0, t); break;
          case opCodes.DEO:     t = T(); n = N(); SET(2,-2); DEO(t, n); break;
          case opCodes.ADD:     
            t = T(); n = N(); 
            SET(2, -1);
            PUT(0, u16(n + t));
            break;
          case opCodes.SUB:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n - t)); break;
          case opCodes.MUL:     
            t = T(); n = N(); 
            const v = s.dat.slice(0, s.ptr)

            SET(2, -1); 
            PUT(0, u16(n * t)); 
            break;
          case opCodes.DIV:     t = T(); n = N(); SET(2,-1); if(!t) HALT(3); PUT(0, u16(n / t)); break;
          case opCodes.AND:     
            t = T(); n = N(); 
            SET(2,-1); 
            PUT(0, u16(n & t)); 
            break;
          case opCodes.ORA:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n | t)); break;
          case opCodes.EOR:     t = T(); n = N(); SET(2,-1); PUT(0, u16(n ^ t)); break;
          case opCodes.SFT:    
          t = T(); n = N(); 
          SET(2, -1);
          PUT(0, u16(n >> u16(t & 0xf) << u16(t >> 4)));

          break;
        }
      } else {
        switch (base(ins)) {
          case opCodes.LIT:
            PUSH(s, u.ram[pc]); pc = u16(pc + 1);
            PUSH(s, u.ram[pc]); pc = u16(pc + 1);
            break;
          case opCodes.INC:     t = T2(); SET(2, 0); 
            PUT2(0, u16(t + 1)); 
            break;
          case opCodes.POP:     SET(2, -2); break;
          case opCodes.NIP:     t = T2(); SET(4, -2); PUT2(0, t); break;
          case opCodes.SWP:     t = T2(); n = N2(); SET(4, 0); PUT2(0, n); PUT2(2, t); break;
          case opCodes.ROT:     t = T2(); n = N2(); l = L2(); SET(6, 0); PUT2(0, l); PUT2(2, t); PUT2(4, n); break;
          case opCodes.DUP:    
            t = T2(); SET(2, 2); 
            PUT2(0, t); 
            PUT2(2, t); 
            break;   
          case opCodes.OVR:     t = T2(); n = N2(); SET(4, 2); PUT2(0, n); PUT2(2, t); PUT2(4, n); break;
          case opCodes.EQU:     t = T2(); n = N2(); SET(4, -3); PUT(0, n === t ? 1 : 0); break;
          case opCodes.NEQ:     t = T2(); n = N2(); SET(4, -3); PUT(0, n !== t ? 1 : 0); break;
          case opCodes.GTH:     t = T2(); n = N2(); SET(4, -3); PUT(0, n > t ? 1 : 0); break;
          case opCodes.LTH:     
            t = T2(); n = N2();
            SET(4, -3); 
            PUT(0, n < t ? 1 : 0); 
            break;
          case opCodes.JMP:     
            t = T2(); 
            SET(2, -2);
            pc = t;
            break;
          case opCodes.JCN:     
            t = T2(); n = L();
            SET(3, -3); 
            if(n) { pc = t }
            break;
          case opCodes.JSR:     t = T2(); SET(2, -2); PUSH2(u.rst, pc); pc = t; break;
          case opCodes.STH:     t = T2(); SET(2, -2); PUSH2((ins & 0x40 ? u.wst : u.rst), t); break;
          case opCodes.LDZ:     t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(t))); break;
          case opCodes.STZ:     t = T(); n = H2(); SET(3,-3); POKE2(u.ram, t, n); break;
          case opCodes.LDR:     t = T(); SET(1, 1); PUT2(0, PEEK2(u.ram.slice(u16(pc + s8(t))))); break;
          case opCodes.STR:     t = T(); n = H2(); SET(3,-3); POKE2(u.ram, (u16(pc + s8(t))), n); break;
          case opCodes.LDA:     t = T2(); SET(2, 0); PUT2(0, PEEK2(u.ram.slice(t))); break;
          case opCodes.STA:     t = T2(); n = N2(); SET(4,-4); POKE2(u.ram, (t), n); break;
          case opCodes.DEI:     t = T(); SET(1, 1); DEI(1, t); DEI(0, t + 1); break;
          case opCodes.DEO:     t = T(); n = N(); l = L(); SET(3,-3); DEO(t, l); DEO(t + 1, n); break;
          case opCodes.ADD:    
            t = T2(); n = N2();
            SET(4,-2); 
            PUT2(0, u16(n + t));
            break;
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

export function uxn_boot(u: Uxn, ram: number[])
{
	u.ram = ram;

	return 1;
}