import jwt from 'jwt-simple';
import tokenBody from '../../fixtures/tokenBody.json';
import { mockRequest, setupTest } from '../testHelpers';
import { SubscriptionStatus, BillingCycle, SubscriptionType } from '../../../src/managers/subscription/types';
import { EffectType } from '../../../src/managers/effect/types';
import { addMonths } from 'date-fns';

const token = jwt.encode(tokenBody, 'test');

describe('subscription', () => {
    setupTest(['subscription']);

    describe('POST /subscription', () => {
        it('should create a basic subscription', async () => {
            const result = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-1',
                    name: 'Basic Monthly Plan',
                    description: 'Basic subscription plan',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 29.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            expect(result.status).toBe(201);
            expect(result.body).toEqual(
                expect.objectContaining({
                    subscriptionId: expect.any(String),
                    customerId: 'cust-1',
                    name: 'Basic Monthly Plan',
                    description: 'Basic subscription plan',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 29.99,
                    currency: 'USD',
                    status: SubscriptionStatus.Active,
                    createdDate: expect.any(String),
                    updatedDate: expect.any(String),
                })
            );
        });

        it('should create a subscription with effect', async () => {
            // First create an effect
            const effectResult = await mockRequest({
                path: `/effect`,
                action: 'post',
                body: {
                    type: EffectType.Discount,
                    value: 10,
                    details: {
                        description: 'Subscription discount effect'
                    }
                },
                token,
            });

            expect(effectResult.status).toBe(201);
            const effectId = effectResult.body.effectId;

            // Create subscription with effect
            const result = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-2',
                    name: 'Premium Plan with Discount',
                    description: 'Premium subscription with discount effect',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Annual,
                    price: 299.99,
                    currency: 'USD',
                    effectId: effectId,
                    startDate: new Date().toISOString(),
                },
                token,
            });

            expect(result.status).toBe(201);
            expect(result.body).toEqual(
                expect.objectContaining({
                    subscriptionId: expect.any(String),
                    customerId: 'cust-2',
                    name: 'Premium Plan with Discount',
                    effectId: effectId,
                    billingCycle: BillingCycle.Annual,
                    price: 299.99,
                    status: SubscriptionStatus.Active,
                })
            );
        });

        it('should create a subscription with trial period', async () => {
            const startDate = new Date();
            const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

            const result = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-3',
                    name: 'Trial Plan',
                    description: 'Plan with 14-day trial',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 19.99,
                    currency: 'USD',
                    startDate: startDate.toISOString(),
                    trialEndDate: trialEndDate.toISOString(),
                },
                token,
            });

            expect(result.status).toBe(201);
            expect(result.body).toEqual(
                expect.objectContaining({
                    subscriptionId: expect.any(String),
                    customerId: 'cust-3',
                    name: 'Trial Plan',
                    trialEndDate: expect.any(String),
                    status: SubscriptionStatus.Active,
                })
            );
        });
    });

    describe('GET /subscription/:subscriptionId', () => {
        it('should retrieve a subscription by ID', async () => {
            // First create a subscription
            const createResult = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-4',
                    name: 'Retrievable Plan',
                    description: 'Plan for retrieval test',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Weekly,
                    price: 9.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            expect(createResult.status).toBe(201);
            const subscriptionId = createResult.body.subscriptionId;

            // Then retrieve it
            const getResult = await mockRequest({
                path: `/subscription/${subscriptionId}`,
                action: 'get',
                token,
            });

            expect(getResult.status).toBe(200);
            expect(getResult.body).toEqual(
                expect.objectContaining({
                    subscriptionId,
                    customerId: 'cust-4',
                    name: 'Retrievable Plan',
                    billingCycle: BillingCycle.Weekly,
                    price: 9.99,
                    status: SubscriptionStatus.Active,
                })
            );
        });

        it('should return null for non-existent subscription', async () => {
            const getResult = await mockRequest({
                path: `/subscription/non-existent-id`,
                action: 'get',
                token,
            });

            expect(getResult.status).toBe(200);
            expect(getResult.body).toEqual({});
        });
    });

    describe('GET /subscription/customer/:customerId', () => {
        it('should retrieve subscriptions by customer ID', async () => {
            const customerId = 'cust-5';

            // Create multiple subscriptions for the same customer
            await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId,
                    name: 'Customer Plan 1',
                    description: 'First plan for customer',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 15.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId,
                    name: 'Customer Plan 2',
                    description: 'Second plan for customer',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Annual,
                    price: 159.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            // Retrieve subscriptions by customer
            const getResult = await mockRequest({
                path: `/subscription/customer/${customerId}`,
                action: 'get',
                token,
            });

            expect(getResult.status).toBe(200);
            expect(getResult.body).toHaveLength(2);
            expect(getResult.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        customerId,
                        name: 'Customer Plan 1',
                        price: 15.99,
                    }),
                    expect.objectContaining({
                        customerId,
                        name: 'Customer Plan 2',
                        price: 159.99,
                    }),
                ])
            );
        });
    });

    describe('PUT /subscription/:subscriptionId/status', () => {
        it('should update subscription status', async () => {
            // First create a subscription
            const createResult = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-6',
                    name: 'Status Update Plan',
                    description: 'Plan for status update test',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 25.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            expect(createResult.status).toBe(201);
            const subscriptionId = createResult.body.subscriptionId;

            // Update status to cancelled
            const updateResult = await mockRequest({
                path: `/subscription/${subscriptionId}/status`,
                action: 'put',
                body: {
                    status: SubscriptionStatus.Cancelled,
                },
                token,
            });

            expect(updateResult.status).toBe(200);
            expect(updateResult.body).toEqual(
                expect.objectContaining({
                    subscriptionId,
                    status: SubscriptionStatus.Cancelled,
                    updatedDate: expect.any(String),
                })
            );
        });
    });

    describe('GET /subscription/active', () => {
        it('should retrieve active subscriptions with effects', async () => {
            // First create an effect
            const effectResult = await mockRequest({
                path: `/effect`,
                action: 'post',
                body: {
                    type: EffectType.Discount,
                    value: 15,
                    details: {
                        description: 'Active subscription discount'
                    }
                },
                token,
            });

            expect(effectResult.status).toBe(201);
            const effectId = effectResult.body.effectId;

            // Create an active subscription with effect
            const createResult = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-7',
                    name: 'Active Plan with Effect',
                    description: 'Active subscription with effect',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Quarterly,
                    price: 89.99,
                    currency: 'USD',
                    effectId: effectId,
                    startDate: new Date().toISOString(),
                },
                token,
            });

            expect(createResult.status).toBe(201);

            // Get active subscriptions
            const activeResult = await mockRequest({
                path: `/subscription/active`,
                action: 'get',
                token,
            });

            expect(activeResult.status).toBe(200);
            expect(activeResult.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        customerId: 'cust-7',
                        name: 'Active Plan with Effect',
                        status: SubscriptionStatus.Active,
                        isActive: true,
                        daysUntilNextBilling: expect.any(Number),
                        effect: expect.objectContaining({
                            effectId: effectId,
                            type: EffectType.Discount,
                            value: 15,
                        }),
                    }),
                ])
            );
        });
    });

    describe('POST /subscription/:subscriptionId/renew', () => {
        it('should renew a subscription', async () => {
            // First create a subscription
            const createResult = await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-8',
                    name: 'Renewable Plan',
                    description: 'Plan for renewal test',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 35.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            expect(createResult.status).toBe(201);
            const subscriptionId = createResult.body.subscriptionId;
            const originalNextBillingDate = createResult.body.nextBillingDate;

            // Renew the subscription
            const renewResult = await mockRequest({
                path: `/subscription/${subscriptionId}/renew`,
                action: 'post',
                token,
            });

            expect(renewResult.status).toBe(201);
            expect(renewResult.body).toEqual(
                expect.objectContaining({
                    subscriptionId,
                    nextBillingDate: expect.any(String),
                })
            );

            // Verify the next billing date was updated
            expect(new Date(renewResult.body.nextBillingDate).getTime()).toBeGreaterThan(
                new Date(originalNextBillingDate).getTime()
            );
        });
    });

    describe('GET /subscription/billing/:dueDate', () => {
        it('should get subscriptions due for billing', async () => {
            const dueDate = addMonths(new Date, 1);

            // Create a subscription with next billing date around the due date
            await mockRequest({
                path: `/subscription`,
                action: 'post',
                body: {
                    customerId: 'cust-9',
                    name: 'Billing Due Plan',
                    description: 'Plan for billing due test',
                    type: SubscriptionType.Term,
                    billingCycle: BillingCycle.Monthly,
                    price: 45.99,
                    currency: 'USD',
                    startDate: new Date().toISOString(),
                },
                token,
            });

            // Get subscriptions due for billing
            const billingResult = await mockRequest({
                path: `/subscription/billing/due?dueDate=${dueDate.toISOString()}`,
                action: 'get',
                token,
            });

            expect(billingResult.status).toBe(200);
            expect(Array.isArray(billingResult.body)).toBe(true);
        });
    });
});
