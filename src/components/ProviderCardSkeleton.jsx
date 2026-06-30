export default function ProviderCardSkeleton() {
  return (
    <div style={{ background: "white", border: "1px solid rgba(124,58,237,0.08)", borderRadius: 20, padding: "22px 26px", display: "flex", alignItems: "center", gap: 20 }}>
      <div className="skel" style={{ width: 72, height: 72, borderRadius: 14, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skel" style={{ height: 18, width: "55%", borderRadius: 8 }} />
        <div className="skel" style={{ height: 14, width: "35%", borderRadius: 8 }} />
        <div className="skel" style={{ height: 13, width: "45%", borderRadius: 8 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, flexShrink: 0 }}>
        <div className="skel" style={{ height: 16, width: 90, borderRadius: 8 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skel" style={{ height: 36, width: 80, borderRadius: 10 }} />
          <div className="skel" style={{ height: 36, width: 80, borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}
