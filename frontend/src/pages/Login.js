import { useState } from "react";
import { loginUser } from "../services/api";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const response = await loginUser(email, password);

      console.log(
        "FULL RESPONSE JSON:",
        JSON.stringify(response, null, 2)
      );

      // ✅ CORRECT TOKEN SAVE
      localStorage.setItem(
        "token",
        response.data.token
      );

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("token")
      );

      alert("Login successful");

    } catch (error) {

      console.log("LOGIN ERROR:", error);

      alert("Login failed");
    }
  };

  return (
    <div>

      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>

    </div>
  );
}

export default Login;