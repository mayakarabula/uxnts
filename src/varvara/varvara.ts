import { Uxn } from "../uxn/uxn";
import { Console } from "./console";
import { System } from "./system";

export class Varvara {
  uxn: Uxn;
  system: System;
  console: Console;

  constructor() {
    this.system = new System();
    this.console = new Console();
    this.uxn = new Uxn(this);
  }

  run(pc: number) {
    this.system.system_load(this.uxn);
    this.uxn.eval(pc);
  }
}
