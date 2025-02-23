CREATE TABLE IF NOT EXISTS public.receipt (
    receipt_id VARCHAR(255) PRIMARY KEY,
    retailer VARCHAR(255) NOT NULL,
    purchase_date DATE NOT NULL,
    purchase_time TIME NOT NULL,
    total DECIMAL(10, 2) NOT NULL
);

CREATE TABLE public.item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id VARCHAR(255),
    short_description VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES receipt(receipt_id)
);

WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;