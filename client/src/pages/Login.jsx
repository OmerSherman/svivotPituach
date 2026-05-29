// temporary login form for testing - real version coming on the login branch

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authService.login(email, password);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 380, margin: "60px auto", padding: 24,
                      background: "#fff", borderRadius: 12,
                      border: "1px solid #e0e0e0" }}>
            <h1 style={{ marginTop: 0 }}>התחברות</h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label>
                    <div>אימייל</div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                    />
                </label>
                <label>
                    <div>סיסמה</div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                    />
                </label>

                {error && <p style={{ color: "#a32525" }}>{error}</p>}

                <button type="submit" disabled={loading}
                        style={{ padding: 10, background: "#3b4cca", color: "#fff",
                                 border: "none", borderRadius: 8, cursor: "pointer" }}>
                    {loading ? "מתחבר..." : "התחבר"}
                </button>
            </form>
        </div>
    );
}

export default Login;
