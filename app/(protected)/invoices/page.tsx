"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicesPage() {
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
    <div style={{ padding: "30px" }}>
      <h2>Sales Invoices</h2>

      <a href="/invoices/new">
        <button style={{ marginBottom: "20px" }}>
          + Create Sale Invoice
        </button>
      </a>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th>Buyer</th>
            <th>Vehicle</th>
            <th>Type</th>
            <th>Price</th>
            <th>Balance</th>
            <th>Monthly</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{inv.buyer_name}</td>

              <td>{inv.vehicle_id?.slice(0, 6)}</td>

              <td>
                {inv.finance ? (
                  <span style={{ color: "#0070f3" }}>Finance</span>
                ) : (
                  <span style={{ color: "green" }}>Cash</span>
                )}
              </td>

              <td>£{inv.sale_price}</td>

              <td>
                <strong>£{inv.balance}</strong>
              </td>

              <td>
                {inv.finance ? `£${inv.monthly_payment}` : "-"}
              </td>

              <td>{inv.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}