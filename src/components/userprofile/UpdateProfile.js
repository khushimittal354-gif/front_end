// src/components/userprofile/UpdateProfile.js

import { useState, useEffect } from "react";
import { getOwnProfile, updateProfile } from "./EmployeeApi";

// ── constants ─────────────────────────────────────────────────────────────────
const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

const EMPTY_FORM = {
  firstName:       "",
  lastName:        "",
  email:           "",
  phoneNumber:     "",
  dateOfBirth:     "",
  gender:          "",
  addressLine:     "",
  city:            "",
  state:           "",
  country:         "",
  pincode:         "",
  profilePhotoUrl: "",
};

// ── validation (mirrors backend @annotations) ─────────────────────────────────
const validate = (form) => {
  const e = {};

  if (!form.firstName.trim())
    e.firstName = "First name is required.";
  else if (form.firstName.trim().length < 2 || form.firstName.trim().length > 50)
    e.firstName = "Must be 2–50 characters.";
  else if (!/^[A-Za-z ]+$/.test(form.firstName))
    e.firstName = "Only alphabets and spaces allowed.";

  if (!form.lastName.trim())
    e.lastName = "Last name is required.";
  else if (form.lastName.trim().length < 1 || form.lastName.trim().length > 50)
    e.lastName = "Must be 1–50 characters.";
  else if (!/^[A-Za-z ]+$/.test(form.lastName))
    e.lastName = "Only alphabets and spaces allowed.";

  if (!form.email.trim())
    e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Enter a valid email address.";
  else if (form.email.length > 100)
    e.email = "Cannot exceed 100 characters.";

  if (!form.phoneNumber.trim())
    e.phoneNumber = "Phone number is required.";
  else if (!/^[0-9]{10}$/.test(form.phoneNumber))
    e.phoneNumber = "Must be exactly 10 digits.";

  if (!form.dateOfBirth)
    e.dateOfBirth = "Date of birth is required.";
  else if (new Date(form.dateOfBirth) >= new Date())
    e.dateOfBirth = "Must be in the past.";

  if (!form.gender)
    e.gender = "Gender is required.";

  if (!form.addressLine.trim())
    e.addressLine = "Address line is required.";
  else if (form.addressLine.length > 255)
    e.addressLine = "Cannot exceed 255 characters.";

  if (!form.city.trim())
    e.city = "City is required.";
  else if (form.city.length > 100)
    e.city = "Cannot exceed 100 characters.";

  if (!form.state.trim())
    e.state = "State is required.";
  else if (form.state.length > 100)
    e.state = "Cannot exceed 100 characters.";

  if (!form.country.trim())
    e.country = "Country is required.";
  else if (form.country.length > 100)
    e.country = "Cannot exceed 100 characters.";

  if (!form.pincode.trim())
    e.pincode = "Pincode is required.";
  else if (!/^[0-9]{6}$/.test(form.pincode))
    e.pincode = "Must be exactly 6 digits.";

  return e;
};

// ── styles (static — defined once outside, never recreated) ──────────────────
const s = {
  container:    { maxWidth: "660px" },
  heading:      { fontSize: "18px", fontWeight: "600", marginBottom: "4px", color: "#1a1a2e" },
  subheading:   { fontSize: "13px", color: "#999", marginBottom: "24px" },
  section:      { marginBottom: "22px" },
  sectionLabel: {
    fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
    textTransform: "uppercase", color: "#bbb",
    marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid #f0f0f0",
  },
  grid2:     { display: "grid", gridTemplateColumns: "1fr 1fr",     gap: "14px" },
  grid1:     { display: "grid", gridTemplateColumns: "1fr",         gap: "14px" },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "4px" },
  label:     { fontSize: "12px", fontWeight: "500", color: "#444" },
  errText:   { fontSize: "11px", color: "#e53935", marginTop: "2px" },
  banner: (type) => ({
    padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "20px",
    backgroundColor: type === "success" ? "#e8f5e9" : "#fdecea",
    color:           type === "success" ? "#2e7d32" : "#c62828",
    border: `1px solid ${type === "success" ? "#c8e6c9" : "#f5c6cb"}`,
  }),
  divider:  { border: "none", borderTop: "1px solid #f0f0f0", margin: "24px 0" },
  footer:   { display: "flex", alignItems: "center", gap: "14px", marginTop: "8px" },
  saveBtn:  (saving) => ({
    padding: "10px 30px",
    backgroundColor: saving ? "#90b8e0" : "#1976d2",
    color: "#fff", border: "none", borderRadius: "6px",
    fontSize: "14px", fontWeight: "500",
    cursor: saving ? "not-allowed" : "pointer",
  }),
  errCount: { fontSize: "11px", color: "#e53935" },
};

