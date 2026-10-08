import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { ToastProvider } from "./ToastContext.jsx";
import { AuthProvider } from "./admin/AuthContext.jsx";
import ProtectedRoute from "./admin/ProtectedRoute.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Login from "./admin/Login.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import AdminDesks from "./admin/Desks.jsx";
import AdminPeople from "./admin/People.jsx";
import AdminEnquiries from "./admin/Enquiries.jsx";
import ActivityReport from "./admin/ActivityReport.jsx";
import AdminClusters from "./admin/Clusters.jsx";
import AdminSiteContent from "./admin/SiteContent.jsx";
import AdminSiteSettings from "./admin/SiteSettings.jsx";
import AdminSiteInfo from "./admin/SiteInfo.jsx";
import Home from "./pages/Home.jsx"; import Desks from "./pages/Desks.jsx"; import About from "./pages/About.jsx";
import How from "./pages/How.jsx"; import Network from "./pages/Network.jsx"; import Initiatives from "./pages/Initiatives.jsx"; import Contact from "./pages/Contact.jsx"; import Privacy from "./pages/Privacy.jsx"; import Terms from "./pages/Terms.jsx"; import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (<>
    {!isAdmin && <Navbar />}
    <ToastProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/>
            <Route path="/what-we-broker" element={<Desks/>}/><Route path="/how-we-work" element={<How/>}/>
            <Route path="/network" element={<Network/>}/>
            <Route path="/initiatives" element={<Initiatives/>}/>
            <Route path="/contact" element={<Contact/>}/>
            <Route path="/privacy" element={<Privacy/>}/>
            <Route path="/terms" element={<Terms/>}/>
            <Route path="/admin/login" element={<Login/>}/>
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout/>
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard/>}/>
              <Route path="clusters" element={<AdminClusters/>}/>
              <Route path="desks" element={<AdminDesks/>}/>
              <Route path="people" element={<AdminPeople/>}/>
              <Route path="enquiries" element={<AdminEnquiries/>}/>
              <Route path="activity" element={<ActivityReport/>}/>
              <Route path="content" element={<AdminSiteContent/>}/>
              <Route path="settings" element={<AdminSiteSettings/>}/>
              <Route path="siteinfo" element={<AdminSiteInfo/>}/>
            </Route>
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
    {!isAdmin && <Footer />}
  </>);
}
