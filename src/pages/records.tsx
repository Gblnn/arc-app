import { db } from "@/firebase";
import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
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

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Get start and end of current month
      const startOfMonth = moment().startOf("month").toDate();
      const endOfMonth = moment().endOf("month").toDate();

      const RecordCollection = collection(db, "records");
      const recordQuery = query(
        RecordCollection,
        where("email", "==", window.name),
        where("start", ">=", Timestamp.fromDate(startOfMonth)),
        where("start", "<=", Timestamp.fromDate(endOfMonth)),
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
    // Get raw hours
    const rawHours = moment.duration(moment(end).diff(moment(start))).asHours();

    // Get decimal part
    const decimalPart = rawHours % 1;
    const wholePart = Math.floor(rawHours);

    // Round based on threshold
    if (decimalPart < 0.3) {
      return wholePart; // Round down
    } else if (decimalPart >= 0.7) {
      return wholePart + 1; // Round up
    } else {
      return wholePart + 0.5; // Round to half
    }
  };

  const calculateOvertime = (hours: number, allocatedHours: number) => {
    if (hours <= allocatedHours) return 0;

    const overtimeHours = hours - allocatedHours;
    // Get decimal part
    const decimalPart = overtimeHours % 1;
    const wholePart = Math.floor(overtimeHours);

    // Round based on threshold
    if (decimalPart < 0.3) {
      return wholePart; // Round down
    } else if (decimalPart >= 0.7) {
      return wholePart + 1; // Round up
    } else {
      return wholePart + 0.5; // Round to half
    }
  };

  // Calculate total hours and overtime
  const totalHours = records.reduce((sum, record) => {
    if (!record.end) return sum;
    const hours = calculateHours(record.start.toDate(), record.end.toDate());
    return sum + hours;
  }, 0);

  const totalOvertime = records.reduce((sum, record) => {
    if (!record.end) return sum;
    const hours = calculateHours(record.start.toDate(), record.end.toDate());
    return sum + calculateOvertime(hours, record.allocated_hours);
  }, 0);

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
            {moment().format("MMMM")}{" "}
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
              {/* Add totals row */}
              <tr
                style={{
                  background: "rgba(100 100 100/ 30%)",
                  fontWeight: "bold",
                }}
              >
                <td colSpan={1}>Total</td>
                <td></td>
                <td></td>
                <td>{totalHours}</td>
                <td>{totalOvertime}</td>
              </tr>
            </tbody>
          </table>
          <br />
          <br />
          <br />
          <br />
          <br />
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
