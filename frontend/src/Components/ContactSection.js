import React, { useState } from "react";
import InstantMessage from "./InstantMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhoneAlt, faHeadset, faEnvelope, faComments } from "@fortawesome/free-solid-svg-icons";

const ContactSection = () => {
  const [showPopup, setShowPopup] = useState(false);
  
  const handleOpen = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  return (
    <section className="bg-gradient-to-br from-cyan-600 to-cyan-700 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Get in Touch
          </h2>
          <p className="text-cyan-100 text-lg max-w-3xl mx-auto leading-relaxed">
            We're here to support you — whether you prefer a quick call or chatting with our team online. 
            Our dedicated team is ready to assist you with any inquiries.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Talk to Sales Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faPhoneAlt} className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Talk to Sales</h3>
                  <div className="w-12 h-1 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Interested in our comprehensive accommodation options? Just pick up the phone to chat 
                with a member of our experienced sales team. We'll help you find the perfect stay.
              </p>

              <div className="space-y-4">
                <a
                  href="tel:+254729491343"
                  className="flex items-center gap-4 text-gray-900 hover:text-cyan-600 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                    <FontAwesomeIcon icon={faPhoneAlt} className="text-cyan-600 text-lg" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Call us at</div>
                    <div className="text-xl font-semibold group-hover:scale-105 transition-transform">
                      +254 729 491 343
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:southcoastoutdoors25@gmail.com"
                  className="flex items-center gap-4 text-gray-900 hover:text-cyan-600 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                    <FontAwesomeIcon icon={faEnvelope} className="text-cyan-600 text-lg" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Send us an email</div>
                    <div className="text-lg font-semibold group-hover:scale-105 transition-transform">
                      southcoastoutdoors25@gmail.com
                    </div>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
          </div>

          {/* Contact Customer Support Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FontAwesomeIcon icon={faHeadset} className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Support</h3>
                  <div className="w-12 h-1 bg-cyan-500 rounded-full"></div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Not a customer yet? No worries. Our friendly and knowledgeable support team is here 
                to help answer all your questions and guide you through the booking process.
              </p>

              <div className="space-y-6">
                <button 
                  onClick={handleOpen}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-4 group"
                >
                  <FontAwesomeIcon 
                    icon={faComments} 
                    className="text-white text-xl group-hover:scale-110 transition-transform" 
                  />
                  <span className="text-lg">Start Live Chat</span>
                </button>

                <div className="text-center">
                  <p className="text-gray-500 text-sm">
                    Average response time: <span className="font-semibold text-cyan-600">under 2 minutes</span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative gradient bar */}
            <div className="h-2 bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">Why Choose SouthCoast?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-cyan-100">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="font-medium">24/7 Customer Support</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="font-medium">Instant Booking Confirmation</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="font-medium">Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Message Popup */}
      {showPopup && <InstantMessage onClose={handleClose} />}
    </section>
  );
};

export default ContactSection;