import React, { useEffect, useState } from "react";
import api from "../api/api";
import axios from "axios";
import Navbar from "./Navbar";

export default function ViewTasks() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:5000/api/agents",{
          headers: {
            'Authorization': `${token}`
          }
        });
        setAgents(res.data);
      } catch (err) {
        setError("Failed to load agents");
      } finally {
        setLoadingAgents(false);
      }
    }
    fetchAgents();
  }, []);

  const fetchTasks = async (agentId) => {
    setLoadingTasks(true);
    setError("");
    setTasks([]);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/upload/${agentId}`,{
        headers: {
          'Authorization': `${token}`
        }
      });
      setTasks(res.data);
      console.log(res.data,"tasksss");
      
    } catch (err) {
      setError("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleAgentChange = (e) => {
    const agentId = e.target.value;
    setSelectedAgent(agentId);
    if (agentId) fetchTasks(agentId);
    else setTasks([]);
  };

  const handleLogout = () => {
    removeToken();
    window.location.href = "/login";
  };


  if (loadingAgents) {
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

  
  return (
    <>
    <Navbar onLogout={handleLogout} />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">View Tasks by Agent</h2>
          <p className="text-gray-600">Select an agent to view their assigned tasks</p>
        </div>

        {/* Agent Selection */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Agent</label>
          <select 
            value={selectedAgent} 
            onChange={handleAgentChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm"
          >
            <option value="">Choose an agent...</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.username}
              </option>
            ))}
          </select>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loadingTasks ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-700 font-medium">Loading tasks...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L4.104 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            </div>
          ) : tasks.length === 0 && selectedAgent ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-600 font-medium">No tasks found for this agent</p>
              </div>
            </div>
          ) : tasks.length > 0 ? (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Tasks ({tasks.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.map((task, index) => (
                      <tr key={task._id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-indigo-600 font-medium text-sm">
                                {(task.firstName || "N").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {task.firstName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 font-mono">
                            {task.phone || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {task.notes || "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">Select an agent to view their tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}