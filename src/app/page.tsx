import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>StarPath Frontend</h1>
      <p>Phase 5 role routes:</p>
      <h2>Setup</h2>
      <ul>
        <li>
          <Link href="/auth">/auth</Link>
        </li>
      </ul>
      <h2>Parent</h2>
      <ul>
        <li>
          <Link href="/chat">/chat</Link>
        </li>
        <li>
          <Link href="/dashboard">/dashboard</Link>
        </li>
      </ul>
      <h2>Doctor</h2>
      <ul>
        <li>
          <Link href="/doctor/chat">/doctor/chat</Link>
        </li>
        <li>
          <Link href="/doctor/dashboard">/doctor/dashboard</Link>
        </li>
      </ul>
      <h2>Teacher</h2>
      <ul>
        <li>
          <Link href="/teacher/chat">/teacher/chat</Link>
        </li>
        <li>
          <Link href="/teacher/dashboard">/teacher/dashboard</Link>
        </li>
      </ul>
      <h2>Org Admin</h2>
      <ul>
        <li>
          <Link href="/org-admin/dashboard">/org-admin/dashboard</Link>
        </li>
        <li>
          <Link href="/org-admin/members">/org-admin/members</Link>
        </li>
      </ul>
    </main>
  );
}
