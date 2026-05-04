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
  const [vehicle, setVehicle] = useState<any>(null);
useEffect(() => {
  const fetchInvoice = async () => {
    // 1. get invoice
    const { data: invoiceData } = await supabase
      .from("sales_invoices")
      .select("*")
      .eq("id", id)
      .single();

    setInvoice(invoiceData);

    // 2. get vehicle using vehicle_id
    if (invoiceData?.vehicle_id) {
      const { data: vehicleData } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", invoiceData.vehicle_id)
        .single();

      setVehicle(vehicleData);
    }
  };

  fetchInvoice();
}, [id]);
  if (!invoice) return <p>Loading...</p>;

 return (
  <div style={{ padding: "40px", maxWidth: "800px", margin: "auto", background: "#fff" }}>
    
   {/* HEADER */}
<div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
  <div>
    <h2>MFI MOTOR COMPANY LTD</h2>
    <p>Motor Group</p>
  </div>

  <div style={{ textAlign: "right" }}>
    <h2>Invoice</h2>
    <p><b>ID:</b> {invoice.id.slice(0, 6)}</p>
    <p><b>Date:</b> {new Date(invoice.created_at).toLocaleDateString()}</p>
  </div>
</div>

<hr />

{/* CUSTOMER */}
<div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
  
  <div style={{ width: "48%" }}>
    <h4>Invoice To</h4>
    <p>{invoice.buyer_name}</p>
    <p>{invoice.customer_phone || "-"}</p>
    <p>{invoice.customer_email || "-"}</p>
    <p>{invoice.customer_address || "-"}</p>
  </div>

  <div style={{ width: "48%" }}>
    <h4>Delivery To</h4>
    <p>{invoice.buyer_name}</p>
    <p>{invoice.customer_address || "-"}</p>
  </div>

</div>

    {/* VEHICLE */}
    <div style={{ marginBottom: "20px" }}>
      <h3>Vehicle</h3>
   <p><b>Make:</b> {vehicle?.make || "-"}</p>
<p><b>Model:</b> {vehicle?.model || "-"}</p>
<p><b>Reg:</b> {vehicle?.reg || "-"}</p>

      <p><b>Color:</b> {invoice.color_snapshot}</p>
      <p><b>VIN:</b> {invoice.vin_snapshot}</p>
      <p><b>Date of Reg:</b> {invoice.date_of_reg_snapshot}</p>
    </div>

    {/* DEAL */}
    <div style={{ marginBottom: "20px" }}>
      <h3>Deal Breakdown</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
  <tbody>
    {[
      ["Sale Price", invoice.sale_price],
      ["Deposit", invoice.deposit],
      ["Part Exchange", invoice.px_value],
      ["Settlement", invoice.settlement_amount],
      ["Delivery Fee", invoice.delivery_fee],
      ["Warranty", invoice.warranty],
    ].map(([label, value]) => (
      <tr key={label}>
        <td style={{ padding: "8px", borderBottom: "1px solid #ddd" }}>{label}</td>
        <td style={{ padding: "8px", borderBottom: "1px solid #ddd", textAlign: "right" }}>
          £{value || 0}
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>

    {/* FINANCE */}
    {invoice.finance && (
      <div style={{ marginBottom: "20px" }}>
        <h3>Finance</h3>
        <p><b>Company:</b> {invoice.finance_company}</p>
        <p><b>Term:</b> {invoice.term} months</p>
        <p><b>Interest:</b> {invoice.interest_rate}%</p>
        <p><b>Monthly Payment:</b> £{invoice.monthly_payment}</p>
      </div>
    )}

    {/* TOTAL */}
  <div style={{
  marginTop: "20px",
  padding: "15px",
  background: "#f5f5f5",
  borderRadius: "8px"
}}>
  <p>
    <b>Equity:</b>{" "}
    <span style={{ color: invoice.negative_equity >= 0 ? "green" : "red" }}>
      £{invoice.negative_equity}
    </span>
  </p>

  <p><b>Final Price:</b> £{invoice.final_price}</p>

  <h2 style={{ marginTop: "10px" }}>
    Balance: £{invoice.balance}
  </h2>
</div>

    {/* PRINT BUTTON */}
    <button
      onClick={() => window.print()}
      style={{
        marginTop: "30px",
        padding: "10px 20px",
        background: "#0070f3",
        color: "#fff",
        border: "none",
        cursor: "pointer"
      }}
    >
      Print / Save PDF
    </button>

  </div>

 );
}