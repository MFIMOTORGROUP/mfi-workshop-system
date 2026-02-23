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
    <div className="min-h-screen bg-gray-100 p-10 max-w-[1600px] mx-auto">
      <h1 className="text-4xl font-bold mb-10 tracking-tight">
        Vehicle Stock
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <input
          placeholder="Filter by Make"
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="border bg-white px-4 py-2 rounded-lg shadow-sm"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border bg-white px-4 py-2 rounded-lg shadow-sm"
        >
          <option value="">All</option>
          <option value="In Stock">In Stock</option>
          <option value="Sold">Sold</option>
        </select>

        <button
          onClick={exportToCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          Export Excel
        </button>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingVehicle(null);
            setFormData(emptyForm);
          }}
          className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-lg shadow-md transition"
        >
          + Add Vehicle
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-8 mb-8 rounded-2xl shadow-lg">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              type={field === "mot" ? "date" : "text"}
              placeholder={field.replaceAll("_", " ")}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border px-4 py-2 rounded-lg"
            />
          ))}

          <button
            onClick={handleSave}
            className="col-span-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md transition"
          >
            {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              {[
                "Make","Model","Reg","Mileage","Purchase","CAP Clean","CAP Live",
                "Status","MOT","Transmission","Grade","V5C","Keys",
                "Sold Date","Days","CAP Check","Edit","Toggle"
              ].map((h) => (
                <th key={h} className="px-6 py-4 text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
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
                <tr key={v.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold">{v.make}</td>
                  <td className="px-6 py-4">{v.model}</td>
                  <td className="px-6 py-4 font-bold">{v.reg}</td>
                  <td className="px-6 py-4">{v.mileage}</td>
                  <td className="px-6 py-4">£{v.purchase_price}</td>
                  <td className="px-6 py-4">£{v.cap_clean_price}</td>
                  <td className="px-6 py-4">£{v.cap_live_price}</td>
                  <td className="px-6 py-4">{v.status}</td>
                  <td className="px-6 py-4">{motDisplay}</td>
                  <td className="px-6 py-4">{v.transmission}</td>
                  <td className="px-6 py-4">{v.grade}</td>
                  <td className="px-6 py-4">{v.v5c_status}</td>
                  <td className="px-6 py-4">{v.keys_count}</td>
                  <td className="px-6 py-4">
                    {v.sold_date ? formatDate(v.sold_date) : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs text-white ${
                        days <= 30
                          ? "bg-green-600"
                          : days <= 60
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {days} days
                    </span>
                  </td>

                  <td className="px-6 py-4">
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

                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setEditingVehicle(v);
                        setFormData(v);
                        setShowForm(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-xs"
                    >
                      Edit
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatus(v.id, v.status)}
                      className="bg-gray-800 hover:bg-black text-white px-3 py-1 rounded-md text-xs"
                    >
                      Toggle
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