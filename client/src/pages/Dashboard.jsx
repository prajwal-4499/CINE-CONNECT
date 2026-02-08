import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [photographerId, setPhotographerId] = useState(null);
    const [city, setCity] = useState("");
    const [categories, setCategories] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const snapshot = await getDocs(collection(db, "photographers"));
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.email === currentUser.email) {
                        setPhotographerId(docSnap.id);
                        setCity(data.city || "");
                        setCategories((data.categories || []).join(", "));
                    }
                });
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!photographerId) return;

        await updateDoc(doc(db, "photographers", photographerId), {
            city,
            categories: categories.split(",").map((c) => c.trim())
        });

        alert("Profile updated");
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="profile">
            <h2>Photographer Dashboard</h2>

            {user ? (
                <>
                    <p><strong>Email:</strong> {user.email}</p>

                    <label>City</label>
                    <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />

                    <br /><br />

                    <label>Categories (comma separated)</label>
                    <input
                        value={categories}
                        onChange={(e) => setCategories(e.target.value)}
                    />

                    <br /><br />

                    <button onClick={handleSave}>Save Profile</button>
                    <br /><br />
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <p>No user logged in</p>
            )}
        </div>
    );
}

export default Dashboard;
