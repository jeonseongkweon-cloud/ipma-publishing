(function () {
  const grid = document.querySelector("#catalogGrid");
  const meta = document.querySelector("#catalogMeta");
  if (!grid) return;

  const DATA_URL = "../data/books.json";

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  async function load() {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("books.json 로드 실패");
    return await res.json();
  }

  function card(b) {
    const href = `./book/?id=${encodeURIComponent(b.id)}`;
    const cover = b.cover || "../assets/images/placeholders/cover-default.jpg";
    const pub = b.publish_date && b.publish_date !== "TBD" ? b.publish_date : "발행 예정";
    return `
      <a class="item" href="${href}" style="display:block;">
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <img src="${esc(cover)}" alt="${esc(b.title)} 표지"
               style="width:74px; height:98px; object-fit:cover; border-radius:12px; border:1px solid rgba(255,255,255,.14); background:rgba(0,0,0,.25);" />
          <div style="min-width:0;">
            <h3 style="margin:0 0 6px; font-size:15px;">${esc(b.title)}</h3>
            <p style="margin:0; color:rgba(255,255,255,.72); font-size:12px; line-height:1.45;">
              ${esc(b.subtitle || "")}
            </p>
            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
              <span class="badge">${esc(b.series || "—")}</span>
              <span class="badge">${esc(b.edition || "—")}</span>
              <span class="badge">${esc(b.version || "—")}</span>
              <span class="badge">${esc(pub)}</span>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  (async () => {
    try {
      const data = await load();
      const books = data.books || [];
      grid.innerHTML = books.map(card).join("");
      if (meta) meta.textContent = `업데이트: ${data.updated || "-"} · 총 ${books.length}권`;
    } catch (e) {
      grid.innerHTML = `
        <div class="item">
          <h3 style="margin:0 0 6px;">목록 로딩 오류</h3>
          <p style="margin:0; color:rgba(255,255,255,.72); font-size:13px;">
            /data/books.json 경로 또는 파일을 확인해 주세요.
          </p>
        </div>
      `;
      if (meta) meta.textContent = "업데이트 정보를 불러오지 못했습니다.";
    }
  })();
})();
