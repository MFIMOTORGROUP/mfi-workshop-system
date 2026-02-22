"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [filterMake, setFilterMake] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [formData, setFormData] = useState({
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

  // FETCH VEHICLES
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

    const { data, error } = await query;

    if (!error && data) {
      setVehicles(data);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filterMake, filterStatus]);

  // ADD VEHICLE
  const handleAddVehicle = async () => {
    const purchase = Number(formData.purchase_price);
    const sale = Number(formData.sale_price);
    const repairs = Number(formData.repairs);
    const profit = sale - (purchase + repairs);

    const { error } = await supabase.from("vehicles").insert([
      {
        make: formData.make,
        model: formData.model,
        reg: formData.reg,
        transmission: formData.transmission,
        v5c_status: formData.v5c_status,
        purchase_price: purchase,
        sale_price: sale,
        repairs: repairs,
        profit,
        cap_clean_price: Number(formData.cap_clean_price),
        cap_live_price: Number(formData.cap_live_price),
        key: Number(formData.key),
        grade: Number(formData.grade),
        status: "In Stock",
      },
    ]);

    if (!error) {
      fetchVehicles();
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
      setShowForm(false);
    }
  };

  // TOGGLE SOLD / STOCK
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus =
      currentStatus === "Sold" ? "In Stock" : "Sold";

    await supabase
      .from("vehicles")
      .update({ status: newStatus })
      .eq("id", id);

    fetchVehicles();
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
          Clear Filters
        </button>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-black text-white px-4 py-2 rounded-lg mb-6"
      >
        + Add Vehicle
      </button>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-4">

          <input
            placeholder="Make"
            value={formData.make}
            onChange={(e) =>
              setFormData({ ...formData, make: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Model"
            value={formData.model}
            onChange={(e) =>
              setFormData({ ...formData, model: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Registration"
            value={formData.reg}
            onChange={(e) =>
              setFormData({ ...formData, reg: e.target.value })
            }
            className="border p-2 rounded"
          />

          <select
            value={formData.transmission}
            onChange={(e) =>
              setFormData({ ...formData, transmission: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Select Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>

          <select
            value={formData.v5c_status}
            onChange={(e) =>
              setFormData({ ...formData, v5c_status: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Select V5C Status</option>
            <option value="In Hand">In Hand</option>
            <option value="Awaiting">Awaiting</option>
            <option value="Not Present">Not Present</option>
          </select>

          <input
            type="number"
            placeholder="Purchase Price"
            value={formData.purchase_price}
            onChange={(e) =>
              setFormData({ ...formData, purchase_price: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Sale Price"
            value={formData.sale_price}
            onChange={(e) =>
              setFormData({ ...formData, sale_price: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Repairs"
            value={formData.repairs}
            onChange={(e) =>
              setFormData({ ...formData, repairs: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="CAP Clean Price"
            value={formData.cap_clean_price}
            onChange={(e) =>
              setFormData({ ...formData, cap_clean_price: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="CAP Live Price"
            value={formData.cap_live_price}
            onChange={(e) =>
              setFormData({ ...formData, cap_live_price: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Number of Keys (0-2)"
            value={formData.key}
            onChange={(e) =>
              setFormData({ ...formData, key: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="number"
            placeholder="Grade (1-5)"
            value={formData.grade}
            onChange={(e) =>
              setFormData({ ...formData, grade: e.target.value })
            }
            className="border p-2 rounded"
          />

          <button
            onClick={handleAddVehicle}
            className="col-span-2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Save Vehicle
          </button>
        </div>
      )}

      {/* VEHICLE LIST */}
      <div className="bg-white rounded-xl shadow p-6">
        {vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles found.</p>
        ) : (
          <ul className="space-y-4">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.reg})
                    </div>

                    <div className="text-sm text-gray-600">
                      Transmission: {vehicle.transmission} | V5C: {vehicle.v5c_status}
                    </div>

                    <div className="text-sm text-gray-600">
                      CAP Clean: £{vehicle.cap_clean_price} | CAP Live: £{vehicle.cap_live_price}
                    </div>

                    <div className="text-sm text-gray-600">
                      Keys: {vehicle.key} | Grade: {vehicle.grade}
                    </div>

                    <div className="text-sm text-gray-600">
                      Purchase: £{vehicle.purchase_price} | Repairs: £{vehicle.repairs} | Sale: £{vehicle.sale_price}
                    </div>

                    <div className={`mt-2 font-bold ${vehicle.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      Profit: £{vehicle.profit}
                    </div>

                    <div className="mt-1 text-sm">
                      Status: {vehicle.status}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStatus(vehicle.id, vehicle.status)}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                  >
                    {vehicle.status === "Sold" ? "Mark In Stock" : "Mark Sold"}
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