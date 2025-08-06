import { BriefcaseBusiness, SquareArrowUpRight } from "lucide-react";

interface WorkerCardProps {
  worker: any;
  selected?: boolean;
  onHandover: () => void;
  selectionMode?: boolean;
}

export default function WorkerCard({
  worker,
  onHandover,
  selectionMode,
}: WorkerCardProps) {
  return (
    
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
            onClick={onHandover}
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
    
  );
}
