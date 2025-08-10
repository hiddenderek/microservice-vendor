INSERT INTO public.vendor (vendor_id, type, name, created_date, updated_date)
VALUES ('mock-vendor-id', 'retail', 'Houston Goods Co.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO public.location (location_id, vendor_id, type, longitude, latitude, created_date, updated_date)
VALUES ('mock-location-id', 'mock-vendor-id', 'individual', -95.3698, 29.7604, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO public.location (location_id, vendor_id, type, longitude, latitude, created_date, updated_date)
VALUES ('mock-global-location-id', 'mock-vendor-id', 'global', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);