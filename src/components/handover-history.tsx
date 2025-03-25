import { Clock, SendHorizontal, UserCheck } from "lucide-react";
import moment from "moment";

interface Handover {
  workerId: string;
  workerName: string;
  fromSupervisor: string;
  toSupervisor: string;
  fromProject: string;
  toProject: string;
  date: { toDate: () => Date };
}

interface HandoverHistoryProps {
  incomingHandovers: Handover[];
  outgoingHandovers: Handover[];
}

export default function HandoverHistory({
  incomingHandovers,
  outgoingHandovers,
}: HandoverHistoryProps) {
  const HandoverCard = ({
    handover,
    type,
  }: {
    handover: Handover;
    type: "incoming" | "outgoing";
  }) => (
    <div
      style={{
        background: "rgba(30, 30, 40, 0.5)",
        borderRadius: "0.5rem",
        padding: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.05)",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
        <div
          style={{
            padding: "0.5rem",
            background:
              type === "incoming"
                ? "rgba(132, 204, 22, 0.1)"
                : "rgba(220, 20, 60, 0.1)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {type === "incoming" ? (
            <UserCheck size={20} color="rgb(132, 204, 22)" />
          ) : (
            <SendHorizontal size={20} color="rgb(220, 20, 60)" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
            {handover.workerName}
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              {type === "incoming" ? "From" : "To"}:{" "}
              {type === "incoming"
                ? handover.fromSupervisor
                : handover.toSupervisor}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              Project Change: {handover.fromProject} → {handover.toProject}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.8rem",
                color: "#94a3b8",
              }}
            >
              <Clock size={14} />
              {moment(handover.date.toDate()).format("DD/MM/YY hh:mm A")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Incoming Handovers */}
      <div>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Incoming Workers
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {incomingHandovers.length > 0 ? (
            incomingHandovers.map((handover) => (
              <HandoverCard
                key={`${handover.workerId}-${handover.date}`}
                handover={handover}
                type="incoming"
              />
            ))
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              No incoming handovers
            </p>
          )}
        </div>
      </div>

      {/* Outgoing Handovers */}
      <div>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Outgoing Workers
        </h2>
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {outgoingHandovers.length > 0 ? (
            outgoingHandovers.map((handover) => (
              <HandoverCard
                key={`${handover.workerId}-${handover.date}`}
                handover={handover}
                type="outgoing"
              />
            ))
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              No outgoing handovers
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
