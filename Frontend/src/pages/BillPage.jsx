import { useState } from "react";
import toast from "react-hot-toast";
import API from "../services/api";
import Navbar from "../components/Navbar";

// Initial item templates
const getInitialItem = () => ({
  name: "",
  type: "",
  weight: "",
  purity: "",
  rate: "",
  making_charges: "",
  price: 0,
});

const getInitialReturnItem = () => ({
  name: "",
  type: "",
  weight: "",
  purity: "",
  rate: "",
  return_price: 0,
});

const BillPage = () => {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone_no: "",
    address: "",
    earlier_deposited_amount: "",
    items: [getInitialItem()],
    return_items: [],
    payment_mode: "",
    amount_paid: "",
    payment_status: "",
  });

  const [errors, setErrors] = useState({});

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;

    const w = parseFloat(items[index].weight || 0);
    const p = parseFloat(items[index].purity || 0);
    const r = parseFloat(items[index].rate || 0);
    const m = parseFloat(items[index].making_charges || 0);

    items[index].price = w * ((p / 100) * r + m) || 0;
    setForm({ ...form, items });
  };

  const handleReturnItemChange = (index, field, value) => {
    const return_items = [...form.return_items];
    return_items[index][field] = value;

    const w = parseFloat(return_items[index].weight || 0);
    const p = parseFloat(return_items[index].purity || 0);
    const r = parseFloat(return_items[index].rate || 0);

    return_items[index].return_price = w * (p / 100) * r || 0;
    setForm({ ...form, return_items });
  };

  const handleDeleteItem = (index) => {
    const items = [...form.items];
    items.splice(index, 1);
    setForm({ ...form, items });
  };

  const handleDeleteReturnItem = (index) => {
    const return_items = [...form.return_items];
    return_items.splice(index, 1);
    setForm({ ...form, return_items });
  };

  const totalItemAmount = form.items.reduce(
    (sum, i) => sum + parseFloat(i.price || 0),
    0
  );
  const totalReturnAmount = form.return_items.reduce(
    (sum, i) => sum + parseFloat(i.return_price || 0),
    0
  );
  const amount = Math.floor(
    totalItemAmount -
      totalReturnAmount -
      parseFloat(form.earlier_deposited_amount || 0)
  );
  

  // const payment_status =
  //   parseFloat(form.amount_paid || 0) >= amount
  //     ? "paid"
  //     : parseFloat(form.amount_paid || 0) === 0
  //     ? "unpaid"
  //     : "partial";

  const validate = () => {
    const newErrors = {};

    if (!form.customer_name.trim()) {
      newErrors.customer_name = "Customer name is required";
    }

    if (!form.customer_phone_no.trim()) {
      newErrors.customer_phone_no = "Phone number is required";
    } else if (!/^\d{10}$/.test(form.customer_phone_no.trim())) {
      newErrors.customer_phone_no = "Phone number must be 10 digits";
    }

    if (!form.payment_mode) {
      newErrors.payment_mode = "Payment mode is required";
    }

    if (form.amount_paid === "" || form.amount_paid === null) {
      newErrors.amount_paid = "Amount paid is required";
    }
    
    if (!form.payment_status) {
      newErrors.payment_status = "Payment status is required";
    }
    
    form.items.forEach((item, idx) => {
      if (
        !item.name ||
        !item.weight ||
        !item.purity ||
        !item.rate ||
        !item.making_charges
      ) {
        newErrors[`item_${idx}`] = "Fill all item fields";
      }
    });

    form.return_items.forEach((item, idx) => {
      console.log(item);
      const someFilled =
        item.name || item.type || item.weight || item.purity || item.rate;
      const allFilled =
        item.name && item.type && item.weight && item.purity && item.rate;

      if (someFilled && !allFilled) {
        newErrors[`return_item_${idx}`] = "Fill all return item fields";
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Please fill all required fields");
      console.log(validation);
      return;
    }

    try {
      const payload = { ...form, amount };
      await API.post("/bills", payload);
      toast.success("Bill saved successfully");
      setForm({
        customer_name: "",
        customer_phone_no: "",
        address: "",
        earlier_deposited_amount: "",
        items: [getInitialItem()],
        return_items: [],
        payment_mode: "",
        amount_paid: "",
      });
      setErrors({});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save bill");
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create Bill</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Customer Name"
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            {errors.customer_name && (
              <p className="text-red-500 text-sm">{errors.customer_name}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Phone Number"
              value={form.customer_phone_no}
              onChange={(e) =>
                setForm({ ...form, customer_phone_no: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            {errors.customer_phone_no && (
              <p className="text-red-500 text-sm">{errors.customer_phone_no}</p>
            )}
          </div>
          <input
            type="text"
            placeholder="Address (optional)"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border p-2 rounded"
          />
        </div>

        {/* Items */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Items</h2>
          {form.items.map((item, index) => (
            <div key={index} className="border p-3 rounded mb-2 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <select
                  value={item.type}
                  onChange={(e) =>
                    handleItemChange(index, "type", e.target.value)
                  }
                  className="border p-1 rounded"
                >
                  {" "}
                  <option value="">Select Type</option>
                  <option value="customized">Customised</option>
                  <option value="ready-made">Ready Made</option>
                </select>
                <input
                  type="number"
                  placeholder="Weight"
                  value={item.weight}
                  onChange={(e) =>
                    handleItemChange(index, "weight", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  placeholder="Purity"
                  value={item.purity}
                  onChange={(e) =>
                    handleItemChange(index, "purity", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) =>
                    handleItemChange(index, "rate", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  placeholder="Making Charges"
                  value={item.making_charges}
                  onChange={(e) =>
                    handleItemChange(index, "making_charges", e.target.value)
                  }
                  className="border p-1 rounded"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Price: ₹{item.price.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="text-red-500 text-xs"
                >
                  Delete
                </button>
              </div>
              {errors[`item_${index}`] && (
                <p className="text-red-500 text-sm">
                  {errors[`item_${index}`]}
                </p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, items: [...form.items, getInitialItem()] })
            }
            className="text-blue-600 text-sm"
          >
            + Add Item
          </button>
        </div>

        {/* Return Items */}
        <div>
          <h2 className="font-semibold text-lg mb-2">
            Return Items (Optional)
          </h2>
          {form.return_items.map((item, index) => (
            <div key={index} className="border p-3 rounded mb-2 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) =>
                    handleReturnItemChange(index, "name", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <select
                  value={item.type}
                  onChange={(e) =>
                    handleReturnItemChange(index, "type", e.target.value)
                  }
                  className="border p-1 rounded"
                >
                  {" "}
                  <option value="">Select Type</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                </select>
                <input
                  type="number"
                  placeholder="Weight"
                  value={item.weight}
                  onChange={(e) =>
                    handleReturnItemChange(index, "weight", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  placeholder="Purity"
                  value={item.purity}
                  onChange={(e) =>
                    handleReturnItemChange(index, "purity", e.target.value)
                  }
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) =>
                    handleReturnItemChange(index, "rate", e.target.value)
                  }
                  className="border p-1 rounded"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Return Price: ₹{item.return_price.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDeleteReturnItem(index)}
                  className="text-red-500 text-xs"
                >
                  Delete
                </button>
              </div>
              {errors[`return_item_${index}`] && (
                <p className="text-red-500 text-sm">
                  {errors[`return_item_${index}`]}
                </p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                return_items: [...form.return_items, getInitialReturnItem()],
              })
            }
            className="text-blue-600 text-sm"
          >
            + Add Return Item
          </button>
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="number"
              placeholder="Earlier Deposited Amount"
              value={form.earlier_deposited_amount}
              onChange={(e) =>
                setForm({ ...form, earlier_deposited_amount: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <p className="text-xs text-gray-500">Earlier Amount Paid</p>
          </div>

          <div>
            <select
              value={form.payment_mode}
              onChange={(e) =>
                setForm({ ...form, payment_mode: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option value="">Select Payment Mode</option>
              <option value="cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
            <p className="text-xs text-gray-500">Payment Method</p>
            {errors.payment_mode && (
              <p className="text-red-500 text-sm">{errors.payment_mode}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              placeholder="Amount Paid"
              value={form.amount_paid}
              onChange={(e) =>
                setForm({ ...form, amount_paid: e.target.value })
              }
              className="border p-2 rounded w-full"
            />
            <p className="text-xs text-gray-500">Amount Paid Now</p>
            {errors.amount_paid && (
              <p className="text-red-500 text-sm">{errors.amount_paid}</p>
            )}
          </div>
          <div>
            <select
              value={form.payment_status}
              onChange={(e) =>
                setForm({ ...form, payment_status: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option value="">Select Payment Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid</option>
            </select>
            <p className="text-xs text-gray-500">Payment Status</p>
            {errors.payment_status && (
              <p className="text-red-500 text-sm">{errors.payment_status}</p>
            )}
          </div>
        </div>

        {/* Final Summary */}
        <p className="text-lg font-semibold">
          Final Amount: ₹{amount.toFixed(2)} | Status: {form.payment_status}
        </p>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Save Bill
        </button>
      </form>
    </div>
  );
};

export default BillPage;
