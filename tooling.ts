export class Uint8 extends Number {
    constructor(value: number) {
        if (value < 0 || value > 255 || !Number.isInteger(value)) {
        throw new RangeError("Value must be an integer between 0 and 255.");
        }
        super(value);
    }

    get val () {
        return this.valueOf()
    }
}

export class Uint16 extends Number {
    constructor(value: number) {
      if (value < 0 || value > 65535 || !Number.isInteger(value)) {
        throw new RangeError("Value must be an integer between 0 and 65535.");
      }
      super(value);
    }

    get val () {
        return this.valueOf()
    }

    set val (value: number) {
        // this = new Uint16(value)
    }
}

export const u8FromNumbers = (numbers: number[]) => {
    return numbers.map(number => (new Uint8(number)))
}

export const u16FromNumbers = (numbers: number[]) => {
    return numbers.map(number => (new Uint16(number)))
}
