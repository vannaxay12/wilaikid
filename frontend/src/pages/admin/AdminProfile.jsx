import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";

const BASE_URL = "http://localhost:4000";

export default function AdminProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    api.get("/upload/me").then((r) => {
      setProfile(r.data);
      if (r.data.profile_image) setPreview(BASE_URL + r.data.profile_image);
    });
  }, []);

  function onFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMsg("");
    setErr("");
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setMsg("");
    setErr("");
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/upload/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("ອັບໂຫລດຮູບສຳເລັດ ✅");
      setPreview(BASE_URL + data.imageUrl);
      setFile(null);
    } catch (e) {
      setErr(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setUploading(false);
    }
  }

  function cancel() {
    setFile(null);
    setPreview(
      profile?.profile_image ? BASE_URL + profile.profile_image : null,
    );
    setMsg("");
    setErr("");
  }

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : "??";

  return (
    <>
      <h1 className="page-title">ໂປຣໄຟລ໌ຂອງຂ້ອຍ</h1>

      <div
        style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}
      >
        {/* LEFT — Photo card */}
        <div
          className="card"
          style={{ textAlign: "center", padding: "32px 24px" }}
        >
          {/* Avatar */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: 16,
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="profile"
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #e2e0d8",
                }}
              />
            ) : (
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "#0f3d22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#fff",
                  margin: "0 auto",
                  border: "3px solid #e2e0d8",
                }}
              >
                {initials}
              </div>
            )}
            {/* Camera button */}
            <button
              onClick={() => inputRef.current.click()}
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#1a6b3c",
                border: "2px solid #fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "14px",
              }}
              title="ປ່ຽນຮູບ"
            >
              📷
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            style={{ display: "none" }}
            onChange={onFileChange}
          />

          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>
            {profile?.first_name} {profile?.last_name}
          </div>
          <div
            style={{ fontSize: ".85rem", color: "#706e66", marginBottom: 16 }}
          >
            @{profile?.username}
          </div>
          <span
            className={`badge ${profile?.role === "admin" ? "badge-blue" : "badge-gray"}`}
          >
            {profile?.role}
          </span>

          {/* Upload buttons */}
          {file && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontSize: ".82rem",
                  color: "#706e66",
                  marginBottom: 10,
                }}
              >
                ຮູບໃໝ່: {file.name}
              </div>
              <div className="flex gap-2" style={{ justifyContent: "center" }}>
                <button className="btn btn-outline btn-sm" onClick={cancel}>
                  ຍົກເລີກ
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={upload}
                  disabled={uploading}
                >
                  {uploading ? "ກຳລັງອັບໂຫລດ..." : "💾 ບັນທຶກຮູບ"}
                </button>
              </div>
            </div>
          )}

          {!file && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 20, width: "100%" }}
              onClick={() => inputRef.current.click()}
            >
              📷 ປ່ຽນຮູບໂປຣໄຟລ໌
            </button>
          )}

          {msg && (
            <div
              style={{
                background: "#d4edda",
                color: "#155724",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: ".82rem",
                marginTop: 12,
              }}
            >
              {msg}
            </div>
          )}
          {err && (
            <div
              style={{
                background: "#f8d7da",
                color: "#721c24",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: ".82rem",
                marginTop: 12,
              }}
            >
              ⚠️ {err}
            </div>
          )}

          <div style={{ fontSize: ".75rem", color: "#aaa", marginTop: 12 }}>
            JPG, PNG, WEBP · ສູງສຸດ 3MB
          </div>
        </div>

        {/* RIGHT — Info card */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 20, fontSize: "1rem" }}>
            ຂໍ້ມູນສ່ວນຕົວ
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>ຊື່</label>
              <input
                value={profile?.first_name || ""}
                disabled
                style={{ background: "#f5f4f0", color: "#706e66" }}
              />
            </div>
            <div className="form-group">
              <label>ນາມສະກຸນ</label>
              <input
                value={profile?.last_name || ""}
                disabled
                style={{ background: "#f5f4f0", color: "#706e66" }}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <input
                value={profile?.username || ""}
                disabled
                style={{
                  background: "#f5f4f0",
                  color: "#706e66",
                  fontFamily: "var(--mono)",
                }}
              />
            </div>
            <div className="form-group">
              <label>ເບີໂທ</label>
              <input
                value={profile?.phone || "—"}
                disabled
                style={{ background: "#f5f4f0", color: "#706e66" }}
              />
            </div>
          </div>
          <div className="form-group">
            <label>ສິດທິ</label>
            <input
              value={profile?.role || ""}
              disabled
              style={{ background: "#f5f4f0", color: "#706e66" }}
            />
          </div>

          <div
            style={{
              background: "#f5f4f0",
              borderRadius: 8,
              padding: "12px 14px",
              marginTop: 8,
              fontSize: ".82rem",
              color: "#706e66",
            }}
          >
            ℹ️ ຕ້ອງການປ່ຽນຂໍ້ມູນ ຕິດຕໍ່ Admin ຄັບ
          </div>
        </div>
      </div>
    </>
  );
}
