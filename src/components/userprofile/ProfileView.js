// import { useState , useEffect } from "react";
// import { getOwnProfile } from "./EmployeeApi";

// function ProfileView() {

//     const [profile, setProfile] =  useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//      useEffect(() => {
//     console.log("Token:", localStorage.getItem("token"));
//     console.log("Role:", localStorage.getItem("role"));

//     useEffect(() => {
//         getOwnProfile()
//         .then(res => {
//             setProfile(res.data);
//             setLoading(false);
//         })
//         .catch(err => {
//             setError("Failed to load profile");
//             setLoading(false);
//         });
//     }, []);

//      if (loading) return <p>Loading...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div>
//       <h3>My Profile</h3>
//       <table border="1" cellPadding="8">
//         <tbody>
//           <tr><td><b>Employee Code</b></td><td>{profile.employeeCode}</td></tr>
//           <tr><td><b>First Name</b></td><td>{profile.firstName}</td></tr>
//           <tr><td><b>Last Name</b></td><td>{profile.lastName}</td></tr>
//           <tr><td><b>Email</b></td><td>{profile.email}</td></tr>
//           <tr><td><b>Phone</b></td><td>{profile.phoneNumber}</td></tr>
//           <tr><td><b>Designation</b></td><td>{profile.designation}</td></tr>
//           <tr><td><b>Joining Date</b></td><td>{profile.joiningDate}</td></tr>
//           <tr><td><b>Profile Complete</b></td>
//             <td>{profile.isProfileComplete ? "✅ Yes" : "❌ No"}</td>
//           </tr>
//           {profile.missingFields?.length > 0 && (
//             <tr>
//               <td><b>Missing Fields</b></td>
//               <td style={{ color: "red" }}>
//                 {profile.missingFields.join(", ")}
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }
// export default ProfileView;

import { useState, useEffect } from "react";
import { getOwnProfile } from "./EmployeeApi";

function ProfileView() {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Token:", localStorage.getItem("token"));
    console.log("Role:", localStorage.getItem("role"));

    getOwnProfile()
      .then(res => {
        console.log("Profile data:", res.data);
        setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log("Error:", err.response?.status);
        console.log("Message:", err.response?.data);
        setError("Failed to load profile: " + err.response?.status);
        setLoading(false);
      });
  }, []);    // ← only ONE useEffect

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h3>My Profile</h3>
      <table border="1" cellPadding="8">
        <tbody>
          <tr>
            <td><b>Employee Code</b></td>
            <td>{profile.employeeCode}</td>
          </tr>
          <tr>
            <td><b>First Name</b></td>
            <td>{profile.firstName}</td>
          </tr>
          <tr>
            <td><b>Last Name</b></td>
            <td>{profile.lastName}</td>
          </tr>
          <tr>
            <td><b>Email</b></td>
            <td>{profile.email}</td>
          </tr>
          <tr>
            <td><b>Phone</b></td>
            <td>{profile.phoneNumber}</td>
          </tr>
          <tr>
            <td><b>Designation</b></td>
            <td>{profile.designation}</td>
          </tr>
          <tr>
            <td><b>Joining Date</b></td>
            <td>{profile.joiningDate}</td>
          </tr>
          <tr>
            <td><b>Profile Complete</b></td>
            <td>{profile.isProfileComplete ? "✅ Yes" : "❌ No"}</td>
          </tr>
          {profile.missingFields?.length > 0 && (
            <tr>
              <td><b>Missing Fields</b></td>
              <td style={{ color: "red" }}>
                {profile.missingFields.join(", ")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProfileView;
