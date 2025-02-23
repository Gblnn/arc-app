import { db } from "@/firebase";
import {
  collection,
  getAggregateFromServer,
  getDocs,
  orderBy,
  query,
  sum,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { CalendarDays, LoaderCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

export default function Records() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any>([]);
  const [totalSum, setSum] = useState(0);
  const [totalOvertime, setOvertime] = useState(0);

  useEffect(() => {
    fetchRecords();
    getSum();
    // console.log(records);
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const RecordCollection = collection(db, "records");
    const recordQuery = query(
      RecordCollection,
      where("email", "==", window.name),
      orderBy("start", "desc")
    );
    const querySnapshot = await getDocs(recordQuery);
    setLoading(false);
    const fetchedData: any = [];

    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    setRecords(fetchedData);
  };

  const getSum = async () => {
    const recordQuery = query(
      collection(db, "records"),
      where("email", "==", window.name),
      orderBy("start", "desc")
    );
    const snapshot = await getAggregateFromServer(recordQuery, {
      total: sum("total"),
      overtime: sum("overtime"),
    });
    // console.log("total hours", snapshot.data().total);
    setSum(snapshot.data().total);
    setOvertime(snapshot.data().overtime);
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          border: "",
          height: "70svh",
          padding: "",
          display: "flex",
          flexFlow: "column",
        }}
      >
        {!loading ? (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <p
              style={{
                fontWeight: "500",
                fontSize: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                margin: "",
                border: "",
                justifyContent: "center",
              }}
            >
              <CalendarDays color="crimson" />
              {moment().format("MMMM")}
              <b style={{ color: "crimson", fontWeight: "800" }}>
                {moment().format("YYYY")}
              </b>
            </p>
            <br />
            <div
              style={{
                border: "",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.9rem",
              }}
            >
              <button className="wide-btn">
                Hours <b style={{ color: "" }}>{totalSum}</b>
              </button>
              {/* <button className="wide-btn">
                Allocated <b style={{ color: "" }}>{}</b>
              </button> */}
              <button className="wide-btn">
                Overtime <b style={{ color: "lightgreen" }}>{totalOvertime}</b>
              </button>
            </div>
            <br />
            <table style={{ width: "100%", fontSize: "0.9rem" }}>
              <thead style={{}}>
                <tr style={{ background: "rgba(100 100 100/ 20%)" }}>
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
                }}
              >
                {records.map((e: any) => (
                  <tr key={e.id}>
                    <td>{moment(e.start.toDate()).format("DD/MM/YY")}</td>
                    <td>
                      {e.start
                        ? e.start && moment(e.start.toDate()).format("hh:mm A")
                        : "-"}
                    </td>
                    <td>
                      {e.end != ""
                        ? moment(e.end.toDate()).format("hh:mm A")
                        : "-"}
                    </td>
                    <td>
                      {/* {e.end
                        ? Number(moment(e.end.toDate()).format("hh")) -
                          Number(moment(e.start.toDate()).format("hh"))
                        : "-"} */}
                      {e.end
                        ? Math.round(
                            moment
                              .duration(
                                moment(e.end.toDate()).diff(
                                  moment(e.start.toDate())
                                )
                              )
                              .get("hours")
                          )
                        : "-"}
                    </td>
                    <td>
                      {e.end &&
                      moment
                        .duration(
                          moment(e.end.toDate()).diff(moment(e.start.toDate()))
                        )
                        .get("hours") > 10
                        ? Math.round(
                            moment
                              .duration(
                                moment(e.end.toDate()).diff(
                                  moment(e.start.toDate())
                                )
                              )
                              .get("hours") - 10
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
    </>
  );
}
