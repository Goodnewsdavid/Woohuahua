import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Search from "./pages/Search";
import LostPet from "./pages/LostPet";
import MyPetsTimeline from "./pages/MyPetsTimeline";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import MicrochipChecker from "./pages/MicrochipChecker";
import AICallCentre from "./pages/AICallCentre";
import Chat from "./pages/Chat";
import ThankYou from "./pages/ThankYou";
import VerifyEmailSent from "./pages/VerifyEmailSent";
import ResendVerification from "./pages/ResendVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyDetails from "./pages/MyDetails";
import PetDetails from "./pages/PetDetails";
import EditPet from "./pages/EditPet";
import TransferOwnership from "./pages/TransferOwnership";
import TransferRequests from "./pages/TransferRequests";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AuthorisedRoute } from "./components/AuthorisedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPets from "./pages/admin/AdminPets";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminEscalations from "./pages/admin/AdminEscalations";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminPromo from "./pages/admin/AdminPromo";
import AuthorisedSearch from "./pages/authorised/AuthorisedSearch";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/search" element={<Search />} />
          <Route path="/authorised/search" element={<AuthorisedRoute><AuthorisedSearch /></AuthorisedRoute>} />
          <Route path="/lost-pet" element={<ProtectedRoute><LostPet /></ProtectedRoute>} />
          <Route path="/my-pets-timeline" element={<ProtectedRoute><MyPetsTimeline /></ProtectedRoute>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/microchip-checker" element={<MicrochipChecker />} />
          <Route path="/ai-call-centre" element={<AICallCentre />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-details" element={<MyDetails />} />
          <Route path="/pet-details" element={<ProtectedRoute><PetDetails /></ProtectedRoute>} />
          <Route path="/edit-pet" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
          <Route path="/transfer-ownership" element={<ProtectedRoute><TransferOwnership /></ProtectedRoute>} />
          <Route path="/transfer-requests" element={<ProtectedRoute><TransferRequests /></ProtectedRoute>} />
          {/* Admin (role-based, same login API) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
          <Route path="/admin/pets" element={<AdminRoute><AdminLayout><AdminPets /></AdminLayout></AdminRoute>} />
          <Route path="/admin/disputes" element={<AdminRoute><AdminLayout><AdminDisputes /></AdminLayout></AdminRoute>} />
          <Route path="/admin/escalations" element={<AdminRoute><AdminLayout><AdminEscalations /></AdminLayout></AdminRoute>} />
          <Route path="/admin/promo" element={<AdminRoute><AdminLayout><AdminPromo /></AdminLayout></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLayout><AdminLogs /></AdminLayout></AdminRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
