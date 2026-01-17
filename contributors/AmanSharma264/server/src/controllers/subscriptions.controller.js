import Subscription from "../models/subscription.model.js";
import { monthlySpend } from "../services/subscriptionMetrics.js";
import { yearlySpend } from "../services/subscriptionMetrics.js";
export const createSubscription = async(req, res) => {
    // const userId = req.auth?.userId;
    const userId = "test-user";
    if(!userId){
        return res
        .status(401)
        .json({
            success: false,
            message: "Unauthorized",
        });
    }

    const {name, billingCycle, price, category, renewalDate, isTrial = false, trialEndDate, source} = req.body;

    if(!name){
        return res
        .status(400)
        .json({success: false, message: "Name is required"});
    }
    if(!billingCycle){
        return res
        .status(400)
        .json({success: false, message: "Billing cycle is required"});
    }
    if(price === undefined || price < 0){
        return res
        .status(400)
        .json({success: false, message: "Valid price is required"});
    }
    if(!renewalDate){
        return res
        .status(400)
        .json({success: false, message: "Renewal Date is required"});
    }
    if(!name){
        return res
        .status(400)
        .json({success: false, message: "Name is required"});
    }
    if(!name){
        return res
        .status(400)
        .json({success: false, message: "Name is required"});
    }

    try {
        const subscription = await Subscription.create({
            userId,
            name,
            billingCycle,
            price,
            category,
            renewalDate,
            isTrial,
            trialEndDate,
            source
        });

        return res.status(201)
        .json({
            success: true,
            message: "Subscription created successfully",
            data: subscription,
        })
    } catch (error) {
        console.log("Create subscription error", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getSubscription = async(req, res) =>{
    
    try {
        const subscription = await Subscription.find()
        .sort({createdAt: -1})
        .lean();
        const monthlySpending = monthlySpend(subscription);
        const yearlySpending = yearlySpend(subscription);
        return res.status(200).json({
            success: true,
            count: subscription.length,
            data: subscription,
            meta: {
                monthlySpending: Number(monthlySpending.toFixed(2)),
                yearlySpending: Number(yearlySpending.toFixed(2)),
            },
        });
    } catch (error) {
        console.log("Fetch subscription error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        }); 
    }
}