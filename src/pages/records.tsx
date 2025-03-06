import { db } from "@/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

interface Record {
  id: string;
  start: { toDate: () => Date };
  end: { toDate: () => Date } | "";
  allocated_hours: number;
}

export default function Records() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<Record[]>([]);
  const [selectedMonth] = useState(moment().format("MMMM")); // Default to current month

  useEffect(() => {
    fetchRecords();
  }, [selectedMonth]); // Fetch records when the selected month changes

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const RecordCollection = collection(db, "records");
      const recordQuery = query(
        RecordCollection,
        where("email", "==", window.name),
        orderBy("start", "desc")
      );
      const querySnapshot = await getDocs(recordQuery);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Record[];

      setRecords(fetchedData);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (start: Date, end: Date) => {
    return Math.round(
      moment.duration(moment(end).diff(moment(start))).get("hours")
    );
  };

  const calculateOvertime = (hours: number, allocatedHours: number) => {
    return hours > allocatedHours ? hours - allocatedHours : 0;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "70svh",
        display: "flex",
        flexFlow: "column",
      }}
    >
      {!loading ? (
        <motion.div>
          <p
            style={{
              fontWeight: "500",
              fontSize: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {selectedMonth}{" "}
            <b style={{ color: "crimson", fontWeight: "800" }}>
              {moment().format("YYYY")}
            </b>
          </p>

          <br />
          <table style={{ width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "rgba(100 100 100/ 20%)" }}>
                <th>Date</th>
                <th>Start</th>
                <th>End</th>
                <th>Total</th>
                <th>OT</th>
              </tr>
            </thead>

            <tbody
              style={{
                textAlign: "center",
                background: "rgba(100 100 100/ 10%)",
              }}
            >
              {records.map((record) => {
                const startDate = record.start.toDate();
                const endDate = record.end ? record.end.toDate() : null;
                const totalHours = endDate
                  ? calculateHours(startDate, endDate)
                  : 0;
                const allocatedHours = record.allocated_hours;

                return (
                  <tr key={record.id}>
                    <td>{moment(startDate).format("DD/MM/YY")}</td>
                    <td>{moment(startDate).format("hh:mm A")}</td>
                    <td>{endDate ? moment(endDate).format("hh:mm A") : "-"}</td>
                    <td>{endDate ? totalHours : "-"}</td>
                    <td>
                      {endDate
                        ? calculateOvertime(totalHours, allocatedHours)
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <br />
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
  );
}
