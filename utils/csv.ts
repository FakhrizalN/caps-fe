export function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = splitCSVLine(lines[0]);
  const out: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = splitCSVLine(lines[i]);
    if (parts.length === 0) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = parts[j] ?? "";
    }
    out.push(obj);
  }
  return out;
}

function splitCSVLine(line: string) {
  const res: string[] = [];
  let cur = "";
  let inQ = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      res.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  res.push(cur);
  return res.map((s) => s.trim());
}

export function isNumericColumn(
  parsed: Array<Record<string, string>>,
  col: string
) {
  let count = 0;
  for (let i = 0; i < Math.min(30, parsed.length); i++) {
    const v = parsed[i][col];
    if (v === undefined || v === "") return false;
    if (!Number.isNaN(Number(v))) count++;
  }
  return count > 0;
}
