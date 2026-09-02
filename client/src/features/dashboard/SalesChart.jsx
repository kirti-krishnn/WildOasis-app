import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../bookings/bookingFormatters.js";
import styles from "./SalesChart.module.css";

const colors = {
  totalSales: {
    stroke: "#4f46e5",
    fill: "#4f46e5",
  },
  extrasSales: {
    stroke: "#14b8a6",
    fill: "#14b8a6",
  },
  text: "#d1d5db",
  grid: "#253041",
  tooltipBackground: "#111827",
  tooltipBorder: "#374151",
};

function getSalesTitle({ numDays, periodStart, periodEnd }) {
  if (!periodStart || !periodEnd) return `Sales from the last ${numDays} days`;

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endDate = new Date(periodEnd);
  endDate.setDate(endDate.getDate() - 1);

  return `Sales from ${formatter.format(new Date(periodStart))} - ${formatter.format(endDate)}`;
}

function SalesTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className={styles.tooltipValue}>
          <span style={{ backgroundColor: item.color }} />
          {item.name}: {formatCurrency(item.value)}
        </p>
      ))}
    </div>
  );
}

export default function SalesChart({ data = [], numDays, periodStart, periodEnd }) {
  return (
    <section className={styles.chartBox}>
      <h3 className={styles.heading}>{getSalesTitle({ numDays, periodStart, periodEnd })}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <XAxis
            dataKey="label"
            tick={{ fill: colors.text, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: colors.grid }}
          />
          <YAxis
            tick={{ fill: colors.text, fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
            width={72}
          />
          <CartesianGrid stroke={colors.grid} strokeDasharray="4" />
          <Tooltip content={<SalesTooltip />} />
          <Area
            dataKey="totalSales"
            name="Total sales"
            type="monotone"
            stroke={colors.totalSales.stroke}
            fill={colors.totalSales.fill}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Area
            dataKey="extrasSales"
            name="Extras sales"
            type="monotone"
            stroke={colors.extrasSales.stroke}
            fill={colors.extrasSales.fill}
            fillOpacity={0.24}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  );
}
