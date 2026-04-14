// src/components/userprofile/UploadPhoto.js
// After a successful upload:
//   1. reads the URL from the backend response
//   2. shows the real hosted image (not just the local file preview)
//   3. calls onPhotoUploaded(url) so UserProfileMain can refresh ProfileView

import { useState, useRef } from "react";
import { uploadPhoto } from "./EmployeeApi";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_SIZE_MB    = 2;

function UploadPhoto({ onPhotoUploaded }) {
  const [preview,   setPreview]   = useState(null);  // local FileReader preview
  const [liveUrl,   setLiveUrl]   = useState(null);  // URL returned by backend
  const [file,      setFile]      = useState(null);
  const [dragging,  setDragging]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message,   setMessage]   = useState(null);  // { type, text }
  const inputRef = useRef();

  // ── file validation + local preview ──────────────────────────────────────
  const processFile = (f) => {
    setMessage(null);
    setLiveUrl(null);
    if (!f) return;

    if (!ACCEPTED_TYPES.includes(f.type)) {
      setMessage({ type: "error", text: "Only JPG, PNG, or jpg images are allowed." });
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: "error", text: `File must be smaller than ${MAX_SIZE_MB} MB.` });
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  // ── drag events ───────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  // ── upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);

    try {
      const res = await uploadPhoto(file);

      // ── extract the URL from whatever shape your backend returns ──────────
      // Common patterns — handles all of them:
      //   res.data = "http://localhost:8085/uploads/abc.jpg"   (plain string)
      //   res.data = { url: "http://..." }
      //   res.data = { profilePhotoUrl: "http://..." }
      //   res.data = { message: "...", url: "http://..." }
      let uploadedUrl = null;
      if (typeof res.data === "string") {
        uploadedUrl = res.data;
      } else if (res.data?.url) {
        uploadedUrl = res.data.url;
      } else if (res.data?.profilePhotoUrl) {
        uploadedUrl = res.data.profilePhotoUrl;
      }

      setLiveUrl(uploadedUrl);
      setFile(null);   // clear file — upload is done
      if (inputRef.current) inputRef.current.value = "";

      setMessage({ type: "success", text: "Photo uploaded successfully." });

      // ── tell parent to refetch dashboard & switch to profile tab ─────────
      if (onPhotoUploaded) onPhotoUploaded(uploadedUrl);

    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Upload failed. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDiscard = () => {
    setFile(null);
    setPreview(null);
    setLiveUrl(null);
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── what to show in the avatar circle ─────────────────────────────────────
  // Priority: live hosted URL > local file preview > placeholder
  const displaySrc = liveUrl || preview;

  // ── styles ────────────────────────────────────────────────────────────────
  const s = {
    container: { maxWidth: "480px" },
    heading: { fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1a1a2e" },

    dropZone: {
      border: `2px dashed ${dragging ? "#1976d2" : "#ccc"}`,
      borderRadius: "10px",
      padding: "36px 20px",
      textAlign: "center",
      cursor: "pointer",
      backgroundColor: dragging ? "#e3f2fd" : "#fafafa",
      transition: "border-color 0.2s, background-color 0.2s",
      marginBottom: "20px",
    },

    avatarWrap: {
      width: "120px", height: "120px", borderRadius: "50%",
      overflow: "hidden", margin: "0 auto 16px",
      border: `3px solid ${liveUrl ? "#43a047" : "#1976d2"}`,
      backgroundColor: "#e0e0e0",
      transition: "border-color 0.3s",
    },
    avatar:      { width: "100%", height: "100%", objectFit: "cover" },
    placeholder: {
      width: "100%", height: "100%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "48px", color: "#bbb",
    },

    liveTag: {
      display: "inline-block", padding: "2px 10px", borderRadius: "12px",
      backgroundColor: "#e8f5e9", color: "#2e7d32",
      fontSize: "11px", fontWeight: "600", marginBottom: "8px",
    },

    hintText:  { fontSize: "13px", color: "#888", marginTop: "8px" },
    browseBtn: {
      display: "inline-block", marginTop: "10px", padding: "7px 18px",
      fontSize: "13px", backgroundColor: "#fff", border: "1px solid #1976d2",
      color: "#1976d2", borderRadius: "6px", cursor: "pointer",
    },

    banner: (type) => ({
      padding: "10px 14px", borderRadius: "6px", fontSize: "13px",
      marginBottom: "16px",
      backgroundColor: type === "success" ? "#e8f5e9" : "#fdecea",
      color:           type === "success" ? "#2e7d32" : "#c62828",
      border: `1px solid ${type === "success" ? "#c8e6c9" : "#f5c6cb"}`,
    }),

    urlBox: {
      fontSize: "11px", color: "#888", wordBreak: "break-all",
      padding: "8px 10px", background: "#f5f5f5",
      borderRadius: "6px", marginBottom: "16px",
      border: "1px solid #e0e0e0",
    },

    actions: { display: "flex", gap: "10px" },
    uploadBtn: {
      padding: "9px 24px",
      backgroundColor: uploading ? "#90b8e0" : "#1976d2",
      color: "#fff", border: "none", borderRadius: "6px",
      fontSize: "14px", fontWeight: "500",
      cursor: uploading ? "not-allowed" : "pointer",
    },
    discardBtn: {
      padding: "9px 20px", backgroundColor: "#fff",
      color: "#d32f2f", border: "1px solid #d32f2f",
      borderRadius: "6px", fontSize: "14px", cursor: "pointer",
    },
    meta: { fontSize: "12px", color: "#aaa", marginTop: "16px" },
  };

  return (
    <div style={s.container}>
      <h2 style={s.heading}>Upload Photo</h2>

      {message && <div style={s.banner(message.type)}>{message.text}</div>}

      {/* ── Drop zone ─────────────────────────────────────────────── */}
      <div
        style={s.dropZone}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !liveUrl && inputRef.current?.click()}
      >
        {/* Avatar */}
        <div style={s.avatarWrap}>
          {displaySrc
            ? <img src={displaySrc} alt="Profile preview" style={s.avatar} />
            : <div style={s.placeholder}>👤</div>
          }
        </div>

        {/* State-dependent messaging */}
        {liveUrl ? (
          <>
            <div style={s.liveTag}>✓ Live on server</div>
            <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0" }}>
              Your new photo is saved. Switch to <strong>View Profile</strong> to see it.
            </p>
          </>
        ) : file ? (
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
            <strong>{file.name}</strong>
            <br />
            <span style={s.hintText}>Ready to upload — click "Upload Photo" below</span>
          </p>
        ) : (
          <>
            <p style={{ fontSize: "14px", color: "#555", margin: 0 }}>
              Drag &amp; drop your photo here
            </p>
            <p style={s.hintText}>or</p>
            <span style={s.browseBtn}>Browse file</span>
            <p style={s.hintText}>JPG, PNG, jpg · Max {MAX_SIZE_MB} MB</p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={(e) => processFile(e.target.files?.[0])}
        />
      </div>

      {/* Show the saved URL so the user can verify */}
      {liveUrl && (
        <div style={s.urlBox}>
          Saved URL: <strong>{liveUrl}</strong>
        </div>
      )}

      {/* Action buttons */}
      {file && !liveUrl && (
        <div style={s.actions}>
          <button style={s.uploadBtn} disabled={uploading} onClick={handleUpload}>
            {uploading ? "Uploading…" : "Upload Photo"}
          </button>
          <button style={s.discardBtn} onClick={handleDiscard}>
            Discard
          </button>
        </div>
      )}

      {liveUrl && (
        <button style={s.discardBtn} onClick={handleDiscard}>
          Replace photo
        </button>
      )}

      <p style={s.meta}>
        Your photo is only visible to HR and internal team members.
      </p>
    </div>
  );
}

export default UploadPhoto;