export const subscriptionCategories = {
    Entertainment: "Entertainment",
    Music: "Music",
    Education: "Education",
    Productivity: "Productivity",
    Finance: "Finance",
    Health: "Health",
    Other: "Other",
};

export const subscriptionReference = {
    Manual: "manual",
    Gmail: "gmail",
    UPI: "upi",           
    PayPal: "paypal",     
    DebitCard: "Debit Card", 
    CreditCard: "Credit Card",   
    Other: "Other",
    PayPal: "PayPal",
    Bank: "Bank",
};

export const subscriptionStatus = {
    Active: "active",
    Cancelled: "cancelled",
    Expired: "expired",
};

export const categoryValues = Object.values(subscriptionCategories);
export const sourceValues = Object.values(subscriptionReference);
export const statusValues = Object.values(subscriptionStatus);