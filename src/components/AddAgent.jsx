import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";

export default function AddAgent() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    mobileNumber: "",
    countryCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/agents",
        form,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      setSuccess("Agent added successfully!");
      setForm({
        username: "",
        email: "",
        password: "",
        mobileNumber: "",
        countryCode: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add agent");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

  return (
    <>
    <Navbar onLogout={handleLogout} />
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-8 font-sans">
      <div className="bg-white p-12 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full max-w-sm">
        <h2 className="mb-8 text-center text-[#303f9f] font-bold text-[1.8rem]">
          Add New Agent
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {[
            { name: "username", type: "text", placeholder: "Username" },
            { name: "email", type: "email", placeholder: "Email" },
            { name: "password", type: "password", placeholder: "Password" },
            { name: "countryCode", type: "text", placeholder: "Country Code (e.g. +1)" },
            { name: "mobileNumber", type: "tel", placeholder: "Mobile Number" },
          ].map(({ name, type, placeholder }) => (
            <input
              key={name}
              type={type}
              name={name}
              placeholder={placeholder}
              value={form[name]}
              onChange={handleChange}
              required
              className="w-full px-[15px] py-[12px] mb-6 rounded-lg border-[1.8px] border-[#ddd] text-base transition duration-300 ease-in-out focus:outline-none focus:border-[#3f51b5] focus:shadow-[0_0_5px_rgba(63,81,181,0.5)]"
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-[14px] text-white font-semibold text-[1.1rem] rounded-lg border-none shadow-[0_4px_10px_rgba(63,81,181,0.4)] transition-colors duration-300 ${
              loading
                ? "bg-[#9fa8da] cursor-not-allowed"
                : "bg-[#3f51b5] hover:bg-[#303f9f] cursor-pointer"
            }`}
          >
            {loading ? "Adding Agent..." : "Add Agent"}
          </button>

          {error && (
            <p className="text-[#e53935] mt-6 font-semibold text-center">{error}</p>
          )}
          {success && (
            <p className="text-[#43a047] mt-6 font-semibold text-center">{success}</p>
          )}
        </form>
      </div>
    </div>
    </>
  );
}
