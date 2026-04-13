// src/components/userprofile/UserProfileMain.js

import { useState } from "react";
import CreateEmployee from "./CreateEmployee";
import ProfileView from "./ProfileView";

function UserProfileMain() {

  const [activeTab, setActiveTab] = useState("profile");

  // Get role from localStorage
  const role = localStorage.getItem("role");

  const renderTab = () => {
    switch (activeTab) {
      case "create":  return <CreateEmployee />;
      case "profile": return <ProfileView />;
      default:        return <ProfileView />;
    }
  };

  const btnStyle = (key) => ({
    marginRight: "8px",
    marginBottom: "8px",
    padding: "8px 16px",
    backgroundColor:
      activeTab === key ? "#1976d2" : "#f0f0f0",
    color: activeTab === key ? "white" : "black",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px"
  });

  return (
    <div style={{ padding: "10px" }}>

      {/* Tabs */}
      <div style={{ marginBottom: "20px" }}>

        {/* Show only if HR */}
        {role === "HR" && (
          <button
            style={btnStyle("create")}
            onClick={() => setActiveTab("create")}>
            Create Employee
          </button>
        )}

        {/* Show for everyone */}
        <button
          style={btnStyle("profile")}
          onClick={() => setActiveTab("profile")}>
          View Profile
        </button>

      </div>

      {/* Content */}
      <div style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px"
      }}>
        {renderTab()}
      </div>

    </div>
  );
}

export default UserProfileMain;



// // src/components/userprofile/UserProfileMain.jsx

// import { useState } from "react";
// import ProfileView from "./ProfileView";
// import CreateEmployee from "./CreateEmployee";

// function UserProfileMain() {

//   const [activeTab, setActiveTab] = useState("profile");

  
//   // Get role from localStorage
//   const role = localStorage.getItem("role");

//   const renderTab = () => {
//     switch (activeTab) {
//       case "create":  return <CreateEmployee />;
//       case "profile": return <ProfileView />;
//       default:        return <ProfileView />;
//     }
//   };

//   const btnStyle = (key) => ({
//     marginRight: "8px",
//     marginBottom: "8px",
//     padding: "8px 16px",
//     backgroundColor:
//       activeTab === key ? "#1976d2" : "#f0f0f0",
//     color: activeTab === key ? "white" : "black",
//     border: "none",
//     borderRadius: "4px",
//     cursor: "pointer",
//     fontSize: "13px"
//   });

//   return (
//     <div style={{ padding: "10px" }}>

//       {/* Tabs */}
//       <div style={{ marginBottom: "20px" }}>
//         {tabs.map((tab) => (
//           <button
//             key={tab.key}
//             onClick={() => setActiveTab(tab.key)}
//             style={{
//               marginRight: "8px",
//               padding: "8px 16px",
//               backgroundColor: activeTab === tab.key ? "#1976d2" : "#f0f0f0",
//               color: activeTab === tab.key ? "white" : "black",
//               border: "none",
//               borderRadius: "4px",
//               cursor: "pointer"
//             }}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Content */}
//       <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
//         {activeTab === "profile" && <ProfileView />}
//       </div>

//     </div>
//   );
// }

// export default UserProfileMain;;