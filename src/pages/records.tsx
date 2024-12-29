import { db } from "@/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Records() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any>([]);

  useEffect(() => {
    fetchRecords();
    console.log(records);
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const RecordCollection = collection(db, "records");
    const recordQuery = query(
      RecordCollection,
      where("email", "==", window.name),
      orderBy("start")
    );
    const querySnapshot = await getDocs(recordQuery);
    setLoading(false);
    const fetchedData: any = [];

    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    setRecords(fetchedData);
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
                        ? e.start && moment(e.start.toDate()).format("hh:mm:ss")
                        : "-"}
                    </td>
                    <td>
                      {e.end != ""
                        ? moment(e.end.toDate()).format("hh:mm:ss")
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
    </>
  );
}
