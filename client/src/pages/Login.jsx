import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setMessage("Please enter both email and password.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setMessage("Login successful!");
            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);
        } catch (error) {
            let errorMsg = "Failed to sign in. Please check your credentials.";
            if (error.code === "auth/invalid-credential") {
                errorMsg = "Incorrect email or password.";
            } else if (error.code === "auth/invalid-email") {
                errorMsg = "Invalid email format.";
            } else if (error.code === "auth/user-not-found") {
                errorMsg = "No account found with this email.";
            }
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p className="auth-subtitle">Log in to manage your photography portfolio</p>

                {message && (
                    <div className={`auth-alert ${message.includes("successful") ? "success" : "error"}`}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="name@studio.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
