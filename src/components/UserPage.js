import { useState } from "react";
import Profile from "./Profile";
import HRComponent from "./HRComponent";
import ProjectComponent from "./ProjectComponent";
import AssetsComponent from "./AssetsComponent";
import InsuranceComponent from "./InsuranceComponent";
import TimesheetComponent from "./TimesheetComponent";
import TicketComponent from "./TicketComponent";

function UserPage() {

  const username = localStorage.getItem("username");

  const [activeComponent, setActiveComponent] = useState("profile");

  // Logout function
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case "profile": return <Profile />;
      case "hr": return <HRComponent />;
      case "project": return <ProjectComponent />;
      case "assets": return <AssetsComponent />;
      case "insurance": return <InsuranceComponent />;
      case "timesheet": return <TimesheetComponent />;
      case "ticket": return <TicketComponent />;
      default: return <Profile />;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#ddd" }}>
        <h3>Welcome {username}</h3>

         <div style={{ display: "flex", gap: "10px" }}>

        <button onClick={() => setActiveComponent("profile")}>
          Profile
        </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              padding: "6px 14px",
              borderRadius: "4px",
              cursor: "pointer"
            }}>
            Logout
          </button>
        </div>

      </div>

      

      
      <div style={{ margin: "10px" }}>
        <button onClick={() => setActiveComponent("hr")}>HR</button>
        <button onClick={() => setActiveComponent("project")}>Project</button>
        <button onClick={() => setActiveComponent("assets")}>Assets</button>
        <button onClick={() => setActiveComponent("insurance")}>Insurance</button>
        <button onClick={() => setActiveComponent("timesheet")}>Timesheet</button>
        <button onClick={() => setActiveComponent("ticket")}>Ticket</button>
      </div>

    
      <div style={{ padding: "20px", border: "1px solid gray" }}>
        {renderComponent()}
      </div>

    </div>
  );
}

export default UserPage;