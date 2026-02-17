-- Check products and categories
SELECT category, count(*) FROM public.products GROUP BY category;
SELECT count(*) FROM public.products;
SELECT * FROM public.products LIMIT 5;

-- Check RLS on products
SELECT * FROM pg_policies WHERE tablename = 'products';
