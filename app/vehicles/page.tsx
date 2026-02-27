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
  const { data, error } = await supabase
    .from("vehicles")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return;

  setVehicles(data || []);
  setFilteredVehicles(data || []);
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
  <div className="px-6 py-6">
    <h1 className="text-2xl font-semibold mb-8">Vehicle Stock</h1>

    {/* Controls */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex gap-4">
        <input
          placeholder="Search by make..."
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="">All</option>
          <option value="In Stock">In Stock</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={exportToCSV}
          className="border border-gray-300 px-4 py-2 text-sm rounded-md hover:bg-gray-50"
        >
          Export
        </button>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingVehicle(null);
            setFormData(emptyForm);
          }}
          className="bg-black text-white px-4 py-2 text-sm rounded-md hover:bg-gray-900"
        >
          + Add Vehicle
        </button>
      </div>
    </div>
{showForm && (
  <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <div className="grid grid-cols-3 gap-4">
      {Object.keys(formData).map((field) => (
        <input
          key={field}
          type={field === "mot" ? "date" : "text"}
          placeholder={field.replaceAll("_", " ")}
          value={(formData as any)[field]}
          onChange={(e) =>
            setFormData({ ...formData, [field]: e.target.value })
          }
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />
      ))}
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={() => {
          setShowForm(false);
          setEditingVehicle(null);
          setFormData(emptyForm);
        }}
        className="border border-gray-300 px-4 py-2 text-sm rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 text-sm rounded-md hover:bg-gray-900"
      >
        {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
      </button>
    </div>
  </div>
)}
    {/* TABLE */}
    <div className="w-full overflow-x-auto border-t border-gray-200">
      <table className="min-w-[1200px] text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left">Make</th>
            <th className="px-4 py-3 text-left">Model</th>
            <th className="px-4 py-3 text-left">Reg</th>
            <th className="px-4 py-3 text-left">Mileage</th>
            <th className="px-4 py-3 text-left">Purchase</th>
            <th className="px-4 py-3 text-left">Repairs</th>
            <th className="px-4 py-3 text-left">Profit</th>
            <th className="px-4 py-3 text-left">CAP Clean</th>
            <th className="px-4 py-3 text-left">CAP Live</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">MOT</th>
            <th className="px-4 py-3 text-left">Days</th>
            <th className="px-4 py-3 text-left">CAP Check</th>
            <th className="px-4 py-3 text-left">Actions</th>
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

            return (
              <tr
                key={v.id}
                className="border-t border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">{v.make}</td>
                <td className="px-4 py-3">{v.model}</td>
                <td className="px-4 py-3">{v.reg}</td>
                <td className="px-4 py-3">{v.mileage}</td>
                <td className="px-4 py-3">£{v.purchase_price}</td>
                <td>£{v.repairs || 0}</td>

<td>
  {v.profit >= 0 ? (
    <span className="text-green-700 font-medium">
      £{v.profit}
    </span>
  ) : (
    <span className="text-red-600 font-medium">
      £{v.profit}
    </span>
  )}
</td>
                <td className="px-4 py-3">£{v.cap_clean_price}</td>
                <td className="px-4 py-3">£{v.cap_live_price}</td>
                <td className="px-4 py-3">{v.status}</td>

                {/* MOT */}
                <td className="px-4 py-3">
                  {v.mot ? (
                    new Date(v.mot) < new Date() ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md font-medium">
                        {formatDate(v.mot)}
                      </span>
                    ) : (
                      <span className="text-gray-700">
                        {formatDate(v.mot)}
                      </span>
                    )
                  ) : (
                    "-"
                  )}
                </td>

                {/* Days */}
                <td className="px-4 py-3 text-center">{days}</td>

                {/* CAP Check */}
                <td className="px-4 py-3">
                  {capWarning === "OK" ? (
                    <span className="text-gray-600">OK</span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md font-medium">
                      {capWarning}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEditingVehicle(v);
                      setFormData(v);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(v.id, v.status)}
                    className="text-gray-600 hover:underline text-sm"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-red-600 hover:underline text-sm"
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