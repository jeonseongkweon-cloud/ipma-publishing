(function () {
  const $ = (sel) => document.querySelector(sel);

  const form = $("#verifyForm");
  const input = $("#verifyCode");
  const resultBox = $("#verifyResult");
  const resultTitle = $("#resultTitle");
  const resultTable = $("#resultTable");
  const resultNote = $("#resultNote");
  const resultBadge = $("#resultBadge");
  const quickLinks = $("#quickLinks");

  const DATA_URL = "../data/verify.json"; // verification/ 기준 상대경로

  function norm(code) {
    return String(code || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  function setBadge(type, text) {
    if (!resultBadge) return;
    resultBadge.textContent = text;
    resultBadge.style.borderColor =
      type === "valid"
        ? "rgba(61,220,151,.55)"
        : type === "hold"
        ? "rgba(215,184,106,.55)"
        : "rgba(255,107,107,.55)";
    resultBadge.style.background =
      type === "valid"
        ? "rgba(61,220,151,.10)"
        : type === "hold"
        ? "rgba(215,184,106,.10)"
        : "rgba(255,107,107,.10)";
  }

  function showEmpty() {
    resultBox.style.display = "none";
    if (quickLinks) quickLinks.style.display = "none";
  }

  function showNotFound(code) {
    resultBox.style.display = "block";
    resultTitle.textContent = "조회 결과";
    setBadge("invalid", "미등록/불일치");
    resultTable.innerHTML = `
      <tr><th>입력 코드</th><td><b>${code}</b></td></tr>
      <tr><th>상태</th><td>미등록 코드 또는 오기재</td></tr>
      <tr><th>안내</th><td>코드를 다시 확인하거나, 문의로 접수해 주세요.</td></tr>
    `;
    resultNote.textContent = "정본 확인은 ‘정확한 판(Edition) + 버전(Version) + 코드’의 일치로 판단합니다.";
    if (quickLinks) quickLinks.style.display = "flex";
  }

  function showRecord(rec, inputCode) {
    resultBox.style.display = "block";
    resultTitle.textContent = "조회 결과";
    setBadge(rec.status, rec.status === "valid" ? "정본(일치)" : rec.status === "hold" ? "등록 대기" : "불일치");

    const bookLink =
      rec.book_url && rec.book_url.trim()
        ? `<a class="pill" style="display:inline-flex" href="${rec.book_url}">도서 상세 보기</a>`
        : "";

    resultTable.innerHTML = `
      <tr><th>코드</th><td><b>${inputCode}</b></td></tr>
      <tr><th>서명</th><td>${rec.title || "-"}</td></tr>
      <tr><th>시리즈</th><td>${rec.series || "-"}</td></tr>
      <tr><th>판(Edition)</th><td><b>${rec.edition || "-"}</b></td></tr>
      <tr><th>버전(Version)</th><td><b>${rec.version || "-"}</b></td></tr>
      <tr><th>발행일</th><td>${rec.publish_date || "-"}</td></tr>
      <tr><th>발행처</th><td>${rec.publisher || "-"}</td></tr>
      <tr><th>바로가기</th><td>${bookLink || "-"}</td></tr>
    `;

    resultNote.textContent = rec.notes || "정본 확인은 ‘판/버전/발행일/코드’ 일치 기준으로 운영됩니다.";
    if (quickLinks) quickLinks.style.display = "flex";
  }

  async function loadData() {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("verify.json 로드 실패");
    return await res.json();
  }

  function setUrlParam(code) {
    const u = new URL(location.href);
    if (code) u.searchParams.set("code", code);
    else u.searchParams.delete("code");
    history.replaceState({}, "", u.toString());
  }

  async function runLookup(raw) {
    const code = norm(raw);
    if (!code) return showEmpty();

    input.value = code;
    setUrlParam(code);

    try {
      const data = await loadData();
      const rec = (data.records || []).find((r) => norm(r.code) === code);
      if (!rec) return showNotFound(code);
      return showRecord(rec, code);
    } catch (e) {
      resultBox.style.display = "block";
      resultTitle.textContent = "조회 오류";
      setBadge("invalid", "오류");
      resultTable.innerHTML = `
        <tr><th>안내</th><td>데이터를 불러오지 못했습니다. 경로/파일명을 확인해 주세요.</td></tr>
        <tr><th>예상 원인</th><td>/data/verify.json 누락 또는 경로 오류</td></tr>
      `;
      resultNote.textContent = "문제가 지속되면 contact 페이지로 문의해 주세요.";
      if (quickLinks) quickLinks.style.display = "flex";
    }
  }

  // 이벤트
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runLookup(input.value);
    });
  }

  // Enter 키 즉시 조회
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runLookup(input.value);
      }
    });
  }

  // URL 파라미터 ?code= 자동 조회
  const param = new URL(location.href).searchParams.get("code");
  if (param) runLookup(param);
  else showEmpty();
})();
