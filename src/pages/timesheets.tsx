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
      const start = e.start.toDate();
      const end = e.end ? e.end.toDate() : null;
      const total = end
        ? (moment(end).diff(moment(start), "minutes") / 60).toFixed(2)
        : "-";
      const overtime = end && Number(total) > 10 ? Number(total) - 10 : "-";

      return {
        name: e.name,
        date: moment(start).format("DD/MM/YYYY"),
        start: moment(start).format("hh:mm A"),
        end: end ? moment(end).format("hh:mm A") : "-",
        total,
        overtime,
      };
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
      const overtime =
        end && Number(total) > 10 ? (Number(total) - 10).toFixed(2) : "-";

      return {
        ...e,
        formattedDate: moment(start).format("DD/MM/YY"),
        formattedStart: moment(start).format("hh:mm A"),
        formattedEnd: end ? moment(end).format("hh:mm A") : "-",
        total,
        overtime,
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

  const TableRow = memo(({ record, onDeleteClick, onTimeClick }: any) => {
    return (
      <tr className="active:bg-slate-800" style={{ cursor: "pointer" }}>
        <td
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.45rem",
            fontWeight: "600",
            color: !record.end ? "lightgreen" : "",
            padding: "1rem",
          }}
          onClick={() => onDeleteClick(record)}
        >
          {record.name.split(" ")[0]}
        </td>
        <td style={{ padding: "1rem" }} onClick={() => onDeleteClick(record)}>
          {record.formattedDate}
        </td>
        <td
          className="active:bg-slate-600"
          style={{ padding: "1rem" }}
          onClick={() => onTimeClick(record, "start")}
        >
          {record.formattedStart}
        </td>
        <td
          className="active:bg-slate-600"
          style={{ padding: "1rem" }}
          onClick={() => onTimeClick(record, "end")}
        >
          {record.formattedEnd}
        </td>
        <td style={{ padding: "1rem" }} onClick={() => onDeleteClick(record)}>
          {record.total}
        </td>
        <td style={{ padding: "1rem" }}>{record.overtime}</td>
      </tr>
    );
  });

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

  return (
    <div style={{ height: "100svh", display: "flex", flexDirection: "column" }}>
      {/* Fixed Header */}
      <div
        style={{
          padding: "1.25rem",
          paddingBottom: "1rem",
          background: "rgba(60 60 60/ 75%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 40,
        }}
      >
        <Back
          title={"Timesheet"}
          extra={
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <button
                onClick={exportDb}
                style={{
                  backdropFilter: "none",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  fontSize: "0.8rem",
                  height: "2.75rem",
                }}
              >
                <FileDown color="lightgreen" width={"1.25rem"} />
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
          background: "rgba(100 100 100/ 20%)",
          display: "flex",
          gap: "1rem",
          zIndex: 30,
          justifyContent: "center",
        }}
      >
        <div style={{ width: "200px" }}>
          <CustomDropdown
            value={selectedUser}
            onChange={handleUserChange}
            options={userOptions}
            placeholder="Select User"
          />
        </div>
        <div style={{ width: "200px" }}>
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
                fontSize: "0.8rem",
                borderCollapse: "collapse",
                position: "relative",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(18 18 18/ 55%)",
                    position: "sticky",
                    top: 0,
                    zIndex: 20,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                  }}
                >
                  <th style={{ padding: "1rem" }}>Name</th>
                  <th style={{ padding: "1rem" }}>Date</th>
                  <th style={{ padding: "1rem" }}>Start</th>
                  <th style={{ padding: "1rem" }}>End</th>
                  <th style={{ padding: "1rem" }}>Total</th>
                  <th style={{ padding: "1rem" }}>OT</th>
                </tr>
              </thead>
              <tbody
                style={{
                  textAlign: "center",
                  background: "rgba(100 100 100/ 10%)",
                }}
              >
                {processedRecords.map((e: any) => (
                  <TableRow
                    key={e.id}
                    record={e}
                    onDeleteClick={handleDeleteClick}
                    onTimeClick={handleTimeClick}
                  />
                ))}
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
            }}
          >
            <LoaderCircle
              color="crimson"
              height={"3rem"}
              width={"3rem"}
              className="animate-spin"
            />
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
