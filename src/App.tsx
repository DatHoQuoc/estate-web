import { BrowserRouter, Route, Routes } from "react-router-dom"
import RootLayout from "@app/layout"
import HomePage from "@app/page"
import SellerDashboardPage from "@app/seller/page"
import CreateListingPage from "@app/seller/create/page"
import ListingDetailPage from "@app/seller/listings/[id]/page"
import FeedbackPage from "@app/seller/listings/[id]/feedback/page"
import StaffDashboardPage from "@app/staff/page"
import StaffReviewDetailPage from "@app/staff/review/[id]/page"
import EditListingPage from "@app/seller/listings/[id]/edit/edit-listing"
import TourEditorPage from "@app/seller/listings/[id]/edit/tour-editor"
import BuyerDiscoveryHomePage from "@app/discover/page"
import MapDiscoveryPage from "@app/discover/map/page"
import BuyerListingDetailPage from "@app/discover/listings/[id]/page"
import AssistantPage from "@app/discover/assistant/page"
import ConnectPage from "@app/discover/connect/page"
import EditListingPage from '@app/seller/listings/[id]/edit/edit-listing'
import TourEditorPage from '@app/seller/listings/[id]/edit/tour-editor'
import { Toaster } from "sonner"

function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<BuyerDiscoveryHomePage />} />
          <Route path="/discover/map" element={<MapDiscoveryPage />} />
          <Route path="/discover/listings/:id" element={<BuyerListingDetailPage />} />
          <Route path="/discover/assistant" element={<AssistantPage />} />
          <Route path="/discover/connect" element={<ConnectPage />} />
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/create" element={<CreateListingPage />} />
          <Route path="/seller/listings/:id" element={<ListingDetailPage />} />
          <Route
            path="/seller/listings/:id/feedback"
            element={<FeedbackPage />}
          />
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/staff/review/:id" element={<StaffReviewDetailPage />} />
          <Route path="/seller/listings/:id/edit" element={<EditListingPage />} />
          <Route path="/seller/listings/:id/tour/edit" element={<TourEditorPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  )
}

export default App