// ── Field — OUTSIDE the component so it is never recreated on re-render ───────
// Receives form, errors, onChange as props instead of closing over them.
const Field = ({ label, name, type = "text", required = false,
                 placeholder = "", form, errors, onChange }) => {
  const err = errors[name];
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>
        {label}
        {required && <span style={{ color: "#e53935" }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={(e) => { if (!err) e.target.style.borderColor = "#1976d2"; }}
        onBlur={(e)  => { if (!err) e.target.style.borderColor = "#d0d0d0"; }}
        style={{
          padding: "9px 12px", fontSize: "14px",
          border: `1px solid ${err ? "#e53935" : "#d0d0d0"}`,
          borderRadius: "6px", outline: "none",
          background: err ? "#fff8f8" : "#fff",
          width: "100%", boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
      />
      {err && <span style={s.errText}>{err}</span>}
    </div>
  );
};

// ── GenderSelect — OUTSIDE the component ─────────────────────────────────────
const GenderSelect = ({ form, errors, onChange }) => {
  const err = errors.gender;
  return (
    <div style={s.fieldWrap}>
      <label style={s.label}>
        Gender <span style={{ color: "#e53935" }}>*</span>
      </label>
      <select
        name="gender"
        value={form.gender}
        onChange={onChange}
        style={{
          padding: "9px 12px", fontSize: "14px",
          border: `1px solid ${err ? "#e53935" : "#d0d0d0"}`,
          borderRadius: "6px", outline: "none",
          background: err ? "#fff8f8" : "#fff",
          width: "100%", boxSizing: "border-box",
        }}
      >
        <option value="">Select gender…</option>
        {GENDER_OPTIONS.map((g) => (
          <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
        ))}
      </select>
      {err && <span style={s.errText}>{err}</span>}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
function UpdateProfile() {
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [banner,  setBanner]  = useState(null);

  useEffect(() => {
    getOwnProfile()
      .then((res) => {
        const d = res.data;
        setForm({
          firstName:       d.firstName       || "",
          lastName:        d.lastName        || "",
          email:           d.email           || "",
          phoneNumber:     d.phoneNumber     || "",
          dateOfBirth:     d.dateOfBirth     || "",
          gender:          d.gender          || "",
          addressLine:     d.addressLine     || "",
          city:            d.city            || "",
          state:           d.state           || "",
          country:         d.country         || "",
          pincode:         d.pincode         || "",
          profilePhotoUrl: d.profilePhotoUrl || "",
        });
      })
      .catch(() => setBanner({ type: "error", text: "Failed to load profile data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    setBanner(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      setBanner({ type: "error", text: "Please fix the highlighted fields before saving." });
      return;
    }
    setSaving(true);
    setBanner(null);
    try {
      await updateProfile(form);
      setBanner({ type: "success", text: "Profile updated successfully." });
      setErrors({});
    } catch (err) {
      const data = err.response?.data;
      const serverFieldErrors = data?.errors ?? (
        data && typeof data === "object" && !data.message ? data : null
      );
      if (serverFieldErrors) {
        setErrors(serverFieldErrors);
        setBanner({ type: "error", text: "Validation failed. Please review the highlighted fields." });
      } else {
        setBanner({ type: "error", text: data?.message || "Update failed. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "#888", fontSize: "14px" }}>Loading profile…</p>;

  const errorCount = Object.values(errors).filter(Boolean).length;

  // Shorthand so JSX stays readable — passes the shared props every Field needs
  const fieldProps = { form, errors, onChange: handleChange };

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Edit Profile</h2>
      <p style={s.subheading}>
        Fields marked <span style={{ color: "#e53935" }}>*</span> are required.
      </p>

      {banner && <div style={s.banner(banner.type)}>{banner.text}</div>}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Personal ─────────────────────────────────────────── */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Personal Information</div>
          <div style={{ ...s.grid2, marginBottom: "14px" }}>
            <Field label="First Name" name="firstName" required {...fieldProps} />
            <Field label="Last Name"  name="lastName"  required {...fieldProps} />
          </div>
          <div style={s.grid2}>
            <Field label="Date of Birth" name="dateOfBirth" type="date" required {...fieldProps} />
            <GenderSelect form={form} errors={errors} onChange={handleChange} />
          </div>
        </div>

        {/* ── Contact ──────────────────────────────────────────── */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Contact Details</div>
          <div style={s.grid2}>
            <Field label="Email Address" name="email"       type="email" required {...fieldProps} />
            <Field label="Phone Number"  name="phoneNumber" type="tel"   required
                   placeholder="10-digit number" {...fieldProps} />
          </div>
        </div>

        {/* ── Address ──────────────────────────────────────────── */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Address</div>
          <div style={{ ...s.grid1, marginBottom: "14px" }}>
            <Field label="Address Line" name="addressLine" required
                   placeholder="House / flat, street, area" {...fieldProps} />
          </div>
          <div style={{ ...s.grid2, marginBottom: "14px" }}>
            <Field label="City"    name="city"    required {...fieldProps} />
            <Field label="State"   name="state"   required {...fieldProps} />
          </div>
          <div style={s.grid2}>
            <Field label="Country" name="country" required {...fieldProps} />
            <Field label="Pincode" name="pincode" required
                   placeholder="6-digit pincode" {...fieldProps} />
          </div>
        </div>

        <hr style={s.divider} />

        {/* ── Photo URL ────────────────────────────────────────── */}
        <div style={s.section}>
          <div style={s.sectionLabel}>Profile Photo URL (optional)</div>
          <div style={s.grid1}>
            <Field label="Photo URL" name="profilePhotoUrl"
                   placeholder="https://example.com/photo.jpg" {...fieldProps} />
          </div>
          <p style={{ fontSize: "12px", color: "#bbb", marginTop: "6px" }}>
            To upload a file, use the <strong>Photo</strong> tab instead.
          </p>
        </div>

        {/* ── Submit ───────────────────────────────────────────── */}
        <div style={s.footer}>
          <button type="submit" style={s.saveBtn(saving)} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {errorCount > 0 && (
            <span style={s.errCount}>
              {errorCount} field{errorCount > 1 ? "s" : ""} need attention
            </span>
          )}
        </div>

      </form>
    </div>
  );
}

export default UpdateProfile;

// import { useState, useEffect } from "react";
// import { getOwnProfile, updateProfile } from "./EmployeeApi";

// // ── constants ────────────────────────────────────────────────────────────────
// const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];

// const EMPTY_FORM = {
//   firstName:       "",
//   lastName:        "",
//   email:           "",
//   phoneNumber:     "",
//   dateOfBirth:     "",   // "YYYY-MM-DD" string — matches <input type="date">
//   gender:          "",
//   addressLine:     "",
//   city:            "",
//   state:           "",
//   country:         "",
//   pincode:         "",
//   profilePhotoUrl: "",
// };

// // ── client-side validation (mirrors backend @annotations) ────────────────────
// const validate = (form) => {
//   const e = {};

//   if (!form.firstName.trim())
//     e.firstName = "First name is required.";
//   else if (form.firstName.trim().length < 2 || form.firstName.trim().length > 50)
//     e.firstName = "Must be 2–50 characters.";
//   else if (!/^[A-Za-z ]+$/.test(form.firstName))
//     e.firstName = "Only alphabets and spaces allowed.";

//   if (!form.lastName.trim())
//     e.lastName = "Last name is required.";
//   else if (form.lastName.trim().length < 1 || form.lastName.trim().length > 50)
//     e.lastName = "Must be 1–50 characters.";
//   else if (!/^[A-Za-z ]+$/.test(form.lastName))
//     e.lastName = "Only alphabets and spaces allowed.";

//   if (!form.email.trim())
//     e.email = "Email is required.";
//   else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
//     e.email = "Enter a valid email address.";
//   else if (form.email.length > 100)
//     e.email = "Cannot exceed 100 characters.";

//   if (!form.phoneNumber.trim())
//     e.phoneNumber = "Phone number is required.";
//   else if (!/^[0-9]{10}$/.test(form.phoneNumber))
//     e.phoneNumber = "Must be exactly 10 digits.";

//   if (!form.dateOfBirth)
//     e.dateOfBirth = "Date of birth is required.";
//   else if (new Date(form.dateOfBirth) >= new Date())
//     e.dateOfBirth = "Must be in the past.";

//   if (!form.gender)
//     e.gender = "Gender is required.";

//   if (!form.addressLine.trim())
//     e.addressLine = "Address line is required.";
//   else if (form.addressLine.length > 255)
//     e.addressLine = "Cannot exceed 255 characters.";

//   if (!form.city.trim())
//     e.city = "City is required.";
//   else if (form.city.length > 100)
//     e.city = "Cannot exceed 100 characters.";

//   if (!form.state.trim())
//     e.state = "State is required.";
//   else if (form.state.length > 100)
//     e.state = "Cannot exceed 100 characters.";

//   if (!form.country.trim())
//     e.country = "Country is required.";
//   else if (form.country.length > 100)
//     e.country = "Cannot exceed 100 characters.";

//   if (!form.pincode.trim())
//     e.pincode = "Pincode is required.";
//   else if (!/^[0-9]{6}$/.test(form.pincode))
//     e.pincode = "Must be exactly 6 digits.";

//   return e; // empty object = valid
// };

//  // ── reusable Field sub-component ──────────────────────────────────────────
//   // ✅ OUTSIDE the UpdateProfile function — defined once, never recreated
// const Field = ({ label, name, type = "text", required = false,
//                  placeholder = "", form, errors, onChange }) => {
//   const err = errors[name];
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
//       <label style={{ fontSize: "12px", fontWeight: "500", color: "#444" }}>
//         {label}{required && <span style={{ color: "#e53935" }}> *</span>}
//       </label>
//       <input
//         type={type}
//         name={name}
//         value={form[name]}
//         onChange={onChange}
//         placeholder={placeholder}
//         onFocus={(e) => { if (!err) e.target.style.borderColor = "#1976d2"; }}
//         onBlur={(e)  => { if (!err) e.target.style.borderColor = "#d0d0d0"; }}
//         style={{
//           padding: "9px 12px", fontSize: "14px",
//           border: `1px solid ${err ? "#e53935" : "#d0d0d0"}`,
//           borderRadius: "6px", outline: "none",
//           background: err ? "#fff8f8" : "#fff",
//           width: "100%", boxSizing: "border-box",
//         }}
//       />
//       {err && <span style={{ fontSize: "11px", color: "#e53935" }}>{err}</span>}
//     </div>
//   );
// };


// // ── component ────────────────────────────────────────────────────────────────
// function UpdateProfile() {
//   const [form,    setForm]    = useState(EMPTY_FORM);
//   const [errors,  setErrors]  = useState({});   // per-field validation errors
//   const [loading, setLoading] = useState(true);
//   const [saving,  setSaving]  = useState(false);
//   const [banner,  setBanner]  = useState(null); // { type:"success"|"error", text }

//   // ── prefill from GET /profile ─────────────────────────────────────────────
//   useEffect(() => {
//     getOwnProfile()
//       .then((res) => {
//         const d = res.data; // EmployeeProfileResponseDTO
//         setForm({
//           firstName:       d.firstName       || "",
//           lastName:        d.lastName        || "",
//           email:           d.email           || "",
//           phoneNumber:     d.phoneNumber     || "",
//           dateOfBirth:     d.dateOfBirth     || "",   // arrives as "YYYY-MM-DD"
//           gender:          d.gender          || "",
//           addressLine:     d.addressLine     || "",
//           city:            d.city            || "",
//           state:           d.state           || "",
//           country:         d.country         || "",
//           pincode:         d.pincode         || "",
//           profilePhotoUrl: d.profilePhotoUrl || "",
//         });
//       })
//       .catch(() => setBanner({ type: "error", text: "Failed to load profile data." }))
//       .finally(() => setLoading(false));
//   }, []);

//   // ── field change — clears that field's error instantly ───────────────────
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
//     setBanner(null);
//   };

//   // ── submit ─────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const fieldErrors = validate(form);
//     if (Object.keys(fieldErrors).length > 0) {
//       setErrors(fieldErrors);
//       setBanner({ type: "error", text: "Please fix the highlighted fields before saving." });
//       return;
//     }

//     setSaving(true);
//     setBanner(null);
//     try {
//       await updateProfile(form);
//       setBanner({ type: "success", text: "Profile updated successfully." });
//       setErrors({});
//     } catch (err) {
//       // Spring @Valid returns { errors: { fieldName: "msg" } } or { fieldName: "msg" }
//       const data = err.response?.data;
//       const serverFieldErrors = data?.errors ?? (
//         data && typeof data === "object" && !data.message ? data : null
//       );
//       if (serverFieldErrors) {
//         setErrors(serverFieldErrors);
//         setBanner({ type: "error", text: "Validation failed. Please review the highlighted fields." });
//       } else {
//         setBanner({ type: "error", text: data?.message || "Update failed. Please try again." });
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── styles ─────────────────────────────────────────────────────────────────
//   const s = {
//     container:    { maxWidth: "660px" },
//     heading:      { fontSize: "18px", fontWeight: "600", marginBottom: "4px", color: "#1a1a2e" },
//     subheading:   { fontSize: "13px", color: "#999", marginBottom: "24px" },
//     section:      { marginBottom: "22px" },
//     sectionLabel: {
//       fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
//       textTransform: "uppercase", color: "#bbb",
//       marginBottom: "12px", paddingBottom: "6px", borderBottom: "1px solid #f0f0f0",
//     },
//     grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr",     gap: "14px" },
//     grid3:      { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
//     grid1:      { display: "grid", gridTemplateColumns: "1fr",         gap: "14px" },
//     fieldWrap:  { display: "flex", flexDirection: "column", gap: "4px" },
//     label:      { fontSize: "12px", fontWeight: "500", color: "#444" },
//     input:  (err) => ({
//       padding: "9px 12px", fontSize: "14px",
//       border: `1px solid ${err ? "#e53935" : "#d0d0d0"}`,
//       borderRadius: "6px", outline: "none",
//       background: err ? "#fff8f8" : "#fff",
//       width: "100%", boxSizing: "border-box",
//       transition: "border-color 0.15s",
//     }),
//     select: (err) => ({
//       padding: "9px 12px", fontSize: "14px",
//       border: `1px solid ${err ? "#e53935" : "#d0d0d0"}`,
//       borderRadius: "6px", outline: "none",
//       background: err ? "#fff8f8" : "#fff",
//       width: "100%", boxSizing: "border-box",
//     }),
//     errText: { fontSize: "11px", color: "#e53935", marginTop: "2px" },
//     banner: (type) => ({
//       padding: "10px 14px", borderRadius: "6px", fontSize: "13px", marginBottom: "20px",
//       backgroundColor: type === "success" ? "#e8f5e9" : "#fdecea",
//       color:           type === "success" ? "#2e7d32" : "#c62828",
//       border: `1px solid ${type === "success" ? "#c8e6c9" : "#f5c6cb"}`,
//     }),
//     divider: { border: "none", borderTop: "1px solid #f0f0f0", margin: "24px 0" },
//     footer:  { display: "flex", alignItems: "center", gap: "14px", marginTop: "8px" },
//     saveBtn: {
//       padding: "10px 30px",
//       backgroundColor: saving ? "#90b8e0" : "#1976d2",
//       color: "#fff", border: "none", borderRadius: "6px",
//       fontSize: "14px", fontWeight: "500",
//       cursor: saving ? "not-allowed" : "pointer",
//       transition: "background-color 0.2s",
//     },
//     errCount: { fontSize: "11px", color: "#e53935" },
//   };

//   // // ── reusable Field sub-component ──────────────────────────────────────────
//   // const Field = ({ label, name, type = "text", required = false, placeholder = "" }) => {
//   //   const err = errors[name];
//   //   return (
//   //     <div style={s.fieldWrap}>
//   //       <label style={s.label}>
//   //         {label}
//   //         {required && <span style={{ color: "#e53935" }}> *</span>}
//   //       </label>
//   //       <input
//   //         style={s.input(err)}
//   //         type={type}
//   //         name={name}
//   //         value={form[name]}
//   //         onChange={handleChange}
//   //         placeholder={placeholder}
//   //         onFocus={(e) => { if (!err) e.target.style.borderColor = "#1976d2"; }}
//   //         onBlur={(e)  => { if (!err) e.target.style.borderColor = "#d0d0d0"; }}
//   //       />
//   //       {err && <span style={s.errText}>{err}</span>}
//   //     </div>
//   //   );
//   // };

//   // ── render ─────────────────────────────────────────────────────────────────
//   if (loading) return <p style={{ color: "#888", fontSize: "14px" }}>Loading profile…</p>;

//   const errorCount = Object.values(errors).filter(Boolean).length;

//   return (
//     <div style={s.container}>
//       <h2 style={s.heading}>Edit Profile</h2>
//       <p style={s.subheading}>
//         Fields marked <span style={{ color: "#e53935" }}>*</span> are required.
//       </p>

//       {banner && <div style={s.banner(banner.type)}>{banner.text}</div>}

//       <form onSubmit={handleSubmit} noValidate>

//         {/* ── Personal ─────────────────────────────────────────────────── */}
//         <div style={s.section}>
//           <div style={s.sectionLabel}>Personal Information</div>
//           <div style={{ ...s.grid2, marginBottom: "14px" }}>
//             <Field label="First Name" name="firstName" required />
//             <Field label="Last Name"  name="lastName"  required />
//           </div>
//           <div style={s.grid2}>
//             <Field label="Date of Birth" name="dateOfBirth" required type="date" />

//             {/* Gender — select, not a text input */}
//             <div style={s.fieldWrap}>
//               <label style={s.label}>
//                 Gender <span style={{ color: "#e53935" }}>*</span>
//               </label>
//               <select
//                 name="gender"
//                 value={form.gender}
//                 onChange={handleChange}
//                 style={s.select(errors.gender)}
//               >
//                 <option value="">Select gender…</option>
//                 {GENDER_OPTIONS.map((g) => (
//                   <option key={g} value={g}>{g.replace(/_/g, " ")}</option>
//                 ))}
//               </select>
//               {errors.gender && <span style={s.errText}>{errors.gender}</span>}
//             </div>
//           </div>
//         </div>

//         {/* ── Contact ──────────────────────────────────────────────────── */}
//         <div style={s.section}>
//           <div style={s.sectionLabel}>Contact Details</div>
//           <div style={s.grid2}>
//             <Field label="Email Address" name="email"       required type="email" />
//             <Field
//               label="Phone Number"
//               name="phoneNumber"
//               required
//               type="tel"
//               placeholder="10-digit number"
//             />
//           </div>
//         </div>

//         {/* ── Address ──────────────────────────────────────────────────── */}
//         <div style={s.section}>
//           <div style={s.sectionLabel}>Address</div>
//           <div style={{ ...s.grid1, marginBottom: "14px" }}>
//             <Field
//               label="Address Line"
//               name="addressLine"
//               required
//               placeholder="House / flat, street, area"
//             />
//           </div>
//           <div style={{ ...s.grid2, marginBottom: "14px" }}>
//             <Field label="City"    name="city"    required />
//             <Field label="State"   name="state"   required />
//           </div>
//           <div style={s.grid2}>
//             <Field label="Country" name="country" required />
//             <Field
//               label="Pincode"
//               name="pincode"
//               required
//               placeholder="6-digit pincode"
//             />
//           </div>
//         </div>

//         <hr style={s.divider} />

//         {/* ── Photo URL (optional) ─────────────────────────────────────── */}
//         <div style={s.section}>
//           <div style={s.sectionLabel}>Profile Photo URL (optional)</div>
//           <div style={s.grid1}>
//             <Field
//               label="Photo URL"
//               name="profilePhotoUrl"
//               placeholder="https://example.com/photo.jpg"
//             />
//           </div>
//           <p style={{ fontSize: "12px", color: "#bbb", marginTop: "6px" }}>
//             To upload a file, use the <strong>Photo</strong> tab instead.
//           </p>
//         </div>

//         {/* ── Submit ───────────────────────────────────────────────────── */}
//         <div style={s.footer}>
//           <button type="submit" style={s.saveBtn} disabled={saving}>
//             {saving ? "Saving…" : "Save Changes"}
//           </button>
//           {errorCount > 0 && (
//             <span style={s.errCount}>
//               {errorCount} field{errorCount > 1 ? "s" : ""} need attention
//             </span>
//           )}
//         </div>

//       </form>
//     </div>
//   );
// }

// export default UpdateProfile;