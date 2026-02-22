"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filterMake, setFilterMake] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState<any>({
    make: "",
    model: "",
    reg: "",
    transmission: "",
    v5c_status: "",
    purchase_price: "",
    sale_price: "",
    repairs: "",
    cap_clean_price: "",
    cap_live_price: "",
    key: "",
    grade: "",
  });

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

  const handleSaveVehicle = async () => {
    const purchase = Number(formData.purchase_price);
    const sale = Number(formData.sale_price);
    const repairs = Number(formData.repairs);
    const profit = sale - (purchase + repairs);

    const payload = {
      ...formData,
      purchase_price: purchase,
      sale_price: sale,
      repairs: repairs,
      cap_clean_price: Number(formData.cap_clean_price),
      cap_live_price: Number(formData.cap_live_price),
      key: Number(formData.key),
      grade: Number(formData.grade),
      profit,
    };

    if (editingId) {
      await supabase.from("vehicles").update(payload).eq("id", editingId);
    } else {
      await supabase.from("vehicles").insert([
        { ...payload, status: "In Stock" },
      ]);
    }

    setEditingId(null);
    setShowForm(false);
    setFormData({
      make: "",
      model: "",
      reg: "",
      transmission: "",
      v5c_status: "",
      purchase_price: "",
      sale_price: "",
      repairs: "",
      cap_clean_price: "",
      cap_live_price: "",
      key: "",
      grade: "",
    });

    fetchVehicles();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Sold" ? "In Stock" : "Sold";
    await supabase.from("vehicles").update({ status: newStatus }).eq("id", id);
    fetchVehicles();
  };

  const startEdit = (vehicle: any) => {
    setEditingId(vehicle.id);
    setFormData(vehicle);
    setShowForm(true);
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
      </div>

      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
        }}
        className="bg-black text-white px-4 py-2 rounded-lg mb-6"
      >
        {editingId ? "Cancel Edit" : "+ Add Vehicle"}
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-4">

          {Object.keys(formData).map((field) => (
            <input
              key={field}
              type={
                [
                  "purchase_price",
                  "sale_price",
                  "repairs",
                  "cap_clean_price",
                  "cap_live_price",
                  "key",
                  "grade",
                ].includes(field)
                  ? "number"
                  : "text"
              }
              placeholder={field.replace(/_/g, " ")}
              value={formData[field] ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}

          <button
            onClick={handleSaveVehicle}
            className="col-span-2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            {editingId ? "Update Vehicle" : "Save Vehicle"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        {vehicles.length === 0 ? (
          <p>No vehicles found.</p>
        ) : (
          <ul className="space-y-4">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.reg})
                    </div>
                    <div>Profit: £{vehicle.profit}</div>
                    <div>Status: {vehicle.status}</div>
                  </div>

                  <div className="flex gap-2">
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

                    <button
                      onClick={() => startEdit(vehicle)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}