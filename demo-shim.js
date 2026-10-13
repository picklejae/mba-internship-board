/*
 * Demo shim for the MBA Internship Board.
 *
 * In production the page runs as a Claude artifact, where `window.claude.use("db")`
 * gives it a shared database (role list) plus a private per-user space (pipeline,
 * stars, notes). This file stands in for that runtime so the page works anywhere,
 * e.g. GitHub Pages: it serves fictional sample data and keeps your pipeline in
 * this browser's localStorage.
 *
 * Every company and role below is made up. No real postings are included.
 */
(function () {
  if (window.claude && window.claude.use) return; // running inside Claude: use the real runtime

  const DAY = 86400000;
  const now = Date.now();
  const iso = (t) => new Date(t).toISOString();
  const ymd = (t) => new Date(t).toISOString().slice(0, 10);
  // A deadline N days from now at 11:59pm Central (05:59 UTC next day)
  const due = (n) => { const d = new Date(now + n * DAY); d.setUTCHours(4, 59, 0, 0); d.setTime(d.getTime() + DAY); return d; };

  const companies = {
    "northwind-analytics": { name: "Northwind Analytics", track: "tech", segment: "Software", aliases: ["northwind analytics"] },
    "lumen-robotics": { name: "Lumen Robotics", track: "tech", segment: "Hardware & robotics", aliases: ["lumen robotics"] },
    "atlas-cloud": { name: "Atlas Cloud", track: "tech", segment: "Software", aliases: ["atlas cloud"] },
    "quill-software": { name: "Quill Software", track: "tech", segment: "Software", aliases: ["quill software"] },
    "orbitra-space": { name: "Orbitra Space", track: "tech", segment: "Defense & aerospace", aliases: ["orbitra space"] },
    "kestrel-defense": { name: "Kestrel Defense Systems", track: "tech", segment: "Defense & aerospace", aliases: ["kestrel defense systems"], visaPolicy: "no" },
    "fernpay": { name: "FernPay", track: "tech", segment: "Fintech", aliases: ["fernpay"] },
    "maple-mobility": { name: "Maple Mobility", track: "tech", segment: "Travel & transport", aliases: ["maple mobility"] },
    "cedar-health": { name: "Cedar Health", track: "corporate", segment: "Healthcare", aliases: ["cedar health"] },
    "bright-basket": { name: "Bright Basket Foods", track: "corporate", segment: "CPG, food & retail", aliases: ["bright basket foods"] },
    "pinecrest-bank": { name: "Pinecrest Bank", track: "corporate", segment: "Financial services", aliases: ["pinecrest bank"] },
    "harbor-media": { name: "Harbor Media", track: "corporate", segment: "Media & telecom", aliases: ["harbor media"] },
    "solace-energy": { name: "Solace Energy", track: "corporate", segment: "Industrial, auto & energy", aliases: ["solace energy"] },
    "tidewater-retail": { name: "Tidewater Retail", track: "corporate", segment: "CPG, food & retail", aliases: ["tidewater retail"] },
  };

  // [id, companyKey, title, location, function, deadline days (null = rolling), firstSeen days ago, extras]
  const R = [
    ["r01", "northwind-analytics", "MBA Product Manager Intern – Data Platform", "San Francisco, CA", "Product management", 12, 9],
    ["r02", "northwind-analytics", "MBA Product Marketing Intern", "San Francisco, CA", "Marketing", 12, 9],
    ["r03", "lumen-robotics", "Summer 2027 MBA Intern – Operations Strategy", "Pittsburgh, PA", "Operations / supply chain", 2, 14],
    ["r04", "lumen-robotics", "MBA Business Development Intern", "Boston, MA", "Company finance / BD", null, 3],
    ["r05", "atlas-cloud", "MBA Product Manager Intern – AI Agents", "Seattle, WA", "Product management", 20, 1],
    ["r06", "atlas-cloud", "MBA Strategy & Operations Intern", "Seattle, WA", "Corporate strategy", 20, 1],
    ["r07", "quill-software", "Product Manager Intern (MBA)", "Remote (US)", "Product management", null, 6],
    ["r08", "orbitra-space", "Summer 2027 Finance Intern – Graduate", "Denver, CO", "Company finance / BD", null, 10, { visa: ["no", "Must be a U.S. citizen or lawful permanent resident due to export-control regulations."] }],
    ["r09", "kestrel-defense", "MBA Program Management Intern", "Arlington, VA", "Operations / supply chain", 25, 4],
    ["r10", "kestrel-defense", "Corporate Strategy MBA Intern", "Arlington, VA", "Corporate strategy", 25, 4],
    ["r11", "fernpay", "MBA Product Intern – Payments", "New York, NY", "Product management", 6, 2],
    ["r12", "fernpay", "MBA Growth Marketing Intern", "New York, NY", "Marketing", 6, 2, { visa: ["limited", "CPT and OPT are supported for this internship."] }],
    ["r13", "maple-mobility", "MBA Strategy Intern – New Markets", "Austin, TX", "Corporate strategy", 33, 7],
    ["r14", "maple-mobility", "MBA Product Operations Intern", "Austin, TX", "Operations / supply chain", 33, 7],
    ["r15", "cedar-health", "MBA Commercial Leadership Intern", "Chicago, IL", "Gen mgmt / leadership programs", 4, 12],
    ["r16", "cedar-health", "MBA Marketing Intern – Consumer Health", "Chicago, IL", "Marketing", 4, 12, { visa: ["no", "Applicants must be authorized to work in the US without current or future visa sponsorship."] }],
    ["r17", "bright-basket", "2027 MBA Brand Management Intern", "Minneapolis, MN", "Marketing", 18, 5],
    ["r18", "bright-basket", "2027 MBA Finance Leadership Intern", "Minneapolis, MN", "Company finance / BD", 18, 5],
    ["r19", "bright-basket", "2027 MBA Supply Chain Intern", "Minneapolis, MN", "Operations / supply chain", 18, 5],
    ["r20", "pinecrest-bank", "MBA Digital Product Intern", "Charlotte, NC", "Product management", 1, 15, { track: "tech", segment: "Product & digital at corporates" }],
    ["r21", "pinecrest-bank", "Strategy & Management Summer Associate", "Charlotte, NC", "Corporate strategy", 1, 15, { visa: ["no", "We are unable to consider candidates who will require visa sponsorship now or in the future."] }],
    ["r22", "harbor-media", "MBA Strategy Intern – Streaming", "Los Angeles, CA", "Corporate strategy", 40, 8],
    ["r23", "harbor-media", "MBA Audience Insights Intern", "Los Angeles, CA", "Marketing", null, 8],
    ["r24", "solace-energy", "MBA Commercial Strategy Intern", "Houston, TX", "Corporate strategy", 27, 11],
    ["r25", "solace-energy", "MBA Corporate Development Intern", "Houston, TX", "Company finance / BD", 27, 11],
    ["r26", "tidewater-retail", "MBA Merchandising Leadership Intern", "Bentonville, AR", "Gen mgmt / leadership programs", 9, 3],
    ["r27", "tidewater-retail", "MBA eCommerce Product Intern", "Bentonville, AR", "Product management", 9, 3, { track: "tech", segment: "Product & digital at corporates" }],
    ["r28", "quill-software", "MBA Pricing & Packaging Intern", "Remote (US)", "Corporate strategy", 15, 6],
    ["r29", "atlas-cloud", "MBA Partner Marketing Intern", "Seattle, WA", "Marketing", 20, 1],
    ["r30", "orbitra-space", "MBA Business Operations Intern", "Denver, CO", "Operations / supply chain", 45, 2, { opensInDays: 21 }],
    ["r31", "cedar-health", "MBA Market Access Strategy Intern", "Chicago, IL", "Corporate strategy", 30, 0, { opensInDays: 10 }],
    ["r32", "lumen-robotics", "MBA Product Manager Intern – Warehouse Robots", "Pittsburgh, PA", "Product management", 22, 0],
  ];

  const roles = {}, visa = {}, jd = {};
  for (const [id, ck, title, location, fn, dDays, seenAgo, x = {}] of R) {
    const c = companies[ck];
    const dl = dDays === null ? null : due(dDays);
    roles[id] = {
      company: c.name, companyKey: ck, track: x.track || c.track, segment: x.segment || c.segment, function: fn,
      title, location, season: "Summer 2027", type: "Internship", mbaExplicit: true, notes: "",
      deadline: dl ? ymd(dl.getTime() - 6 * 3600000) : null, deadlineAt: dl ? iso(dl) : null,
      opensAt: x.opensInDays ? iso(now + x.opensInDays * DAY) : null,
      companyUrl: "https://example.com/careers/" + id, portalUrl: null, boardUrl: null,
      firstSeen: ymd(now - seenAgo * DAY), open: true,
    };
    if (x.visa) visa[id] = { status: x.visa[0], quote: x.visa[1], source: "Job description" };
    jd[id] = {
      text: `${title} at ${c.name} (fictional sample posting)\n\nAbout the role\n• Work with a cross-functional team on a high-priority project for the business\n• Research customers, competitors and market trends, and turn insights into recommendations\n• Present findings to senior leaders at the end of the summer\n\nWhat you need\n• Currently enrolled in a full-time MBA program, graduating in 2028\n• Strong analytical, problem-solving and communication skills\n• Comfort using AI tools to explore ideas and speed up analysis` + (x.visa ? `\n\n${x.visa[1]}` : ""),
      source: "Company careers site", capturedAt: ymd(now - seenAgo * DAY), pay: "$45–55/hr",
    };
  }

  const recent = Object.entries(roles).filter(([, r]) => r.firstSeen >= ymd(now - 3 * DAY));
  const changes = {
    a1: { at: iso(now - 10 * DAY), source: "Company-site check", added: [] },
    a2: { at: iso(now - 12 * 3600000), source: "Career portal + job board refresh",
      added: recent.map(([id, r]) => ({ id, company: r.company, title: r.title, track: r.track })) },
  };
  const meta = { sync: { portalAt: iso(now - 5 * 3600000), boardAt: iso(now - 5 * 3600000), coRunAt: iso(now - 9 * 3600000), portalStatus: "ok", boardStatus: "ok" } };

  const shared = { companies, roles, visa, jd, changes, meta };
  const LS = "demo-board-user-v1";
  const loadUser = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { return {}; } };
  const saveUser = (u) => { try { localStorage.setItem(LS, JSON.stringify(u)); } catch (e) {} };
  const merge = (a, b) => { for (const [k, v] of Object.entries(b)) { a[k] = v && typeof v === "object" && !Array.isArray(v) && a[k] && typeof a[k] === "object" ? merge(a[k], v) : v; } return a; };

  const snap = (exists, data) => ({ exists, data: () => (data ? JSON.parse(JSON.stringify(data)) : null), metadata: {} });
  function docRef(path) {
    const parts = path.split("/");
    const isUser = parts[0] === "data" && parts[1] === "users";
    const read = () => {
      if (isUser) { const u = loadUser(); return u[parts.slice(3).join("/")] || null; }
      const col = shared[parts[0]]; return col ? col[parts[1]] || null : null;
    };
    const write = (data, mode) => {
      if (!isUser) return Promise.reject({ code: "invalid_argument" });
      const u = loadUser(), key = parts.slice(3).join("/");
      u[key] = mode === "update" ? merge(u[key] || {}, data) : data; saveUser(u); return Promise.resolve();
    };
    return {
      get: async () => { const d = read(); return snap(!!d, d); },
      onSnapshot: (cb) => { setTimeout(() => { const d = read(); cb(snap(!!d, d)); }, 0); return () => {}; },
      set: (d) => write(d, "set"),
      update: (d) => write(d, "update"),
    };
  }
  function collectionRef(name) {
    return {
      doc: (id) => docRef(name + "/" + id),
      onSnapshot: (cb) => { setTimeout(() => { const col = shared[name] || {}; cb({ docs: Object.entries(col).map(([id, d]) => Object.assign(snap(true, d), { id })) }); }, 0); return () => {}; },
    };
  }
  const db = { collection: collectionRef, doc: docRef };
  const user = { id: async () => "demo-user" };
  const downloads = {
    save: async ({ filename, data }) => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "text/csv" })); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove(); return { status: "saved" };
    },
  };
  window.claude = { use: async (name) => ({ db, user, downloads })[name] || null };
})();
