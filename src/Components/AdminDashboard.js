import React, { useState, useEffect, useRef } from "react";
import logo from "./images/IMG-20251008-WA0008logo0.png";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [currentAdminRole, setCurrentAdminRole] = useState(1); // Default to admin (1)
  const [currentAdminName, setCurrentAdminName] = useState("Admin");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalMessages: 0,
    totalPartners: 0,
  });

  useEffect(() => {
    fetchAdminProfile();
    fetchDashboardStats();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/profile", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        const storedRole = localStorage.getItem("adminRole") || 1; // Default to admin
        const storedName = localStorage.getItem("adminName") || localStorage.getItem("adminEmail") || "Admin";
        setCurrentAdminRole(parseInt(storedRole));
        setCurrentAdminName(storedName);
        return;
      }

      if (response.ok) {
        let adminRole = 1; // Default to admin (1)
        let adminName = "Admin";

        // Extract role (0 = super_admin, 1 = admin)
        let roleValue;
        if (data.role !== undefined) {
          roleValue = data.role;
        } else if (data.data && data.data.role !== undefined) {
          roleValue = data.data.role;
        } else if (data.admin && data.admin.role !== undefined) {
          roleValue = data.admin.role;
        }

        // Set role as number (0 or 1)
        if (roleValue !== undefined) {
          adminRole = parseInt(roleValue);
        }

        // Extract name/email
        if (data.name) {
          adminName = data.name;
        } else if (data.data && data.data.name) {
          adminName = data.data.name;
        } else if (data.admin && data.admin.name) {
          adminName = data.admin.name;
        } else if (data.email) {
          adminName = data.email;
        } else if (data.data && data.data.email) {
          adminName = data.data.email;
        } else if (data.admin && data.admin.email) {
          adminName = data.admin.email;
        }

        setCurrentAdminRole(adminRole);
        setCurrentAdminName(adminName);
        
        localStorage.setItem("adminRole", adminRole.toString());
        localStorage.setItem("adminName", adminName);
        
        if (data.email) {
          localStorage.setItem("adminEmail", data.email);
        } else if (data.data && data.data.email) {
          localStorage.setItem("adminEmail", data.data.email);
        } else if (data.admin && data.admin.email) {
          localStorage.setItem("adminEmail", data.admin.email);
        }
      } else {
        const storedRole = localStorage.getItem("adminRole") || 1;
        const storedName = localStorage.getItem("adminName") || localStorage.getItem("adminEmail") || "Admin";
        setCurrentAdminRole(parseInt(storedRole));
        setCurrentAdminName(storedName);
      }
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      const storedRole = localStorage.getItem("adminRole") || 1;
      const storedName = localStorage.getItem("adminName") || localStorage.getItem("adminEmail") || "Admin";
      setCurrentAdminRole(parseInt(storedRole));
      setCurrentAdminName(storedName);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/stats", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Server returned an invalid response.");
      }

      if (response.ok) {
        let statsData = data;
        
        if (data.data) {
          statsData = data.data;
        }
        
        if (data.stats) {
          statsData = data.stats;
        }

        const formattedStats = {
          totalUsers: statsData.totalUsers || statsData.users || statsData.total_users || 0,
          totalBookings: statsData.totalBookings || statsData.bookings || statsData.total_bookings || 0,
          activeBookings: statsData.activeBookings || statsData.active_bookings || 0,
          totalMessages: statsData.totalMessages || statsData.messages || statsData.total_messages || 0,
          totalPartners: statsData.totalPartners || statsData.partners || statsData.total_partners || 0,
        };

        setStats(formattedStats);
      } else {
        throw new Error(data.error || data.message || `HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStats({
        totalUsers: 0,
        totalBookings: 0,
        activeBookings: 0,
        totalMessages: 0,
        totalPartners: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTabs = () => {
    const baseTabs = [
      { id: "bookings", name: "Bookings Management" },
      { id: "users", name: "Users Management" },
      { id: "messages", name: "Messages" },
      { id: "partners", name: "Partners Management" },
      { id: "complimentNote", name: "Compliment Note" },
    ];

    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole === 0) {
      // Insert Admin Management tab after Users Management
      const tabsWithAdmin = [...baseTabs];
      tabsWithAdmin.splice(2, 0, { id: "admins", name: "Admin Management" });
      return tabsWithAdmin;
    }

    return baseTabs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {currentAdminName}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="bg-gray-200 p-3 rounded-full mr-4">
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = getTabs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentAdminName}
              </span>
              <button 
                onClick={() => {
                  fetchAdminProfile();
                  fetchDashboardStats();
                }}
                className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1 rounded"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="📅"
            color="green"
          />
          <StatCard
            title="Active Bookings"
            value={stats.activeBookings}
            icon="🏨"
            color="purple"
          />
          <StatCard
            title="Messages"
            value={stats.totalMessages}
            icon="💬"
            color="yellow"
          />
          <StatCard
            title="Total Partners"
            value={stats.totalPartners}
            icon="🤝"
            color="indigo"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-cyan-500 text-cyan-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "bookings" && <BookingsManagement currentAdminRole={currentAdminRole} />}
            {activeTab === "users" && <UsersManagement currentAdminRole={currentAdminRole} />}
            {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
            {activeTab === "admins" && currentAdminRole === 0 && <AdminManagement currentAdminRole={currentAdminRole} />}
            {activeTab === "messages" && <MessagesManagement currentAdminRole={currentAdminRole} />}
            {activeTab === "partners" && <PartnersManagement currentAdminRole={currentAdminRole} />}
            {activeTab === "complimentNote" && <ComplimentNoteModal />}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} mr-4`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ComplimentNoteModal = () => {
  const [accommodations, setAccommodations] = useState([
    "Executive Room, Ensuite",
    "2-Connected Room, 1 Ensuite",
    "2 Bedroom Apartment - Living + Kitchen + 1 Ensuite",
    "3-BedRoom Apartment-Kitchen, 2 Ensuite",
    "ExecutiveRoom, Ensuite",
    "2-Connected Room, I-Ensuite",
    "2-BedRoom Apartment with Kitchen, 1-Ensuite",
    "Larger Apartment with Kitchen, Balcony, Living, 2 Ensuites"
  ]);
  const [location, setLocation] = useState("South Coast, Kenya — Near Diani Beach");
  const [contact, setContact] = useState({
    phone: "+254 7XX XXX XXX",
    email: "info@southcoastoutdoors.co.ke",
  });

  const noteRef = useRef();

  const handlePrint = () => {
    const printContents = noteRef.current.innerHTML;
    const printWindow = window.open("", "", "width=600,height=800");
    printWindow.document.write(`
      <html>
        <head>
          <title>Southcoast Outdoors With Compliments</title>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              padding: 24px;
              background-color: #fdfdfc;
            }
            .note-container {
              border: 1px solid #e2e8f0;
              border-radius: 18px;
              padding: 24px;
              width: 100%;
              max-width: 480px;
              margin: auto;
              box-shadow: 0 3px 10px rgba(0,0,0,0.08);
              background-color: white;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 14px;
              border-bottom: 2px solid #f3f4f6;
              padding-bottom: 10px;
              margin-bottom: 12px;
            }
            .header img {
              width: 65px;
              height: 65px;
              border-radius: 14px;
            }
            .header h1 {
              font-size: 1.4rem;
              color: #003366;
              margin: 0;
              line-height: 1.3;
            }
            .header span {
              font-size: 0.95rem;
              color: #6b7280;
            }
            .section {
              margin-top: 1rem;
            }
            .section h2 {
              font-size: 1.1rem;
              color: #0074cc;
              margin-bottom: 6px;
              border-bottom: 1px solid #e5e7eb;
              display: inline-block;
            }
            .section p {
              margin: 2px 0;
              font-size: 0.96rem;
              color: #374151;
            }
            footer {
              margin-top: 1.8rem;
              text-align: center;
              font-size: 0.85rem;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAddAccommodation = (newItem) => {
    if (newItem.trim()) setAccommodations([...accommodations, newItem]);
  };

  return (
    <div className="font-poppins">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          ref={noteRef}
          className="note-container border border-gray-200 rounded-xl p-6 shadow-sm bg-white"
        >
          <div className="header flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
            <img src={logo} alt="Southcoast Outdoors Logo" className="w-16 h-16 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-blue-900 leading-tight">
                Southcoast Outdoors
              </h1>
              <span className="text-gray-500 text-sm">With Compliments</span>
            </div>
          </div>

          <div className="section mb-4">
            <h2 className="text-blue-700 font-semibold mb-2 pb-1 border-b border-gray-200">Our Accommodations</h2>
            {accommodations.map((unit, idx) => (
              <p key={idx} className="text-gray-700 mb-1">• {unit}</p>
            ))}
          </div>

          <div className="section mb-4">
            <h2 className="text-blue-700 font-semibold mb-2 pb-1 border-b border-gray-200">Our Location</h2>
            <p className="text-gray-700">{location}</p>
          </div>

          <div className="section mb-4">
            <h2 className="text-blue-700 font-semibold mb-2 pb-1 border-b border-gray-200">Contact Us</h2>
            <p className="text-gray-700">Tel: {contact.phone}</p>
            <p className="text-gray-700">Email: {contact.email}</p>
          </div>

          <footer className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4 mt-6">
            Thank you for choosing Southcoast Outdoors
          </footer>
        </div>

        <div className="space-y-4">
          <h3 className="text-blue-800 font-semibold text-lg mb-4">Edit Note Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Add Accommodation</label>
            <input
              type="text"
              placeholder="e.g. Family Villas"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddAccommodation(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Location</label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              className="border border-gray-300 rounded-lg w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </div>

          <button
            onClick={handlePrint}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            Print Note
          </button>
        </div>
      </div>
    </div>
  );
};

const PartnersManagement = ({ currentAdminRole }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/partners", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        setPartners(data);
      } else {
        console.error("Failed to fetch partners:", response.status);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partner) => {
    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole === 0 || partner.status !== "active") {
      setEditingPartner(partner);
      setShowForm(true);
    } else {
      alert("You don't have permission to edit active partners. Only Super Admin can edit active partners.");
    }
  };

  const handleDelete = async (partnerId) => {
    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole !== 0) {
      alert("Only Super Admin can delete partners.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this partner?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/partners/${partnerId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Partner deleted successfully!");
        fetchPartners();
      } else {
        alert("Failed to delete partner");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Failed to delete partner");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingPartner
        ? `https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/partners/${editingPartner.id}`
        : "https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/partners";

      const method = editingPartner ? "PUT" : "POST";
      
      const submitData = { ...formData };
      if (editingPartner) {
        if (!submitData.password) {
          delete submitData.password;
          delete submitData.password_confirmation;
        }
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ partner: submitData }),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Server returned an invalid response.");
      }

      if (response.ok) {
        alert(`Partner ${editingPartner ? 'updated' : 'created'} successfully!`);
        setShowForm(false);
        setEditingPartner(null);
        fetchPartners();
      } else {
        throw new Error(result.errors?.join(', ') || result.error || 'Failed to save partner');
      }
    } catch (error) {
      console.error("Error saving partner:", error);
      alert(`Failed to save partner: ${error.message}`);
    }
  };

  const togglePartnerStatus = async (partnerId, currentStatus) => {
    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole !== 0) {
      alert("Only Super Admin can change partner status.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/partners/${partnerId}/toggle_status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Partner status updated successfully!");
        fetchPartners();
      } else {
        alert("Failed to update partner status");
      }
    } catch (error) {
      console.error("Error updating partner status:", error);
      alert("Failed to update partner status");
    }
  };

  if (loading) return <div className="text-center py-8">Loading partners...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Partners Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Add New Partner
        </button>
      </div>

      {showForm && (
        <PartnerForm
          partner={editingPartner}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPartner(null);
          }}
          currentAdminRole={currentAdminRole}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {partners.length > 0 ? partners.map((partner) => (
              <tr key={partner.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{partner.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {partner.supplier_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {partner.supplier_type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.contact_person}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.mobile}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {partner.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    partner.status === 'active' ? 'bg-green-100 text-green-800' : 
                    partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {partner.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(partner.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(partner)}
                    className="text-cyan-600 hover:text-cyan-900"
                    disabled={currentAdminRole !== 0 && partner.status === "active"}
                  >
                    Edit
                  </button>
                  {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
                  {currentAdminRole === 0 && (
                    <>
                      <button
                        onClick={() => togglePartnerStatus(partner.id, partner.status)}
                        className={`${
                          partner.status === 'active' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {partner.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(partner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
                  No partners found or unable to load partners.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PartnerForm = ({ partner, onSubmit, onCancel, currentAdminRole }) => {
  const [formData, setFormData] = useState({
    supplier_type: partner?.supplier_type || "",
    supplier_name: partner?.supplier_name || "",
    mobile: partner?.mobile || "",
    email: partner?.email || "",
    contact_person: partner?.contact_person || "",
    password: "",
    password_confirmation: "",
    description: partner?.description || "",
    city: partner?.city || "",
    address: partner?.address || "",
    status: partner?.status || "pending",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_type) newErrors.supplier_type = 'Supplier type is required';
    if (!formData.supplier_name) newErrors.supplier_name = 'Supplier name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.contact_person) newErrors.contact_person = 'Contact person is required';
    if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.address) newErrors.address = 'Address is required';

    if (!partner) {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password && formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {partner ? 'Edit Partner' : 'Add New Partner'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier Type *</label>
            <select
              name="supplier_type"
              value={formData.supplier_type}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.supplier_type ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select supplier type</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="tour_operator">Tour Operator</option>
              <option value="transport">Transport Service</option>
              <option value="activity">Activity Provider</option>
              <option value="travel_agency">Travel Agency</option>
              <option value="other">Other</option>
            </select>
            {errors.supplier_type && (
              <p className="mt-1 text-sm text-red-600">{errors.supplier_type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier Name *</label>
            <input
              type="text"
              name="supplier_name"
              value={formData.supplier_name}
              onChange={handleChange}
              placeholder="Enter your business name"
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.supplier_name ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.supplier_name && (
              <p className="mt-1 text-sm text-red-600">{errors.supplier_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile *</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+254712345678"
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.mobile ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person *</label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Enter your name"
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.contact_person ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.contact_person && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_person}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password {!partner && '*'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={partner ? "Leave blank to keep current password" : "Enter your password"}
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                required={!partner}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password {!partner && '*'}
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                placeholder="Repeat your password"
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                }`}
                required={!partner}
              />
              {errors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your business"
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
                disabled={currentAdminRole !== 0}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
              {currentAdminRole !== 0 && (
                <p className="mt-1 text-xs text-gray-500">Only Super Admin can change status</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="2"
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-md transition"
            >
              {partner ? 'Update' : 'Create'} Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookingsManagement = ({ currentAdminRole }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [nationalities, setNationalities] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);

  useEffect(() => {
    fetchBookings();
    fetchNationalities();
    fetchRoomTypes();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/bookings", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        setBookings(data);
      } else {
        console.error("Failed to fetch bookings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNationalities = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/nationalities", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setNationalities([
          { id: 1, name: "Kenyan" },
          { id: 2, name: "American" },
          { id: 3, name: "British" },
          { id: 4, name: "Canadian" },
          { id: 5, name: "German" },
          { id: 6, name: "French" },
          { id: 7, name: "Chinese" },
          { id: 8, name: "Indian" },
        ]);
        return;
      }
      
      if (response.ok) {
        setNationalities(data);
      } else {
        setNationalities([
          { id: 1, name: "Kenyan" },
          { id: 2, name: "American" },
          { id: 3, name: "British" },
          { id: 4, name: "Canadian" },
          { id: 5, name: "German" },
          { id: 6, name: "French" },
          { id: 7, name: "Chinese" },
          { id: 8, name: "Indian" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching nationalities:", error);
      setNationalities([
        { id: 1, name: "Kenyan" },
        { id: 2, name: "American" },
        { id: 3, name: "British" },
        { id: 4, name: "Canadian" },
        { id: 5, name: "German" },
        { id: 6, name: "French" },
        { id: 7, name: "Chinese" },
        { id: 8, name: "Indian" },
      ]);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/room_types", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setRoomTypes([
          { id: 1, name: "Single Room" },
          { id: 2, name: "Double Room" },
          { id: 3, name: "Deluxe Room" },
          { id: 4, name: "Suite" },
          { id: 5, name: "Executive Suite" },
        ]);
        return;
      }
      
      if (response.ok) {
        setRoomTypes(data);
      } else {
        setRoomTypes([
          { id: 1, name: "Single Room" },
          { id: 2, name: "Double Room" },
          { id: 3, name: "Deluxe Room" },
          { id: 4, name: "Suite" },
          { id: 5, name: "Executive Suite" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
      setRoomTypes([
        { id: 1, name: "Single Room" },
        { id: 2, name: "Double Room" },
        { id: 3, name: "Deluxe Room" },
        { id: 4, name: "Suite" },
        { id: 5, name: "Executive Suite" },
      ]);
    }
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleDelete = async (bookingId) => {
    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole !== 0) {
      alert("Only Super Admin can delete bookings.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Booking deleted successfully!");
        fetchBookings();
      } else {
        alert("Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking");
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("adminToken");
      const url = editingBooking
        ? `https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/bookings/${editingBooking.id}`
        : "https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/bookings";

      const response = await fetch(url, {
        method: editingBooking ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ booking: formData }),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Server returned an invalid response.");
      }

      if (response.ok) {
        alert(`Booking ${editingBooking ? 'updated' : 'created'} successfully!`);
        setShowForm(false);
        setEditingBooking(null);
        fetchBookings();
      } else {
        throw new Error(result.error || result.errors?.join(', ') || 'Failed to save booking');
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      alert(`Failed to save booking: ${error.message}`);
    }
  };

  if (loading) return <div className="text-center py-8">Loading bookings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Create New Booking
        </button>
      </div>

      {showForm && (
        <BookingForm
          booking={editingBooking}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingBooking(null);
          }}
          nationalities={nationalities}
          roomTypes={roomTypes}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Room Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.length > 0 ? bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{booking.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.user?.email || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.room_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(booking)}
                    className="text-cyan-600 hover:text-cyan-900"
                  >
                    Edit
                  </button>
                  {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
                  {currentAdminRole === 0 && (
                    <button
                      onClick={() => handleDelete(booking.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No bookings found or unable to load bookings.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BookingForm = ({ booking, onSubmit, onCancel, nationalities, roomTypes }) => {
  const [formData, setFormData] = useState({
    user_id: booking?.user_id || "",
    room_type: booking?.room_type || "",
    check_in: booking?.check_in || "",
    check_out: booking?.check_out || "",
    guests: booking?.guests || 1,
    nationality: booking?.nationality || "",
    status: booking?.status || "confirmed",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">
          {booking ? 'Edit Booking' : 'Create New Booking'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="number"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Room Type</label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              required
            >
              <option value="">Select Room Type</option>
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.name}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-in</label>
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-out</label>
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Guests</label>
              <input
                type="number"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="1"
                max="20"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
              required
            >
              <option value="">Select Nationality</option>
              {nationalities.map((nationality) => (
                <option key={nationality.id} value={nationality.name}>
                  {nationality.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-md transition"
            >
              {booking ? 'Update' : 'Create'} Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UsersManagement = ({ currentAdminRole }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        setUsers(data);
      } else {
        console.error("Failed to fetch users:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole !== 0) {
      alert("Only Super Admin can delete users.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("User deleted successfully!");
        fetchUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) return <div className="text-center py-8">Loading users...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Users Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
              {currentAdminRole === 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length > 0 ? users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{user.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
                {currentAdminRole === 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
                <td colSpan={currentAdminRole === 0 ? "5" : "4"} className="px-6 py-4 text-center text-sm text-gray-500">
                  No users found or unable to load users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminManagement = ({ currentAdminRole }) => {
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/admins", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        setAdmins(data);
      } else {
        console.error("Failed to fetch admins:", response.status);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (formData) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ admin: formData }),
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Server returned an invalid response.");
      }

      if (response.ok) {
        alert("Admin created successfully!");
        setShowForm(false);
        fetchAdmins();
      } else {
        throw new Error(result.errors?.join(', ') || result.error || 'Failed to create admin');
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      alert(`Failed to create admin: ${error.message}`);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/admins/${adminId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Admin deleted successfully!");
        fetchAdmins();
      } else {
        alert("Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Failed to delete admin");
    }
  };

  if (loading) return <div className="text-center py-8">Loading admins...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Admin Management</h2>
        {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
        {currentAdminRole === 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-md text-sm"
          >
            Add New Admin
          </button>
        )}
      </div>

      {showForm && (
        <AdminForm
          onSubmit={handleCreateAdmin}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admin ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
              {currentAdminRole === 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.length > 0 ? admins.map((admin) => (
              <tr key={admin.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{admin.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {admin.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {admin.role === 0 ? 'super_admin' : 'admin'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
                {currentAdminRole === 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
                <td colSpan={currentAdminRole === 0 ? "5" : "4"} className="px-6 py-4 text-center text-sm text-gray-500">
                  No admins found or unable to load admins.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    role: 1, // Always set to admin (1)
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Create New Admin</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter admin email address"
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              minLength="6"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm password"
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 ${
                errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
              }`}
              required
              minLength="6"
            />
            {errors.password_confirmation && (
              <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
            )}
          </div>

          {/* Hidden role field - always set to admin (1) */}
          <input type="hidden" name="role" value={1} />

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This admin will be created with <strong>Admin</strong> role. Only existing Super Admin can create other admins.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-md transition"
            >
              Create Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MessagesManagement = ({ currentAdminRole }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        console.error("No admin token found");
        setLoading(false);
        return;
      }

      const response = await fetch("https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/messages", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        setMessages(data);
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    // FIX: Check for numeric 0 (super_admin) instead of string "super_admin"
    if (currentAdminRole !== 0) {
      alert("Only Super Admin can delete messages.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`https://backend-southcoastwebmain-1.onrender.com/api/v1/admin/messages/${messageId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert("Message deleted successfully!");
        fetchMessages();
      } else {
        alert("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  if (loading) return <div className="text-center py-8">Loading messages...</div>;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Messages Management</h2>
      <div className="space-y-4">
        {messages.length > 0 ? messages.map((message) => (
          <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{message.name}</h3>
                <p className="text-sm text-gray-500">{message.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  {new Date(message.created_at).toLocaleDateString()} at{" "}
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                  message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                  message.status === 'read' ? 'bg-gray-100 text-gray-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {message.status}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{message.message}</p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="text-sm text-cyan-600 hover:text-cyan-800">
                  Mark as {message.status === 'read' ? 'Unread' : 'Read'}
                </button>
                <button className="text-sm text-green-600 hover:text-green-800">
                  Reply
                </button>
              </div>
              {/* FIX: Check for numeric 0 (super_admin) instead of string "super_admin" */}
              {currentAdminRole === 0 && (
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            No messages found or unable to load messages.
          </div>
        )}
      </div>
    </div>
  );
};