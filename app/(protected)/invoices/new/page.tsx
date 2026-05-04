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
    if (!buyer || !selectedVehicle) {
  alert("Please select customer and vehicle");
  return;
}
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

    color_snapshot: color,
    vin_snapshot: vin,
    date_of_reg_snapshot: dateOfReg,

    status: "pending",
  },
]);

    window.location.href = "/invoices";
  };
const card = {
  background: "#fff",
  padding: "20px",
  marginBottom: "20px",
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const input = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px"
};

const dropdown = {
  border: "1px solid #ccc",
  maxHeight: "150px",
  overflow: "auto",
  marginTop: "10px"
};

const dropdownItem = {
  padding: "10px",
  cursor: "pointer",
  borderBottom: "1px solid #eee"
};

const button = {
  background: "#0070f3",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};
 return (
  <div style={{ padding: "40px", maxWidth: "900px", margin: "auto" }}>
    <h1 style={{ marginBottom: "30px" }}>Create Sales Invoice</h1>

    {/* CUSTOMER */}
    <div style={card}>
      <h3>Customer</h3>
      <input
        placeholder="Buyer Name"
        onChange={(e) => setBuyer(e.target.value)}
        style={input}
      />
    </div>

    {/* VEHICLE */}
    <div style={card}>
      <h3>Vehicle</h3>

      <input
        placeholder="Search by reg, make, model"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={input}
      />

      <div style={dropdown}>
        {filteredVehicles.map((v) => (
          <div
            key={v.id}
            onClick={() => {
              setSelectedVehicle(v);
              setColor(v.color || "");
              setVin(v.vin || "");
              setDateOfReg(v.date_of_reg || "");
            }}
            style={{
  ...dropdownItem,
  background: selectedVehicle?.id === v.id ? "#0070f3" : "white",
  color: selectedVehicle?.id === v.id ? "white" : "black"
}}
          >
            {v.make || v.MAKE} {v.model || v.MODEL} – {v.reg || v.REG}
          </div>
        ))}
      </div>

      {selectedVehicle && (
        <div style={{ marginTop: "20px" }}>
          <h4>Vehicle Details</h4>

          <div style={grid}>
            <input
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={input}
            />

            <input
              placeholder="VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              style={input}
            />

            <input
              type="date"
              value={dateOfReg}
              onChange={(e) => setDateOfReg(e.target.value)}
              style={input}
            />
          </div>
        </div>
      )}
    </div>

    {/* DEAL */}
    <div style={card}>
      <h3>Deal</h3>

      <div style={grid}>
        <input
          type="number"
          placeholder="Sale Price"
          onChange={(e) => setSalePrice(Number(e.target.value))}
          style={input}
        />

        <input
          type="number"
          placeholder="Deposit"
          onChange={(e) => setDeposit(Number(e.target.value))}
          style={input}
        />

        <input
          type="number"
          placeholder="PX Value"
          onChange={(e) => setPxValue(Number(e.target.value))}
          style={input}
        />

        <input
          type="number"
          placeholder="Settlement"
          onChange={(e) => setSettlement(Number(e.target.value))}
          style={input}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <p>
  Equity:{" "}
  <strong style={{ color: equity >= 0 ? "green" : "red" }}>
    £{equity}
  </strong>
</p>

<p>Final Price: £{finalPrice}</p>
        <p><strong>Balance: £{balance}</strong></p>
      </div>
    </div>

    {/* BUTTON */}
    <button onClick={handleSubmit} style={button}>
      Save Invoice
    </button>
  </div>

  );
}