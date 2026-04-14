
// import { useState, useEffect } from "react";
// import { getOwnProfile } from "./EmployeeApi";

// function ProfileView() {

//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     console.log("Token:", localStorage.getItem("token"));
//     console.log("Role:", localStorage.getItem("role"));

//     getOwnProfile()
//       .then(res => {
//         console.log("Profile data:", res.data);
//         setProfile(res.data);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.log("Error:", err.response?.status);
//         console.log("Message:", err.response?.data);
//         setError("Failed to load profile: " + err.response?.status);
//         setLoading(false);
//       });
//   }, []);    // ← only ONE useEffect

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div>
//       <h3>My Profile</h3>
//       <table border="1" cellPadding="8">
//         <tbody>
//           <tr>
//             <td><b>Employee Code</b></td>
//             <td>{profile.employeeCode}</td>
//           </tr>
//           <tr>
//             <td><b>First Name</b></td>
//             <td>{profile.firstName}</td>
//           </tr>
//           <tr>
//             <td><b>Last Name</b></td>
//             <td>{profile.lastName}</td>
//           </tr>
//           <tr>
//             <td><b>Email</b></td>
//             <td>{profile.email}</td>
//           </tr>
//           <tr>
//             <td><b>Phone</b></td>
//             <td>{profile.phoneNumber}</td>
//           </tr>
//           <tr>
//             <td><b>Designation</b></td>
//             <td>{profile.designation}</td>
//           </tr>
//           <tr>
//             <td><b>Joining Date</b></td>
//             <td>{profile.joiningDate}</td>
//           </tr>
//           <tr>
//             <td><b>Profile Complete</b></td>
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

// src/components/userprofile/ProfileView.js
// Consumes EmployeeDashboardDTO from GET /finsecure/employee/dashboard
// Fields used: all fields from EmployeeDashboardDTO

import { useState, useEffect } from "react";
import { getDashboard } from "./EmployeeApi";

// ── tiny helpers ─────────────────────────────────────────────────────────────
const fmt = (val) => (val == null || val === "" ? "—" : val);

const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
};

const fmtEnum = (val) =>
  val ? val.replace(/_/g, " ") : "—";

// ── styles object (all inline, no external CSS) ──────────────────────────────
const styles = {
  // page wrapper
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "#f4f6fb",
    minHeight: "100vh",
    padding: "0",
  },

  // ── hero banner ──────────────────────────────────────────────────────────
  hero: {
    background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #42a5f5 100%)",
    padding: "36px 36px 80px",
    position: "relative",
  },
  heroTitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: "12px", letterSpacing: "0.12em",
    textTransform: "uppercase", marginBottom: "4px",
  },
  heroName: {
    color: "#fff", fontSize: "26px", fontWeight: "700", margin: "0",
  },
  heroMeta: {
    color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "4px",
  },

  // ── avatar card (floated up from hero) ──────────────────────────────────
  avatarCard: {
    position: "relative",
    marginTop: "-56px",
    marginLeft: "36px",
    marginRight: "36px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "24px 28px",
    display: "flex",
    alignItems: "flex-start",
    gap: "24px",
    flexWrap: "wrap",
  },

  // avatar circle
  avatarWrap: {
    width: "88px", height: "88px", borderRadius: "50%",
    border: "3px solid #1976d2",
    overflow: "hidden", flexShrink: 0,
    background: "#e3f2fd",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarInitials: { fontSize: "30px", fontWeight: "700", color: "#1976d2" },

  // identity block next to avatar
  identity: { flex: 1, minWidth: "160px" },
  idName:   { fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 2px" },
  idCode:   {
    display: "inline-block", padding: "2px 10px", borderRadius: "12px",
    background: "#e3f2fd", color: "#1565c0",
    fontSize: "11px", fontWeight: "700", marginBottom: "6px",
  },
  idDesig:  { fontSize: "13px", color: "#666", marginBottom: "4px" },
  idRole:   {
    display: "inline-block", padding: "2px 10px", borderRadius: "12px",
    background: "#e8f5e9", color: "#2e7d32",
    fontSize: "11px", fontWeight: "600",
  },

  // stat chips in avatar card
  statsRow: {
    display: "flex", gap: "12px", flexWrap: "wrap",
    alignItems: "center", marginLeft: "auto",
  },
  statChip: {
    textAlign: "center", minWidth: "80px",
    background: "#f8f9ff", border: "1px solid #e8eaf6",
    borderRadius: "10px", padding: "10px 16px",
  },
  statVal: { fontSize: "20px", fontWeight: "700", color: "#1976d2", lineHeight: 1 },
  statLbl: { fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "3px" },

  // ── completion banner ────────────────────────────────────────────────────
  completionBar: (complete) => ({
    margin: "16px 36px 0",
    padding: "12px 16px",
    borderRadius: "10px",
    background: complete ? "#e8f5e9" : "#fff8e1",
    border:     `1px solid ${complete ? "#c8e6c9" : "#ffe082"}`,
    display: "flex", alignItems: "center", gap: "10px",
  }),
  completionDot: (complete) => ({
    width: "10px", height: "10px", borderRadius: "50%",
    background: complete ? "#43a047" : "#fb8c00", flexShrink: 0,
  }),
  completionText: (complete) => ({
    fontSize: "13px", fontWeight: "500",
    color: complete ? "#2e7d32" : "#e65100",
  }),
  missingList: {
    fontSize: "12px", color: "#bf360c",
    marginLeft: "4px",
  },

  // ── section grid ─────────────────────────────────────────────────────────
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
    margin: "20px 36px 36px",
  },

  // section card
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  cardHead: {
    padding: "12px 18px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex", alignItems: "center", gap: "8px",
  },
  cardIcon: { fontSize: "15px" },
  cardTitle: { fontSize: "12px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.07em" },
  cardBody: { padding: "4px 0 8px" },

  // row inside card
  row: {
    display: "flex", justifyContent: "space-between",
    alignItems: "baseline",
    padding: "8px 18px",
    borderBottom: "1px solid #fafafa",
  },
  rowLabel: { fontSize: "12px", color: "#aaa", minWidth: "120px", flexShrink: 0 },
  rowValue: { fontSize: "13px", color: "#1a1a2e", fontWeight: "500", textAlign: "right", wordBreak: "break-all" },

  // ── account status chips ─────────────────────────────────────────────────
  statusRow: { display: "flex", flexWrap: "wrap", gap: "8px", padding: "12px 18px" },
  statusChip: (ok) => ({
    padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600",
    background: ok ? "#e8f5e9" : "#fdecea",
    color:      ok ? "#2e7d32" : "#c62828",
    border: `1px solid ${ok ? "#c8e6c9" : "#f5c6cb"}`,
  }),

  // ── loading / error states ───────────────────────────────────────────────
  center: {
    display: "flex", justifyContent: "center",
    alignItems: "center", minHeight: "300px",
  },
  loadText: { color: "#888", fontSize: "14px" },
  errBox: {
    margin: "32px 36px", padding: "16px",
    background: "#fdecea", borderRadius: "10px",
    color: "#c62828", fontSize: "14px",
    border: "1px solid #f5c6cb",
  },
};

