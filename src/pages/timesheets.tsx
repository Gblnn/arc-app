import Back from "@/components/back";
import CustomDropdown from "@/components/custom-dropdown";
import DefaultDialog from "@/components/default-dialog";
import RefreshButton from "@/components/refresh-button";
import { db } from "@/firebase";
import * as XLSX from "@e965/xlsx";
import { message } from "antd";
import { saveAs } from "file-saver";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Clock,
  FileDown,
  ListX,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

// Add cache outside component to persist between renders
// 1.5 seconds between requests

// Add interfaces for location data
interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

// Outside component, reset these
const requestQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;
let pendingAddresses = new Set<string>(); // Use Set to track unique requests

const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      await request();
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  isProcessingQueue = false;
  pendingAddresses.clear(); // Clear the set when done
};

export default function Records() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editTimeDialog, setEditTimeDialog] = useState(false);
  const [refreshCompleted, setRefreshCompleted] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // const [selectedTime, setSelectedTime] = useState("");
  const [selectedID, setSelectedID] = useState("");
  const [time, setTime] = useState("");
  const [timeType, setTimeType] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // const [selectedStart, setSelectedStart] = useState("");
  // const [selectedEnd, setSelectedEnd] = useState("");

  useEffect(() => {
    fetchRecords();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const RecordCollection = collection(db, "users");
      const recordQuery = query(
        RecordCollection,
        where("role", "==", "profile")
      );
      const querySnapshot = await getDocs(recordQuery);
      setLoading(false);
      const fetchedData: any = [];
      querySnapshot.forEach((doc: any) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });

      setUsers(fetchedData);
    } catch (error) {}
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "records")), () => {
      fetchRecords();
    });

    return () => unsubscribe();
  }, []);

  const exportDb = useCallback(async () => {
    const exportData = records.map((e: any) => {
      const allocated_hours = e.allocated_hours;
      const start = e.start.toDate();
      const end = e.end ? e.end.toDate() : null;
      const total = end
        ? (moment(end).diff(moment(start), "minutes") / 60).toFixed(2)
        : "-";
      const overtime =
        end && Number(total) > allocated_hours
          ? Number(total) - allocated_hours
          : "-";

      return {
        name: e.name,
        date: moment(start).format("DD/MM/YYYY"),
        start: moment(start).format("hh:mm A"),
        end: end ? moment(end).format("hh:mm A") : "-",
        total,
        overtime,
      };
    });

    // Calculate total hours and overtime
    const totalHours = exportData.reduce((sum: any, record: any) => {
      return sum + (record.total !== "-" ? Number(record.total) : 0);
    }, 0);

    const totalOT = exportData.reduce((sum: any, record: any) => {
      return sum + (record.overtime !== "-" ? Number(record.overtime) : 0);
    }, 0);

    // Append totals to the export data
    exportData.push({
      name: "Total",
      date: "",
      start: "",
      end: "",
      total: totalHours.toFixed(2),
      overtime: totalOT.toFixed(2),
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      header: ["name", "date", "start", "end", "total", "overtime"],
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileName = `Timesheet(${moment().format("DD/MM/YYYY")}).xlsx`;
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      fileName
    );
    window.location.reload();
  }, [records]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const RecordCollection = collection(db, "records");
      let conditions: any[] = [orderBy("start", "desc")];

      // Add user filter if selected
      if (selectedUser) {
        conditions.unshift(where("name", "==", selectedUser));
      }

      // Add month filter if selected
      if (selectedMonth) {
        const startOfMonth = moment()
          .month(Number(selectedMonth) - 1)
          .startOf("month")
          .toDate();
        const endOfMonth = moment()
          .month(Number(selectedMonth) - 1)
          .endOf("month")
          .toDate();

        conditions.unshift(
          where("start", ">=", Timestamp.fromDate(startOfMonth)),
          where("start", "<=", Timestamp.fromDate(endOfMonth))
        );
      }

      // Apply all conditions in a single query
      const recordQuery = query(RecordCollection, ...conditions);
      const querySnapshot = await getDocs(recordQuery);

      const fetchedData: any = [];
      querySnapshot.forEach((doc: any) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });

      setRecords(fetchedData);
      setRefreshCompleted(true);
      setTimeout(() => {
        setRefreshCompleted(false);
      }, 1000);
    } catch (error) {
      message.error("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to trigger fetch when filters change
  useEffect(() => {
    fetchRecords();
  }, [selectedUser, selectedMonth]);

  const deleteSelected = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "records", selectedID));
      setLoading(false);
      setDeleteDialog(false);
    } catch (error) {
      setDeleteDialog(false);
      message.error("Errors Logged");
      setLoading(false);
    }
  };

  const updateTime = useCallback(async () => {
    try {
      setLoading(true);
      const timestamp = Timestamp.fromDate(moment(time, "hh:mm").toDate());
      const recordRef = doc(db, "records", selectedID);

      const updates: any = {
        [timeType]: timestamp,
      };

      const recordSnap = await getDoc(recordRef);
      if (recordSnap.exists()) {
        const record = recordSnap.data();
        const start =
          timeType === "start" ? timestamp.toDate() : record.start?.toDate();
        const end =
          timeType === "end" ? timestamp.toDate() : record.end?.toDate();

        if (start && end) {
          const total = Number(
            (moment(end).diff(moment(start), "minutes") / 60).toFixed(2)
          );
          const overtime = total > 10 ? Number((total - 10).toFixed(2)) : null;

          if (overtime !== null) {
            updates.overtime = overtime;
          }
          updates.total = total;
        }
      }

      await updateDoc(recordRef, updates);
      setLoading(false);
      setEditTimeDialog(false);
      setTime("");
    } catch (error) {
      setLoading(false);
      message.error("Errors Logged");
    }
  }, [selectedID, time, timeType]);

  const Deallocate = async () => {
    try {
      timeType == "start"
        ? message.info("Cannot Deallocate Start Time")
        : timeType == "end"
        ? await updateDoc(doc(db, "records", selectedID), {
            end: "",
            status: true,
          })
        : {};
    } catch (error) {}
  };

  // const months = Array.from({ length: 12 }, (i: any) => {
  //   return new Date(0, i).toLocaleString("en-US", { month: "long" });
  // });

  // Memoize the record calculations
  const processedRecords = useMemo(() => {
    return records.map((e: any) => {
      const start = e.start.toDate();
      const end = e.end ? e.end.toDate() : null;
      const total = end
        ? (moment(end).diff(moment(start), "minutes") / 60).toFixed(2)
        : "-";
      const allocatedHours = e.allocated_hours;

      const overtime =
        end && Number(total) > Number(allocatedHours)
          ? (Number(total) - Number(allocatedHours)).toFixed(2)
          : "-";

      return {
        ...e,
        formattedDate: moment(start).format("DD/MM/YY"),
        formattedStart: moment(start).format("hh:mm A"),
        formattedEnd: end ? moment(end).format("hh:mm A") : "-",
        total,
        formattedOvertime: overtime,
      };
    });
  }, [records]);

  // Memoize handlers
  const handleDeleteClick = useCallback((record: any) => {
    setDeleteDialog(true);
    setSelectedName(record.name);
    setSelectedDate(moment(record.start.toDate()).format("DD/MM/YYYY"));
    setSelectedID(record.id);
  }, []);

  const handleTimeClick = useCallback((record: any, type: "start" | "end") => {
    setTimeType(type);
    setEditTimeDialog(true);
    if (type === "start") {
      setTime(moment(record.start).format("HH:MM A"));
    }
    setSelectedID(record.id);
  }, []);

  // Update the dropdown onChange handlers to not clear other filters
  const handleUserChange = (value: string) => {
    setSelectedUser(value);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
  };

  const getAddressFromCoords = async (
    location: Location,
    recordId: string,
    locationType: "startLocation" | "endLocation"
  ) => {
    // If address is already cached in the location object, return it
    if (location.address) {
      return location.address;
    }

    // Create unique key for this request
    const requestKey = `${recordId}-${locationType}`;

    // If this location is already being processed, don't add it again
    if (pendingAddresses.has(requestKey)) {
      return null;
    }

    const performRequest = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const address = data.display_name;

        // Update Firestore with the cached address
        const recordRef = doc(db, "records", recordId);
        await updateDoc(recordRef, {
          [`${locationType}.address`]: address,
        });

        pendingAddresses.delete(requestKey);

        // Update progress notification
        if (pendingAddresses.size > 0) {
          message.loading({
            content: `Caching addresses... (${requestQueue.length} remaining)`,
            key: "address-caching-progress",
            duration: 0,
          });
        } else {
          // Show completion message when all requests are done
          // const totalProcessed = requestQueue.length + 1;
          message.success({
            content: `Caching Complete`,
            key: "address-caching-progress",
            duration: 2,
          });
        }

        return address;
      } catch (error) {
        console.error("Error fetching address:", error);
        pendingAddresses.delete(requestKey);
        return null;
      }
    };

    // Add request to queue if it's not already there
    pendingAddresses.add(requestKey);

    if (pendingAddresses.size === 1) {
      // Show initial loading message only for the first request
      message.loading({
        content: "Caching addresses...",
        key: "address-caching-progress",
        duration: 0,
      });
    }

    requestQueue.push(performRequest);
    processQueue(); // Start processing if not already running

    return new Promise((resolve) => {
      const checkResult = setInterval(() => {
        if (location.address) {
          clearInterval(checkResult);
          resolve(location.address);
        }
      }, 100);
    });
  };

  // Create a new LocationDisplay component with better error handling
  const LocationDisplay = memo(
    ({
      location,
      recordId,
      locationType,
    }: {
      location: Location | undefined;
      recordId: string;
      locationType: "startLocation" | "endLocation";
    }) => {
      const [address, setAddress] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        let isMounted = true;

        const fetchAddress = async () => {
          if (!location) return;

          setIsLoading(true);
          setError(null);

          try {
            const addr = await getAddressFromCoords(
              location,
              recordId,
              locationType
            );
            if (isMounted) {
              setAddress(addr as string);
            }
          } catch (err) {
            if (isMounted) {
              setError("Failed to fetch address");
            }
          } finally {
            if (isMounted) {
              setIsLoading(false);
            }
          }
        };

        fetchAddress();

        return () => {
          isMounted = false;
        };
      }, [location, recordId, locationType]);

      if (!location) return <span>-</span>;

      const coords = `${location.latitude.toFixed(
        6
      )}, ${location.longitude.toFixed(6)}`;
      const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

      return (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            flexDirection: "column",
          }}
          className="hover:underline"
          title={address || coords}
        >
          <span>{coords}</span>
          {isLoading && (
            <span style={{ fontSize: "0.8em", color: "#94a3b8" }}>
              Loading...
            </span>
          )}
          {error && (
            <span style={{ fontSize: "0.8em", color: "#ef4444" }}>{error}</span>
          )}
          {!isLoading && !error && address && (
            <span style={{ fontSize: "0.8em", color: "#94a3b8" }}>
              {address.split(",").slice(0, 2).join(",")}
            </span>
          )}
        </a>
      );
    }
  );

  // Add display name for debugging
  LocationDisplay.displayName = "LocationDisplay";

  // Update the TableRow component to pass recordId to LocationDisplay
  const TableRow = memo(
    ({ record, onDeleteClick, onTimeClick, isAlternate }: any) => {
      return (
        <tr
          style={{
            cursor: "pointer",
            background: isAlternate
              ? "rgba(40, 40, 50, 0.3)"
              : "rgba(30, 30, 40, 0.2)",
          }}
        >
          <td
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "0.45rem",
              fontWeight: "600",
              color: !record.end ? "rgb(132, 204, 22)" : "white",
              padding: "0.75rem",
              paddingLeft: "1.5rem",
              borderLeft: !record.end
                ? "3px solid rgb(132, 204, 22)"
                : "3px solid transparent",
            }}
            onClick={() => onDeleteClick(record)}
          >
            {record.name.split(" ")[0]}
          </td>
          <td
            style={{ padding: "0.75rem" }}
            onClick={() => onDeleteClick(record)}
          >
            {record.formattedDate}
          </td>
          <td
            style={{
              padding: "0.75rem",
            }}
            onClick={() => onTimeClick(record, "start")}
          >
            {record.formattedStart}
          </td>
          <td
            style={{
              padding: "0.75rem",
            }}
            onClick={() => onTimeClick(record, "end")}
          >
            {record.formattedEnd}
          </td>
          <td
            style={{ padding: "0.75rem" }}
            onClick={() => onDeleteClick(record)}
          >
            {record.total}
          </td>
          <td
            style={{
              padding: "0.75rem",
              color: record.formattedOvertime !== "-" ? "rgb(239, 68, 68)" : "",
            }}
          >
            {record.formattedOvertime}
          </td>
          <td
            style={{ padding: "0.75rem" }}
            title={
              record.startLocation
                ? `Accuracy: ${record.startLocation.accuracy}m`
                : ""
            }
            onClick={(e) => e.stopPropagation()}
          >
            <LocationDisplay
              location={record.startLocation}
              recordId={record.id}
              locationType="startLocation"
            />
          </td>
          <td
            style={{ padding: "0.75rem" }}
            title={
              record.endLocation
                ? `Accuracy: ${record.endLocation.accuracy}m`
                : ""
            }
            onClick={(e) => e.stopPropagation()}
          >
            <LocationDisplay
              location={record.endLocation}
              recordId={record.id}
              locationType="endLocation"
            />
          </td>
        </tr>
      );
    }
  );

  // Create memoized options for users dropdown
  const userOptions = useMemo(() => {
    return users.map((user: any) => ({
      value: user.name,
      label: user.name,
    }));
  }, [users]);

  // Create memoized options for months dropdown
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = new Date(0, i).toLocaleString("en-US", { month: "long" });
      return {
        value: String(i + 1),
        label: month,
      };
    });
  }, []);

  // Calculate total hours and overtime
  const totalHours = processedRecords.reduce((sum: any, record: any) => {
    return sum + (record.total !== "-" ? Number(record.total) : 0);
  }, 0);

  const totalOT = processedRecords.reduce((sum: any, record: any) => {
    return (
      sum +
      (record.formattedOvertime !== "-" ? Number(record.formattedOvertime) : 0)
    );
  }, 0);

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column" }}>
      {/* Fixed Header */}
      <div
        style={{
          padding: "1.25rem",
          paddingBottom: "1rem",
          background: "rgba(30, 30, 40, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          zIndex: 40,
        }}
      >
        <Back
          title={"Timesheet"}
          extra={
            <div
              style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            >
              <button
                onClick={exportDb}
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
                }}
                className="hover:bg-opacity-30"
              >
                <FileDown color="lightgreen" width={"1.25rem"} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <RefreshButton
                fetchingData={loading}
                onClick={fetchRecords}
                refreshCompleted={refreshCompleted}
              />
            </div>
          }
        />
      </div>

      {/* Fixed Dropdowns */}
      <div
        style={{
          padding: "1rem",
          background: "rgba(40, 40, 50, 0.5)",
          display: "flex",
          gap: "1rem",
          zIndex: 30,
          justifyContent: "stretch",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div style={{ flex: 1 }}>
          <label className="text-xs text-gray-400 mb-1 block">Employee</label>
          <CustomDropdown
            value={selectedUser}
            onChange={handleUserChange}
            options={userOptions}
            placeholder="Select Name"
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="text-xs text-gray-400 mb-1 block">Period</label>
          <CustomDropdown
            value={selectedMonth}
            onChange={handleMonthChange}
            options={monthOptions}
            placeholder="Select Month"
          />
        </div>
      </div>

      {/* Table Container with fixed header and scrollable body */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {!loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                fontSize: "0.85rem",
                borderCollapse: "separate",
                borderSpacing: "0",
                position: "relative",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(25, 25, 35, 0.95)",
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      paddingLeft: "1.5rem",
                    }}
                  >
                    Name
                  </th>
                  <th style={{ padding: "0.75rem" }}>Date</th>
                  <th style={{ padding: "0.75rem" }}>Start</th>
                  <th style={{ padding: "0.75rem" }}>End</th>
                  <th style={{ padding: "0.75rem" }}>Total</th>
                  <th style={{ padding: "0.75rem" }}>OT</th>
                  <th style={{ padding: "0.75rem" }}>Start Location</th>
                  <th style={{ padding: "0.75rem" }}>End Location</th>
                </tr>
              </thead>
              <tbody
                style={{
                  textAlign: "center",
                  background: "transparent",
                }}
              >
                {processedRecords.map((e: any, index: number) => (
                  <TableRow
                    key={e.id}
                    record={e}
                    onDeleteClick={handleDeleteClick}
                    onTimeClick={handleTimeClick}
                    isAlternate={index % 2 === 1}
                  />
                ))}
                <tr style={{ background: "rgba(100 100 100/ 50%)" }}>
                  <td
                    colSpan={0}
                    style={{ textAlign: "left", fontWeight: "bold" }}
                  >
                    Total Hours
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td style={{ fontWeight: "bold" }}>
                    {totalHours.toFixed(2)}
                  </td>
                  <td style={{ fontWeight: "bold" }}>{totalOT.toFixed(2)}</td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <LoaderCircle
              color="crimson"
              height={"2.5rem"}
              width={"2.5rem"}
              className="animate-spin"
            />
            <p className="text-gray-400 text-sm">Loading timesheet data...</p>
          </div>
        )}
      </div>

      <DefaultDialog
        updating={loading}
        title={"Delete Record?"}
        titleIcon={<Trash2 color="crimson" />}
        OkButtonText="Delete"
        onOk={deleteSelected}
        extra={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "",
              flexFlow: "column",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <br />
            <BriefcaseBusiness color="crimson" width={"2rem"} />
            <p style={{ fontSize: "1.25rem", fontWeight: "600" }}>
              {selectedName}
            </p>
            <p style={{}}>{selectedDate}</p>
            <br />
          </div>
        }
        destructive
        open={deleteDialog}
        onCancel={() => setDeleteDialog(false)}
      />

      <DefaultDialog
        title={"Edit Time"}
        titleIcon={<Clock color="crimson" />}
        OkButtonText="Update"
        open={editTimeDialog}
        onCancel={() => setEditTimeDialog(false)}
        onOk={updateTime}
        updating={loading}
        title_extra={
          <button
            onClick={Deallocate}
            style={{
              fontSize: "0.8rem",
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <ListX width={"1rem"} color="crimson" />
            Deallocate
          </button>
        }
        extra={
          <div style={{ width: "100%", marginTop: "1rem", border: "" }}>
            <input
              style={{ width: "100%", height: "2.5rem" }}
              type="time"
              value={time}
              onChange={(e: any) => setTime(e.target.value)}
              placeholder="Select Time"
            />
          </div>
        }
      />
    </div>
  );
}
