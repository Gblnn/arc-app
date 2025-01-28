import Back from "@/components/back";
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
import { useEffect, useState } from "react";

export default function Records() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any>([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editTimeDialog, setEditTimeDialog] = useState(false);
  const [refreshCompleted, setRefreshCompleted] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // const [selectedTime, setSelectedTime] = useState("");
  const [selectedID, setSelectedID] = useState("");
  const [time, setTime] = useState("");
  const [timeType, setTimeType] = useState("");

  // const [selectedStart, setSelectedStart] = useState("");
  // const [selectedEnd, setSelectedEnd] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    onSnapshot(query(collection(db, "records")), (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          fetchRecords();
        }
        if (change.type === "modified") {
          fetchRecords();
        }
        if (change.type === "removed") {
          fetchRecords();
        }
      });
    });
  }, []);

  const exportDb = async () => {
    const myHeader = ["name", "date", "start", "end", "total", "overtime"];
    records.forEach((e: any) => {
      const start = e.start.toDate();
      const end = e.end != "" ? e.end.toDate() : "";
      const total = e.end
        ? (moment(end).diff(moment(start), "minutes") / 60).toFixed(2)
        : "-";
      //date
      e.date = String(moment(e.start.toDate()).format("DD/MM/YYYY"));
      //start
      e.start = e.start
        ? e.start && moment(e.start.toDate()).format("hh:mm A")
        : "-";
      //end
      e.end = e.end != "" ? moment(e.end.toDate()).format("hh:mm A") : "-";

      e.total = total;

      e.overtime = Number(total) > 10 ? Number(total) - 10 : "-";

      delete e.id;
      delete e.status;
      delete e.email;
    });
    const worksheet = XLSX.utils.json_to_sheet(records, {
      header: myHeader,
    });
    const workbook = XLSX.utils.book_new();

    const range = XLSX.utils.decode_range(String(worksheet["!ref"]));
    range.e["c"] = myHeader.length - 1;
    worksheet["!ref"] = XLSX.utils.encode_range(range);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(
      blob,
      "Timesheet(" + String(moment().format("DD/MM/YYYY")) + ").xlsx"
    );
    window.location.reload();
  };

  const fetchRecords = async () => {
    setLoading(true);
    const RecordCollection = collection(db, "records");
    const recordQuery = query(RecordCollection, orderBy("start", "desc"));
    const querySnapshot = await getDocs(recordQuery);
    setLoading(false);
    const fetchedData: any = [];
    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    setRecords(fetchedData);

    setRefreshCompleted(true);
    setTimeout(() => {
      setRefreshCompleted(false);
    }, 1000);
  };

  const deleteSelected = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "records", selectedID));
      setLoading(false);
      setDeleteDialog(false);
    } catch (error) {
      setDeleteDialog(false);
      message.error("Errors Logged");
      console.log(error);
      setLoading(false);
    }
  };

  const updateTime = async () => {
    try {
      const timestamp = Timestamp.fromDate(moment(time, "hh:mm").toDate());
      let updates = {};
      setLoading(true);
      if (timeType == "start") {
        await updateDoc(doc(db, "records", selectedID), { start: timestamp });
      } else if (timeType == "end") {
        await updateDoc(doc(db, "records", selectedID), { end: timestamp });
      }

      const recordRef = doc(db, "records", selectedID);
      const recordSnap = await getDoc(recordRef);
      if (recordSnap.exists()) {
        const record = recordSnap.data();
        const start = record.start ? record.start.toDate() : null;
        const end = record.end ? record.end.toDate() : null;

        if (timeType === "start" && end) {
          const total = Number(
            (
              moment(end).diff(moment(timestamp.toDate()), "minutes") / 60
            ).toFixed(2)
          );

          const overtime =
            Number(total) > 10 ? Number((total - 10).toFixed(2)) : "";

          updates = { ...updates, total, overtime };
        } else if (timeType === "end" && start) {
          const total = Number(
            (
              moment(timestamp.toDate()).diff(moment(start), "minutes") / 60
            ).toFixed(2)
          );

          const overtime =
            Number(total) > 10 ? Number((total - 10).toFixed(2)) : "";

          updates = { ...updates, total, overtime };
        }
      }

      await updateDoc(recordRef, updates);

      // timeType == "start"
      //   ? await updateDoc(doc(db, "records", selectedID), { start: timestamp })
      //   : timeType == "end"
      //   ? await updateDoc(doc(db, "records", selectedID), { end: timestamp })
      //   : {};

      setLoading(false);
      setEditTimeDialog(false);
      setTime("");
    } catch (error) {
      setLoading(false);
      message.error("Errors Logged");
      console.log(error);
    }
  };

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
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{ padding: "", display: "flex", flexFlow: "column" }}>
      <div
        className=""
        style={{
          border: "",
          padding: "1.25rem",
          paddingBottom: "1rem",
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: "rgba(60 60 60/ 75%)",
          // borderBottom: "1px solid rgba(100 100 100/ 40%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <Back
          title={"Timesheet"}
          noblur
          // subtitle={records.length}
          extra={
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                alignItems: "center",
              }}
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

      <div></div>

      <div
        style={{
          width: "auto",
          border: "",
          height: "",
          padding: "",
          display: "flex",
          flexFlow: "column",
        }}
      >
        {!loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            style={{ display: "flex", flexFlow: "column", padding: "" }}
          >
            <table
              style={{
                width: "auto",
                fontSize: "0.8rem",
                position: "sticky",

                height: "",
              }}
            >
              <thead style={{}}>
                <tr
                  style={{
                    background: "rgba(100 100 100/ 40%)",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <th>Name</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Total</th>
                  <th style={{}}>OT</th>
                </tr>
              </thead>
              <tbody
                style={{
                  textAlign: "center",
                  background: "rgba(100 100 100/ 10%)",
                  overflowY: "scroll",
                  height: "",
                  border: "",
                }}
              >
                {records.map((e: any) => (
                  <tr
                    className="active:bg-slate-800"
                    key={e.id}
                    style={{ cursor: "pointer" }}
                  >
                    <td
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.45rem",
                        fontWeight: "600",
                        color: !e.end ? "lightgreen" : "",
                      }}
                      onClick={() => {
                        setDeleteDialog(true);
                        setSelectedName(e.name);
                        setSelectedDate(
                          moment(e.start.toDate()).format("DD/MM/YYYY")
                        );
                        setSelectedID(e.id);
                      }}
                    >
                      {/* {!e.end && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Dot
                            style={{ position: "absolute", scale: "2" }}
                            className="animate-ping"
                            color="lightgreen"
                          />
                          <Dot color="lightgreen" />
                        </div>
                      )} */}

                      {e.name.split(" ")[0]}
                    </td>

                    {/* DATE */}
                    <td
                      onClick={() => {
                        setDeleteDialog(true);
                        setSelectedName(e.name);
                        setSelectedDate(
                          moment(e.start.toDate()).format("DD/MM/YYYY")
                        );
                        setSelectedID(e.id);
                      }}
                    >
                      {moment(e.start.toDate()).format("DD/MM/YY")}
                    </td>

                    {/* START */}
                    <td
                      className="active:bg-slate-600"
                      onClick={() => {
                        setTimeType("start");
                        setEditTimeDialog(true);
                        // setSelectedTime(e.start.toDate());
                        setTime(moment(e.start).format("HH:MM A"));
                        setSelectedID(e.id);
                        // setSelectedStart(e.start ? e.start : "");
                        // setSelectedEnd(e.end ? e.end : "");
                      }}
                    >
                      {e.start
                        ? e.start && moment(e.start.toDate()).format("hh:mm A")
                        : "-"}
                    </td>

                    {/* END */}
                    <td
                      className="active:bg-slate-600"
                      onClick={() => {
                        setTimeType("end");
                        setEditTimeDialog(true);
                        // setSelectedTime(e.end ? e.end.toDate() : "");
                        setSelectedID(e.id);
                        // setSelectedStart(e.start ? e.start : "");
                        // setSelectedEnd(e.end ? e.end : "");
                      }}
                    >
                      {e.end != ""
                        ? moment(e.end.toDate()).format("hh:mm A")
                        : "-"}
                    </td>
                    <td
                      onClick={() => {
                        setDeleteDialog(true);
                        setSelectedName(e.name);
                        setSelectedDate(
                          moment(e.start.toDate()).format("DD/MM/YYYY")
                        );
                        setSelectedID(e.id);
                      }}
                    >
                      {/* {e.end
                        ? Number(moment(e.end.toDate()).format("hh")) -
                          Number(moment(e.start.toDate()).format("hh"))
                        : "-"} */}
                      {e.end != ""
                        ? (
                            moment(e.end.toDate()).diff(
                              moment(e.start.toDate()),
                              "minutes"
                            ) / 60
                          ).toFixed(2)
                        : "-"}
                    </td>
                    <td
                    // onClick={() => {
                    //   setDeleteDialog(true);
                    //   setSelectedName(e.name);
                    //   setSelectedDate(e.start.toDate());
                    //   setSelectedID(e.id);
                    // }}
                    >
                      {e.end != "" &&
                      moment(e.end.toDate()).diff(
                        moment(e.start.toDate()),
                        "minutes"
                      ) /
                        60 >
                        10
                        ? Number(
                            (
                              moment(e.end.toDate()).diff(
                                moment(e.start.toDate()),
                                "minutes"
                              ) /
                                60 -
                              10
                            ).toFixed(2)
                          )
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              height: "70svh",
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
