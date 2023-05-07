import {
  clamp,
  HEIGHT,
  screen_dei,
  screen_deo,
  screen_palette,
  screen_redraw,
  uxn_screen,
  WIDTH
} from './devices/screen';
import { system_deo, system_load } from './devices/system';
import { out, outError } from './out';
import { Uxn, PEEK2, uxn_eval, uxn_boot, PAGE_PROGRAM, u16 } from './uxn';

export const RAM_PAGES = 0x10;
export const PAD = 4;
export const TIMEOUT_MS = 334;
export const BENCH = 0;

export let zoom = 1;
export let stdin_event: number, audio0_event: number;
export let exec_deadline: number,
  deadline_interval: number,
  ms_interval: number;

export const deo_mask: number[] = [
  0xff08, 0x0300, 0xc028, 0x8000, 0x8000, 0x8000, 0x8000, 0x0000, 0x0000,
  0x0000, 0xa260, 0xa260, 0x0000, 0x0000, 0x0000, 0x0000
];
export const dei_mask: number[] = [
  0x0000, 0x0000, 0x003c, 0x0014, 0x0014, 0x0014, 0x0014, 0x0000, 0x0000,
  0x0000, 0x0000, 0x0000, 0x07ff, 0x0000, 0x0000, 0x0000
];

function emu_error(msg: string, err: string): number {
  outError(`Error ${msg}: ${err}`);
  return 1;
}

function console_deo(d: number[], port: number): void {
  // console.log('!!', d[port], d, port, '>>', String.fromCharCode(d[port]), '<<')

  switch (port) {
    case 0x8:
      out(String.fromCharCode(d[port]));
      return;
    case 0x9:
      outError(String.fromCharCode(d[port]));
      return;
  }
}

export function uxn_dei(u: Uxn, addr: number): number {
  const p = u16(addr & 0x0f),
    d = u16(addr & 0xf0);

  switch (d) {
    case 0x20:
      return screen_dei(u, addr);
    // case 0x30: return audio_dei(0, u.dev.slice(d), p);
    // case 0x40: return audio_dei(1, u.dev.slice(d), p);
    // case 0x50: return audio_dei(2, u.dev.slice(d), p);
    // case 0x60: return audio_dei(3, u.dev.slice(d), p);
    // case 0xc0: return datetime_dei(u, addr);
  }
  return u.dev[addr];
}

export function uxn_deo(u: Uxn, addr: number): void {
  const p = u16(addr & 0x0f),
    d = u16(addr & 0xf0);

  switch (d) {
    case 0x00:
      system_deo(u, u.dev.slice(d), p);

      if (p > 0x7 && p < 0xe) screen_palette(uxn_screen, u.dev.slice(0x8));
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

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D | null;

export function set_zoom(scale: number) {
  zoom = clamp(scale, 1, 3);
  console.log({ scale, zoom });
}

export function draw() {
  if (!uxn_screen.bg.changed && !uxn_screen.fg.changed) {
    return;
  }

  screen_redraw(uxn_screen);

  if (!canvas) {
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
  }

  canvas.width = uxn_screen.width * zoom;
  canvas.height = uxn_screen.height * zoom;

  if (canvas) {
    if (!ctx) {
      ctx = canvas.getContext('2d');
    }

    if (ctx) {
      ctx.scale(zoom, zoom);

      for (let x = 0; x < uxn_screen.width; x++) {
        for (let y = 0; y < uxn_screen.height; y++) {
          let color = uxn_screen.pixels[x + y * uxn_screen.width].toString(16)
          if (color.length === 1) { color = (new Array(3)).fill(color).join('') }

          ctx.fillStyle = `#${color}`;

          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }
}

function main(): number {
  const u = new Uxn(uxn_dei, uxn_deo);

  if (!uxn_boot(u, new Array(0x10000 * RAM_PAGES).fill(0))) {
    return emu_error('Boot', 'Failed');
  }

  set_zoom(window.innerWidth / 1280);

  if (!system_load(u)) {
    return emu_error('Load', 'Failed');
  }

  if (!uxn_eval(u, PAGE_PROGRAM)) {
    return u.dev[0x0f] & 0x7f;
  }

  // const screen_vector = PEEK2(u.dev.slice(0x20));

  // uxn_eval(u, screen_vector)

  return 0;
}

main();

setInterval(() => {
  draw();
}, 50);
