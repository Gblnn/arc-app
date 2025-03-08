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
import { useCallback, useEffect, useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// interface Props {
//   status?: boolean;
//   onStart?: any;
// }

interface Props {
  allocated_hours?: any;
  isOnline?: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number;
}

const getLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true }
    );
  });
};

export default function Work(props: Props) {
  const [status, setStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionStart, setSessionStart] = useState<any>();
  const [sessionTime, setSessionTime] = useState("");

  // Add new state for long press
  const [pressProgress, setPressProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInterval(() => {
      setSessionTime(moment().format("hh:mm:ss"));
    });
  }, []);

  useEffect(() => {
    onSnapshot(query(collection(db, "records")), (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          // verifyAccess();
          verifyStatus();
        }
        if (change.type === "modified") {
          // verifyAccess();
          verifyStatus();
        }
        if (change.type === "removed") {
          // verifyAccess();
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

      // Add check for data existence
      if (fetchedData.length > 0) {
        setName(fetchedData[0].name);
        console.log(fetchedData[0].name);
      } else {
        console.log("No user found for email:", window.name);
      }
    } catch (error) {
      console.error("Error in verifyAccess:", error);
      setUpdating(false);
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
    if (!window.name) {
      console.log("No email found in window.name");
      return;
    }
    verifyAccess();
    verifyStatus();
  }, []);

  const StartWork = async () => {
    try {
      setUpdating(true);
      let locationData: Location | null = null;

      try {
        locationData = await getLocation();
      } catch (error: any) {
        message.error(error.message);
        console.log("Location access failed:", error);
      }

      await addDoc(collection(db, "records"), {
        name: name,
        start: new Date(),
        end: "",
        status: true,
        email: window.name,
        total: "",
        overtime: "",
        allocated_hours: Number(props.allocated_hours),
        startLocation: locationData || null,
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
    try {
      setUpdating(true);
      const endTime = new Date();
      let locationData: Location | null = null;

      try {
        locationData = await getLocation();
      } catch (error) {
        console.log("Location access failed:", error);
      }

      await updateDoc(doc(db, "records", sessionId), {
        end: endTime,
        status: false,
        total: moment(endTime).diff(moment(sessionStart.toDate()), "hours"),
        overtime:
          moment(endTime).diff(moment(sessionStart.toDate()), "hours") > 10
            ? moment(endTime).diff(moment(sessionStart.toDate()), "hours") - 10
            : 0,
        endLocation: locationData || null,
      });

      setUpdating(false);
      setStatus(false);
    } catch (error) {
      console.log(error);
      setUpdating(false);
    }
  };

  // const ResumeWork = async () => {};

  const handlePressStart = useCallback(() => {
    if (!props.isOnline || updating) return;

    let startTime = Date.now();
    const duration = 2000; // 2 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / duration) * 100;

      if (progress >= 100) {
        clearInterval(timer);
        setPressProgress(0);
        // Execute the action
        if (status) {
          endWork();
        } else {
          StartWork();
        }
      } else {
        setPressProgress(progress);
      }
    }, 10);

    setPressTimer(timer);
  }, [props.isOnline, updating, status]);

  const handlePressEnd = useCallback(() => {
    if (pressTimer) {
      clearInterval(pressTimer);
      setPressTimer(null);
    }
    setPressProgress(0);
  }, [pressTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimer) {
        clearInterval(pressTimer);
      }
    };
  }, [pressTimer]);

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
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "14rem",
              height: "14rem",
              border: "",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Progress Circle */}
            <div
              style={{
                position: "absolute",
                width: "95%",
                height: "95%",
              }}
            >
              <CircularProgressbar
                value={pressProgress}
                styles={{
                  path: {
                    stroke: status ? "#991b1b" : "#dc2626",
                    strokeLinecap: "round",
                    transition: "stroke-dashoffset 0.1s ease",
                  },
                  trail: {
                    stroke: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              />
            </div>

            {/* Button */}
            <button
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                fontSize: "3rem",

                background:
                  !status && props.isOnline
                    ? "rgba(220 20 60/ 50%)"
                    : "rgba(100 100 100/ 25%)",
                cursor: props.isOnline && !updating ? "pointer" : "default",
                userSelect: "none",
                border: "",
                color: "white",
              }}
            >
              {updating ? (
                <LoaderCircle
                  className="animate-spin"
                  width={"3rem"}
                  height={"3rem"}
                />
              ) : !props.isOnline ? (
                "Offline"
              ) : status ? (
                "End"
              ) : (
                "Start"
              )}
              <p
                style={{
                  marginTop: "5rem",
                  position: "absolute",
                  fontSize: "0.75rem",
                  opacity: "0.75",
                }}
              >
                {pressProgress > 0 && !status
                  ? "Press and Hold"
                  : pressProgress > 0 && status
                  ? "Press and Hold"
                  : status
                  ? "End Session"
                  : "Start Session"}
              </p>
            </button>
          </div>
        </div>

        {/* Resume Button */}
        {/* {!status &&
          (!timedout ? (
            <button
              onClick={ResumeWork}
              style={{
                position: "absolute",
                marginTop: "21rem",
                padding: "0.5rem 1rem",
                background: "none",
                color: "crimson",
                fontWeight: "800",
                borderRadius: "0.375rem",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              <History />
              Resume Last Session
            </button>
          ) : (
            ""
          ))} */}
      </div>
    </>
  );
}
