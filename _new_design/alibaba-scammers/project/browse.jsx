// Browse / search page.

function Browse({navigate, initialQuery}) {
  const [q, setQ] = React.useState(initialQuery || "");
  const [industry, setIndustry] = React.useState("All");
  const [sort, setSort] = React.useState("recent");

  const filtered = React.useMemo(() => {
    let list = window.REPORTS;
    if (industry !== "All") list = list.filter(r => r.industry === industry);
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(
        r =>
          r.sellerName.toLowerCase().includes(needle) ||
          r.productName.toLowerCase().includes(needle) ||
          r.snippet.toLowerCase().includes(needle) ||
          r.industry.toLowerCase().includes(needle)
      );
    }
    list = [...list];
    if (sort === "recent") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === "biggest") list.sort((a, b) => b.totalPaid - a.totalPaid);
    return list;
  }, [q, industry, sort]);

  const industries = ["All", ...new Set(window.REPORTS.map(r => r.industry))];

  return (
    <div className="page">
      <section style={{paddingTop: 56, paddingBottom: 30, borderBottom: "1px solid var(--line)"}}>
        <div className="container">
          <h1 style={{fontSize: "clamp(32px, 4.5vw, 48px)", letterSpacing: "-.03em", marginTop: 10, lineHeight: 1.05}}>
            {window.REPORTS.length} reports of bad{" "}
            <span className="marker" style={{fontFamily: "var(--serif)", fontStyle: "italic", fontWeight: 600}}>
              Alibaba
            </span>{" "}
            deals.
          </h1>
          <p className="muted" style={{fontSize: 17, marginTop: 12, maxWidth: 600}}>
            Search before you wire.
          </p>
          <div style={{marginTop: 24}}>
            <window.SearchBox defaultValue={q} onSubmit={setQ} placeholder="Search by seller name, product, or keyword..." />
          </div>
          <div style={{display: "flex", gap: 10, alignItems: "center", marginTop: 18, flexWrap: "wrap"}}>
            <span className="muted small" style={{marginRight: 4}}>
              Industry:
            </span>
            {industries.map(i => (
              <button
                key={i}
                onClick={() => setIndustry(i)}
                className="chip"
                style={{
                  cursor: "pointer",
                  background: industry === i ? "var(--ink)" : "var(--bg-2)",
                  color: industry === i ? "#fff" : "var(--ink-2)",
                  borderColor: industry === i ? "var(--ink)" : "var(--line-2)"
                }}
              >
                {i}
              </button>
            ))}
            <span style={{flex: 1}} />
            <span className="muted small">Sort:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} className="select" style={{width: "auto", padding: "6px 10px", fontSize: 13}}>
              <option value="recent">Most recent</option>
              <option value="biggest">Biggest loss</option>
            </select>
          </div>
        </div>
      </section>

      <section style={{paddingTop: 30, paddingBottom: 60}}>
        <div className="container">
          <div className="muted small" style={{marginBottom: 16}}>
            {filtered.length} {filtered.length === 1 ? "report" : "reports"}
            {q ? (
              <>
                {" "}
                matching <strong style={{color: "var(--ink)"}}>&ldquo;{q}&rdquo;</strong>
              </>
            ) : null}
            {industry !== "All" ? (
              <>
                {" "}
                in <strong style={{color: "var(--ink)"}}>{industry}</strong>
              </>
            ) : null}
          </div>
          {filtered.length === 0 ? (
            <div style={{padding: "60px 20px", textAlign: "center", background: "var(--card)", border: "1px dashed var(--line-2)", borderRadius: 16}}>
              <p style={{fontSize: 16, color: "var(--ink-2)"}}>No reports match this search.</p>
              <p className="muted small" style={{marginTop: 6}}>
                That&rsquo;s good news for you. Submit one if you have one to share.
              </p>
              <button className="btn btn-accent" style={{marginTop: 16}} onClick={() => navigate("submit")}>
                Share Your Story
              </button>
            </div>
          ) : (
            <div className="stack" style={{gap: 12}}>
              {filtered.map(r => (
                <window.ReportRow key={r.id} report={r} onOpen={() => navigate({name: "detail", id: r.id})} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

window.Browse = Browse;
