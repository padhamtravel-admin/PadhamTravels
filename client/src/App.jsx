import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { AdminDashboard } from "./pages/AdminPages/AdminDashboard.jsx";
import { Toaster } from "sonner";
import { RequireAuth } from "./routes/RequireAuth.jsx";
import ManageTours from "./pages/AdminPages/ManageTours";
import ManageInquiries from "./pages/AdminPages/ManageInquiries";
import ManageHeroCarousel from "./pages/AdminPages/ManageHeroCarousel";
import AdminLayout from "./pages/AdminPages/AdminLayout";
import ToursDisplay from "./pages/ToursAndPackages/ToursDisplay";
import TourDetailPage from "./pages/ToursAndPackages/TourDetailPage";
import AboutUs from "./pages/AboutUsPage";
import TermsAndConditions from "./pages/TermsAndConditions";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { DeveloperPage } from "./pages/DeveloperPage.jsx";

// Flight modules preserved for future reactivation
// import { FlightsSearchPage } from "./pages/FlightBookingPage/FlightsSearchPage";
// import { FlightsSearchResultsPage } from "./pages/FlightBookingPage/FlightsSearchResultsPage";
// import { FlightBookingDetails } from "./pages/AdminPages/FlightBookingDetails";
// import { FlightTicketPage } from "./pages/AdminPages/FlightTicketPage";
// import ManageBookings from "./pages/AdminPages/ManageBookings";
// import BookingCalendar from "./pages/AdminPages/BookingCalendar";
// import ManageWallet from "./pages/AdminPages/ManageWallet";
// import { ManageDeals } from "./pages/AdminPages/ManageDeals";
// import { RequestManager } from "./pages/AdminPages/RequestManager";

import { AuthProvider } from "./hooks/useAuthUser.jsx";

function App() {
  return (
    <AuthProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC & HOME ROUTES (Tour & Travel Showcase) --- */}
          <Route index element={<LandingPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/tours" element={<ToursDisplay />} />
          <Route path="/tours-and-packages" element={<ToursDisplay />} />
          <Route path="/tours/:id" element={<TourDetailPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />
          <Route path="/developer" element={<DeveloperPage />} />

          {/* DORMANT FLIGHT ROUTES (Preserved for future reactivation) */}
          {/*
          <Route path="/flights" element={<FlightsSearchPage />} />
          <Route
            path="/flights/search-results"
            element={<FlightsSearchResultsPage />}
          />
          <Route path="/book-flight-details" element={<FlightBookingDetails />} />
          <Route path="/flight-ticket" element={<FlightTicketPage />} />
          */}

          {/* --- PROTECTED ROUTES --- */}
          <Route element={<RequireAuth />}>
            <Route path="/home" element={<LandingPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin Section */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="manage-tours" element={<ManageTours />} />
              <Route path="manage-inquiries" element={<ManageInquiries />} />
              <Route path="manage-carousel" element={<ManageHeroCarousel />} />

              {/* Dormant admin flight routes */}
              {/*
              <Route path="book-flights" element={<BookFlights />} />
              <Route path="book-flight-details" element={<FlightBookingDetails />} />
              <Route path="flight-ticket" element={<FlightTicketPage />} />
              <Route path="manage-bookings" element={<ManageBookings />} />
              <Route path="manage-deals" element={<ManageDeals />} />
              <Route path="manage-wallet" element={<ManageWallet />} />
              <Route path="booking-calendar" element={<BookingCalendar />} />
              <Route path="manage-requests" element={<RequestManager />} />
              */}
            </Route>
          </Route>

          {/* --- 404 NOT FOUND --- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
