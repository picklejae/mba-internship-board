// Split a job posting into sections (heading + paragraphs + bullets) so the
// details panel can show it the way the employer laid it out.
// sections = [{ h: "Heading" | null, b: [{ t: "text", li: true? }] }]
// fromHtml(html): uses the posting's own markup (Booth, LinkedIn, Workday...).
// fromText(text): best effort for plain text that kept its line breaks.
// toText(sections): plain text with headings and "• " bullets, for copying.
(function (root) {
  const KNOWN = /^(about( (the|this|us|you|our|the company|the team|the role|the job|the position|the program|the business|[A-Z][\w&.\- ]{1,30}))?|overview|summary|job (summary|description|overview|details|responsibilities|requirements|qualifications)|position (summary|overview|description)|role (summary|overview|description)|program (overview|requirements|details)|the (role|opportunity|team|program|position|internship)|your (role|team|impact|responsibilities)|key (job )?responsibilities|responsibilities|duties|essential (job )?duties|key (activities|accountabilities)|what you('|’)?ll (do|be doing|work on|learn|bring|need)|what you will (do|be doing|learn|bring|need)|what (you can expect|to expect|we offer|we('|’)?re looking for|we look for|you bring|you need)|a day in the life|day to day|who you are|who we are|you have|you bring|you are|qualifications|(basic|minimum|required|preferred|desired|additional|key) (qualifications|skills|requirements|experience)|requirements|required (skills|education|experience)[\w ,&]*|preferred (skills|experience)[\w ,&]*|skills( and experience)?|experience|education|eligibility( requirements)?|nice to have|bonus points|benefits|perks|compensation( and benefits)?|pay( range| transparency)?|salary( range)?|location|why join( us)?|why [A-Z][\w&.\- ]{1,30}\??|how to apply|additional information|other information|equal opportunity( employer)?|work authorization|internship (details|program|overview)|program (details|structure)|timeline)$/i;
  const BULLET = /^\s*([•·▪◦●○■□➢➤►✓✔–—\-\*]|\d{1,2}[.)])\s+/;
  const norm = (s) => String(s || "").replace(/ /g, " ").replace(/[ \t\f\v\r]+/g, " ").replace(/ *\n */g, "\n").trim();
  const headClean = (s) => s.replace(/\s*[:：\-–—]+\s*$/, "").replace(/\s+/g, " ").trim();
  const words = (s) => s.split(/\s+/).filter(Boolean).length;

  function looksHead(t, boldShare) {
    if (!t || t.length > 90 || /^[•·\-\*]/.test(t)) return false;
    const c = headClean(t);
    if (c.length < 2 || /^[\d$€£]/.test(c)) return false;
    if (boldShare >= 0.85 && !/[.!;,]$/.test(t) && words(c) <= 12 && !(/\?$/.test(t) && c.length > 40)) return true;
    if (/[:：]$/.test(t) && c.length <= 60 && words(c) <= 8 && !/^(note|please note)\b/i.test(c)) return true;
    if (KNOWN.test(c) && !/[.!?;,]$/.test(t)) return true;
    if (c.length <= 50 && c === c.toUpperCase() && /[A-Z]{3}/.test(c) && !/[.!?;,]$/.test(t)) return true;
    return false;
  }

  // Pay, EEO and legal text that often trails the last list with no heading of its own.
  const BOILER = /^(compensation|pay (range|transparency)|(the )?(expected|target|starting|base) (pay|salary|base)|salary|benefits|[\w&.,' ]{0,40} is (an|a proud) equal|equal (employment )?opportunit|all qualified applicants|we are an equal|eeo|if you (have a disability|need (an? )?(reasonable )?accommodation)|any applicant who requires|reasonable accommodation|u\.s\. export|export control|disclaimer|e-verify|#\w+)/i;
  function group(lines) {
    // lines: [{k:"h"|"p"|"li", t}] -> sections; drop empty headed sections, dedupe.
    const out = []; let cur = { h: null, b: [] };
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i], t = norm(l.t); if (!t || /^[\s.·•\-–—_*]+$/.test(t)) continue;
      // A "…:" lead-in right under a heading belongs to that heading's section.
      if (l.k === "h" && cur.h && !cur.b.length && /[:：]$/.test(t) && !KNOWN.test(headClean(t)) && words(t) > 4) { cur.b.push({ t }); continue; }
      if (l.k === "h") { if (cur.h || cur.b.length) out.push(cur); cur = { h: headClean(t), b: [] }; continue; }
      if (l.k === "p" && BOILER.test(t) && cur.b.some((x) => x.li) && cur.h !== "Additional information") { out.push(cur); cur = { h: "Additional information", b: [] }; }
      const prev = cur.b[cur.b.length - 1];
      if (prev && prev.t === t) continue;
      cur.b.push(l.k === "li" ? { t, li: true } : { t });
    }
    if (cur.h || cur.b.length) out.push(cur);
    return out.filter((s) => s.b.length);
  }

  function fromHtml(html) {
    if (!html || typeof DOMParser === "undefined") return null;
    const doc = new DOMParser().parseFromString(String(html), "text/html");
    const lines = [];
    const BLOCK = /^(P|DIV|LI|UL|OL|H[1-6]|TABLE|TBODY|THEAD|TR|TD|TH|SECTION|ARTICLE|BLOCKQUOTE|PRE|HEADER|FOOTER|DL|DT|DD|CENTER)$/;
    const isBold = (n, stop) => { for (let e = n.parentElement; e && e !== stop.parentElement; e = e.parentElement) {
      if (/^(STRONG|B|H[1-6])$/.test(e.tagName)) return true;
      const fw = (e.getAttribute && e.getAttribute("style") || "").match(/font-weight\s*:\s*(bold|[6-9]00)/i); if (fw) return true; } return false; };
    // Flush the inline content of one block, split at <br>, into lines.
    function flushInline(nodes, kind, owner) {
      let runs = [[]];
      const walk = (n) => {
        if (n.nodeType === 3) { runs[runs.length - 1].push({ t: n.nodeValue, b: isBold(n, owner) }); return; }
        if (n.nodeType !== 1) return;
        if (n.tagName === "BR") { runs.push([]); return; }
        if (/^(SCRIPT|STYLE)$/.test(n.tagName)) return;
        n.childNodes.forEach(walk);
      };
      nodes.forEach(walk);
      for (const r of runs) {
        const t = norm(r.map((x) => x.t).join("")); if (!t) continue;
        const tot = r.reduce((a, x) => a + norm(x.t).length, 0) || 1, bold = r.filter((x) => x.b).reduce((a, x) => a + norm(x.t).length, 0);
        if (owner && /^H[1-6]$/.test(owner.tagName) && t.length <= 120) { lines.push({ k: "h", t }); continue; }
        if (kind !== "li" && BULLET.test(t)) { lines.push({ k: "li", t: t.replace(BULLET, "") }); continue; }
        if (kind !== "li" && looksHead(t, bold / tot)) { lines.push({ k: "h", t }); continue; }
        // "Heading: long text" with a bold lead-in -> heading + paragraph (not inside bullets).
        const lead = r[0] && r[0].b ? norm(r.filter((x, i) => r.slice(0, i + 1).every((y) => y.b)).map((x) => x.t).join("")) : "";
        if (kind !== "li" && lead && /[:：]$/.test(lead) && lead.length <= 50 && t.length - lead.length > 100) {
          lines.push({ k: "h", t: lead }); lines.push({ k: "p", t: t.slice(lead.length) }); continue; }
        lines.push({ k: kind, t });
      }
    }
    function block(el, kind) {
      let inline = [];
      const done = () => { if (inline.length) { flushInline(inline, kind, el); inline = []; } };
      el.childNodes.forEach((n) => {
        if (n.nodeType === 1 && BLOCK.test(n.tagName)) {
          done();
          if (n.tagName === "LI") block(n, "li");
          else if (n.tagName === "UL" || n.tagName === "OL") block(n, "li");
          else block(n, kind === "li" && !/^H/.test(n.tagName) ? "li" : "p");
        } else inline.push(n);
      });
      done();
    }
    block(doc.body, "p");
    const secs = group(lines);
    return secs.length ? secs : null;
  }

  function fromText(text) {
    const raw = String(text || "").replace(/\r/g, "");
    const ls = raw.split("\n").map((s) => norm(s));
    if (ls.filter(Boolean).length < 4) return null; // flattened text: nothing to go on
    const lines = [];
    for (let i = 0; i < ls.length; i++) {
      const t = ls[i]; if (!t) continue;
      if (BULLET.test(t)) { lines.push({ k: "li", t: t.replace(BULLET, "") }); continue; }
      const next = ls.slice(i + 1).find(Boolean);
      if (next && looksHead(t, 0)) { lines.push({ k: "h", t }); continue; }
      const m = t.match(/^([^:.!?]{3,45})[:：]\s+(.{60,})$/);
      if (m && KNOWN.test(headClean(m[1]))) { lines.push({ k: "h", t: m[1] }); lines.push({ k: "p", t: m[2] }); continue; }
      lines.push({ k: "p", t });
    }
    const secs = group(lines);
    return secs.length >= 2 ? secs : null;
  }

  function toText(secs) {
    return (secs || []).map((s) => [s.h, ...s.b.map((x) => (x.li ? "• " : "") + x.t)].filter(Boolean).join("\n")).join("\n\n");
  }

  const api = { fromHtml, fromText, toText, looksHead };
  if (typeof module !== "undefined") module.exports = api; else root.jdSections = api;
})(typeof window !== "undefined" ? window : globalThis);
