import './App.css';
import './i18n'; // Add this import
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from "react";

// 🧩 Components
import Footer from './Components/Footer';
import Home from './Components/Home';
import Gallery from './Components/Gallery';
import Package from './Components/Package';
import Navbar from './Components/Navbar';
import Topcon from './Components/Topcon';
import MapComponent from './Components/MapComponent';
import ContactSection from './Components/ContactSection';
import PartnerRegistrationForm from './Components/PartnerRegistrationForm';
import LoginPopup from './Components/LoginPopup';
import AboutSouthcoast from './Components/Aboutus';
import FaqSouthcoast from "./Components/FAQSouthcoast";
import PolicySouthcoast from "./Components/PolicySouthcoast";
import TermsSouthcoast from "./Components/TermsSouthcoast";
import ScrollToTop from './Components/ScrollToTop';
import LoginForm from './Components/LoginForm';
import MyBookings from './Components/MyBookings';
import BookingSearch from './Components/BookingSearch';
import PackagePage from './Components/PackagePage';
import AdminDashboard from './Components/AdminDashboard';

const App = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [showLogin, setShowLogin] = useState(false);

  // Persist user to localStorage so the logged-in state survives refresh
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Called when a component requires login
  const handleRequireLogin = () => setShowLogin(true);

  // Called after login success
  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    setShowLogin(false);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
  };

  const [admin, setAdmin] = useState(null);

  // Check for existing admin session on component mount
  useEffect(() => {
    const checkAdminSession = () => {
      const adminToken = localStorage.getItem('adminToken');
      const adminEmail = localStorage.getItem('adminEmail');
      const adminRole = localStorage.getItem('adminRole');
      const adminName = localStorage.getItem('adminName');
      
      if (adminToken && adminEmail) {
        setAdmin({
          email: adminEmail,
          role: adminRole || 'admin',
          name: adminName || adminEmail.split('@')[0],
          token: adminToken
        });
      } else {
        setAdmin(null);
      }
    };

    // Check immediately
    checkAdminSession();
    
    // Also check when the route changes
    const interval = setInterval(checkAdminSession, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogin = (adminData) => {
    console.log("handleAdminLogin called with:", adminData);
    setAdmin(adminData);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminName');
    setAdmin(null);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleCloseLoginModal = () => {
    setShowLogin(false);
  };

  const handleUserLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleUserLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Protected Route Component for Admin
  const ProtectedAdminRoute = ({ children }) => {
    const adminToken = localStorage.getItem('adminToken');
    return adminToken ? children : <Navigate to="/admin/login" replace />;
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="App flex flex-col min-h-screen">
        {/* 🔝 Top Bar & Navigation */}
        <Topcon />
        <Navbar
          user={user}
          onLoginClick={() => setShowLogin(true)}
          onLogout={handleLogout}
          onPartnerClick={() => setActiveSection("partner")}
          setActiveSection={setActiveSection}
          admin={admin}
          onAdminLogout={handleAdminLogout}
        />

        {/* 🏡 Main Content */}
        <main className="flex-grow">
          <Routes>
            {/* 🏠 Default Home Route */}
            <Route
              path="/"
              element={
                <>
                  {activeSection === "home" && (
                    <>
                      <div id="home">
                        <Home 
                          user={user} 
                          onRequireLogin={handleRequireLogin}
                        />
                      </div>
                      <div id="package">
                        <Package />
                      </div>
                      <div id="gallery">
                        <Gallery />
                      </div>
                      <MapComponent />
                    </>
                  )}

                  {activeSection === "partner" && <PartnerRegistrationForm />}
                  {activeSection === "contact" && <ContactSection />}
                </>
              }
            />

            {/* 🧭 Other Pages */}
            <Route path="/about" element={<AboutSouthcoast />} />
            <Route path="/faqs" element={<FaqSouthcoast />} />
            <Route path="/policy" element={<PolicySouthcoast />} />
            <Route path="/terms" element={<TermsSouthcoast />} />
            <Route path="/package" element={<Package />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/partnership" element={<PartnerRegistrationForm />} />
            <Route path="/contact" element={<ContactSection />} />
            <Route path='/loginform' 
            onAdminLogin= {handleAdminLogin}
            element={<LoginForm />} />
            <Route path='/packagepage/:roomTitle' element={<PackagePage
            onLoginClick={handleLoginClick} 
            user={user} 
            onLogout={handleLogout}
            />}/>
            <Route path='/firstlogin' element={<LoginPopup/>}/>
            <Route path='/admin/dashboard' element ={<AdminDashboard/>}/>
            {/* ✅ MyBookings Route with user prop */}
            <Route 
              path="/mybookings" 
              element={<MyBookings user={user} />} 
            />
          </Routes>

          {/* 🪟 Login Popup */}
          {showLogin && (
            <LoginPopup
              onClose={() => setShowLogin(false)}
              onLoginSuccess={handleLoginSuccess}
            />
          )}
        </main>

        {/* 🦶 Footer */}
        <Footer setActiveSection={setActiveSection} />
      </div>
    </Router>
  );
};

export default App;