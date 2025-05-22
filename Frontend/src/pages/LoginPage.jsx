import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/auth";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "email is required";
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
      const res = await loginUser(form);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.user.id);
      toast.success("Login successful");
      navigate("/bill");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>email</label>
          <input
            type="text"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

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

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
