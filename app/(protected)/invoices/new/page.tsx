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
const [deliveryFee, setDeliveryFee] = useState(0);
const [warranty, setWarranty] = useState(0);
  const [color, setColor] = useState("");
const [vin, setVin] = useState("");
const [dateOfReg, setDateOfReg] = useState("");

  const [pxValue, setPxValue] = useState(0);
  const [settlement, setSettlement] = useState(0);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [isFinance, setIsFinance] = useState(false);
const [financeCompany, setFinanceCompany] = useState("");
const [term, setTerm] = useState(60);
const [interest, setInterest] = useState(10);

  // 🔥 Calculations
  const equity = pxValue - settlement;

const finalPrice = salePrice - equity + deliveryFee + warranty;

const balance = finalPrice - deposit;

const loanAmount = finalPrice - deposit;

const monthlyPayment =
  isFinance && loanAmount > 0
    ? ((loanAmount * (1 + interest / 100)) / term).toFixed(2)
    : 0;

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
const { data, error } = await supabase
    .from("sales_invoices")
    .insert([
      {
    buyer_name: buyer,
        vehicle_id: selectedVehicle?.id,
        sale_price: salePrice,
        deposit,
        balance,

        px_value: pxValue,
        settlement_amount: settlement,
        negative_equity: equity,
        final_price: finalPrice,

        finance: isFinance,
        finance_company: financeCompany,
        term,
        interest_rate: interest,
        monthly_payment: Number(monthlyPayment),

        // 🔥 snapshots
        color_snapshot: color,
        vin_snapshot: vin,
        date_of_reg_snapshot: dateOfReg,

        // 🔥 extras
        delivery_fee: deliveryFee,
        warranty,

        status: "pending",
      },
    ])
    .select();

  if (error) {
    alert("Error saving invoice");
    console.error(error);
      alert(error.message); // 👈 THIS is key
    return;
  }

  // 👉 redirect to invoice page
  window.location.href = `/invoices/${data[0].id}`;
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
  maxWidth: "300px",
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

const label = {
  fontSize: "13px",
  fontWeight: "bold",
  marginTop: "10px",
  display: "block"
};
const formRow = {
  display: "grid",
  gridTemplateColumns: "200px 300px",
  alignItems: "center",
  marginBottom: "12px"
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

  <div style={formRow}>
    <label style={label}>Sale Price (£)</label>
    <input
      type="number"
      value={salePrice}
      onChange={(e) => setSalePrice(Number(e.target.value) || 0)}
      style={input}
    />
  </div>

  <div style={formRow}>
    <label style={label}>Deposit (£)</label>
    <input
      type="number"
      value={deposit}
      onChange={(e) => setDeposit(Number(e.target.value) || 0)}
      style={input}
    />
  </div>

  <div style={formRow}>
    <label style={label}>Part Exchange (£)</label>
    <input
      type="number"
      value={pxValue}
      onChange={(e) => setPxValue(Number(e.target.value) || 0)}
      style={input}
    />
  </div>

  <div style={formRow}>
    <label style={label}>Settlement (£)</label>
    <input
      type="number"
      value={settlement}
      onChange={(e) => setSettlement(Number(e.target.value) || 0)}
      style={input}
    />
  </div>
  <hr style={{ margin: "15px 0", opacity: 0.2 }} />

  <div
    style={{
      background: "#f8f9fa",
      padding: "15px",
      borderRadius: "8px"
    }}
  >
    <p>
      Equity:{" "}
      <b style={{ color: equity >= 0 ? "green" : "red" }}>
        £{equity}
      </b>
    </p>

    <p>Final Price: <b>£{finalPrice}</b></p>

    <p><strong>Balance: £{balance}</strong></p>
  </div>

  <div style={formRow}>
  <label style={label}>Delivery Fee (£)</label>
  <input
    type="number"
    value={deliveryFee}
    onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
    style={input}
  />
</div>

<div style={formRow}>
  <label style={label}>Warranty (£)</label>
  <input
    type="number"
    value={warranty}
    onChange={(e) => setWarranty(Number(e.target.value) || 0)}
    style={input}
  />
</div>

      {/* FINANCE */}
<div style={card}>
  <h3>Finance</h3>

  <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
    <input
      type="checkbox"
      checked={isFinance}
      onChange={() => setIsFinance(!isFinance)}
    />
    Finance Deal
  </label>

  {isFinance && (
    <>
      <div style={grid}>
        <div>
          <label>Finance Company</label>
          <input
            placeholder="e.g. Close Brothers"
            onChange={(e) => setFinanceCompany(e.target.value)}
            style={input}
          />
        </div>

        <div>
          <label>Term (Months)</label>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            style={input}
          />
        </div>

        <div>
          <label>Interest Rate (%)</label>
          <input
            type="number"
            value={interest}
            onChange={(e) => setInterest(Number(e.target.value))}
            style={input}
          />
        </div>
      </div>

      <div style={{ marginTop: "15px" }}>
        <p>Loan Amount: £{loanAmount}</p>
        <p>
          <strong>Monthly Payment: £{monthlyPayment}</strong>
        </p>
      </div>
    </>
  )}
</div>  
    </div>

    {/* BUTTON */}
    <button onClick={handleSubmit} style={button}>
      Save Invoice
    </button>
  </div>

  );
}