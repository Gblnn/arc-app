import Back from "@/components/back";
import { db } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { motion } from "framer-motion";
import { FilePlus, LoaderCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import * as XLSX from "@e965/xlsx";
import { saveAs } from "file-saver";

export default function Records() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any>([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const exportDb = async () => {
    const myHeader = ["name", "date", "start", "end", "total", "OT"];
    records.forEach((e: any) => {
      //date
      e.date = String(moment(e.start.toDate()).format("DD/MM/YYYY"));
      //start
      e.start = e.start
        ? e.start && moment(e.start.toDate()).format("hh:mm")
        : "-";
      //end
      e.end = e.end != "" ? moment(e.end.toDate()).format("hh:mm") : "-";
      //total
      // e.total = e.end
      //   ? moment
      //       .duration(moment(e.end.toDate()).diff(moment(e.start.toDate())))
      //       .get("hours")
      //   : "-";

      //overtime
      // e.overtime =
      //   e.end != "" &&
      //   moment
      //     .duration(moment(e.end.toDate()).diff(moment(e.start.toDate())))
      //     .get("hours") > 10
      //     ? moment
      //         .duration(moment(e.end.toDate()).diff(moment(e.start.toDate())))
      //         .get("hours") - 10
      //     : "-";

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
  };

  const fetchRecords = async () => {
    setLoading(true);
    const RecordCollection = collection(db, "records");
    const recordQuery = query(RecordCollection, orderBy("name"));
    const querySnapshot = await getDocs(recordQuery);
    setLoading(false);
    const fetchedData: any = [];
    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    setRecords(fetchedData);
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
          background: "rgba(100 100 100/ 15%)",
          borderBottom: "2px solid rgba(100 100 100/ 40%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <Back
          title={"Timesheet"}
          subtitle={records.length}
          extra={
            <button
              onClick={exportDb}
              style={{
                paddingLeft: "1rem",
                paddingRight: "1rem",
                fontSize: "0.8rem",
              }}
            >
              <FilePlus color="lightgreen" width={"1.25rem"} />
              Export
            </button>
          }
        />
      </div>

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
                top: 0,
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
                  <tr key={e.id} style={{}}>
                    <td>{e.name}</td>
                    <td>{moment(e.start.toDate()).format("DD/MM/YY")}</td>
                    <td>
                      {e.start
                        ? e.start && moment(e.start.toDate()).format("hh:mm")
                        : "-"}
                    </td>
                    <td>
                      {e.end != ""
                        ? moment(e.end.toDate()).format("hh:mm")
                        : "-"}
                    </td>
                    <td>
                      {/* {e.end
                        ? Number(moment(e.end.toDate()).format("hh")) -
                          Number(moment(e.start.toDate()).format("hh"))
                        : "-"} */}
                      {e.end
                        ? moment
                            .duration(
                              moment(e.end.toDate()).diff(
                                moment(e.start.toDate())
                              )
                            )
                            .get("hours")
                        : "-"}
                    </td>
                    <td>
                      {e.end &&
                      moment
                        .duration(
                          moment(e.end.toDate()).diff(moment(e.start.toDate()))
                        )
                        .get("hours") > 10
                        ? moment
                            .duration(
                              moment(e.end.toDate()).diff(
                                moment(e.start.toDate())
                              )
                            )
                            .get("hours") - 10
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
    </div>
  );
}
