import { db } from "@/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Search } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

interface AttendanceLogsProps {
  userEmail: string;
  projectCode: string;
}

export default function AttendanceLogs({
  userEmail,
  projectCode,
}: AttendanceLogsProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [userEmail]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const logsQuery = query(
        collection(db, "attendance"),
        where("supervisorEmail", "==", userEmail),
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

  const filteredLogs = logs.filter((log) =>
    log.workerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          padding: "1rem",
          background: "rgba(30, 30, 40, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
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

      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          {loading ? (
            <div>Loading...</div>
          ) : (
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
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                      {log.workerName}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {log.hours} hours • {log.status} •{" "}
                      {log.projectCode || "No Project"}
                    </p>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                    {moment(log.date.toDate()).format("DD MMM YYYY, h:mm A")}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
