import Back from "@/components/back";
import DefaultDialog from "@/components/default-dialog";
import IndexDropDown from "@/components/index-dropdown";
import InputDialog from "@/components/input-dialog";
import LazyLoader from "@/components/lazy-loader";
import { auth, db } from "@/firebase";
import { LoadingOutlined } from "@ant-design/icons";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { PlayCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [logoutPrompt, setLogoutPrompt] = useState(false);

  const usenavigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
  };

  return (
    <div
      style={{
        padding: "1.25rem",
        // background:
        //   "linear-gradient(rgba(18 18 80/ 65%), rgba(100 100 100/ 0%))",
        height: "100svh",
      }}
    >
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
        <Back
          noback={role == "profile"}
          title={role == "profile" ? "Arc" : "Profile"}
          subtitle={role == "profile" ? "v2.1.1" : ""}
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
            <LoadingOutlined style={{ color: "dodgerblue", scale: "3" }} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <div
              style={{
                display: "flex",
                flexFlow: "row",
                flexWrap: "wrap",
                gap: "0.5rem",
                border: "",
                // borderBottom: "1px solid rgba(100 100 100/ 50%)",
                borderTop: "1px solid rgba(100 100 100/ 50%)",
                paddingBottom: "1.5rem",
                paddingTop: "1.5rem",
                paddingLeft: "1rem",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
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
              </div>
              <div
                className=""
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  border: "",
                  display: "flex",
                  gap: "2rem",
                  marginTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {/* <CircularProgress percentage={78} title="Average" />
                <CircularProgress percentage={95} title="Top" />
                <CircularProgress percentage={59} title="Me" /> */}
              </div>

              {/* <button
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  marginRight: "1rem",
                  fontSize: "0.8rem",
                }}
              >
                Edit
              </button> */}

              {/* <Directive
            title="Users"
            icon={<Users width={"1.1rem"} color="dodgerblue" />}
            onClick={() => setAddUserDialog(true)}
            to={"/users"}
          />

          <Directive
            title="Access Requests"
            icon={<GitPullRequestArrow width={"1.1rem"} color="dodgerblue" />}
            onClick={() => setAddUserDialog(true)}
            to={"/access-requests"}
          /> */}
            </div>

            <br />
            <div
              style={{
                display: "flex",
                flexFlow: "column",
                gap: "0.5rem",
                border: "",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  border: "solid crimson",
                  borderRadius: "50%",
                  padding: "0.5rem",
                }}
              >
                <button
                  style={{
                    width: "12rem",
                    height: "12rem",
                    padding: "4rem",
                    borderRadius: "50%",
                    fontSize: "2.5rem",
                    lineHeight: "2rem",
                    background: "crimson",
                  }}
                >
                  {"Start"}
                  <br /> Work
                </button>
              </div>
            </div>
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
