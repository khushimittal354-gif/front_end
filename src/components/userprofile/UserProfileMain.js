// src/components/userprofile/UserProfileMain.js

import { useState } from "react";
import CreateEmployee from "./CreateEmployee";
import ProfileView from "./ProfileView";
import UpdateProfile from "./UpdateProfile";
import UploadPhoto from "./UploadPhoto";
import Education from "./Education";

const ALL_TABS = [
  { key: "profile",       label: "View Profile",    roles: ["HR", "EMPLOYEE"] },
  { key: "update",        label: "Edit Profile",    roles: ["HR", "EMPLOYEE"] },
  { key: "photo",         label: "Photo",           roles: ["HR", "EMPLOYEE"] },
  { key: "education",     label: "Education",       roles: ["HR", "EMPLOYEE"] },
  // { key: "documents",     label: "Documents",       roles: ["HR", "EMPLOYEE", "MANAGER"] },
  // //{ key: "rewards",       label: "Rewards",         roles: ["HR", "EMPLOYEE", "MANAGER"] },
  { key: "create",        label: "Create Employee", roles: ["HR"] },
];
 

function UserProfileMain() {

  const [activeTab, setActiveTab] = useState("profile");

    const [profileKey,  setProfileKey]  = useState(0);


  // Get role from localStorage
  const role = localStorage.getItem("role");

  // Only show tabs this role is allowed to see
  const visibleTabs = ALL_TABS.filter((t) => t.roles.includes(role));

  // Called by UploadPhoto when upload succeeds
  const handlePhotoUploaded = () => {
    setProfileKey((k) => k + 1);  // force ProfileView to refetch
    setActiveTab("profile");       // jump to View Profile tab
  };
 


  const renderTab = () => {
    switch (activeTab) {
      
      case "profile":         
        return <ProfileView key={profileKey} />;
      case "create":  return <CreateEmployee />;
      case "update":    return <UpdateProfile />;
      case "photo":     
        return <UploadPhoto onPhotoUploaded={handlePhotoUploaded} />;
      case "education":
        return <Education />;
      default:        
       return <ProfileView key={profileKey} />;

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

//   return (
//     <div style={{ padding: "10px" }}>

//       {/* Tabs */}
//       <div style={{ marginBottom: "20px" }}>

//         {/* Show only if HR */}
//         {role === "HR" && (
//           <button
//             style={btnStyle("create")}
//             onClick={() => setActiveTab("create")}>
//             Create Employee
//           </button>
//         )}

//         {/* Show for everyone */}
//         <button
//           style={btnStyle("profile")}
//           onClick={() => setActiveTab("profile")}>
//           View Profile
//         </button>

//       </div>

//       {/* Content */}
//       <div style={{
//         padding: "20px",
//         border: "1px solid #ddd",
//         borderRadius: "8px"
//       }}>
//         {renderTab()}
//       </div>

//     </div>
//   );
// }
return (
    <div style={{ padding: "10px" }}>
 
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "20px" }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            style={btnStyle(tab.key)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
 
      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div style={{
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        minHeight: "300px",
      }}>
        {renderTab()}
      </div>
 
    </div>
  );
}


export default UserProfileMain;



