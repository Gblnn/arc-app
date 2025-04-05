import { motion } from "framer-motion";
import { ArrowRight, RefreshCcw } from "lucide-react";
import moment from "moment";

interface Props {
  incomingHandovers: any[];
  outgoingHandovers: any[];
  onRefresh: () => void;
}

export default function HandoverHistory({
  incomingHandovers,
  outgoingHandovers,
  onRefresh,
}: Props) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          background: "rgba(30, 30, 40, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "1.1rem" }}>Handover History</h2>
        <button
          onClick={onRefresh}
          style={{
            padding: "0.5rem",
            background: "rgba(40, 40, 50, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RefreshCcw size={16} color="#94a3b8" />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Incoming Handovers */}
          <div>
            <h3
              style={{
                fontSize: "0.9rem",
                color: "#94a3b8",
                marginBottom: "1rem",
              }}
            >
              Incoming Handovers
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {incomingHandovers.length > 0 ? (
                incomingHandovers.map((handover) => (
                  <motion.div
                    key={handover.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: "1rem",
                      background: "rgba(30, 30, 40, 0.5)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h4 style={{ fontSize: "1rem" }}>
                        {handover.workerName}
                      </h4>
                      <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                        {moment(handover.date.toDate()).format("DD MMM YYYY")}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {handover.fromProject || "No Project"}{" "}
                      <ArrowRight size={14} />{" "}
                      {handover.toProject || "No Project"}
                    </p>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      From supervisor of {handover.fromProject}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p style={{ color: "#94a3b8", textAlign: "center" }}>
                  No incoming handovers
                </p>
              )}
            </div>
          </div>

          {/* Outgoing Handovers */}
          <div>
            <h3
              style={{
                fontSize: "0.9rem",
                color: "#94a3b8",
                marginBottom: "1rem",
              }}
            >
              Outgoing Handovers
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {outgoingHandovers.length > 0 ? (
                outgoingHandovers.map((handover) => (
                  <motion.div
                    key={handover.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: "1rem",
                      background: "rgba(30, 30, 40, 0.5)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h4 style={{ fontSize: "1rem" }}>
                        {handover.workerName}
                      </h4>
                      <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                        {moment(handover.date.toDate()).format("DD MMM YYYY")}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {handover.fromProject || "No Project"}{" "}
                      <ArrowRight size={14} />{" "}
                      {handover.toProject || "No Project"}
                    </p>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      To supervisor of {handover.toProject}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p style={{ color: "#94a3b8", textAlign: "center" }}>
                  No outgoing handovers
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
