import { Uxn } from "../uxn/uxn";
import { System } from "./system";

export class Varvara {
    uxn: Uxn;
    system: System;

    constructor () {
        this.uxn = new Uxn();
        this.system = new System();
    }

    run (pc: number) {
        this.system.system_load(this.uxn)
        this.uxn.eval(pc)
    }
}
