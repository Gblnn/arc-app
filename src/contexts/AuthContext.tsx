import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AuthContextType {
  currentUser: any;
  userRole: string | null;
  isLoading: boolean;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  isLoading: true,
  userEmail: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (email: string) => {
    try {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(userQuery);
      const userData = querySnapshot.docs[0]?.data();

      if (userData) {
        setUserRole(userData.role || null);
        window.name = email; // Maintain compatibility with existing code
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user?.email) {
        setUserEmail(user.email);
        await fetchUserRole(user.email);
      } else {
        setUserRole(null);
        setUserEmail(null);
        window.name = ""; // Clear window.name when logged out
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, userRole, isLoading, userEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
