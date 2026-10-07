import { describe, expect, it } from "vitest";
import { insertReadAlso, linkPlatformMentions } from "./blog-links";

const linkable = new Set(["snes", "ps2", "psx", "megadrive"]);

describe("linkPlatformMentions", () => {
  it("links only the first mention of each platform, preferring longer names", () => {
    const html =
      "<p>O PlayStation 2 superou o PlayStation. Depois, o PlayStation 2 de novo e o Super Nintendo.</p>";
    expect(linkPlatformMentions(html, linkable)).toBe(
      '<p>O <a href="/platforms/ps2">PlayStation 2</a> superou o <a href="/platforms/psx">PlayStation</a>. ' +
        'Depois, o PlayStation 2 de novo e o <a href="/platforms/snes">Super Nintendo</a>.</p>'
    );
  });

  it("skips headings, existing links and platforms without a landing page", () => {
    const html =
      '<h2>Mega Drive</h2><p><a href="/x">Mega Drive</a> e Dreamcast</p><p>Mega Drive</p>';
    expect(linkPlatformMentions(html, linkable)).toBe(
      '<h2>Mega Drive</h2><p><a href="/x">Mega Drive</a> e Dreamcast</p><p><a href="/platforms/megadrive">Mega Drive</a></p>'
    );
  });

  it("does not match inside longer words or numbered variants", () => {
    const html = "<p>SNESmania e PlayStation 3 e PS2X</p>";
    expect(linkPlatformMentions(html, linkable)).toBe(html);
  });
});

describe("insertReadAlso", () => {
  const related = { slug: "outro-post", title: "Outro <post>" };

  it("inserts the card after the third paragraph", () => {
    const html = "<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>";
    expect(insertReadAlso(html, related)).toBe(
      '<p>1</p><p>2</p><p>3</p><aside class="read-also"><span>Leia também</span>' +
        '<a href="/blog/outro-post">Outro &lt;post&gt;</a></aside><p>4</p><p>5</p>'
    );
  });

  it("leaves short posts untouched", () => {
    const html = "<p>1</p><p>2</p><p>3</p><p>4</p>";
    expect(insertReadAlso(html, related)).toBe(html);
  });
});
