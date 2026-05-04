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

  const [color, setColor] = useState("");
const [vin, setVin] = useState("");
const [dateOfReg, setDateOfReg] = useState("");

  const [pxValue, setPxValue] = useState(0);
  const [settlement, setSettlement] = useState(0);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  

  // 🔥 Calculations
  const equity = pxValue - settlement; // THIS is correct way
  const finalPrice = salePrice - equity;
  const balance = finalPrice - deposit;

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data } = await supabase.from("vehicles").select("*");
      setVehicles(data || []);
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter((v) =>
    `${v.make || v.MAKE} ${v.model || v.MODEL} ${v.reg || v.REG}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSubmit = async () => {
    await supabase.from("sales_invoices").insert([
      {
        buyer_name: buyer,
        vehicle_id: selectedVehicle?.id,
        sale_price: salePrice,
        deposit,
        px_value: pxValue,
        settlement_amount: settlement,
        negative_equity: equity,
        final_price: finalPrice,
        balance,
        status: "pending",
      },
    ]);

    window.location.href = "/invoices";
  };

  return (
    <div style={{ padding: "30px", maxWidth: "700px" }}>
      <h2>Create Sales Invoice</h2>

      {/* CUSTOMER */}
      <h4>Customer</h4>
      <input
        placeholder="Buyer Name"
        onChange={(e) => setBuyer(e.target.value)}
      />

      <br /><br />

      {/* VEHICLE SEARCH */}
      <h4>Vehicle</h4>
      <input
        placeholder="Search by reg, make, model"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px" }}
      />

      <div style={{ border: "1px solid #ccc", maxHeight: "150px", overflow: "auto" }}>
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            onClick={() => {
  setSelectedVehicle(v);

  setColor(v.color || "");
  setVin(v.vin || "");
  setDateOfReg(v.date_of_reg || "");
}
                
            }
                style={{
              padding: "8px",
              cursor: "pointer",
              background:
                selectedVehicle?.id === v.id ? "#0070f3" : "white",
              color:
                selectedVehicle?.id === v.id ? "white" : "black",
            }}
          >
            {v.make || v.MAKE} {v.model || v.MODEL} – {v.reg || v.REG}
          </div>
        ))}
      </div>
<br />

{selectedVehicle && (
  <>
    <h3>Vehicle Details</h3>

    <input
      placeholder="Color"
      value={color}
      onChange={(e) => setColor(e.target.value)}
    />

    <br /><br />

    <input
      placeholder="VIN"
      value={vin}
      onChange={(e) => setVin(e.target.value)}
    />

    <br /><br />

    <input
      type="date"
      value={dateOfReg}
      onChange={(e) => setDateOfReg(e.target.value)}
    />

    <br /><br />
  </>
)}
      <br />

      {/* DEAL */}
      <h4>Deal</h4>

      <label>Sale Price</label><br />
      <input type="number" onChange={(e) => setSalePrice(Number(e.target.value))} />

      <br /><br />

      <label>Deposit</label><br />
      <input type="number" onChange={(e) => setDeposit(Number(e.target.value))} />

      <br /><br />

      {/* PX */}
      <h4>Part Exchange</h4>

      <label>PX Value</label><br />
      <input type="number" onChange={(e) => setPxValue(Number(e.target.value))} />

      <br /><br />

      <label>Settlement</label><br />
      <input type="number" onChange={(e) => setSettlement(Number(e.target.value))} />

      <br /><br />

      {/* SUMMARY */}
      <h3>Deal Summary</h3>

      <p>
        Equity:{" "}
        <b style={{ color: equity >= 0 ? "green" : "red" }}>
          £{equity}
        </b>{" "}
        {equity >= 0 ? "(Customer has extra)" : "(Customer owes)"}
      </p>

      <p>Final Price: £{finalPrice}</p>
      <p><b>Balance: £{balance}</b></p>

      <br />

      <button onClick={handleSubmit}>
        Save Invoice
      </button>
    </div>
  );
}