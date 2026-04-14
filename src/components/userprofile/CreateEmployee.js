// // src/components/userprofile/CreateEmployee.js

// src/components/userprofile/CreateEmployee.js

import { useState } from "react";
import { createEmployee } from "./EmployeeApi";

function CreateEmployee() {

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "EMPLOYEE",
    dateOfJoining: "",
    designation: "" ,
    employmentType: "FULL_TIME",
  });

  const [createdEmployee, setCreatedEmployee] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {

    // Validation
    if (!form.username || !form.password ||
        !form.dateOfJoining) {
      setError("Please fill all required fields *");
      return;
    }

    setLoading(true);
    setError("");
    setCreatedEmployee(null);

    createEmployee(form)
      .then(res => {
        console.log("Response:", res.data);
        setCreatedEmployee(res.data);
        setLoading(false);

        // Reset form
        setForm({
          username: "",
          password: "",
          role: "EMPLOYEE",
          dateOfJoining: "",
          designation: "",
          employmentType: "FULL_TIME",
        });
      })
      .catch(err => {
        console.log("Error:", err.response?.data);
        setError(
          "Failed: " +
          (err.response?.data?.message || err.message)
        );
        setLoading(false);
      });
  };

  const inp = {
    width: "100%",
    padding: "8px",
    marginBottom: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    boxSizing: "border-box"
  };

  const lbl = {
    display: "block",
    marginBottom: "4px",
    fontWeight: "bold",
    fontSize: "13px",
    color: "#333"
  };

  return (
    <div style={{ maxWidth: "500px", padding: "10px" }}>

      <h3 style={{ color: "#1976d2" }}>
        Create New Employee
      </h3>
      <p style={{ color: "#666", fontSize: "13px" }}>
        HR only — fill details to create employee account
      </p>

      {/* Error */}
      {error && (
        <div style={{
          padding: "10px",
          backgroundColor: "#ffebee",
          border: "1px solid #ef9a9a",
          borderRadius: "4px",
          color: "red",
          marginBottom: "12px",
          fontSize: "13px"
        }}>
          ❌ {error}
        </div>
      )}

      {/* Success Card */}
      {createdEmployee && (
        <div style={{
          padding: "16px",
          backgroundColor: "#e8f5e9",
          border: "1px solid #a5d6a7",
          borderRadius: "4px",
          marginBottom: "16px"
        }}>
          <h4 style={{
            color: "green",
            marginTop: 0,
            marginBottom: "12px"
          }}>
            ✅ {createdEmployee.message}
          </h4>

          <table style={{
            width: "100%",
            borderCollapse: "collapse"
          }}>
            <tbody>
              <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold",
                  width: "45%"
                }}>
                  User ID
                </td>
                <td style={{ padding: "6px" }}>
                  {createdEmployee.userId}
                </td>
              </tr>

              <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Username
                </td>
                <td style={{
                  padding: "6px",
                  color: "#1976d2",
                  fontWeight: "bold"
                }}>
                  {createdEmployee.username}
                </td>
              </tr>

              <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Temp Password
                </td>
                <td style={{
                  padding: "6px",
                  color: "orange",
                  fontWeight: "bold"
                }}>
                  {createdEmployee.temporaryPassword}
                </td>
              </tr>

              <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Employee Code
                </td>
                <td style={{ padding: "6px" }}>
                  {createdEmployee.employeeCode}
                </td>
              </tr>

              <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Role
                </td>
                <td style={{ padding: "6px" }}>
                  {String(createdEmployee.userRole)}
                </td>
              </tr>

              <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Joining Date
                </td>
                <td style={{ padding: "6px" }}>
                  {createdEmployee.dateOfJoining}
                </td>
              </tr>
              
                <tr style={{
                borderBottom: "1px solid #c8e6c9"
              }}>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Designation
                </td>
                <td style={{
                  padding: "6px",
                  color: "#1976d2",
                  fontWeight: "bold"
                }}>
                  {createdEmployee.designation}
                </td>
              </tr>
             
              <tr>
                <td style={{
                  padding: "6px",
                  fontWeight: "bold"
                }}>
                  Employment Type
                </td>
                <td style={{ padding: "6px" }}>
                  {String(createdEmployee.employmentType)}
                </td>
              </tr>
            </tbody>
          </table>

          <p style={{
            color: "#555",
            fontSize: "12px",
            marginTop: "12px",
            marginBottom: 0,
            padding: "8px",
            backgroundColor: "#fff9c4",
            borderRadius: "4px"
          }}>
            ⚠️ Share <b>username</b> and
            <b> temp password</b> with
            employee so they can login
          </p>
        </div>
      )}

      {/* Username */}
      <label style={lbl}>Username *</label>
      <input
        style={inp}
        name="username"
        placeholder="Enter username"
        value={form.username}
        onChange={handleChange}
      />

      {/* Password */}
      <label style={lbl}>Password *</label>
      <input
        style={inp}
        name="password"
        type="password"
        placeholder="Enter password"
        value={form.password}
        onChange={handleChange}
      />

      {/* Role */}
      <label style={lbl}>Role *</label>
      <select
        style={inp}
        name="role"
        value={form.role}
        onChange={handleChange}
      >
        <option value="EMPLOYEE">Employee</option>
        <option value="HR">HR</option>
        <option value="FINANCE">Finance</option>
      </select>

      {/* Joining Date */}
      <label style={lbl}>Joining Date *</label>
      <input
        style={inp}
        name="dateOfJoining"
        type="date"
        value={form.dateOfJoining}
        onChange={handleChange}
      />

        {/* Designation */}
      <label style={lbl}>designation *</label>
      <input
        style={inp}
        name="designation"
        placeholder="Enter designation"
        value={form.designation}
        onChange={handleChange}
      />

      {/* Employment Type */}
      <label style={lbl}>Employment Type *</label>
      <select
        style={inp}
        name="employmentType"
        value={form.employmentType}
        onChange={handleChange}
      >
        <option value="FULL_TIME">Full Time</option>
        <option value="PART_TIME">Part Time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERN">Intern</option>
      </select>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: loading ? "#ccc" : "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "15px",
          fontWeight: "bold",
          marginTop: "4px"
        }}
      >
        {loading ? "Creating..." : "Create Employee"}
      </button>

    </div>
  );
}

