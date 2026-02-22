"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filterMake, setFilterMake] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    reg: "",
    purchase_price: "",
    sale_price: "",
    repairs: "",
    mot: "",
    transmission: "",
    keys_count: "",
    grade: "",
  });

  const fetchVehicles = async () => {
    let query = supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterMake) query = query.ilike("make", `%${filterMake}%`);
    if (filterStatus) query = query.eq("status", filterStatus);

    const { data } = await query;
    if (data) setVehicles(data);
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterMake, filterStatus]);

  const handleSave = async () => {
    const purchase = Number(formData.purchase_price);
    const sale = Number(formData.sale_price);
    const repairs = Number(formData.repairs);
    const profit = sale - (purchase + repairs);

    const payload = {
      ...formData,
      purchase_price: purchase,
      sale_price: sale,
      repairs: repairs,
      profit,
    };

    if (editingVehicle) {
      await supabase.from("vehicles").update(payload).eq("id", editingVehicle.id);
    } else {
      await supabase.from("vehicles").insert([{ ...payload, status: "In Stock" }]);
    }

    setFormData({
      make: "",
      model: "",
      reg: "",
      purchase_price: "",
      sale_price: "",
      repairs: "",
      mot: "",
      transmission: "",
      keys_count: "",
      grade: "",
    });

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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  const exportToCSV = () => {
    if (!vehicles.length) return;
    const headers = Object.keys_count(vehicles[0]).join(",");
    const rows = vehicles.map((v) =>
      Object.values(v)
        .map((val) => `"${val ?? ""}"`)
        .join(",")
    );

    const blob = new Blob([[headers, ...rows].join("\n")], {
      type: "text/csv",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vehicle_stock.csv";
    link.click();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vehicle Stock</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
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
          <option value="">All Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Sold">Sold</option>
        </select>

        <button
          onClick={() => {
            setFilterMake("");
            setFilterStatus("");
          }}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Clear
        </button>

        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Excel
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="grid grid-cols-2 gap-4 bg-white p-6 mb-6 rounded shadow">
          {Object.keys_count(formData).map((field) => (
            <input
              keys_count={field}
              type={field === "mot" ? "date" : "text"}
              placeholder={field.replace("_", " ")}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}

          <button
            onClick={handleSave}
            className="col-span-2 bg-blue-600 text-white py-2 rounded"
          >
            Save
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Make</th>
              <th className="p-3">Model</th>
              <th className="p-3">Reg</th>
              <th className="p-3">MOT</th>
              <th className="p-3">Profit</th>
              <th className="p-3">Status</th>
              <th className="p-3">Sold Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => {
              let motDisplay = "-";

              if (v.mot) {
                const today = new Date();
                const motDate = new Date(v.mot);
                const diffDays = Math.ceil(
                  (motDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const expired = diffDays < 0;

                motDisplay = (
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      expired ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {formatDate(v.mot)}{" "}
                    {expired
                      ? "(Expired)"
                      : `(${diffDays} days left)`}
                  </span>
                );
              }

              return (
                <tr keys_count={v.id} className="border-t">
                  <td className="p-3">{v.make}</td>
                  <td className="p-3">{v.model}</td>
                  <td className="p-3">{v.reg}</td>
                  <td className="p-3">{motDisplay}</td>
                  <td className="p-3 font-bold text-green-600">
                    £{v.profit}
                  </td>
                  <td className="p-3">{v.status}</td>
                  <td className="p-3">
                    {v.sold_date ? formatDate(v.sold_date) : "-"}
                  </td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => toggleStatus(v.id, v.status)}
                      className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
                    >
                      Toggle
                    </button>

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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}