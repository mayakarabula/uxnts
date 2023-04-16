export class Uint8 extends Number {
    _value: number;

    constructor(value: number) {
        if (value < 0 || value > 255 || !Number.isInteger(value)) {
            throw new RangeError("Value must be an integer between 0 and 255.");
        }
        super(value);
        this._value = value;
    }

    get val () {
        return this._value
    }

    set val (value: number) {
        if (value < 0 || value > 255 || !Number.isInteger(value)) {
            throw new RangeError("Value must be an integer between 0 and 255.");
        }

        this._value = value;
    }
}

export class Uint16 extends Number {
    _value: number;

    constructor(value: number) {
      if (value < 0 || value > 65535 || !Number.isInteger(value)) {
        throw new RangeError("Value must be an integer between 0 and 65535.");
      }

      super(value);
      this._value = value;
    }

    get val () {
        return this._value
    }

    set val (value: number) {
       if (value < 0 || value > 65535 || !Number.isInteger(value)) {
        throw new RangeError("Value must be an integer between 0 and 65535.");
      }
 
       this._value = value
    }
}

export const u8FromNumbers = (numbers: number[]) => {
    return numbers.map(number => (new Uint8(number)))
}

export const u16FromNumbers = (numbers: number[]) => {
    return numbers.map(number => (new Uint16(number)))
}