export default CreateEmployee;


// import { useState } from "react";
// import { createEmployee } from "./EmployeeApi";

// function CreateEmployee() {

//   const [form, setForm] = useState({
   
//     username: "",
//     designation: "",
//     employmentType: "FULL_TIME",
//     joiningDate: "",
//   });

//   const [createdEmployee, setCreatedEmployee] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {

//     // Validation
//     if (!form.username) {
//       setError("Please fill all required fields marked *");
//       return;
//     }

//     setLoading(true);
//     setError("");
//     setCreatedEmployee(null);

//     createEmployee(form)
//       .then(res => {
//         console.log("Response:", res.data);
//         setCreatedEmployee(res.data);
//         setLoading(false);

//         // Reset form
//         setForm({
//           username: "",
//           designation: "",
//           employmentType: "FULL_TIME",
//           joiningDate: "",
//         });
//       })
//       .catch(err => {
//         console.log("Error:", err.response?.data);
//         setError(
//           "Failed: " +
//           (err.response?.data?.message || err.message)
//         );
//         setLoading(false);
//       });
//   };

//   // Styles
//   const inp = {
//     width: "100%",
//     padding: "8px",
//     marginBottom: "12px",
//     border: "1px solid #ddd",
//     borderRadius: "4px",
//     fontSize: "14px",
//     boxSizing: "border-box"
//   };

//   const lbl = {
//     display: "block",
//     marginBottom: "4px",
//     fontWeight: "bold",
//     fontSize: "13px",
//     color: "#333"
//   };

//   return (
//     <div style={{ maxWidth: "500px", padding: "10px" }}>
//       <h3 style={{ color: "#1976d2" }}>
//         Create New Employee
//       </h3>
//       <p style={{ color: "#666", fontSize: "13px" }}>
//         Fill the form below to create employee account
//       </p>

//       {/* Error */}
//       {error && (
//         <div style={{
//           padding: "10px",
//           backgroundColor: "#ffebee",
//           border: "1px solid #ef9a9a",
//           borderRadius: "4px",
//           color: "red",
//           marginBottom: "12px",
//           fontSize: "13px"
//         }}>
//           ❌ {error}
//         </div>
//       )}

//       {/* Success Card */}
//       {createdEmployee && (
//         <div style={{
//           padding: "16px",
//           backgroundColor: "#e8f5e9",
//           border: "1px solid #a5d6a7",
//           borderRadius: "4px",
//           marginBottom: "16px"
//         }}>
//           <h4 style={{
//             color: "green",
//             marginTop: 0,
//             marginBottom: "12px"
//           }}>
//             ✅ {createdEmployee.message}
//           </h4>

