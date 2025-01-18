import Back from "@/components/back";
import DefaultDialog from "@/components/default-dialog";
import IndexDropDown from "@/components/index-dropdown";
import InputDialog from "@/components/input-dialog";
import { auth, db } from "@/firebase";
import { LoadingOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { BriefcaseBusiness, List, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Records from "./records";
import Work from "./work";

export default function Profile() {
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [logoutPrompt, setLogoutPrompt] = useState(false);
  const [path, setPath] = useState("work");
  const [endDialog, setEndDialog] = useState(false);
  const usenavigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRecords();
    console.log(location);
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
    // setName(fetchedData[0].name);
    setRole(fetchedData[0].role);
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
          noback={role == "profile"}
          title={role == "profile" ? "Arc" : "Profile"}
          subtitle={role == "profile" ? "v1.2" : ""}
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
              <IndexDropDown onLogout={() => setLogoutPrompt(true)} />
            </div>
          }
        />
      </div>
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
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
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
                <Work />
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
          <BriefcaseBusiness
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
