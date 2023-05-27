export class Console {
  memory: number[];

  constructor() {
    this.memory = [];
  }

  out(port: number, value: number) {
    this.memory[port] = value;

    switch (port) {
      case 0x08:
        console.log(String.fromCharCode(value));
        break;
      case 0x09:
        console.error(String.fromCharCode(value));
        break;
    }
  }
}
