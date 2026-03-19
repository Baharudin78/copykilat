import { useState, useEffect, useRef } from "react";

const MODES = [
  {
    id: "caption",
    title: "Caption IG / TikTok",
    icon: "📱",
    desc: "Bikin caption yang engaging & viral",
    color: "#E1306C",
    fields: [
      { key: "product", label: "Produk / Topik", placeholder: "Contoh: Serum wajah vitamin C, Kopi susu kekinian, dll", type: "text" },
      { key: "audience", label: "Target Audience", placeholder: "Contoh: Wanita 18-30 tahun, pecinta skincare", type: "text" },
      { key: "tone", label: "Gaya Bahasa", placeholder: "Contoh: Santai, lucu, profesional, aesthetic", type: "text" },
      { key: "promo", label: "Promo / CTA (opsional)", placeholder: "Contoh: Diskon 50% hari ini aja!", type: "text", optional: true },
      { key: "hashtag", label: "Mau pakai hashtag?", type: "toggle" },
    ],
  },
  {
    id: "product",
    title: "Deskripsi Produk",
    icon: "🛒",
    desc: "Deskripsi Shopee / Tokopedia yang menjual",
    color: "#EE4D2D",
    fields: [
      { key: "product", label: "Nama Produk", placeholder: "Contoh: Tas Selempang Kulit Premium", type: "text" },
      { key: "details", label: "Detail / Spesifikasi", placeholder: "Contoh: Bahan kulit sintetis, ukuran 25x18cm, ada 3 warna", type: "textarea" },
      { key: "audience", label: "Target Pembeli", placeholder: "Contoh: Pria dewasa 25-40 tahun, pekerja kantoran", type: "text" },
      { key: "keunggulan", label: "Keunggulan / USP", placeholder: "Contoh: Tahan air, garansi 1 tahun, free box premium", type: "text" },
      { key: "platform", label: "Platform", type: "select", options: ["Shopee", "Tokopedia", "TikTok Shop", "Lazada"] },
    ],
  },
  {
    id: "ads",
    title: "Copy Iklan",
    icon: "📢",
    desc: "Copy ads yang convert buat FB/Google Ads",
    color: "#1877F2",
    fields: [
      { key: "product", label: "Produk / Jasa", placeholder: "Contoh: Kursus digital marketing online", type: "text" },
      { key: "audience", label: "Target Audience", placeholder: "Contoh: Pemula yang mau belajar bisnis online", type: "text" },
      { key: "benefit", label: "Benefit Utama", placeholder: "Contoh: Bisa menghasilkan dari rumah, materi lengkap", type: "text" },
      { key: "offer", label: "Penawaran", placeholder: "Contoh: Diskon 70% + bonus e-book gratis", type: "text" },
      { key: "platform", label: "Platform Iklan", type: "select", options: ["Facebook / Instagram Ads", "Google Ads", "TikTok Ads"] },
    ],
  },
];

const DAILY_LIMIT = 5;

