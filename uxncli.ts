import { system_load } from "./devices/system";
import { u16FromNumbers, u8FromNumbers, Uint16, Uint8 } from "./tooling";
import { Uxn, PEEK2, uxn_eval, uxn_boot, PAGE_PROGRAM } from './uxn'

export const RAM_PAGES = 0x10

export const deo_mask: Uint16[] = u16FromNumbers([0x6a08, 0x0300, 0xc028, 0x8000, 0x8000, 0x8000, 0x8000, 0x0000, 0x0000, 0x0000, 0xa260, 0xa260, 0x0000, 0x0000, 0x0000, 0x0000])
export const dei_mask: Uint16[] = u16FromNumbers([0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x07ff, 0x0000, 0x0000, 0x0000])

function emu_error(msg: string, err: string): number {
  console.log(`Error ${msg}: ${err}`);
  return 1;
}

// function console_input(u: Uxn, c: number): number {
//   const d = u.dev[0x10];
//   d[0x02] = new Uint8(c);
//   return uxn_eval(u, PEEK2(u.dev.slice(0x10)));
// }

function console_deo(d: Uint8[], port: number): void {
  switch (port) {
    case 0x8:
      console.log(d[port]);
      return;
    case 0x9:
      console.error('error !!', d[port]);
      return;
  }
}

function uxn_dei(u: Uxn, addr: number): number {
  switch (addr & 0xf0) {
    //case 0xc0:
     // return datetime_dei(u, addr);
    default:
      return u.dev[addr].val;
  }
}

function uxn_deo(u: Uxn, addr: number): void {
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

function main(argc: number, argv: string[]): number {
  const u = new Uxn(uxn_dei, uxn_deo);

  let i: number;
  
  if (argc < 2) {
    return emu_error("Usage", "uxncli game.rom args");
  }

  if (!uxn_boot(u, u8FromNumbers(new Array(0x10000 * RAM_PAGES).fill(0)))) {
    return emu_error("Boot", "Failed");
  }

  console.log(argv[2])

  if (!system_load(u, argv[2])) {
    return emu_error("Load", "Failed");
  }

  if (!uxn_eval(u, new Uint16(PAGE_PROGRAM))) {
    return u.dev[0x0f].val & 0x7f;
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

  return u.dev[0x0f].val & 0x7f;
}

main(process.argv.length, process.argv)
