import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/firebase";
import { message } from "antd";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { motion } from "framer-motion";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const { userRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (userRole === "admin") {
      navigate("/index");
    } else if (userRole === "profile") {
      navigate("/profile");
    }
  }, [userRole, navigate]);

  // const AuthenticateRole = async () => {
  //   message.loading("Authenticating");
  //   const RecordCollection = collection(db, "users");
  //   const recordQuery = query(
  //     RecordCollection,
  //     where("email", "==", auth.currentUser?.email)
  //   );
  //   const querySnapshot = await getDocs(recordQuery);
  //   const fetchedData: any = [];
  //   querySnapshot.forEach((doc: any) => {
  //     fetchedData.push({ id: doc.id, ...doc.data() });
  //   });
  //   console.log(fetchedData[0].role, fetchedData[0].email);
  //   window.name = fetchedData[0].email;
  //   window.location.reload();
  //   setLoading(false);
  // };

  const handleLogin = async () => {
    try {
      setLoading(true);
      message.loading({ content: "Authenticating...", key: "login" });

      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);

      message.success({ content: "Login successful", key: "login" });

      // AuthContext will handle role fetching and navigation
    } catch (err: any) {
      setLoading(false);
      message.error({ content: err.message, key: "login" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
      <div style={{ display: "flex", padding: "1.25rem", height: "100svh" }}>
        <div
          className="desktop-only"
          style={{
            border: "",
            flex: 1,
            background: "linear-gradient(brown, brown)",
            alignItems: "flex-end",
            borderRadius: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              border: "",
              alignItems: "center",
              margin: "2rem",
              gap: "0.5rem",
            }}
          >
            <img src="/arc-logo.png" style={{ width: "4rem", border: "" }} />

            <div style={{ display: "flex", flexFlow: "column" }}>
              <p style={{ fontWeight: 400, fontSize: "2.25rem" }}></p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            flexFlow: "column",
            border: "",
          }}
        >
          <div
            className="md:w-1/2"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexFlow: "column",
              border: "",
              borderRadius: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                border: "",
                borderRadius: "1rem",
                padding: "",
                flexFlow: "column",
                width: "100%",
                gap: "0.75rem",
                marginTop: "2rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <p
                  style={{
                    top: 0,
                    left: 0,
                    fontSize: "2rem",
                    fontWeight: "600",
                    border: "",
                    width: "",
                    paddingLeft: "0.5rem",
                    marginTop: "",
                  }}
                >
                  ARC
                </p>
                <p>v2.1</p>
              </div>

              <br />

              <input
                autoComplete="email"
                id="email"
                onChange={(e: any) => {
                  setEmail(e.target.value);
                  console.log();
                }}
                type="email"
                placeholder="Email Address"
              />

              <input
                id="password"
                onChange={(e: any) => {
                  setPassword(e.target.value);
                }}
                type="password"
                placeholder="Password"
              />
              <p />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  width: "100%",
                  justifyContent: "",
                  paddingRight: "1rem",
                  paddingLeft: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    border: "",
                    width: "100%",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {/* <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Checkbox />
                    <p style={{ fontSize: "0.75rem" }}>Stay logged in</p>
                  </div> */}

                  <Link
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      color: "crimson",
                      cursor: "pointer",
                    }}
                    to={"/user-reset"}
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <p />
              <button
                onClick={handleLogin}
                className={loading ? "disabled" : ""}
                style={{
                  background: "crimson",
                  color: "white",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                {loading ? (
                  <LoaderCircle width={"1.25rem"} className="animate-spin" />
                ) : (
                  ""
                )}
                LOGIN
                <ChevronRight width={"0.75rem"} />
              </button>
            </div>

            <br />
            <br />
            <br />

            <div
              style={{
                display: "flex",
                flexFlow: "column",
                gap: "0.5rem",
                bottom: 0,
                width: "100%",
              }}
            >
              {/* <Button onClick={handleDevKey} variant={"ghost"}>
                <KeyRound color="dodgerblue" width={"1.25rem"} />
                Developer Key
              </Button> */}
              <p style={{ opacity: 0.5, fontSize: "0.65rem", border: "" }}>
                If you do not have an account you can request for one. You will
                be granted access to create an account once your request is
                processed.
              </p>
              {/* <Link
                style={{
                  fontSize: "0.8rem",
                  color: "indianred",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
                to={"/request-access"}
              >
                Request Access
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
