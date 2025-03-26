import AttendanceSheet from "@/components/attendance-sheet";
import CustomDropdown from "@/components/custom-dropdown";
import DefaultDialog from "@/components/default-dialog";
import HandoverHistory from "@/components/handover-history";
import IndexDropDown from "@/components/index-dropdown";
import RefreshButton from "@/components/refresh-button";
import WorkerCard from "@/components/worker-card";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase";
import * as XLSX from "@e965/xlsx";
import { message } from "antd";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Download,
  Hash,
  LoaderCircle,
  Plus,
  Search,
  Upload,
  Users,
  CheckCircle,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AttendanceLogs from "@/components/attendance-logs";

export default function Supervisor() {
  const [loading, setLoading] = useState(false);
  const [setRecords] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [selectedUser] = useState("");
  const [refreshCompleted, setRefreshCompleted] = useState(false);
  const [projectCode, setProjectCode] = useState("");
  const [projectCodeLoading, setProjectCodeLoading] = useState(true);
  const [workerManagementDialog, setWorkerManagementDialog] = useState(false);
  const [handoverDialog, setHandoverDialog] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [targetSupervisor, setTargetSupervisor] = useState("");
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Attendance");
  const [incomingHandovers, setIncomingHandovers] = useState<any[]>([]);
  const [outgoingHandovers, setOutgoingHandovers] = useState<any[]>([]);
  const [newWorker, setNewWorker] = useState({
    name: "",
    company: "",
    contract: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchRecords();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (userEmail) {
      fetchProjectCode();
    }
  }, [userEmail]);

  useEffect(() => {
    fetchSupervisors();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchHandovers();
    }
  }, [userEmail]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setRefreshCompleted(false);
      const workersQuery = query(
        collection(db, "workers"),
        where("supervisorEmail", "==", userEmail),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(workersQuery);
      const workersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(workersList);
      setRefreshCompleted(true);
      setTimeout(() => {
        setRefreshCompleted(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const startOfMonth = moment().startOf("month").toDate();
      const endOfMonth = moment().endOf("month").toDate();

      const recordsCollection = collection(db, "records");
      const recordsQuery = query(
        recordsCollection,
        where("email", "==", selectedUser),
        where("start", ">=", Timestamp.fromDate(startOfMonth)),
        where("start", "<=", Timestamp.fromDate(endOfMonth)),
        orderBy("start", "desc")
      );

      const querySnapshot = await getDocs(recordsQuery);
      const fetchedRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecords(fetchedRecords);
      setRefreshCompleted(true);
      setTimeout(() => {
        setRefreshCompleted(false);
      }, 1000);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setLoading(false);
    }
  };

  const fetchProjectCode = async () => {
    try {
      setProjectCodeLoading(true);
      const usersCollection = collection(db, "users");
      const userQuery = query(usersCollection, where("email", "==", userEmail));
      const querySnapshot = await getDocs(userQuery);
      const userData = querySnapshot.docs[0]?.data();
      if (userData?.projectCode) {
        setProjectCode(userData.projectCode);
      }
    } catch (error) {
      console.error("Error fetching project code:", error);
    } finally {
      setProjectCodeLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const supervisorsQuery = query(
        collection(db, "users"),
        where("role", "==", "supervisor")
      );
      const snapshot = await getDocs(supervisorsQuery);
      const supervisorsList = snapshot.docs
        .map((doc) => ({ id: doc.id, email: doc.data().email, ...doc.data() }))
        .filter((sup) => sup.email !== userEmail);
      setSupervisors(supervisorsList);
    } catch (error) {
      console.error("Error fetching supervisors:", error);
    }
  };

  const fetchHandovers = async () => {
    try {
      // Fetch incoming handovers
      const incomingQuery = query(
        collection(db, "handovers"),
        where("toSupervisor", "==", userEmail),
        orderBy("date", "desc")
      );
      const incomingSnapshot = await getDocs(incomingQuery);
      setIncomingHandovers(
        incomingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      // Fetch outgoing handovers
      const outgoingQuery = query(
        collection(db, "handovers"),
        where("fromSupervisor", "==", userEmail),
        orderBy("date", "desc")
      );
      const outgoingSnapshot = await getDocs(outgoingQuery);
      setOutgoingHandovers(
        outgoingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching handovers:", error);
    }
  };

  const handleWorkerHandover = async () => {
    try {
      const targetSupervisorData = supervisors.find(
        (s) => s.email === targetSupervisor
      );

      // Handle multiple workers
      const workerIds = Array.isArray(selectedWorker.id)
        ? selectedWorker.id
        : [selectedWorker.id];

      for (const workerId of workerIds) {
        const worker = users.find((w: any) => w.id === workerId);
        if (!worker) continue;

        // Create handover record
        await addDoc(collection(db, "handovers"), {
          workerId: workerId,
          workerName: worker.name,
          fromSupervisor: userEmail,
          toSupervisor: targetSupervisor,
          fromProject: projectCode,
          toProject: targetSupervisorData?.projectCode || "",
          date: new Date(),
        });

        // Update worker's supervisor and project
        await updateDoc(doc(db, "workers", workerId), {
          supervisorEmail: targetSupervisor,
          projectCode: targetSupervisorData?.projectCode || "",
          lastHandoverDate: new Date(),
        });
      }

      // Update local state
      setUsers((prevUsers: any[]) =>
        prevUsers.filter((worker) => !workerIds.includes(worker.id))
      );

      message.success("Workers handed over successfully");
      setHandoverDialog(false);
      setSelectedWorker(null);
      setSelectedWorkers([]);
      setSelectionMode(false);
      fetchHandovers();
    } catch (error) {
      console.error("Error in handover:", error);
      message.error("Failed to handover workers");
    }
  };

  const handleLogout = async () => {
    try {
      await logout?.();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleAddWorker = async () => {
    try {
      const workerData = {
        ...newWorker,
        projectCode,
        supervisorEmail: userEmail,
        status: "active",
        createdAt: new Date(),
      };

      await addDoc(collection(db, "workers"), workerData);
      message.success("Worker added successfully");
      setNewWorker({ name: "", company: "", contract: "" });
      fetchWorkers();
    } catch (error) {
      console.error("Error adding worker:", error);
      message.error("Failed to add worker");
    }
  };

  const handleMarkAttendance = async (
    workerId: string,
    status: string,
    hours?: number
  ) => {
    if (!hours) return; // Early return if hours not provided
    try {
      const worker = users.find((w: any) => w.id === workerId);
      if (!worker) return;

      await addDoc(collection(db, "attendance"), {
        workerId,
        workerName: worker.name,
        date: new Date(),
        projectCode,
        supervisorEmail: userEmail,
        hours,
        status,
      });

      message.success(`Marked ${worker.name} as ${status}`);
    } catch (error) {
      console.error("Error marking attendance:", error);
      message.error("Failed to mark attendance");
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Name: "Example Worker",
        Company: "Example Company",
        Contract: "Contract Details",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Workers");

    // Save the file
    XLSX.writeFile(wb, "workers_template.xlsx");
  };

  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Batch add workers with progress
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as {
              Name: string;
              Company: string;
              Contract: string;
            };

            // Validate and provide default values for empty fields
            const workerData = {
              name: row["Name"]?.toString().trim() || "",
              company: row["Company"]?.toString().trim() || "",
              contract: row["Contract"]?.toString().trim() || "",
              projectCode,
              supervisorEmail: userEmail,
              status: "active",
              createdAt: new Date(),
            };

            // Skip if required fields are empty
            if (!workerData.name || !workerData.company) {
              console.warn("Skipping row due to missing required fields:", row);
              continue;
            }

            await addDoc(collection(db, "workers"), workerData);
            setUploadProgress(Math.round(((i + 1) / jsonData.length) * 100));
          }

          message.success(`Successfully added ${jsonData.length} workers`);
          fetchWorkers();
        } catch (error) {
          console.error("Error processing Excel:", error);
          message.error("Failed to process Excel file");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error uploading Excel:", error);
      message.error("Failed to upload Excel file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = "";
    }
  };

  const filteredWorkers = users.filter(
    (worker: any) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.contract.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorkers.length === filteredWorkers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(filteredWorkers.map((worker: any) => worker.id));
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmText("");
    setDeleteConfirmDialog(true);
  };

  const handleDeleteSelected = async () => {
    try {
      // Update each selected worker's status to 'inactive'
      for (const workerId of selectedWorkers) {
        await updateDoc(doc(db, "workers", workerId), {
          status: "inactive",
        });
      }

      // Update local state
      setUsers((prev: any) =>
        prev.filter((worker: any) => !selectedWorkers.includes(worker.id))
      );
      setSelectedWorkers([]);
      setDeleteConfirmDialog(false); // Close the dialog
      message.success("Workers deleted successfully");
    } catch (error) {
      console.error("Error deleting workers:", error);
      message.error("Failed to delete workers");
    }
  };

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column" }}>
      {/* Header with Avatar */}
      <div
        style={{
          padding: window.innerWidth >= 768 ? "1.25rem 1.5rem" : "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(30, 30, 40, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          zIndex: 40,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {<Hash color="crimson" />}
            {projectCodeLoading ? (
              <LoaderCircle
                size={24}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              projectCode
            )}
          </h2>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <RefreshButton
            fetchingData={loading}
            onClick={fetchWorkers}
            refreshCompleted={refreshCompleted}
          />
          <IndexDropDown onLogout={handleLogout} />
        </div>
      </div>

      {/* New Tab Navigation */}
      <div
        style={{
          padding: "0 1rem",
          background: "rgba(40, 40, 50, 0.5)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            minWidth: "min-content",
          }}
        >
          {["Attendance", "Workers", "Logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                borderRadius: "0",
                padding: "1rem 0",
                color: activeTab === tab ? "white" : "#94a3b8",
                borderBottom: "3px solid",
                borderBottomColor:
                  activeTab === tab ? "crimson" : "transparent",
                background: "none",
                fontSize: "0.9rem",
                fontWeight: "500",
                minWidth: "80px",
                transition: "color 0.2s ease",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area based on active tab */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeTab === "Workers" && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div
              style={{
                padding: "1rem",
                background: "rgba(30, 30, 40, 0.85)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Search Bar */}
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

              {/* Selection Controls */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: "40px",
                }}
              >
                <button
                  onClick={
                    selectionMode
                      ? handleSelectAll
                      : () => setSelectionMode(true)
                  }
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
                  {selectionMode ? (
                    <>
                      Selected {selectedWorkers.length}
                      {filteredWorkers.length > 0 && (
                        <span style={{ color: "crimson", fontWeight: "bold" }}>
                          {selectedWorkers.length === filteredWorkers.length
                            ? " Deselect All"
                            : " Select All"}
                        </span>
                      )}
                    </>
                  ) : (
                    "Select Workers"
                  )}
                </button>
                {selectionMode && (
                  <button
                    onClick={() => {
                      setSelectionMode(false);
                      setSelectedWorkers([]);
                    }}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "rgba(40, 40, 50, 0.5)",
                      borderRadius: "0.375rem",
                      fontSize: "0.9rem",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      minWidth: "80px",
                      height: "36px",
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                }}
              >
                {filteredWorkers.map((worker: any) => (
                  <div
                    key={worker.id}
                    onClick={() =>
                      selectionMode && toggleWorkerSelection(worker.id)
                    }
                    style={{
                      padding: "1rem",
                      background: selectedWorkers.includes(worker.id)
                        ? "rgba(220, 20, 60, 0.1)"
                        : "rgba(30, 30, 40, 0.5)",
                      borderRadius: "0.5rem",
                      cursor: selectionMode ? "pointer" : "default",
                      border: selectedWorkers.includes(worker.id)
                        ? "1px solid rgba(220, 20, 60, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <WorkerCard
                      worker={worker}
                      selected={selectedWorkers.includes(worker.id)}
                      onHandover={() => {
                        if (!selectionMode) {
                          setSelectedWorker(worker);
                          setHandoverDialog(true);
                        }
                      }}
                      selectionMode={selectionMode}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Attendance" && (
          <AttendanceSheet
            workers={users}
            projectCode={projectCode}
            onMarkAttendance={handleMarkAttendance}
          />
        )}

        {activeTab === "Logs" && userEmail && (
          <AttendanceLogs userEmail={userEmail} projectCode={projectCode} />
        )}

        {activeTab === "Handovers" && (
          <HandoverHistory
            incomingHandovers={incomingHandovers}
            outgoingHandovers={outgoingHandovers}
          />
        )}
      </div>

      {/* Floating Action Button for Worker Management */}
      {activeTab === "Workers" && !selectionMode && (
        <button
          onClick={() => setWorkerManagementDialog(true)}
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "3.5rem",
            height: "3.5rem",
            borderRadius: "50%",
            background: "crimson",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
            zIndex: 50,
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={24} color="white" />
        </button>
      )}

      {/* Fixed Action Buttons */}
      {activeTab === "Workers" &&
        selectionMode &&
        selectedWorkers.length > 0 && (
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
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => {
                  setSelectedWorker({ id: selectedWorkers });
                  setHandoverDialog(true);
                }}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "rgba(100, 100, 100, 0.2)",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                Handover ({selectedWorkers.length})
              </button>
              <button
                onClick={handleDeleteClick}
                style={{
                  flex: 1,
                  padding: "1rem",
                  background: "crimson",
                  borderRadius: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                }}
              >
                Delete ({selectedWorkers.length})
              </button>
            </div>
          </div>
        )}

      {/* Worker Management Dialog */}
      <DefaultDialog
        close
        title="Add Worker"
        titleIcon={<Users color="crimson" />}
        open={workerManagementDialog}
        onCancel={() => setWorkerManagementDialog(false)}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Excel Upload Section */}
            <div>
              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  Bulk Upload
                </span>
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>

              {/* Template Download Button */}
              <button
                onClick={downloadTemplate}
                style={{
                  width: "100%",
                  marginBottom: "0.5rem",
                  padding: "0.75rem",
                  background: "rgba(100, 100, 100, 0.2)",
                  borderRadius: "0.375rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Download size={20} />
                <span>Download Template</span>
              </button>

              {/* Upload Button with Progress */}
              <label
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: "rgba(100, 100, 100, 0.2)",
                  borderRadius: "0.375rem",
                  cursor: uploading ? "not-allowed" : "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {uploading ? (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        height: "100%",
                        width: `${uploadProgress}%`,
                        background: "rgba(220, 20, 60, 0.2)",
                        transition: "width 0.2s ease",
                      }}
                    />
                    <LoaderCircle
                      size={20}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                    <span>Uploading... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Upload Excel File</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
              </label>
            </div>

            <div>
              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />
                <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                  Single Entry
                </span>
                <div
                  style={{
                    height: "1px",
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.1)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) =>
                    setNewWorker((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Worker Name"
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    background: "rgba(100 100 100/ 20%)",
                    border: "none",
                    borderRadius: "0.375rem",
                    padding: "0 0.75rem",
                  }}
                />
                <input
                  type="text"
                  value={newWorker.company}
                  onChange={(e) =>
                    setNewWorker((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  placeholder="Parent Company"
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    background: "rgba(100 100 100/ 20%)",
                    border: "none",
                    borderRadius: "0.375rem",
                    padding: "0 0.75rem",
                  }}
                />
                <input
                  type="text"
                  value={newWorker.contract}
                  onChange={(e) =>
                    setNewWorker((prev) => ({
                      ...prev,
                      contract: e.target.value,
                    }))
                  }
                  placeholder="Contract Details"
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    background: "rgba(100 100 100/ 20%)",
                    border: "none",
                    borderRadius: "0.375rem",
                    padding: "0 0.75rem",
                  }}
                />
                <br />
                <button
                  onClick={handleAddWorker}
                  disabled={!newWorker.name || !newWorker.company}
                  style={{
                    background:
                      newWorker.name && newWorker.company
                        ? "crimson"
                        : "rgba(100, 100, 100, 0.2)",
                    color: "white",
                    height: "2.5rem",
                    borderRadius: "0.375rem",
                  }}
                >
                  <Plus color="crimson" size={14} />
                  Add Worker
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* Handover Dialog */}
      <DefaultDialog
        title={
          Array.isArray(selectedWorker?.id)
            ? "Bulk Handover"
            : "Worker Handover"
        }
        open={handoverDialog}
        onCancel={() => setHandoverDialog(false)}
        onOk={handleWorkerHandover}
        OkButtonText="Handover"
        disabled={!targetSupervisor}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {!Array.isArray(selectedWorker?.id) && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Selected Worker
                </label>
                <div
                  style={{
                    padding: "0.75rem",
                    background: "rgba(100 100 100/ 20%)",
                    borderRadius: "0.375rem",
                  }}
                >
                  {selectedWorker?.name}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Transfer to Supervisor
              </label>
              <CustomDropdown
                value={targetSupervisor}
                onChange={setTargetSupervisor}
                options={supervisors.map((sup) => ({
                  value: sup.email,
                  label: `${sup.name} (${sup.projectCode})`,
                }))}
                placeholder="Select Supervisor"
              />
            </div>

            <div
              style={{
                marginTop: "0.5rem",
                padding: "1rem",
                background: "rgba(220, 20, 60, 0.1)",
                border: "1px solid rgba(220, 20, 60, 0.3)",
                borderRadius: "0.5rem",
              }}
            >
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                ⚠️ Warning: Once handed over, you'll need to contact the other
                supervisor to get the worker back.
              </p>
            </div>
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <DefaultDialog
        title="Confirm Delete"
        open={deleteConfirmDialog}
        onCancel={() => setDeleteConfirmDialog(false)}
        onOk={handleDeleteSelected}
        OkButtonText="Delete Workers"
        disabled={deleteConfirmText !== "DELETE"}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              You are about to delete {selectedWorkers.length} worker
              {selectedWorkers.length > 1 ? "s" : ""}. This action cannot be
              undone.
            </p>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Type <span style={{ color: "crimson" }}>DELETE</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{
                width: "100%",
                height: "2.5rem",
                background: "rgba(100 100 100/ 20%)",
                border:
                  deleteConfirmText === "DELETE"
                    ? "2px solid crimson"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.375rem",
                padding: "0 0.75rem",
                fontSize: "0.9rem",
                transition: "border 0.2s ease",
              }}
            />
          </div>
        }
      />
    </div>
  );
}