function getSystemPrompt(mode, fields) {
  const base = `Kamu adalah CopyKilat, AI copywriter profesional khusus bahasa Indonesia. 
Kamu ahli membuat teks marketing yang menjual, engaging, dan sesuai dengan kultur Indonesia.
PENTING: Selalu jawab dalam Bahasa Indonesia. Gunakan bahasa yang natural dan tidak kaku.
Berikan 3 variasi copy yang berbeda, pisahkan dengan "---".
Setiap variasi harus punya pendekatan/angle yang berbeda.`;

  if (mode === "caption") {
    return `${base}
Kamu sedang membuat caption Instagram/TikTok.
Buat caption yang:
- Engaging dan bikin orang berhenti scroll
- Ada hook yang kuat di kalimat pertama
- Relevan dengan target audience
- ${fields.hashtag ? "Sertakan 5-10 hashtag relevan di akhir" : "JANGAN sertakan hashtag"}
- Panjang ideal 100-200 kata per variasi
- Gunakan emoji yang relevan tapi jangan berlebihan`;
  }

  if (mode === "product") {
    const platformGuide = {
      Shopee: "Format Shopee: gunakan emoji bullet points, highlight promo, ada bagian spesifikasi yang rapi",
      Tokopedia: "Format Tokopedia: deskripsi detail dan terstruktur, gunakan bullet points rapi",
      "TikTok Shop": "Format TikTok Shop: singkat, catchy, highlight benefit utama",
      Lazada: "Format Lazada: professional, detail spesifikasi lengkap",
    };
    return `${base}
Kamu sedang membuat deskripsi produk untuk ${fields.platform || "marketplace"}.
${platformGuide[fields.platform] || ""}
Buat deskripsi yang:
- Menjual dan meyakinkan pembeli
- Highlight keunggulan dan benefit
- Ada struktur yang jelas (intro, detail, keunggulan, CTA)
- SEO-friendly dengan kata kunci yang relevan
- Panjang 150-300 kata per variasi`;
  }

  if (mode === "ads") {
    const platformGuide = {
      "Facebook / Instagram Ads": "Format FB/IG Ads: hook kuat, storytelling singkat, CTA jelas. Primary text + headline + description.",
      "Google Ads": "Format Google Ads: headline max 30 karakter x 3, description max 90 karakter x 2. Fokus keyword dan benefit.",
      "TikTok Ads": "Format TikTok Ads: sangat singkat, catchy, bahasa casual, hook dalam 3 detik pertama.",
    };
    return `${base}
Kamu sedang membuat copy iklan untuk ${fields.platform || "digital ads"}.
${platformGuide[fields.platform] || ""}
Buat copy yang:
- Hook yang bikin stop scrolling
- Highlight pain point dan solusi
- Ada social proof atau urgency
- CTA yang kuat dan jelas
- Format sesuai platform iklan`;
  }
  return base;
}

function buildUserPrompt(mode, fields) {
  if (mode === "caption") {
    return `Buatkan 3 variasi caption Instagram/TikTok untuk:
Produk/Topik: ${fields.product}
Target Audience: ${fields.audience}
Gaya Bahasa: ${fields.tone}
${fields.promo ? `Promo/CTA: ${fields.promo}` : ""}`;
  }
  if (mode === "product") {
    return `Buatkan 3 variasi deskripsi produk untuk:
Nama Produk: ${fields.product}
Detail/Spesifikasi: ${fields.details}
Target Pembeli: ${fields.audience}
Keunggulan: ${fields.keunggulan}
Platform: ${fields.platform}`;
  }
  if (mode === "ads") {
    return `Buatkan 3 variasi copy iklan untuk:
Produk/Jasa: ${fields.product}
Target Audience: ${fields.audience}
Benefit Utama: ${fields.benefit}
Penawaran: ${fields.offer}
Platform: ${fields.platform}`;
  }
}

