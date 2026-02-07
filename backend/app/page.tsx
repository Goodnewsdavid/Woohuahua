export default function Page() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "32rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Lau website API</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Backend is running. Use the auth endpoints below.
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><strong>POST</strong> /api/auth/signup</li>
        <li><strong>GET</strong> /api/auth/verify-email?token=...</li>
        <li><strong>POST</strong> /api/auth/login</li>
      </ul>
    </div>
  );
}
