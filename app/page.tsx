"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    inStock: 0,
    sold: 0,
    totalProfit: 0,
    totalRepairs: 0,
  });

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*");

    if (!error && data) {
      const totalVehicles = data.length;
      const inStock = data.filter(v => v.status === "In Stock").length;
      const sold = data.filter(v => v.status === "Sold").length;
      const totalProfit = data.reduce(
        (sum, v) => sum + (v.profit || 0),
        0
      );
      const totalRepairs = data.reduce(
        (sum, v) => sum + (v.repairs || 0),
        0
      );

      setStats({
        totalVehicles,
        inStock,
        sold,
        totalProfit,
        totalRepairs,
      });
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Total Vehicles" value={stats.totalVehicles} />
        <Card title="In Stock" value={stats.inStock} />
        <Card title="Sold Vehicles" value={stats.sold} />
        <Card
          title="Total Business Profit"
          value={`£${stats.totalProfit}`}
        />
        <Card
          title="Workshop Profit (Repairs)"
          value={`£${stats.totalRepairs}`}
        />
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}