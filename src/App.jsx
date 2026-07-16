import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PromoBanner from './components/PromoBanner'
import RequireAuth from './components/RequireAuth'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FlightsList from './pages/FlightsList'
import FlightBooking from './pages/FlightBooking'
import HotelsList from './pages/HotelsList'
import HotelBooking from './pages/HotelBooking'
import ToursList from './pages/ToursList'
import TourBooking from './pages/TourBooking'
import MyBookings from './pages/MyBookings'
import VisaServices from './pages/VisaServices'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#05070f]">
        <PromoBanner />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/flights" element={<FlightsList />} />
            <Route path="/flights/:id" element={<FlightBooking />} />
            <Route path="/hotels" element={<HotelsList />} />
            <Route path="/hotels/:id" element={<HotelBooking />} />
            <Route path="/tours" element={<ToursList />} />
            <Route path="/tours/:id" element={<TourBooking />} />
            <Route path="/visa-services" element={<VisaServices />} />
            <Route
              path="/my-bookings"
              element={
                <RequireAuth>
                  <MyBookings />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
