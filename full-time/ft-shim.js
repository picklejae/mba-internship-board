/*
 * Demo shim for the Full-Time Compiler: fictional post-MBA full-time roles
 * and recruiting events, with your pipeline kept in this browser's
 * localStorage. Every company, role and event below is made up.
 */
(function () {
  if (window.claude && window.claude.use) return;
  const DAY = 86400000;
  const now = Date.now();
  const iso = (t) => new Date(t).toISOString();
  const ymd = (t) => new Date(t).toISOString().slice(0, 10);
  // A deadline N days from now at 11:59pm Central (05:59 UTC next day)
  const due = (n) => { const d = new Date(now + n * DAY); d.setUTCHours(4, 59, 0, 0); d.setTime(d.getTime() + DAY); return d; };
  // An event N days from now at a given Central hour (UTC-6)
  const at = (n, h) => { const d = new Date(now + n * DAY); d.setUTCHours(h + 6, 0, 0, 0); return d.getTime(); };

  const companies = {
    "northwind-analytics": { name: "Northwind Analytics", track: "tech", segment: "Software", aliases: ["northwind analytics"] },
    "atlas-cloud": { name: "Atlas Cloud", track: "tech", segment: "Software", aliases: ["atlas cloud"] },
    "lumen-robotics": { name: "Lumen Robotics", track: "tech", segment: "Hardware & robotics", aliases: ["lumen robotics"] },
    "fernpay": { name: "FernPay", track: "tech", segment: "Fintech", aliases: ["fernpay"] },
    "orbitra-space": { name: "Orbitra Space", track: "tech", segment: "Defense & aerospace", aliases: ["orbitra space"], visaPolicy: "no" },
    "maple-mobility": { name: "Maple Mobility", track: "tech", segment: "Travel & transport", aliases: ["maple mobility"] },
    "cedar-health": { name: "Cedar Health", track: "corporate", segment: "Healthcare", aliases: ["cedar health"] },
    "bright-basket": { name: "Bright Basket Foods", track: "corporate", segment: "CPG, food & retail", aliases: ["bright basket foods"] },
    "pinecrest-bank": { name: "Pinecrest Bank", track: "corporate", segment: "Financial services", aliases: ["pinecrest bank"] },
    "harbor-media": { name: "Harbor Media", track: "corporate", segment: "Media & telecom", aliases: ["harbor media"] },
    "solace-energy": { name: "Solace Energy", track: "corporate", segment: "Industrial, auto & energy", aliases: ["solace energy"] },
    "tidewater-retail": { name: "Tidewater Retail", track: "corporate", segment: "CPG, food & retail", aliases: ["tidewater retail"] },
  };

  // [id, companyKey, title, location, function, deadline days (null = rolling), firstSeen days ago, pay, extras]
  const R = [
    ["f01", "northwind-analytics", "Senior Product Manager, MBA – Data Platform", "San Francisco, CA", "Product management", 14, 1, "$175,000–$205,000 base"],
    ["f02", "northwind-analytics", "Product Marketing Manager (MBA 2027)", "San Francisco, CA", "Marketing", null, 6, "$150,000–$170,000 base"],
    ["f03", "atlas-cloud", "Product Manager II – AI Agents (MBA)", "Seattle, WA", "Product management", 9, 2, "$165,000–$195,000 base"],
    ["f04", "atlas-cloud", "Strategy & Operations Manager, Cloud Sales", "Seattle, WA", "Corporate strategy", 21, 2, null],
    ["f05", "lumen-robotics", "Business Operations Lead (MBA)", "Pittsburgh, PA", "Operations / supply chain", null, 11, "$145,000 base + equity"],
    ["f06", "fernpay", "MBA Product Manager – Payments", "New York, NY", "Product management", 5, 3, "$170,000–$190,000 base", { visa: ["limited", "CPT and OPT are supported for this role."] }],
    ["f07", "fernpay", "Corporate Development Associate (MBA 2027)", "New York, NY", "Company finance / BD", 30, 0, null],
    ["f08", "orbitra-space", "MBA Leadership Development Program – Finance", "Denver, CO", "Gen mgmt / leadership programs", 18, 8, "$140,000 base", { visa: ["no", "Must be a U.S. person under export-control regulations (ITAR)."] }],
    ["f09", "maple-mobility", "Senior Strategy Associate – New Markets", "Austin, TX", "Corporate strategy", 26, 4, null],
    ["f10", "cedar-health", "Commercial Leadership Program (MBA 2027)", "Chicago, IL", "Gen mgmt / leadership programs", 3, 13, "$155,000 base + sign-on", { visa: ["no", "Applicants must be authorized to work in the US without current or future visa sponsorship."] }],
    ["f11", "cedar-health", "Associate Director, Market Access Strategy", "Chicago, IL", "Corporate strategy", 40, 0, null, { opensInDays: 12 }],
    ["f12", "bright-basket", "Associate Brand Manager (MBA 2027)", "Minneapolis, MN", "Marketing", 12, 5, "$135,000–$145,000 base"],
    ["f13", "bright-basket", "Finance Leadership Program – Senior Analyst", "Minneapolis, MN", "Company finance / BD", 12, 5, null],
    ["f14", "pinecrest-bank", "Digital Product Manager, Consumer Banking (MBA)", "Charlotte, NC", "Product management", 1, 15, "$150,000 base", { track: "tech", segment: "Product & digital at corporates" }],
    ["f15", "harbor-media", "Strategy Manager – Streaming (Post-MBA)", "Los Angeles, CA", "Corporate strategy", null, 9, null],
    ["f16", "solace-energy", "MBA Rotational Program – Commercial Strategy", "Houston, TX", "Gen mgmt / leadership programs", 23, 7, "$150,000 base"],
    ["f17", "tidewater-retail", "Senior Manager, Merchandising (MBA)", "Bentonville, AR", "Operations / supply chain", 8, 3, null],
    ["f18", "tidewater-retail", "Senior Product Manager – eCommerce (MBA)", "Bentonville, AR", "Product management", 8, 1, "$160,000 base", { track: "tech", segment: "Product & digital at corporates" }],
  ];

  const roles = {}, visa = {}, jd = {};
  for (const [id, ck, title, location, fn, dDays, seenAgo, pay, x = {}] of R) {
    const c = companies[ck];
    const dl = dDays === null ? null : due(dDays);
    roles[id] = {
      company: c.name, companyKey: ck, track: x.track || c.track, segment: x.segment || c.segment, function: fn,
      title, location, season: "Full-time 2027", type: "Full Time", mbaExplicit: true, notes: "",
      deadline: dl ? ymd(dl.getTime() - 6 * 3600000) : null, deadlineAt: dl ? iso(dl) : null,
      opensAt: x.opensInDays ? iso(now + x.opensInDays * DAY) : null,
      sources: ["company"], boothUrl: null, linkedinUrl: null, companyUrl: "https://example.com/careers/" + id,
      firstSeen: ymd(now - seenAgo * DAY), open: true,
    };
    if (x.visa) visa[id] = { status: x.visa[0], quote: x.visa[1], source: "Job description" };
    jd[id] = {
      text: `${title} at ${c.name} (fictional sample posting)\n\nAbout the role\n• Own a core part of the business and lead cross-functional teams from day one\n• Turn customer, market and financial analysis into decisions and plans\n• Report to a senior leader, with a clear path to people management\n\nWhat you need\n• MBA from a full-time program, graduating in 2027\n• 3+ years of pre-MBA work experience\n• Strong analytical, communication and leadership skills` + (x.visa ? `\n\n${x.visa[1]}` : ""),
      source: "Company careers site", capturedAt: ymd(now - seenAgo * DAY), pay,
    };
  }

  // [id, companyKey, name, kind, format, place, starts in days, Central start hour, hours long]
  const E = [
    ["e1", "northwind-analytics", "Product leadership info session", "Info session", "Virtual", "Zoom", 3, 12, 1],
    ["e2", "cedar-health", "Commercial Leadership Program coffee chats", "Coffee chats", "In person", "Harper Center", 5, 16, 2],
    ["e3", "bright-basket", "Brand management case workshop", "Workshop", "In person", "Gleacher Center", 8, 18, 2],
    ["e4", "fernpay", "Meet the product team", "Networking", "Virtual", "Zoom", 11, 17, 1],
  ];
  const events = {};
  for (const [id, ck, name, kind, format, place, d, h, len] of E) {
    const c = companies[ck], s = at(d, h);
    events[id] = { company: c.name, companyKey: ck, track: c.track, name, kind, format, place,
      startAt: iso(s), endAt: iso(s + len * 3600000), target: "Class of 2027", boothUrl: null, firstSeen: ymd(now - 2 * DAY) };
  }

  const recent = Object.entries(roles).filter(([, r]) => r.firstSeen >= ymd(now - 3 * DAY));
  const changes = {
    a1: { at: iso(now - 10 * DAY), source: "Company-site check", added: [] },
    a2: { at: iso(now - 12 * 3600000), source: "Career portal + LinkedIn refresh",
      added: recent.map(([id, r]) => ({ id, company: r.company, title: r.title, track: r.track })) },
  };
  const meta = { sync: { boothAt: iso(now - 5 * 3600000), boothStatus: "ok", linkedinAt: iso(now - 5 * 3600000), linkedinStatus: "ok", coRunAt: iso(now - 9 * 3600000) } };

  const shared = { companies, roles, visa, jd, events, changes, meta };
  const LS = "demo-ft-user-v1";
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
  const user = { id: async () => "demo-user", email: async () => "" };
  const downloads = {
    save: async ({ filename, data }) => {
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([data], { type: "text/csv" })); a.download = filename;
      document.body.appendChild(a); a.click(); a.remove(); return { status: "saved" };
    },
  };
  window.claude = { use: async (name) => ({ db, user, downloads })[name] || null };
})();
