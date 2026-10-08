import { useCallback, useEffect, useState, useRef } from "react";
import { get, post, put } from "../api.js";
import { useToast } from "../ToastContext.jsx";
import "./AdminTable.css";

const ICONS = {
  building: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v2h-2zm0-4h-8v-2h2v2h-2zm0-4h-8V9h2v2h-2zm0-4h-8V5h2v2h-2z",
  edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  save: "M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z",
  refresh: "M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function AdminSiteInfo() {
  const [siteInfo, setSiteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    registration: "",
    incorporated: "",
    company_type: "",
    address: "",
    post: "",
    phones: "",
    tin: "",
    auditors: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const fetchSiteInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get("/admin/siteinfo/");
      if (data && data.length > 0) {
        setSiteInfo(data[0]);
        setFormData({
          name: data[0].name || "",
          registration: data[0].registration || "",
          incorporated: data[0].incorporated || "",
          company_type: data[0].company_type || "",
          address: data[0].address || "",
          post: data[0].post || "",
          phones: Array.isArray(data[0].phones) ? data[0].phones.join(", ") : data[0].phones || "",
          tin: data[0].tin || "",
          auditors: data[0].auditors || "",
          email: data[0].email || "",
        });
      }
    } catch (err) {
      const msg = err.message || "Failed to load site information";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchSiteInfo();
  }, [fetchSiteInfo]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Company name is required";
    if (!formData.registration.trim()) newErrors.registration = "Registration number is required";
    if (!formData.tin.trim()) newErrors.tin = "TIN is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        phones: formData.phones.split(",").map(p => p.trim()).filter(Boolean),
      };

      if (siteInfo && siteInfo.id) {
        await put(`/admin/siteinfo/${siteInfo.id}/`, payload);
        addToast("Site information updated successfully", "success");
      } else {
        await post("/admin/siteinfo/", payload);
        addToast("Site information created successfully", "success");
      }
      fetchSiteInfo();
    } catch (err) {
      const msg = err.message || "Failed to save site information";
      addToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Company Information</h1>
        <p>Manage registered company particulars and contact details</p>
      </div>

      {loading ? (
        <div className="admin-page" style={{ padding: "2rem" }}>
          <div className="skel-row" style={{ gridTemplateColumns: "1fr" }}>
            <span />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="modal-form" style={{ maxWidth: "800px" }}>
          <div className="form-group">
            <label htmlFor="name">Company Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
              placeholder="Top Business Brokers Consult Limited"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="registration">Registration Number *</label>
            <input
              id="registration"
              name="registration"
              type="text"
              value={formData.registration}
              onChange={handleChange}
              className={errors.registration ? "error" : ""}
              placeholder="CS054812019"
            />
            {errors.registration && <span className="error-text">{errors.registration}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="incorporated">Incorporation Date</label>
            <input
              id="incorporated"
              name="incorporated"
              type="text"
              value={formData.incorporated}
              onChange={handleChange}
              placeholder="19 March 2007"
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_type">Company Type</label>
            <input
              id="company_type"
              name="company_type"
              type="text"
              value={formData.company_type}
              onChange={handleChange}
              placeholder="Private limited company"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Near Liberation Christian Centre, Bomso, Kumasi, Ashanti Region, Ghana"
            />
          </div>

          <div className="form-group">
            <label htmlFor="post">Postal Address</label>
            <input
              id="post"
              name="post"
              type="text"
              value={formData.post}
              onChange={handleChange}
              placeholder="P. O. Box UP 629, KNUST, Kumasi"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phones">Phone Numbers (comma-separated)</label>
            <input
              id="phones"
              name="phones"
              type="text"
              value={formData.phones}
              onChange={handleChange}
              placeholder="+233 (0) 243 555 882, +233 (0) 243 257 214"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tin">Tax Identification Number (TIN) *</label>
            <input
              id="tin"
              name="tin"
              type="text"
              value={formData.tin}
              onChange={handleChange}
              className={errors.tin ? "error" : ""}
              placeholder="C0022801235"
            />
            {errors.tin && <span className="error-text">{errors.tin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="auditors">Auditors</label>
            <input
              id="auditors"
              name="auditors"
              type="text"
              value={formData.auditors}
              onChange={handleChange}
              placeholder="Bridgewater Consulting, Kumasi"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="info@businessbrokers.com.gh"
            />
          </div>

          {siteInfo && (
            <div className="form-group" style={{ marginTop: "1rem", padding: "1rem", background: "var(--at-navy-50)", borderRadius: "12px" }}>
              <small style={{ color: "#5a6a90" }}>
                Last updated: {formatDate(siteInfo.updated_at)}
              </small>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: "2rem" }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={fetchSiteInfo}
              disabled={loading}
            >
              <Icon d={ICONS.refresh} />
              Reset
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              <Icon d={ICONS.save} />
              {isSubmitting ? "Saving..." : siteInfo ? "Update Information" : "Create Information"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
