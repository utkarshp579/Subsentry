export type Subscription = {
  _id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  category: string;
  renewalDate: string;
  isTrial: boolean;
  source: string;
  status: "active" | "cancelled" | "expired";
};

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription`,
    {
      credentials: "include", // IMPORTANT for Clerk cookies
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch subscriptions");
  }

  const json = await res.json();
  return json.data;
}
