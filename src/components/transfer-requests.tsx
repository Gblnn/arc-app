import {
  ArrowRight,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronRight,
  LoaderCircle,
  Search,
  Square,
  SquareArrowDownLeft,
  SquareArrowUpLeft,
  X,
} from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import CustomDropdown from "./custom-dropdown";
import { motion } from "framer-motion";
import DefaultDialog from "./default-dialog";
import { message } from "antd";

interface Props {
  requests: any[];
  onRespond: (
    requestId: string,
    approved: boolean,
    rejectionReason?: string
  ) => Promise<void>;
  availableWorkers: any[];
  onRequestTransfer: (worker: any) => void;
  projectOptions: { value: string; label: string }[];
  selectedProject: string;
  onProjectChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loadingWorkers?: boolean;
  incomingHandovers: any[];
  outgoingHandovers: any[];
  onRefreshHandovers: () => void;
}

const useWindowSize = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
};

export default function TransferRequests({
  requests,
  onRespond,
  availableWorkers,
  onRequestTransfer,
  searchQuery,
  onSearchChange,
  loadingWorkers = false,
  projectOptions,
  selectedProject,
  onProjectChange,
  incomingHandovers,
  outgoingHandovers,
  onRefreshHandovers,
}: Props) {
  const [view, setView] = useState<"requests" | "available" | "handovers">(
    "requests"
  );
  const [responding, setResponding] = useState<string>("");
  const windowWidth = useWindowSize();
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectDropdownOpen, setSelectDropdownOpen] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingRequest, setRejectingRequest] = useState<string | null>(null);

  const pendingRequestsCount = requests.filter(
    (req) => req.status === "pending"
  ).length;

  const handleResponse = async (requestId: string, approved: boolean) => {
    if (!approved) {
      setRejectingRequest(requestId);
      setRejectDialog(true);
      return;
    }

    try {
      setResponding(requestId);
      await onRespond(requestId, approved);
    } finally {
      setResponding("");
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest || !rejectionReason.trim()) {
      message.error("Please provide a reason for rejection");
      return;
    }

    try {
      setResponding(rejectingRequest);
      await onRespond(rejectingRequest, false, rejectionReason);
      setRejectDialog(false);
      setRejectionReason("");
      setRejectingRequest(null);
    } finally {
      setResponding("");
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleBulkTransfer = () => {
    if (selectedWorkers.length === 0) {
      message.error("Please select workers to transfer");
      return;
    }

    onRequestTransfer(selectedWorkers);

    setSelectedWorkers([]);
    setSelectionMode(false);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "rgba(30, 30, 40, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          padding: "1rem",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
                onClick={() => setView("requests")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  background:
                    view === "requests"
                      ? "rgba(30, 30, 40, 0.95)"
                      : "transparent",
                  color: view === "requests" ? "white" : "#94a3b8",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  position: "relative",
                }}
              >
                Requests
                {pendingRequestsCount > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "crimson",
                    }}
                  />
                )}
              </button>
              <button
                onClick={() => setView("available")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  background:
                    view === "available"
                      ? "rgba(30, 30, 40, 0.95)"
                      : "transparent",
                  color: view === "available" ? "white" : "#94a3b8",
                  transition: "all 0.2s ease",
                }}
              >
                External
              </button>
              <button
                onClick={() => {
                  setView("handovers");
                  onRefreshHandovers();
                }}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.9rem",
                  background:
                    view === "handovers"
                      ? "rgba(30, 30, 40, 0.95)"
                      : "transparent",
                  color: view === "handovers" ? "white" : "#94a3b8",
                  transition: "all 0.2s ease",
                }}
              >
                Handovers
              </button>
            </div>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem 0.5rem 2.5rem",
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

              <div
                style={{
                  display: view === "available" ? "flex" : "none",
                  gap: "1rem",
                  width: "100%",
                  maxWidth: "100%",
                  alignItems: "center",
                }}
              >
                {view === "available" && (
                  <>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        gap: "1px",
                      }}
                    >
                      <button
                        onClick={() => {
                          if (selectionMode && selectedWorkers.length > 0) {
                            setSelectedWorkers([]);
                          }
                          setSelectionMode(!selectionMode);
                        }}
                        style={{
                          padding: "0.45rem 1rem",
                          fontSize: "0.8rem",
                          color: "#94a3b8",
                          background: selectionMode
                            ? "rgba(220, 20, 60, 0.15)"
                            : "rgba(40, 40, 50, 0.5)",
                          borderRadius: selectionMode
                            ? "0.5rem 0 0 0.5rem"
                            : "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          border: selectionMode
                            ? "1px solid rgba(220, 20, 60, 0.3)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          cursor: "pointer",
                          height: "36px",
                          whiteSpace: "nowrap",
                          flex: "0 0 auto",
                        }}
                      >
                        <CheckCircle
                          color="crimson"
                          strokeWidth={3}
                          size={16}
                        />
                        {selectedWorkers.length > 0 ? (
                          <>Selected {selectedWorkers.length}</>
                        ) : selectionMode ? (
                          "Cancel"
                        ) : (
                          "Select"
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (selectionMode) {
                            if (
                              selectedWorkers.length === availableWorkers.length
                            ) {
                              setSelectedWorkers([]);
                            } else {
                              setSelectedWorkers(
                                availableWorkers.map((w) => w.id)
                              );
                            }
                          }
                        }}
                        style={{
                          width: "36px",
                          height: "36px",
                          background: selectionMode
                            ? "rgba(220, 20, 60, 0.15)"
                            : "rgba(40, 40, 50, 0.5)",
                          borderRadius: "0 0.5rem 0.5rem 0",
                          display: selectionMode ? "flex" : "none",
                          alignItems: "center",
                          justifyContent: "center",
                          border: selectionMode
                            ? "1px solid rgba(220, 20, 60, 0.3)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          borderLeft: "none",
                          cursor: selectionMode ? "pointer" : "default",
                          opacity: selectionMode ? 1 : 0.5,
                          padding: 0,
                        }}
                      >
                        {selectionMode &&
                          (selectedWorkers.length ===
                          availableWorkers.length ? (
                            <CheckSquare size={16} color="crimson" />
                          ) : (
                            <Square size={16} color="crimson" />
                          ))}
                      </button>
                    </div>

                    {selectionMode && selectDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "36px",
                          left: 0,
                          background: "rgba(30, 30, 40, 0.95)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "0.5rem",
                          padding: "0.5rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                          minWidth: "150px",
                          zIndex: 100,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkers(
                              availableWorkers.map((w) => w.id)
                            );
                            setSelectDropdownOpen(false);
                          }}
                          style={{
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.8rem",
                            color: "#94a3b8",
                            background: "transparent",
                            borderRadius: "0.375rem",
                            textAlign: "left",
                            cursor: "pointer",
                            border: "none",
                          }}
                          className="hover:bg-[rgba(40,40,50,0.7)]"
                        >
                          Select All
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkers([]);
                            setSelectDropdownOpen(false);
                          }}
                          style={{
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.8rem",
                            color: "#94a3b8",
                            background: "transparent",
                            borderRadius: "0.375rem",
                            textAlign: "left",
                            cursor: "pointer",
                            border: "none",
                          }}
                          className="hover:bg-[rgba(40,40,50,0.7)]"
                        >
                          Deselect All
                        </button>
                      </div>
                    )}
                  </>
                )}

                <CustomDropdown
                  value={selectedProject}
                  onChange={onProjectChange}
                  options={projectOptions}
                  placeholder="Project Code"
                  style={{ flex: 1, minWidth: 0, maxWidth: "100%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "1rem" }}>
        {view === "requests" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {requests.map((request) => (
              <div
                key={request.id}
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
                    flexDirection: windowWidth > 768 ? "row" : "column",
                    gap: "1rem",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {request.type === "incoming" ? (
                        <SquareArrowUpLeft />
                      ) : (
                        <SquareArrowDownLeft />
                      )}
                      <h3
                        style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}
                      >
                        {request.workerName}
                      </h3>
                    </div>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                      }}
                    >
                      {request.type === "incoming" ? (
                        <span style={{ color: "" }}>
                          Request to take worker
                        </span>
                      ) : (
                        <span style={{ color: "", fontWeight: "medium" }}>
                          Request for Worker
                        </span>
                      )}
                      {" • "}
                      {request.status === "pending" ? (
                        <span
                          style={{ color: "goldenrod", fontWeight: "bold" }}
                        >
                          Pending
                        </span>
                      ) : request.status === "approved" ? (
                        <span
                          style={{ color: "lightgreen", fontWeight: "bold" }}
                        >
                          Approved
                        </span>
                      ) : (
                        <span style={{ color: "crimson", fontWeight: "bold" }}>
                          Declined
                        </span>
                      )}
                    </p>
                    <p
                      style={{
                        color: "",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {request.fromProject || "No Project"}{" "}
                      <ArrowRight width={"0.8rem"} />{" "}
                      {request.toProject || "No Project"}
                    </p>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {request.type === "incoming" ? (
                        <>Requested by supervisor from {request.toProject}</>
                      ) : (
                        <>
                          You requested from supervisor of {request.fromProject}
                        </>
                      )}
                      {" • "}
                      {moment(request.requestDate.toDate()).fromNow()}
                    </p>
                    {request.status === "rejected" &&
                      request.rejectionReason && (
                        <p
                          style={{
                            marginTop: "0.5rem",
                            padding: "0.75rem",
                            background: "rgba(220, 20, 60, 0.1)",
                            border: "1px solid rgba(220, 20, 60, 0.2)",
                            borderRadius: "0.375rem",
                            color: "#94a3b8",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: "salmon",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <ChevronRight size={15} />{" "}
                          </span>{" "}
                          {request.rejectionReason}
                        </p>
                      )}
                  </div>

                  {request.type === "incoming" &&
                    request.status === "pending" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          alignSelf: windowWidth > 768 ? "center" : "stretch",
                          minWidth: windowWidth > 768 ? "200px" : "auto",
                        }}
                      >
                        <button
                          onClick={() => handleResponse(request.id, true)}
                          disabled={!!responding}
                          style={{
                            flex: windowWidth > 768 ? "0 1 auto" : 1,
                            padding: "0.5rem 1rem",
                            background: "rgba(50, 180, 50, 0.15)",
                            borderRadius: "0.375rem",
                            opacity: responding ? 0.5 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            border: "1px solid rgba(50, 180, 50, 0.2)",
                            color: "lightgreen",
                            fontSize: "0.9rem",
                            transition: "all 0.2s ease",
                            cursor: responding ? "not-allowed" : "pointer",
                            minWidth: windowWidth > 768 ? "90px" : "auto",
                          }}
                          className="hover:bg-[rgba(50,180,50,0.25)] hover:border-[rgba(50,180,50,0.3)]"
                        >
                          {responding === request.id ? (
                            <LoaderCircle className="animate-spin" size={16} />
                          ) : (
                            <>
                              <Check size={16} />
                              <span>Approve</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleResponse(request.id, false)}
                          disabled={!!responding}
                          style={{
                            flex: windowWidth > 768 ? "0 1 auto" : 1,
                            padding: "0.5rem 1rem",
                            background: "rgba(220, 20, 60, 0.15)",
                            borderRadius: "0.375rem",
                            opacity: responding ? 0.5 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem",
                            border: "1px solid rgba(220, 20, 60, 0.2)",
                            color: "salmon",
                            fontSize: "0.9rem",
                            transition: "all 0.2s ease",
                            cursor: responding ? "not-allowed" : "pointer",
                            minWidth: windowWidth > 768 ? "90px" : "auto",
                          }}
                          className="hover:bg-[rgba(220,20,60,0.25)] hover:border-[rgba(220,20,60,0.3)]"
                        >
                          {responding === request.id ? (
                            <LoaderCircle className="animate-spin" size={16} />
                          ) : (
                            <>
                              <X size={16} />
                              <span>Decline</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#94a3b8",
                }}
              >
                No transfer requests found
              </div>
            )}
          </div>
        ) : view === "available" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {loadingWorkers ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#94a3b8",
                }}
              >
                Loading workers...
              </div>
            ) : availableWorkers.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#94a3b8",
                }}
              >
                No workers available from other sites
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    windowWidth >= 768
                      ? "repeat(auto-fill, minmax(300px, 1fr))"
                      : "1fr",
                  gap: "1rem",
                }}
              >
                {availableWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    onClick={() =>
                      selectionMode && toggleWorkerSelection(worker.id)
                    }
                    style={{
                      padding: "1rem",
                      background: "rgba(30, 30, 40, 0.5)",
                      borderRadius: "0.5rem",
                      border: selectedWorkers.includes(worker.id)
                        ? "2px solid crimson"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: selectionMode ? "pointer" : "default",
                      transition: "all 0.2s ease",
                      height: "fit-content",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            width: "2.5rem",
                            height: "2.5rem",
                            borderRadius: "0.5rem",
                            background: "rgba(220, 20, 60, 0.15)",
                            border: "1px solid rgba(220, 20, 60, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "salmon",
                            fontSize: "1.1rem",
                            fontWeight: "500",
                          }}
                        >
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3
                            style={{
                              fontSize: "1.1rem",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {worker.name}
                          </h3>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "0.9rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span style={{ color: "" }}>
                              {worker.projectCode || "No Project"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRequestTransfer(worker);
                        }}
                        style={{
                          padding: "0.75rem",
                          background: selectedWorkers.includes(worker.id)
                            ? "rgba(220, 20, 60, 0.15)"
                            : "rgba(40, 40, 50, 0.5)",
                          borderRadius: "0.375rem",
                          fontSize: "0.9rem",
                          color: selectedWorkers.includes(worker.id)
                            ? "crimson"
                            : "#94a3b8",
                          border: selectedWorkers.includes(worker.id)
                            ? "1px solid rgba(220, 20, 60, 0.3)"
                            : "1px solid rgba(255, 255, 255, 0.1)",
                          display: selectionMode ? "none" : "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.5rem",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          width: "100%",
                        }}
                        className="hover:bg-[rgba(40,40,50,0.7)]"
                      >
                        <SquareArrowDownLeft size={18} />
                        Request Transfer
                      </button>
                    </div>
                  </div>
                ))}

                {selectedWorkers.length > 0 && (
                  <button
                    onClick={handleBulkTransfer}
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: "rgba(30, 144, 255, 0.15)",
                      borderRadius: "0.375rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <SquareArrowDownLeft size={18} />
                    Transfer Selected ({selectedWorkers.length})
                  </button>
                )}
              </div>
            )}
          </div>
        ) : view === "handovers" ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
          >
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
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    windowWidth >= 768
                      ? "repeat(auto-fill, minmax(350px, 1fr))"
                      : "1fr",
                  gap: "1rem",
                }}
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
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    windowWidth >= 768
                      ? "repeat(auto-fill, minmax(350px, 1fr))"
                      : "1fr",
                  gap: "1rem",
                }}
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
        ) : (
          ""
        )}
      </div>

      <DefaultDialog
        title="Reject Transfer Request"
        open={rejectDialog}
        onCancel={() => {
          setRejectDialog(false);
          setRejectionReason("");
          setRejectingRequest(null);
        }}
        onOk={handleReject}
        OkButtonText="Reject Transfer"
        updating={!!responding}
        destructive
        extra={
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div></div>
            {/* Request Info Section */}
            <div
              style={{
                padding: "1rem",
                background: "rgba(220, 20, 60, 0.05)",
                border: "1px solid rgba(220, 20, 60, 0.2)",
                borderRadius: "0.5rem",
              }}
            >
              <div
                style={{
                  marginBottom: "0.5rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexFlow: "column",
                }}
              >
                <h4 style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                  {requests.find((r) => r.id === rejectingRequest)?.workerName}
                </h4>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {requests.find((r) => r.id === rejectingRequest)
                    ?.fromProject || "No Project"}
                  <ArrowRight size={12} />
                  {requests.find((r) => r.id === rejectingRequest)?.toProject ||
                    "No Project"}
                </p>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                Clarification Notes
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Add Comment..."
                style={{
                  padding: "0.75rem",
                  background: "rgba(40, 40, 50, 0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "0.9rem",
                  minHeight: "100px",
                  resize: "vertical",
                }}
              />
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  marginTop: "0.25rem",
                }}
              >
                This reason will be visible to the requesting supervisor
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
