export async function saveEmailSubscription(req, res) {
  console.log("Email subscription API hit");
  console.log(req.body);

  res.json({
    success: true,
    message: "Email subscription received"
  });
}
