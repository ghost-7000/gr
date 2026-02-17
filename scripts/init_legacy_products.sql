-- GRMC Products Initialization Script (Legacy Parity)
-- Matches products from the legacy SQL dump

-- Clear existing products to ensure clean state (Optional)
-- DELETE FROM products;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-WHT-001', 'صبغ داخلي أبيض مطفي', 'طلاء داخلي عالي الجودة بلون أبيض ناصع ولمسة نهائية مطفية. يتميز بتغطية ممتازة وسهولة في التطبيق. مناسب للجدران والأسقف في المنازل والمكاتب.', 3.00, 6.00, 'c1 (12).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-WHT-GLS-002', 'صبغ داخلي أبيض لامع', 'طلاء داخلي بلون أبيض لامع يمنح الجدران لمسة أنيقة ومشرقة. يتميز بسهولة التنظيف ومقاومته للبقع والرطوبة.', 3.00, 6.00, 'c1 (1).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-GRY-MAT-003', 'صبغ داخلي رصاصي مطفي', 'طلاء داخلي بلون رصاصي أنيق بلمسة مطفية ناعمة، مثالي لإضفاء طابع عصري وهادئ.', 3.00, 6.50, 'c1 (5).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-LVND-MAT-004', 'صبغ داخلي بنفسجي فاتح مطفي', 'طلاء داخلي بلون بنفسجي فاتح (لافندر) بلمسة مطفية ناعمة. يضفي أجواء من الهدوء والرقي.', 3.00, 6.50, 'c1 (10).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-LVND-GLS-005', 'صبغ داخلي بنفسجي لامع', 'طلاء داخلي بلون بنفسجي بلمعة أنيقة ومشرقة. يضفي لمسة ناعمة وعصرية على الجدران.', 3.00, 6.50, 'c1 (6).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-PNK-MAT-006', 'صبغ داخلي وردي فاتح مطفي', 'طلاء داخلي بلون وردي فاتح ولمسة مطفية ناعمة. يضفي شعورًا بالراحة والدفء.', 3.00, 6.50, 'c1 (3).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-YLW-MAT-007', 'صبغ داخلي أصفر فاتح مطفي', 'طلاء داخلي بلون أصفر فاتح بلمسة مطفية ناعمة. يمنح المساحات الداخلية إشراقة وحيوية.', 3.00, 6.50, 'c1 (7).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-ORG-MAT-008', 'صبغ داخلي برتقالي فاتح مطفي', 'طلاء داخلي بلون برتقالي فاتح بلمسة مطفية مميزة. يضفي على المساحات إحساسًا بالطاقة والدفء.', 3.00, 6.50, 'c1 (8).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-BLK-MAT-009', 'صبغ داخلي أسود مطفي', 'طلاء داخلي باللون الأسود المطفي الفاخر، يمنح لمسة درامية وأنيقة للمساحات العصرية.', 3.00, 6.50, 'c1 (9).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-BRN-MAT-010', 'صبغ داخلي بني مطفي', 'طلاء داخلي بلون بني مطفي دافئ وأنيق، مثالي لإضفاء إحساس بالثبات والدفء.', 3.00, 6.50, 'c1 (4).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-GRN-MAT-011', 'صبغ داخلي أخضر فاتح مطفي', 'طلاء داخلي بلون أخضر فاتح بلمسة مطفية هادئة، يضفي إحساسًا بالانتعاش والطبيعة.', 3.00, 6.50, 'c1 (11).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;

INSERT INTO products (code, name, details, liters, price, image, category, stock)
VALUES 
('PNT-BLU-MAT-012', 'صبغ أزرق فاخر', 'صبغ أزرق يتميز بلونه العميق وجودته العالية، مناسب للديكورات الحديثة.', 3.00, 6.50, 'c1 (2).jpeg', 'أصباغ داخلية', 100)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  details = EXCLUDED.details,
  liters = EXCLUDED.liters,
  price = EXCLUDED.price,
  image = EXCLUDED.image;
