import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    
    // Dark mode state
    const [isDark, setIsDark] = useState(() => {
        return localStorage.getItem("theme") === "dark";
    });

    useEffect(() => {
        if (isDark) {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsub();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand-link">
                <span className="brand-icon">🎥</span>
                <span className="brand-text">CINE-CONNECT</span>
            </Link>

            <div className="nav-links">
                <button 
                    onClick={() => setIsDark(!isDark)} 
                    style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', marginRight: '10px' }}
                    title="Toggle Dark Mode"
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/jobs" className="nav-link">Jobs</Link>

                {!user && (
                    <>
                        <Link to="/login" className="nav-link nav-btn-outline">Login</Link>
                        <Link to="/signup" className="nav-link nav-btn">Signup</Link>
                    </>
                )}

                {user && (
                    <>
                        <Link to="/messages" className="nav-link">Messages</Link>
                        <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        <button onClick={handleLogout} className="logout-nav-btn">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
