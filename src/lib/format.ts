export function formatMoney(minor: number, currency = "MMK", locale = "en-US") {
  const major = minor / 100;
  if (currency === "MMK") {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(major)} MMK`;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(major);
}
