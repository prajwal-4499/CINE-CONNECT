import { Link } from "react-router-dom";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";

function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsub();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <nav className="navbar">
            <h3 className="brand"> CINE-CONNECT   </h3>

            <div className="nav-links">
                <Link to="/">Home</Link>

                {!user && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Signup</Link>
                    </>
                )}

                {user && (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
