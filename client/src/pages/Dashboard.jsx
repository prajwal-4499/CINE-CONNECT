import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import PhotographerDashboard from "./PhotographerDashboard";
import ClientDashboard from "./ClientDashboard";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    // Fetch user role from 'users' collection
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setRole(docSnap.data().role || "photographer"); // Default to photographer for older accounts
                    } else {
                        setRole("photographer");
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole("photographer");
                }
            } else {
                navigate("/login");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>Loading...</div>;
    }

    if (!user) return null;

    return role === "client" ? (
        <ClientDashboard user={user} />
    ) : (
        <PhotographerDashboard user={user} />
    );
}

export default Dashboard;