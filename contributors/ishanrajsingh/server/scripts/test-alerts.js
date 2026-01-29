import mongoose from 'mongoose';
import { Subscription } from '../src/models/Subscription.js';
import { AlertRule } from '../src/models/AlertRule.js';
import { getUpcoming, updateRules } from '../src/controllers/alerts.controller.js';
import 'dotenv/config';

// Mock Response Object
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

// Mock Request Object
const mockReq = (userId, body = {}) => ({
    user: { id: userId },
    body
});

const runTest = async () => {
    console.log('[TEST] Starting Alerts Verification...');

    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI is missing');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    const TEST_USER_ID = 'alerts-test-user-v1';

    try {
        // 1. Cleanup
        await Subscription.deleteMany({ userId: TEST_USER_ID });
        await AlertRule.deleteMany({ userId: TEST_USER_ID });
        console.log('[TEST] Cleaned up test data.');

        // 2. Seed Subscriptions
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
        const nextMonth = new Date(today); nextMonth.setDate(today.getDate() + 30);

        await Subscription.insertMany([
            {
                userId: TEST_USER_ID,
                name: 'Urgent Sub (Tomorrow)',
                amount: 10,
                billingCycle: 'monthly',
                renewalDate: tomorrow,
                status: 'active'
            },
            {
                userId: TEST_USER_ID,
                name: 'Soon Sub (Next Week)',
                amount: 20,
                billingCycle: 'monthly',
                renewalDate: nextWeek,
                status: 'active'
            },
            {
                userId: TEST_USER_ID,
                name: 'Far Sub (Next Month)',
                amount: 30,
                billingCycle: 'monthly',
                renewalDate: nextMonth,
                status: 'active'
            }
        ]);
        console.log('[TEST] Seeded 3 subscriptions (Tomorrow, Next Week, Next Month).');

        // 3. Test Default Behavior (Default = 3 Days)
        let req = mockReq(TEST_USER_ID);
        let res = mockRes();

        console.log('\n--- Case 1: Default Rules (3 Days) ---');
        await getUpcoming(req, res);

        console.log(`Window: ${res.body.windowDays} days`);
        console.log(`Count: ${res.body.count}`);

        if (res.body.count === 1 && res.body.subscriptions[0].name === 'Urgent Sub (Tomorrow)') {
            console.log('✅ PASS: Only tomorrow\'s sub returned.');
        } else {
            console.error('❌ FAIL: Expected 1 sub (Tomorrow). Got:', res.body.subscriptions.map(s => s.name));
        }

        // 4. Test Custom Behavior (Update to 14 Days)
        console.log('\n--- Case 2: Custom Rules (14 Days) ---');
        req = mockReq(TEST_USER_ID, { daysBefore: 14, channels: ['email'], enabled: true });
        res = mockRes();
        await updateRules(req, res); // Update DB

        // Fetch again
        req = mockReq(TEST_USER_ID);
        res = mockRes();
        await getUpcoming(req, res);

        console.log(`Window: ${res.body.windowDays} days`);
        console.log(`Count: ${res.body.count}`);

        const names = res.body.subscriptions.map(s => s.name);
        if (res.body.count === 2 && names.includes('Urgent Sub (Tomorrow)') && names.includes('Soon Sub (Next Week)')) {
            console.log('✅ PASS: Tomorrow and Next Week returned.');
        } else {
            console.error('❌ FAIL: Expected 2 subs. Got:', names);
        }

        // 5. Test Disable
        console.log('\n--- Case 3: Disabled Alerts ---');
        req = mockReq(TEST_USER_ID, { enabled: false });
        res = mockRes();
        await updateRules(req, res);

        req = mockReq(TEST_USER_ID);
        res = mockRes();
        await getUpcoming(req, res);

        if (res.body.message === 'Alerts are disabled' && res.body.subscriptions.length === 0) {
            console.log('✅ PASS: Alerts disabled correctly.');
        } else {
            console.error('❌ FAIL: Expected 0 subs. Got:', res.body);
        }


    } catch (error) {
        console.error('❌ TEST FAILED:', error);
    } finally {
        await mongoose.connection.close();
    }
};

runTest();
