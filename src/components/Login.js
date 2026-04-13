// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function Login() {

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = () => {


//     console.log("-- Loging page username "+username+" and password : - "+password);
    
//     // Dummy validation
//     if (username === "admin" && password === "admin") {
//       console.log("-- Loging page inside IF username "+username+" and password : - "+password);
//       // Dummy token & data
//       const dummyToken = "admin123abc";
//       const dummyRoles = ["ADMIN"];

//       localStorage.setItem("token", dummyToken);
//       localStorage.setItem("username", username);
//       localStorage.setItem("roles", JSON.stringify(dummyRoles));

//       navigate("/home");

//     } else {
//       console.log("-- Inside else username "+username+" and password : - "+password);
//       alert("Invalid credentials");
//     }
//   };

//   return (
//     <div style={{ textAlign: "center", marginTop: "100px" }}>
//       <h2>Login</h2>

//       <input
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//       />
//       <br /><br />

//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//       />
//       <br /><br />

//       <button onClick={handleLogin}>Login</button>
//     </div>
//   );
// }

// export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

// Replace navigate("/home") with this
// This forces full page reload so App.js re-checks token

const handleLogin = async () => {
  try {
    const response = await axios.post(
      "http://localhost:8085/finsecure/public/login",
      { username, password }
    );

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.username);
    localStorage.setItem("role", response.data.role);
    localStorage.setItem("userId", response.data.userId);

    // Force page reload → App.js re-checks token
    window.location.href = "/home";

  } catch (err) {
    console.log("Error:", err);
    setError("Invalid username or password");
  }
};


  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>FinSecure Login</h2>

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;