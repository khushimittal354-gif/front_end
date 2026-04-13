// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "./components/Login";
// import UserPage from "./components/UserPage";

// function App() {

//   const isLoggedIn = localStorage.getItem("token");

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={isLoggedIn ? <Navigate to="/home" /> : <Login />} />
//         <Route path="/home" element={isLoggedIn ? <UserPage /> : <Navigate to="/" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import UserPage from "./components/UserPage";

function App() {

  // Check token every render
  const isLoggedIn = () => {
    return localStorage.getItem("token") !== null;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isLoggedIn() ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/home"
          element={isLoggedIn() ? <UserPage /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;