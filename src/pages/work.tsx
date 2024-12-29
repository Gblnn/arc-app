import { db } from "@/firebase";
import { message } from "antd";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import moment from "moment";
import { motion } from "framer-motion";

// interface Props {
//   status?: boolean;
//   onStart?: any;
// }

export default function Work() {
  const [status, setStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionStart, setSessionStart] = useState<any>();
  const [sessionTime, setSessionTime] = useState("");

  useEffect(() => {
    setInterval(() => {
      setSessionTime(moment().format("hh:mm:ss"));
    });
  }, []);

  const verifyAccess = async () => {
    try {
      setUpdating(true);

      const RecordCollection = collection(db, "users");
      const recordQuery = query(
        RecordCollection,
        where("email", "==", window.name)
      );
      const querySnapshot = await getDocs(recordQuery);
      const fetchedData: any = [];
      querySnapshot.forEach((doc: any) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });
      setUpdating(false);
      setName(fetchedData[0].name);
    } catch (error) {
      setUpdating(false);
      message.error(String(error));
    }
  };

  const verifyStatus = async () => {
    try {
      setUpdating(true);
      const RecordCollection = collection(db, "records");
      const recordQuery = query(
        RecordCollection,
        where("status", "==", true),
        where("email", "==", window.name)
      );
      const querySnapshot = await getDocs(recordQuery);
      const fetchedData: any = [];
      querySnapshot.forEach((doc: any) => {
        fetchedData.push({ id: doc.id, ...doc.data() });
      });
      setUpdating(false);
      setStatus(fetchedData[0].status);
      setSessionId(fetchedData[0].id);
      setSessionStart(fetchedData[0].start);
    } catch (error) {
      setUpdating(false);
    }
  };

  useEffect(() => {
    verifyAccess();
    verifyStatus();
  }, []);

  const StartWork = async () => {
    try {
      setUpdating(true);
      await addDoc(collection(db, "records"), {
        name: name,
        start: Timestamp.fromDate(new Date()),
        end: "",
        status: true,
        email: window.name,
        total: "",
        overtime: "",
      });
      verifyStatus();
      setStatus(true);
      setUpdating(false);
    } catch (error) {
      console.log(error);
      setUpdating(false);
    }
  };

  const endWork = async () => {
    setUpdating(true);
    await updateDoc(doc(db, "records", sessionId), {
      end: Timestamp.fromDate(new Date()),
      status: false,
      total: moment(sessionStart.toDate()).diff(moment(), "hours"),
      overtime:
        moment(sessionStart.toDate()).diff(moment(), "hours") > 10
          ? moment(sessionStart.toDate()).diff(moment(), "hours") - 10
          : "",
    });

    setUpdating(false);
    setStatus(false);
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          gap: "0.5rem",
          border: "",
          justifyContent: "center",
          alignItems: "center",
          height: "72svh",
        }}
      >
        {status && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              style={{
                position: "absolute",
                marginBottom: "22rem",
                fontSize: "4rem",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexFlow: "column",
                lineHeight: "2.5rem",
              }}
            >
              {sessionTime}
              {/* <p style={{ fontSize: "0.8rem", opacity: "0.5" }}>
                <b>Session ID </b> : {sessionId}
              </p> */}
              <p style={{ fontSize: "0.8rem", opacity: "0.5" }}>
                <b>Session Start </b> :{" "}
                {sessionStart &&
                  moment(sessionStart.toDate()).format("hh:mm:ss")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              style={{
                position: "absolute",
                marginTop: "23rem",
                fontSize: "4rem",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexFlow: "column",
                lineHeight: "2.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "crimson",
                  fontWeight: "600",
                }}
              >
                Reset Shift
              </p>
            </motion.div>
          </>
        )}

        <div
          style={{
            display: "flex",
            border: status
              ? "4px solid crimson"
              : "4px solid rgba(100 100 100/ 30%)",
            borderRadius: "50%",
            padding: "0.5rem",
          }}
        >
          <div>
            <button
              onClick={() => {
                updating ? {} : status ? endWork() : StartWork();
              }}
              style={{
                display: "flex",
                width: "14rem",
                height: "14rem",
                padding: "4rem",
                borderRadius: "50%",
                fontSize: "3rem",
                lineHeight: "2.5rem",
                background: !status ? "crimson" : "rgba(100 100 100/ 25%)",
              }}
            >
              {updating ? (
                <LoaderCircle
                  className="animate-spin"
                  width={"3rem"}
                  height={"3rem"}
                />
              ) : status ? (
                "Stop"
              ) : (
                "Start"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
