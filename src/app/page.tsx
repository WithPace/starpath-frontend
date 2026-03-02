import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>StarPath Frontend</h1>
      <p>Phase 4 parent MVP routes:</p>
      <ul>
        <li>
          <Link href="/chat">/chat</Link>
        </li>
        <li>
          <Link href="/dashboard">/dashboard</Link>
        </li>
      </ul>
    </main>
  );
}
