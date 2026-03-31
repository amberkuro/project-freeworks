import { DELIVERY_STATUS_MAP } from "@/lib/constants";

export default function DeliveryBadge({ status }) {
  const info = DELIVERY_STATUS_MAP[status] || {
    label: status || "—",
    color: "#888",
    bg: "#f0f0f0",
  };

  return (
    <span
      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ color: info.color, background: info.bg }}
    >
      {info.label}
    </span>
  );
}
