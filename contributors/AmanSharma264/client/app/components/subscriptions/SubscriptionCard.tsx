type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  category: string;
  renewalDate: string;
  status: string;
  trial: boolean;
  source: string;
};

function isUrgent(date: string) {
  const today = new Date();
  const renewal = new Date(date);
  const diff =
    (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 3;
}

export default function SubscriptionCard({ sub }: { sub: Subscription }) {
  const urgent = isUrgent(sub.renewalDate);

  return (
    <div
      className={`border rounded-lg p-4 transition hover:shadow-md ${
        urgent ? "border-red-500 bg-red-50" : "bg-white"
      }`}
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-semibold text-lg">{sub.name}</h3>
          <p className="text-sm text-gray-500">{sub.category}</p>
        </div>

        <div className="text-right">
          <p className="font-bold">₹{sub.amount}</p>
          <p className="text-sm text-gray-500">{sub.billingCycle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3 text-sm">
        <span className="px-2 py-1 bg-gray-200 rounded">
          Renews: {new Date(sub.renewalDate).toDateString()}
        </span>

        {sub.trial && (
          <span className="px-2 py-1 bg-yellow-200 rounded">Trial</span>
        )}

        <span className="px-2 py-1 bg-green-200 rounded">
          {sub.status}
        </span>

        <span className="px-2 py-1 bg-blue-200 rounded">
          {sub.source}
        </span>

        {urgent && (
          <span className="px-2 py-1 bg-red-600 text-white rounded">
            ⚠ Renews Soon
          </span>
        )}
      </div>
    </div>
  );
}
