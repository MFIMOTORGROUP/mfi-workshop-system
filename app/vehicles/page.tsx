"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    make: "",
    model: "",
    reg: "",
    purchase_price: "",
    sale_price: "",
    repairs: "",
  });

  // LOAD VEHICLES FROM SUPABASE
  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVehicles(data);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    const purchase = Number(formData.purchase_price);
    const sale = Number(formData.sale_price);
    const repairs = Number(formData.repairs);

    const profit = sale - (purchase + repairs);

    const { error } = await supabase.from("vehicles").insert([
      {
        ...formData,
        purchase_price: purchase,
        sale_price: sale,
        repairs: repairs,
        profit,
        status: "In Stock",
      },
    ]);

    if (!error) {
      fetchVehicles();
      setFormData({
        make: "",
        model: "",
        reg: "",
        purchase_price: "",
        sale_price: "",
        repairs: "",
      });
      setShowForm(false);
    }
  };

  const markSold = async (id: string) => {
    await supabase
      .from("vehicles")
      .update({ status: "Sold" })
      .eq("id", id);

    fetchVehicles();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Vehicle Stock</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-black text-white px-4 py-2 rounded-lg mb-6"
      >
        + Add Vehicle
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-4">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              placeholder={field.replace(/_/g, " ")}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}

          <button
            onClick={handleAddVehicle}
            className="col-span-2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Save Vehicle
          </button>
        </div>
      )}

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
                      Purchase: £{vehicle.purchase_price} | Repairs: £
                      {vehicle.repairs} | Sale: £{vehicle.sale_price}
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

                  {vehicle.status === "In Stock" && (
                    <button
                      onClick={() => markSold(vehicle.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                    >
                      Mark Sold
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}