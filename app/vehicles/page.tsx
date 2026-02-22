"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filterMake, setFilterMake] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

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

  const exportToCSV = () => {
    if (!vehicles.length) return;

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

    const rows = vehicles.map((v) => [
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

    const csvContent =
      headers.join(",") +
      "\n" +
      rows.map((r) => r.map((val) => `"${val ?? ""}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });

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
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Make</th>
              <th className="p-3">Model</th>
              <th className="p-3">Reg</th>
              <th className="p-3">Mileage</th>
              <th className="p-3">Purchase</th>
              <th className="p-3">CAP Clean</th>
              <th className="p-3">CAP Live</th>
              <th className="p-3">Status</th>
              <th className="p-3">MOT</th>
              <th className="p-3">Transmission</th>
              <th className="p-3">Grade</th>
              <th className="p-3">V5C</th>
              <th className="p-3">Keys</th>
              <th className="p-3">Sold Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => {
              let motDisplay: React.ReactNode = "-";

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
                    {formatDate(v.mot)}
                  </span>
                );
              }

              return (
                <tr key={v.id} className="border-t">
                  <td className="p-3">{v.make}</td>
                  <td className="p-3">{v.model}</td>
                  <td className="p-3">{v.reg}</td>
                  <td className="p-3">{v.mileage}</td>
                  <td className="p-3">£{v.purchase_price}</td>
                  <td className="p-3">£{v.cap_clean_price}</td>
                  <td className="p-3">£{v.cap_live_price}</td>
                  <td className="p-3">{v.status}</td>
                  <td className="p-3">{motDisplay}</td>
                  <td className="p-3">{v.transmission}</td>
                  <td className="p-3">{v.grade}</td>
                  <td className="p-3">{v.v5c_status}</td>
                  <td className="p-3">{v.keys_count}</td>
                  <td className="p-3">
                    {v.sold_date ? formatDate(v.sold_date) : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleStatus(v.id, v.status)}
                      className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
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