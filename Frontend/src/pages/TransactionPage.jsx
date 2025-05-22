import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

const TransactionPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    transaction_type: "",
    amount: "",
    description: "",
    mode: "",
    category: "",
    source_or_destination: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.transaction_type)
      newErrors.transaction_type = "Transaction type is required";
    if (!form.amount) newErrors.amount = "Amount is required";
    else if (isNaN(form.amount))
      newErrors.amount = "Amount must be a valid number";
    if (!form.description) newErrors.description = "Description is required";
    if (!form.mode) newErrors.mode = "Mode is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.source_or_destination)
      newErrors.source_or_destination = "Source or Destination is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const payload = {
      ...form,
      amount: parseFloat(form.amount), // Ensure amount is treated as a number
    };

    try {
      await API.post("/transactions", payload);
      toast.success("Transaction recorded successfully!");
      setForm({
        transaction_type: "",
        amount: "",
        description: "",
        mode: "",
        category: "",
        source_or_destination: "",
      });
      navigate("/history"); // Redirect to history page
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Record Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Transaction Type</label>
          <select
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select transaction type</option>
            <option value="inflow">Inflow</option>
            <option value="outflow">Outflow</option>
          </select>
          {errors.transaction_type && (
            <p className="text-red-500 text-sm">{errors.transaction_type}</p>
          )}
        </div>

        <Input
          label="Amount"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          error={errors.amount}
          type="number" // Ensure amount is numeric
        />

        <Input
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
        />

        <div>
          <label className="block mb-1">Mode</label>
          <select
            name="mode"
            value={form.mode}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select mode</option>
            <option value="cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
          {errors.mode && <p className="text-red-500 text-sm">{errors.mode}</p>}
        </div>

        <div>
          <label className="block mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select category</option>
            <option value="in-house">In-house</option>
            <option value="invoice">Invoice</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category}</p>
          )}
        </div>

        <Input
          label="Source or Destination"
          name="source_or_destination"
          value={form.source_or_destination}
          onChange={handleChange}
          error={errors.source_or_destination}
        />

        <div>
          <label className="block mb-1">Transaction Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Record Transaction
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, name, value, onChange, error, type = "text" }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border p-2 rounded"
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default TransactionPage;
