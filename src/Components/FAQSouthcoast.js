import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Where is Southcoast Airbnb located?",
    answer:
      "We are located along the quieter side of Diani, on the scenic Diani Beach Road—just 300 meters from the award-winning Diani Beach and the Indian Ocean.",
  },
  {
    question: "What accommodation options are available?",
    answer:
      "We offer a variety of options, including Executive Rooms, Connected Rooms for families, and Apartments with kitchens and multiple ensuites—perfect for short or long stays.",
  },
  {
    question: "How far is the beach from the property?",
    answer:
      "The beautiful Diani Beach is only 300 meters from our property, allowing easy access for swimming, sunbathing, or water sports.",
  },
  {
    question: "What amenities are available on-site?",
    answer:
      "We provide a swimming pool, free parking, five kitchens (including private and shared options), and arrangements for activities like snorkeling, scuba diving, dhow cruises, and organized safaris.",
  },
  {
    question: "Can I cook my own meals or hire a private chef?",
    answer:
      "Yes! Guests can prepare their own meals in our fully equipped kitchens or request a private chef to prepare local or international cuisine upon arrangement.",
  },
  {
    question: "Do you offer family or group booking options?",
    answer:
      "Absolutely. We offer connected rooms and multi-bedroom apartments ideal for families and groups traveling together.",
  },
  {
    question: "Are your rates fixed throughout the year?",
    answer:
      "Our rates are seasonally adjusted to ensure fair pricing based on travel periods. Please contact us directly for the latest seasonal offers.",
  },
  {
    question: "What activities can I book during my stay?",
    answer:
      "We can arrange a wide range of activities, including kite surfing, snorkeling, scuba diving, evening dhow cruises, and safari tours to major national parks.",
  },
  {
    question: "Do you provide airport transfers or transport services?",
    answer:
      "Yes, airport transfers and transport arrangements can be organized upon request for your convenience.",
  },
  {
    question: "How can I contact Southcoast Airbnb?",
    answer:
      "You can reach us via email at southcoastoutdoors25@gmail.com or call us at +254 729 491 343. Direct booking links are also available on our website.",
  },
];

const FAQSouthcoast = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FAQs</h1>
        <h2 className="text-red-600 font-semibold uppercase text-sm mb-6">
          Frequently Asked Questions (FAQs)
        </h2>

        <div className="divide-y divide-gray-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="text-gray-800 font-medium">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSouthcoast;
