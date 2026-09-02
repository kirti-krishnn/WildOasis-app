import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./DurationChart.module.css";

function DurationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{item.name}</p>
      <p className={styles.tooltipValue}>{item.value} stays</p>
    </div>
  );
}

export default function DurationChart({ data = [] }) {
  return (
    <section className={styles.chartBox}>
      <h3 className={styles.heading}>Stay duration summary</h3>
      {data.length === 0 ? (
        <p className={styles.empty}>No confirmed stays in this period.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              nameKey="duration"
              dataKey="value"
              cx="40%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.duration}
                  fill={entry.color}
                  stroke={entry.color}
                />
              ))}
            </Pie>
            <Tooltip content={<DurationTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              width="34%"
              iconType="circle"
              formatter={(value) => <span className={styles.legendText}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
