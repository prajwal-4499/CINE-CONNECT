import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            setMessage("Signup successful!");
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div>
            <h2>Signup</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <button onClick={handleSignup}>Sign Up</button>

            <p>{message}</p>
        </div>
    );
}

export default Signup;
