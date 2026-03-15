// @ts-nocheck
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import RootLayout from "@app/layout";
import HomePage from "@app/page";
import SellerDashboardPage from "@app/seller/page";
import SellerListingsPage from "@app/seller/listings/page";
import SellerAnalyticsPage from "@app/seller/analytics/page";
import SellerMessagesPage from "@app/seller/messages/page";
import SellerSettingsPage from "@app/seller/settings/page";
import CreateListingPage from "@app/seller/create/page";
import ListingDetailPage from "@app/seller/listings/[id]/page";
import FeedbackPage from "@app/seller/listings/[id]/feedback/page";
import StaffDashboardPage from "@app/staff/page";
import StaffReviewDetailPage from "@app/staff/review/[id]/page";
import StaffReviewQueuePage from "@app/staff/review/page";
import StaffMyReviewsPage from "@app/staff/my-reviews/page";
import StaffAnalyticsPage from "@app/staff/analytics/page";
import StaffSellersPage from "@app/staff/sellers/page";
import StaffSettingsPage from "@app/staff/settings/page";
import EditListingPage from "@app/seller/listings/[id]/edit/edit-listing";
import BuyerDiscoveryHomePage from "@app/discover/page";
import MapDiscoveryPage from "@app/discover/map/page";
import SearchPage from "@app/search/page";
import BuyerListingDetailPage from "@app/discover/listings/[id]/page";
import AssistantPage from "@app/discover/assistant/page";
import ConnectPage from "@app/discover/connect/page";
import TourEditorPage from "@app/seller/listings/[id]/edit/tour-editor";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";
import { CreditProvider } from "@/components/credit/CreditContext";
import LoginPage from "@app/auth/login/page";
import RegisterPage from "@app/auth/register/page";
import ProfileSettingsPage from "@app/profile/settings/page";
import CreditPage from "@app/credit/page";
import AdminAiUsagePage from "@app/admin/ai-usage/page";
import AdminAnalyticsPage from "@app/admin/analytics/page";
import AdminListingsPage from "@app/admin/listings/page";
import AdminUsersPage from "@app/admin/users/page";
import { Toaster } from "react-hot-toast";
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
              <Route path="/search" element={<SearchPage />} />
              <Route path="/discover/listings/:id" element={<BuyerListingDetailPage />} />
              <Route path="/discover/assistant" element={<AssistantPage />} />
              <Route path="/discover/connect" element={<ConnectPage />} />
              <Route path="/seller" element={<ProtectedRoute><SellerDashboardPage /></ProtectedRoute>} />
              <Route path="/seller/listings" element={<ProtectedRoute><SellerListingsPage /></ProtectedRoute>} />
              <Route path="/seller/analytics" element={<ProtectedRoute><SellerAnalyticsPage /></ProtectedRoute>} />
              <Route path="/seller/messages" element={<ProtectedRoute><SellerMessagesPage /></ProtectedRoute>} />
              <Route path="/seller/settings" element={<ProtectedRoute><SellerSettingsPage /></ProtectedRoute>} />
              <Route path="/credit" element={<ProtectedRoute><CreditPage /></ProtectedRoute>} />
              <Route path="/seller/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
              <Route path="/seller/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
              <Route path="/seller/listings/:id/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
              <Route path="/seller/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
              <Route path="/seller/listings/:id/tour/edit" element={<ProtectedRoute><TourEditorPage /></ProtectedRoute>} />
              <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><Navigate to="/admin/users" replace /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnalyticsPage /></ProtectedRoute>} />
              <Route path="/admin/listings" element={<ProtectedRoute allowedRoles={["admin"]}><AdminListingsPage /></ProtectedRoute>} />
              <Route path="/admin/ai-usage" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAiUsagePage /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute><StaffDashboardPage /></ProtectedRoute>} />
              <Route path="/staff/review" element={<ProtectedRoute><StaffReviewQueuePage /></ProtectedRoute>} />
              <Route path="/staff/review/:id" element={<ProtectedRoute><StaffReviewDetailPage /></ProtectedRoute>} />
              <Route path="/staff/my-reviews" element={<ProtectedRoute><StaffMyReviewsPage /></ProtectedRoute>} />
              <Route path="/staff/analytics" element={<ProtectedRoute><StaffAnalyticsPage /></ProtectedRoute>} />
              <Route path="/staff/sellers" element={<ProtectedRoute><StaffSellersPage /></ProtectedRoute>} />
              <Route path="/staff/settings" element={<ProtectedRoute><StaffSettingsPage /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<HomePage />} />
          </Routes>
        </CreditProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
