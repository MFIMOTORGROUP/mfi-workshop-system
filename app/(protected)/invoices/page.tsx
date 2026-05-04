"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicesPage() {
  const th = {
  padding: "12px",
  fontSize: "13px",
  fontWeight: "bold",
};

const td = {
  padding: "12px",
};
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data } = await supabase
        .from("sales_invoices")
        .select("*")
        .order("created_at", { ascending: false });

      setInvoices(data || []);
    };

    fetchInvoices();
  
  }, []);

  return (
  <div style={{ padding: "40px", maxWidth: "1100px", margin: "auto" }}>
    
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h1>Sales Invoices</h1>

      <button
        onClick={() => window.location.href = "/invoices/new"}
        style={{
          background: "#0070f3",
          color: "#fff",
          padding: "10px 15px",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        + Create Invoice
      </button>
    </div>

    <div style={{
      marginTop: "20px",
      background: "#fff",
      borderRadius: "10px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      overflow: "hidden"
    }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ background: "#f5f5f5", textAlign: "left" }}>
          <tr>
            <th style={th}>Customer</th>
            <th style={th}>Vehicle</th>
            <th style={th}>Type</th>
            <th style={th}>Price</th>
            <th style={th}>Balance</th>
            <th style={th}>Monthly</th>
            <th style={th}>Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              onClick={() => window.location.href = `/invoices/${inv.id}`}
              style={{ cursor: "pointer", borderTop: "1px solid #eee" }}
            >
              <td style={td}>{inv.buyer_name}</td>

              <td style={td}>
                {inv.vehicles?.make} {inv.vehicles?.model}
              </td>

              <td style={td}>
                {inv.finance ? "Finance" : "Cash"}
              </td>

              <td style={td}>£{inv.sale_price}</td>

              <td style={td}>£{inv.balance}</td>

              <td style={td}>
                {inv.monthly_payment ? `£${inv.monthly_payment}` : "-"}
              </td>

              <td style={td}>
                <span style={{
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  background:
                    inv.status === "pending" ? "#fff3cd" : "#d4edda",
                  color:
                    inv.status === "pending" ? "#856404" : "#155724"
                }}>
                  {inv.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}