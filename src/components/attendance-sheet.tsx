import { Check, CheckCircle, Search } from "lucide-react";
import { useState } from "react";
import DefaultDialog from "./default-dialog";

interface AttendanceSheetProps {
  workers: any[];
  projectCode: string;
  onMarkAttendance: (workerId: string, status: string, hours?: number) => void;
}

export default function AttendanceSheet({
  workers,

  onMarkAttendance,
}: AttendanceSheetProps) {
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [hours, setHours] = useState<string>("9");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(false);

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWorker = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handlePostClick = () => {
    setConfirmDialog(true);
  };

  const handleBulkAttendance = () => {
    selectedWorkers.forEach((workerId) => {
      onMarkAttendance(workerId, "present", Number(hours));
    });
    setSelectedWorkers([]);
    setConfirmDialog(false);
  };

  const handleSelectAll = () => {
    if (selectedWorkers.length === filteredWorkers.length) {
      // If all filtered workers are selected, deselect all
      setSelectedWorkers([]);
    } else {
      // Select all filtered workers
      setSelectedWorkers(filteredWorkers.map((worker) => worker.id));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          background: "rgba(30, 30, 40, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        {/* Search Bar */}
        <div style={{ padding: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(40, 40, 50, 0.5)",
              padding: "0.25rem 1rem",
              borderRadius: "0.5rem",
            }}
          >
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Hours and Selection Controls in one line */}
        <div style={{ padding: "0 1rem 1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <button
              onClick={handleSelectAll}
              style={{
                padding: "0.45rem 1rem",
                fontSize: "0.8rem",
                color: "#94a3b8",
                background: "rgba(40, 40, 50, 0.5)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                cursor: "pointer",
                height: "36px",
              }}
            >
              <CheckCircle color="crimson" strokeWidth={3} size={16} />
              Selected {selectedWorkers.length}
              {filteredWorkers.length > 0 && (
                <span style={{ color: "crimson", fontWeight: "bold" }}>
                  {selectedWorkers.length === filteredWorkers.length
                    ? " Deselect All"
                    : " Select All"}
                </span>
              )}
            </button>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <span style={{ marginLeft: "0.5rem", fontSize: "0.9rem" }}>
                hours
              </span>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                style={{
                  width: "3rem",
                  height: "36px",
                  background: "rgba(100 100 100/ 20%)",
                  border: "2px solid crimson",
                  borderRadius: "0.375rem",
                  padding: "0 0.75rem",
                  fontWeight: "medium",
                  animation:
                    selectedWorkers.length > 0
                      ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                      : "none",
                }}
                min="1"
                max="12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            paddingBottom: selectedWorkers.length > 0 ? "5rem" : "0",
          }}
        >
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              onClick={() => toggleWorker(worker.id)}
              style={{
                padding: "1rem",
                background: selectedWorkers.includes(worker.id)
                  ? "rgba(220, 20, 60, 0.1)"
                  : "rgba(30, 30, 40, 0.5)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                border: selectedWorkers.includes(worker.id)
                  ? "1px solid rgba(220, 20, 60, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                    {worker.name}
                  </h3>
                  {/* <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {worker.company}
                  </p> */}
                </div>
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    borderRadius: "50%",
                    background: selectedWorkers.includes(worker.id)
                      ? "rgba(220, 20, 60, 0.2)"
                      : "rgba(100, 100, 100, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedWorkers.includes(worker.id) && <Check size={14} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Post Attendance Button */}
      {selectedWorkers.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "1rem",
            background: "rgba(30, 30, 40, 0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            zIndex: 50,
          }}
        >
          <button
            onClick={handlePostClick}
            style={{
              width: "100%",
              padding: "1rem",
              background: "crimson",
              borderRadius: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            Post Attendance ({selectedWorkers.length})
          </button>
        </div>
      )}

      <DefaultDialog
        title="Confirm Attendance"
        open={confirmDialog}
        onCancel={() => setConfirmDialog(false)}
        onOk={handleBulkAttendance}
        OkButtonText="Post"
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                padding: "1rem",
                background: "rgba(100, 100, 100, 0.1)",
                borderRadius: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  Workers Selected:
                </span>
                <span style={{ color: "white", fontWeight: "500" }}>
                  {selectedWorkers.length}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  Hours:
                </span>
                <span style={{ color: "crimson", fontWeight: "500" }}>
                  {hours}
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "1rem",
                background: "rgba(220, 20, 60, 0.1)",
                border: "1px solid rgba(220, 20, 60, 0.3)",
                borderRadius: "0.5rem",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                ⚠️ This action will mark attendance for all selected workers.
                Please verify the hours before proceeding.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}

<style>
  {`
    @keyframes pulse {
      0%, 100% {
        border-color: rgb(220, 20, 60);
      }
      50% {
        border-color: rgba(220, 20, 60, 0.3);
      }
    }
  `}
</style>;
