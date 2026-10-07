import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { ToastProvider } from "./ToastContext.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Dashboard from "./admin/Dashboard.jsx";
import AdminDesks from "./admin/Desks.jsx";
import AdminPeople from "./admin/People.jsx";
import AdminEnquiries from "./admin/Enquiries.jsx";
import Home from "./pages/Home.jsx"; import Desks from "./pages/Desks.jsx"; import About from "./pages/About.jsx";
import How from "./pages/How.jsx"; import Network from "./pages/Network.jsx"; import Initiatives from "./pages/Initiatives.jsx"; import Contact from "./pages/Contact.jsx"; import Privacy from "./pages/Privacy.jsx"; import Terms from "./pages/Terms.jsx"; import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (<>
    {!isAdmin && <Navbar />}
    <ToastProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home/>}/><Route path="/about" element={<About/>}/>
          <Route path="/what-we-broker" element={<Desks/>}/><Route path="/how-we-work" element={<How/>}/>
          <Route path="/network" element={<Network/>}/>
          <Route path="/initiatives" element={<Initiatives/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/privacy" element={<Privacy/>}/>
          <Route path="/terms" element={<Terms/>}/>
          <Route path="/admin" element={<AdminLayout/>}>
            <Route index element={<Dashboard/>}/>
            <Route path="desks" element={<AdminDesks/>}/>
            <Route path="people" element={<AdminPeople/>}/>
            <Route path="enquiries" element={<AdminEnquiries/>}/>
          </Route>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </ErrorBoundary>
    </ToastProvider>
    {!isAdmin && <Footer />}
  </>);
}
