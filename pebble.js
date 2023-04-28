var output = '';
var error = '';
var out = function (c) {
    output += c;
    simply.text({ title: output, subtitle: '' });
};
var outError = function (c) {
    error += c;
    simply.text({ title: error, subtitle: '' });
};
// Short reports whether the opcode has the short flag set.
var shortFlag = function (b) { return ((b & 0x20) > 0) && ((b & 0x9f) > 0) ? false : true; };
// Return reports whether the opcode has the return flag set.
var returnFlag = function (b) { return (b & 0x40) > 0 && (b & 0x9f) > 0; };
// Keep reports whether the opcode has the keep flag set.
var keepFlag = function (b) { return ((b & 0x80) > 0 && (b & 0x1f) > 0) ? 1 : 0; };
// Base returns the opcode without any flags set.
var base = function (b) {
    if ((b & 0x1f) > 0)
        return b & 0x1f;
    if ((b & 0x9f) == 0)
        return b;
    if ((b & 0x9f) == 0x80)
        return opCodes.LIT;
    //uxn_halt("unreachable")
};
var opCodes;
(function (opCodes) {
    opCodes[opCodes["BRK"] = 0] = "BRK";
    opCodes[opCodes["INC"] = 1] = "INC";
    opCodes[opCodes["POP"] = 2] = "POP";
    opCodes[opCodes["NIP"] = 3] = "NIP";
    opCodes[opCodes["SWP"] = 4] = "SWP";
    opCodes[opCodes["ROT"] = 5] = "ROT";
    opCodes[opCodes["DUP"] = 6] = "DUP";
    opCodes[opCodes["OVR"] = 7] = "OVR";
    opCodes[opCodes["EQU"] = 8] = "EQU";
    opCodes[opCodes["NEQ"] = 9] = "NEQ";
    opCodes[opCodes["GTH"] = 10] = "GTH";
    opCodes[opCodes["LTH"] = 11] = "LTH";
    opCodes[opCodes["JMP"] = 12] = "JMP";
    opCodes[opCodes["JCN"] = 13] = "JCN";
    opCodes[opCodes["JSR"] = 14] = "JSR";
    opCodes[opCodes["STH"] = 15] = "STH";
    opCodes[opCodes["LDZ"] = 16] = "LDZ";
    opCodes[opCodes["STZ"] = 17] = "STZ";
    opCodes[opCodes["LDR"] = 18] = "LDR";
    opCodes[opCodes["STR"] = 19] = "STR";
    opCodes[opCodes["LDA"] = 20] = "LDA";
    opCodes[opCodes["STA"] = 21] = "STA";
    opCodes[opCodes["DEI"] = 22] = "DEI";
    opCodes[opCodes["DEO"] = 23] = "DEO";
    opCodes[opCodes["ADD"] = 24] = "ADD";
    opCodes[opCodes["SUB"] = 25] = "SUB";
    opCodes[opCodes["MUL"] = 26] = "MUL";
    opCodes[opCodes["DIV"] = 27] = "DIV";
    opCodes[opCodes["AND"] = 28] = "AND";
    opCodes[opCodes["ORA"] = 29] = "ORA";
    opCodes[opCodes["EOR"] = 30] = "EOR";
    opCodes[opCodes["SFT"] = 31] = "SFT";
    opCodes[opCodes["JCI"] = 32] = "JCI";
    opCodes[opCodes["INC2"] = 33] = "INC2";
    opCodes[opCodes["POP2"] = 34] = "POP2";
    opCodes[opCodes["NIP2"] = 35] = "NIP2";
    opCodes[opCodes["SWP2"] = 36] = "SWP2";
    opCodes[opCodes["ROT2"] = 37] = "ROT2";
    opCodes[opCodes["DUP2"] = 38] = "DUP2";
    opCodes[opCodes["OVR2"] = 39] = "OVR2";
    opCodes[opCodes["EQU2"] = 40] = "EQU2";
    opCodes[opCodes["NEQ2"] = 41] = "NEQ2";
    opCodes[opCodes["GTH2"] = 42] = "GTH2";
    opCodes[opCodes["LTH2"] = 43] = "LTH2";
    opCodes[opCodes["JMP2"] = 44] = "JMP2";
    opCodes[opCodes["JCN2"] = 45] = "JCN2";
    opCodes[opCodes["JSR2"] = 46] = "JSR2";
    opCodes[opCodes["STH2"] = 47] = "STH2";
    opCodes[opCodes["LDZ2"] = 48] = "LDZ2";
    opCodes[opCodes["STZ2"] = 49] = "STZ2";
    opCodes[opCodes["LDR2"] = 50] = "LDR2";
    opCodes[opCodes["STR2"] = 51] = "STR2";
    opCodes[opCodes["LDA2"] = 52] = "LDA2";
    opCodes[opCodes["STA2"] = 53] = "STA2";
    opCodes[opCodes["DEI2"] = 54] = "DEI2";
    opCodes[opCodes["DEO2"] = 55] = "DEO2";
    opCodes[opCodes["ADD2"] = 56] = "ADD2";
    opCodes[opCodes["SUB2"] = 57] = "SUB2";
    opCodes[opCodes["MUL2"] = 58] = "MUL2";
    opCodes[opCodes["DIV2"] = 59] = "DIV2";
    opCodes[opCodes["AND2"] = 60] = "AND2";
    opCodes[opCodes["ORA2"] = 61] = "ORA2";
    opCodes[opCodes["EOR2"] = 62] = "EOR2";
    opCodes[opCodes["SFT2"] = 63] = "SFT2";
    opCodes[opCodes["JMI"] = 64] = "JMI";
    opCodes[opCodes["INCr"] = 65] = "INCr";
    opCodes[opCodes["POPr"] = 66] = "POPr";
    opCodes[opCodes["NIPr"] = 67] = "NIPr";
    opCodes[opCodes["SWPr"] = 68] = "SWPr";
    opCodes[opCodes["ROTr"] = 69] = "ROTr";
    opCodes[opCodes["DUPr"] = 70] = "DUPr";
    opCodes[opCodes["OVRr"] = 71] = "OVRr";
    opCodes[opCodes["EQUr"] = 72] = "EQUr";
    opCodes[opCodes["NEQr"] = 73] = "NEQr";
    opCodes[opCodes["GTHr"] = 74] = "GTHr";
    opCodes[opCodes["LTHr"] = 75] = "LTHr";
    opCodes[opCodes["JMPr"] = 76] = "JMPr";
    opCodes[opCodes["JCNr"] = 77] = "JCNr";
    opCodes[opCodes["JSRr"] = 78] = "JSRr";
    opCodes[opCodes["STHr"] = 79] = "STHr";
    opCodes[opCodes["LDZr"] = 80] = "LDZr";
    opCodes[opCodes["STZr"] = 81] = "STZr";
    opCodes[opCodes["LDRr"] = 82] = "LDRr";
    opCodes[opCodes["STRr"] = 83] = "STRr";
    opCodes[opCodes["LDAr"] = 84] = "LDAr";
    opCodes[opCodes["STAr"] = 85] = "STAr";
    opCodes[opCodes["DEIr"] = 86] = "DEIr";
    opCodes[opCodes["DEOr"] = 87] = "DEOr";
    opCodes[opCodes["ADDr"] = 88] = "ADDr";
    opCodes[opCodes["SUBr"] = 89] = "SUBr";
    opCodes[opCodes["MULr"] = 90] = "MULr";
    opCodes[opCodes["DIVr"] = 91] = "DIVr";
    opCodes[opCodes["ANDr"] = 92] = "ANDr";
    opCodes[opCodes["ORAr"] = 93] = "ORAr";
    opCodes[opCodes["EORr"] = 94] = "EORr";
    opCodes[opCodes["SFTr"] = 95] = "SFTr";
    opCodes[opCodes["JSI"] = 96] = "JSI";
    opCodes[opCodes["INC2r"] = 97] = "INC2r";
    opCodes[opCodes["POP2r"] = 98] = "POP2r";
    opCodes[opCodes["NIP2r"] = 99] = "NIP2r";
    opCodes[opCodes["SWP2r"] = 100] = "SWP2r";
    opCodes[opCodes["ROT2r"] = 101] = "ROT2r";
    opCodes[opCodes["DUP2r"] = 102] = "DUP2r";
    opCodes[opCodes["OVR2r"] = 103] = "OVR2r";
    opCodes[opCodes["EQU2r"] = 104] = "EQU2r";
    opCodes[opCodes["NEQ2r"] = 105] = "NEQ2r";
    opCodes[opCodes["GTH2r"] = 106] = "GTH2r";
    opCodes[opCodes["LTH2r"] = 107] = "LTH2r";
    opCodes[opCodes["JMP2r"] = 108] = "JMP2r";
    opCodes[opCodes["JCN2r"] = 109] = "JCN2r";
    opCodes[opCodes["JSR2r"] = 110] = "JSR2r";
    opCodes[opCodes["STH2r"] = 111] = "STH2r";
    opCodes[opCodes["LDZ2r"] = 112] = "LDZ2r";
    opCodes[opCodes["STZ2r"] = 113] = "STZ2r";
    opCodes[opCodes["LDR2r"] = 114] = "LDR2r";
    opCodes[opCodes["STR2r"] = 115] = "STR2r";
    opCodes[opCodes["LDA2r"] = 116] = "LDA2r";
    opCodes[opCodes["STA2r"] = 117] = "STA2r";
    opCodes[opCodes["DEI2r"] = 118] = "DEI2r";
    opCodes[opCodes["DEO2r"] = 119] = "DEO2r";
    opCodes[opCodes["ADD2r"] = 120] = "ADD2r";
    opCodes[opCodes["SUB2r"] = 121] = "SUB2r";
    opCodes[opCodes["MUL2r"] = 122] = "MUL2r";
    opCodes[opCodes["DIV2r"] = 123] = "DIV2r";
    opCodes[opCodes["AND2r"] = 124] = "AND2r";
    opCodes[opCodes["ORA2r"] = 125] = "ORA2r";
    opCodes[opCodes["EOR2r"] = 126] = "EOR2r";
    opCodes[opCodes["SFT2r"] = 127] = "SFT2r";
    opCodes[opCodes["LIT"] = 128] = "LIT";
    opCodes[opCodes["INCk"] = 129] = "INCk";
    opCodes[opCodes["POPk"] = 130] = "POPk";
    opCodes[opCodes["NIPk"] = 131] = "NIPk";
    opCodes[opCodes["SWPk"] = 132] = "SWPk";
    opCodes[opCodes["ROTk"] = 133] = "ROTk";
    opCodes[opCodes["DUPk"] = 134] = "DUPk";
    opCodes[opCodes["OVRk"] = 135] = "OVRk";
    opCodes[opCodes["EQUk"] = 136] = "EQUk";
    opCodes[opCodes["NEQk"] = 137] = "NEQk";
    opCodes[opCodes["GTHk"] = 138] = "GTHk";
    opCodes[opCodes["LTHk"] = 139] = "LTHk";
    opCodes[opCodes["JMPk"] = 140] = "JMPk";
    opCodes[opCodes["JCNk"] = 141] = "JCNk";
    opCodes[opCodes["JSRk"] = 142] = "JSRk";
    opCodes[opCodes["STHk"] = 143] = "STHk";
    opCodes[opCodes["LDZk"] = 144] = "LDZk";
    opCodes[opCodes["STZk"] = 145] = "STZk";
    opCodes[opCodes["LDRk"] = 146] = "LDRk";
    opCodes[opCodes["STRk"] = 147] = "STRk";
    opCodes[opCodes["LDAk"] = 148] = "LDAk";
    opCodes[opCodes["STAk"] = 149] = "STAk";
    opCodes[opCodes["DEIk"] = 150] = "DEIk";
    opCodes[opCodes["DEOk"] = 151] = "DEOk";
    opCodes[opCodes["ADDk"] = 152] = "ADDk";
    opCodes[opCodes["SUBk"] = 153] = "SUBk";
    opCodes[opCodes["MULk"] = 154] = "MULk";
    opCodes[opCodes["DIVk"] = 155] = "DIVk";
    opCodes[opCodes["ANDk"] = 156] = "ANDk";
    opCodes[opCodes["ORAk"] = 157] = "ORAk";
    opCodes[opCodes["EORk"] = 158] = "EORk";
    opCodes[opCodes["SFTk"] = 159] = "SFTk";
    opCodes[opCodes["LIT2"] = 160] = "LIT2";
    opCodes[opCodes["INC2k"] = 161] = "INC2k";
    opCodes[opCodes["POP2k"] = 162] = "POP2k";
    opCodes[opCodes["NIP2k"] = 163] = "NIP2k";
    opCodes[opCodes["SWP2k"] = 164] = "SWP2k";
    opCodes[opCodes["ROT2k"] = 165] = "ROT2k";
    opCodes[opCodes["DUP2k"] = 166] = "DUP2k";
    opCodes[opCodes["OVR2k"] = 167] = "OVR2k";
    opCodes[opCodes["EQU2k"] = 168] = "EQU2k";
    opCodes[opCodes["NEQ2k"] = 169] = "NEQ2k";
    opCodes[opCodes["GTH2k"] = 170] = "GTH2k";
    opCodes[opCodes["LTH2k"] = 171] = "LTH2k";
    opCodes[opCodes["JMP2k"] = 172] = "JMP2k";
    opCodes[opCodes["JCN2k"] = 173] = "JCN2k";
    opCodes[opCodes["JSR2k"] = 174] = "JSR2k";
    opCodes[opCodes["STH2k"] = 175] = "STH2k";
    opCodes[opCodes["LDZ2k"] = 176] = "LDZ2k";
    opCodes[opCodes["STZ2k"] = 177] = "STZ2k";
    opCodes[opCodes["LDR2k"] = 178] = "LDR2k";
    opCodes[opCodes["STR2k"] = 179] = "STR2k";
    opCodes[opCodes["LDA2k"] = 180] = "LDA2k";
    opCodes[opCodes["STA2k"] = 181] = "STA2k";
    opCodes[opCodes["DEI2k"] = 182] = "DEI2k";
    opCodes[opCodes["DEO2k"] = 183] = "DEO2k";
    opCodes[opCodes["ADD2k"] = 184] = "ADD2k";
    opCodes[opCodes["SUB2k"] = 185] = "SUB2k";
    opCodes[opCodes["MUL2k"] = 186] = "MUL2k";
    opCodes[opCodes["DIV2k"] = 187] = "DIV2k";
    opCodes[opCodes["AND2k"] = 188] = "AND2k";
    opCodes[opCodes["ORA2k"] = 189] = "ORA2k";
    opCodes[opCodes["EOR2k"] = 190] = "EOR2k";
    opCodes[opCodes["SFT2k"] = 191] = "SFT2k";
    opCodes[opCodes["LITr"] = 192] = "LITr";
    opCodes[opCodes["INCkr"] = 193] = "INCkr";
    opCodes[opCodes["POPkr"] = 194] = "POPkr";
    opCodes[opCodes["NIPkr"] = 195] = "NIPkr";
    opCodes[opCodes["SWPkr"] = 196] = "SWPkr";
    opCodes[opCodes["ROTkr"] = 197] = "ROTkr";
    opCodes[opCodes["DUPkr"] = 198] = "DUPkr";
    opCodes[opCodes["OVRkr"] = 199] = "OVRkr";
    opCodes[opCodes["EQUkr"] = 200] = "EQUkr";
    opCodes[opCodes["NEQkr"] = 201] = "NEQkr";
    opCodes[opCodes["GTHkr"] = 202] = "GTHkr";
    opCodes[opCodes["LTHkr"] = 203] = "LTHkr";
    opCodes[opCodes["JMPkr"] = 204] = "JMPkr";
    opCodes[opCodes["JCNkr"] = 205] = "JCNkr";
    opCodes[opCodes["JSRkr"] = 206] = "JSRkr";
    opCodes[opCodes["STHkr"] = 207] = "STHkr";
    opCodes[opCodes["LDZkr"] = 208] = "LDZkr";
    opCodes[opCodes["STZkr"] = 209] = "STZkr";
    opCodes[opCodes["LDRkr"] = 210] = "LDRkr";
    opCodes[opCodes["STRkr"] = 211] = "STRkr";
    opCodes[opCodes["LDAkr"] = 212] = "LDAkr";
    opCodes[opCodes["STAkr"] = 213] = "STAkr";
    opCodes[opCodes["DEIkr"] = 214] = "DEIkr";
    opCodes[opCodes["DEOkr"] = 215] = "DEOkr";
    opCodes[opCodes["ADDkr"] = 216] = "ADDkr";
    opCodes[opCodes["SUBkr"] = 217] = "SUBkr";
    opCodes[opCodes["MULkr"] = 218] = "MULkr";
    opCodes[opCodes["DIVkr"] = 219] = "DIVkr";
    opCodes[opCodes["ANDkr"] = 220] = "ANDkr";
    opCodes[opCodes["ORAkr"] = 221] = "ORAkr";
    opCodes[opCodes["EORkr"] = 222] = "EORkr";
    opCodes[opCodes["SFTkr"] = 223] = "SFTkr";
    opCodes[opCodes["LIT2r"] = 224] = "LIT2r";
    opCodes[opCodes["INC2kr"] = 225] = "INC2kr";
    opCodes[opCodes["POP2kr"] = 226] = "POP2kr";
    opCodes[opCodes["NIP2kr"] = 227] = "NIP2kr";
    opCodes[opCodes["SWP2kr"] = 228] = "SWP2kr";
    opCodes[opCodes["ROT2kr"] = 229] = "ROT2kr";
    opCodes[opCodes["DUP2kr"] = 230] = "DUP2kr";
    opCodes[opCodes["OVR2kr"] = 231] = "OVR2kr";
    opCodes[opCodes["EQU2kr"] = 232] = "EQU2kr";
    opCodes[opCodes["NEQ2kr"] = 233] = "NEQ2kr";
    opCodes[opCodes["GTH2kr"] = 234] = "GTH2kr";
    opCodes[opCodes["LTH2kr"] = 235] = "LTH2kr";
    opCodes[opCodes["JMP2kr"] = 236] = "JMP2kr";
    opCodes[opCodes["JCN2kr"] = 237] = "JCN2kr";
    opCodes[opCodes["JSR2kr"] = 238] = "JSR2kr";
    opCodes[opCodes["STH2kr"] = 239] = "STH2kr";
    opCodes[opCodes["LDZ2kr"] = 240] = "LDZ2kr";
    opCodes[opCodes["STZ2kr"] = 241] = "STZ2kr";
    opCodes[opCodes["LDR2kr"] = 242] = "LDR2kr";
    opCodes[opCodes["STR2kr"] = 243] = "STR2kr";
    opCodes[opCodes["LDA2kr"] = 244] = "LDA2kr";
    opCodes[opCodes["STA2kr"] = 245] = "STA2kr";
    opCodes[opCodes["DEI2kr"] = 246] = "DEI2kr";
    opCodes[opCodes["DEO2kr"] = 247] = "DEO2kr";
    opCodes[opCodes["ADD2kr"] = 248] = "ADD2kr";
    opCodes[opCodes["SUB2kr"] = 249] = "SUB2kr";
    opCodes[opCodes["MUL2kr"] = 250] = "MUL2kr";
    opCodes[opCodes["DIV2kr"] = 251] = "DIV2kr";
    opCodes[opCodes["AND2kr"] = 252] = "AND2kr";
    opCodes[opCodes["ORA2kr"] = 253] = "ORA2kr";
    opCodes[opCodes["EOR2kr"] = 254] = "EOR2kr";
    opCodes[opCodes["SFT2kr"] = 255] = "SFT2kr";
})(opCodes || (opCodes = {}));
var WIDTH = 64 * 8;
var HEIGHT = 40 * 8;
var FIXED_SIZE = 0;
var Layer = /** @class */ (function () {
    function Layer(width, height) {
        this.changed = 0;
        this.pixels = new Array(width * height).fill(0);
    }
    return Layer;
}());
;
var UxnScreen = /** @class */ (function () {
    function UxnScreen() {
        this.palette = new Array(4).fill(0);
        this.pixels = [];
        this.mono = 0;
        this.width = WIDTH;
        this.height = HEIGHT;
        this.fg = new Layer(WIDTH, HEIGHT);
        this.bg = new Layer(WIDTH, HEIGHT);
        this.pixels = new Array(WIDTH * HEIGHT).fill(0);
    }
    return UxnScreen;
}());
;
var uxn_screen = new UxnScreen();
var blending = [
    [0, 0, 0, 0, 1, 0, 1, 1, 2, 2, 0, 2, 3, 3, 3, 0],
    [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
    [1, 2, 3, 1, 1, 2, 3, 1, 1, 2, 3, 1, 1, 2, 3, 1],
    [2, 3, 1, 2, 2, 3, 1, 2, 2, 3, 1, 2, 2, 3, 1, 2],
];
var palette_mono = [
    0x0f000000, 0x0fffffff,
];
function screen_write(p, layer, x, y, color) {
    if (x < p.width && y < p.height) {
        var i = x + y * p.width;
        if (color != layer.pixels[i]) {
            layer.pixels[i] = color;
            layer.changed = 1;
        }
    }
}
function screen_fill(p, layer, x1, y1, x2, y2, color) {
    var v, h;
    for (v = y1; v < y2; v++)
        for (h = x1; h < x2; h++)
            screen_write(p, layer, h, v, color);
    layer.changed = 1;
}
function screen_wipe(p, layer, x, y) {
    screen_fill(p, layer, x, y, x + 8, y + 8, 0);
}
function screen_blit(p, layer, x, y, sprite, color, flipx, flipy, twobpp) {
    var v, h, opaque = (color % 5) || !color;
    for (v = 0; v < 8; v++) {
        var c = sprite[v] | (twobpp ? (sprite[v + 8] << 8) : 0);
        for (h = 7; h >= 0; --h, c >>= 1) {
            var ch = (c & 1) | ((c >> 7) & 2);
            if (opaque || ch) {
                screen_write(p, layer, x + (flipx ? 7 - h : h), y + (flipy ? 7 - v : v), blending[ch][color]);
            }
        }
    }
}
function screen_palette(p, addr) {
    for (var i = 0, shift = 4; i < 4; ++i, shift ^= 4) {
        var r = (addr[0 + Math.floor(i / 2)] >> shift) & 0x0f;
        var g = (addr[2 + Math.floor(i / 2)] >> shift) & 0x0f;
        var b = (addr[4 + Math.floor(i / 2)] >> shift) & 0x0f;
        p.palette[i] = 0x000000 | r << 16 | g << 8 | b;
        p.palette[i] |= p.palette[i] << 4;
    }
    p.fg.changed = p.bg.changed = 1;
}
function screen_resize(p, width, height) {
    p.bg.pixels = new Array(width * height).fill(0);
    p.fg.pixels = new Array(width * height).fill(0);
    p.pixels = new Array(width * height).fill(0);
    p.width = width;
    p.height = height;
    screen_fill(p, p.bg, 0, 0, p.width, p.height, 0);
    screen_fill(p, p.fg, 0, 0, p.width, p.height, 0);
}
function screen_redraw(p) {
    var i, size = p.width * p.height, palette = new Array(4).fill(0);
    for (i = 0; i < 16; i++)
        palette[i] = p.palette[(i >> 2) ? (i >> 2) : (i & 3)];
    if (p.mono) {
        for (i = 0; i < size; i++)
            p.pixels[i] = palette_mono[(p.fg.pixels[i] ? p.fg.pixels[i] : p.bg.pixels[i]) & 0x1];
    }
    else {
        for (i = 0; i < size; i++)
            p.pixels[i] = palette[p.fg.pixels[i] << 2 | p.bg.pixels[i]];
    }
    p.fg.changed = p.bg.changed = 0;
}
function clamp(val, min, max) {
    return (val >= min) ? (val <= max) ? val : max : min;
}
function screen_mono(p) {
    p.mono = p.mono ? 0 : 1;
    screen_redraw(p);
}
function screen_dei(u, addr) {
    switch (addr) {
        case 0x22: return uxn_screen.width >> 8;
        case 0x23: return uxn_screen.width;
        case 0x24: return uxn_screen.height >> 8;
        case 0x25: return uxn_screen.height;
        default: return u.dev[addr];
    }
}
function screen_deo(ram, d, port) {
    switch (port) {
        case 0x3:
            if (!FIXED_SIZE)
                screen_resize(uxn_screen, clamp(PEEK2(d.slice(2)), 1, 1024), uxn_screen.height);
            break;
        case 0x5:
            if (!FIXED_SIZE)
                screen_resize(uxn_screen, uxn_screen.width, clamp(PEEK2(d.slice(4)), 1, 1024));
            break;
        case 0xe: {
            var x = PEEK2(d.slice(0x8)), y = PEEK2(d.slice(0xa));
            var layer = (d[0xf] & 0x40) ? uxn_screen.fg : uxn_screen.bg;
            if (d[0xe] & 0x80)
                screen_fill(uxn_screen, layer, (d[0xe] & 0x10) ? 0 : x, (d[0xe] & 0x20) ? 0 : y, (d[0xe] & 0x10) ? x : uxn_screen.width, (d[0xe] & 0x20) ? y : uxn_screen.height, d[0xe] & 0x3);
            else {
                screen_write(uxn_screen, layer, x, y, d[0xe] & 0x3);
                if (d[0x6] & 0x01)
                    POKE2(d, (0x8), x + 1); /* auto x+1 */
                if (d[0x6] & 0x02)
                    POKE2(d, (0xa), y + 1); /* auto y+1 */
            }
            break;
        }
        case 0xf: {
            var x = PEEK2(d.slice(0x8)), y = PEEK2(d.slice(0xa)), dx = void 0, dy = void 0, addr = PEEK2(d.slice(0xc));
            var i = void 0, n = void 0, twobpp = !!(d[0xf] & 0x80) ? 1 : 0;
            var layer = (d[0xf] & 0x40) ? uxn_screen.fg : uxn_screen.bg;
            n = d[0x6] >> 4;
            dx = (d[0x6] & 0x01) << 3;
            dy = (d[0x6] & 0x02) << 2;
            if (addr > 0x10000 - ((n + 1) << (3 + twobpp)))
                return;
            for (i = 0; i <= n; i++) {
                if (!(d[0xf] & 0xf))
                    screen_wipe(uxn_screen, layer, x + dy * i, y + dx * i);
                else {
                    screen_blit(uxn_screen, layer, x + dy * i, y + dx * i, ram.slice(addr), d[0xf] & 0xf, d[0xf] & 0x10, d[0xf] & 0x20, twobpp);
                    addr += (d[0x6] & 0x04) << (1 + twobpp);
                }
            }
            POKE2(d, (0xc), addr); /* auto addr+length */
            POKE2(d, (0x8), x + dx); /* auto x+8 */
            POKE2(d, (0xa), y + dy); /* auto y+8 */
            break;
        }
    }
}
var errors = [
    "underflow",
    "overflow",
    "division by zero"
];
function system_print(s, name) {
    out("<".concat(name, ">"));
    for (var i = 0; i < s.ptr; i++) {
        out(" ".concat(s.dat[i].toString(16).padStart(2, '0')));
    }
    if (s.ptr === 0) {
        out(' empty');
    }
    out('\n');
}
function system_cmd(ram, addr) {
    if (ram[addr] == 0x01) {
        var i = void 0, length_1 = PEEK2(ram.slice(addr + 1));
        var a_page = PEEK2(ram.slice(addr + 1 + 2));
        var a_addr = PEEK2(ram.slice(addr + 1 + 4));
        var b_page = PEEK2(ram.slice(addr + 1 + 6));
        var b_addr = PEEK2(ram.slice(addr + 1 + 8));
        var src = (a_page % RAM_PAGES) * 0x10000;
        var dst = (b_page % RAM_PAGES) * 0x10000;
        for (i = 0; i < length_1; i++)
            ram[dst + (b_addr + i)] = ram[src + (a_addr + i)];
    }
}
function system_inspect(u) {
    system_print(u.wst, "wst");
    system_print(u.rst, "rst");
}
function system_load(u) {
    var f = [128, 112, 128, 24, 23, 128, 101, 128, 24, 23, 128, 98, 128, 24, 23, 128, 98, 128, 24, 23, 128, 108, 128, 24, 23, 128, 101, 128, 24, 23, 128, 60, 128, 24, 23, 128, 51, 128, 24, 23, 128, 85, 128, 24, 23, 128, 88, 128, 24, 23, 128, 78, 128, 24, 23, 128, 10, 128, 24, 23];
    if (!f) {
        return 0;
    }
    u.ram = (new Array(0x100000).fill(0));
    for (var i = 0; i < f.length; i++) {
        u.ram[PAGE_PROGRAM + i] = (f.at(i) || 0);
    }
    return 1;
}
/* IO */
function system_deo(u, d, port) {
    switch (port) {
        case 0x3:
            system_cmd(u.ram, PEEK2(d.slice(2)));
            break;
        case 0xe:
            system_inspect(u);
            break;
    }
}
/* Error */
function uxn_halt(u, instr, err, addr) {
    var d = u.dev.slice(0x00);
    var handler = PEEK2(d);
    if (handler) {
        u.wst.ptr = 4;
        u.wst.dat[0] = addr >> 0x8;
        u.wst.dat[1] = addr & 0xff;
        u.wst.dat[2] = instr;
        u.wst.dat[3] = err;
        return uxn_eval(u, handler);
    }
    else {
        system_inspect(u);
        outError("".concat((instr & 0x40) ? "Return-stack" : "Working-stack", " ").concat(errors[err - 1], ", by ").concat(instr.toString(16), " at 0x").concat(addr.toString(16).padStart(4, '0'), ".\n"));
    }
    return 0;
}
var PAGE_PROGRAM = 0x0100;
var u16 = function (a) {
    var u = new Uint16Array(1);
    u[0] = a;
    return u[0];
};
var u8 = function (a) {
    var u = new Uint8Array(1);
    u[0] = a;
    return u[0];
};
function POKE2(d, addr, v) {
    d[addr] = u16(v >> 8);
    d[addr + 1] = u16(v);
}
function PEEK2(d) {
    return u16(u16(d[0] << 8) | u16(d[1]));
}
var Stack = /** @class */ (function () {
    function Stack() {
        this.dat = (new Array(255).fill(0));
        this.ptr = 0;
    }
    return Stack;
}());
var Uxn = /** @class */ (function () {
    function Uxn(dei, deo) {
        this.ram = [];
        this.dev = (new Array(256));
        this.wst = new Stack();
        this.rst = new Stack();
        this.dei = dei;
        this.deo = deo;
    }
    return Uxn;
}());
;
function uxn_eval(u, pc) {
    var ins, k; // u8
    var t, n, l, tmp; // u16
    var s = new Stack();
    var z = new Stack();
    if (!pc || u.dev[0x0f])
        return 0;
    /* Registers

    [ . ][ . ][ . ][ L ][ N ][ T ] <
    [ . ][ . ][ . ][   H2   ][ T ] <
    [   L2   ][   N2   ][   T2   ] <

    */
    var T = function () { return u16(s.dat[s.ptr - 1]); };
    var N = function () { return u16(s.dat[s.ptr - 2]); };
    var L = function () { return u16(s.dat[s.ptr - 3]); };
    var H2 = function () { return u16(u16(s.dat[s.ptr - 3] << 8) | u16(s.dat[s.ptr - 2])); };
    var T2 = function () { return u16(u16(s.dat[s.ptr - 2] << 8) | u16(s.dat[s.ptr - 1])); };
    var N2 = function () { return u16(u16(s.dat[s.ptr - 4] << 8) | u16(s.dat[s.ptr - 3])); };
    var L2 = function () { return u16(u16(s.dat[s.ptr - 6] << 8) | u16(s.dat[s.ptr - 5])); };
    var HALT = function (c) { return uxn_halt(u, ins, c, (pc - 1)); };
    var SET = function (mul, add) {
        if (mul > s.ptr)
            HALT(1);
        tmp = (u16(s.ptr + u16(u16(k * mul) + add)));
        if (tmp > 254)
            HALT(2);
        s.ptr = (tmp);
    };
    var PUT = function (offset, value) {
        s.dat[s.ptr - 1 - offset] = (value);
    };
    var PUT2 = function (offset, value) {
        var tmp = value;
        s.dat[s.ptr - offset - 2] = (tmp >> 8);
        s.dat[s.ptr - offset - 1] = (tmp);
    };
    var PUSH = function (x, value) {
        z = x;
        if (z.ptr > 254)
            HALT(2);
        z.dat[z.ptr] = u16(value);
        z.ptr = u16(z.ptr + 1);
    };
    var PUSH2 = function (x, value) {
        z = x;
        if (s.ptr > 253)
            HALT(2);
        tmp = value;
        z.dat[z.ptr] = u16(tmp >> 8);
        z.dat[z.ptr + 1] = u16(tmp);
        z.ptr = u16(z.ptr + 2);
    };
    var DEO = function (address, value) {
        u.dev[address] = (value);
        if ((deo_mask[address >> 4] >> (address & 0xf)) & 0x1)
            uxn_deo(u, address);
    };
    var DEI = function (address, value) {
        PUT(address, ((dei_mask[value >> 4] >> (value & 0xf)) & 0x1) ? uxn_dei(u, value) : u.dev[value]);
    };
    for (;;) {
        ins = u8((u.ram[pc++]));
        k = keepFlag(ins);
        s = returnFlag(ins) ? u.rst : u.wst;
        switch (ins) {
            case opCodes.BRK: return 1;
            case opCodes.JCI:
                if (s.dat[s.ptr] > 0) {
                    pc = u16(PEEK2(u.ram.slice(pc)) + pc);
                }
                pc = u16(2 + pc);
                break;
            case opCodes.JMI:
                pc = u16(pc + u16(PEEK2(u.ram.slice(pc)) + 2));
                break;
            case opCodes.JSI:
                PUSH2(u.rst, u16(pc + 2));
                pc = u16(pc + u16(PEEK2(u.ram.slice(pc)) + 2));
                break;
        }
        var short = shortFlag(ins);
        if (short) {
            switch (base(ins)) {
                case opCodes.LIT:
                    PUSH(s, u.ram[pc]);
                    pc = u16(pc + 1);
                    break;
                case opCodes.INC:
                    t = T();
                    SET(1, 0);
                    PUT(0, u16(t + 1));
                    break;
                case opCodes.POP:
                    SET(1, -1);
                    break;
                case opCodes.NIP:
                    t = T();
                    SET(2, -1);
                    PUT(0, t);
                    break;
                case opCodes.SWP:
                    t = T();
                    n = N();
                    SET(2, 0);
                    PUT(0, n);
                    PUT(1, t);
                    break;
                case opCodes.ROT:
                    t = T();
                    n = N();
                    l = L();
                    SET(3, 0);
                    PUT(0, l);
                    PUT(1, t);
                    PUT(2, n);
                    break;
                case opCodes.DUP:
                    t = T();
                    SET(1, 1);
                    PUT(0, t);
                    PUT(1, t);
                    break;
                case opCodes.OVR:
                    t = T();
                    n = N();
                    SET(2, 1);
                    PUT(0, n);
                    PUT(1, t);
                    PUT(2, n);
                    break;
                case opCodes.EQU:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n == t ? 1 : 0);
                    break;
                case opCodes.NEQ:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n != t ? 0 : 1);
                    break;
                case opCodes.GTH:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n > t ? 1 : 0);
                    break;
                case opCodes.LTH:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, n < t ? 1 : 0);
                    break;
                case opCodes.JMP:
                    t = T();
                    SET(1, -1);
                    pc = u16(pc + t);
                    break;
                case opCodes.JCN:
                    t = T();
                    n = N();
                    SET(2, -2);
                    pc = u16(pc + u16(n * t));
                    break;
                case opCodes.JSR:
                    t = T();
                    SET(1, -1);
                    PUSH2(u.rst, pc);
                    pc = u16(pc + t);
                    break;
                case opCodes.STH:
                    t = T();
                    SET(1, -1);
                    PUSH((ins & 0x40 ? u.wst : u.rst), t);
                    break;
                case opCodes.LDZ:
                    t = T();
                    SET(1, 0);
                    PUT(0, u.ram[t]);
                    break;
                case opCodes.STZ:
                    t = T();
                    n = N();
                    SET(2, -2);
                    u.ram[t] = (n);
                    break;
                case opCodes.LDR:
                    t = T();
                    SET(1, 0);
                    PUT(0, u.ram[u16(pc + t)]);
                    break;
                case opCodes.STR:
                    t = T();
                    n = N();
                    SET(2, -2);
                    u.ram[u16(pc + t)] = (n);
                    break;
                case opCodes.LDA:
                    t = T2();
                    SET(2, -1);
                    PUT(0, u.ram[t]);
                    break;
                case opCodes.STA:
                    t = T2();
                    n = L();
                    SET(3, -3);
                    u.ram[t] = (n);
                    break;
                case opCodes.DEI:
                    t = T();
                    SET(1, 0);
                    DEI(0, t);
                    break;
                case opCodes.DEO:
                    t = T();
                    n = N();
                    SET(2, -2);
                    DEO(t, n);
                    break;
                case opCodes.ADD:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, u16(n + t));
                    break;
                case opCodes.SUB:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, u16(n - t));
                    break;
                case opCodes.MUL:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, u16(n * t));
                    break;
                case opCodes.DIV:
                    t = T();
                    n = N();
                    SET(2, -1);
                    if (!t)
                        HALT(3);
                    PUT(0, u16(n / t));
                    break;
                case opCodes.AND:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, u16(n & t));
                    break;
                case opCodes.ORA:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, u16(n | t));
                    break;
                case opCodes.EOR:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT(0, u16(n ^ t));
                    break;
                case opCodes.SFT:
                    t = T();
                    n = N();
                    SET(2, -1);
                    PUT2(0, u16(n >> u16(t & 0xf) << u16(t >> 4)));
                    break;
            }
        }
        else {
            switch (base(ins)) {
                case opCodes.LIT:
                    PUSH(s, u.ram[pc]);
                    pc = u16(pc + 1);
                    PUSH(s, u.ram[pc]);
                    pc = u16(pc + 1);
                    break;
                case opCodes.INC:
                    t = T2();
                    SET(2, 0);
                    PUT2(0, t + 1);
                    break;
                case opCodes.POP:
                    SET(2, -2);
                    break;
                case opCodes.NIP:
                    t = T2();
                    SET(4, -2);
                    PUT2(0, t);
                    break;
                case opCodes.SWP:
                    t = T2();
                    n = N2();
                    SET(4, 0);
                    PUT2(0, n);
                    PUT2(2, t);
                    break;
                case opCodes.ROT:
                    t = T2();
                    n = N2();
                    l = L2();
                    SET(6, 0);
                    PUT2(0, l);
                    PUT2(2, t);
                    PUT2(4, n);
                    break;
                case opCodes.DUP:
                    t = T2();
                    SET(2, 2);
                    PUT2(0, t);
                    PUT2(2, t);
                    break;
                case opCodes.OVR:
                    t = T2();
                    n = N2();
                    SET(4, 2);
                    PUT2(0, n);
                    PUT2(2, t);
                    PUT2(4, n);
                    break;
                case opCodes.EQU:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n == t ? 1 : 0);
                    break;
                case opCodes.NEQ:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n != t ? 1 : 0);
                    break;
                case opCodes.GTH:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n > t ? 1 : 0);
                    break;
                case opCodes.LTH:
                    t = T2();
                    n = N2();
                    SET(4, -3);
                    PUT(0, n < t ? 1 : 0);
                    break;
                case opCodes.JMP:
                    t = T2();
                    SET(2, -2);
                    pc = t;
                    break;
                case opCodes.JCN:
                    t = T2();
                    n = L();
                    SET(3, -3);
                    if (n)
                        pc = t;
                    break;
                case opCodes.JSR:
                    t = T2();
                    SET(2, -2);
                    PUSH2(u.rst, pc);
                    pc = t;
                    break;
                case opCodes.STH:
                    t = T2();
                    SET(2, -2);
                    PUSH2((ins & 0x40 ? u.wst : u.rst), t);
                    break;
                case opCodes.LDZ:
                    t = T();
                    SET(1, 1);
                    PUT2(0, PEEK2(u.ram.slice(t)));
                    break;
                case opCodes.STZ:
                    t = T();
                    n = H2();
                    SET(3, -3);
                    POKE2(u.ram, t, n);
                    break;
                case opCodes.LDR:
                    t = T();
                    SET(1, 1);
                    PUT2(0, PEEK2(u.ram.slice(u16(pc + t))));
                    break;
                case opCodes.STR:
                    t = T();
                    n = H2();
                    SET(3, -3);
                    POKE2(u.ram, (u16(pc + t)), n);
                    break;
                case opCodes.LDA:
                    t = T2();
                    SET(2, 0);
                    PUT2(0, PEEK2(u.ram.slice(t)));
                    break;
                case opCodes.STA:
                    t = T2();
                    n = N2();
                    SET(4, -4);
                    POKE2(u.ram, (t), n);
                    break;
                case opCodes.DEI:
                    t = T();
                    SET(1, 1);
                    DEI(1, t);
                    DEI(0, t + 1);
                    break;
                case opCodes.DEO:
                    t = T();
                    n = N();
                    l = L();
                    SET(3, -3);
                    DEO(t, l);
                    DEO(t + 1, n);
                    break;
                case opCodes.ADD:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT(0, u16(n + t));
                    break;
                case opCodes.SUB:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, u16(n - t));
                    break;
                case opCodes.MUL:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, u16(n * t));
                    break;
                case opCodes.DIV:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    if (!t)
                        HALT(3);
                    PUT2(0, u16(n / t));
                    break;
                case opCodes.AND:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, u16(n & t));
                    break;
                case opCodes.ORA:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, u16(n | t));
                    break;
                case opCodes.EOR:
                    t = T2();
                    n = N2();
                    SET(4, -2);
                    PUT2(0, u16(n ^ t));
                    break;
                case opCodes.SFT:
                    t = T();
                    n = H2();
                    SET(3, -1);
                    PUT2(0, u16(n >> u16(t & 0xf) << u16(t >> 4)));
                    break;
            }
        }
    }
}
function uxn_boot(u, ram) {
    u.ram = ram;
    return 1;
}
var RAM_PAGES = 0x10;
var PAD = 4;
var TIMEOUT_MS = 334;
var BENCH = 0;
var zoom = 1;
var stdin_event, audio0_event;
var exec_deadline, deadline_interval, ms_interval;
var deo_mask = [0xff08, 0x0300, 0xc028, 0x8000, 0x8000, 0x8000, 0x8000, 0x0000, 0x0000, 0x0000, 0xa260, 0xa260, 0x0000, 0x0000, 0x0000, 0x0000];
var dei_mask = [0x0000, 0x0000, 0x003c, 0x0014, 0x0014, 0x0014, 0x0014, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x07ff, 0x0000, 0x0000, 0x0000];
function emu_error(msg, err) {
    outError("Error ".concat(msg, ": ").concat(err));
    return 1;
}
function console_deo(d, port) {
    switch (port) {
        case 0x8:
            out(String.fromCharCode(d[port]));
            return;
        case 0x9:
            outError(String.fromCharCode(d[port]));
            return;
    }
}
function uxn_dei(u, addr) {
    var p = u16(addr & 0x0f), d = u16(addr & 0xf0);
    switch (d) {
        case 0x20: return screen_dei(u, addr);
        // case 0x30: return audio_dei(0, u.dev.slice(d), p);
        // case 0x40: return audio_dei(1, u.dev.slice(d), p);
        // case 0x50: return audio_dei(2, u.dev.slice(d), p);
        // case 0x60: return audio_dei(3, u.dev.slice(d), p);
        // case 0xc0: return datetime_dei(u, addr);
    }
    return u.dev[addr];
}
function uxn_deo(u, addr) {
    var p = u16(addr & 0x0f), d = u16(addr & 0xf0);
    switch (d) {
        case 0x00:
            system_deo(u, u.dev.slice(d), p);
            if (p > 0x7 && p < 0xe)
                screen_palette(uxn_screen, u.dev.slice(0x8));
            break;
        case 0x10:
            console_deo(u.dev.slice(d), p);
            break;
        case 0x20:
            screen_deo(u.ram, u.dev.slice(d), p);
            break;
        // case 0x30: audio_deo(0, u.dev.slice(d), p, u); break;
        // case 0x40: audio_deo(1, u.dev.slice(d), p, u); break;
        // case 0x50: audio_deo(2, u.dev.slice(d), p, u); break;
        // case 0x60: audio_deo(3, u.dev.slice(d), p, u); break;
        // case 0xa0: file_deo(0, u.ram, u.dev.slice(d), p); break;
        // case 0xb0: file_deo(1, u.ram, u.dev.slice(d), p); break;
    }
}
function draw() {
    //   const canvas = document.getElementById('canvas') as HTMLCanvasElement
    //   canvas.width = uxn_screen.width
    //   canvas.height = uxn_screen.height
    //   if (canvas) {
    //     const ctx = canvas.getContext('2d')
    //     if (ctx) {
    //       for (let x = 0; x < WIDTH; x++) {
    //         for (let y = 0; y < HEIGHT; y++) {
    //           if (uxn_screen.bg.pixels[x + y * WIDTH]) {
    //             ctx.fillStyle = `#${uxn_screen.palette[uxn_screen.bg.pixels[x + y * WIDTH]].toString(16)}`;
    //             ctx.fillRect(x, y, 1, 1);
    //           }
    //           if (uxn_screen.fg.pixels[x + y * WIDTH]) {
    //             ctx.fillStyle = `#${uxn_screen.palette[uxn_screen.fg.pixels[x + y * WIDTH]].toString(16)}`;
    //             ctx.fillRect(x, y, 1, 1);
    //           }
    //         }
    //       }
    //     }
    //   }
}
function main() {
    var u = new Uxn(uxn_dei, uxn_deo);
    if (!uxn_boot(u, (new Array(0x10000 * RAM_PAGES).fill(0)))) {
        return emu_error("Boot", "Failed");
    }
    if (!system_load(u)) {
        return emu_error("Load", "Failed");
    }
    if (!uxn_eval(u, (PAGE_PROGRAM))) {
        return u.dev[0x0f] & 0x7f;
    }
    // const screen_vector = PEEK2(u.dev.slice(0x20));
    // uxn_eval(u, screen_vector)
    draw();
    return 0;
}
main();
