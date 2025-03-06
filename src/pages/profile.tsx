import Back from "@/components/back";
import DefaultDialog from "@/components/default-dialog";
import IndexDropDown from "@/components/index-dropdown";
import InputDialog from "@/components/input-dialog";
import { auth, db, messaging } from "@/firebase";
import { LoadingOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { motion } from "framer-motion";
import { BellDot, GitPullRequest, List, Truck, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Records from "./records";
import Work from "./work";
import { message } from "antd";

export default function Profile() {
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [logoutPrompt, setLogoutPrompt] = useState(false);
  const [path, setPath] = useState("work");
  const [endDialog, setEndDialog] = useState(false);
  const usenavigate = useNavigate();
  const [allocated_hours, setAllocatedHours] = useState(0);
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);

  // State for online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Function to update online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Event listeners for online and offline events
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const registerServiceWorker = () => {
    try {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        });
      setServiceWorkerRegistered(true);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      setServiceWorkerRegistered(false);
    }
  };

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

  const fetchRecords = async () => {
    setLoading(true);
    const RecordCollection = collection(db, "users");
    const recordQuery = query(
      RecordCollection,
      where("email", "==", window.name)
    );
    const querySnapshot = await getDocs(recordQuery);
    setLoading(false);
    const fetchedData: any = [];

    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    setName(fetchedData[0].name);
    setRole(fetchedData[0].role);
    setAllocatedHours(fetchedData[0].allocated_hours);
  };

  // Register the service worker

  const requestPermission = async () => {
    try {
      const permission = await getToken(messaging, {
        vapidKey:
          "BB0O0d0wXALIezu4MLPsg7cEnFJtUu1S9j5yEbloH5q8xkiWnoU8f4wAZcJVAeqgTY1z1kax1NmZcNMvsZHkQis",
      });
      console.log("FCM token:", permission);
      message.info("Token : " + permission);
      //Store the token
      //Send to your backend for later message sending
    } catch (error) {
      console.error("Unable to get permission to notify.", error);
      message.error("Unable to get permission to notify.");
    }
  };

  return (
    <div>
      <div
        style={{
          background: "rgba(50 50 50/ 10%)",
          backdropFilter: "blur(16px)",
          border: "",
          position: "fixed",
          width: "100%",
          padding: "1.25rem",
          zIndex: "2",
        }}
      >
        <Back
          noblur
          noback={role == "profile"}
          title={role == "profile" ? "Arc" : "Profile"}
          subtitle={role == "profile" ? "v2.1" : ""}
          icon={
            role == "profile" ? (
              <img style={{ width: "2rem" }} src="arc-logo.png" />
            ) : (
              ""
            )
          }
          extra={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {/* <button style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
                v2.0
              </button> */}
              <button
                style={{ width: "3rem", background: "none" }}
                onClick={
                  serviceWorkerRegistered
                    ? requestPermission
                    : registerServiceWorker
                }
              >
                {serviceWorkerRegistered ? <BellDot /> : <GitPullRequest />}
              </button>
              <IndexDropDown
                isOnline={isOnline}
                allocated_hours={allocated_hours}
                name={name ? name : ""}
                onLogout={() => setLogoutPrompt(true)}
              />
            </div>
          }
        />
      </div>

      {/* Display message if offline */}
      {!isOnline && (
        <div
          style={{
            position: "absolute",
            background: "",
            top: 0,

            display: "flex",
            color: "white",
            justifyContent: "center",
            marginTop: "10rem",

            gap: "0.5rem",
            width: "100%",
          }}
        >
          {/* <div
            style={{
              background: "rgba(100 100 100/ 20%)",
              display: "flex",
              gap: "0.5rem",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              borderRadius: "0.5rem",
            }}
          >
            <RadioTower color="crimson" width={"0.9rem"} />
            No Internet
          </div> */}
        </div>
      )}
      <motion.div
        style={{
          padding: "1.25rem",
          // background:
          //   "linear-gradient(rgba(18 18 80/ 65%), rgba(100 100 100/ 0%))",
          height: "100svh",
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div style={{ height: "3.5rem" }}></div>
        <br />

        {loading ? (
          <div
            style={{
              border: "",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "75svh",
            }}
          >
            <LoadingOutlined style={{ color: "crimson", scale: "3" }} />
          </div>
        ) : (
          <motion.div
          // initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          >
            {/* <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  border: "",
                  width: "fit-content",
                  alignItems: "center",
                }}
              >
                <LazyLoader
                  gradient
                  block
                  name={name}
                  width="5rem"
                  height="5rem"
                  fontSize="2rem"
                />
                <div style={{ border: "" }}>
                  <p
                    style={{
                      fontWeight: "600",
                      fontSize: "1.5rem",
                      lineHeight: "1.25rem",
                    }}
                  >
                    {name}
                  </p>
                  <p style={{ fontSize: "0.8rem", lineHeight: "2rem" }}>
                    {window.name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      background: "white",
                      width: "fit-content",
                      paddingLeft: "0.35rem",
                      paddingRight: "0.35rem",
                      borderRadius: "0.5rem",
                      color: "black",
                      fontWeight: 600,
                    }}
                  >
                    {role}
                  </p>
                </div>
              </div> */}
            {path == "work" ? (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
                <Work isOnline={isOnline} allocated_hours={allocated_hours} />
              </motion.div>
            ) : (
              path == "records" && <Records />
            )}

            {/* <div
              style={{
                border: "",
                display: "flex",
                flexWrap: "wrap",
                height: "65svh",
                gap: "0.75rem",
                justifyContent: "",
              }}
            >
              <SquareDirective
                title="Civil ID"
                icon={<CreditCard color="dodgerblue" width={"2rem"} />}
              />
              <SquareDirective
                title="License"
                icon={<Car color="violet" width={"2rem"} />}
              />
              <SquareDirective
                title="Passport"
                icon={<Book color="goldenrod" width={"2rem"} />}
              />
            </div> */}
          </motion.div>
        )}
      </motion.div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "fixed",
            display: "flex",
            bottom: 0,
            background: "rgba(50 50 50/ 20%)",
            height: "",
            border: "",
            width: "",
            justifyContent: "center",
            alignItems: "center",
            gap: "4rem",
            paddingBottom: "env(safe-area-inset-bottom, 50px)",
            marginBottom: "2.5rem",
            padding: "1.45rem",
            borderRadius: "1.5rem",
            backdropFilter: "blur(16px)",
          }}
        >
          <Truck
            style={{ cursor: "pointer" }}
            onClick={() => setPath("work")}
            color={path == "work" ? "crimson" : "white"}
          />
          <List
            style={{ cursor: "pointer" }}
            onClick={() => setPath("records")}
            color={path == "records" ? "crimson" : "white"}
          />
        </div>
      </div>

      <DefaultDialog open={endDialog} onCancel={() => setEndDialog(false)} />

      <DefaultDialog
        destructive
        OkButtonText="Logout"
        title={"Confirm Logout?"}
        open={logoutPrompt}
        onCancel={() => {
          setLogoutPrompt(false);
          window.location.reload();
        }}
        onOk={() => {
          signOut(auth);
          usenavigate("/");
          window.name = "";
          console.log(window.name);
          window.location.reload();
        }}
      />

      <InputDialog
        titleIcon={<UserPlus color="dodgerblue" />}
        open={addUserDialog}
        title={"Add User"}
        OkButtonText="Add"
        inputplaceholder="Enter Email"
        input2placeholder="Enter Password"
        input3placeholder="Confirm Password"
        onCancel={() => setAddUserDialog(false)}
      />
    </div>
  );
}
