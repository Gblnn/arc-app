import { db } from "@/firebase";
import { message } from "antd";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";

// interface Props {
//   status?: boolean;
//   onStart?: any;
// }

interface Props {
  allocated_hours?: any;
}

export default function Work(props: Props) {
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

  useEffect(() => {
    onSnapshot(query(collection(db, "records")), (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          verifyAccess();
          verifyStatus();
        }
        if (change.type === "modified") {
          verifyAccess();
          verifyStatus();
        }
        if (change.type === "removed") {
          verifyAccess();
          verifyStatus();
        }
      });
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
        start: new Date(),
        end: "",
        status: true,
        email: window.name,
        total: "",
        overtime: "",
        allocated_hours: Number(props.allocated_hours),
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
      end: new Date(),
      status: false,
      total: moment().diff(moment(sessionStart.toDate()), "hours"),
      overtime:
        moment().diff(moment(sessionStart.toDate()), "hours") > 10
          ? moment().diff(moment(sessionStart.toDate()), "hours") - 10
          : 0,
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

              {/* {moment(moment().diff(moment(sessionStart.toDate()))).format(
                "hh:mm:ss"
              )} */}

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
                marginTop: "21rem",
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
                  fontWeight: "",
                }}
              >
                <b>Allocated Hours</b> {props.allocated_hours}
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
