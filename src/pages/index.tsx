import Back from "@/components/back";
import DefaultDialog from "@/components/default-dialog";
import Directive from "@/components/directive";
import IndexDropDown from "@/components/index-dropdown";
import InputDialog from "@/components/input-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase";
import { LoadingOutlined } from "@ant-design/icons";
import { message } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Bug,
  FileClock,
  FileText,
  KeyRound,
  LoaderCircle,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [requestDialog, setRequestDialog] = useState(false);
  const [bugDialog, setBugDialog] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [valeLoginPrompt, setValeLoginPrompt] = useState(false);
  const [logoutPrompt, setLogoutPrompt] = useState(false);
  const usenavigate = useNavigate();
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [name, setName] = useState("");

  const { logout, userRole, userName } = useAuth();

  useEffect(() => {
    if (userRole === "admin") {
      setAdmin(true);
    }

    if (userName) {
      setName(userName);
    }

    if (!userRole || !userName) {
      verifyAccess();
      fetchUsers();
    }
  }, [userRole, userName]);

  //   const serviceId = "service_fixajl8";
  //   const templateId = "template_0f3zy3e";

  //   const sendBugReport = async () => {
  //     setLoading(true);
  //     await emailjs.send(serviceId, templateId, {
  //       name: auth.currentUser?.email,
  //       subject:
  //         "Bug Report - " +
  //         moment().format("ll") +
  //         " from " +
  //         auth.currentUser?.email,
  //       recipient: "goblinn688@gmail.com",
  //       message: issue,
  //     });
  //     setLoading(false);
  //     message.success("Bug Report sent");
  //     setBugDialog(false);
  //   };

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
  };

  const verifyAccess = async () => {
    try {
      setLoading(true);

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
      setLoading(false);

      fetchedData[0].role == "admin" ? setAdmin(true) : setAdmin(false),
        // Navigation
        fetchedData[0].role == "profile"
          ? usenavigate("/profile")
          : fetchedData[0].role == "" &&
            usenavigate("/") &&
            message.error("Session timed out");
    } catch (error) {
      message.error(String(error));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      usenavigate("/");
    } catch (error) {
      message.error(String(error));
    }
  };

  return (
    <>
      {/* <div style={{border:"", display:"flex", alignItems:"center", justifyContent:'center'}}>
        <ConfettiExplosion/>
        </div> */}
      <div
        style={{
          border: "",
          padding: "1.25rem",
          // background:
          //   "linear-gradient(rgba(18 18 80/ 65%), rgba(100 100 100/ 0%))",
          height: "100svh",
        }}
      >
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <Back
            title="Arc"
            subtitle={"v2.3"}
            icon={<img src="/arc-logo.png" style={{ width: "2rem" }} />}
            noback
            extra={
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                {/* <button
                  onClick={() => window.location.reload()}
                  style={{
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    fontSize: "0.75rem",
                    opacity: "0.75",
                  }}
                >
                  <RefreshCcw width={"1rem"} color="dodgerblue" />
                  <p style={{ opacity: 0.5, letterSpacing: "0.15rem" }}>
                    v1.18
                  </p>
                </button> */}

                {/* <button onClick={()=>usenavigate("/inbox")} style={{ width:"3rem", background:"rgba(220 20 60/ 20%)"}}>
                            <Inbox className="" color="crimson"/>
                        </button> */}

                {/* <button
                  onClick={() => {
                    setLogoutPrompt(true);
                  }}
                  style={{ width: "3rem" }}
                >
                  <LogOut width={"1rem"} color="lightcoral" />
                </button> */}

                {admin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                  >
                    <button
                      onClick={() => usenavigate("/users")}
                      style={{
                        fontSize: "0.75rem",
                        paddingLeft: "1rem",
                        paddingRight: "1rem",
                        height: "2.5rem",
                        width: "3rem",
                      }}
                    >
                      {loading ? (
                        <LoadingOutlined color="dodgerblue" />
                      ) : (
                        <KeyRound color="crimson" width={"1rem"} />
                      )}
                    </button>
                  </motion.div>
                )}

                {/* <button
                  style={{
                    fontSize: "0.75rem",
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                  }}
                  onClick={() => setBugDialog(true)}
                >
                  <Bug width={"1rem"} color="lightgreen" />
                </button> */}

                <IndexDropDown
                  name={name ? name : ""}
                  onLogout={() => setLogoutPrompt(true)}
                  // onProfile={() => usenavigate("/profile")}
                />
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
              <LoaderCircle
                className="animate-spin"
                style={{ color: "crimson", scale: "2" }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexFlow: "column", gap: "0.5rem" }}>
              <Directive
                to={"/timesheets"}
                title={"Time Sheet"}
                icon={<FileClock color="crimson" width={"1.25rem"} />}
              />

              <Directive
                to={"/document-generator"}
                title={"Document"}
                icon={<FileText color="crimson" width={"1.25rem"} />}
              />

              {/* <Directive
                title={"Vehicles"}
                icon={<Car color="crimson" width={"1.25rem"} />}
              /> */}

              {/* <Directive
                to={"/qr-code-generator"}
                title={"QR Generator"}
                icon={<QrCode width={"1.25rem"} />}
              /> */}

              {/* <Directive
              notName
              to={""}
              title={"Report a Bug"}
              icon={<Bug width={"1.25rem"} color="lightgreen" />}
              onClick={() => {
                setBugDialog(true);
              }}
            /> */}

              {/* <Directive
              onClick={() => handleLoginPrompt("ssu")}
              title="Sohar Star United"
              icon={
                <Avatar
                  style={{ width: "1.25rem", height: "1.25rem", border: "" }}
                >
                  <AvatarImage
                    style={{ objectFit: "cover" }}
                    src={"/sohar_star_logo.png"}
                  />
                  <AvatarFallback>
                    <p style={{ paddingTop: "0.1rem" }}>{"S"}</p>
                  </AvatarFallback>
                </Avatar>
              }
            />

            <Directive
              onClick={() => handleLoginPrompt("vale")}
              title="Vale Team"
              icon={
                <Avatar
                  style={{ width: "1.25rem", height: "1.25rem", border: "" }}
                >
                  <AvatarImage
                    style={{ objectFit: "cover", paddingBottom: "0.1rem" }}
                    src={"/vale-logo.png"}
                  />

                  <AvatarFallback>
                    <p style={{ paddingTop: "0.1rem" }}>{"V"}</p>
                  </AvatarFallback>
                </Avatar>
              }
            /> */}

              {/* <Directive onClick={()=>{setRequestDialog(true)}} title="Request Feature" icon={<Plus color="grey" width={"1.1rem"} height={"1.1rem"}/>}/> */}
            </div>
          )}
        </motion.div>

        <DefaultDialog
          title={"Report a Bug"}
          titleIcon={<Bug color="lightgreen" />}
          extra={
            <div
              style={{
                display: "flex",
                width: "100%",
                flexFlow: "column",
                gap: "0.75rem",
                paddingBottom: "0.5rem",
              }}
            >
              <textarea
                onChange={(e) => setIssue(e.target.value)}
                rows={5}
                placeholder="Describe issue"
              />
            </div>
          }
          open={bugDialog}
          onCancel={() => setBugDialog(false)}
          OkButtonText="Report"
          disabled={issue == ""}
          //   onOk={() => {
          //     issue != "" ? sendBugReport() : "";
          //   }}
          updating={loading}
        />

        <DefaultDialog
          titleIcon={<Mail />}
          title="Request Feature"
          extra={
            <p
              style={{
                fontSize: "0.85rem",
                opacity: 0.5,
                marginBottom: "0.5rem",
              }}
            >
              Reach out to the developer to request a new feature? You will be
              redirected to your e-mail client
            </p>
          }
          open={requestDialog}
          OkButtonText="Reach out"
          onCancel={() => setRequestDialog(false)}
          sendmail
        />

        <InputDialog
          title={"Protected Route"}
          input1Type="password"
          desc="Enter key to continue"
          titleIcon={<KeyRound color="dodgerblue" />}
          open={loginPrompt}
          onCancel={() => setLoginPrompt(false)}
          OkButtonText="Continue"
          inputplaceholder="Password"
          onOk={() => usenavigate("/records")}
        />

        <InputDialog
          title={"Protected Route"}
          input1Type="password"
          desc="Enter key to continue"
          titleIcon={
            <img
              src="/vale-logo.png"
              width={"28rem"}
              style={{ paddingBottom: "0.25rem", marginRight: "0.25rem" }}
            />
          }
          open={valeLoginPrompt}
          onCancel={() => setValeLoginPrompt(false)}
          OkButtonText="Continue"
          inputplaceholder="Password"
          onOk={() => usenavigate("/vale-records")}
        />

        <DefaultDialog
          destructive
          OkButtonText="Logout"
          title={"Confirm Logout?"}
          open={logoutPrompt}
          onCancel={() => {
            setLogoutPrompt(false);
            window.location.reload();
          }}
          onOk={handleLogout}
        />
      </div>
      {/* <ReleaseNote /> */}
    </>
  );
}
