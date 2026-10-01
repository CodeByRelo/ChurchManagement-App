import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(form.emailOrUsername, form.password);

      navigate("/admin", { replace: true });
    } catch (error) {
      setError(error.message || "Invalid login details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <div className="login-brand">
          <div className="login-mark">JIA</div>

          <div>
            <strong>Jesus Is Able</strong>
            <span>MINISTRIES</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-heading">
            <p>ADMINISTRATION</p>

            <h1>Welcome back.</h1>

            <span>Sign in to manage your church community.</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="emailOrUsername">Email or Username</label>

              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                value={form.emailOrUsername}
                onChange={handleChange}
                placeholder="Enter your email or username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="login-footer">
          <span>Jesus Is Able Ministries</span>
          <span>Botlokwa · Limpopo</span>
        </div>
      </div>
    </main>
  );
}

export default Login;
