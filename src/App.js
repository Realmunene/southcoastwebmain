import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Footer from './Components/Footer';
import Home from './Components/Home';
import Gallery from './Components/Gallery';
import Package from './Components/Package';
import React, { useState } from "react";
import Navbar from './Components/Navbar';
import Topcon from './Components/Topcon';
import MapComponent from './Components/MapComponent';
import ContactSection from './Components/ContactSection';
import PartnerRegistrationForm from './Components/PartnerRegistrationForm';
import LoginPopup from './Components/LoginPopup';



const App = () => {
  // ✅ Function to smoothly scroll to section by ID
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setShowMenu(false);
  };
  const [showMenu, setShowMenu] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
const [showContact, setShowContact] = useState(false);
const handleContactClick = () => {
  setShowContact(true);
  window.scrollTo({top:0,behavior:"smooth"});
};
const [activeSection, setActiveSection] = useState("home");
const [showLogin, setShowLogin] = useState(false);
  return (
    <Router>
      <div className="App">

        {/* 🟢 TOP CONTACT & SOCIAL BAR */}
                <Topcon />
                <Navbar 
                onLoginClick={()=> setShowLogin(true)}
               onPartnerClick = { ()=> setActiveSection("partner")} 
               setActiveSection={setActiveSection}
              />
                  
        {/* 🏡 CONTENT SECTIONS WITH IDS */}
        
       <div>
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

      {activeSection === "contact" && <ContactSection />}
      {activeSection === "partner" && <PartnerRegistrationForm />}
      {activeSection === "package" && <Package />}
      {showLogin && <LoginPopup onClose={() => setShowLogin (false)}/>}
       
      <Footer setActiveSection={setActiveSection} />
       </div>
       
      </div>

      <main className="main-content">
        <Routes>
         
          <Route path="/package"  element={<Package />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </main>
    </Router>
    
  );
}

export default App;