//           <table style={{ width: "100%",
//             borderCollapse: "collapse" }}>
//             <tbody>
//               <tr style={{ borderBottom: "1px solid #c8e6c9" }}>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold", width: "40%" }}>
//                   User ID
//                 </td>
//                 <td style={{ padding: "6px" }}>
//                   {createdEmployee.userId}
//                 </td>
//               </tr>
//               <tr style={{ borderBottom: "1px solid #c8e6c9" }}>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold" }}>
//                   Username
//                 </td>
//                 <td style={{ padding: "6px",
//                   color: "#1976d2", fontWeight: "bold" }}>
//                   {createdEmployee.username}
//                 </td>
//               </tr>
//               {/* <tr style={{ borderBottom: "1px solid #c8e6c9" }}>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold" }}>
//                   Temp Password
//                 </td>
//                 <td style={{ padding: "6px",
//                   color: "orange", fontWeight: "bold" }}>
//                   {createdEmployee.temporaryPassword}
//                 </td>
//               </tr> */}
//               <tr style={{ borderBottom: "1px solid #c8e6c9" }}>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold" }}>
//                   Employee Code
//                 </td>
//                 <td style={{ padding: "6px" }}>
//                   {createdEmployee.employeeCode}
//                 </td>
//               </tr>
//               <tr style={{ borderBottom: "1px solid #c8e6c9" }}>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold" }}>
//                   Role
//                 </td>
//                 <td style={{ padding: "6px" }}>
//                   {String(createdEmployee.userRole)}
//                 </td>
//               </tr>
//               <tr style={{ borderBottom: "1px solid #c8e6c9" }}>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold" }}>
//                   Joining Date
//                 </td>
//                 <td style={{ padding: "6px" }}>
//                   {createdEmployee.dateOfJoining}
//                 </td>
//               </tr>
//               <tr>
//                 <td style={{ padding: "6px",
//                   fontWeight: "bold" }}>
//                   Employment Type
//                 </td>
//                 <td style={{ padding: "6px" }}>
//                   {String(createdEmployee.employmentType)}
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           <p style={{
//             color: "#555",
//             fontSize: "12px",
//             marginTop: "12px",
//             marginBottom: 0,
//             padding: "8px",
//             backgroundColor: "#fff9c4",
//             borderRadius: "4px"
//           }}>
//             ⚠️ Share <b>username</b> and <b>password</b>
//             with employee so they can login
//           </p>
//         </div>
//       )}


//       <label style={lbl}>Username *</label>
//       <input style={inp} name="username"
//         placeholder="Enter username"
//         value={form.username}
//         onChange={handleChange} />

//       <label style={lbl}>Email *</label>
//       <input style={inp} name="email"
//         type="email"
//         placeholder="Enter email"
//         value={form.email}
//         onChange={handleChange} />

//       <label style={lbl}>Phone Number</label>
//       <input style={inp} name="phoneNumber"
//         placeholder="Enter phone number"
//         value={form.phoneNumber}
//         onChange={handleChange} />

//       <label style={lbl}>Designation</label>
//       <input style={inp} name="designation"
//         placeholder="e.g. Software Developer"
//         value={form.designation}
//         onChange={handleChange} />

//       <label style={lbl}>Employment Type</label>
//       <select style={inp} name="employmentType"
//         value={form.employmentType}
//         onChange={handleChange}>
//         <option value="FULL_TIME">Full Time</option>
//         <option value="PART_TIME">Part Time</option>
//         <option value="CONTRACT">Contract</option>
//         <option value="INTERN">Intern</option>
//       </select>

//       <label style={lbl}>Joining Date</label>
//       <input style={inp} name="joiningDate"
//         type="date"
//         value={form.joiningDate}
//         onChange={handleChange} />

//       <button
//         onClick={handleSubmit}
//         disabled={loading}
//         style={{
//           width: "100%",
//           padding: "12px",
//           backgroundColor: loading ? "#ccc" : "#1976d2",
//           color: "white",
//           border: "none",
//           borderRadius: "4px",
//           cursor: loading ? "not-allowed" : "pointer",
//           fontSize: "15px",
//           fontWeight: "bold",
//           marginTop: "4px"
//         }}>
//         {loading ? "Creating..." : "Create Employee"}
//       </button>
//     </div>
//   );
// }

// export default CreateEmployee;