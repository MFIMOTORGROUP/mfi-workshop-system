"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const savedVehicles = localStorage.getItem("mfiVehicles");
    if (savedVehicles) {
      setVehicles(JSON.parse(savedVehicles));
    }

    const savedJobs = localStorage.getItem("mfiJobs");
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    }
  }, []);

  const inStock = vehicles.filter(v => v.status === "In Stock");
  const sold = vehicles.filter(v => v.status === "Sold");

  const totalStockValue = inStock.reduce(
    (sum, v) => sum + Number(v.purchasePrice),
    0
  );

  const salesProfit = sold.reduce(
    (sum, v) => sum + Number(v.profit),
    0
  );

  const workshopProfit = jobs.reduce(
    (sum, j) => sum + Number(j.profit),
    0
  );

  const totalBusinessProfit = salesProfit + workshopProfit;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        MFI Motor Group Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-600">Vehicles In Stock</h2>
          <p className="text-3xl font-bold mt-2">{inStock.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-600">Stock Value</h2>
          <p className="text-3xl font-bold mt-2">
            £{totalStockValue}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-600">Sales Profit</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            £{salesProfit}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg text-gray-600">Workshop Profit</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            £{workshopProfit}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow col-span-3">
          <h2 className="text-lg text-gray-600">Total Business Profit</h2>
          <p className="text-4xl font-bold mt-2 text-blue-600">
            £{totalBusinessProfit}
          </p>
        </div>
      </div>
    </div>
  );
}