// ── sub-components ────────────────────────────────────────────────────────────
const Row = ({ label, value }) => (
  <div style={styles.row}>
    <span style={styles.rowLabel}>{label}</span>
    <span style={styles.rowValue}>{fmt(value)}</span>
  </div>
);

const Section = ({ icon, title, children }) => (
  <div style={styles.card}>
    <div style={styles.cardHead}>
      <span style={styles.cardIcon}>{icon}</span>
      <span style={styles.cardTitle}>{title}</span>
    </div>
    <div style={styles.cardBody}>{children}</div>
  </div>
);

// ── main component ────────────────────────────────────────────────────────────
function ProfileView() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [imgError, setImgError] = useState(false);  // ← add this line



  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        <span style={styles.loadText}>Loading profile…</span>
      </div>
    );
  }

  if (error) {
    return <div style={styles.errBox}>⚠ {error}</div>;
  }

  if (!data) return null;

   const photoSrc = data.profilePhotoUrl
    ? data.profilePhotoUrl.startsWith("http")
      ? data.profilePhotoUrl
      : `http://localhost:8085/uploads/${data.profilePhotoUrl.replace(/^\/?uploads\/?/, "")}`
    : null;

  // ── derive initials for avatar fallback ──────────────────────────────────
  const initials = [data.firstName?.[0], data.lastName?.[0]]
    .filter(Boolean).join("").toUpperCase() || "?";

  const isComplete = data.isProfileComplete;
  const missing    = data.missingFields || [];

  console.log("profilePhotoUrl:", data.profilePhotoUrl);

  return (
    <div style={styles.page}>

      {/* ── Hero banner ──────────────────────────────────────────── */}
      <div style={styles.hero}>
        <div style={styles.heroTitle}>Employee Dashboard</div>
        <h1 style={styles.heroName}>{data.fullName || `${data.firstName} ${data.lastName}`}</h1>
        <div style={styles.heroMeta}>
          {fmt(data.designation)} &nbsp;·&nbsp; {fmtEnum(data.employmentType)}
        </div>
      </div>

      {/* ── Avatar card ──────────────────────────────────────────── */}
      <div style={styles.avatarCard}>

        {/* Avatar */}
        {/* <div style={styles.avatarWrap}>
          {data.profilePhotoUrl
            ? <img src={data.profilePhotoUrl} alt="Profile" style={styles.avatarImg} />
            : <span style={styles.avatarInitials}>{initials}</span>
          }
        </div> */}
        {/* <div style={styles.avatarWrap}>
          {data.profilePhotoUrl ? (
            <img
              src={
                data.profilePhotoUrl.startsWith("http")
                  ? data.profilePhotoUrl
                  : `http://localhost:8085${data.profilePhotoUrl.startsWith("/") ? "" : "/"}${data.profilePhotoUrl}`
              }
              alt="Profile"
              style={styles.avatarImg}
              onError={() => setImgError(true)}   
            />
          ) : (
            <span style={styles.avatarInitials}>{initials}</span>
          )}
        </div> */}
        <div style={styles.avatarWrap}>
          {photoSrc && !imgError ? (
            <img
              src={photoSrc}
              alt="Profile"
              style={styles.avatarImg}
              onError={() => {
                console.log("Image failed:", photoSrc);
                setImgError(true);
              }}
            />
          ) : (
            <span style={styles.avatarInitials}>{initials}</span>
          )}
        </div>


        {/* Identity */}
        <div style={styles.identity}>
          <h2 style={styles.idName}>{data.fullName || fmt(data.firstName)}</h2>
          <span style={styles.idCode}>{data.employeeCode}</span>
          <div style={styles.idDesig}>{fmt(data.designation)}</div>
          <span style={styles.idRole}>{fmtEnum(data.role)}</span>
        </div>

        {/* Work-duration stats */}
        <div style={styles.statsRow}>
          <div style={styles.statChip}>
            <div style={styles.statVal}>{data.yearsWorked ?? "—"}</div>
            <div style={styles.statLbl}>Years</div>
          </div>
          <div style={styles.statChip}>
            <div style={styles.statVal}>{data.monthsWorked ?? "—"}</div>
            <div style={styles.statLbl}>Months</div>
          </div>
          <div style={styles.statChip}>
            <div style={styles.statVal}>{data.daysWorked ?? "—"}</div>
            <div style={styles.statLbl}>Days</div>
          </div>
        </div>

      </div>

      {/* ── Profile completion banner ─────────────────────────────── */}
      <div style={styles.completionBar(isComplete)}>
        <div style={styles.completionDot(isComplete)} />
        <span style={styles.completionText(isComplete)}>
          {isComplete
            ? "Profile complete — all fields filled."
            : `Profile incomplete — ${missing.length} field${missing.length !== 1 ? "s" : ""} missing:`}
        </span>
        {!isComplete && missing.length > 0 && (
          <span style={styles.missingList}>
            {missing.map((f) => f.replace(/([A-Z])/g, " $1").trim()).join(", ")}
          </span>
        )}
      </div>

      {/* ── Info sections grid ────────────────────────────────────── */}
      <div style={styles.grid}>

        {/* Personal */}
        <Section icon="👤" title="Personal Information">
          <Row label="First Name"    value={data.firstName} />
          <Row label="Last Name"     value={data.lastName} />
          <Row label="Date of Birth" value={fmtDate(data.dateOfBirth)} />
          <Row label="Gender"        value={fmtEnum(data.gender)} />
          <Row label="Email"         value={data.email} />
          <Row label="Phone"         value={data.phoneNumber} />
        </Section>

        {/* Professional */}
        <Section icon="💼" title="Professional Details">
          <Row label="Employee Code"    value={data.employeeCode} />
          <Row label="Username"         value={data.username} />
          <Row label="Designation"      value={data.designation} />
          <Row label="Employment Type"  value={fmtEnum(data.employmentType)} />
          <Row label="Joining Date"     value={fmtDate(data.joiningDate)} />
          <Row label="Role"             value={fmtEnum(data.role)} />
        </Section>

        {/* Address */}
        <Section icon="📍" title="Address">
          {data.fullAddress
            ? (
              <div style={{ padding: "10px 18px", fontSize: "13px", color: "#1a1a2e", lineHeight: "1.6" }}>
                {data.fullAddress}
              </div>
            ) : (
              <>
                <Row label="Address Line" value={data.addressLine} />
                <Row label="City"         value={data.city} />
                <Row label="State"        value={data.state} />
                <Row label="Country"      value={data.country} />
                <Row label="Pincode"      value={data.pincode} />
              </>
            )
          }
        </Section>

        {/* Account status */}
        <Section icon="🔒" title="Account Status">
          <div style={styles.statusRow}>
            <span style={styles.statusChip(!data.isAccountLocked)}>
              {data.isAccountLocked ? "🔴 Account Locked" : "🟢 Account Active"}
            </span>
            <span style={styles.statusChip(!data.isDeleted)}>
              {data.isDeleted ? "🔴 Deleted" : "🟢 Active Employee"}
            </span>
            <span style={styles.statusChip(!data.isEscalated)}>
              {data.isEscalated ? "🟡 Escalated" : "🟢 Not Escalated"}
            </span>
          </div>
          <Row label="Member Since" value={fmtDate(data.createdAt)} />
          <Row label="Last Updated" value={fmtDate(data.updatedAt)} />
        </Section>

      </div>

    </div>
  );
}

export default ProfileView;
