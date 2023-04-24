import { out, outError } from '../out';
import { PAGE_PROGRAM, PEEK2, Stack, Uxn, uxn_eval} from '../uxn'
import { RAM_PAGES } from '../uxnemu'

const errors: string[] = [
	"underflow",
	"overflow",
	"division by zero"
];

function system_print(s: Stack, name: string): void {
  out(`<${name}>`);

  for (let i = 0; i < s.ptr; i++) {
    out(` ${s.dat[i].toString(16).padStart(2, '0')}`);
  }
  if (s.ptr === 0) {
    out(' empty');
  }
  out('\n');
}

function system_cmd(ram: number[], addr: number)
{
	if(ram[addr] == 0x01) {
		let i, length = PEEK2(ram.slice(addr + 1));
		const a_page = PEEK2(ram.slice(addr + 1 + 2));
    const a_addr = PEEK2(ram.slice(addr + 1 + 4));
		const b_page = PEEK2(ram.slice(addr + 1 + 6));
    const b_addr = PEEK2(ram.slice(addr + 1 + 8));
		const src = (a_page % RAM_PAGES) * 0x10000;
    const dst = (b_page % RAM_PAGES) * 0x10000;

		for(i = 0; i < length; i++)
			ram[dst + (b_addr + i)] = ram[src + (a_addr + i)];
	}
}

function system_inspect(u: Uxn)
{
	system_print(u.wst, "wst");
	system_print(u.rst, "rst");
}

export function system_load(u: Uxn): number {
  const f = (window as any).rom;

  if (!f) {
    return 0;
  }

  u.ram = (new Array(0x100000).fill(0))

  for (let i = 0; i < f.length; i ++) {
    u.ram[PAGE_PROGRAM + i] = (f.at(i) || 0)
  }

  return 1;
}

/* IO */

export function system_deo(u: Uxn, d: number[], port: number)
{
	switch(port) {
	case 0x3:
		system_cmd(u.ram, PEEK2(d.slice(2)));
		break;
	case 0xe:
    console.log('DEO')
		system_inspect(u);
		break;
	}
}

/* Error */

export function uxn_halt(u: Uxn, instr: number, err: number, addr: number)
{
	const d = u.dev.slice(0x00);
	const handler = PEEK2(d);

  console.log('HALT', d, handler)

	if(handler) {
		u.wst.ptr = 4;
		u.wst.dat[0] = addr >> 0x8;
		u.wst.dat[1] = addr & 0xff;
		u.wst.dat[2] = instr;
		u.wst.dat[3] = err;

		return uxn_eval(u, handler);
	} else {
		system_inspect(u);
		outError(`${(instr & 0x40) ? "Return-stack" : "Working-stack"} ${errors[err - 1]}, by ${instr.toString(16)} at 0x${addr.toString(16).padStart(4, '0')}.\n`);
	}
	return 0;
}