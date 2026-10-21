/*
 * Demo shim for the In-Quarter Internship Compiler: fictional part-time,
 * school-year internships, with your pipeline kept in this browser's
 * localStorage. Every company and role below is made up.
 */
(function () {
  if (window.claude && window.claude.use) return;
  const DAY = 86400000;
  const now = Date.now();
  const iso = (t) => new Date(t).toISOString();
  const ymd = (t) => new Date(t).toISOString().slice(0, 10);
  const due = (n) => { const d = new Date(now + n * DAY); d.setUTCHours(4, 59, 0, 0); d.setTime(d.getTime() + DAY); return d; };

  const companies = {
    "fernpay": { name: "FernPay", track: "tech", segment: "Fintech", aliases: ["fernpay"] },
    "quillstack": { name: "Quillstack", track: "tech", segment: "Software", aliases: ["quillstack"] },
    "tidepool-ai": { name: "Tidepool AI", track: "tech", segment: "Software", aliases: ["tidepool ai"] },
    "orbitly": { name: "Orbitly", track: "tech", segment: "eCommerce & internet", aliases: ["orbitly"] },
    "brightloop-health": { name: "Brightloop Health", track: "corporate", segment: "Healthcare", aliases: ["brightloop health"] },
    "northgate-foods": { name: "Northgate Foods", track: "corporate", segment: "CPG, food & retail", aliases: ["northgate foods"] },
    "lakeshore-energy": { name: "Lakeshore Energy", track: "corporate", segment: "Industrial, auto & energy", aliases: ["lakeshore energy"] },
  };
  // [id, company, title, location, workMode, quarter, hours, pay, function, deadline in days, first seen days ago]
  const R = [
    ["q1", "tidepool-ai", "GTM Strategy Fellow", "Remote (US)", "Remote", "One quarter", "10–15 hrs/wk", "$35/hr", "Company finance / BD", 12, 1],
    ["q2", "fernpay", "Strategy & Ops Intern (MBA, part-time)", "Remote", "Remote", "Fall–Winter 2026", "15–20 hrs/wk", "$45/hr", "Corporate strategy", 23, 2],
    ["q3", "quillstack", "Product Management Intern, In-Quarter", "Chicago, IL", "Chicago hybrid", "Winter 2027", "20 hrs/wk", "$40/hr", "Product management", 29, 6],
    ["q4", "quillstack", "Pricing Analytics Intern", "Remote", "Remote", "3–6 months from fall", "15 hrs/wk", "$38/hr", "Company finance / BD", 33, 8],
    ["q5", "orbitly", "Growth Marketing Intern (MBA)", "Chicago, IL", "Chicago on-site", "Spring 2027", "20 hrs/wk", null, "Marketing", 45, 4],
    ["q6", "brightloop-health", "Corporate Development Intern", "Chicago, IL", "Chicago hybrid", "Winter 2027", "20 hrs/wk", "$5,000 stipend", "Company finance / BD", 20, 9],
    ["q7", "northgate-foods", "Brand Strategy Intern, In-Quarter", "Chicago, IL", "Chicago hybrid", "Winter–Spring 2027", "15 hrs/wk", null, "Marketing", 41, 2],
    ["q8", "lakeshore-energy", "Energy Transition Strategy Intern", "Flexible", "Flexible location", "Fall 2026", "10 hrs/wk", "$30/hr", "Corporate strategy", 10, 12],
  ];
  const roles = {}, visa = {}, jd = {}, events = {};
  for (const [id, ck, title, location, workMode, quarter, hours, pay, fn, dDays, seenAgo] of R) {
    const c = companies[ck], dl = due(dDays);
    roles[id] = {
      company: c.name, companyKey: ck, track: c.track, segment: c.segment, function: fn, title, location,
      season: "In-quarter", type: "Part Time", inQuarter: true, quarter, workMode, hours, pay,
      mbaExplicit: true, notes: "", deadline: ymd(dl.getTime() - 6 * 3600000), deadlineAt: iso(dl),
      sources: ["booth"], boothUrl: null, firstSeen: ymd(now - seenAgo * DAY), open: true,
    };
    jd[id] = {
      text: `${title} at ${c.name} (fictional sample posting)\n\nWhat you'll do\n• Own a scoped project for the team during the school year, about ${hours || "15 hrs/wk"}\n• Analyze data and customer research, and turn it into recommendations\n• Present results to the leadership team at the end of the term\n\nWhat we're looking for\n• Current full-time MBA student able to work part-time during ${quarter}\n• Strong analytical and communication skills\n• Comfort working independently and remotely`,
      source: "School career portal", capturedAt: ymd(now - seenAgo * DAY), pay,
    };
  }
  const recent = Object.entries(roles).filter(([, r]) => r.firstSeen >= ymd(now - 3 * DAY));
  const changes = {
    a1: { at: iso(now - 12 * 3600000), source: "Copied from main board",
      added: recent.map(([id, r]) => ({ id, company: r.company, title: r.title, track: r.track })) },
  };
  const meta = { sync: { boothAt: iso(now - 5 * 3600000), boothStatus: "ok" } };
  const shared = { companies, roles, visa, jd, events, changes, meta };
  const LS = "demo-iq-user-v1";
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
