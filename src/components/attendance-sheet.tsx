import { FileDown, LoaderCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import CustomDropdown from "./custom-dropdown";

interface AttendanceSheetProps {
  workers: any[];
  projectCode: string;
  onMarkAttendance: (
    workerId: string,
    status: string,
    hours?: number,
    remarks?: string
  ) => void;
  logs: any[];
  exporting?: boolean;
  onExport?: () => void;
  onRefreshLogs: () => Promise<void>;
}

export default function AttendanceSheet({
  workers,
  logs = [],
  exporting = false,
  onExport,
  onRefreshLogs,
}: AttendanceSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM"));

  // Filter logs based on search, worker, and date
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search query filter
      const matchesSearch =
        log.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.projectCode || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Worker filter
      const matchesWorker = selectedWorker ? log.workerId === selectedWorker : true;

      // Date filter
      const logDate = moment(log.date.toDate());
      const selectedMoment = moment(selectedDate);
      const matchesDate =
        logDate.isSame(selectedMoment, "month") &&
        logDate.isSame(selectedMoment, "year");

      return matchesSearch && matchesWorker && matchesDate;
    });
  }, [logs, searchQuery, selectedWorker, selectedDate]);

  useEffect(() => {
    onRefreshLogs();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "1rem",
          background: "rgba(30, 30, 40, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(40, 40, 50, 0.5)",
            padding: "0.25rem 0.75rem",
            borderRadius: "1rem",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1rem",
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
          {onExport && (
            <button
              onClick={onExport}
              disabled={exporting}
              style={{
                padding: "0.65rem 1.25rem",
                background: "rgba(40, 40, 50, 0.5)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                opacity: exporting ? 0.5 : 1,
                cursor: exporting ? "not-allowed" : "pointer",
              }}
            >
              {exporting ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <FileDown color="lightgreen" size={18} />
              )}
              
            </button>
          )}
        </div>

        

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <CustomDropdown
            value={selectedWorker}
            onChange={setSelectedWorker}
            options={[
              { value: "", label: "All Workers" },
              ...workers.map((worker) => ({
                value: worker.id,
                label: worker.name,
              })),
            ]}
            placeholder="Filter by Worker"
          />

          <input
            type="month"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: "rgba(40, 40, 50, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "0.5rem",
              color: "white",
              padding: "0 0.75rem",
              height: "2.5rem",
            }}
          />

          
        </div>
      </div>

      {/* Logs list */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
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
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                      {log.workerName}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span>
                        {moment(log.date.toDate()).format("DD MMM YYYY, hh:mm A")}
                      </span>
                      •
                      <span style={{ textTransform: "capitalize" }}>
                        {log.status}
                      </span>
                      {log.hours > 0 && (
                        <>
                          •<span>{log.hours} hours</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              No logs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
