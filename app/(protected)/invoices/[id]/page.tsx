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
    <div style={{ borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "20px" }}>
      <h1>MFI Motor Group</h1>
      <p>Sales Invoice</p>
    </div>

    {/* CUSTOMER */}
    <div style={{ marginBottom: "20px" }}>
      <h3>Customer</h3>
      <p><b>Name:</b> {invoice.buyer_name}</p>
      <p><b>Date:</b> {new Date(invoice.created_at).toLocaleDateString()}</p>
    </div>

    {/* VEHICLE */}
    <div style={{ marginBottom: "20px" }}>
      <h3>Vehicle</h3>
      <p><b>Make:</b> {invoice.vehicles?.make}</p>
      <p><b>Model:</b> {invoice.vehicles?.model}</p>
      <p><b>Reg:</b> {invoice.vehicles?.reg}</p>

      <p><b>Color:</b> {invoice.color_snapshot}</p>
      <p><b>VIN:</b> {invoice.vin_snapshot}</p>
      <p><b>Date of Reg:</b> {invoice.date_of_reg_snapshot}</p>
    </div>

    {/* DEAL */}
    <div style={{ marginBottom: "20px" }}>
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
            <td>Part Exchange</td>
            <td>£{invoice.px_value}</td>
          </tr>
          <tr>
            <td>Settlement</td>
            <td>£{invoice.settlement_amount}</td>
          </tr>
          <tr>
            <td>Delivery Fee</td>
            <td>£{invoice.delivery_fee}</td>
          </tr>
          <tr>
            <td>Warranty</td>
            <td>£{invoice.warranty}</td>
          </tr>
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
    <div style={{ borderTop: "2px solid #000", paddingTop: "20px" }}>
      <h2>Summary</h2>

      <p>
        <b>Equity:</b>{" "}
        <span style={{ color: invoice.negative_equity >= 0 ? "green" : "red" }}>
          £{invoice.negative_equity}
        </span>
      </p>

      <p><b>Final Price:</b> £{invoice.final_price}</p>
      <h2>Balance: £{invoice.balance}</h2>
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