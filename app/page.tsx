"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data } = await supabase.from("vehicles").select("*");
    if (data) setVehicles(data);
  };

  const totalVehicles = vehicles.length;

  const inStock = vehicles.filter(
    (v) => v.status === "In Stock"
  ).length;

  const soldVehicles = vehicles.filter(
    (v) => v.status === "Sold"
  ).length;

  const stockInvestment = vehicles
    .filter((v) => v.status === "In Stock")
    .reduce((sum, v) => sum + (v.purchase_price || 0), 0);

  const potentialProfit = vehicles
    .filter((v) => v.status === "In Stock")
    .reduce((sum, v) => sum + (v.profit || 0), 0);

  const realisedProfit = vehicles
    .filter((v) => v.status === "Sold")
    .reduce((sum, v) => sum + (v.profit || 0), 0);

  const totalRevenue = vehicles
    .filter((v) => v.status === "Sold")
    .reduce((sum, v) => sum + (v.sale_price || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">

        {/* STOCK INFO */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Total Vehicles</h2>
          <p className="text-2xl font-bold">{totalVehicles}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">In Stock</h2>
          <p className="text-2xl font-bold">{inStock}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Sold Vehicles</h2>
          <p className="text-2xl font-bold">{soldVehicles}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">Stock Investment</h2>
          <p className="text-2xl font-bold">£{stockInvestment}</p>
        </div>

        {/* FINANCIALS */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">
            Potential Profit (Unsold)
          </h2>
          <p className="text-2xl font-bold text-green-600">
            £{potentialProfit}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">
            Realised Profit (Sold)
          </h2>
          <p className="text-2xl font-bold text-blue-600">
            £{realisedProfit}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow col-span-2">
          <h2 className="text-lg font-semibold mb-2">
            Total Revenue (Sold Cars)
          </h2>
          <p className="text-2xl font-bold">
            £{totalRevenue}
          </p>
        </div>

      </div>
    </div>
  );
}