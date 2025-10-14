import React from "react";

const ContactSection = () => {
  return (
    <section className="bg-cyan-500 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-4xl font-bold mb-2">Get in Touch</h2>
          <p className="text-black max-w-2xl mx-auto">
            We're here to support you — whether you prefer a quick call or chatting with our team online.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Talk to Sales */}
          <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-cyan-500 text-white p-3 rounded-full text-xl">
                <i className="fas fa-phone-alt"></i>
              </div>
              <h3 className="text-xl font-semibold">Talk to Sales</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Interested in HubSpot's software? Just pick up the phone to chat with a member of our sales team.
            </p>
            <a
              href="tel:+254729491343"
              className="text-[#0d1b2a] font-semibold underline hover:text-[#1b263b]"
            >
              +254729491343
            </a>
            <a
              href="mailto:southcoastoutdoors25@gmail.com"
              className="text-sm text-blue-600 mt-2 hover:underline"
            >
              Send Email
            </a>
          </div>

          {/* Contact Customer Support */}
          <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition duration-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-cyan-500 text-white p-3 rounded-full text-xl">
                <i className="fas fa-headset"></i>
              </div>
              <h3 className="text-xl font-semibold">Contact Customer Support</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Not a customer yet? No worries. Our friendly team is here to help answer your questions.
            </p>
            <button className="bg-cyan-500 hover:bg-cyan-700 text-white font-semibold px-6 py-3 rounded-lg w-fit">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
