export function getMonthlyAmount(subscription) {
    if (!subscription) return 0;
    
    const { price, billingCycle, status } = subscription;

    if (!price || isNaN(price) || status !== 'active') {
        return 0;
    }

    if (billingCycle === 'monthly') {
        return price;
    }

    if (billingCycle === 'yearly') {
        return price / 12;
    }

    return 0;
}

export function monthlySpend(subscriptions = []) {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
        return 0;
    }

    return subscriptions.reduce((acc, sub) => {
        return acc + getMonthlyAmount(sub);
    }, 0);
}
