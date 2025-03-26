import { db } from "@/firebase";
import * as XLSX from "@e965/xlsx";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { FileDown, LoaderCircle, Search } from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import CustomDropdown from "./custom-dropdown";

interface Props {
  userEmail: string;
}

export default function AttendanceLogs({ userEmail }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    moment().format("YYYY-MM")
  );
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [userEmail, selectedDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const startOfMonth = moment(selectedDate).startOf("month").toDate();
      const endOfMonth = moment(selectedDate).endOf("month").toDate();

      const logsQuery = query(
        collection(db, "attendance"),
        where("supervisorEmail", "==", userEmail),
        where("date", ">=", Timestamp.fromDate(startOfMonth)),
        where("date", "<=", Timestamp.fromDate(endOfMonth)),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(logsQuery);
      const logsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logsList);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesWorker = selectedWorker
      ? log.workerId === selectedWorker
      : true;
    const matchesSearch = log.workerName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesWorker && matchesSearch;
  });

  const handleExport = async () => {
    try {
      setExporting(true);

      const exportData = filteredLogs.map((log) => ({
        Name: log.workerName,
        Date: moment(log.date.toDate()).format("DD/MM/YYYY"),
        Time: moment(log.date.toDate()).format("hh:mm A"),
        Status: log.status,
        Hours: log.hours || "-",
        Project: log.projectCode || "No Project",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");

      // Save the file
      const fileName = `AttendanceLogs_${moment().format("DD-MM-YYYY")}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error exporting logs:", error);
    } finally {
      setExporting(false);
    }
  };

  // Get unique worker names and IDs from logs
  const workerOptions = useMemo(() => {
    const uniqueWorkers = new Map();
    logs.forEach((log) => {
      uniqueWorkers.set(log.workerId, {
        id: log.workerId,
        name: log.workerName,
      });
    });

    return [
      { value: "", label: "All Workers" },
      ...Array.from(uniqueWorkers.values())
        .map((worker) => ({
          value: worker.id,
          label: worker.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [logs]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Filters Section */}
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
        {/* Add Export Button Row */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}></div>

        {/* Search Bar */}
        <div
          style={{
            display: "flex",
            width: "100%",
            border: "",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "100%",
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
              placeholder="Search worker name..."
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
          <button
            onClick={handleExport}
            disabled={exporting || filteredLogs.length === 0}
            style={{
              backdropFilter: "none",
              padding: "0.5rem 0.75rem",
              fontSize: "0.8rem",
              height: "2.5rem",
              background: "rgba(50, 180, 50, 0.15)",
              borderRadius: "0.375rem",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: filteredLogs.length === 0 ? 0.5 : 1,
              cursor: filteredLogs.length === 0 ? "not-allowed" : "pointer",
            }}
            className="hover:bg-opacity-30"
          >
            {exporting ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <FileDown color="lightgreen" width={"1.25rem"} />
            )}
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* Worker Filter */}
          <div style={{ flex: 1 }}>
            <CustomDropdown
              value={selectedWorker}
              onChange={setSelectedWorker}
              options={workerOptions}
              placeholder="Select Worker"
            />
          </div>

          {/* Month Filter */}
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
      </div>

      {/* Logs List */}
      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            Loading...
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
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
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
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
            {filteredLogs.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#94a3b8",
                }}
              >
                No logs found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
