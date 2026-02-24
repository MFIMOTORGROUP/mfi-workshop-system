"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [filterMake, setFilterMake] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const emptyForm = {
    make: "",
    model: "",
    reg: "",
    mileage: "",
    purchase_price: "",
    sale_price: "",
    repairs: "",
    cap_clean_price: "",
    cap_live_price: "",
    mot: "",
    transmission: "",
    grade: "",
    v5c_status: "",
    keys_count: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setVehicles(data);
      setFilteredVehicles(data);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    let temp = [...vehicles];

    if (filterMake) {
      temp = temp.filter((v) =>
        v.make?.toLowerCase().includes(filterMake.toLowerCase())
      );
    }

    if (filterStatus) {
      temp = temp.filter((v) => v.status === filterStatus);
    }

    setFilteredVehicles(temp);
  }, [filterMake, filterStatus, vehicles]);

  const handleSave = async () => {
    const purchase = Number(formData.purchase_price);
    const sale = Number(formData.sale_price);
    const repairs = Number(formData.repairs);
    const profit = sale - (purchase + repairs);

    const payload = {
      ...formData,
      purchase_price: purchase,
      sale_price: sale,
      repairs,
      profit,
    };

    if (editingVehicle) {
      await supabase
        .from("vehicles")
        .update(payload)
        .eq("id", editingVehicle.id);
    } else {
      await supabase
        .from("vehicles")
        .insert([{ ...payload, status: "In Stock" }]);
    }

    setFormData(emptyForm);
    setEditingVehicle(null);
    setShowForm(false);
    fetchVehicles();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Sold" ? "In Stock" : "Sold";

    await supabase
      .from("vehicles")
      .update({
        status: newStatus,
        sold_date:
          newStatus === "Sold"
            ? new Date().toISOString().split("T")[0]
            : null,
      })
      .eq("id", id);

    fetchVehicles();
  };
const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this vehicle?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete failed:", error);
  } else {
    fetchVehicles();
  }
};
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  const calculateDaysInStock = (createdAt: string) => {
    const created = new Date(createdAt);
    const today = new Date();
    return Math.floor(
      (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const exportToCSV = () => {
    const headers = [
      "Make",
      "Model",
      "Reg",
      "Mileage",
      "Purchase Price",
      "CAP Clean",
      "CAP Live",
      "Status",
      "MOT",
      "Transmission",
      "Grade",
      "V5C",
      "Keys",
      "Sold Date",
    ];

    const rows = filteredVehicles.map((v) => [
      v.make,
      v.model,
      v.reg,
      v.mileage,
      v.purchase_price,
      v.cap_clean_price,
      v.cap_live_price,
      v.status,
      v.mot,
      v.transmission,
      v.grade,
      v.v5c_status,
      v.keys_count,
      v.sold_date,
    ]);

    const csv =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((x) => `"${x ?? ""}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vehicle_stock.csv";
    link.click();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Vehicle Stock</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          placeholder="Filter by Make"
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="In Stock">In Stock</option>
          <option value="Sold">Sold</option>
        </select>

        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingVehicle(null);
            setFormData(emptyForm);
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Vehicle
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="grid grid-cols-3 gap-4 bg-white p-6 mb-6 rounded shadow">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              type={field === "mot" ? "date" : "text"}
              placeholder={field.replaceAll("_", " ")}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}

          <button
            onClick={handleSave}
            className="col-span-3 bg-blue-600 text-white py-2 rounded"
          >
            {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th>Make</th>
              <th>Model</th>
              <th>Reg</th>
              <th>Mileage</th>
              <th>Purchase</th>
              <th>CAP Clean</th>
              <th>CAP Live</th>
              <th>Status</th>
              <th>MOT</th>
              <th>Transmission</th>
              <th>Grade</th>
              <th>V5C</th>
              <th>Keys</th>
              <th>Sold Date</th>
              <th>Days</th>
              <th>CAP Check</th>
              <th>Edit</th>
              <th>Toggle</th>
            </tr>
          </thead>

<tbody>
  {filteredVehicles.map((v) => {
    const days = calculateDaysInStock(v.created_at);

    const capWarning =
      v.purchase_price > v.cap_clean_price
        ? "Over CAP Clean"
        : v.purchase_price > v.cap_live_price
        ? "Above CAP Live"
        : "OK";

    let motDisplay: React.ReactNode = "-";

    if (v.mot) {
      const today = new Date();
      const motDate = new Date(v.mot);
      const expired = motDate < today;

      motDisplay = (
        <span
          className={`px-2 py-1 text-xs text-white rounded ${
            expired ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {formatDate(v.mot)}
        </span>
      );
    }

    return (
      <tr key={v.id} className="border-t hover:bg-gray-50">
        <td>{v.make}</td>
        <td>{v.model}</td>
        <td>{v.reg}</td>
        <td>{v.mileage}</td>
        <td>£{v.purchase_price}</td>
        <td>£{v.cap_clean_price}</td>
        <td>£{v.cap_live_price}</td>
        <td>{v.status}</td>
        <td>{motDisplay}</td>
        <td>{v.transmission}</td>
        <td>{v.grade}</td>
        <td>{v.v5c_status}</td>
        <td>{v.keys_count}</td>
        <td>{v.sold_date ? formatDate(v.sold_date) : "-"}</td>

        {/* Days - CLEAN NUMBER ONLY */}
        <td className="text-center">
          {days}
        </td>

        {/* CAP Check - KEEP COLOUR */}
        <td>
          <span
            className={`px-2 py-1 rounded text-xs text-white ${
              capWarning === "OK"
                ? "bg-green-600"
                : capWarning === "Above CAP Live"
                ? "bg-yellow-500"
                : "bg-red-600"
            }`}
          >
            {capWarning}
          </span>
        </td>

        <td>
          <button
            onClick={() => {
              setEditingVehicle(v);
              setFormData(v);
              setShowForm(true);
            }}
            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
          >
            Edit
          </button>
        </td>

        <td>
          <button
            onClick={() => toggleStatus(v.id, v.status)}
            className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
          >
            Toggle
          </button>
        </td>

        <td>
          <button
            onClick={() => handleDelete(v.id)}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
      </div>
    </div>
  );
}