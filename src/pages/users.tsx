import Back from "@/components/back";
import CustomDropdown from "@/components/custom-dropdown";
import DefaultDialog from "@/components/default-dialog";
import Directive from "@/components/directive";
import InputDialog from "@/components/input-dialog";
import RefreshButton from "@/components/refresh-button";
import { db } from "@/firebase";
import { LoadingOutlined } from "@ant-design/icons";
import { message } from "antd";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  AtSign,
  Eye,
  MinusCircle,
  Smartphone,
  User,
  UserPlus,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function Users() {
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [fetchingData, setfetchingData] = useState(false);
  const [users, setUsers] = useState([]);
  const [userDialog, setUserDialog] = useState(false);

  const [refreshCompleted, setRefreshCompleted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passconfirm, setpassconfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const [display_name, setDisplayName] = useState("");
  const [display_email, setDisplayEmail] = useState("");
  const [docid, setDocid] = useState("");
  const [deleteConfirmDiaog, setDeleteConfirmDialog] = useState(false);
  const [role, setRole] = useState("");

  const [totalHours, setTotalHours] = useState("");

  const [projectCode, setProjectCode] = useState("");

  const auth = getAuth();

  const createUser = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "users"), {
        name: name,
        email: email,
        role: "profile",
        allocated_hours: "9",
        editor: "false",
        sensitive_data: "false",
      });
      message.success("User created");
      setLoading(false);
      setAddUserDialog(false);
      fetchUsers();
    } catch (error) {
      setLoading(false);
      message.error(String(error));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async () => {
    setLoading(true);
    await deleteDoc(doc(db, "users", docid));
    fetchUsers();
    setLoading(false);
    setDeleteConfirmDialog(false);
    setUserDialog(false);
  };

  const fetchUsers = async () => {
    setfetchingData(true);
    const RecordCollection = collection(db, "users");
    const recordQuery = query(RecordCollection, orderBy("role"));
    const querySnapshot = await getDocs(recordQuery);
    const fetchedData: any = [];

    querySnapshot.forEach((doc: any) => {
      fetchedData.push({ id: doc.id, ...doc.data() });
    });
    setfetchingData(false);
    setUsers(fetchedData);
    setRefreshCompleted(true);
    setTimeout(() => {
      setRefreshCompleted(false);
    }, 1000);
  };

  const updateUser = async () => {
    try {
      setLoading(true);
      await updateDoc(doc(db, "users", docid), {
        role: role,
        allocated_hours: totalHours,
        ...(role === "supervisor" ? { projectCode: projectCode } : {}),
      });
      setLoading(false);
      setUserDialog(false);
      message.success("Updated User");
      fetchUsers();
    } catch (error) {
      setLoading(false);
      message.error(String(error));
    }
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
          title="Users"
          extra={
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                style={{
                  fontSize: "0.8rem",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                }}
                onClick={() => setAddUserDialog(true)}
              >
                <UserPlus width={"1rem"} color="crimson" />
              </button>
              <RefreshButton
                fetchingData={fetchingData}
                onClick={fetchUsers}
                refreshCompleted={refreshCompleted}
              />
            </div>
          }
        />

        <br />

        {users.length < 1 ? (
          <div
            style={{
              border: "",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "75svh",
            }}
          >
            <LoadingOutlined style={{ color: "dodgerblue", scale: "2" }} />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexFlow: "column",
              gap: "0.5rem",
              border: "",
              height: "82svh",
            }}
          >
            {users.map((user: any) => (
              <Directive
                onClick={() => {
                  setDocid(user.id);
                  setUserDialog(true);
                  setDisplayName(user.name);
                  setDisplayEmail(user.email);
                  setRole(user.role);
                  setTotalHours(user.allocated_hours || "9");
                  setProjectCode(user.projectCode || "");
                }}
                key={user.id}
                icon={
                  user.role == "admin" ? (
                    <Eye width={"1.25rem"} color="crimson" />
                  ) : user.role == "profile" ? (
                    <Smartphone width={"1.25rem"} color="dodgerblue" />
                  ) : (
                    <User width={"1.25rem"} color="crimson" />
                  )
                }
                title={user.name}
                id_subtitle={user.email}
              />
            ))}
          </div>
        )}
      </motion.div>

      <DefaultDialog
        destructive
        open={deleteConfirmDiaog}
        onCancel={() => setDeleteConfirmDialog(false)}
        title={"Delete User?"}
        OkButtonText="Delete"
        onOk={deleteUser}
        updating={loading}
        disabled={loading}
      />

      <InputDialog
        titleIcon={<UserPlus color="crimson" />}
        open={addUserDialog}
        title={"Add User"}
        OkButtonText="Add"
        inputplaceholder="Enter Name"
        input2placeholder="Enter Email"
        input3placeholder="Enter Password"
        input4placeholder="Confirm Password"
        onCancel={() => setAddUserDialog(false)}
        inputOnChange={(e: any) => setName(e.target.value)}
        input2OnChange={(e: any) => setEmail(e.target.value)}
        input3OnChange={(e: any) => setPassword(e.target.value)}
        input4OnChange={(e: any) => setpassconfirm(e.target.value)}
        disabled={!name || !email || !passconfirm || password != passconfirm}
        onOk={createUser}
        updating={loading}
      />

      <DefaultDialog
        title={display_name}
        titleIcon={<User color="crimson" />}
        codeIcon={<AtSign color="crimson" width={"1rem"} />}
        open={userDialog}
        OkButtonText="Update"
        onCancel={() => setUserDialog(false)}
        onOk={updateUser}
        updating={loading}
        extra={
          <div
            style={{
              width: "100%",
              display: "flex",
              flexFlow: "column",
              gap: "1rem",
            }}
          >
            <Directive
              notName
              title={display_email}
              noArrow
              icon={<AtSign width={"1.24rem"} color="crimson" />}
            />

            <div>
              <CustomDropdown
                value={role}
                onChange={setRole}
                options={[
                  { value: "admin", label: "Admin" },
                  { value: "supervisor", label: "Supervisor" },
                  { value: "profile", label: "Profile" },
                ]}
                placeholder="Select Role"
              />
            </div>

            {role === "supervisor" && (
              <div style={{ marginTop: "1rem" }}>
                <label className="text-xs text-gray-400 mb-1 block">
                  Project Code
                </label>
                <input
                  type="text"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  placeholder="Enter Project Code"
                  style={{
                    width: "100%",
                    height: "2.5rem",
                    background: "rgba(100 100 100/ 20%)",
                    border: "none",
                    borderRadius: "0.375rem",
                    padding: "0 0.75rem",
                  }}
                />
              </div>
            )}

            <div>
              <CustomDropdown
                value={totalHours}
                onChange={setTotalHours}
                options={[
                  { value: "9", label: "9 Hours" },
                  { value: "9.5", label: "9.5 Hours" },
                  { value: "10", label: "10 Hours" },
                ]}
                placeholder="Select Hours"
              />
            </div>
          </div>
        }
        title_extra={
          <div>
            <button
              onClick={() => setDeleteConfirmDialog(true)}
              style={{
                fontSize: "0.75rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                height: "2rem",
              }}
            >
              <MinusCircle width={"1rem"} color="crimson" />
              Remove
            </button>
          </div>
        }
      />
    </div>
  );
}
