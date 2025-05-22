import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

const CustomOrderPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    ornament_name: "",
    weightrange: "",
    rate: "",
    description: "",
    amountPrepaid: "",
    paymentType: "",
    expectedCompletionTime: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Name is required";
    if (!form.phone) newErrors.phone = "Phone is required";
    else if (isNaN(form.phone))
      newErrors.phone = "Phone must be a valid number";
    if (!form.ornament_name)
      newErrors.ornament_name = "Ornament name is required";
    if (!form.weightrange) newErrors.weightrange = "Weight range is required";
    if (form.amountPrepaid && !form.paymentType)
      newErrors.paymentType = "Required if prepaid";
    if (!form.paymentType) newErrors.paymentType = "Payment type is required";
    if (!form.expectedCompletionTime)
      newErrors.expectedCompletionTime = "Completion time required";
    if (form.rate && isNaN(form.rate))
      newErrors.rate = "Rate must be a valid number";
    if (form.amountPrepaid && isNaN(form.amountPrepaid))
      newErrors.amountPrepaid = "Amount prepaid must be a valid number";
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
      amountPrepaid: form.amountPrepaid || 0,
    };

    try {
      await API.post("/customOrders", payload);
      toast.success("Order placed successfully!");
      setForm({
        name: "",
        phone: "",
        address: "",
        ornament_name: "",
        weightrange: "",
        rate: "",
        description: "",
        amountPrepaid: "",
        paymentType: "",
        expectedCompletionTime: "",
      });
      navigate("/bill"); // Redirect to bill or dashboard
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Place Custom Order</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Customer Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
        <Input
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          type="number" // Enforcing number input
        />
        <Input
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
        />
        <Input
          label="Ornament Name"
          name="ornament_name"
          value={form.ornament_name}
          onChange={handleChange}
          error={errors.ornament_name}
        />
        <Input
          label="Weight Range"
          name="weightrange"
          value={form.weightrange}
          onChange={handleChange}
          error={errors.weightrange}
        />
        <Input
          label="Rate"
          name="rate"
          value={form.rate}
          onChange={handleChange}
          error={errors.rate}
          type="number" // Enforcing number input
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={handleChange}
        />
        <Input
          label="Amount Prepaid"
          name="amountPrepaid"
          value={form.amountPrepaid}
          onChange={handleChange}
          error={errors.amountPrepaid}
          type="number" // Enforcing number input
        />
        <div>
          <label className="block mb-1">Payment Type</label>
          <select
            name="paymentType"
            value={form.paymentType}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select payment type</option>
            <option value="cash">Cash</option>
            <option value="UPI">UPI</option>
          </select>
          {errors.paymentType && (
            <p className="text-red-500 text-sm">{errors.paymentType}</p>
          )}
        </div>
        <div>
          <label className="block mb-1">Expected Completion Time</label>
          <input
            type="date"
            name="expectedCompletionTime"
            value={form.expectedCompletionTime}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.expectedCompletionTime && (
            <p className="text-red-500 text-sm">
              {errors.expectedCompletionTime}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

const Input = ({ label, name, value, onChange, error, type = "text" }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input
      type={type} // Use the provided type (defaults to text)
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border p-2 rounded"
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default CustomOrderPage;
