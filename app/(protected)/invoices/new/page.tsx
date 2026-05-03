"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NewInvoice() {
  const [buyer, setBuyer] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [deposit, setDeposit] = useState(0);

  const [pxValue, setPxValue] = useState(0);
  const [settlement, setSettlement] = useState(0);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // 🔥 Calculations
  const negativeEquity = settlement - pxValue;
  const adjustedPrice = salePrice + negativeEquity;
  const balance = adjustedPrice - deposit;

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from("vehicles").select("*");
      setVehicles(data || []);
    };
    fetchVehicles();
  }, []);

  const handleSubmit = async () => {
    await supabase.from("sales_invoices").insert([
      {
        buyer_name: buyer,
        vehicle_id: selectedVehicle,
        sale_price: salePrice,
        deposit,
        px_value: pxValue,
        settlement_amount: settlement,
        negative_equity: negativeEquity,
        final_price: adjustedPrice,
        balance,
        status: "pending",
      },
    ]);

    window.location.href = "/invoices";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Sale Invoice</h1>

      {/* Buyer */}
      <input placeholder="Buyer Name" onChange={(e) => setBuyer(e.target.value)} />
      <br /><br />

      {/* Vehicle */}
      <select
        onChange={(e) => setSelectedVehicle(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      >
        <option value="">Select Vehicle</option>
        {vehicles.map((v) => (
          <option key={v.id} value={v.id}>
            {v.make || v.MAKE} {v.model || v.MODEL} – {v.reg || v.REG}
          </option>
        ))}
      </select>

      <br /><br />

      {/* Sale Price */}
      <input
        type="number"
        placeholder="Sale Price"
        onChange={(e) => setSalePrice(Number(e.target.value))}
      />
      <br /><br />

      {/* PX */}
      <input
        type="number"
        placeholder="PX Value"
        onChange={(e) => setPxValue(Number(e.target.value))}
      />
      <br /><br />

      {/* Settlement */}
      <input
        type="number"
        placeholder="Settlement"
        onChange={(e) => setSettlement(Number(e.target.value))}
      />
      <br /><br />

      {/* Deposit */}
      <input
        type="number"
        placeholder="Deposit"
        onChange={(e) => setDeposit(Number(e.target.value))}
      />
      <br /><br />

      {/* Results */}
      <p>Negative Equity: £{negativeEquity}</p>
      <p>Adjusted Price: £{adjustedPrice}</p>
      <p><b>Balance: £{balance}</b></p>

      <button onClick={handleSubmit}>
        Save Invoice
      </button>
    </div>
  );
}