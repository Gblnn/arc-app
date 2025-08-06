import AttendanceSheet from "@/components/attendance-sheet";
import CustomDropdown from "@/components/custom-dropdown";
import DefaultDialog from "@/components/default-dialog";
import DocumentsManager from "@/components/documents-manager";
import HandoverHistory from "@/components/handover-history";
import IndexDropDown from "@/components/index-dropdown";
import RefreshButton from "@/components/refresh-button";
import TransferRequests from "@/components/transfer-requests";
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
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Factory,
  LoaderCircle,
  Plus,
  Search,
  SquareArrowDownLeft,
  Upload,
  X
} from "lucide-react";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TransferRequest {
  id: string;
  type: string;
  status: string;
  requestDate: {
    toDate: () => Date;
  };
}

interface Tab {
  id: string;
  label: string | JSX.Element;
}

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
  const [activeTab, setActiveTab] = useState("Workers");
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
  const [deleteUpdating, setDeleteUpdating] = useState(false);
  const [otherSiteWorkers, setOtherSiteWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  const [transferRequests, setTransferRequests] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [requestingWorkerId] = useState<string>("");
  const [confirmTransferDialog, setConfirmTransferDialog] = useState(false);
  const [selectedTransferWorker, setSelectedTransferWorker] =
    useState<any>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [rejectingRequestId, setRejectingRequestId] = useState<string>("");
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [exporting, setExporting] = useState(false);
  const [setTransferringWorker] = useState<any>(null);
  const navigate = useNavigate();
  const { userEmail, logout } = useAuth();

  const filteredOtherWorkers = useMemo(() => {
    return otherSiteWorkers.filter((worker) => {
      const matchesSearch = worker.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesProject = selectedProject
        ? worker.projectCode === selectedProject
        : true;
      return matchesSearch && matchesProject;
    });
  }, [otherSiteWorkers, searchQuery, selectedProject]);

  const pendingTransferCount = useMemo(() => {
    return transferRequests.filter(
      (req) => req.status === "pending" && req.type === "incoming"
    ).length;
  }, [transferRequests]);

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

  useEffect(() => {
    if (userEmail) {
      fetchTransferRequests();
    }
  }, [userEmail]);

  useEffect(() => {
    if (activeTab === "Transfers") {
      fetchOtherSiteWorkers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (userEmail) {
      fetchAttendanceLogs();
    }
  }, [userEmail]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "workers"),
        where("supervisorEmail", "==", userEmail),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      const workersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(workersList);
    } catch (error) {
      console.error("Error fetching workers:", error);
      message.error("Failed to fetch workers");
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
      setLoading(true);
      // Fetch incoming handovers
      const incomingQuery = query(
        collection(db, "handovers"),
        where("toSupervisor", "==", userEmail),
        orderBy("date", "desc")
      );
      const incomingSnapshot = await getDocs(incomingQuery);
      const incomingList = incomingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncomingHandovers(incomingList);

      // Fetch outgoing handovers
      const outgoingQuery = query(
        collection(db, "handovers"),
        where("fromSupervisor", "==", userEmail),
        orderBy("date", "desc")
      );
      const outgoingSnapshot = await getDocs(outgoingQuery);
      const outgoingList = outgoingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOutgoingHandovers(outgoingList);
    } catch (error) {
      console.error("Error fetching handovers:", error);
      message.error("Failed to fetch handovers");
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherSiteWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const workersQuery = query(
        collection(db, "workers"),
        where("supervisorEmail", "!=", userEmail),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(workersQuery);
      const workersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOtherSiteWorkers(workersList);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoadingWorkers(false);
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
    try {
      // Add attendance record to the logs
      await addDoc(collection(db, "attendanceLogs"), {
        workerId,
        workerName: users.find((w: any) => w.id === workerId)?.name,
        supervisorEmail: userEmail,
        projectCode: projectCode,
        status,
        hours: hours || 0,
        date: Timestamp.now(),
        timestamp: Timestamp.now(),
      });

      // message.success("Attendance marked successfully");
    } catch (error) {
      console.error("Error marking attendance:", error);
      message.error("Failed to mark attendance");
      throw error; // Re-throw to be caught by the component
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
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadProgress(0);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const workers = XLSX.utils.sheet_to_json(sheet) as Array<{
            Name: string;
            Company: string;
            Contract: string;
          }>;

          const totalWorkers = workers.length;
          let completed = 0;

          // Show initial progress
          setUploadProgress(0);

          for (const worker of workers) {
            // Validate and provide default values
            if (!worker.Name) {
              message.error("Worker name is required");
              continue;
            }

            try {
              await addDoc(collection(db, "workers"), {
                name: worker.Name.trim(),
                company: (worker.Company || "Not Specified").trim(),
                contract: (worker.Contract || "Not Specified").trim(),
                projectCode,
                supervisorEmail: userEmail,
                status: "active",
                createdAt: new Date(),
              });

              completed++;
              // Update progress after each worker
              const progress = Math.round((completed / totalWorkers) * 100);
              setUploadProgress(progress);
            } catch (error) {
              console.error(`Error adding worker ${worker.Name}:`, error);
              message.error(`Failed to add worker ${worker.Name}`);
            }
          }

          if (completed > 0) {
            message.success(`Successfully added ${completed} workers`);
            fetchWorkers();
            // Close the dialog after a short delay
            setTimeout(() => {
              setWorkerManagementDialog(false);
            }, 500);
          }
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
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        event.target.value = "";
      }, 500);
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
      setDeleteUpdating(true);
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
      setSelectionMode(false);
      message.success("Workers deleted successfully");
    } catch (error) {
      console.error("Error deleting workers:", error);
      message.error("Failed to delete workers");
    } finally {
      setDeleteUpdating(false);
    }
  };

  const handleTransferRequest = async (workerOrWorkers: any) => {
    try {
      setConfirmTransferDialog(false);
      setTransferringWorker(null);

      // If it's a bulk transfer, get the full worker details for each selected worker
      const workers = Array.isArray(workerOrWorkers)
        ? otherSiteWorkers.filter((w) => workerOrWorkers.includes(w.id))
        : [workerOrWorkers];

      for (const worker of workers) {
        await addDoc(collection(db, "transferRequests"), {
          workerId: worker.id,
          workerName: worker.name,
          fromProject: projectCode || "No Project",
          toProject: selectedProject || "No Project",
          fromSupervisor: userEmail,
          toSupervisor: worker.supervisorEmail || "",
          status: "pending",
          requestDate: new Date(),
          type: "outgoing",
        });
      }

      message.success(
        `Transfer request${workers.length > 1 ? "s" : ""} sent successfully`
      );
    } catch (error) {
      console.error("Error requesting transfer:", error);
      message.error("Failed to send transfer request");
    }
  };

  const fetchTransferRequests = async () => {
    try {
      const outgoingQuery = query(
        collection(db, "transferRequests"),
        where("fromSupervisor", "==", userEmail),
        orderBy("requestDate", "desc")
      );

      const incomingQuery = query(
        collection(db, "transferRequests"),
        where("toSupervisor", "==", userEmail),
        orderBy("requestDate", "desc")
      );

      const [outgoingSnapshot, incomingSnapshot] = await Promise.all([
        getDocs(outgoingQuery),
        getDocs(incomingQuery),
      ]);

      const requests = [
        ...outgoingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "outgoing",
        })),
        ...incomingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "incoming",
        })),
      ];

      // Sort requests to show pending first, then by date
      const sortedRequests = (requests as TransferRequest[]).sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return (
          b.requestDate.toDate().getTime() - a.requestDate.toDate().getTime()
        );
      });

      setTransferRequests(sortedRequests);
    } catch (error) {
      console.error("Error fetching transfer requests:", error);
    }
  };

  const handleTransferResponse = async (
    requestId: string,
    approved: boolean
  ) => {
    try {
      const request = transferRequests.find((r) => r.id === requestId);
      if (!request) return;

      if (approved) {
        // Update worker's supervisor and project
        await updateDoc(doc(db, "workers", request.workerId), {
          projectCode: request.toProject,
          supervisorEmail: request.toSupervisor,
          lastTransferDate: new Date(),
        });

        // Create handover record
        await addDoc(collection(db, "handovers"), {
          workerId: request.workerId,
          workerName: request.workerName,
          fromProject: request.fromProject,
          toProject: request.toProject,
          fromSupervisor: request.fromSupervisor,
          toSupervisor: request.toSupervisor,
          date: new Date(),
        });
      }

      // Update transfer request status
      await updateDoc(doc(db, "transferRequests", requestId), {
        status: approved ? "approved" : "rejected",
        responseDate: new Date(),
      });

      // Update local state immediately
      setTransferRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? { ...req, status: approved ? "approved" : "rejected" }
            : req
        )
      );

      // Refresh workers list immediately after approval
      await fetchWorkers();

      message.success(
        `Transfer request ${approved ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      console.error("Error responding to transfer:", error);
      message.error("Failed to respond to transfer request");
    }
  };

  const handleRejectWithComment = async () => {
    if (!rejectComment.trim()) {
      message.error(
        "Please provide a reason for rejecting this transfer request: "
      );
      return;
    }

    try {
      await updateDoc(doc(db, "transferRequests", rejectingRequestId), {
        status: "rejected",
        responseDate: new Date(),
        rejectionReason: rejectComment,
      });

      message.info("Transfer request rejected");
      setRejectDialog(false);
      setRejectComment("");
      setRejectingRequestId("");
      fetchTransferRequests();
    } catch (error) {
      console.error("Error rejecting transfer:", error);
      message.error("Failed to reject transfer request");
    }
  };

  const [attendanceMode, setAttendanceMode] = useState(false);
  const [selectedForAttendance, setSelectedForAttendance] = useState<string[]>([]);
  const [attendanceDialog, setAttendanceDialog] = useState(false);

  const tabs: Tab[] = [
    { id: "Workers", label: "Workers" },
    { id: "Attendance", label: "Attendance" },
    {
      id: "Transfers",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          Transfers
          {pendingTransferCount > 0 && (
            <div
              style={{
                background: "crimson",
                color: "white",
                fontSize: "0.7rem",
                padding: "0.4rem",
                paddingTop: "0.45rem",
                borderRadius: "1rem",
                minWidth: "1.2rem",
                height: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {pendingTransferCount}
            </div>
          )}
        </div>
      ),
    },
    // { id: "Handovers", label: "Handovers" },
   
  ];

  const fetchAttendanceLogs = async () => {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const logsQuery = query(
        collection(db, "attendanceLogs"),
        where("supervisorEmail", "==", userEmail),
        where("date", ">=", Timestamp.fromDate(startOfDay)),
        orderBy("date", "desc")
      );

      const snapshot = await getDocs(logsQuery);
      const logsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceLogs(logsList);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handleExportLogs = async () => {
    try {
      setExporting(true);

      // Format logs for export
      const exportData = attendanceLogs.map((log) => ({
        Date: moment(log.date.toDate()).format("DD/MM/YYYY"),
        Time: moment(log.date.toDate()).format("hh:mm A"),
        "Worker Name": log.workerName,
        Status: log.status.charAt(0).toUpperCase() + log.status.slice(1),
        Hours: log.hours || 0,
        "Project Code": log.projectCode || "No Project",
      }));

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Logs");

      // Save file
      XLSX.writeFile(
        wb,
        `attendance_logs_${moment().format("YYYY-MM-DD")}.xlsx`
      );

      message.success("Logs exported successfully");
    } catch (error) {
      console.error("Error exporting logs:", error);
      message.error("Failed to export logs");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column" }}>
      {/* Header with Avatar */}
      <div
        style={{
          padding: "2rem 1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(20, 20, 30, 0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          zIndex: 40,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          height: "3.5rem"
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {<Factory color="crimson" />}
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
          display: "flex",
          background: "rgba(25, 25, 35, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
          overflowX: "auto",
          padding: "1rem",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
          width: "100%",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            width: "100%",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.65rem 1.25rem",
                background:
                  activeTab === tab.id
                    ? "rgba(220, 20, 60, 0.15)"
                    : "rgba(40, 40, 50, 0.3)",
                border: `1px solid ${
                  activeTab === tab.id
                    ? "rgba(220, 20, 60, 0.3)"
                    : "rgba(255, 255, 255, 0.05)"
                }`,
                borderRadius: "0.5rem",
                color: activeTab === tab.id ? "white" : "#94a3b8",
                fontSize: "0.9rem",
                fontWeight: activeTab === tab.id ? "500" : "400",
                transition: "all 0.2s ease",
                transform: activeTab === tab.id ? "translateY(-1px)" : "none",
                boxShadow: activeTab === tab.id ? "0 4px 12px rgba(220, 20, 60, 0.15)" : "none"
              }}
            >
              {tab.label}
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
          paddingBottom: "calc(4rem + env(safe-area-inset-bottom))", // Account for tab bar height + safe area
        }}
      >
        {activeTab === "Workers" && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div
              style={{
                padding: "0.75rem",
                background: "rgba(30, 30, 40, 0.85)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {/* Search Bar with Selection Controls */}
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
                <Search size={18} color="#94a3b8" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search workers..."
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
                <div style={{ width: "1px", height: "24px", background: "rgba(255, 255, 255, 0.1)" }} />
                <button
                  onClick={() => {
                    setAttendanceMode(!attendanceMode);
                    setSelectionMode(false);
                    setSelectedWorkers([]);
                    setSelectedForAttendance([]);
                  }}
                  style={{
                    background: attendanceMode ? "rgba(220, 20, 60, 0.15)" : "none",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={attendanceMode ? "Exit Attendance Mode" : "Mark Attendance"}
                >
                  <Clock 
                    size={18} 
                    color={attendanceMode ? "crimson" : "#94a3b8"}
                    strokeWidth={2.5}
                  />
                </button>
                <div style={{ width: "1px", height: "24px", background: "rgba(255, 255, 255, 0.1)" }} />
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode);
                    setAttendanceMode(false);
                    setSelectedForAttendance([]);
                  }}
                  style={{
                    background: selectionMode ? "rgba(220, 20, 60, 0.15)" : "none",
                    border: "none",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title={selectionMode ? "Exit Selection Mode" : "Enter Selection Mode"}
                >
                  <CheckCircle 
                    size={18} 
                    color={selectionMode ? "crimson" : "#94a3b8"}
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              {/* Selection Controls - Shown in selection mode and attendance mode */}
              {(selectionMode || attendanceMode) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(220, 20, 60, 0.1)",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(220, 20, 60, 0.2)",
                    marginTop: "0.5rem",
                  }}
                >
                  <div style={{ color: "#94a3b8", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {selectionMode ? (
                      <>
                        <CheckCircle size={16} color="crimson" />
                        Selected: {selectedWorkers.length}
                      </>
                    ) : (
                      <>
                        <Clock size={16} color="crimson" />
                        Selected: {selectedForAttendance.length}
                      </>
                    )}
                  </div>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={() => {
                      if (selectionMode) {
                        handleSelectAll();
                      } else {
                        // Handle select all for attendance
                        if (selectedForAttendance.length === filteredWorkers.length) {
                          setSelectedForAttendance([]);
                        } else {
                          setSelectedForAttendance(filteredWorkers.map((w:any) => w.id));
                        }
                      }
                    }}
                    style={{
                      padding: "0.4rem 0.75rem",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      background: "rgba(40, 40, 50, 0.5)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {(selectionMode ? selectedWorkers.length : selectedForAttendance.length) === filteredWorkers.length 
                      ? "Deselect All" 
                      : "Select All"}
                  </button>
                  <button
                    onClick={() => {
                      if (selectionMode) {
                        setSelectionMode(false);
                        setSelectedWorkers([]);
                      } else {
                        setAttendanceMode(false);
                        setSelectedForAttendance([]);
                      }
                    }}
                    style={{
                      padding: "0.4rem 0.75rem",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      background: "rgba(40, 40, 50, 0.5)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
              <div
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  paddingBottom:
                    selectionMode && selectedWorkers.length > 0 ? "5rem" : "0",
                }}
              >
                {filteredWorkers.map((worker: any) => (
                  <div
                    key={worker.id}
                  >
                    <WorkerCard
                      worker={worker}
                      selected={selectedWorkers.includes(worker.id) || selectedForAttendance.includes(worker.id)}
                      onHandover={() => {
                        if (!selectionMode && !attendanceMode) {
                          setSelectedWorker(worker);
                          setHandoverDialog(true);
                        }
                      }}
                      selectionMode={selectionMode || attendanceMode}
                      onClick={() => {
                        if (!selectionMode && !attendanceMode) {
                          setAttendanceMode(true);
                          setSelectedForAttendance([worker.id]);
                          
                        } else if (selectionMode) {
                          toggleWorkerSelection(worker.id);
                        } else if (attendanceMode) {
                          setSelectedForAttendance(prev =>
                            prev.includes(worker.id)
                              ? prev.filter(id => id !== worker.id)
                              : [...prev, worker.id]
                          );
                        }
                      }}
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
            logs={attendanceLogs}
            exporting={exporting}
            onExport={handleExportLogs}
            onRefreshLogs={fetchAttendanceLogs}
          />
        )}

        {activeTab === "Handovers" && (
          <HandoverHistory
            incomingHandovers={incomingHandovers}
            outgoingHandovers={outgoingHandovers}
            onRefresh={fetchHandovers}
          />
        )}

        {activeTab === "Transfers" && (
          <TransferRequests
            requests={transferRequests}
            onRespond={handleTransferResponse}
            availableWorkers={filteredOtherWorkers}
            onRequestTransfer={(workers) => {
              // If it's a single worker
              if (!Array.isArray(workers)) {
                setSelectedTransferWorker({
                  ...workers,
                  projectCode: workers.projectCode || "No Project",
                });
              } else {
                // If it's multiple workers
                setSelectedTransferWorker({
                  name: `${workers.length} Workers`,
                  projectCode: workers[0].projectCode || "No Project", // Use first worker's project
                  company: workers[0].company, // Use first worker's company
                  id: "bulk",
                });
              }
              setConfirmTransferDialog(true);
            }}
            projectOptions={[
              { value: "", label: "All Projects" },
              ...Array.from(new Set(otherSiteWorkers.map((w) => w.projectCode)))
                .filter(Boolean)
                .map((code) => ({ value: code, label: code })),
            ]}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            loadingWorkers={loadingWorkers}
            incomingHandovers={incomingHandovers}
            outgoingHandovers={outgoingHandovers}
            onRefreshHandovers={fetchHandovers}
          />
        )}

        {activeTab === "Documents" && <DocumentsManager workers={users} />}
      </div>

      {/* Floating Action Buttons */}
      {activeTab === "Workers" && !selectionMode && (
        <>
          <button
            onClick={() => setWorkerManagementDialog(true)}
            style={{
              position: "fixed",
              bottom: "6rem",
              right: "1.5rem",
              width: "4rem",
              height: "4rem",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #dc143c 0%, #ff4d6d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px rgba(220, 20, 60, 0.3)",
              zIndex: 50,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              transform: "scale(1)",
              
            }}
          >
            <Plus size={24} color="white" />
          </button>
        </>
      )}

      {/* Attendance Dialog */}
      <DefaultDialog
        title="Post Attendance"
        titleIcon={<Clock color="#94a3b8" />}
        open={attendanceDialog}
        onCancel={() => {
          setAttendanceDialog(false);
          setSelectedForAttendance([]);
          setAttendanceMode(false);
        }}
        onOk={() => {
          setAttendanceDialog(false);
          setSelectedForAttendance([]);
          setAttendanceMode(false);
        }}
        OkButtonText="Post Attendance"
        extra={
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ 
              padding: "0.75rem",
              background: "rgba(30, 30, 40, 0.5)",
              borderRadius: "0.5rem",
              border: "1px solid rgba(255, 255, 255, 0.05)",
            }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                Posting attendance for {selectedForAttendance.length} worker{selectedForAttendance.length > 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Status</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["present", "absent", "mc", "leave"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      const hours = s === "present" ? 8 : 0;
                      selectedForAttendance.forEach(workerId => {
                        const worker = users.find((w:any) => w.id === workerId);
                        if (worker) {
                          handleMarkAttendance(workerId, s, hours);
                        }
                      });
                      setAttendanceDialog(false);
                      setSelectedForAttendance([]);
                      setAttendanceMode(false);
                      message.success(`Attendance posted for ${selectedForAttendance.length} worker${selectedForAttendance.length > 1 ? 's' : ''}`);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "rgba(40, 40, 50, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      borderRadius: "0.5rem",
                      color: "#94a3b8",
                      cursor: "pointer",
                      textTransform: "capitalize"
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
      />

      {/* Attendance Action Button */}
      {activeTab === "Workers" && attendanceMode && selectedForAttendance.length > 0 && (
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
            onClick={() => setAttendanceDialog(true)}
            style={{
              width: "100%",
              padding: "1rem",
              background: "crimson",
              borderRadius: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: "500",
              color: "white",
            }}
          >
            Post Attendance ({selectedForAttendance.length})
          </button>
        </div>
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
        title="Worker Management"
        open={workerManagementDialog}
        onCancel={() => setWorkerManagementDialog(false)}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Manual worker addition section */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                  fontWeight: "500",
                }}
              >
                Add Worker Manually
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="text"
                  value={newWorker.name}
                  onChange={(e) =>
                    setNewWorker({ ...newWorker, name: e.target.value })
                  }
                  placeholder="Worker Name"
                  style={{
                    padding: "0.75rem",
                    background: "rgba(40, 40, 50, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontSize: "0.9rem",
                  }}
                />
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    value={newWorker.company}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, company: e.target.value })
                    }
                    placeholder="Company"
                    style={{
                      padding: "0.75rem",
                      background: "rgba(40, 40, 50, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.9rem",
                      flex: 1,
                    }}
                  />
                  <input
                    type="text"
                    value={newWorker.contract}
                    onChange={(e) =>
                      setNewWorker({ ...newWorker, contract: e.target.value })
                    }
                    placeholder="Contract"
                    style={{
                      padding: "0.75rem",
                      background: "rgba(40, 40, 50, 0.5)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.9rem",
                      flex: 1,
                    }}
                  />
                </div>
                <button
                  onClick={handleAddWorker}
                  disabled={
                    !newWorker.name || !newWorker.company || !newWorker.contract
                  }
                  style={{
                    padding: "0.75rem",
                    background: "crimson",
                    borderRadius: "0.5rem",
                    opacity:
                      !newWorker.name ||
                      !newWorker.company ||
                      !newWorker.contract
                        ? 0.5
                        : 1,
                    cursor:
                      !newWorker.name ||
                      !newWorker.company ||
                      !newWorker.contract
                        ? "not-allowed"
                        : "pointer",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Add Worker
                </button>
              </div>
            </div>

            {/* Bulk upload section */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <h3
                style={{
                  fontSize: "0.9rem",
                  color: "#94a3b8",
                  fontWeight: "500",
                }}
              >
                Bulk Upload
              </h3>

              {/* Upload progress bar */}
              {uploading && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      Uploading workers...
                    </span>
                    <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      {uploadProgress}%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "4px",
                      background: "rgba(40, 40, 50, 0.5)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: "100%",
                        background: "crimson",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={downloadTemplate}
                  style={{
                    padding: "0.75rem",
                    background: "rgba(40, 40, 50, 0.5)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
                    flex: 1,
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                  }}
                  disabled={uploading}
                >
                  <Download size={18} />
                  Template
                </button>
                <label
                  style={{
                    padding: "0.75rem",
                    background: "rgba(40, 40, 50, 0.5)",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: uploading ? "not-allowed" : "pointer",
                    flex: 1,
                    opacity: uploading ? 0.5 : 1,
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                  }}
                >
                  {uploading ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <Upload size={18} />
                  )}
                  Upload Excel
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleExcelUpload}
                    style={{ display: "none" }}
                    disabled={uploading}
                  />
                </label>
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
        titleIcon={<X color="crimson" />}
        open={deleteConfirmDialog}
        onCancel={() => setDeleteConfirmDialog(false)}
        onOk={handleDeleteSelected}
        OkButtonText="Delete Workers"
        disabled={deleteConfirmText !== "DELETE" || deleteUpdating}
        updating={deleteUpdating}
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
              Type{" "}
              <span style={{ color: "crimson", fontWeight: "bold" }}>
                DELETE
              </span>{" "}
              to confirm:
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

      {/* Add the confirmation dialog */}
      <DefaultDialog
        title="Confirm Request"
        titleIcon={<SquareArrowDownLeft color="dodgerblue" />}
        desc="Confirm transfer request for this worker?"
        open={confirmTransferDialog}
        OkButtonText="Confirm"
        onCancel={() => {
          setConfirmTransferDialog(false);
          setSelectedTransferWorker(null);
        }}
        onOk={() => handleTransferRequest(selectedTransferWorker)}
        updating={requestingWorkerId === selectedTransferWorker?.id}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {selectedTransferWorker && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(30, 30, 40, 0.5)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  flexFlow: "column",
                  gap: "0.35rem",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", marginBottom: "" }}>
                  {selectedTransferWorker.name}
                </h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  {selectedTransferWorker.company}
                </p>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.9rem",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedTransferWorker.projectCode || "No Project"}{" "}
                  <ArrowRight size={16} />
                  {projectCode || "No Project"}
                </p>
              </div>
            )}
          </div>
        }
      />

      {/* Rejection Dialog */}
      <DefaultDialog
        title="Reject Transfer Request"
        titleIcon={<X color="salmon" />}
        open={rejectDialog}
        onCancel={() => {
          setRejectDialog(false);
          setRejectComment("");
          setRejectingRequestId("");
        }}
        onOk={handleRejectWithComment}
        OkButtonText="Reject"
        OkButtonDisabled={!rejectComment.trim()}
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Comment</p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Enter rejection reason..."
              style={{
                width: "100%",
                minHeight: "5rem",
                background: "rgba(40, 40, 50, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0.375rem",
                padding: "0.75rem",
                fontSize: "0.9rem",
                color: "white",
                resize: "vertical",
              }}
              autoFocus
            />
          </div>
        }
      />
    </div>
  );
}
