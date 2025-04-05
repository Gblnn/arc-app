import { message } from "antd";
import {
  Check,
  CheckCircle,
  FileDown,
  LoaderCircle,
  Search,
} from "lucide-react";
import moment from "moment";
import { useMemo, useState, useEffect } from "react";
import CustomDropdown from "./custom-dropdown";
import DefaultDialog from "./default-dialog";

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
  onMarkAttendance,
  logs = [],
  exporting = false,
  onExport,
  onRefreshLogs,
}: AttendanceSheetProps) {
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [hours, setHours] = useState<string>("9");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [view, setView] = useState<"attendance" | "logs">("attendance");

  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM"));

  // const isMobile = window.innerWidth < 768;

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search query filter
      const matchesSearch =
        log.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.projectCode || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Worker filter
      const matchesWorker = selectedWorker
        ? log.workerId === selectedWorker
        : true;

      // Date filter
      const logDate = moment(log.date.toDate());
      const selectedMoment = moment(selectedDate);
      const matchesDate =
        logDate.isSame(selectedMoment, "month") &&
        logDate.isSame(selectedMoment, "year");

      return matchesSearch && matchesWorker && matchesDate;
    });
  }, [logs, searchQuery, selectedWorker, selectedDate]);

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

  const [absenteeRemarks, setAbsenteeRemarks] = useState<{
    [key: string]: string;
  }>({});

  const handleBulkAttendance = async () => {
    try {
      setUpdating(true);
      // Mark selected workers as present
      for (const workerId of selectedWorkers) {
        await onMarkAttendance(workerId, "present", Number(hours));
      }

      // Mark unselected workers as absent with remarks
      const unselectedWorkers = filteredWorkers.filter(
        (worker) => !selectedWorkers.includes(worker.id)
      );

      for (const worker of unselectedWorkers) {
        await onMarkAttendance(
          worker.id,
          "absent",
          0,
          absenteeRemarks[worker.id] || ""
        );
      }

      setSelectedWorkers([]);
      setAbsenteeRemarks({});
      setConfirmDialog(false);

      await onRefreshLogs();
    } catch (error) {
      console.error("Error posting attendance:", error);
      message.error("Failed to post attendance");
    } finally {
      setUpdating(false);
    }
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

  const useWindowSize = () => {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
  };

  const windowWidth = useWindowSize();

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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          {/* View Toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "rgba(40, 40, 50, 0.5)",
                padding: "0.25rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <button
                onClick={() => setView("attendance")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  background:
                    view === "attendance"
                      ? "rgba(30, 30, 40, 0.95)"
                      : "transparent",
                  color: view === "attendance" ? "white" : "#94a3b8",
                  transition: "all 0.2s ease",
                }}
              >
                Attendance
              </button>
              <button
                onClick={() => setView("logs")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  background:
                    view === "logs" ? "rgba(30, 30, 40, 0.95)" : "transparent",
                  color: view === "logs" ? "white" : "#94a3b8",
                  transition: "all 0.2s ease",
                }}
              >
                Logs
              </button>
            </div>
          </div>

          {/* Search Bar and Export Button */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "rgba(40, 40, 50, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.5rem",
                  color: "white",
                }}
              />
              <Search
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                }}
                size={18}
              />
            </div>

            {/* Hours input with label */}

            {view === "logs" && onExport && (
              <button
                onClick={onExport}
                disabled={exporting}
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                  background: "rgba(40, 40, 50, 0.5)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  height: "3rem",
                  gap: "0.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: exporting ? "not-allowed" : "pointer",
                }}
              >
                {exporting ? (
                  <LoaderCircle className="animate-spin" size={18} />
                ) : (
                  <FileDown color="lightgreen" size={18} />
                )}
                <span className="hidden sm:inline">Export</span>
              </button>
            )}
          </div>

          {/* Select Workers Button and Hours Input - Only in attendance view */}
          {view === "attendance" && (
            <div
              style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
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
                <span>
                  Selected {selectedWorkers.length}
                  {filteredWorkers.length > 0 && (
                    <span
                      style={{
                        color: "crimson",
                        fontWeight: "bold",
                        marginLeft: "0.25rem",
                      }}
                    >
                      {selectedWorkers.length === filteredWorkers.length
                        ? "Deselect All"
                        : "Select All"}
                    </span>
                  )}
                </span>
              </button>

              {/* Hours input with label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginLeft: "auto",
                }}
              >
                <label
                  style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                  }}
                >
                  Hours
                </label>
                <input
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  min="1"
                  max="24"
                  style={{
                    width: windowWidth >= 768 ? "5rem" : "3rem",
                    height: "2rem",
                    padding: "0.75rem",
                    background: "rgba(40, 40, 50, 0.5)",
                    border: "2px solid crimson",
                    borderRadius: "0.5rem",
                    color: "white",
                    textAlign: "center",
                    animation:
                      selectedWorkers.length > 0 ? "pulse 2s infinite" : "none",
                  }}
                  placeholder="Hours"
                />
              </div>
            </div>
          )}

          {/* Logs Filters - Only in logs view */}
          {view === "logs" && (
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <CustomDropdown
                  value={selectedWorker}
                  onChange={setSelectedWorker}
                  options={workers.map((w) => ({
                    value: w.id,
                    label: w.name,
                  }))}
                  placeholder="Select Worker"
                />
              </div>
              <input
                type="month"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: "0.5rem",
                  background: "rgba(40, 40, 50, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.5rem",
                  color: "white",
                  minWidth: "150px",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {view === "attendance" ? (
          <div style={{ padding: "1rem" }}>
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
                      <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                        {worker.projectCode || "No Project"}
                      </p>
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
                      {selectedWorkers.includes(worker.id) && (
                        <Check size={14} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
          </div>
        ) : (
          <div style={{ padding: "1rem" }}>
            {filteredLogs.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {filteredLogs.map((log) => (
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
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {log.workerName}
                        </h3>
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                          {log.status === "absent" ? (
                            <>Absent • {log.projectCode || "No Project"}</>
                          ) : (
                            <>
                              {log.status}
                              {log.hours && ` • ${log.hours} hours`} •{" "}
                              {log.projectCode || "No Project"}
                            </>
                          )}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                          {moment(log.date.toDate()).format("DD MMM YYYY")}
                        </p>
                        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                          {moment(log.date.toDate()).format("hh:mm A")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#94a3b8",
                }}
              >
                No logs found for the selected filters
              </div>
            )}
          </div>
        )}
      </div>

      <DefaultDialog
        title="Confirm Attendance"
        open={confirmDialog}
        onCancel={() => setConfirmDialog(false)}
        onOk={handleBulkAttendance}
        OkButtonText="Post"
        updating={updating}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
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
                  Present:
                </span>
                <span style={{ color: "white", fontWeight: "500" }}>
                  {selectedWorkers.length} workers • {hours} hours
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  Absent:
                </span>
                <span style={{ color: "#94a3b8", fontWeight: "500" }}>
                  {filteredWorkers.length - selectedWorkers.length} workers
                </span>
              </div>
            </div>

            {/* Absentees Section */}
            {filteredWorkers.filter(
              (worker) => !selectedWorkers.includes(worker.id)
            ).length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  maxHeight: "300px",
                  overflow: "auto",
                  paddingRight: "0.5rem",
                }}
              >
                <h4
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    position: "sticky",
                    top: 0,
                    background: "rgb(18 18 18)",
                    padding: "0.25rem 0",
                    zIndex: 1,
                  }}
                >
                  Absent Workers
                </h4>
                {filteredWorkers
                  .filter((worker) => !selectedWorkers.includes(worker.id))
                  .map((worker) => (
                    <div
                      key={worker.id}
                      style={{
                        padding: "0.75rem",
                        background: "rgba(220, 20, 60, 0.05)",
                        border: "1px solid rgba(220, 20, 60, 0.2)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <div style={{ marginBottom: "0.5rem" }}>
                        <h4
                          style={{
                            fontSize: "0.9rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {worker.name}
                        </h4>
                        <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                          {worker.projectCode || "No Project"}
                        </p>
                      </div>
                      <input
                        type="text"
                        value={absenteeRemarks[worker.id] || ""}
                        onChange={(e) =>
                          setAbsenteeRemarks((prev) => ({
                            ...prev,
                            [worker.id]: e.target.value,
                          }))
                        }
                        placeholder="Add remarks (optional)"
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          background: "rgba(40, 40, 50, 0.5)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "0.375rem",
                          color: "white",
                          fontSize: "0.9rem",
                        }}
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}

<style>
  {`
    @keyframes pulse {
      0% { border-color: rgba(255, 255, 255, 0.1) }
      50% { border-color: rgba(220, 20, 60, 0.5) }
      100% { border-color: rgba(255, 255, 255, 0.1) }
    }
  `}
</style>;
