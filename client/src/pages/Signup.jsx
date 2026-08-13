import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("client"); // 'client' or 'photographer'
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !password.trim()) {
            setMessage("Please enter name, email, and password.");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save user profile with role and name
            await setDoc(doc(db, "users", user.uid), {
                name: name.trim(),
                email: user.email,
                role: role,
                createdAt: new Date().toISOString()
            });

            setMessage("Signup successful!");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            console.error("Signup Error details:", error);
            let errorMsg = "Failed to sign up. Please try again.";
            if (error.code === "auth/email-already-in-use") {
                errorMsg = "An account already exists with this email.";
            } else if (error.code === "auth/invalid-email") {
                errorMsg = "Invalid email format.";
            } else if (error.code === "auth/weak-password") {
                errorMsg = "Password is too weak. Choose a stronger password.";
            } else if (error.code === "auth/operation-not-allowed") {
                errorMsg = "Email/password sign-in is disabled in your Firebase console.";
            } else if (error.message) {
                errorMsg = `Error: ${error.message}`;
            }
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p className="auth-subtitle">
                    {role === "client" ? "Sign up to post requirements and hire photographers" : "Sign up to showcase your photography portfolio"}
                </p>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', marginTop: '10px' }}>
                    <div 
                        onClick={() => setRole("client")}
                        style={{
                            flex: 1, padding: '15px', textAlign: 'center', cursor: 'pointer', borderRadius: '12px',
                            border: role === 'client' ? '2px solid var(--primary)' : '2px solid var(--slate-200)',
                            backgroundColor: role === 'client' ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                            transition: 'all 0.3s ease',
                            transform: role === 'client' ? 'translateY(-2px)' : 'none',
                            boxShadow: role === 'client' ? '0 4px 6px rgba(79, 70, 229, 0.1)' : 'none'
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '18px', color: role === 'client' ? 'var(--primary)' : 'var(--slate-700)', fontWeight: '600' }}>Client</h3>
                        <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--slate-500)' }}>I want to hire</p>
                    </div>
                    <div 
                        onClick={() => setRole("photographer")}
                        style={{
                            flex: 1, padding: '15px', textAlign: 'center', cursor: 'pointer', borderRadius: '12px',
                            border: role === 'photographer' ? '2px solid var(--primary)' : '2px solid var(--slate-200)',
                            backgroundColor: role === 'photographer' ? 'rgba(79, 70, 229, 0.05)' : 'transparent',
                            transition: 'all 0.3s ease',
                            transform: role === 'photographer' ? 'translateY(-2px)' : 'none',
                            boxShadow: role === 'photographer' ? '0 4px 6px rgba(79, 70, 229, 0.1)' : 'none'
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '18px', color: role === 'photographer' ? 'var(--primary)' : 'var(--slate-700)', fontWeight: '600' }}>Photographer</h3>
                        <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'var(--slate-500)' }}>I want to work</p>
                    </div>
                </div>

                {message && (
                    <div className={`auth-alert ${message.includes("successful") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label htmlFor="signup-name">Full Name</label>
                        <input
                            id="signup-name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-email">Email Address</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="name@studio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="signup-password">Password</label>
                        <input
                            id="signup-password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}

export default Signup;
