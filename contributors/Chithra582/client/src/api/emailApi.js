// Simulate email ingestion API
export const ingestEmails = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate
      isSuccess ? resolve("Emails ingested successfully!") : reject(new Error("Network error"));
    }, 2000);
  });
};
