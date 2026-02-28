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
  const { data, error } = await supabase
    .from("vehicles")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return;

  setVehicles(data || []);
  setFilteredVehicles(data || []);
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
  make: formData.make,
  model: formData.model,
  reg: formData.reg,
  mileage: formData.mileage ? Number(formData.mileage) : null,
  purchase_price: formData.purchase_price ? Number(formData.purchase_price) : 0,
  sale_price: formData.sale_price ? Number(formData.sale_price) : 0,
  repairs: formData.repairs ? Number(formData.repairs) : 0,
  cap_clean_price: formData.cap_clean_price
    ? Number(formData.cap_clean_price)
    : null,
  cap_live_price: formData.cap_live_price
    ? Number(formData.cap_live_price)
    : null,
  mot: formData.mot || null,
  transmission: formData.transmission || null,
  grade: formData.grade ? Number(formData.grade) : null,
  v5c_status: formData.v5c_status || null,
  keys_count: formData.keys_count
    ? Number(formData.keys_count)
    : null,
};
  let response;

  if (editingVehicle) {
    response = await supabase
      .from("vehicles")
      .update(payload)
      .eq("id", editingVehicle.id);
  } else {
    response = await supabase
      .from("vehicles")
      .insert([{ ...payload, status: "In Stock" }]);
  }

  console.log("SAVE RESPONSE:", response);

  if (response.error) {
    alert("Error saving vehicle. Check console.");
    console.error(response.error);
    return;
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
const handleDelete = async (id: string) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this vehicle?"
  );

  if (!confirmDelete) return;

  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete failed:", error);
  } else {
    fetchVehicles();
  }
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
  <div className="px-6 py-6">
    <h1 className="text-2xl font-semibold mb-8">Vehicle Stock</h1>

    {/* Controls */}
    <div className="flex items-center justify-between mb-8">
      <div className="flex gap-4">
        <input
          placeholder="Search by make..."
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="">All</option>
          <option value="In Stock">In Stock</option>
          <option value="Sold">Sold</option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          onClick={exportToCSV}
          className="border border-gray-300 px-4 py-2 text-sm rounded-md hover:bg-gray-50"
        >
          Export
        </button>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingVehicle(null);
            setFormData(emptyForm);
          }}
          className="bg-black text-white px-4 py-2 text-sm rounded-md hover:bg-gray-900"
        >
          + Add Vehicle
        </button>
      </div>
    </div>
{showForm && (
  <div className="mb-8 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <div className="grid grid-cols-3 gap-4">
<div className="mb-6">
  <h3 className="text-sm font-semibold mb-3">Basic Information</h3>

  <div className="grid grid-cols-3 gap-4">
    <div>
      <label className="text-xs text-gray-600">Make</label>
      <input
        value={formData.make}
        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Model</label>
      <input
        value={formData.model}
        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Registration</label>
      <input
        value={formData.reg}
        onChange={(e) => setFormData({ ...formData, reg: e.target.value })}
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>
  </div>
</div>
<div className="mb-6">
  <h3 className="text-sm font-semibold mb-3">Financial Information</h3>

  <div className="grid grid-cols-3 gap-4">
    <div>
      <label className="text-xs text-gray-600">Purchase Price (£)</label>
      <input
        type="number"
        value={formData.purchase_price}
        onChange={(e) =>
          setFormData({ ...formData, purchase_price: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Repairs (£)</label>
      <input
        type="number"
        value={formData.repairs}
        onChange={(e) =>
          setFormData({ ...formData, repairs: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Sale Price (£)</label>
      <input
        type="number"
        value={formData.sale_price}
        onChange={(e) =>
          setFormData({ ...formData, sale_price: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">CAP Clean (£)</label>
      <input
        type="number"
        value={formData.cap_clean_price}
        onChange={(e) =>
          setFormData({ ...formData, cap_clean_price: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">CAP Live (£)</label>
      <input
        type="number"
        value={formData.cap_live_price}
        onChange={(e) =>
          setFormData({ ...formData, cap_live_price: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>
  </div>
</div>
<div className="mb-6">
  <h3 className="text-sm font-semibold mb-3">Vehicle Details</h3>

  <div className="grid grid-cols-3 gap-4">
    <div>
      <label className="text-xs text-gray-600">Mileage</label>
      <input
        type="number"
        value={formData.mileage}
        onChange={(e) =>
          setFormData({ ...formData, mileage: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">MOT Date</label>
      <input
        type="date"
        value={formData.mot}
        onChange={(e) =>
          setFormData({ ...formData, mot: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Transmission</label>
      <input
        value={formData.transmission}
        onChange={(e) =>
          setFormData({ ...formData, transmission: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Grade</label>
      <input
        type="number"
        value={formData.grade}
        onChange={(e) =>
          setFormData({ ...formData, grade: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">V5C Status</label>
      <input
        value={formData.v5c_status}
        onChange={(e) =>
          setFormData({ ...formData, v5c_status: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Keys</label>
      <input
        type="number"
        value={formData.keys_count}
        onChange={(e) =>
          setFormData({ ...formData, keys_count: e.target.value })
        }
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>
  </div>
</div>
    </div>

    <div className="mt-6 flex justify-end gap-3">
      <button
        onClick={() => {
          setShowForm(false);
          setEditingVehicle(null);
          setFormData(emptyForm);
        }}
        className="border border-gray-300 px-4 py-2 text-sm rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 text-sm rounded-md hover:bg-gray-900"
      >
        {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
      </button>
    </div>
  </div>
)}
    {/* TABLE */}
    <div className="w-full overflow-x-auto border-t border-gray-200">
      <table className="min-w-[1200px] text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
  <tr>
    <th className="px-4 py-3 text-left">Make</th>
    <th className="px-4 py-3 text-left">Model</th>
    <th className="px-4 py-3 text-left">Reg</th>
    <th className="px-4 py-3 text-left">Mileage</th>
    <th className="px-4 py-3 text-left">Purchase</th>
    <th className="px-4 py-3 text-left">Repairs</th>
    <th className="px-4 py-3 text-left">Total Cost</th>
    <th className="px-4 py-3 text-left">CAP Clean</th>
    <th className="px-4 py-3 text-left">CAP Live</th>
    <th className="px-4 py-3 text-left">CAP Check</th>
    <th className="px-4 py-3 text-left">Sold Price</th>
    <th className="px-4 py-3 text-left">Profit</th>
    <th className="px-4 py-3 text-left">Status</th>
    <th className="px-4 py-3 text-left">MOT</th>
    <th className="px-4 py-3 text-left">Days</th>
    <th className="px-4 py-3 text-left">V5C</th>
    <th className="px-4 py-3 text-left">Transmission</th>
    <th className="px-4 py-3 text-left">Grade</th>
    <th className="px-4 py-3 text-left">Keys</th>
    <th className="px-4 py-3 text-left">Actions</th>
  </tr>
</thead>
        <tbody>
          {filteredVehicles.map((v) => {
            const purchase = Number(v.purchase_price || 0);
const repairs = Number(v.repairs || 0);
const sale = Number(v.sale_price || 0);
const capLive = Number(v.cap_live_price || 0);

const totalCost = purchase + repairs;
const profit = sale - totalCost;
const capCheckValue = capLive - totalCost;
const days = calculateDaysInStock(v.created_at);
            return (
<tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">

  <td className="px-4 py-3">{v.make}</td>
  <td className="px-4 py-3">{v.model}</td>
  <td className="px-4 py-3">{v.reg}</td>
  <td className="px-4 py-3">{v.mileage}</td>

  <td className="px-4 py-3">£{purchase}</td>
  <td className="px-4 py-3">£{repairs}</td>
  <td className="px-4 py-3 font-medium">£{totalCost}</td>

  <td className="px-4 py-3">£{v.cap_clean_price}</td>
  <td className="px-4 py-3">£{v.cap_live_price}</td>

  {/* CAP Check */}
  <td className="px-4 py-3">
    {capCheckValue >= 0 ? (
      <span className="text-green-700 font-medium">
        +£{capCheckValue}
      </span>
    ) : (
      <span className="text-red-600 font-medium">
        £{capCheckValue}
      </span>
    )}
  </td>

  <td className="px-4 py-3">£{sale}</td>

  {/* Profit */}
  <td className="px-4 py-3">
  {v.status !== "Sold" ? (
    <span className="text-gray-500">Awaiting Sale</span>
  ) : profit >= 0 ? (
    <span className="text-green-700 font-semibold">
      £{profit}
    </span>
  ) : (
    <span className="text-red-600 font-semibold">
      £{profit}
    </span>
  )}
</td>

  <td className="px-4 py-3">{v.status}</td>
  <td className="px-4 py-3">{v.mot ? formatDate(v.mot) : "-"}</td>
  <td className="px-4 py-3 text-center">{days}</td>
  <td className="px-4 py-3">{v.v5c_status}</td>
  <td className="px-4 py-3">{v.transmission}</td>
  <td className="px-4 py-3">{v.grade}</td>
  <td className="px-4 py-3">{v.keys_count}</td>

  <td className="px-4 py-3 space-x-2 whitespace-nowrap">
    <button
      onClick={() => {
        setEditingVehicle(v);
        setFormData(v);
        setShowForm(true);
      }}
      className="text-blue-600 hover:underline text-sm"
    >
      Edit
    </button>

    <button
      onClick={() => toggleStatus(v.id, v.status)}
      className="text-gray-600 hover:underline text-sm"
    >
      Toggle
    </button>

    <button
      onClick={() => handleDelete(v.id)}
      className="text-red-600 hover:underline text-sm"
    >
      Delete
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