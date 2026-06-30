export function formatMoney(minor: number, _currency = "MMK", locale = "en-US") {
  const major = minor / 100;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(major)} MMK`;
}
