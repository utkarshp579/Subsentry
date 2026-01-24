import TrialCard from "./TrialCard";

export default function Demo() {
  const demoSub = {
    name: "Netflix",
    isTrial: true,
    trialEndsAt: "2026-01-26"
  };

  return <TrialCard subscription={demoSub} />;
}
