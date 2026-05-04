"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
   const { data } = await supabase
  .from("sales_invoices")
  .select(`
    *,
    vehicles (
      make,
      model,
      reg
    )
  `)
  .eq("id", id)
  .single();

      setInvoice(data);
    };

    fetchInvoice();
  }, [id]);

  if (!invoice) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto", background: "#fff" }}>
      
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>MFI Motor Group</h2>
        <div>
          <p><b>Invoice</b></p>
          <p>ID: {invoice.id}</p>
          <p>Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <hr />

      {/* CUSTOMER */}
      <h3>Customer</h3>
      <p>{invoice.buyer_name}</p>

      {/* VEHICLE */}
     
<h3>Vehicle</h3>

<p><b>Make:</b> {invoice.vehicles?.make}</p>
<p><b>Model:</b> {invoice.vehicles?.model}</p>
<p><b>Reg:</b> {invoice.vehicles?.reg}</p>
      {/* DEAL */}
      <h3>Deal Breakdown</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td>Sale Price</td>
            <td>£{invoice.sale_price}</td>
          </tr>
          <tr>
            <td>Deposit</td>
            <td>£{invoice.deposit}</td>
          </tr>
          <tr>
            <td>PX Value</td>
            <td>£{invoice.px_value}</td>
          </tr>
          <tr>
            <td>Settlement</td>
            <td>£{invoice.settlement_amount}</td>
          </tr>
        </tbody>
      </table>

      <hr />

      {/* TOTAL */}
      <h2>Total Balance: £{invoice.balance}</h2>

      <br />

      {/* PRINT BUTTON */}
      <button onClick={() => window.print()}>
        Print / Save PDF
      </button>
    </div>
  );
}