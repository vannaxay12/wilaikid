import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";

const BASE = "http://localhost:4000";

function QRUploadCard({ bank, label, currentQR, onUploaded }) {
  const [preview, setPreview] = useState(currentQR ? BASE + currentQR : null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    setPreview(currentQR ? BASE + currentQR : null);
  }, [currentQR]);

  async function upload(file) {
    if (!file) return;
    setUploading(true);
    setMsg("");
    const fd = new FormData();
    fd.append("qr", file);
    try {
      const { data } = await api.post(`/settings/qr/${bank}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPreview(BASE + data.qrUrl);
      setMsg("ອັບໂຫລດສຳເລັດ ✅");
      onUploaded && onUploaded(data.qrUrl);
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 16 }}>
        {label}
      </div>

      {/* QR Preview */}
      <div
        style={{
          width: 200,
          height: 200,
          margin: "0 auto 16px",
          borderRadius: 12,
          border: "2px dashed #e2e0d8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#f5f4f0",
          cursor: "pointer",
        }}
        onClick={() => inputRef.current.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="QR"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#aaa" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: ".8rem" }}>ກົດເພື່ອອັບໂຫລດ QR</div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => upload(e.target.files[0])}
      />

      <button
        className="btn btn-primary btn-sm"
        onClick={() => inputRef.current.click()}
        disabled={uploading}
        style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}
      >
        {uploading ? "ກຳລັງອັບໂຫລດ..." : "📷 ອັບໂຫລດ QR ໃໝ່"}
      </button>

      {msg && (
        <div
          style={{
            fontSize: ".82rem",
            marginTop: 4,
            color: msg.includes("✅") ? "#155724" : "#721c24",
          }}
        >
          {msg}
        </div>
      )}
      <div style={{ fontSize: ".75rem", color: "#aaa", marginTop: 6 }}>
        JPG, PNG · ສູງສຸດ 2MB
      </div>
    </div>
  );
}

export default function ShopSettings() {
  const [settings, setSettings] = useState({});
  const [bankBcel, setBankBcel] = useState("");
  const [bankLdb, setBankLdb] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get("/settings").then((r) => {
      setSettings(r.data);
      setBankBcel(r.data.bank_bcel || "");
      setBankLdb(r.data.bank_ldb || "");
    });
  }, []);

  async function saveBankInfo() {
    setSaving(true);
    setMsg("");
    try {
      await api.post("/settings/bank_bcel", { value: bankBcel });
      await api.post("/settings/bank_ldb", { value: bankLdb });
      setMsg("ບັນທຶກສຳເລັດ ✅");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("❌ ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <h1 className="page-title">ຕັ້ງຄ່າຮ້ານ</h1>

      {/* Bank info */}
      <div className="card mb-4">
        <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 16 }}>
          🏦 ຂໍ້ມູນບັນຊີໂອນເງິນ
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>ເລກບັນຊີ BCEL</label>
            <input
              value={bankBcel}
              onChange={(e) => setBankBcel(e.target.value)}
              placeholder="010-XXXX-XXXX-XXX"
            />
          </div>
          <div className="form-group">
            <label>ເລກບັນຊີ LDB</label>
            <input
              value={bankLdb}
              onChange={(e) => setBankLdb(e.target.value)}
              placeholder="020-XXXX-XXXX-XXX"
            />
          </div>
        </div>
        {msg && (
          <div
            style={{
              fontSize: ".85rem",
              color: msg.includes("✅") ? "#155724" : "#721c24",
              marginBottom: 10,
            }}
          >
            {msg}
          </div>
        )}
        <button
          className="btn btn-primary"
          onClick={saveBankInfo}
          disabled={saving}
        >
          {saving ? "ກຳລັງບັນທຶກ..." : "💾 ບັນທຶກຂໍ້ມູນບັນຊີ"}
        </button>
      </div>

      {/* QR Upload */}
      <div style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 14 }}>
        📱 QR Code ສຳລັບໂອນເງິນ
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <QRUploadCard
          bank="bcel"
          label="📱 BCEL One QR"
          currentQR={settings.qr_bcel}
          onUploaded={(url) => setSettings((s) => ({ ...s, qr_bcel: url }))}
        />
        <QRUploadCard
          bank="ldb"
          label="🏦 LDB QR"
          currentQR={settings.qr_ldb}
          onUploaded={(url) => setSettings((s) => ({ ...s, qr_ldb: url }))}
        />
      </div>
    </>
  );
}
