import json
from datetime import datetime
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]   # 프로젝트 루트
XLSX = ROOT / "ipma_data.xlsx"

OUT_BOOKS = ROOT / "data" / "books.json"
OUT_VERIFY = ROOT / "data" / "verify.json"

def today_kst_str():
    # 간단히 날짜 문자열만 사용 (KST 정확 시각은 필요 없음)
    return datetime.now().strftime("%Y-%m-%d")

def read_sheet(name: str) -> pd.DataFrame:
    if not XLSX.exists():
        raise FileNotFoundError(f"엑셀 파일이 없습니다: {XLSX}")
    df = pd.read_excel(XLSX, sheet_name=name, dtype=str).fillna("")
    # 공백 정리
    df.columns = [c.strip() for c in df.columns]
    for c in df.columns:
        df[c] = df[c].astype(str).map(lambda x: x.strip())
    return df

def toc_to_list(toc_str: str):
    # 엑셀 셀에 줄바꿈으로 목차 입력 -> 리스트로 변환
    lines = [line.strip() for line in str(toc_str).splitlines()]
    return [x for x in lines if x]

def make_books_json(df: pd.DataFrame):
    required = ["id","title","subtitle","series","category","format","edition","version",
                "publish_date","publisher","cover","summary","toc","verification_code_example"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"[books] 시트에 컬럼이 누락됐습니다: {missing}")

    books = []
    for _, r in df.iterrows():
        if not r["id"]:
            continue
        books.append({
            "id": r["id"],
            "title": r["title"],
            "subtitle": r["subtitle"],
            "series": r["series"],
            "category": r["category"],
            "format": r["format"],
            "edition": r["edition"],
            "version": r["version"],
            "publish_date": r["publish_date"],
            "publisher": r["publisher"] or "IPMA Publishing",
            "cover": r["cover"] or "../assets/images/placeholders/cover-default.jpg",
            "summary": r["summary"],
            "toc": toc_to_list(r["toc"]),
            "verification_code_example": r["verification_code_example"]
        })

    payload = {
        "updated": today_kst_str(),
        "books": books
    }
    OUT_BOOKS.parent.mkdir(parents=True, exist_ok=True)
    OUT_BOOKS.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ 생성 완료: {OUT_BOOKS} (총 {len(books)}권)")

def make_verify_json(df: pd.DataFrame):
    required = ["code","status","title","edition","version","publish_date","publisher",
                "series","book_url","notes"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"[verify] 시트에 컬럼이 누락됐습니다: {missing}")

    recs = []
    for _, r in df.iterrows():
        if not r["code"]:
            continue
        recs.append({
            "code": r["code"],
            "status": r["status"] or "valid",
            "title": r["title"],
            "edition": r["edition"],
            "version": r["version"],
            "publish_date": r["publish_date"],
            "publisher": r["publisher"] or "IPMA Publishing",
            "series": r["series"],
            "book_url": r["book_url"],
            "notes": r["notes"]
        })

    payload = {
        "updated": today_kst_str(),
        "records": recs
    }
    OUT_VERIFY.parent.mkdir(parents=True, exist_ok=True)
    OUT_VERIFY.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✅ 생성 완료: {OUT_VERIFY} (총 {len(recs)}건)")

def main():
    books_df = read_sheet("books")
    verify_df = read_sheet("verify")
    make_books_json(books_df)
    make_verify_json(verify_df)

if __name__ == "__main__":
    main()
