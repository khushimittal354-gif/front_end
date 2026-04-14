import { useState, useEffect } from "react";
import { getMyEducation, addEducation, deleteEducation } from "./EmployeeApi";

const DEGREE_OPTIONS = [
  "High School / +2",
  "Diploma",
  "Bachelor's",
  "Master's",
  "MBA",
  "PhD",
  "Certification",
  "Other",
];

const EMPTY_FORM = {
  degree: "",
  institution: "",
  fieldOfStudy: "",
  passingYear: "",
  percentage: "",
  grade: "",
  location: "",
};

const s = {
  container: { maxWidth: "680px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  heading: { fontSize: "18px", fontWeight: "600", color: "#1a1a2e", margin: 0 },
  addBtn: {
    padding: "8px 18px",
    backgroundColor: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  banner: (type) => ({
    padding: "10px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    marginBottom: "16px",
    backgroundColor: type === "success" ? "#e8f5e9" : "#fdecea",
    color: type === "success" ? "#2e7d32" : "#c62828",
    border: `1px solid ${type === "success" ? "#c8e6c9" : "#f5c6cb"}`,
  }),
  formBox: {
    border: "1px solid #1976d2",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#f8fbff",
  },
  formHeading: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "16px",
    color: "#1976d2",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    marginBottom: "12px",
  },
  fieldWrap: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", fontWeight: "500", color: "#555" },
  input: {
    padding: "8px 10px",
    fontSize: "14px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    outline: "none",
    background: "#fff",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "8px 10px",
    fontSize: "14px",
    border: "1px solid #d0d0d0",
    borderRadius: "6px",
    outline: "none",
    background: "#fff",
    width: "100%",
  },
  formActions: { display: "flex", gap: "10px", marginTop: "4px" },
  saveBtn: (saving) => ({
    padding: "9px 22px",
    backgroundColor: saving ? "#90b8e0" : "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: saving ? "not-allowed" : "pointer",
  }),
  cancelBtn: {
    padding: "9px 18px",
    backgroundColor: "#fff",
    color: "#555",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  card: {
    border: "1px solid #e8e8e8",
    borderRadius: "8px",
    padding: "16px 20px",
    marginBottom: "12px",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  degreeBadge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "12px",
    backgroundColor: "#e3f2fd",
    color: "#1565c0",
    fontSize: "11px",
    fontWeight: "600",
    marginBottom: "6px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: "4px",
  },
  cardSub: { fontSize: "13px", color: "#555", marginBottom: "2px" },
  cardMeta: { fontSize: "12px", color: "#999", lineHeight: "1.6" },
  deleteBtn: {
    padding: "6px 14px",
    backgroundColor: "#fff",
    color: "#d32f2f",
    border: "1px solid #d32f2f",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#aaa",
    fontSize: "14px",
    border: "1px dashed #ddd",
    borderRadius: "8px",
  },
};

const TextField = ({ label, name, type = "text", form, onChange, placeholder = "" }) => (
  <div style={s.fieldWrap}>
    <label style={s.label}>{label}</label>
    <input
      style={s.input}
      type={type}
      name={name}
      value={form[name]}
      onChange={onChange}
      placeholder={placeholder}
      onFocus={(e) => (e.target.style.borderColor = "#1976d2")}
      onBlur={(e) => (e.target.style.borderColor = "#d0d0d0")}
    />
  </div>
);

const DegreeSelect = ({ form, onChange }) => (
  <div style={s.fieldWrap}>
    <label style={s.label}>Degree *</label>
    <select
      name="degree"
      value={form.degree}
      onChange={onChange}
      style={s.select}
    >
      <option value="">Select degree…</option>
      {DEGREE_OPTIONS.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

function Education() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = () => {
    setLoading(true);
    getMyEducation()
      .then((res) => setRecords(res.data || []))
      .catch(() =>
        setMessage({ type: "error", text: "Failed to load education records." })
      )
      .finally(() => setLoading(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!form.institution.trim() || !form.degree) {
      setMessage({ type: "error", text: "Institution and degree are required." });
      return;
    }

    const payload = {
      degree: form.degree.trim(),
      institution: form.institution.trim(),
      fieldOfStudy: form.fieldOfStudy.trim(),
      passingYear: form.passingYear ? Number(form.passingYear) : null,
      percentage: form.percentage ? Number(form.percentage) : null,
      grade: form.grade.trim(),
      location: form.location.trim(),
    };

    setSaving(true);
    setMessage(null);

    try {
      await addEducation(payload);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setMessage({ type: "success", text: "Education record added." });
      fetchEducation();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eduId) => {
    if (!window.confirm("Remove this education record?")) return;

    setDeletingId(eduId);
    setMessage(null);

    try {
      await deleteEducation(eduId);
      setRecords((prev) => prev.filter((r) => r.eduId !== eduId));
      setMessage({ type: "success", text: "Record removed." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete record." });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p style={{ color: "#888", fontSize: "14px" }}>Loading education records…</p>;
  }

  const fieldProps = { form, onChange: handleChange };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.heading}>Education</h2>
        <button
          style={s.addBtn}
          onClick={() => {
            setShowForm((v) => !v);
            setMessage(null);
          }}
        >
          {showForm ? "Cancel" : "+ Add Education"}
        </button>
      </div>

      {message && <div style={s.banner(message.type)}>{message.text}</div>}

      {showForm && (
        <div style={s.formBox}>
          <div style={s.formHeading}>New Education Record</div>
          <form onSubmit={handleAdd}>
            <div style={s.grid2}>
              <TextField label="Institution *" name="institution" {...fieldProps} />
              <DegreeSelect form={form} onChange={handleChange} />
            </div>

            <div style={s.grid2}>
              <TextField label="Field of Study" name="fieldOfStudy" {...fieldProps} />
              <TextField label="Grade" name="grade" {...fieldProps} />
            </div>

            <div style={s.grid3}>
              <TextField
                label="Passing Year"
                name="passingYear"
                type="number"
                placeholder="e.g. 2022"
                {...fieldProps}
              />
              <TextField
                label="Percentage"
                name="percentage"
                type="number"
                placeholder="e.g. 86.5"
                {...fieldProps}
              />
              <TextField label="Location" name="location" {...fieldProps} />
            </div>

            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn(saving)} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                style={s.cancelBtn}
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {records.length === 0 ? (
        <div style={s.emptyState}>
          No education records yet. Click "+ Add Education" to get started.
        </div>
      ) : (
        records.map((rec) => (
          <div key={rec.eduId} style={s.card}>
            <div>
              <div style={s.degreeBadge}>{rec.degree}</div>
              <div style={s.cardTitle}>{rec.institution}</div>
              {rec.fieldOfStudy && <div style={s.cardSub}>{rec.fieldOfStudy}</div>}
              <div style={s.cardMeta}>
                {rec.passingYear ? `Passing Year: ${rec.passingYear}` : ""}
                {rec.percentage != null ? ` · Percentage: ${rec.percentage}` : ""}
                {rec.grade ? ` · Grade: ${rec.grade}` : ""}
                {rec.location ? ` · Location: ${rec.location}` : ""}
              </div>
            </div>
            <button
              style={{
                ...s.deleteBtn,
                opacity: deletingId === rec.eduId ? 0.5 : 1,
                cursor: deletingId === rec.eduId ? "not-allowed" : "pointer",
              }}
              disabled={deletingId === rec.eduId}
              onClick={() => handleDelete(rec.eduId)}
            >
              {deletingId === rec.eduId ? "Removing…" : "Remove"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Education;