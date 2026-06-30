import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Providers from "./pages/Providers";
import ProviderProfile from "./pages/ProviderProfile";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import BecomeProvider from "./pages/BecomeProvider";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import Chat from "./pages/Chat";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import FAQ from "./pages/FAQ";
import CGU from "./pages/CGU";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import CompleteProfile from "./pages/CompleteProfile";
import NotFound from "./pages/NotFound";
import AIAssistant from "./components/AIAssistant";
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
        <Route path="/reservation/confirmation" element={<BookingConfirmation />} />
        <Route path="/devenir-prestataire" element={<BecomeProvider />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/dashboard" element={<ClientDashboard />} />
        <Route path="/prestataire" element={<ProviderDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/cgu" element={<CGU />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/confidentialite" element={<Confidentialite />} />
        <Route path="/completer-profil" element={<CompleteProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <AIAssistant />
    </BrowserRouter>
  );
}
