import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MainNavbar from "@/components/layout/MainNavbar";
import { Footer } from "@/components/landingPage/Footer";
import {
  FileText,
  CreditCard,
  AlertTriangle,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export const TermsAndConditions = () => {
  const { hash } = useLocation();
  const [activeSection, setActiveSection] = useState("section-1");

  const navItems = [
    { id: "section-1", num: 1, title: "Agreement to Terms" },
    { id: "section-2", num: 2, title: "Reservations & Payment" },
    { id: "section-3", num: 3, title: "Cancellation & Refund Policy" },
    { id: "section-4", num: 4, title: "Itinerary Changes" },
    { id: "section-5", num: 5, title: "Travel Documents & Visas" },
    { id: "section-6", num: 6, title: "Liability & Force Majeure" },
    { id: "section-7", num: 7, title: "Code of Conduct & Safety" },
    { id: "section-8", num: 8, title: "Contact Support Desk" },
  ];

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        setTimeout(() => {
          const yOffset = -90;
          const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          setActiveSection(targetId);
        }, 150);
      }
    }
  }, [hash]);

  const scrollToSection = (id) => {
    const elem = document.getElementById(id);
    if (elem) {
      const yOffset = -90;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <MainNavbar />

      {/* Hero Header Banner */}
      <section className="bg-gradient-to-b from-white via-cyan-50/30 to-[#f8fafc] border-b border-slate-100 py-12 md:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex p-3 bg-cyan-100 text-cyan-700 rounded-2xl mb-4 border border-cyan-200 shadow-xs">
            <FileText size={30} />
          </div>
          <div>
            <span className="inline-block px-3.5 py-1 bg-cyan-50 text-cyan-800 text-xs font-bold rounded-full uppercase tracking-wider mb-3 border border-cyan-200">
              Legal & Policies
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Booking Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Please read these terms carefully before booking any tour, flight, or travel package with Padham Travels.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <span>Last Updated: October 2026</span>
            <span>•</span>
            <span>Applicable to all bookings made through Padham Travels (padhamtravel.com)</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick-Navigation Sticky Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-3">
                Quick Navigation
              </h2>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition text-left cursor-pointer ${
                      activeSection === item.id
                        ? "bg-cyan-50 text-cyan-800 font-bold border border-cyan-200/80"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          activeSection === item.id
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.num}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    <ChevronRight size={14} className="opacity-40 shrink-0" />
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-gradient-to-br from-cyan-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Phone size={14} />
                <span>Need Clarification?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our support team is available to assist with questions regarding booking deposits, cancellations, or custom package guidelines.
              </p>
              <div className="space-y-1.5 pt-1 text-xs">
                <a
                  href="tel:+919944229209"
                  className="flex items-center gap-2 text-cyan-300 hover:underline font-semibold"
                >
                  <Phone size={12} />
                  <span>+91 99442 29209</span>
                </a>
                <a
                  href="mailto:info@padhamtravel.com"
                  className="flex items-center gap-2 text-cyan-300 hover:underline font-semibold"
                >
                  <Mail size={12} />
                  <span>info@padhamtravel.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Document Card */}
          <main className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 space-y-10 text-slate-700 text-sm leading-relaxed">
            {/* Section 1 */}
            <section id="section-1" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  1
                </span>
                Agreement to Terms
              </h2>
              <p className="text-slate-600 leading-relaxed">
                By accessing, browsing, inquiring, or booking travel packages, flights, hotels, or ancillary services through <strong>Padham Travels</strong> ("Company", "we", "us", or "our") via <strong>padhamtravel.com</strong> or our authorized agents, you agree to comply with and be bound by these Terms and Conditions. If you are making a booking on behalf of multiple travelers, you confirm that you possess the authority to accept these terms on behalf of everyone in your traveling party.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 2 */}
            <section id="section-2" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                Reservations & Payment Schedules
              </h2>
              <ul className="list-disc pl-5 space-y-2.5 text-slate-600 mb-4">
                <li>
                  <strong>Inquiry & Confirmation:</strong> An itinerary inquiry submitted through our website does not guarantee hotel, permit, or transport availability until booking confirmation and initial deposit payment are received.
                </li>
                <li>
                  <strong>Deposit Requirement:</strong> A minimum booking deposit of 30% to 50% of the total package cost is required to secure reservations, hotel rooms, and permits.
                </li>
                <li>
                  <strong>Balance Payment:</strong> The remaining balance must be cleared at least 15 days prior to the travel date (or 30 days prior during peak festive seasons like Diwali, Christmas/New Year, or peak summer holidays).
                </li>
                <li>
                  <strong>Airfares & Non-Refundable Items:</strong> Any domestic or international flight tickets, train tickets, or special permits must be paid 100% upfront and are subject to the respective carriers' fare rules.
                </li>
              </ul>

              {/* Callout Box */}
              <div className="bg-cyan-50/60 border border-cyan-100 rounded-2xl p-4 flex items-start gap-3 text-xs text-cyan-900">
                <CreditCard size={18} className="text-cyan-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-cyan-950 font-bold mb-0.5">Secure Payments:</strong>
                  We accept secure online bank transfers (NEFT/RTGS/IMPS), UPI payments. Official digital receipts and vouchers are delivered immediately upon confirmation.
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 3 */}
            <section id="section-3" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  3
                </span>
                Cancellation & Refund Policy
              </h2>
              <p className="text-slate-600 mb-4">
                All cancellation requests must be delivered in writing via email to <strong>info@padhamtravel.com</strong> from the email address registered at the time of booking. Cancellation charges apply based on the schedule below:
              </p>

              {/* Cancellation Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-4 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="py-3 px-4">Cancellation Timeframe Prior to Departure</th>
                      <th className="py-3 px-4">Cancellation Deduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-medium text-slate-700">30 days or more prior to departure</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">10% of total package cost (Processing Fee)</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-medium text-slate-700">15 to 29 days prior to departure</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">30% of total package cost</td>
                    </tr>
                    <tr className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 font-medium text-slate-700">7 to 14 days prior to departure</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">60% of total package cost</td>
                    </tr>
                    <tr className="bg-red-50/40 hover:bg-red-50/60 transition">
                      <td className="py-3 px-4 font-medium text-slate-700">Less than 7 days or No-Show</td>
                      <td className="py-3 px-4 font-bold text-red-600">100% (No Refund Applicable)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Important Note:</strong> Airlines, trains, and peak-season hotel bookings operate under strict zero-refund policies. Approved refunds are credited to the original payment source within 7 to 14 business days.
                </div>
              </div>
            </section>

            <hr className="border-slate-100" />

            {/* Section 4 */}
            <section id="section-4" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  4
                </span>
                Itinerary Changes & Modifications
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Padham Travels makes every effort to operate tours as advertised. However, we reserve the right to modify routes, hotel accommodations, or sightseeing sequences without prior notice if necessitated by road blockages, natural landslides, flight delays, administrative restrictions, or local security directives. In such scenarios, equivalent accommodations and alternate sightseeing will be provided.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 5 */}
            <section id="section-5" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  5
                </span>
                Travel Documents, Visas & Identification
              </h2>
              <ul className="list-disc pl-5 space-y-2.5 text-slate-600">
                <li>
                  <strong>Domestic Indian Tours:</strong> All adult guests must carry an original government-issued photo identity proof (Aadhaar Card, Passport, Voter ID, or Driving License) for hotel check-ins and state border/military permit checkpoints (such as Sikkim, Nathula Pass, Ladakh, or Kashmir).
                </li>
                <li>
                  <strong>International Destinations:</strong> Travelers must possess a valid Passport with at least 6 months remaining validity from the travel completion date, along with requisite tourist visas, travel insurance, and health/vaccination certificates.
                </li>
                <li>
                  Padham Travels assists with visa processing guidance but cannot be held liable for visa rejections, consulate delays, or border control entry denials.
                </li>
              </ul>
            </section>

            <hr className="border-slate-100" />

            {/* Section 6 */}
            <section id="section-6" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  6
                </span>
                Limitation of Liability & Force Majeure
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Padham Travels acts solely as a coordinator connecting travelers with airlines, third-party hotels, transporters, and local activity operators. We are not liable for any bodily injury, loss of baggage, illness, delays, or additional expenses caused by acts of God, extreme weather, flooding, earthquakes, political strikes, civil disturbances, government travel bans, or technical carrier breakdowns.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 7 */}
            <section id="section-7" className="scroll-mt-28">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold shrink-0">
                  7
                </span>
                Customer Code of Conduct & Safety
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Travelers are expected to follow local laws, cultural customs, and vehicle driver safety instructions. The Company reserves the right to terminate the tour participation of any individual whose conduct is deemed hazardous, abusive, or disruptive to fellow passengers or local communities, without any refund.
              </p>
            </section>

            <hr className="border-slate-100" />

            {/* Section 8 */}
            <section id="section-8" className="bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200 scroll-mt-28">
              <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white text-[11px] flex items-center justify-center font-bold shrink-0">
                  8
                </span>
                Contact & Inquiries Regarding Terms
              </h2>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                If you have any questions, legal inquiries, or require clarification regarding any clause in our booking policies, please contact our support desk:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium text-slate-800">
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block mb-1 font-bold text-[10px] uppercase tracking-wider">
                    Email Support
                  </span>
                  <a
                    href="mailto:info@padhamtravel.com"
                    className="text-cyan-700 hover:underline font-semibold block truncate"
                  >
                    info@padhamtravel.com
                  </a>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block mb-1 font-bold text-[10px] uppercase tracking-wider">
                    Phone / WhatsApp Support
                  </span>
                  <a
                    href="tel:+919944229209"
                    className="text-cyan-700 hover:underline font-semibold block"
                  >
                    +91 99442 29209
                  </a>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 block mb-1 font-bold text-[10px] uppercase tracking-wider">
                    Official Website
                  </span>
                  <a
                    href="https://www.padhamtravel.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-700 hover:underline font-semibold block"
                  >
                    www.padhamtravel.com
                  </a>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export const BookingTerms = TermsAndConditions;
export default TermsAndConditions;
