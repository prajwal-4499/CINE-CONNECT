import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [city, setCity] = useState("");
    const [categories, setCategories] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [portfolio, setPortfolio] = useState([]);

    // 🔹 Load user & profile
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const docRef = doc(db, "photographers", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || "");
                    setCity(data.city || "");
                    setCategories((data.categories || []).join(", "));
                    setPortfolio(data.portfolio || []);
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 🔹 Save profile
    const handleSave = async () => {
        if (!user) return;

        const categoriesArray = categories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean);

        let updatedPortfolio = [...portfolio];

        if (portfolioUrl.trim()) {
            updatedPortfolio.push(portfolioUrl.trim());
        }

        const profileData = {
            name: name.trim(),
            email: user.email,
            city: city.trim(),
            categories: categoriesArray,
            rating: 4.5,
            portfolio: updatedPortfolio
        };

        const docRef = doc(db, "photographers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await updateDoc(docRef, profileData);
        } else {
            await setDoc(docRef, profileData);
        }

        setPortfolio(updatedPortfolio);
        setPortfolioUrl("");

        alert("Profile saved successfully");
    };

    // 🔹 Logout
    const handleLogout = async () => {
        await signOut(auth);
    };

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div className="dashboard-page">
            <div className="dashboard-card">
            </div>
            <h2>Photographer Dashboard</h2>

            {user ? (
                <>
                    <p><strong>Email:</strong> {user.email}</p>

                    <label>Studio / Photographer Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Royal Wedding Studio"
                    />

                    <br /><br />

                    <label>City</label>
                    <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Pune"
                    />

                    <br /><br />

                    <label>Categories (comma separated)</label>
                    <input
                        value={categories}
                        onChange={(e) => setCategories(e.target.value)}
                        placeholder="Wedding, Engagement, Birthday"
                    />

                    <br /><br />

                    <label>Portfolio Image URL</label>
                    <input
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
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