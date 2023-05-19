import { Uxn } from "../uxn/uxn";
import { PAGE_PROGRAM } from "../uxn/uxncli";

export function system_load(u: Uxn): number {
  //   const f = (window as any).rom;

  //   if (!f) {
  //     return 0;
  //   }

  const f = [
    160, 0, 0, 161, 184, 38, 96, 0, 14, 160, 10, 24, 23, 184, 171, 32, 255, 243,
    160, 1, 15, 23, 0, 4, 96, 0, 0, 6, 128, 4, 31, 96, 0, 0, 128, 15, 28, 6,
    128, 9, 10, 128, 39, 26, 24, 128, 48, 24, 128, 24, 23, 108,
  ];

  u.ram = new Array(0x100000).fill(0);

  for (let i = 0; i < f.length; i++) {
    u.ram[PAGE_PROGRAM + i] = f[i] || 0;
  }

  return 1;
}
