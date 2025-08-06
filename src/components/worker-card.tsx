import { BriefcaseBusiness, SquareArrowUpRight } from "lucide-react";

interface WorkerCardProps {
  worker: any;
  selected?: boolean;
  onHandover: () => void;
  selectionMode?: boolean;
  onClick?: () => void;
}

export default function WorkerCard({
  worker,
  onHandover,
  selectionMode,
  onClick,
  selected,
}: WorkerCardProps) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        padding: "1.25rem",
        background: selected ? "rgba(220, 20, 60, 0.15)" : "rgba(30, 30, 40, 0.5)",
        borderRadius: "1rem",
        border: selected ? "1px solid rgba(220, 20, 60, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
        transition: "all 0.2s ease",
        transform: selected ? "scale(1.02)" : "none",
        boxShadow: selected ? "0 8px 16px rgba(220, 20, 60, 0.15)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            {worker.name}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
              color: "#94a3b8",
            }}
          >
            <BriefcaseBusiness size={14} />
            {worker.projectCode || "Unassigned"}
          </div>
        </div>
        {!selectionMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHandover();
            }}
            style={{
              padding: "0.5rem",
              paddingLeft: "0.75rem",
              paddingRight: "0.75rem",
              background: "rgba(100, 100, 100, 0.2)",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
            }}
            title="Handover Worker"
          >
            Handover
            <SquareArrowUpRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
