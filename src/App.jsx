import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Providers from "./pages/Providers";
import ProviderProfile from "./pages/ProviderProfile";
import Booking from "./pages/Booking";
import BecomeProvider from "./pages/BecomeProvider";
import About from "./pages/About";
import Contact from "./pages/Contact";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/prestataires" element={<Providers />} />
        <Route path="/prestataires/:id" element={<ProviderProfile />} />
        <Route path="/reservation" element={<Booking />} />
        <Route path="/devenir-prestataire" element={<BecomeProvider />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
