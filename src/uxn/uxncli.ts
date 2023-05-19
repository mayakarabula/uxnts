import { system_load } from "../varvara/system";
import { uxn } from "./uxn";
export const PAGE_PROGRAM = 0x0100;

const main = () => {
  let pc = 0x0100;

  system_load(uxn);

  uxn.eval(pc);
};

main();
