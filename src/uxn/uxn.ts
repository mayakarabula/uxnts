import { base, keepFlag, opCodes, returnFlag, shortFlag } from "./op";

export const u16 = (a: number) => {
  const u = new Uint16Array(1);
  u[0] = a;
  return u[0];
};

export const u8 = (a: number) => {
  const u = new Uint8Array(1);
  u[0] = a;
  return u[0];
};

export const s8 = (a: number) => {
  const s = new Int8Array(1);
  s[0] = a;
  return s[0];
};

class Stack {
  memory: number[];
  keep: boolean;
  short: boolean;
  popped: number;

  constructor() {
    this.memory = [];
    this.keep = false;
    this.short = false;
    this.popped = 0;
  }

  print() {
    console.log(
      "( " +
        this.memory
          .map((item) => item.toString(16).padStart(2, "0"))
          .join(" ") +
        " )"
    );
  }

  pop() {
    return this.short ? this._popShort() : this._pop();
  }

  push(value: number) {
    this.short ? this._pushShort(value) : this._push(value);
  }

  _pop(): number {
    const a = this._popShort();
    const b = this._popShort();
    return u16((b << 8) + a);
  }

  _popShort() {
    if (this.keep) {
      const value = this.memory[this.memory.length - 1 - this.popped];
      this.popped++;
      return value || 0;
    } else {
      const value = this.memory.pop();
      return value || 0;
    }
  }

  _push(value: number) {
    this._pushShort(u16(value >> 8));
    this._pushShort(u8(value));
  }

  _pushShort(value: number) {
    this.memory.push(value);
  }
}

export class Uxn {
  ram: number[];

  constructor() {
    this.ram = new Array(0x100000).fill(0);
  }

  peek = (pc: number) => {
    return u16((this.ram[pc - 2] << 8) + this.ram[pc - 1]);
  };

  out = (port: number, value: number) => {
    const dev = port & 0xf0;
    port &= 0xf;

    switch (dev) {
      case 0x10:
        process.stdout.write(String.fromCharCode(value));
    }
  };

