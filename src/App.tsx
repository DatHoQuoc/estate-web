// @ts-nocheck
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import RootLayout from "@app/layout";
import HomePage from "@app/page";
import SellerDashboardPage from "@app/seller/page";
import CreateListingPage from "@app/seller/create/page";
import ListingDetailPage from "@app/seller/listings/[id]/page";
import FeedbackPage from "@app/seller/listings/[id]/feedback/page";
import StaffDashboardPage from "@app/staff/page";
import StaffReviewDetailPage from "@app/staff/review/[id]/page";
import EditListingPage from "@app/seller/listings/[id]/edit/edit-listing";
import BuyerDiscoveryHomePage from "@app/discover/page";
import MapDiscoveryPage from "@app/discover/map/page";
import BuyerListingDetailPage from "@app/discover/listings/[id]/page";
import AssistantPage from "@app/discover/assistant/page";
import ConnectPage from "@app/discover/connect/page";
import TourEditorPage from "@app/seller/listings/[id]/edit/tour-editor";
import CreditDashboard from "@app/credit/page"
import { TransactionHistory } from "@app/credit/components/TransactionHistory"
import { SimulateAiChat } from "@app/credit/simulations/SimulateAiChat"
import { SimulateNewPost } from "@app/credit/simulations/SimulateNewPost"
import { CreditProvider } from "@/components/credit/CreditContext"
import { Toaster } from "react-hot-toast"
import { Layout } from "@app/credit/components/Layout";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import LoginPage from "@app/auth/login/page";
import RegisterPage from "@app/auth/register/page";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CreditProvider>
          <Toaster position="top-right" />
          <Routes>

          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          <Route element={<RootLayout><Outlet /></RootLayout>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<BuyerDiscoveryHomePage />} />
            <Route path="/discover/map" element={<MapDiscoveryPage />} />
            <Route path="/discover/listings/:id" element={<BuyerListingDetailPage />} />
            <Route path="/discover/assistant" element={<AssistantPage />} />
            <Route path="/discover/connect" element={<ConnectPage />} />
            <Route path="/seller" element={<ProtectedRoute><SellerDashboardPage /></ProtectedRoute>} />
            <Route path="/seller/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
            <Route path="/seller/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
            <Route path="/seller/listings/:id/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
            <Route path="/seller/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
            <Route path="/seller/listings/:id/tour/edit" element={<ProtectedRoute><TourEditorPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute><StaffDashboardPage /></ProtectedRoute>} />
            <Route path="/staff/review/:id" element={<ProtectedRoute><StaffReviewDetailPage /></ProtectedRoute>} />
          </Route>


          <Route path="/credit" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
            <Route index element={<CreditDashboard />} />
            <Route path="history" element={<TransactionHistory />} />
            <Route path="simulate/chat" element={<SimulateAiChat />} />
            <Route path="simulate/post" element={<SimulateNewPost />} />
          </Route>

          <Route path="*" element={<HomePage />} />
          </Routes>
        </CreditProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
