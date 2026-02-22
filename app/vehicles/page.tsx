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
    await supabase.from("vehicles").update({ status: newStatus }).eq("id", id);
    fetchVehicles();
  };

  const exportToCSV = () => {
    if (vehicles.length === 0) return;

    const headers = Object.keys(vehicles[0]).join(",");
    const rows = vehicles.map((v) =>
      Object.values(v)
        .map((value) => `"${value ?? ""}"`)
        .join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "vehicle_stock.csv";
    link.click();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vehicle Stock</h1>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-4">
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

      {/* VEHICLE LIST */}
      <div className="bg-white rounded-xl shadow p-6">
        {vehicles.length === 0 ? (
          <p>No vehicles found.</p>
        ) : (
          <ul className="space-y-4">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">
                      {vehicle.make} {vehicle.model} ({vehicle.reg})
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      Transmission: {vehicle.transmission}
                    </div>

                    <div className="text-sm text-gray-600">
                      V5C: {vehicle.v5c_status}
                    </div>

                    <div className="text-sm text-gray-600">
                      Keys: {vehicle.key} | Grade: {vehicle.grade}
                    </div>

                    <div className="text-sm text-gray-600">
                      CAP Clean: £{vehicle.cap_clean_price} | CAP Live: £{vehicle.cap_live_price}
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      Purchase: £{vehicle.purchase_price} | Repairs: £{vehicle.repairs} | Sale: £{vehicle.sale_price}
                    </div>

                    <div
                      className={`mt-2 font-bold ${
                        vehicle.profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      Profit: £{vehicle.profit}
                    </div>

                    <div className="mt-1 text-sm">
                      Status: {vehicle.status}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      toggleStatus(vehicle.id, vehicle.status)
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                  >
                    {vehicle.status === "Sold"
                      ? "Mark In Stock"
                      : "Mark Sold"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}