import React, { useEffect, useState } from "react";
import api from "../api/api";
import axios from "axios";
import Navbar from "./Navbar";

const UpdateAgentModal = ({ isOpen, onClose, agent, onUpdate }) => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    countryCode: '',
    mobileNumber: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm({
      username: agent.username || '',
      email: agent.email || '',
      countryCode: agent.countryCode || '',
      mobileNumber: agent.mobileNumber || ''
    });
    setErrors({});
  }, [agent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on change
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) newErrors.username = 'Username is required.';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email format is invalid.';
    }
    if (!form.countryCode.trim()) {
      newErrors.countryCode = 'Country code is required.';
    } else if (!/^\+\d{1,4}$/.test(form.countryCode)) {
      newErrors.countryCode = 'Invalid country code format (e.g. +1)';
    }
    if (!form.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^\d{6,15}$/.test(form.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be 6-15 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`http://localhost:5000/api/agents/update/${agent._id}`, form, {
        headers: { Authorization: token }
      });
      if (res.status === 200) {
        onUpdate(agent._id, form);
        onClose();
        alert('Agent updated successfully!');
      }
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update agent.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-12 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-full max-w-sm relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl">×</button>
        <h2 className="mb-8 text-center text-[#303f9f] font-bold text-[1.8rem]">Update Agent</h2>
        <form onSubmit={handleSubmit} noValidate>
          {[
            { name: "username", type: "text", placeholder: "Username" },
            { name: "email", type: "email", placeholder: "Email" },
            { name: "countryCode", type: "text", placeholder: "Country Code (e.g. +1)" },
            { name: "mobileNumber", type: "tel", placeholder: "Mobile Number" },
          ].map(({ name, type, placeholder }) => (
            <div key={name} className="mb-6">
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                required
                className={`w-full px-[15px] py-[12px] rounded-lg border-[1.8px] ${errors[name] ? 'border-red-500' : 'border-[#ddd]'} text-base transition duration-300 ease-in-out focus:outline-none focus:border-[#3f51b5]`}
              />
              {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-[14px] text-white font-semibold text-[1.1rem] rounded-lg border-none shadow-[0_4px_10px_rgba(63,81,181,0.4)] bg-[#3f51b5] hover:bg-[#303f9f] cursor-pointer"
          >
            Update Agent
          </button>
        </form>
      </div>
    </div>
  );
};


export default function ViewAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});

  useEffect(() => {
    async function fetchAgents() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:5000/api/agents", {
          headers: {
            'Authorization': `${token}`
          }
        });
        setAgents(res.data);
      } catch (err) {
        setError("Failed to load agents");
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  const removeToken = () => {
    localStorage.removeItem('token');
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };

    const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleUpdate = (agentId) => {
    const agent = agents.find(a => a._id === agentId);
    if (agent) {
      setSelectedAgent(agent);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedAgent(null);
  };

  const handleAgentUpdate = (agentId, updatedData) => {
    setAgents(prevAgents =>
      prevAgents.map(agent =>
        agent._id === agentId ? { ...agent, ...updatedData } : agent
      )
    );
  };


  const handleDelete = async (agentId) => {
    // Find the agent name for confirmation
    const agentToDelete = agents.find(agent => agent._id === agentId);
    const agentName = agentToDelete ? agentToDelete.username : "this agent";
    
    if (window.confirm(`Are you sure you want to delete ${agentName}? This action cannot be undone.`)) {
      // Set loading state for this specific agent
      setDeleteLoading(prev => ({ ...prev, [agentId]: true }));
      
      try {
        const token = localStorage.getItem('token');
        const result = await axios.delete(`http://localhost:5000/api/agents/delete/${agentId}`, {
          headers: {
            'Authorization': `${token}`
          }
        });
        
        // Remove the deleted agent from the state
        if (result.status === 200) {
          setAgents(agents.filter(agent => agent._id !== agentId));
          alert("Agent deleted successfully!");
        }
      } catch (err) {
        console.error("Failed to delete agent:", err);
        setError("Failed to delete agent");
        alert("Failed to delete agent. Please try again.");
      } finally {
        setDeleteLoading(prev => ({ ...prev, [agentId]: false }));
      }
    }
  };

  if (loading) {
    return (
      <>
      <Navbar onLogout={handleLogout} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-gray-700 font-medium">Loading agents...</span>
        </div>
      </div>
      </>
    );
  }

  if (error) {
    return (
      <>
      <Navbar onLogout={handleLogout} />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L4.104 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-600 font-semibold">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
    <Navbar onLogout={handleLogout} />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Agents List</h2>
          <p className="text-gray-600">Manage and view all registered agents</p>
        </div>

        {/* Agents Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              All Agents ({agents.length})
            </h3>
          </div>

          {agents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-600 font-medium">No agents found</p>
                <p className="text-gray-500 text-sm mt-1">Add some agents to get started</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agents.map((agent) => (
                    <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-semibold text-sm">
                              {agent.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {agent.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              Agent
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-gray-900">{agent.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {agent.countryCode || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm text-gray-900 font-mono">
                            {agent.mobileNumber || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                              updateLoading[agent._id] 
                                ? 'text-indigo-400 bg-indigo-50 cursor-not-allowed' 
                                : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 hover:text-indigo-800'
                            }`}
                            onClick={() => handleUpdate(agent._id)}
                            disabled={updateLoading[agent._id]}
                          >
                            {updateLoading[agent._id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-1"></div>
                            ) : (
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            )}
                            {updateLoading[agent._id] ? 'Updating...' : 'Update'}
                          </button>
                          
                          <button 
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                              deleteLoading[agent._id] 
                                ? 'text-red-400 bg-red-50 cursor-not-allowed' 
                                : 'text-red-700 bg-red-100 hover:bg-red-200 hover:text-red-800'
                            }`}
                            onClick={() => handleDelete(agent._id)}
                            disabled={deleteLoading[agent._id]}
                          >
                            {deleteLoading[agent._id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                            ) : (
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                            {deleteLoading[agent._id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
          {modalOpen && selectedAgent && (
        <UpdateAgentModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          agent={selectedAgent}
          onUpdate={handleAgentUpdate}
        />
      )}

    </>
  );
}