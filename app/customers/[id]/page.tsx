import Link from "next/link";
import CustomerDetailsClient from "./CustomerDetailsClient";

type Customer = {
  zoho_contact_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  kyc_status: boolean;
  aadhar_verification: boolean;
  [key: string]: unknown;
};

type ApiResponse = {
  status: string;
  count?: number;
  data?: Customer[];
  message?: string;
};

async function fetchCustomer(id: string): Promise<Customer | null> {
  const response = await fetch(
    "https://auth-token-reg-60069906069.development.catalystserverless.in/server/list-customers",
    { cache: "no-store" }
  );
  const data: ApiResponse = await response.json();

  if (!response.ok || data.status !== "success" || !data.data) {
    return null;
  }

  return data.data.find((customer) => customer.zoho_contact_id === id) || null;
}

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await fetchCustomer(id);

  if (!customer) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e8eaf0", padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ marginBottom: 18 }}>
          <Link href="/customers" style={{ color: "#9ca3af", textDecoration: "none" }}>
            ← Back to Customers
          </Link>
        </div>
        <div style={{ background: "#14171e", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Customer not found</div>
          <div style={{ color: "#9ca3af" }}>We could not locate a customer with the selected Zoho contact ID.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e8eaf0", padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            🧾
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Customer details</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Zoho Contact ID: {customer.zoho_contact_id}</div>
          </div>
        </div>
        <Link href="/customers" style={{ padding: "8px 12px", borderRadius: 8, background: "#1c2029", color: "#e8eaf0", textDecoration: "none" }}>
          Back to Customers
        </Link>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, maxWidth: 920 }}>
        <div style={{ background: "#14171e", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{customer.full_name || "Unknown customer"}</div>
          <div style={{ fontSize: 14, color: "#9ca3af", marginBottom: 18 }}>Full record and verification details for this customer.</div>

          <CustomerDetailsClient customer={customer} />
        </div>
      </section>
    </div>
  );
}
