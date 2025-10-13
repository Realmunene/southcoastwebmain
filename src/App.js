import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from "react";

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

const App = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Router>
      <ScrollToTop />
      <div className="App flex flex-col min-h-screen">
        {/* 🔝 Top Bar & Navigation */}
        <Topcon />
        <Navbar
          onLoginClick={() => setShowLogin(true)}
          onPartnerClick={() => setActiveSection("partner")}
          setActiveSection={setActiveSection}
        />

        {/* 🏡 Main Content */}
        <main className="flex-grow">
          <Routes>
            {/* 🏠 Default Home Route */}
            <Route
              path="/southcoastwebmain"
              element={
                <>
                  {activeSection === "home" && (
                    <>
                      <div id="home">
                        <Home />
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
            <Route path="/partnership" element = {<PartnerRegistrationForm/>}/>
            <Route path="/contact" element = {<ContactSection/>}/>
            <Route path='/loginform' element={<LoginForm/>}/>
          </Routes>

          {/* 🪟 Login Popup */}
          {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
        </main>

        {/* 🦶 Footer */}
        <Footer setActiveSection={setActiveSection} />
      </div>
    </Router>
  );
};

export default App;
