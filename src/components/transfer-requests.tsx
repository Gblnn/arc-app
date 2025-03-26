import {
  ArrowRight,
  Check,
  CheckCircle,
  CheckSquare,
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

interface Props {
  requests: any[];
  onRespond: (requestId: string, approved: boolean) => Promise<void>;
  availableWorkers: any[];
  onRequestTransfer: (worker: any) => void;
  projectOptions: { value: string; label: string }[];
  selectedProject: string;
  onProjectChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  loadingWorkers?: boolean;
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
}: Props) {
  const [view, setView] = useState<"requests" | "available">("requests");
  const [responding, setResponding] = useState<string>("");
  const windowWidth = useWindowSize();
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectDropdownOpen, setSelectDropdownOpen] = useState(false);

  const handleResponse = async (requestId: string, approved: boolean) => {
    try {
      setResponding(requestId);
      await onRespond(requestId, approved);
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
                }}
              >
                Requests
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
                Available Workers
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
                          "Select Workers"
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
                            <CheckSquare size={16} color="#94a3b8" />
                          ) : (
                            <Square size={16} color="#94a3b8" />
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
                        <span style={{ color: "orange", fontWeight: "bold" }}>
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
                          Rejected
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
                          }}
                        >
                          <span style={{ color: "salmon", fontWeight: "500" }}>
                            Rejection reason:
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
        ) : (
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
                  display: "flex",
                  flexDirection: "column",
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
                          display: selectedWorkers.length > 0 ? "none" : "flex",
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
                    onClick={() =>
                      onRequestTransfer(
                        availableWorkers.filter((w) =>
                          selectedWorkers.includes(w.id)
                        )
                      )
                    }
                    style={{
                      position: "fixed",
                      bottom: "2rem",
                      right: "2rem",
                      padding: "1rem",
                      background: "crimson",
                      borderRadius: "0.5rem",
                      fontSize: "0.9rem",

                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                      zIndex: 50,
                    }}
                    className="hover:bg-[rgba(40,40,50,0.7)]"
                  >
                    <SquareArrowDownLeft size={18} />
                    Transfer ({selectedWorkers.length})
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
