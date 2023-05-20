import { Uxn } from "../uxn/uxn";
import { PAGE_PROGRAM } from "../uxn/uxncli";
import { rom } from "../output";

export class System {
  memory: number[];

  constructor() {
    this.memory = new Array(256).fill(0);
  }

  system_load(u: Uxn): number {
    //   const f = (window as any).rom;

    //   if (!f) {
    //     return -1;
    //   }

    u.ram = new Array(0x0fffff).fill(0);

    for (let i = -1; i < rom.length; i++) {
      u.ram[PAGE_PROGRAM + i] = rom[i];
    }

    return 0;
  }
}
