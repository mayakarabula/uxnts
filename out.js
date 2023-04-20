define("uxn", ["require", "exports", "uxncli"], function (require, exports, uxncli_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uxn_boot = exports.uxn_eval = exports.Uxn = exports.Stack = exports.PEEK2 = exports.POKE2 = exports.PAGE_PROGRAM = void 0;
    exports.PAGE_PROGRAM = 0x0100;
    function POKE2(d, v) {
        d[0] = (v >> 8);
        d[1] = (v);
    }
    exports.POKE2 = POKE2;
    function PEEK2(d) {
        return ((d[0] << 8) | d[1]);
    }
    exports.PEEK2 = PEEK2;
    class Stack {
        constructor() {
            this.dat = (new Array(255).fill(0));
            this.ptr = 0;
        }
    }
    exports.Stack = Stack;
    class Uxn {
        constructor(dei, deo) {
            this.ram = [];
            this.dev = (new Array(256));
            this.wst = new Stack();
            this.rst = new Stack();
            this.dei = dei;
            this.deo = deo;
        }
    }
    exports.Uxn = Uxn;
    ;
    function uxn_eval(u, pc) {
        let ins, m2, opc, k;
        let t, n, l, tmp;
        let s = new Stack();
        let z = new Stack();
        if (!pc || u.dev[0x0f])
            return 0;
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
        const N2 = () => (s.dat[s.ptr - 4] << 8) | s.dat[s.ptr - 3];
        const L2 = () => (s.dat[s.ptr - 6] << 8) | s.dat[s.ptr - 5];
        const HALT = (c) => uxn_halt(u, ins, c, (pc - 1));
        const SET = (mul, add) => {
            if (mul > s.ptr)
                HALT(1);
            tmp = (s.ptr + k * mul + add);
            if (tmp > 254)
                HALT(2);
            s.ptr = (tmp);
        };
        const PUT = (offset, value) => {
            s.dat[s.ptr - 1 - offset] = (value);
        };
        const PUT2 = (offset, value) => {
            const tmp = value;
            s.dat[s.ptr - offset - 2] = (tmp >> 8);
            s.dat[s.ptr - offset - 1] = (tmp);
        };
        const PUSH = (x, value) => {
            z = x;
            if (z.ptr > 254)
                HALT(2);
            z.dat[z.ptr++] = (value);
        };
        const PUSH2 = (x, value) => {
            z = x;
            if (s.ptr > 253)
                HALT(2);
            tmp = value;
            z.dat[z.ptr] = (tmp >> 8);
            z.dat[z.ptr + 1] = (tmp);
            z.ptr += 2;
        };
        const DEO = (address, value) => {
            u.dev[address] = (value);
            if ((uxncli_1.deo_mask[address >> 4] >> (address & 0xf)) & 0x1)
                (0, uxncli_1.uxn_deo)(u, address);
        };
        const DEI = (address, value) => {
            PUT(address, ((uxncli_1.dei_mask[value >> 4] >> (value & 0xf)) & 0x1) ? (0, uxncli_1.uxn_dei)(u, value) : u.dev[value]);
        };
        for (;;) {
            ins = (u.ram[pc++] & 0xff);
            k = (ins & 0x80);
            s = ins & 0x40 ? u.rst : u.wst;
            opc = (!(ins & 0x1f) ? 0 - (ins >> 5) : ins & 0x3f);
            switch (opc) {
                /* IMM */
                case -0x00: /* BRK   */ return 1;
                case -0x01: /* JCI   */
                    pc += (s.dat[s.ptr--] * PEEK2(u.ram.slice(pc)) + 2);
                    break;
                case -0x02: /* JMI   */
                    pc += (PEEK2(u.ram.slice(pc)) + 2);
                    break;
                case -0x03: /* JSI   */
                    PUSH2(u.rst, pc + 2);
                    pc += (pc + PEEK2(u.ram.slice(pc)) + 2);
                    break;
                case -0x04: /* LIT   */
                    PUSH(s, u.ram[pc++]);
                    break;
                case -0x05: /* LIT2  */
                    PUSH2(s, PEEK2(u.ram.slice(pc)));
                    pc += 2;
                    break;
                case -0x06: /* LITr  */
                    PUSH(s, u.ram[pc++]);
                    break;
                case -0x07: /* LIT2r */
                    PUSH2(s, PEEK2(u.ram.slice(pc)));
                    pc += 2;
                    break;
                /* ALU */
                case 0x01: /* INC  */
                    t = T();
                    SET(1, 0);
                    PUT(0, t + 1);
                    break;
                case 0x21:
                    t = T2();
                    SET(2, 0);
                    PUT2(0, t + 1);
                    break;
                case 0x02: /* POP  */
                    SET(1, -1);
                    break;
                case 0x22:
                    SET(2, -2);
                    break;
                case 0x03: /* NIP  */
                    t = T();
                    SET(2, -1);
                    PUT(0, t);
                    break;
                case 0x23:
                    t = T2();
                    SET(4, -2);
                    PUT2(0, t);
                    break;
                case 0x04: /* SWP  */
                    t = T();
                    n = N();
                    SET(2, 0);
                    PUT(0, n);
                    PUT(1, t);
                    break;
                case 0x24:
                    t = T2();
                    n = N2();
                    SET(4, 0);
                    PUT2(0, n);
                    PUT2(2, t);
                    break;
                case 0x05: /* ROT  */
                    t = T();
                    n = N();
                    l = L();
                    SET(3, 0);
                    PUT(0, l);
                    PUT(1, t);
                    PUT(2, n);
                    break;
                case 0x25:
                    t = T2();
                    n = N2();
                    l = L2();
                    SET(6, 0);
                    PUT2(0, l);
                    PUT2(2, t);
                    PUT2(4, n);
                    break;
                case 0x06: /* DUP  */
                    t = T();
                    SET(1, 1);
                    PUT(0, t);
                    PUT(1, t);
                    break;
                case 0x26:
                    t = T2();
                    SET(2, 2);
                    PUT2(0, t);
                    PUT2(2, t);
                    break;
                case 0x07: /* OVR  */
                    t = T();
                    n = N();
                    SET(2, 1);
                    PUT(0, n);
                    PUT(1, t);
                    PUT(2, n);
                    break;
                case 0x27:
                    t = T2();
                    n = N2();
                    SET(4, 2);
                    PUT2(0, n);
                    PUT2(2, t);
                    PUT2(4, n);
                    break;
                case 0x08: /* EQU  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n == t ? 1 : 0);
                    break;
                case 0x28:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n == t ? 1 : 0);
                    break;
                case 0x09: /* NEQ  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n != t ? 0 : 1);
                    break;
                case 0x29:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n != t ? 1 : 0);
                    break;
                case 0x0a: /* GTH  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n > t ? 1 : 0);
                    break;
                case 0x2a:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n > t ? 1 : 0);
                    break;
                case 0x0b: /* LTH  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n < t ? 1 : 0);
                    break;
                case 0x2b:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n < t ? 1 : 0);
                    break;
                case 0x0c: /* JMP  */
                    t = T();
                    SET(1, -1);
                    pc += t;
                    break;
                case 0x2c:
                    t = T2();
                    SET(2, -2);
                    pc = t;
                    break;
                case 0x0d: /* JCN  */
                    t = T();
                    n = N();
                    SET(2, -2);
                    pc += n * t;
                    break;
                case 0x2d:
                    t = T2();
                    n = L();
                    SET(3, -3);
                    if (n)
                        pc = t;
                    break;
                case 0x0e: /* JSR  */
                    t = T();
                    SET(1, -1);
                    PUSH2(u.rst, pc);
                    pc += t;
                    break;
                case 0x2e:
                    t = T2();
                    SET(2, -2);
                    PUSH2(u.rst, pc);
                    pc = t;
                    break;
                case 0x0f: /* STH  */
                    t = T();
                    SET(1, -1);
                    PUSH((ins & 0x40 ? u.wst : u.rst), t);
                    break;
                case 0x2f:
                    t = T2();
                    SET(2, -2);
                    PUSH2((ins & 0x40 ? u.wst : u.rst), t);
                    break;
                case 0x10: /* LDZ  */
                    t = T();
                    SET(1, 0);
                    PUT(0, u.ram[t]);
                    break;
                case 0x30:
                    t = T();
                    SET(1, 1);
                    PUT2(0, PEEK2(u.ram.slice(t)));
                    break;
                case 0x11: /* STZ  */
                    t = T();
                    n = N();
                    SET(2, -2);
                    u.ram[t] = (n);
                    break;
                case 0x31:
                    t = T();
                    n = H2();
                    SET(3, -3);
                    POKE2(u.ram.slice(t), n);
                    break;
                case 0x12: /* LDR  */
                    t = T();
                    SET(1, 0);
                    PUT(0, u.ram[pc + t]);
                    break;
                case 0x32:
                    t = T();
                    SET(1, 1);
                    PUT2(0, PEEK2(u.ram.slice(pc + t)));
                    break;
                case 0x13: /* STR  */
                    t = T();
                    n = N();
                    SET(2, -2);
                    u.ram[pc + t] = (n);
                    break;
                case 0x33:
                    t = T();
                    n = H2();
                    SET(3, -3);
                    POKE2(u.ram.slice(pc + t), n);
                    break;
                case 0x14: /* LDA  */
                    t = T2();
                    SET(2, -1);
                    PUT(0, u.ram[t]);
                    break;
                case 0x34:
                    t = T2();
                    SET(2, 0);
                    PUT2(0, PEEK2(u.ram.slice(t)));
                    break;
                case 0x15: /* STA  */
                    t = T2();
                    n = L();
                    SET(3, -3);
                    u.ram[t] = (n);
                    break;
                case 0x35:
                    t = T2();
                    n = N2();
                    SET(4, -4);
                    POKE2(u.ram.slice(t), n);
                    break;
                case 0x16: /* DEI  */
                    t = T();
                    SET(1, 0);
                    DEI(0, t);
                    break;
                case 0x36:
                    t = T();
                    SET(1, 1);
                    DEI(1, t);
                    DEI(0, t + 1);
                    break;
                case 0x17: /* DEO  */
                    t = T();
                    n = N();
                    SET(2, -2);
                    DEO(t, n);
                    break;
                case 0x37:
                    t = T();
                    n = N();
                    l = L();
                    SET(3, -3);
                    DEO(t, l);
                    DEO(t + 1, n);
                    break;
                case 0x18: /* ADD  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n + t);
                    break;
                case 0x38:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, n + t);
                    break;
                case 0x19: /* SUB  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n - t);
                    break;
                case 0x39:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, n - t);
                    break;
                case 0x1a: /* MUL  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n * t);
                    break;
                case 0x3a:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, n * t);
                    break;
                case 0x1b: /* DIV  */
                    t = T();
                    n = N();
                    SET(2, -1);
                    if (!t)
                        HALT(3);
                    PUT(0, n / t);
                    break;
                case 0x3b:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    if (!t)
                        HALT(3);
                    PUT2(0, n / t);
                    break;
                case 0x1c: /* AND */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n & t);
                    break;
                case 0x3c:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, n & t);
                    break;
                case 0x1d: /* ORA */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n | t);
                    break;
                case 0x3d:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, n | t);
                    break;
                case 0x1e: /* EOR */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n ^ t);
                    break;
                case 0x3e:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, n ^ t);
                    break;
                case 0x1f: /* SFT */
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n >> (t & 0xf) << (t >> 4));
                    break;
                case 0x3f:
                    t = T();
                    n = H2();
                    SET(3, -1);
                    PUT2(0, n >> (t & 0xf) << (t >> 4));
                    break;
            }
        }
    }
    exports.uxn_eval = uxn_eval;
    function uxn_boot(u, ram) {
        u.ram = ram;
        return 1;
    }
    exports.uxn_boot = uxn_boot;
});
define("devices/system", ["require", "exports", "uxn", "fs"], function (require, exports, uxn_1, fs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.system_load = void 0;
    function system_load(u, filename) {
        const f = (0, fs_1.readFileSync)(filename);
        if (!f) {
            return 0;
        }
        u.ram = (new Array(2000).fill(0));
        for (let i = 0; i < f.length; i++) {
            u.ram[uxn_1.PAGE_PROGRAM + i] = (f.at(i) || 0);
        }
        //   let data = new Uint8Array();
        //   let l = f.copy(data, PAGE_PROGRAM, 0, 0x10000 - PAGE_PROGRAM);
        //   console.log(f)
        //   let i = 0;
        //   while (l && ++i < RAM_PAGES) {
        //     l = f.copy(data, 0x10000 * i, 0, 0x10000);
        //   }
        return 1;
    }
    exports.system_load = system_load;
});
define("uxncli", ["require", "exports", "devices/system", "uxn"], function (require, exports, system_1, uxn_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.uxn_deo = exports.uxn_dei = exports.dei_mask = exports.deo_mask = exports.RAM_PAGES = void 0;
    exports.RAM_PAGES = 0x10;
    exports.deo_mask = ([0x6a08, 0x0300, 0xc028, 0x8000, 0x8000, 0x8000, 0x8000, 0x0000, 0x0000, 0x0000, 0xa260, 0xa260, 0x0000, 0x0000, 0x0000, 0x0000]);
    exports.dei_mask = ([0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x07ff, 0x0000, 0x0000, 0x0000]);
    function emu_error(msg, err) {
        console.log(`Error ${msg}: ${err}`);
        return 1;
    }
    // function console_input(u: Uxn, c: number): number {
    //   const d = u.dev[0x10];
    //   d[0x02] = new Uint8(c);
    //   return uxn_eval(u, PEEK2(u.dev.slice(0x10)));
    // }
    function console_deo(d, port) {
        switch (port) {
            case 0x8:
                process.stdout.write(String.fromCharCode(d[port]));
                return;
            case 0x9:
                console.error('error !!', d[port]);
                return;
        }
    }
    function uxn_dei(u, addr) {
        switch (addr & 0xf0) {
            //case 0xc0:
            // return datetime_dei(u, addr);
            default:
                return u.dev[addr];
        }
    }
    exports.uxn_dei = uxn_dei;
    function uxn_deo(u, addr) {
        const p = addr & 0x0f;
        const d = addr & 0xf0;
        switch (d) {
            case 0x00:
                // system_deo(u, u.dev[d], p);
                break;
            case 0x10:
                console_deo(u.dev.slice(d), p);
                break;
            case 0xa0:
                // file_deo(0, u.ram, u.dev[d], p);
                break;
            case 0xb0:
                // file_deo(1, u.ram, u.dev[d], p);
                break;
        }
    }
    exports.uxn_deo = uxn_deo;
    function main(argc, argv) {
        const u = new uxn_2.Uxn(uxn_dei, uxn_deo);
        let i;
        if (argc < 2) {
            return emu_error("Usage", "uxncli game.rom args");
        }
        if (!(0, uxn_2.uxn_boot)(u, (new Array(0x10000 * exports.RAM_PAGES).fill(0)))) {
            return emu_error("Boot", "Failed");
        }
        console.log(argv[2]);
        if (!(0, system_1.system_load)(u, argv[2])) {
            return emu_error("Load", "Failed");
        }
        if (!(0, uxn_2.uxn_eval)(u, (uxn_2.PAGE_PROGRAM))) {
            return u.dev[0x0f] & 0x7f;
        }
        //   for (i = 2; i < argc; i++) {
        //     const p = argv[i];
        //     for (let j = 0; j < p.length; j++) {
        //       console_input(u, p[j]);
        //     }
        //     console_input(u, '\n');
        //   }
        //   while (!u.dev[0x0f]) {
        //     const c = fgetc(stdin);
        //     if (c !== EOF) {
        //       console_input(u, c);
        //     }
        //   }
        return 0;
        // return u.dev[0x0f].val & 0x7f;
    }
    main(process.argv.length, process.argv);
});
