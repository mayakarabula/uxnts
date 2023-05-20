import { Varvara } from "../varvara/varvara";

export const PAGE_PROGRAM = 0x0100;

const main = () => {
  let pc = 0x0100;

  const varvara = new Varvara();

  varvara.run(pc);
};

main();
