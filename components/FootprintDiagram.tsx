import { formatDims, formatMeters } from "@/lib/format";

type Props = {
  length_m: number;
  width_m: number;
  safety_margin_m: number;
};

/** Vista superior a escala: footprint del inflable + zona de seguridad. */
export default function FootprintDiagram({ length_m, width_m, safety_margin_m }: Props) {
  const S = 40; // px por metro
  const PAD = 8;
  const totalL = length_m + 2 * safety_margin_m;
  const totalW = width_m + 2 * safety_margin_m;
  const vbW = totalL * S + PAD * 2;
  const vbH = totalW * S + PAD * 2;
  const mx = PAD + safety_margin_m * S;
  const my = PAD + safety_margin_m * S;

  return (
    <svg
      viewBox={`0 0 ${vbW} ${vbH}`}
      className="w-full"
      role="img"
      aria-label={`Vista superior: inflable de ${formatDims(length_m, width_m)} más ${formatMeters(safety_margin_m)} m de margen por lado`}
    >
      {/* Zona de seguridad */}
      <rect
        x={PAD}
        y={PAD}
        width={totalL * S}
        height={totalW * S}
        rx={6}
        fill="#fb923c"
        fillOpacity={0.25}
        stroke="#f97316"
        strokeWidth={2}
        strokeDasharray="8 5"
      />
      {/* Footprint del inflable */}
      <rect
        x={mx}
        y={my}
        width={length_m * S}
        height={width_m * S}
        rx={4}
        fill="#38bdf8"
        fillOpacity={0.35}
        stroke="#0284c7"
        strokeWidth={2.5}
      />
      <text
        x={mx + (length_m * S) / 2}
        y={my + (width_m * S) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={17}
        fontWeight={700}
        fill="#075985"
      >
        {formatDims(length_m, width_m)}
      </text>
      <text
        x={mx + (length_m * S) / 2}
        y={PAD + (safety_margin_m * S) / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill="#c2410c"
      >
        margen de seguridad: {formatMeters(safety_margin_m)} m por lado
      </text>
    </svg>
  );
}
