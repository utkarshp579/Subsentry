import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch from your backend server
    const response = await fetch("http://localhost:5000/api/subscriptions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from backend");
    }

    const result = await response.json();

    // Extract the data array from backend response
    const subscriptions = result.data || result;

    // Transform backend data to match frontend interface
    const transformedSubscriptions = subscriptions.map((sub: any) => ({
      _id: sub._id || sub.id,
      identifier: sub._id || sub.id,
      serviceName: sub.name,
      cost: sub.amount,
      billingInterval: sub.billingCycle as "monthly" | "yearly",
      serviceCategory: getCategoryFromName(sub.name),
      upcomingRenewal: sub.renewalDate,
      trialPeriod: sub.isTrial,
      integrationSource: sub.source === "email" ? "Email" : "Manual",
      serviceStatus:
        sub.status ||
        (getSubscriptionStatus(sub.renewalDate, sub.isTrial) as
          | "active"
          | "cancelled"
          | "expired"
          | "trial"),
      logoUrl: getLogoUrl(sub.name),
    }));

    return NextResponse.json(transformedSubscriptions, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "amount",
      "billingCycle",
      "renewalDate",
      "category",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Forward the request to your backend server
    const response = await fetch("http://localhost:5000/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(result, {
        status: response.status,
      });
    }

    // Return the backend response
    return NextResponse.json(result, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subscription",
      },
      { status: 500 }
    );
  }
}

// Helper functions to map backend data to frontend format
function getCategoryFromName(serviceName: string): string {
  const categories: { [key: string]: string } = {
    Netflix: "Entertainment",
    "Spotify Premium": "Music",
    "Adobe Creative Cloud": "Software",
    "GitHub Pro": "Development",
    "OpenAI ChatGPT Plus": "AI Tools",
    "Amazon Prime": "Shopping",
    "Disney+": "Entertainment",
    "Microsoft 365": "Productivity",
    "Notion Pro": "Productivity",
    "Zoom Pro": "Communication",
    "LinkedIn Premium": "Professional",
    "Dropbox Plus": "Storage",
  };
  return categories[serviceName] || "Other";
}

function getLogoUrl(serviceName: string): string {
  const logos: { [key: string]: string } = {
    Netflix: "/netflix.png",
    "Spotify Premium": "/spotify.png",
    "Adobe Creative Cloud": "/adobe.png",
    "GitHub Pro": "/github.png",
    "OpenAI ChatGPT Plus": "/chatgpt.png",
    "Amazon Prime": "/amazon.png",
    "Disney+": "/disney.png",
    "Microsoft 365": "/microsoft.png",
    "Notion Pro": "/notion.png",
    "Zoom Pro": "/zoom.png",
    "LinkedIn Premium": "/linkedin.png",
    "Dropbox Plus": "/dropbox.png",
  };
  return logos[serviceName] || "/logo.png";
}

function getSubscriptionStatus(renewalDate: string, isTrial: boolean): string {
  const renewal = new Date(renewalDate);
  const today = new Date();

  if (renewal < today) {
    return "expired";
  }

  if (isTrial) {
    return "trial";
  }

  return "active";
}
