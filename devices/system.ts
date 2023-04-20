import { PAGE_PROGRAM , Uxn} from '../uxn'
import { RAM_PAGES } from '../uxncli'
// import { readFileSync } from 'fs';

export function system_load(u: Uxn, filename: string): number {
  //const f = readFileSync(filename);
  const f = [128, 104, 128, 24, 23, 128, 101, 128, 24, 23, 128, 108, 128, 24, 23, 128, 108, 128, 24, 23, 128, 111, 128, 24, 23, 128, 10, 128, 24, 23];

  if (!f) {
    return 0;
  }

  u.ram = (new Array(2000).fill(0))

  for (let i = 0; i < f.length; i ++) {
    u.ram[PAGE_PROGRAM + i] = (f.at(i) || 0)
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
