import React, { useState } from "react";

const SubscriptionForm = () => {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    billingCycle: "",
    renewalDate: "",
    category: "",
    trial: false,
    source: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.amount) newErrors.amount = "Amount is required";
    if (form.amount && isNaN(form.amount))
      newErrors.amount = "Amount must be a number";
    if (!form.billingCycle)
      newErrors.billingCycle = "Billing cycle is required";
    if (!form.renewalDate)
      newErrors.renewalDate = "Renewal date is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.source) newErrors.source = "Source is required";

    return newErrors;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("POST /api/subscriptions", form);

      setSuccess(true);
      setForm({
        name: "",
        amount: "",
        billingCycle: "",
        renewalDate: "",
        category: "",
        trial: false,
        source: "",
        notes: "",
      });
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Add Subscription</h2>

      <label>
        Name *
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <span className="error">{errors.name}</span>}
      </label>

      <label>
        Amount *
        <input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
        />
        {errors.amount && <span className="error">{errors.amount}</span>}
      </label>

      <label>
        Billing Cycle *
        <select
          name="billingCycle"
          value={form.billingCycle}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        {errors.billingCycle && (
          <span className="error">{errors.billingCycle}</span>
        )}
      </label>

      <label>
        Renewal Date *
        <input
          type="date"
          name="renewalDate"
          value={form.renewalDate}
          onChange={handleChange}
        />
        {errors.renewalDate && (
          <span className="error">{errors.renewalDate}</span>
        )}
      </label>

      <label>
        Category *
        <input
          name="category"
          value={form.category}
          onChange={handleChange}
        />
        {errors.category && (
          <span className="error">{errors.category}</span>
        )}
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="trial"
          checked={form.trial}
          onChange={handleChange}
        />
        Trial Subscription
      </label>

      <label>
        Source *
        <input name="source" value={form.source} onChange={handleChange} />
        {errors.source && <span className="error">{errors.source}</span>}
      </label>

      <label>
        Notes
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
        />
      </label>

      <button disabled={loading}>
        {loading ? "Adding..." : "Add Subscription"}
      </button>

      {success && (
        <p className="success">Subscription added successfully!</p>
      )}
    </form>
  );
};

export default SubscriptionForm;
