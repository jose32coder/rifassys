import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <h1>Admin</h1>
      {children}
    </section>
  );
}