export default function CopyKilat() {
  const [screen, setScreen] = useState("home");
  const [selectedMode, setSelectedMode] = useState(null);
  const [formData, setFormData] = useState({});
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState(-1);
  const [animateIn, setAnimateIn] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("ck_api_key");
    if (stored) setApiKey(stored);
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem("ck_usage") || "{}");
    setUsageCount(usage[today] || 0);
  }, []);

  useEffect(() => {
    setAnimateIn(true);
  }, [screen]);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("ck_api_key", key);
    setShowApiKeyInput(false);
  };

  const incrementUsage = () => {
    const today = new Date().toDateString();
    const usage = JSON.parse(localStorage.getItem("ck_usage") || "{}");
    usage[today] = (usage[today] || 0) + 1;
    localStorage.setItem("ck_usage", JSON.stringify(usage));
    setUsageCount(usage[today]);
  };

  const generate = async () => {
    if (usageCount >= DAILY_LIMIT) {
      setError(`Limit harian tercapai (${DAILY_LIMIT}x/hari). Upgrade ke Pro untuk unlimited! 🚀`);
      return;
    }

    const mode = MODES.find((m) => m.id === selectedMode);
    const requiredFields = mode.fields.filter((f) => f.type !== "toggle" && f.type !== "select" && !f.optional);
    const missing = requiredFields.filter((f) => !formData[f.key]?.trim());
    if (missing.length > 0) {
      setError(`Isi dulu: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    const payload = {
      system_instruction: { parts: [{ text: getSystemPrompt(selectedMode, formData) }] },
      contents: [{ parts: [{ text: buildUserPrompt(selectedMode, formData) }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
    };

    try {
      let resp;

      if (apiKey) {
        // User punya API key sendiri — panggil Gemini langsung
        resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Pakai server proxy (API key di server)
        resp = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        const msg = errData?.error?.message || errData?.error || `API Error ${resp.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Respons kosong dari AI");

      setResult(text);
      incrementUsage();
      setScreen("result");
    } catch (err) {
      setError(err.message.includes("API key")
        ? "API key tidak valid. Cek lagi ya!"
        : `Gagal generate: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(-1), 2000);
  };

  const resultVariants = result
    .split("---")
    .map((s) => s.trim())
    .filter(Boolean);

  // ──────────── STYLES ────────────
  const styles = {
    app: {
      minHeight: "100vh",
      background: "#0A0A0F",
      color: "#E8E8ED",
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    glow: {
      position: "fixed",
      width: 600,
      height: 600,
      borderRadius: "50%",
      filter: "blur(120px)",
      opacity: 0.12,
      pointerEvents: "none",
      zIndex: 0,
    },
    container: {
      maxWidth: 720,
      margin: "0 auto",
      padding: "20px 20px 40px",
      position: "relative",
      zIndex: 1,
    },
    nav: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 0",
      marginBottom: 8,
    },
    logo: {
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: "-0.5px",
      background: "linear-gradient(135deg, #FBBF24, #F59E0B, #D97706)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      cursor: "pointer",
    },
    badge: {
      fontSize: 11,
      fontWeight: 600,
      padding: "4px 10px",
      borderRadius: 20,
      background: "rgba(251, 191, 36, 0.15)",
      color: "#FBBF24",
      border: "1px solid rgba(251, 191, 36, 0.2)",
    },
    heroTitle: {
      fontSize: "clamp(28px, 6vw, 44px)",
      fontWeight: 800,
      lineHeight: 1.1,
      marginBottom: 12,
      letterSpacing: "-1px",
    },
    heroSub: {
      fontSize: 16,
      color: "#9898A6",
      lineHeight: 1.6,
      marginBottom: 32,
    },
    modeCard: (color, isHovered) => ({
      background: isHovered
        ? `linear-gradient(135deg, ${color}18, ${color}08)`
        : "rgba(255,255,255,0.03)",
      border: `1px solid ${isHovered ? color + "40" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 16,
      padding: "20px 22px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      transform: isHovered ? "translateY(-2px)" : "none",
    }),
    input: {
      width: "100%",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      color: "#E8E8ED",
      fontSize: 14,
      outline: "none",
      transition: "border 0.2s",
      boxSizing: "border-box",
    },
    button: (primary) => ({
      padding: primary ? "14px 32px" : "10px 20px",
      background: primary
        ? "linear-gradient(135deg, #FBBF24, #D97706)"
        : "rgba(255,255,255,0.06)",
      color: primary ? "#0A0A0F" : "#E8E8ED",
      border: primary ? "none" : "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      fontSize: primary ? 15 : 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
    }),
    resultCard: (idx) => ({
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px 22px",
      marginBottom: 16,
      position: "relative",
      animation: `fadeSlideUp 0.4s ease ${idx * 0.1}s both`,
    }),
    select: {
      width: "100%",
      padding: "12px 16px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      color: "#E8E8ED",
      fontSize: 14,
      outline: "none",
      appearance: "none",
      cursor: "pointer",
      boxSizing: "border-box",
    },
    apiKeyModal: {
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100,
      padding: 20,
    },
  };

  // ──────────── HOME ────────────
  const renderHome = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 40, marginTop: 20 }}>
        <div style={styles.heroTitle}>
          Bikin Copy yang{" "}
          <span style={{ background: "linear-gradient(135deg, #FBBF24, #F59E0B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Menjual
          </span>
          <br />
          dalam Hitungan Detik ⚡
        </div>
        <div style={styles.heroSub}>
          AI copywriter khusus bahasa Indonesia. Caption IG, deskripsi produk,
          copy iklan — semua jadi gampang.
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {MODES.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            onClick={() => {
              setSelectedMode(mode.id);
              setFormData(mode.fields.find(f => f.type === "select")
                ? { [mode.fields.find(f => f.type === "select").key]: mode.fields.find(f => f.type === "select").options[0] }
                : {});
              setScreen("form");
              setError("");
            }}
            styles={styles}
          />
        ))}
      </div>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ display: "inline-flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {["🚀 Gratis, tanpa daftar", "🇮🇩 Bahasa Indonesia", "⚡ Hasil instan"].map((t) => (
            <span key={t} style={{ fontSize: 13, color: "#7A7A8A" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span
          style={{ fontSize: 12, color: "#55555F", cursor: "pointer", textDecoration: "underline" }}
          onClick={() => setShowApiKeyInput(true)}
        >
          ⚙️ {apiKey ? "Ganti API Key" : "Pakai API Key sendiri (opsional)"}
        </span>
        {apiKey && (
          <span style={{ fontSize: 12, color: "#4ADE80", marginLeft: 12 }}>
            ✓ API Key tersimpan
          </span>
        )}
      </div>
    </div>
  );

  // ──────────── FORM ────────────
  const renderForm = () => {
    const mode = MODES.find((m) => m.id === selectedMode);
    return (
      <div>
        <button
          onClick={() => { setScreen("home"); setError(""); }}
          style={{ ...styles.button(false), marginBottom: 20, padding: "8px 16px" }}
        >
          ← Kembali
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 32 }}>{mode.icon}</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{mode.title}</div>
            <div style={{ fontSize: 13, color: "#7A7A8A" }}>{mode.desc}</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18 }}>
          {mode.fields.map((field) => (
            <div key={field.key}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#B0B0BC", display: "block", marginBottom: 6 }}>
                {field.label}
              </label>
              {field.type === "text" && (
                <input
                  style={styles.input}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  onFocus={(e) => (e.target.style.border = "1px solid #FBBF2480")}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  style={{ ...styles.input, minHeight: 80, resize: "vertical" }}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  onFocus={(e) => (e.target.style.border = "1px solid #FBBF2480")}
                  onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
                />
              )}
              {field.type === "select" && (
                <select
                  style={styles.select}
                  value={formData[field.key] || field.options[0]}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                >
                  {field.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              )}
              {field.type === "toggle" && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                  onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
                >
                  <div style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: formData[field.key] ? "#FBBF24" : "rgba(255,255,255,0.1)",
                    transition: "background 0.2s", position: "relative",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#fff",
                      position: "absolute", top: 3,
                      left: formData[field.key] ? 23 : 3,
                      transition: "left 0.2s",
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: formData[field.key] ? "#FBBF24" : "#7A7A8A" }}>
                    {formData[field.key] ? "Ya, sertakan" : "Tidak"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 12,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#EF4444", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#55555F" }}>
            {usageCount}/{DAILY_LIMIT} generate hari ini
          </span>
          <button
            style={{
              ...styles.button(true),
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={generate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⚡</span>
                Generating...
              </>
            ) : (
              <>⚡ Generate Copy</>
            )}
          </button>
        </div>
      </div>
    );
  };

  // ──────────── RESULT ────────────
  const renderResult = () => {
    const mode = MODES.find((m) => m.id === selectedMode);
    return (
      <div ref={resultRef}>
        <button
          onClick={() => { setScreen("form"); setResult(""); }}
          style={{ ...styles.button(false), marginBottom: 20, padding: "8px 16px" }}
        >
          ← Edit & Generate Ulang
        </button>

        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
          {mode.icon} Hasil {mode.title}
        </div>
        <div style={{ fontSize: 13, color: "#7A7A8A", marginBottom: 20 }}>
          {resultVariants.length} variasi copy siap pakai
        </div>

        {resultVariants.map((variant, idx) => (
          <div key={idx} style={styles.resultCard(idx)}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
                background: `${mode.color}20`, color: mode.color,
              }}>
                VARIASI {idx + 1}
              </span>
              <button
                onClick={() => copyToClipboard(variant, idx)}
                style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  background: copied === idx ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.06)",
                  color: copied === idx ? "#4ADE80" : "#B0B0BC",
                  fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {copied === idx ? "✓ Tersalin!" : "📋 Salin"}
              </button>
            </div>
            <div style={{
              fontSize: 14, lineHeight: 1.7, color: "#D0D0DA", whiteSpace: "pre-wrap",
            }}>
              {variant}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
          <button
            onClick={() => { setScreen("form"); setResult(""); }}
            style={styles.button(true)}
          >
            ⚡ Generate Lagi
          </button>
          <button
            onClick={() => { copyToClipboard(resultVariants.join("\n\n---\n\n"), 99); }}
            style={styles.button(false)}
          >
            📋 Salin Semua
          </button>
          <button
            onClick={() => { setScreen("home"); setResult(""); setSelectedMode(null); }}
            style={styles.button(false)}
          >
            🏠 Home
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.18; }
        }
        input::placeholder, textarea::placeholder {
          color: #55555F;
        }
        select option {
          background: #1A1A24;
          color: #E8E8ED;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      {/* Background glows */}
      <div style={{ ...styles.glow, background: "#FBBF24", top: -200, right: -200, animation: "pulse 6s ease infinite" }} />
      <div style={{ ...styles.glow, background: "#7C3AED", bottom: -200, left: -200, animation: "pulse 8s ease infinite 2s" }} />

      <div style={styles.container}>
        {/* Nav */}
        <div style={styles.nav}>
          <div style={styles.logo} onClick={() => { setScreen("home"); setResult(""); setSelectedMode(null); }}>
            ⚡ CopyKilat
          </div>
          <div style={styles.badge}>
            {usageCount}/{DAILY_LIMIT} free
          </div>
        </div>

        {/* Content */}
        <div style={{ animation: "fadeSlideUp 0.35s ease" }}>
          {screen === "home" && renderHome()}
          {screen === "form" && renderForm()}
          {screen === "result" && renderResult()}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyInput && (
        <div style={styles.apiKeyModal} onClick={() => setShowApiKeyInput(false)}>
          <div
            style={{
              background: "#14141F",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 20,
              padding: "28px 24px",
              maxWidth: 420,
              width: "100%",
              animation: "fadeSlideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>🔑 API Key Sendiri (Opsional)</div>
            <div style={{ fontSize: 13, color: "#7A7A8A", marginBottom: 16, lineHeight: 1.5 }}>
              Kamu bisa pakai CopyKilat tanpa API key. Tapi kalau mau pakai key sendiri
              untuk kuota lebih besar, ambil gratis di{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#FBBF24", textDecoration: "underline" }}
              >
                aistudio.google.com/apikey
              </a>
              <br />
              Key disimpan di browser kamu saja.
            </div>
            <input
              style={{ ...styles.input, marginBottom: 14 }}
              placeholder="AIzaSy..."
              defaultValue={apiKey}
              id="api-key-input"
              onFocus={(e) => (e.target.style.border = "1px solid #FBBF2480")}
              onBlur={(e) => (e.target.style.border = "1px solid rgba(255,255,255,0.1)")}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                style={{ ...styles.button(true), flex: 1, justifyContent: "center" }}
                onClick={() => {
                  const val = document.getElementById("api-key-input").value.trim();
                  if (val) saveApiKey(val);
                }}
              >
                Simpan
              </button>
              {apiKey && (
                <button
                  style={{ ...styles.button(false), flex: 1, justifyContent: "center", color: "#EF4444" }}
                  onClick={() => {
                    setApiKey("");
                    localStorage.removeItem("ck_api_key");
                    setShowApiKeyInput(false);
                  }}
                >
                  Hapus Key
                </button>
              )}
              <button
                style={{ ...styles.button(false), flex: 1, justifyContent: "center" }}
                onClick={() => setShowApiKeyInput(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModeCard({ mode, onClick, styles }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={styles.modeCard(mode.color, hovered)}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 28 }}>{mode.icon}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{mode.title}</div>
          <div style={{ fontSize: 13, color: "#7A7A8A", marginTop: 2 }}>{mode.desc}</div>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 18, color: "#55555F" }}>→</span>
      </div>
    </div>
  );
}
