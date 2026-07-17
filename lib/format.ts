const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(value: number): string {
  return clp.format(value);
}

/** "5 × 3,5 m" con coma decimal chilena y sin decimales innecesarios. */
export function formatMeters(value: number): string {
  return value.toLocaleString("es-CL", { maximumFractionDigits: 2 });
}

export function formatDims(length: number, width: number): string {
  return `${formatMeters(length)} × ${formatMeters(width)} m`;
}
