import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../services/auth";
import toast from "react-hot-toast";

const SignupPage = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    cash_balance: "",
    bank_balance: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = "Username is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error("Please fill all required fields");
      return;
    }

    try {
     // console.log(e);
      const res = await signupUser(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user.id);
      toast.success("Signup successful");
      navigate("/bill");
    } catch (err) {
    //  console.log(err);
      toast.error(err?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border shadow rounded">
  <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
  <form onSubmit={handleSubmit} className="space-y-4">
    
    {/* Username */}
    <div>
      <label>Username</label>
      <input
        type="text"
        name="username"
        value={form.username}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />
      {errors.username && (
        <p className="text-red-500 text-sm">{errors.username}</p>
      )}
    </div>

    {/* Email */}
    <div>
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email}</p>
      )}
    </div>

    {/* Password */}
    <div>
      <label>Password</label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />
      {errors.password && (
        <p className="text-red-500 text-sm">{errors.password}</p>
      )}
    </div>

    {/* Cash Balance (Optional) */}
    <div>
      <label>Cash Balance (optional)</label>
      <input
        type="number"
        name="cash_balance"
        value={form.cash_balance}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />
    </div>

    {/* Bank Balance (Optional) */}
    <div>
      <label>Bank Balance (optional)</label>
      <input
        type="number"
        name="bank_balance"
        value={form.bank_balance}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />
    </div>

    {/* Submit Button */}
    <button
      type="submit"
      className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
    >
      Sign Up
    </button>

    {/* Login Button */}
    <button
      type="button"
      onClick={() => navigate("/login")}
      className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
    >
      Login
    </button>
  </form>
</div>

  );
};

export default SignupPage;
