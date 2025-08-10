export enum SubscriptionStatus {
    Active = 'active',
    // when a subscription is past its due date but not yet suspended (grace period)
    PastDue = 'past_due',
    // when a subscription is suspended due to non-payment or other issues
    Suspended = 'suspended',
    // when a subscription is cancelled by the user or vendor
    Cancelled = 'cancelled',
    // when a subscription has reached its end date and is no longer active
    Expired = 'expired',
    // when a subscription is temporarily paused by the user or vendor
    Paused = 'paused',
}

export enum SubscriptionType {
    Vendor = 'vendor',
    MonthToMonth = 'month_to_month',
    Term = 'term',
}

export enum BillingCycle {
    Weekly = 'weekly',
    Monthly = 'monthly',
    Quarterly = 'quarterly',
    Annual = 'annual',
}
