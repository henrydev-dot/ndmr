export async function api(url: string, options?: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Bir hata oluştu, lütfen tekrar deneyin");
  }
  return data;
}

export function apiSend(url: string, method: string, body: any): Promise<any> {
  return api(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Dosya yüklenemedi");
  return data.url;
}

export function fmtDate(value: string | Date | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export function fmtDateTime(value: string | Date | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return (
    d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  );
}

export function slugify(text: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function moveItem<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const target = index + dir;
  if (target < 0 || target >= next.length) return next;
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next;
}
