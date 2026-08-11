import { X } from "lucide-react";
import { C, STROKE } from "../lib/theme";

/* ================= Small components ================= */
export const Ic = ({ icon: I, size = 20, style }) => <I size={size} strokeWidth={STROKE} style={style} />;

export function Badge({ status, onClick }) {
  const paid = status === "paid";
  return (
    <button onClick={onClick} className="tf-badge" title="לחיצה משנה סטטוס"
      style={{ background: paid ? C.paidBg : C.unpaidBg, color: paid ? C.paidTx : C.unpaidTx }}>
      {paid ? "שולם" : "טרם שולם"}
    </button>
  );
}

export function SectionCard({ children, style }) {
  return <div className="tf-card" style={style}>{children}</div>;
}

/* ================= Layout helpers ================= */
export function TabFrame({ title, action, children }) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px 12px" }}>
        <div style={{ width: 24 }}>{action}</div>
        <div style={{ fontSize: 18, fontWeight: 400 }}>{title}</div>
        <div style={{ width: 24 }} />
      </div>
      {children}
      <div style={{ height: 10 }} />
    </>
  );
}

export function Sheet({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }} dir="rtl">
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(38,37,31,.35)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 430, background: "#fbf8f1", borderRadius: "22px 22px 0 0", padding: "18px 20px 24px", maxHeight: "88vh", overflowY: "auto", fontFamily: "'Assistant',sans-serif", color: "#26251f" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 400 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "1px solid #ede6d6", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8c8471" }}>
            <X size={16} strokeWidth={1.4} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
