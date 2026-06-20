"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [aadharVerifiedOnly, setAadharVerifiedOnly] = useState(false);
  const [kycCompleteOnly, setKycCompleteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/list-customers");
      const data: ApiResponse = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Unable to load customers.");
      }

      setCustomers(data.data || []);
      setSelected({});
    } catch (err: any) {
      setError(err?.message || "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        if (aadharVerifiedOnly && !customer.aadhar_verification) {
          return false;
        }
        if (kycCompleteOnly && !customer.kyc_status) {
          return false;
        }
        return true;
      }),
    [customers, aadharVerifiedOnly, kycCompleteOnly]
  );

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((customer) => selected[customer.zoho_contact_id]);

  function toggleSelect(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleSelectAll(checked: boolean) {
    const next = { ...selected };
    filteredCustomers.forEach((customer) => {
      next[customer.zoho_contact_id] = checked;
    });
    setSelected(next);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e8eaf0", padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Customers</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Registered customers and contact details</div>
          </div>
        </div>
        <button
          onClick={loadCustomers}
          disabled={loading}
          style={{ padding: "8px 12px", borderRadius: 8, background: "#1c2029", color: "#e8eaf0", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Refresh
        </button>
      </header>

      <div style={{ marginBottom: 18 }}>
        <Link href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>
          ← Back to Admin Home
        </Link>
      </div>

      <section style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#14171e", padding: 10, borderRadius: 8 }}>
          <input type="checkbox" checked={aadharVerifiedOnly} onChange={(event) => setAadharVerifiedOnly(event.target.checked)} />
          Aadhar verified
        </label>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#14171e", padding: 10, borderRadius: 8 }}>
          <input type="checkbox" checked={kycCompleteOnly} onChange={(event) => setKycCompleteOnly(event.target.checked)} />
          Complete KYC
        </label>
        <div style={{ minWidth: 180, background: "#14171e", padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Showing</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{filteredCustomers.length}</div>
        </div>
        <div style={{ minWidth: 180, background: "#14171e", padding: 10, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>Selected</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{selectedCount}</div>
        </div>
      </section>

      <section style={{ background: "#14171e", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#0f1724", color: "#9ca3af" }}>
            <tr>
              <th style={{ padding: 12, width: 42 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => toggleSelectAll(event.target.checked)}
                  disabled={filteredCustomers.length === 0}
                />
              </th>
              <th style={{ padding: 12, textAlign: "left" }}>Zoho Contact ID</th>
              <th style={{ padding: 12, textAlign: "left" }}>Name</th>
              <th style={{ padding: 12, textAlign: "left" }}>Phone</th>
              <th style={{ padding: 12, textAlign: "left" }}>Email</th>
              <th style={{ padding: 12, textAlign: "left" }}>Aadhar</th>
              <th style={{ padding: 12, textAlign: "left" }}>KYC</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: 20, color: "#9ca3af" }}>
                  Loading customers...
                </td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td colSpan={7} style={{ padding: 20, color: "#f87171" }}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && filteredCustomers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 20, color: "#9ca3af" }}>
                  No customers match the selected filters.
                </td>
              </tr>
            )}
            {!loading && !error && filteredCustomers.map((customer) => {
              const id = customer.zoho_contact_id;
              return (
                <tr key={id} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={{ padding: 12 }}>
                    <input
                      type="checkbox"
                      checked={!!selected[id]}
                      onChange={() => toggleSelect(id)}
                    />
                  </td>
                  <td style={{ padding: 12, fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>{id}</td>
                  <td style={{ padding: 12 }}>
                    <Link href={`/customers/${id}`} style={{ color: "#4ade80", textDecoration: "none", fontWeight: 600 }}>
                      {customer.full_name || "—"}
                    </Link>
                  </td>
                  <td style={{ padding: 12 }}>{customer.phone_number || "—"}</td>
                  <td style={{ padding: 12 }}>{customer.email || "—"}</td>
                  <td style={{ padding: 12, color: customer.aadhar_verification ? "#4ade80" : "#f87171" }}>
                    {customer.aadhar_verification ? "Verified" : "Not verified"}
                  </td>
                  <td style={{ padding: 12, color: customer.kyc_status ? "#4ade80" : "#f87171" }}>
                    {customer.kyc_status ? "Complete" : "Incomplete"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
