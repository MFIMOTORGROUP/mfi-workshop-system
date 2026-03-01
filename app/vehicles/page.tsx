"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{
  key: string;
  direction: "asc" | "desc";
} | null>(null);
const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
const [tempSaleValue, setTempSaleValue] = useState("");
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
.select("*")
.order("created_at", { ascending: false });

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return;

  setVehicles(data || []);
  setFilteredVehicles(data || []);
};

  useEffect(() => {
    fetchVehicles();
  }, []);

 
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

  const handleSort = (key: string) => {
  let direction: "asc" | "desc" = "asc";

  if (
    sortConfig &&
    sortConfig.key === key &&
    sortConfig.direction === "asc"
  ) {
    direction = "desc";
  }

  setSortConfig({ key, direction });

  const sorted = [...filteredVehicles].sort((a, b) => {
    const aValue = a[key] ?? "";
    const bValue = b[key] ?? "";

    if (!isNaN(aValue) && !isNaN(bValue)) {
      return direction === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }

    return direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  setFilteredVehicles(sorted);
};
  return (
  <div className="py-6">
    <h1 className="text-2xl font-semibold mb-8">Vehicle Stock</h1>

    {/* Controls */}
    <div className="flex items-center justify-between mb-8">
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
        onChange={(e) => setFormData({ ...formData, make: e.target.value.toUpperCase() })}
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Model</label>
      <input
        value={formData.model}
        onChange={(e) => setFormData({ ...formData, model: e.target.value.toUpperCase() })}
        className="w-full border px-3 py-2 rounded-md text-sm"
      />
    </div>

    <div>
      <label className="text-xs text-gray-600">Registration</label>
      <input
        value={formData.reg}
        onChange={(e) => setFormData({ ...formData, reg: e.target.value.toUpperCase() })}
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
      <select
  value={formData.transmission || ""}
  onChange={(e) =>
    setFormData({ ...formData, transmission: e.target.value })
  }
  className="w-full border px-3 py-2 rounded-md text-sm bg-white"
>
  <option value="">Select Transmission</option>
  <option value="Manual">Manual</option>
  <option value="Automatic">Automatic</option>
  <option value="Semi-Automatic">Semi-Automatic</option>
</select>
    </div>

    <div>
      <label className="text-xs text-gray-600">Grade</label>
      <select
  value={formData.grade || ""}
  onChange={(e) =>
    setFormData({ ...formData, grade: e.target.value })
  }
  className="w-full border px-3 py-2 rounded-md text-sm bg-white"
>
  <option value="">Select Grade</option>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
  <option value="4">4</option>
  <option value="5">5</option>
  <option value="6">6</option>
</select>
    </div>

    <div>
      <label className="text-xs text-gray-600">V5C Status</label>
 <select
  value={formData.v5c_status || ""}
  onChange={(e) =>
    setFormData({ ...formData, v5c_status: e.target.value })
  }
  className="w-full border px-3 py-2 rounded-md text-sm bg-white"
>
  <option value="">Select Status</option>
  <option value="Present">Present</option>
  <option value="Applied For">Applied For</option>
  <option value="Not Present">Not Present</option>
</select>
    </div>

    <div>
      <label className="text-xs text-gray-600">Keys</label>
      <select
  value={formData.keys_count || ""}
  onChange={(e) =>
    setFormData({ ...formData, keys_count: e.target.value })
  }
  className="w-full border px-3 py-2 rounded-md text-sm bg-white"
>
  <option value="">Select Keys</option>
  <option value="0">0</option>
  <option value="1">1</option>
  <option value="2">2</option>
  <option value="3">3</option>
</select>
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
<div className="w-full border-t border-gray-200">
<div className="max-h-[600px] overflow-auto">
  <table className="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
       <thead className="sticky top-0 z-20 bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
  <tr>
<th className="sticky left-0 w-[150px] min-w-[150px] z-40 bg-gray-50 px-4 py-3 text-left relative">

  <div className="flex items-center justify-between">

    <span>Make</span>

    {/* Filter Icon */}
    <button
      onClick={(e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === "make" ? null : "make");
      }}
      className="text-xs hover:text-black"
    >
      ⏷
    </button>

  </div>

  {/* Dropdown */}
  {activeMenu === "make" && (
    <div className="absolute right-2 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm">
      
      <button
        onClick={() => {
          handleSort("make");
          setActiveMenu(null);
        }}
        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
      >
        Sort A → Z
      </button>

      <button
        onClick={() => {
          handleSort("make");
          setActiveMenu(null);
        }}
        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
      >
        Sort Z → A
      </button>

    </div>
  )}

</th>

<th
  onClick={() => handleSort("model")}
  className="sticky left-[150px] w-[180px] min-w-[180px] z-40 bg-gray-50 px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
  Model
</th>

<th
  onClick={() => handleSort("reg")}
  className="sticky left-[330px] w-[130px] min-w-[130px] z-40 bg-gray-50 px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
  Reg
</th>
    <th
  onClick={() => handleSort("mileage")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
  Mileage
</th>
    <th
  onClick={() => handleSort("purchase_price")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
  Purchase
</th>
<th
  onClick={() => handleSort("repairs")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
  Repairs
</th>
    <th className="px-4 py-3 text-left">Total Cost</th>
<th
  onClick={() => handleSort("cap_clean_price")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   CAP Clean
</th>
<th
  onClick={() => handleSort("cap_live_price")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   CAP Live
</th>
    <th className="px-4 py-3 text-left">CAP Check</th>
<th
  onClick={() => handleSort("sale_price")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   Sale Price
</th>

    <th className="px-4 py-3 text-left">Profit</th>
    <th
  onClick={() => handleSort("status")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   Status
</th>
    <th
  onClick={() => handleSort("MOT")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   MOT
</th>
    <th className="px-4 py-3 text-left">Days</th>
    <th
  onClick={() => handleSort("v5c")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   V5C
</th>
    <th
  onClick={() => handleSort("Transmission")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   Transmission
</th>
<th
  onClick={() => handleSort("Grade")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   Grade
</th>
<th
  onClick={() => handleSort("keys_count")}
  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
>
   Keys
</th>
    <th className="px-4 py-3 text-left">Actions</th>
  </tr>
  <tr className="bg-gray-100 text-xs">
  <th className="sticky left-0 w-[150px] min-w-[150px] bg-white z-30">
  </th>

  <th className="sticky left-[150px] w-[180px] min-w-[180px] bg-white z-30">
  </th>

  <th className="sticky left-[330px] w-[130px] min-w-[130px] bg-white z-30">

  </th>

  <th colSpan={17}></th>
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
<tr key={v.id} className="border-b border-gray-300 hover:bg-gray-50">

<td className="sticky left-0 w-[150px] min-w-[150px] z-30 bg-white px-4 py-3">
  {v.make}
</td>

<td className="sticky left-[150px] w-[180px] min-w-[180px] z-30 bg-white px-4 py-3">
  {v.model}
</td>

<td className="sticky left-[330px] w-[130px] min-w-[130px] z-30 bg-white px-4 py-3">
  {v.reg}
</td>
  <td className="px-4 py-3">{v.mileage}</td>

  <td className="px-4 py-3">£{purchase}</td>
<td className="px-4 py-3">
  <a
    href={`/jobcards?vehicle=${v.id}`}
    className="text-blue-600 hover:underline font-medium"
  >
    £{repairs}
  </a>
</td>
  <td className="px-4 py-3 font-bold">£{totalCost}</td>

  <td className="px-4 py-3">£{v.cap_clean_price}</td>
  <td className="px-4 py-3">£{v.cap_live_price}</td>

  {/* CAP Check */}
  <td className="px-4 py-3">
    {capCheckValue >= 0 ? (
      <span className="text-green-700 font-medium">
        £{capCheckValue.toFixed(2)}
      </span>
    ) : (
      <span className="text-red-600 font-medium">
       £{capCheckValue.toFixed(2)}
      </span>
    )}
  </td>

  <td className="px-4 py-3">
  {editingSaleId === v.id ? (
    <input
      type="number"
      value={tempSaleValue}
      autoFocus
      onChange={(e) => setTempSaleValue(e.target.value)}
      onBlur={async () => {
        await supabase
          .from("vehicles")
          .update({ sale_price: Number(tempSaleValue) })
          .eq("id", v.id);

        setEditingSaleId(null);
        fetchVehicles();
      }}
      onKeyDown={async (e) => {
        if (e.key === "Enter") {
          await supabase
            .from("vehicles")
            .update({ sale_price: Number(tempSaleValue) })
            .eq("id", v.id);

          setEditingSaleId(null);
          fetchVehicles();
        }
      }}
      className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
    />
  ) : (
    <span
      onClick={() => {
        setEditingSaleId(v.id);
        setTempSaleValue(String(v.sale_price || ""));
      }}
      className="cursor-pointer hover:text-blue-600"
    >
      £{v.sale_price || 0}
    </span>
  )}
</td>

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

  <td className="px-3 py-2">
  <select
    value={v.status}
    onChange={async (e) => {
      await supabase
        .from("vehicles")
        .update({
          status: e.target.value,
          sold_date:
            e.target.value === "Sold"
              ? new Date().toISOString().split("T")[0]
              : null,
        })
        .eq("id", v.id);

      fetchVehicles();
    }}
    className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
  >
    <option value="In Stock">In Stock</option>
    <option value="Sold">Sold</option>
    <option value="Not To Sell">Not To Sell</option>
  </select>
</td>
  <td className="px-4 py-3">{v.mot ? formatDate(v.mot) : "-"}</td>
  <td className="px-4 py-3 text-center">{days}</td>
  <td className="px-4 py-3">
  {v.v5c_status === "Present" && (
    <span className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 font-medium whitespace-nowrap">
      Present
    </span>
  )}

  {v.v5c_status === "Applied For" && (
    <span className="px-2 py-1 text-xs rounded-md bg-yellow-100 text-yellow-700 font-medium whitespace-nowrap">
      Applied For
    </span>
  )}

  {v.v5c_status === "Not Present" && (
    <span className="px-2 py-1 text-xs rounded-md bg-red-100 text-red-700 font-medium whitespace-nowrap">
      Not Present
    </span>
  )}

  {!v.v5c_status && (
    <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-500 font-medium whitespace-nowrap">
      Unknown
    </span>
  )}
</td>
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
</div>
      );
}