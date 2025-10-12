import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const policies = [
  {
    title: "Check-In and Check-Out Policy",
    content:
      "Check-in time is from 2:00 PM, and check-out is by 11:00 AM. Early check-ins or late check-outs can be arranged based on availability. Please inform us in advance to accommodate your request.",
  },
  {
    title: "Reservation and Payment Policy",
    content:
      "A confirmed reservation requires a deposit payment. The remaining balance is payable upon arrival. We accept major payment methods including mobile money, debit cards, and bank transfers.",
  },
  {
    title: "Cancellation Policy",
    content:
      "Cancellations made more than 7 days before the arrival date will be fully refunded. Cancellations within 7 days may attract a 50% charge. No-shows will be charged the full booking amount.",
  },
  {
    title: "Children and Extra Beds Policy",
    content:
      "Children of all ages are welcome. Extra beds or baby cots can be arranged upon request depending on availability. Additional charges may apply for extra occupants.",
  },
  {
    title: "Pet Policy",
    content:
      "Pets are not allowed within the premises to maintain hygiene and comfort for all guests. Service animals are allowed with prior notice and supporting documentation.",
  },
  {
    title: "Smoking and Noise Policy",
    content:
      "Smoking is permitted only in designated outdoor areas. Guests are requested to keep noise to a minimum, especially between 10:00 PM and 7:00 AM, to respect the tranquility of our environment.",
  },
  {
    title: "Pool and Facility Use",
    content:
      "Guests may use the swimming pool and other shared facilities during operating hours. Proper swimwear is required. Children must be supervised at all times by an adult.",
  },
  {
    title: "Damage and Liability Policy",
    content:
      "Any damage to property caused by negligence or misconduct will be charged to the responsible guest. Southcoast Outdoors is not liable for loss of valuables left unattended in rooms or public areas.",
  },
  {
    title: "Environmental and Community Policy",
    content:
      "We promote sustainability by minimizing plastic use, supporting local suppliers, and conserving water and energy. Guests are encouraged to participate in our eco-friendly practices.",
  },
  {
    title: "Privacy and Data Protection Policy",
    content:
      "Guest information is handled with confidentiality and used only for booking and service purposes. We do not share personal data with third parties without consent.",
  },
];

const PolicySouthcoast = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const togglePolicy = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Policy</h1>
        <h2 className="text-cyan-800 font-bold uppercase text-sm mb-6">
          Southcoast Outdoors Policies
        </h2>

        <div className="divide-y divide-gray-200">
          {policies.map((policy, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => togglePolicy(index)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="text-gray-800 font-medium">{policy.title}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <p className="mt-3 text-gray-700 leading-relaxed">
                  {policy.content}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PolicySouthcoast;
