import { Checkbox } from "@/components/ui/checkbox";
import { auth, db } from "@/firebase";
import { message } from "antd";
import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { motion } from "framer-motion";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { saveAuthData, getAuthData, clearAuthData } from "@/utils/auth-storage";

export default function Login() {
  const usenavigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  setPersistence(auth, browserSessionPersistence);

  useEffect(() => {
    window.name != "" && usenavigate("/index");
  }, []);

  const AuthenticateRole = async () => {
    message.loading("Authenticating");
    const RecordCollection = collection(db, "users");
    const recordQuery = query(
      RecordCollection,
      where("email", "==", auth.currentUser?.email)
    );
    const querySnapshot = await getDocs(recordQuery);
    const fetchedData: any = [];
    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    console.log(fetchedData[0].role, fetchedData[0].email);
    window.name = fetchedData[0].email;
    window.location.reload();
    setLoading(false);
  };

  const saveAuthToLocalStorage = (email: string, password: string) => {
    localStorage.setItem(
      "arcAuth",
      JSON.stringify({
        email,
        password,
        timestamp: new Date().getTime(),
      })
    );
  };

  const checkSavedAuth = async () => {
    try {
      const authData = await getAuthData();

      if (authData) {
        const { email, password, timestamp, passwordVersion } = authData;

        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (new Date().getTime() - timestamp < thirtyDaysInMs) {
          setEmail(email);
          setPassword(password);

          handleLogin(email, password, passwordVersion);
        } else {
          await clearAuthData();
        }
      }
    } catch (error) {
      console.error("Error checking saved auth:", error);
      await clearAuthData();
    }
  };

  useEffect(() => {
    checkSavedAuth();
  }, []);

  const handleLogin = async (
    emailToUse = email,
    passwordToUse = password,
    passwordVersion = 1
  ) => {
    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailToUse,
        passwordToUse
      );

      const currentUser = userCredential.user;
      const metadata = currentUser.metadata;
      const lastSignInTime = metadata.lastSignInTime;

      const newPasswordVersion = passwordVersion + 1;

      await saveAuthData(emailToUse, passwordToUse, newPasswordVersion);

      AuthenticateRole();
    } catch (err: any) {
      setLoading(false);

      if (emailToUse !== email || passwordToUse !== password) {
        await clearAuthData();
      }

      if (err.code === "auth/wrong-password") {
        message.error("Wrong Password");
      } else if (err.code === "auth/user-not-found") {
        message.error("User not found");
      } else {
        message.error(err.message);
      }
    }
  };

  const handleLogout = async () => {
    await clearAuthData();
    await signOut(auth);
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
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexFlow: "column",
              border: "",
              borderRadius: "1rem",
              width: "32ch",
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
              <p
                style={{
                  top: 0,
                  left: 0,
                  fontSize: "2rem",
                  fontWeight: "600",
                  border: "",
                  width: "100%",
                  paddingLeft: "0.5rem",
                  marginTop: "",
                }}
              >
                LOGIN
              </p>
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
                onClick={() => handleLogin()}
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
              <p style={{ opacity: 0.5, fontSize: "0.65rem", border: "" }}>
                If you do not have an account you can request for one. You will
                be granted access to create an account once your request is
                processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
