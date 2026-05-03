"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewInvoice() {
  const [buyer, setBuyer] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [deposit, setDeposit] = useState(0);

  const balance = salePrice - deposit;

  const handleSubmit = async () => {
    await supabase.from("sales_invoices").insert([
      {
        buyer_name: buyer,
        sale_price: salePrice,
        deposit: deposit,
        balance: balance,
        status: "pending",
      },
    ]);

    alert("Invoice Created!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Sale Invoice</h1>

      <input
        placeholder="Buyer Name"
        onChange={(e) => setBuyer(e.target.value)}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Sale Price"
        onChange={(e) => setSalePrice(Number(e.target.value))}
      />
      <br /><br />

      <input
        type="number"
        placeholder="Deposit"
        onChange={(e) => setDeposit(Number(e.target.value))}
      />
      <br /><br />

      <p><b>Balance:</b> £{balance}</p>

      <button onClick={handleSubmit}>
        Save Invoice
      </button>
    </div>
  );
}