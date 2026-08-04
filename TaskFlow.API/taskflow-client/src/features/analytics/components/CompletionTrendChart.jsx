import { useState } from "react";
import useTasks from "@/features/tasks/hooks/useTasks";

export default function CompletionTrendChart({ trendData = [] }) {
  const { tasks } = useTasks();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // If trendData is provided by API, use it; otherwise compute from global tasks
  let points = trendData;
  if (!points || points.length === 0) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const currentDayIdx = (now.getDay() + 6) % 7; // Mon = 0
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayIdx);

    points = days.map((dayLabel, idx) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + idx);

      const createdCount = tasks.filter((t) => {
        if (!t.createdDate && !t.dueDate) return false;
        const d = new Date(t.createdDate || t.dueDate);
        return d.toDateString() === targetDate.toDateString();
      }).length;

      const completedCount = tasks.filter((t) => {
        if (!t.isCompleted) return false;
        const d = new Date(t.completedDate || t.dueDate || t.createdDate);
        return d.toDateString() === targetDate.toDateString();
      }).length;

      return {
        date: targetDate.toISOString().slice(0, 10),
        day: dayLabel,
        created: createdCount,
        completed: completedCount,
      };
    });
  }

  const maxVal = Math.max(
    ...points.map((p) => Math.max(p.created || 0, p.completed || 0)),
    3
  );

  // Build SVG smooth path coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const count = points.length || 1;
  const stepX = (svgWidth - paddingX * 2) / Math.max(1, count - 1);

  const getCoordinates = (key) =>
    points.map((p, idx) => {
      const x = paddingX + idx * stepX;
      const val = p[key] || 0;
      const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - paddingY * 2);
      return { x, y, val };
    });

  const completedCoords = getCoordinates("completed");
  const createdCoords = getCoordinates("created");

  // Helper for Catmull-Rom or cubic Bezier smooth curves
  const buildSmoothPath = (coords) => {
    if (coords.length === 0) return "";
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cp1X = curr.x + (next.x - curr.x) / 2;
      const cp1Y = curr.y;
      const cp2X = curr.x + (next.x - curr.x) / 2;
      const cp2Y = next.y;
      path += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const completedLinePath = buildSmoothPath(completedCoords);
  const createdLinePath = buildSmoothPath(createdCoords);

  const completedAreaPath =
    completedCoords.length > 0
      ? `${completedLinePath} L ${completedCoords[completedCoords.length - 1].x} ${svgHeight - paddingY} L ${completedCoords[0].x} ${svgHeight - paddingY} Z`
      : "";

  const createdAreaPath =
    createdCoords.length > 0
      ? `${createdLinePath} L ${createdCoords[createdCoords.length - 1].x} ${svgHeight - paddingY} L ${createdCoords[0].x} ${svgHeight - paddingY} Z`
      : "";

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-3xl apple-shadow border border-outline-variant/10 flex flex-col min-h-[400px]">
      {/* Header & Legends */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm border-b border-outline-variant/10 pb-4 h-auto sm:h-8">
        <div>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">show_chart</span>
            Task Completion Trend
          </h3>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Daily volume of completed vs created tasks from SQL Server
          </p>
        </div>

        <div className="flex items-center gap-md">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-on-surface">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-xs font-semibold text-on-surface-variant">Created</span>
          </div>
        </div>
      </div>

      {/* SVG Smooth Area Chart */}
      <div className="flex-1 w-full flex flex-col justify-end pt-6 relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C084FC" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, i) => {
            const y = paddingY + pct * (svgHeight - paddingY * 2);
            return (
              <line
                key={i}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-outline-variant/10"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Created Tasks Area & Line */}
          <path d={createdAreaPath} fill="url(#createdGrad)" />
          <path
            d={createdLinePath}
            fill="none"
            stroke="#C084FC"
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Completed Tasks Area & Line */}
          <path d={completedAreaPath} fill="url(#completedGrad)" />
          <path
            d={completedLinePath}
            fill="none"
            stroke="#7C3AED"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Data Points & Interactive Circles */}
          {points.map((p, idx) => {
            const cPt = completedCoords[idx];
            const crPt = createdCoords[idx];
            const isHovered = hoveredIdx === idx;

            return (
              <g key={idx}>
                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={cPt.x}
                    y1={paddingY}
                    x2={cPt.x}
                    y2={svgHeight - paddingY}
                    stroke="#7C3AED"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-50"
                  />
                )}

                {/* Created Point */}
                <circle
                  cx={crPt.x}
                  cy={crPt.y}
                  r={isHovered ? 5 : 3.5}
                  className="fill-purple-400 stroke-white dark:stroke-gray-900 transition-all cursor-pointer"
                  strokeWidth="2"
                />

                {/* Completed Point */}
                <circle
                  cx={cPt.x}
                  cy={cPt.y}
                  r={isHovered ? 6 : 4}
                  className="fill-primary stroke-white dark:stroke-gray-900 transition-all cursor-pointer"
                  strokeWidth="2"
                />

                {/* Transparent trigger bar for hover */}
                <rect
                  x={cPt.x - stepX / 2}
                  y={0}
                  width={stepX}
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex items-center justify-between px-8 pt-3 text-[11px] font-bold text-on-surface-variant">
          {points.map((p, idx) => (
            <span
              key={idx}
              className={`transition-colors cursor-pointer ${
                hoveredIdx === idx ? "text-primary font-extrabold scale-110" : ""
              }`}
            >
              {p.day || p.date}
            </span>
          ))}
        </div>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute bg-on-surface text-surface px-3 py-2 rounded-xl text-xs font-semibold apple-shadow pointer-events-none z-30 transition-all duration-150 border border-white/10"
            style={{
              left: `${(hoveredIdx / Math.max(1, count - 1)) * 80 + 10}%`,
              top: "10%",
            }}
          >
            <p className="font-bold text-primary text-[11px]">
              {points[hoveredIdx].day || points[hoveredIdx].date}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Completed: {points[hoveredIdx].completed || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Created: {points[hoveredIdx].created || 0}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