  eval(pc: number) {
    const workingStack = new Stack();
    const returnStack = new Stack();
    let currentStack: Stack;

    for (;;) {
      let instruction = this.ram[pc++];
      currentStack = returnFlag(instruction) ? returnStack : workingStack;
      currentStack.keep = keepFlag(instruction);
      currentStack.short = shortFlag(instruction);
      currentStack.popped = 0;

      let temp: number, temp2: number, temp3: number;

      switch (base(instruction)) {
        case opCodes.BRK:
          return 1;
        case opCodes.LIT:
          currentStack._pushShort(this.ram[pc]);
          pc += 1;
          if (!currentStack.short) {
            currentStack._pushShort(this.ram[pc]);
            pc += 1;
          }
          break;
        case opCodes.JCI:
          pc += 2;
          temp = currentStack.pop();
          if (temp !== 0) {
            pc += this.peek(pc);
            pc = u16(pc);
          }
          break;
        case opCodes.JMI:
          pc += this.peek(pc);
          break;
        case opCodes.JSI:
          pc += 2;
          returnStack.push(pc);
          pc += this.peek(pc);
          break;
        case opCodes.INC:
          currentStack.push(u16(currentStack.pop() + 1));
          break;
        case opCodes.POP:
          currentStack.pop();
          break;
        case opCodes.NIP:
          temp = currentStack.pop();
          currentStack.pop();
          currentStack.push(temp);
          break;
        case opCodes.SWP:
          (temp = currentStack.pop()), (temp2 = currentStack.pop());
          currentStack.push(temp), currentStack.push(temp2);
          break;
        case opCodes.ROT:
          (temp = currentStack.pop()),
            (temp2 = currentStack.pop()),
            (temp3 = currentStack.pop());
          currentStack.push(temp2),
            currentStack.push(temp),
            currentStack.push(temp3);
          break;
        case opCodes.DUP:
          temp = currentStack.pop();
          currentStack.push(temp);
          currentStack.push(temp);
          break;
        case opCodes.OVR:
          (temp = currentStack.pop()), (temp2 = currentStack.pop());
          currentStack.push(temp2);
          currentStack.push(temp);
          currentStack.push(temp2);
          break;
        case opCodes.EQU:
          currentStack._pushShort(
            currentStack.pop() === currentStack.pop() ? 1 : 0
          );
          break;
        case opCodes.NEQ:
          currentStack._pushShort(
            currentStack.pop() === currentStack.pop() ? 0 : 1
          );
          break;
        case opCodes.GTH:
          currentStack._pushShort(
            currentStack.pop() < currentStack.pop() ? 1 : 0
          );
          break;
        case opCodes.LTH:
          currentStack._pushShort(
            currentStack.pop() > currentStack.pop() ? 1 : 0
          );
          break;
        case opCodes.JMP:
          if (currentStack.short) {
            pc += s8(currentStack.pop());
          } else {
            pc = currentStack.pop();
          }
          break;
        case opCodes.JCN:
          if (currentStack.short) {
            temp = pc + s8(currentStack.pop());
          } else {
            temp = currentStack.pop();
          }
          if (currentStack.pop() !== 0) {
            pc = temp;
          }
          break;
        case opCodes.JSR:
          temp = currentStack.pop();
          returnStack.short = false;
          returnStack.push(temp);

          if (currentStack.short) {
            pc += s8(temp);
          } else {
            pc = temp;
          }
          break;
        case opCodes.STH:
          returnStack.short = currentStack.short;
          returnStack.push(currentStack.pop());
          break;
        case opCodes.LDZ:
          temp = currentStack.pop();
          currentStack.push(this.ram[temp]);

          if (!currentStack.short) {
            currentStack.push(this.ram[temp + 1]);
          }
          break;
        case opCodes.STZ:
          temp = currentStack.pop();
          if (!currentStack.short) {
            this.ram[temp + 1] = currentStack.pop();
          }
          this.ram[temp] = currentStack.pop();
          break;
        case opCodes.LDR:
          temp = s8(currentStack.pop());
          currentStack.push(this.ram[pc + temp]);
          if (!currentStack.short) {
            currentStack.push(this.ram[pc + temp + 1]);
          }
          break;
        case opCodes.STR:
          temp = s8(currentStack.pop());
          if (!currentStack.short) {
            this.ram[pc + temp + 1] = currentStack.pop();
          }
          this.ram[pc + temp] = currentStack.pop();
          break;
        case opCodes.LDA:
          temp = currentStack._pop();

          currentStack.push(this.ram[temp]);
          
          if (!currentStack.short) {
            currentStack.push(this.ram[temp + 1]);
          }
          break;
        case opCodes.STA:
          temp = currentStack._popShort();
          if (!currentStack.short) {
            this.ram[temp + 1] = currentStack.pop();
          }
          this.ram[temp] = currentStack.pop();
          break;
        case opCodes.DEI:
          temp = currentStack.pop();
          if (currentStack.short) {
          } else {
          }
          break;
        case opCodes.DEO:
          temp = currentStack._popShort();
          temp2 = currentStack.pop();
          if (currentStack.short) {
            this.out(temp, temp2);
          } else {
          }
          break;
        case opCodes.SFT:
          temp = currentStack.pop();
          temp2 = (temp & 0xf0) >> 4;
          temp3 = temp & 0x0f;

          currentStack.push((currentStack.pop() >> temp3) << temp2);
          break;
        case opCodes.ADD:
          currentStack.push(u16(currentStack.pop() + currentStack.pop()));
          break;
        case opCodes.MUL:
          currentStack.push(u16(currentStack.pop() * currentStack.pop()));
          break;
        case opCodes.SUB:
          (temp = currentStack.pop()), (temp2 = currentStack.pop());
          currentStack.push(u16(temp2 - temp));
          break;
        case opCodes.DIV:
          (temp = currentStack.pop()), (temp2 = currentStack.pop());
          currentStack.push(u16(temp2 / temp));
          break;
        case opCodes.AND:
          currentStack.push(currentStack.pop() & currentStack.pop());
          break;
        case opCodes.ORA:
          currentStack.push(currentStack.pop() | currentStack.pop());
          break;
        case opCodes.EOR:
          currentStack.push(currentStack.pop() ^ currentStack.pop());
          break;
        default:
          break;
      }
    }
  }
}
