export function formatThaiDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export function formatThaiDateLong(date: string | Date): string {
  return new Date(date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

export function formatTHB(amount: number): string {
  return `฿${amount.toLocaleString("th-TH")}`;
}
