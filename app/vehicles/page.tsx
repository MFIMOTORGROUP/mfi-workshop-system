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

    if (filterMake) {
      query = query.ilike("make", `%${filterMake}%`);
    }

    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }

    const { data } = await query;
    if (data) setVehicles(data);
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterMake, filterStatus]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Sold" ? "In Stock" : "Sold";

    await supabase
      .from("vehicles")
      .update({
        status: newStatus,
        sold_date: newStatus === "Sold" ? new Date().toISOString().split("T")[0] : null,
      })
      .eq("id", id);

    fetchVehicles();
  };

  const exportToCSV = () => {
    if (!vehicles.length) return;

    const headers = Object.keys(vehicles[0]).join(",");
    const rows = vehicles.map((v) =>
      Object.values(v)
        .map((val) => `"${val ?? ""}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vehicle_stock.csv";
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB");
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
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Make</th>
              <th className="p-3 text-left">Model</th>
              <th className="p-3 text-left">Reg</th>
              <th className="p-3 text-left">MOT</th>
              <th className="p-3 text-left">Purchase</th>
              <th className="p-3 text-left">Sale</th>
              <th className="p-3 text-left">Profit</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Sold Date</th>
              <th className="p-3 text-left">Transmission</th>
              <th className="p-3 text-left">Keys</th>
              <th className="p-3 text-left">Grade</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => {
              let motContent = "-";

              if (vehicle.mot) {
                const today = new Date();
                const motDate = new Date(vehicle.mot);
                const diffTime = motDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isExpired = diffDays < 0;

                motContent = (
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      isExpired ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {formatDate(vehicle.mot)}{" "}
                    {isExpired
                      ? "(Expired)"
                      : `(${diffDays} days left)`}
                  </span>
                );
              }

              return (
                <tr key={vehicle.id} className="border-t">
                  <td className="p-3">{vehicle.make}</td>
                  <td className="p-3">{vehicle.model}</td>
                  <td className="p-3">{vehicle.reg}</td>
                  <td className="p-3">{motContent}</td>
                  <td className="p-3">£{vehicle.purchase_price}</td>
                  <td className="p-3">£{vehicle.sale_price}</td>

                  <td
                    className={`p-3 font-bold ${
                      vehicle.profit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    £{vehicle.profit}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs ${
                        vehicle.status === "Sold"
                          ? "bg-blue-600"
                          : "bg-green-600"
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </td>

                  <td className="p-3">
                    {vehicle.sold_date
                      ? formatDate(vehicle.sold_date)
                      : "-"}
                  </td>

                  <td className="p-3">{vehicle.transmission}</td>
                  <td className="p-3">{vehicle.key}</td>
                  <td className="p-3">{vehicle.grade}</td>

                  <td className="p-3">
                    <button
                      onClick={() =>
                        toggleStatus(vehicle.id, vehicle.status)
                      }
                      className="bg-gray-800 text-white px-3 py-1 rounded text-xs"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {vehicles.length === 0 && (
          <div className="p-6 text-gray-500">No vehicles found.</div>
        )}
      </div>
    </div>
  );
}