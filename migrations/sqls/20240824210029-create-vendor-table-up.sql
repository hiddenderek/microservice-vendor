
CREATE TABLE IF NOT EXISTS public.vendor (
    vendor_id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.effect (
    effect_id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    target_id VARCHAR(255),
    value NUMERIC,
    details JSONB,
    conditions jsonb[],
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.promotion (
    promotion_id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor(vendor_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    effect_id VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    menu_item_ids TEXT[] NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.location (
    location_id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor(vendor_id),
    combination_id VARCHAR(255),
    type VARCHAR(255) NOT NULL,
    longitude numeric,
    latitude numeric,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.catalog (
    catalog_id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor(vendor_id),
    location_id VARCHAR(255) NOT NULL REFERENCES location(location_id),
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.catalog_item (
    catalog_item_id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor(vendor_id),
    type VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price numeric NOT NULL,
    price_unit VARCHAR(255) NOT NULL,
    details JSONB,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.catalog_selection (
    catalog_selection_id VARCHAR(255) PRIMARY KEY,
    catalog_id VARCHAR(255) NOT NULL REFERENCES catalog(catalog_id) ON DELETE CASCADE,
    catalog_item_id VARCHAR(255) NOT NULL REFERENCES catalog_item(catalog_item_id) ON DELETE CASCADE
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.subscription (
    subscription_id VARCHAR(255) PRIMARY KEY,
    vendor_id VARCHAR(255) NOT NULL REFERENCES vendor(vendor_id),
    customer_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    billing_cycle VARCHAR(50) NOT NULL,
    price NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL,
    effect_id VARCHAR(255),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    next_billing_date TIMESTAMP NOT NULL,
    trial_end_date TIMESTAMP,
    cancelled_at TIMESTAMP,
    paused_at TIMESTAMP,
    metadata JSONB,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;