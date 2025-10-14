import React from 'react'

const Aboutus = () => {
  return (
   <div className="bg-gray-50 min-h-screen py-10 px-6 md:px-16">
      <div className="max-w-5xl mx-auto bg-white shadow-sm rounded-lg p-8 md:p-12 border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-600 text-center mb-8">
          Southcoast Outdoors: Your Coastal Escape, Our Passion
        </h1>

        {/* A Legacy of Comfort */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            A Legacy of Comfort and Coastal Charm
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Welcome to <strong>Southcoast Outdoors</strong>, your home away from
            home on the serene side of Diani. Nestled along the scenic Diani
            Beach Road, our property is just{" "}
            <strong>300 meters from the award-winning Diani Beach and the Indian Ocean</strong>,
            offering guests an unmatched blend of tranquility, accessibility,
            and comfort.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Located near the region’s long-established resorts,{" "}
            <strong>Southcoast Outdoors</strong> provides both individual and
            family-friendly accommodation, catering to a variety of needs — from
            cozy single rooms to fully equipped apartments. Whether you’re
            seeking a peaceful seaside retreat or an adventure-filled holiday,
            we ensure every guest experiences the perfect balance of relaxation
            and discovery.
          </p>
        </section>

        {/* Commitment to Excellence */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Our Commitment to Excellence
          </h2>
          <p className="text-gray-700 leading-relaxed">
            At Southcoast Outdoors, we pride ourselves on offering personalized
            hospitality where every guest feels valued. From the moment you
            arrive, our friendly and professional team is dedicated to making
            your stay as effortless and enjoyable as possible. Whether it’s
            arranging excursions, preparing special meals, or helping plan your
            daily adventures, we go above and beyond to ensure your stay exceeds
            expectations.
          </p>
        </section>

        {/* Accommodation Options */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Comprehensive Accommodation Options
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Executive Room, Ensuite – $75:</strong> Designed for
              comfort and privacy, ideal for solo travelers or couples.
            </li>
            <li>
              <strong>Two Connected Rooms, One Ensuite – $110:</strong> Perfect
              for families or small groups seeking both connection and privacy.
            </li>
            <li>
              <strong>Apartment (2BR, 1 Ensuite) – $110:</strong> Spacious
              option offering home-style comfort for families and long stays.
            </li>
            <li>
              <strong>Apartment with Kitchen (2BR, 2 Ensuites) – $125:</strong>{" "}
              Ideal for guests who prefer self-catering convenience and privacy.
            </li>
            <li>
              <strong>
                Larger Apartment – Kitchen, Balcony, Living Area, 2 Ensuites –
                $140:
              </strong>{" "}
              The ultimate stay experience, perfect for group getaways or
              extended vacations.
            </li>
          </ul>
          <p className="text-gray-600 mt-3 italic">
            *All rates are seasonally adjusted to offer the best value
            year-round.*
          </p>
        </section>

        {/* Features */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Features and Benefits
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>🏖️ Beach only 300m away from the property</li>
            <li>🏊 Swimming pool available for all guests</li>
            <li>🚗 Free parking on-site</li>
            <li>
              🍳 Five kitchens for guest use — self-made meals or private chef
              upon request
            </li>
            <li>
              ⚽ Range of sports and adventures available including kite
              surfing, snorkeling, scuba diving, dhow cruises, and safaris
            </li>
          </ul>
        </section>

        {/* Destination */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Our Destination: Diani, Kenya’s Coastal Paradise
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Located on the quieter side of Diani, our property offers guests the
            best of both worlds — serenity and accessibility. Diani Beach is
            globally recognized for its pristine white sands, turquoise waters,
            and vibrant marine life. From breathtaking sunsets to world-class
            water sports, Diani provides the perfect backdrop for romantic
            escapes, family vacations, and adventure-filled holidays.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Guests can explore local markets, beach restaurants, and cultural
            experiences that showcase the charm and warmth of Kenya’s coastal
            community.
          </p>
        </section>

        {/* Team */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Our Team: Your Hosts by the Sea
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Our team combines hospitality expertise with a deep appreciation for
            coastal living. Every team member is committed to creating a
            personalized experience for you — from warm welcomes to seamless
            arrangements and local guidance.
          </p>
        </section>

        {/* Promise */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Our Promise to You
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>🌴 Personalized service — every guest is treated like family</li>
            <li>💸 Transparent seasonal pricing with no hidden fees</li>
            <li>🕒 Flexible check-in times and activity planning</li>
            <li>🌞 Reliable comfort, cleanliness, and care</li>
            <li>💬 24/7 availability via email, mobile, or direct booking</li>
          </ul>
        </section>

        {/* Contact Info */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Booking and Contact Information
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We welcome direct bookings and inquiries through:
          </p>
          <ul className="list-none text-gray-700 mt-3 space-y-2">
            <li>
              📧 <strong>Email:</strong>{" "}
              <a
                href="mailto:southcoastoutdoors25@gmail.com"
                className="text-blue-600 hover:underline"
              >
                southcoastoutdoors25@gmail.com
              </a>
            </li>
            <li>
              📞 <strong>Mobile:</strong>{" "}
              <a
                href="tel:+254729491343"
                className="text-blue-600 hover:underline"
              >
                +254 729 491 343
              </a>
            </li>
            <li>
              📍 <strong>Location:</strong> Diani Beach Road, Diani, Kenya
            </li>
          </ul>
        </section>

        {/* Ending */}
        <section className="text-center mt-10">
          <p className="text-gray-700 leading-relaxed">
            At <strong>Southcoast Outdoors</strong>, every sunrise brings new
            experiences and every sunset marks memories worth cherishing. With
            the ocean just steps away, we invite you to relax, explore, and feel
            at home in Diani.
          </p>
          <h3 className="text-cyan-600 font-semibold mt-6 text-lg">
            Choose Southcoast Outdoors — where every stay feels like home by the
            sea.
          </h3>
        </section>
      </div>
    </div>
  );
};

export default Aboutus;
