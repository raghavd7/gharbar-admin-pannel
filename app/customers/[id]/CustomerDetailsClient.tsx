"use client";

import React, { useMemo, useState } from "react";

type Customer = {
  zoho_contact_id: string;
  full_name: string;
  phone_number: string;
  email: string;
  kyc_status: boolean;
  aadhar_verification: boolean;
  [key: string]: unknown;
};

const fileFields = ["college_id_file_id", "rent_agreement_file_id", "profile_pic_file_id"];

export default function CustomerDetailsClient({ customer }: { customer: Customer }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string | null>(null);

  const entries = useMemo(
    () => Object.entries(customer),
    [customer]
  );

  function openPreview(field: string, id: string) {
    if (!id) return;
    setPreviewLabel(field.replace(/_/g, " "));
    setPreviewUrl(
      `https://auth-token-reg-60069906069.development.catalystserverless.in/server/get-image-load-route?file_id=${encodeURIComponent(id)}`
    );
  }

  function closePreview() {
    setPreviewUrl(null);
    setPreviewLabel(null);
  }

  return (
    <>
      <div style={{ display: "grid", gap: 14 }}>
        {entries.map(([key, value]) => {
          const isFileField = fileFields.includes(key);
          const displayValue = value === null || value === undefined ? "—" : String(value);

          return (
            <div
              key={key}
              style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: 12, background: "#0f1724", borderRadius: 10 }}
            >
              <div style={{ color: "#9ca3af", textTransform: "capitalize", minWidth: 160 }}>{key.replace(/_/g, " ")}</div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, alignItems: "center", textAlign: "right", fontFamily: "IBM Plex Mono, monospace", color: typeof value === "boolean" ? (value ? "#4ade80" : "#f87171") : "#e8eaf0" }}>
                {displayValue}
                {isFileField && displayValue !== "—" ? (
                  <button
                    type="button"
                    onClick={() => openPreview(key, displayValue)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      background: "rgba(74,222,128,0.08)",
                      color: "#e8eaf0",
                      cursor: "pointer",
                    }}
                  >
                    View file
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {previewUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
        >
          <div style={{ position: "relative", width: "100%", maxWidth: 900, maxHeight: "90vh", background: "#0f1724", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, background: "#111827" }}>
              <div style={{ color: "#e8eaf0", fontWeight: 600 }}>{previewLabel}</div>
              <button
                type="button"
                onClick={closePreview}
                style={{ border: "none", background: "transparent", color: "#9ca3af", cursor: "pointer", fontSize: 18 }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: 20, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 360 }}>
              <img
                src={previewUrl}
                alt={previewLabel || "preview"}
                style={{ maxWidth: "100%", maxHeight: "72vh", borderRadius: 12, objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
