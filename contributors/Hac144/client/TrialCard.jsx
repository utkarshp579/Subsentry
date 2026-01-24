export default function TrialCard({ subscription }) {
  const today = new Date();
  const end = new Date(subscription.trialEndsAt);
  const daysLeft = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  const endingSoon = daysLeft <= 3;

  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "12px",
      borderRadius: "10px",
      maxWidth: "300px"
    }}>
      
      {subscription.isTrial && (
        <span style={{
          background: endingSoon ? "#ff4d4f" : "#52c41a",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "12px"
        }}>
          FREE TRIAL
        </span>
      )}

      <h3>{subscription.name}</h3>

      {subscription.isTrial && (
        <p>
          {endingSoon
            ? `Trial ending in ${daysLeft} days`
            : `Trial ends in ${daysLeft} days`}
        </p>
      )}
    </div>
  );
}
