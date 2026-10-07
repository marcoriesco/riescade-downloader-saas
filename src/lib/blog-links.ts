// Adds internal links to blog post HTML: the first mention of a platform links to its
// landing page, and a "Leia também" card is placed after the third paragraph.

// Longer names first so "PlayStation 2" wins over "PlayStation".
const PLATFORM_ALIASES: [string, string][] = [
  ["Super Nintendo", "snes"],
  ["SNES", "snes"],
  ["Super Famicom", "sfc"],
  ["Nintendo 64", "n64"],
  ["Nintendo DS", "nds"],
  ["Nintendo Switch", "switch"],
  ["Game Boy Advance", "gba"],
  ["Game Boy Color", "gbc"],
  ["Game Boy", "gb"],
  ["Virtual Boy", "virtualboy"],
  ["Famicom Disk System", "fds"],
  ["Wii U", "wiiu"],
  ["Mega Drive", "megadrive"],
  ["Sega Genesis", "genesis"],
  ["Master System", "mastersystem"],
  ["Game Gear", "gamegear"],
  ["Sega Saturn", "saturn"],
  ["Sega CD", "segacd"],
  ["Mega CD", "segacd"],
  ["Dreamcast", "dreamcast"],
  ["PlayStation Portable", "psp"],
  ["PlayStation Vita", "psvita"],
  ["PS Vita", "psvita"],
  ["PlayStation 2", "ps2"],
  ["PlayStation 3", "ps3"],
  ["PlayStation 4", "ps4"],
  ["PlayStation 5", "ps5"],
  ["PlayStation", "psx"],
  ["PSP", "psp"],
  ["PS2", "ps2"],
  ["PS1", "psx"],
  ["Xbox 360", "xbox360"],
  ["Neo Geo Pocket Color", "ngpc"],
  ["Neo Geo Pocket", "ngp"],
  ["Neo Geo CD", "neogeocd"],
  ["Neo Geo", "neogeo"],
  ["Atari 2600", "atari2600"],
  ["Atari 7800", "atari7800"],
  ["Atari Lynx", "lynx"],
  ["Atari Jaguar", "jaguar"],
  ["Atari ST", "atarist"],
  ["TurboGrafx-16", "tg16"],
  ["PC Engine", "pcengine"],
  ["ColecoVision", "colecovision"],
  ["Intellivision", "intellivision"],
  ["Vectrex", "vectrex"],
  ["3DO", "3do"],
  ["WonderSwan", "wswan"],
  ["Commodore 64", "c64"],
  ["ZX Spectrum", "zxspectrum"],
  ["Amiga", "amiga1200"],
  ["MSX", "msx1"],
  ["Apple II", "apple2"],
  ["Amstrad CPC", "amstradcpc"],
  ["N-Gage", "ngage"],
  ["Pokémon Mini", "pokemini"],
  ["Game & Watch", "gameandwatch"],
  ["CD-i", "cdi"],
  ["MS-DOS", "dos"],
  ["ScummVM", "scummvm"],
  ["MAME", "mame"],
  ["PICO-8", "pico8"],
];

const MAX_PLATFORM_LINKS = 6;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export interface RelatedLink {
  slug: string;
  title: string;
}

export function linkPlatformMentions(html: string, linkable: Set<string>): string {
  const aliases = PLATFORM_ALIASES.filter(([, slug]) => linkable.has(slug));
  if (aliases.length === 0) return html;
  // Not inside a word, and not followed by a digit or a longer name ("PlayStation 2").
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}-])(${aliases.map(([name]) => escapeRegExp(name)).join("|")})(?![\\p{L}\\p{N}]|-| \\d)`,
    "gu"
  );
  const bySlug = new Map(aliases);
  const linked = new Set<string>();
  let blockedDepth = 0;

  return html
    .split(/(<[^>]+>)/)
    .map((part) => {
      if (part.startsWith("<")) {
        const tag = part.match(/^<\/?\s*([a-z0-9]+)/i)?.[1]?.toLowerCase();
        if (tag === "a" || /^h[1-6]$/.test(tag ?? "") || tag === "code" || tag === "pre") {
          blockedDepth += part.startsWith("</") ? -1 : 1;
        }
        return part;
      }
      if (blockedDepth > 0 || linked.size >= MAX_PLATFORM_LINKS) return part;
      return part.replace(pattern, (match) => {
        const slug = bySlug.get(match);
        if (!slug || linked.has(slug) || linked.size >= MAX_PLATFORM_LINKS) return match;
        linked.add(slug);
        return `<a href="/platforms/${slug}">${match}</a>`;
      });
    })
    .join("");
}

export function insertReadAlso(html: string, related: RelatedLink | undefined, afterParagraph = 3): string {
  if (!related) return html;
  let count = 0;
  const marker = /<\/p>/gi;
  let match: RegExpExecArray | null;
  while ((match = marker.exec(html))) {
    count += 1;
    if (count === afterParagraph) {
      const at = match.index + match[0].length;
      // Too close to the end: the card would just repeat the related posts section.
      if ((html.slice(at).match(/<\/p>/gi)?.length ?? 0) < 2) return html;
      const card =
        `<aside class="read-also"><span>Leia também</span>` +
        `<a href="/blog/${encodeURIComponent(related.slug)}">${escapeHtml(related.title)}</a></aside>`;
      return html.slice(0, at) + card + html.slice(at);
    }
  }
  return html;
}
