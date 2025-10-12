import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const terms = [
  {
    title: "Acceptance of Terms",
    content:
      "By booking accommodation or using services at Southcoast Outdoors, guests agree to abide by these Terms and Conditions, as well as any additional rules communicated during their stay. Failure to comply may result in termination of stay without refund.",
  },
  {
    title: "Booking Confirmation",
    content:
      "A booking is confirmed once the required deposit has been received. Guests will receive a booking confirmation via email or SMS. Southcoast Outdoors reserves the right to cancel unconfirmed bookings after 24 hours if payment is not received.",
  },
  {
    title: "Payment Terms",
    content:
      "Payments can be made via mobile money, debit/credit card, or bank transfer. Full payment is required upon arrival unless otherwise agreed in writing. All prices are quoted in USD or equivalent local currency.",
  },
  {
    title: "Check-In and Check-Out",
    content:
      "Standard check-in time is 2:00 PM, and check-out time is 11:00 AM. Early check-in or late check-out may be arranged depending on availability and may attract additional charges.",
  },
  {
    title: "Cancellation and Refunds",
    content:
      "Cancellations made more than 7 days before the check-in date will receive a full refund. Cancellations within 7 days will forfeit 50% of the booking amount. No-shows will be charged the full amount of the stay.",
  },
  {
    title: "Guest Responsibilities",
    content:
      "Guests are expected to respect other guests, staff, and property. Any form of damage, misconduct, or illegal activity will result in immediate eviction and possible charges for repair or replacement costs.",
  },
  {
    title: "Use of Facilities",
    content:
      "Guests may use common facilities such as the swimming pool, parking area, and kitchens as specified. The management is not responsible for injuries or accidents that occur due to negligence or misuse of facilities.",
  },
  {
    title: "Liability Disclaimer",
    content:
      "Southcoast Outdoors shall not be liable for loss, theft, or damage to personal belongings. Guests are advised to secure valuables and use safety deposit options when available.",
  },
  {
    title: "Modification of Terms",
    content:
      "Southcoast Outdoors reserves the right to modify these Terms and Conditions at any time. Updates will be posted on our official communication platforms and will take effect immediately upon publication.",
  },
  {
    title: "Governing Law",
    content:
      "These Terms and Conditions are governed by the laws of Kenya. Any disputes arising shall be handled under the jurisdiction of Kenyan courts.",
  },
];

const TermsSouthcoast = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleTerm = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
        <h2 className="text-red-600 font-semibold uppercase text-sm mb-6">
          Southcoast Outdoors Guest Terms
        </h2>

        <div className="divide-y divide-gray-200">
          {terms.map((term, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => toggleTerm(index)}
                className="w-full flex justify-between items-center text-left focus:outline-none"
              >
                <span className="text-gray-800 font-medium">{term.title}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <p className="mt-3 text-gray-700 leading-relaxed">{term.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsSouthcoast;
