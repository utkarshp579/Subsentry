import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";

import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { Subscription } from "../src/models/Subscription.js";

let mongo;

before(async () => {
  mongo = await MongoMemoryServer.create();

  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_SECRET = "test-secret";

  await connectDB();
});

after(async () => {
  await mongoose.disconnect();

  if (mongo) {
    await mongo.stop();
  }

  global.mongoose = null;
});

test("GET /api/subscriptions returns 401 when unauthenticated", async () => {
  const res = await request(app).get("/api/subscriptions");

  assert.equal(res.status, 401);
  assert.equal(res.body?.success, false);
  assert.equal(res.body?.message, "User authentication required");
});

test("GET /api/subscriptions returns only the current user subscriptions", async () => {
  await Subscription.deleteMany({});

  await Subscription.create([
    {
      userId: "user-1",
      name: "Netflix",
      amount: 499,
      currency: "INR",
      billingCycle: "monthly",
      category: "entertainment",
      renewalDate: new Date("2030-01-01T00:00:00.000Z"),
      isTrial: false,
      source: "manual",
      status: "active",
    },
    {
      userId: "user-1",
      name: "Spotify",
      amount: 199,
      currency: "INR",
      billingCycle: "monthly",
      category: "entertainment",
      renewalDate: new Date("2030-02-01T00:00:00.000Z"),
      isTrial: false,
      source: "manual",
      status: "active",
    },
    {
      userId: "user-2",
      name: "Not yours",
      amount: 1,
      currency: "INR",
      billingCycle: "monthly",
      category: "other",
      renewalDate: new Date("2030-03-01T00:00:00.000Z"),
      isTrial: false,
      source: "manual",
      status: "active",
    },
  ]);

  const token = jwt.sign({ sub: "user-1" }, process.env.JWT_SECRET);

  const res = await request(app)
    .get("/api/subscriptions")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body?.success, true);

  const subscriptions = res.body?.data;
  assert.ok(Array.isArray(subscriptions));
  assert.equal(subscriptions.length, 2);
  assert.equal(res.body?.count, 2);

  for (const sub of subscriptions) {
    assert.ok(!("userId" in sub));
  }

  const names = subscriptions.map((s) => s.name).sort();
  assert.deepEqual(names, ["Netflix", "Spotify"]);
});
