"use client";


import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function JobCardsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [jobCards, setJobCards] = useState<any[]>([]);

  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [description, setDescription] = useState("");
  const [labour, setLabour] = useState("");
  const [parts, setParts] = useState("");
  const [status, setStatus] = useState("Pending");
  const searchParams = useSearchParams();

  const labourNum = Number(labour) || 0;
  const partsNum = Number(parts) || 0;
  const total = labourNum + partsNum;
useEffect(() => {
  fetchVehicles();
  fetchJobCards();
}, []);
useEffect(() => {
  const vehicleFromUrl = searchParams.get("vehicle");

  if (vehicleFromUrl) {
    setSelectedVehicle(vehicleFromUrl);
  }
}, [searchParams]);

  const fetchVehicles = async () => {
    const { data } = await supabase
      .from("vehicles")
      .select("id, make, model, reg");

    if (data) setVehicles(data);
  };

  const fetchJobCards = async () => {
    const { data } = await supabase
      .from("job_cards")
      .select("*, vehicles(make, model, reg)")
      .order("created_at", { ascending: false });

    if (data) setJobCards(data);
  };

  const handleSave = async () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle");
      return;
    }

    // Insert job card
    await supabase.from("job_cards").insert([
      {
        vehicle_id: selectedVehicle,
        description,
        labour_cost: labourNum,
        parts_cost: partsNum,
        total_cost: total,
        status,
      },
    ]);

    // Fetch vehicle
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", selectedVehicle)
      .single();

    if (vehicle) {
      const newRepairs = (vehicle.repairs || 0) + total;

      const newProfit =
        (vehicle.sale_price || 0) -
        ((vehicle.purchase_price || 0) + newRepairs);

      await supabase
        .from("vehicles")
        .update({
          repairs: newRepairs,
          profit: newProfit,
        })
        .eq("id", selectedVehicle);
    }

    // Reset form
    setSelectedVehicle("");
    setDescription("");
    setLabour("");
    setParts("");
    setStatus("Pending");

    fetchJobCards();
  };

  const handleDelete = async (job: any) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job card?"
    );

    if (!confirmDelete) return;

    // Get vehicle
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", job.vehicle_id)
      .single();

    if (vehicle) {
      const newRepairs = (vehicle.repairs || 0) - job.total_cost;

      const newProfit =
        (vehicle.sale_price || 0) -
        ((vehicle.purchase_price || 0) +
          (newRepairs < 0 ? 0 : newRepairs));

      await supabase
        .from("vehicles")
        .update({
          repairs: newRepairs < 0 ? 0 : newRepairs,
          profit: newProfit,
        })
        .eq("id", job.vehicle_id);
    }

    await supabase.from("job_cards").delete().eq("id", job.id);

    fetchJobCards();
  };

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-semibold mb-8">Workshop Job Cards</h1>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="grid grid-cols-2 gap-4">
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
          >
            <option value="">Select Vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} - {v.reg}
              </option>
            ))}
          </select>

          <input
            placeholder="Job Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
          />

          <input
            type="number"
            placeholder="Labour Cost"
            value={labour}
            onChange={(e) => setLabour(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
          />

          <input
            type="number"
            placeholder="Parts Cost"
            value={parts}
            onChange={(e) => setParts(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm"
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex items-center text-sm font-medium">
            Total: £{total}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-900"
          >
            Save Job Card
          </button>
        </div>
      </div>

      {/* Job Cards Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Labour</th>
              <th className="px-4 py-3 text-left">Parts</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {jobCards.map((job) => (
              <tr
                key={job.id}
                className="border-t border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  {job.vehicles?.make} {job.vehicles?.model} (
                  {job.vehicles?.reg})
                </td>
                <td className="px-4 py-3">{job.description}</td>
                <td className="px-4 py-3">£{job.labour_cost}</td>
                <td className="px-4 py-3">£{job.parts_cost}</td>
                <td className="px-4 py-3 font-medium">
                  £{job.total_cost}
                </td>

                <td className="px-4 py-3">
  <select
    value={job.status}
    onChange={async (e) => {
      await supabase
        .from("job_cards")
        .update({ status: e.target.value })
        .eq("id", job.id);

      fetchJobCards();
    }}
    className={`px-2 py-1 rounded-md text-sm font-medium ${
      job.status === "Completed"
        ? "bg-green-100 text-green-700"
        : job.status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-600"
    }`}
  >
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
  </select>
</td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(job)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {jobCards.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No job cards created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}