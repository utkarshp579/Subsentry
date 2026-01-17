const form = document.getElementById("subscriptionForm");
const feedback = document.getElementById("feedback");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form data
  const data = {
    name: document.getElementById("name").value.trim(),
    amount: document.getElementById("amount").value.trim(),
    billingCycle: document.getElementById("billingCycle").value,
    renewalDate: document.getElementById("renewalDate").value,
    category: document.getElementById("category").value.trim(),
    trial: document.getElementById("trial").checked,
    source: document.getElementById("source").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };

  // Validation
  if (!data.name || !data.amount || !data.billingCycle || !data.renewalDate || !data.category || !data.source) {
    feedback.style.color = "red";
    feedback.textContent = "Please fill all required fields correctly.";
    return;
  }
  if (isNaN(data.amount) || Number(data.amount) <= 0) {
    feedback.style.color = "red";
    feedback.textContent = "Amount must be a number greater than 0.";
    return;
  }

  // Simulate server call (no backend needed)
  try {
    feedback.style.color = "blue";
    feedback.textContent = "Submitting...";
    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate delay

    feedback.style.color = "green";
    feedback.textContent = "Subscription added successfully!";
    console.log("Submitted Data:", data); // for testing in console
    form.reset();
  } catch (err) {
    feedback.style.color = "red";
    feedback.textContent = "Failed to submit!";
  }
});
