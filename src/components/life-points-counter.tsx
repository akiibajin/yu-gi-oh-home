import { cn } from "@/lib/utils";
import { CircleGaugeIcon } from "lucide-react";
import type { ComponentProps } from "preact";

export type LifePointsCounterProps = {
	value: number;
	max: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	label?: string;
};

function clamp(n: number, min: number, max: number) {
	return Math.min(max, Math.max(min, n));
}

function colorForPercent(percent: number) {
	if (percent >= 80) return "#10b9b6";
	if (percent > 50) return "#22c55e";
	if (percent > 25) return "#facc15";
	return "#ef4444";
}

function degToRad(deg: number) {
	return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
	const a = degToRad(angleDeg);
	return {
		x: cx + r * Math.cos(a),
		y: cy + r * Math.sin(a),
	};
}

export function LifePointsCounter({
	value,
	max,
	size = 88,
	strokeWidth = 14,
	className,
	label = "Life points",
}: LifePointsCounterProps) {
	const safeMax = max > 0 ? max : 1;
	const clamped = Math.max(0, value);
	const percent = (clamped / safeMax) * 100;
	const fillPercent = clamp(percent, 0, 100);
	const isOverMax = clamped > safeMax;
	const stroke = isOverMax ? "#a855f7" : colorForPercent(percent); // purple-500

	const cx = size / 2;
	const cy = size / 2;

	// Progress ring.
	const ringRadius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * ringRadius;
	const dashOffset = circumference * (1 - fillPercent / 100);

	// Decorative ticks ("rads") for visual styling only.
	const tickCount = 56;
	const startAngle = -90;
	const tickAngle = 360 / tickCount;
	const tickStrokeWidth = 1;
	const filledEndAngle = startAngle + (360 * fillPercent) / 100;
	const ringLabel = `${label}: ${clamped.toLocaleString()} of ${safeMax.toLocaleString()} (${Math.round(percent)}%)`;

	const borderWidth = Math.max(1.5, strokeWidth * 0.18);
	const outerBorderRadius = ringRadius + strokeWidth / 2 - borderWidth / 2;
	const innerBorderRadius = Math.max(
		1,
		ringRadius - strokeWidth / 2 + borderWidth / 2,
	);
	const tickInset = borderWidth + 0.5;
	const tickInnerRadius = Math.max(1, ringRadius - strokeWidth / 2 + tickInset);
	const tickOuterRadius = Math.max(
		tickInnerRadius,
		ringRadius + strokeWidth / 2 - tickInset,
	);

	return (
		<div
			className={cn(
				"relative bg-transparent inline-grid place-items-center",
				className,
			)}
			style={{ width: size, height: size }}
			role="img"
			aria-label={ringLabel}
		>
			<div className="pointer-events-none rounded-full bg-black absolute inset-0 flex flex-col items-center justify-center gap-1 ">
				<div className="text-center text-white leading-none">
					<div className="text-3xl md:text-6xl font-bold tabular-nums">
						{clamped.toLocaleString()}
					</div>
					<div className="text-white text-base tabular-nums">
						/{safeMax.toLocaleString()}
					</div>
				</div>
				<CircleGaugeIcon size={24} className="text-white" />
			</div>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="block z-2"
			>
				<title>{ringLabel}</title>

				{/* Background track (missing section) */}
				<circle
					cx={cx}
					cy={cy}
					r={ringRadius}
					fill="none"
					stroke="#000"
					strokeOpacity={1}
					strokeWidth={strokeWidth}
				/>

				{/* Progress arc (only the filled part is visible) */}
				<circle
					cx={cx}
					cy={cy}
					r={ringRadius}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
					strokeLinecap="inherit"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					transform={`rotate(-90 ${cx} ${cy})`}
					style={{
						transition: "stroke-dashoffset 200ms ease, stroke 200ms ease",
					}}
				/>

				{/* Silver borders (outer + inner edge of the ring) */}
				<circle
					cx={cx}
					cy={cy}
					r={outerBorderRadius}
					fill="none"
					stroke="#c0c0c0"
					strokeOpacity={0.9}
					strokeWidth={borderWidth}
				/>
				<circle
					cx={cx}
					cy={cy}
					r={innerBorderRadius}
					fill="none"
					stroke="#c0c0c0"
					strokeOpacity={0.9}
					strokeWidth={borderWidth}
				/>

				{/* Decorative radial ticks (visual only) */}
				<g>
					{Array.from({ length: tickCount }, (_, i) => {
						const angle = startAngle + i * tickAngle;
						if (angle >= filledEndAngle) return null;
						const p1 = polarToCartesian(cx, cy, tickInnerRadius, angle);
						const p2 = polarToCartesian(cx, cy, tickOuterRadius, angle);
						return (
							<line
								key={String(i)}
								x1={p1.x}
								y1={p1.y}
								x2={p2.x}
								y2={p2.y}
								stroke="#000"
								strokeWidth={tickStrokeWidth}
								strokeLinecap="round"
							/>
						);
					})}
				</g>
			</svg>
		</div>
	);
}

export type LifePointsCounterContainerProps = ComponentProps<"div">;
