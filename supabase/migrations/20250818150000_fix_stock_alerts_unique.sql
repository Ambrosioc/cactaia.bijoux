-- Deduplicate existing rows on (product_id, alert_type), keep the most recent
WITH ranked AS (
  SELECT id, product_id, alert_type,
         ROW_NUMBER() OVER (PARTITION BY product_id, alert_type ORDER BY created_at DESC NULLS LAST, id DESC) AS rn
  FROM public.stock_alerts
)
DELETE FROM public.stock_alerts sa
USING ranked r
WHERE sa.id = r.id AND r.rn > 1;

-- Add the unique constraint required by ON CONFLICT (product_id, alert_type)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.stock_alerts'::regclass
      AND contype = 'u'
      AND conkey = ARRAY[
        (SELECT attnum FROM pg_attribute WHERE attrelid='public.stock_alerts'::regclass AND attname='product_id'),
        (SELECT attnum FROM pg_attribute WHERE attrelid='public.stock_alerts'::regclass AND attname='alert_type')
      ]
  ) THEN
    ALTER TABLE public.stock_alerts
    ADD CONSTRAINT stock_alerts_unique_product_type UNIQUE (product_id, alert_type);
  END IF;
END $$;



