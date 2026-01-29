import { BrowserRouter, Route, Routes } from "react-router-dom"
import RootLayout from "@app/layout"
import HomePage from "@app/page"
import SellerDashboardPage from "@app/seller/page"
import CreateListingPage from "@app/seller/create/page"
import ListingDetailPage from "@app/seller/listings/[id]/page"
import FeedbackPage from "@app/seller/listings/[id]/feedback/page"
import StaffDashboardPage from "@app/staff/page"
import StaffReviewDetailPage from "@app/staff/review/[id]/page"

function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/seller" element={<SellerDashboardPage />} />
          <Route path="/seller/create" element={<CreateListingPage />} />
          <Route path="/seller/listings/:id" element={<ListingDetailPage />} />
          <Route
            path="/seller/listings/:id/feedback"
            element={<FeedbackPage />}
          />
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/staff/review/:id" element={<StaffReviewDetailPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  )
}

export default App
