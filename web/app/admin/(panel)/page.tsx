import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-green-700">Dashboard</h1>
      <p className="mt-2 text-muted">Welcome, {user.name}.</p>
    </div>
  );
}
