"use client";

import { useState, useEffect } from "react";

export default function JobCardsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    customer: "",
    reg: "",
    description: "",
    labour: "",
    parts: "",
    charge: "",
  });

  // Load saved jobs
  useEffect(() => {
    const saved = localStorage.getItem("mfiJobs");
    if (saved) {
      setJobs(JSON.parse(saved));
    }
  }, []);

  // Save jobs
  useEffect(() => {
    localStorage.setItem("mfiJobs", JSON.stringify(jobs));
  }, [jobs]);

  const handleAddJob = () => {
    const labour = Number(formData.labour);
    const parts = Number(formData.parts);
    const charge = Number(formData.charge);

    const cost = labour + parts;
    const profit = charge - cost;

    setJobs([
      ...jobs,
      { ...formData, cost, profit, status: "Open" },
    ]);

    setFormData({
      customer: "",
      reg: "",
      description: "",
      labour: "",
      parts: "",
      charge: "",
    });

    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Job Cards</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-black text-white px-4 py-2 rounded-lg mb-6"
      >
        + New Job Card
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 grid grid-cols-2 gap-4">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              placeholder={field}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
              className="border p-2 rounded"
            />
          ))}

          <button
            onClick={handleAddJob}
            className="col-span-2 mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Save Job
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-6">
        {jobs.length === 0 ? (
          <p className="text-gray-500">No job cards created.</p>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job, index) => (
              <li key={index} className="border p-4 rounded-lg">
                <div className="font-semibold">
                  {job.customer} – {job.reg}
                </div>
                <div className="text-sm text-gray-600">
                  {job.description}
                </div>
                <div className="text-sm mt-1">
                  Labour: £{job.labour} | Parts: £{job.parts} | Charge: £{job.charge}
                </div>
                <div
                  className={`mt-2 font-bold ${
                    job.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Profit: £{job.profit}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}