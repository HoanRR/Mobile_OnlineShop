
-- ============================================================
-- add_data_db.sql
-- Mục đích: Chèn dữ liệu mẫu vào CSDL
-- Chạy SAU khi đã chạy Init_DB.sql
-- ============================================================
-- Tài khoản mẫu:
--   admin      / admin123
--   nguyenvana / 123456789  (EMPLOYEE)
--   tranthib   / 123456789  (CUSTOMER)
--   levanc     / 123456789  (CUSTOMER)
--   phamthid   / 123456789  (CUSTOMER)
-- ============================================================

/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================================
-- user  (password đã BCrypt round=10)
-- ============================================================
LOCK TABLES `user` WRITE;
INSERT IGNORE INTO `user` (user_id, username, full_name, email, password, phone_number, role) VALUES
(1, 'admin',      'Nguyễn Quản Trị', 'admin@shop.vn',   '$2a$10$MMqFGHLLIhe9n0RADDeunen/ZyzJxP.295hFtvD80sxO86Q3hB7h.', '0900000001', 'ADMIN'),
(2, 'nguyenvana', 'Nguyễn Văn A',    'vana@gmail.com',  '$2a$10$mkDfb12TosqJG76khrp31.XN/p5PGpAU/apc8mK0kXGZcEV9VTMOq',  '0911111111', 'EMPLOYEE'),
(3, 'tranthib',   'Trần Thị B',      'thib@gmail.com',  '$2a$10$Kcwb7yCLH9J.ZhTwAjrBL.Ahahooykdb6HlG.30avlkQT.LcFQhv2',  '0922222222', 'CUSTOMER'),
(4, 'levanc',     'Lê Văn C',        'vanc@gmail.com',  '$2a$10$pOz27OjdceuwAiySzioXqOzvdNMby1SbXcwGsIjmjcijxlP/kyr32',  '0933333333', 'CUSTOMER'),
(5, 'phamthid',   'Phạm Thị D',      'thid@gmail.com',  '$2a$10$mjbxgq.K0bnVpH9SZgKY.ul3ffTvRwyPcWnyEPWjD5PMf0F9AR3ZO',  '0944444444', 'CUSTOMER');
UNLOCK TABLES;

-- ============================================================
-- product
-- ============================================================
LOCK TABLES `product` WRITE;
INSERT IGNORE INTO `product` (`product_id`, `product_name`, `brand`, `description`, `product_image_link`) VALUES
(1, 'iPhone 17 Pro', 'Apple',
'Điện thoại flagship cao cấp với chip Apple A19 Pro mạnh mẽ, thiết kế sang trọng và hiệu năng vượt trội.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659199/pbl3_mobileshop/iphone-17-pro.webp'),

(2, 'iPhone 16 Pro', 'Apple',
'Mẫu iPhone cao cấp sở hữu màn hình ProMotion mượt mà, camera chuyên nghiệp và hiệu năng mạnh mẽ.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659199/pbl3_mobileshop/iphone-16-pro.webp'),

(3, 'Samsung Galaxy S26 Ultra', 'Samsung',
'Smartphone Android cao cấp với camera độ phân giải lớn, bút S Pen tiện lợi và màn hình AMOLED sắc nét.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659201/pbl3_mobileshop/samsung-galaxy-s26-ultra.jpg'),

(4, 'Xiaomi Redmi Note 15 Pro', 'Xiaomi',
'Điện thoại tầm trung nổi bật với màn hình tần số quét cao, pin lớn và hiệu năng ổn định.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659202/pbl3_mobileshop/xiaomi-redmi-note-15-pro.jpg'),

(5, 'OPPO Reno 14 5G', 'OPPO',
'Điện thoại 5G thiết kế thời trang, camera AI hiện đại và khả năng chụp chân dung ấn tượng.',
'https://example.com/images/oppo-reno14-5g.jpg'),

(6, 'Samsung Galaxy A57 5G', 'Samsung',
'Smartphone 5G giá hợp lý với pin bền, màn hình đẹp và hiệu năng đáp ứng tốt nhu cầu hằng ngày.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659201/pbl3_mobileshop/samsung-galaxy-a57-5g.jpg'),

(7, 'Xiaomi Redmi A5', 'Xiaomi',
'Điện thoại phổ thông phù hợp cho nhu cầu cơ bản với thời lượng pin tốt và thiết kế gọn nhẹ.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659202/pbl3_mobileshop/xiaomi-redmi-a5.webp '),

(8, 'Samsung Galaxy Z Fold 7', 'Samsung',
'Điện thoại màn hình gập cao cấp hỗ trợ đa nhiệm mạnh mẽ và trải nghiệm hiển thị đẳng cấp.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659202/pbl3_mobileshop/samsung-galaxy-z-fold-7.webp'),

(9, 'ASUS ROG Phone 9', 'ASUS',
'Điện thoại gaming hiệu năng cao với hệ thống tản nhiệt tối ưu và trải nghiệm chơi game mượt mà.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659199/pbl3_mobileshop/asus-rog-phone-9.webp'),

(10, 'Honor 400 Lite', 'Honor',
'Smartphone tầm trung với thiết kế trẻ trung, camera AI hiện đại và hiệu năng ổn định.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659199/pbl3_mobileshop/honor-400-lite.webp'),

(11, 'OPPO Find X9 Pro', 'OPPO',
'Điện thoại flagship OPPO với camera cao cấp, công nghệ sạc nhanh và thiết kế sang trọng.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778659200/pbl3_mobileshop/oppo-find-x9-pro.webp');
UNLOCK TABLES;

-- ============================================================
-- product_variant
-- ============================================================
LOCK TABLES `product_variant` WRITE;
INSERT IGNORE INTO `product_variant` (`product_variant_id`, `product_id`, `color`, `storage_capacity`, `ram`, `chip`, `battery_capacity`, `resolution`, `screen_size`, `front_camera`, `rear_camera`, `sim_card`, `price`, `total_available`, `variant_image_link`) VALUES
-- iPhone 17 Pro
(1, 1, 'Xanh đậm', '512GB', '12GB', 'Apple A19 Pro', '4700mAh', '2868x1320', '6.3 inch', '24MP', '48MP + 12MP + 12MP', '1 Nano SIM/eSIM', 36990000, 10,
'https://res.cloudinary.com/durs02or1/image/upload/v1778659254/pbl3_mobileshop/iphone-17-pro-deep-blue-variant.jpg'),
(2, 1, 'Bạc', '256GB', '12GB', 'Apple A19 Pro', '4700mAh', '2868x1320', '6.3 inch', '24MP', '48MP + 12MP + 12MP', '1 Nano SIM/eSIM', 40990000, 8,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659255/pbl3_mobileshop/iphone-17-pro-silver-variant.jpg'),
(3, 1, 'Cam vũ trụ', '1TB', '12GB', 'Apple A19 Pro', '4700mAh', '2868x1320', '6.3 inch', '24MP', '48MP + 12MP + 12MP', '1 Nano SIM/eSIM', 46990000, 5,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659254/pbl3_mobileshop/iphone-17-pro-cosmic-orange-variant.jpg'),
-- iPhone 16 Pro
(4, 2, 'Titan đen', '128GB', '8GB', 'Apple A18 Pro', '3582mAh', '2622x1206', '6.3 inch', '12MP', '48MP + 12MP + 12MP', '1 Nano SIM/eSIM', 28990000, 12,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659252/pbl3_mobileshop/iphone-16-pro-black-titanium-variant.jpg'),
(5, 2, 'Titan tự nhiên', '512GB', '8GB', 'Apple A18 Pro', '3582mAh', '2622x1206', '6.3 inch', '12MP', '48MP + 12MP + 12MP', '1 Nano SIM/eSIM', 32990000, 7,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659253/pbl3_mobileshop/iphone-16-pro-natural-titanium-variant.jpg'),
(6, 2, 'Titan sa mạc', '512GB', '8GB', 'Apple A18 Pro', '3582mAh', '2622x1206', '6.3 inch', '12MP', '48MP + 12MP + 12MP', '1 Nano SIM/eSIM', 32990000, 6,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659252/pbl3_mobileshop/iphone-16-pro-desert-titanium-variant.jpg'),

-- Samsung Galaxy S26 Ultra
(7, 3, 'Xanh da trời', '512GB', '12GB', 'Snapdragon 8 Gen 5', '5500mAh', '3120x1440', '6.9 inch', '40MP', '200MP + 50MP + 50MP + 12MP', '2 Nano SIM', 33990000, 9,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659249/pbl3_mobileshop/galaxy-s26-ultra-sky-blue-variant.jpg'),
(8, 3, 'Trắng', '512GB', '12GB', 'Snapdragon 8 Gen 5', '5500mAh', '3120x1440', '6.9 inch', '40MP', '200MP + 50MP + 50MP + 12MP', '2 Nano SIM', 33990000, 8,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659250/pbl3_mobileshop/galaxy-s26-ultra-white-variant.jpg'),
(9, 3, 'Đen', '512GB', '12GB', 'Snapdragon 8 Gen 5', '5500mAh', '3120x1440', '6.9 inch', '40MP', '200MP + 50MP + 50MP + 12MP', '2 Nano SIM', 33990000, 10,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659249/pbl3_mobileshop/galaxy-s26-ultra-black-variant.jpg'),

-- Xiaomi Redmi Note 15 Pro
(10, 4, 'Xanh Aurora', '256GB', '8GB', 'MediaTek Dimensity 8300', '5100mAh', '2712x1220', '6.67 inch', '16MP', '200MP + 8MP + 2MP', '2 Nano SIM', 8990000, 15,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659263/pbl3_mobileshop/xiaomi-redmi-note-15-pro-aurora-blue-variant.jpg'),
(11, 4, 'Đen Midnight', '512GB', '12GB', 'MediaTek Dimensity 8300', '5100mAh', '2712x1220', '6.67 inch', '16MP', '200MP + 8MP + 2MP', '2 Nano SIM', 10990000, 12,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659264/pbl3_mobileshop/xiaomi-redmi-note-15-pro-midnight-black-variant.jpg'),

-- OPPO Reno14 5G
(12, 5, 'Trắng', '256GB', '12GB', 'Dimensity 8350', '5000mAh', '2412x1080', '6.7 inch', '32MP', '50MP + 8MP + 2MP', '2 Nano SIM', 11990000, 14,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659258/pbl3_mobileshop/oppo-reno-14-5g-white-variant.jpg'),
(13, 5, 'Đen', '512GB', '12GB', 'Dimensity 8350', '5000mAh', '2412x1080', '6.7 inch', '32MP', '50MP + 8MP + 2MP', '2 Nano SIM', 13990000, 9,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659257/pbl3_mobileshop/oppo-reno-14-5g-black-variant.jpg'),

-- Samsung Galaxy A57 5G
(14, 6, 'Đen', '256GB', '8GB', 'Exynos 1680', '5000mAh', '2340x1080', '6.6 inch', '32MP', '50MP + 12MP + 5MP', '2 Nano SIM', 11490000, 11,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659258/pbl3_mobileshop/samsung-galaxy-a57-5g-black-variant.jpg'),
(15, 6, 'Trắng', '256GB', '8GB', 'Exynos 1680', '5000mAh', '2340x1080', '6.6 inch', '32MP', '50MP + 12MP + 5MP', '2 Nano SIM', 11490000, 10,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659259/pbl3_mobileshop/samsung-galaxy-a57-5g-white-variant.jpg'),

-- Xiaomi Redmi A5
(16, 7, 'Xanh dương', '64GB', '3GB', 'Helio G36', '5000mAh', '1600x720', '6.52 inch', '8MP', '13MP', '2 Nano SIM', 2990000, 18,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659262/pbl3_mobileshop/xiaomi-redmi-a5-blue-variant.jpg'),
(17, 7, 'Đen', '128GB', '4GB', 'Helio G36', '5000mAh', '1600x720', '6.52 inch', '8MP', '13MP', '2 Nano SIM', 3690000, 15,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659262/pbl3_mobileshop/xiaomi-redmi-a5-black-variant.jpg'),

-- Samsung Galaxy Z Fold 7
(18, 8, 'Đen', '512GB', '12GB', 'Snapdragon 8 Elite', '4800mAh', '2176x1812', '7.8 inch', '16MP', '200MP + 12MP + 10MP', '2 Nano SIM/eSIM', 46990000, 5,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659260/pbl3_mobileshop/samsung-galaxy-z-fold-7-black-variant.jpg'),
(19, 8, 'Bạc', '1TB', '16GB', 'Snapdragon 8 Elite', '4800mAh', '2176x1812', '7.8 inch', '16MP', '200MP + 12MP + 10MP', '2 Nano SIM/eSIM', 52990000, 3,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659261/pbl3_mobileshop/samsung-galaxy-z-fold-7-silver-variant.jpg'),

-- ASUS ROG Phone 9
(20, 9, 'Đen Phantom', '512GB', '16GB', 'Snapdragon 8 Gen 4', '6000mAh', '2448x1080', '6.78 inch', '32MP', '50MP + 13MP + 5MP', '2 Nano SIM', 29990000, 7,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659246/pbl3_mobileshop/asus-rog-phone-9-phantom-black-variant.jpg'),
(21, 9, 'Trắng Phantom', '1TB', '24GB', 'Snapdragon 8 Gen 4', '6000mAh', '2448x1080', '6.78 inch', '32MP', '50MP + 13MP + 5MP', '2 Nano SIM', 39990000, 4,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659248/pbl3_mobileshop/asus-rog-phone-9-phantom-white-variant.jpg'),

-- Honor 400 Lite
(22, 10, 'Trắng', '256GB', '12GB', 'MediaTek Dimensity 7025', '5000mAh', '2412x1080', '6.7 inch', '16MP', '108MP + 5MP', '2 Nano SIM', 7990000, 13,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659251/pbl3_mobileshop/honor-400-lite-white-variant.jpg'),
(23, 10, 'Xanh Marrs', '256GB', '12GB', 'MediaTek Dimensity 7025', '5000mAh', '2412x1080', '6.7 inch', '16MP', '108MP + 5MP', '2 Nano SIM', 7990000, 10,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659251/pbl3_mobileshop/honor-400-lite-marrs-green-variant.jpg'),

-- OPPO Find X9 Pro
(24, 11, 'Trắng', '512GB', '16GB', 'Dimensity 9500', '5400mAh', '3168x1440', '6.82 inch', '32MP', '50MP + 50MP + 50MP', '2 Nano SIM', 32990000, 6,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659257/pbl3_mobileshop/oppo-find-x9-pro-white-variant.jpg'),
(25, 11, 'Hồng ánh tím', '1TB', '16GB', 'Dimensity 9500', '5400mAh', '3168x1440', '6.82 inch', '32MP', '50MP + 50MP + 50MP', '2 Nano SIM', 37990000, 4,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659256/pbl3_mobileshop/oppo-find-x9-pro-magenta-variant.jpg');
UNLOCK TABLES;

-- ============================================================
-- device
-- ============================================================
LOCK TABLES `device` WRITE;
INSERT IGNORE INTO `device` VALUES
( 1, '354321010000001', 'AVAILABLE', 1),
( 2, '354321010000002', 'AVAILABLE', 1),
( 3, '354321010000003', 'SOLD',      1),
( 4, '354321020000001', 'AVAILABLE', 2),
( 5, '354321020000002', 'AVAILABLE', 2),
( 6, '354322010000001', 'AVAILABLE', 3),
( 7, '354322010000002', 'SOLD',      3),
( 8, '354322020000001', 'AVAILABLE', 4),
( 9, '354323010000001', 'AVAILABLE', 5),
(10, '354324010000001', 'AVAILABLE', 6),
(11, '354325010000001', 'SOLD',      7),
(12, '354325010000002', 'AVAILABLE', 7);
UNLOCK TABLES;

-- ============================================================
-- voucher
-- ============================================================
LOCK TABLES `voucher` WRITE;
INSERT IGNORE INTO `voucher` VALUES
(1, 'SALE10',    10, '2025-01-01 00:00:00.000000', '2025-12-31 23:59:59.000000', 100),
(2, 'SUMMER20',  20, '2025-06-01 00:00:00.000000', '2025-08-31 23:59:59.000000',  50),
(3, 'FLASH50',   50, '2025-04-01 00:00:00.000000', '2025-04-30 23:59:59.000000',  20),
(4, 'NEWUSER15', 15, '2025-01-01 00:00:00.000000', '2026-01-01 00:00:00.000000', 200),
(5, 'VIP30',     30, '2025-03-01 00:00:00.000000', '2025-12-31 23:59:59.000000',  30);
UNLOCK TABLES;

-- ============================================================
-- apply_condition
-- ============================================================
LOCK TABLES `apply_condition` WRITE;
INSERT IGNORE INTO `apply_condition` VALUES
(1,  500000, 1),
(2, 1000000, 2),
(3, 2000000, 3),
(4,  300000, 4),
(5, 5000000, 5);
UNLOCK TABLES;

-- ============================================================
-- apply_condition_variant
-- ============================================================
LOCK TABLES `apply_condition_variant` WRITE;
INSERT IGNORE INTO `apply_condition_variant` VALUES
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 1), (3, 3),
(4, 5), (4, 7),
(5, 2), (5, 4);
UNLOCK TABLES;

-- ============================================================
-- cart
-- ============================================================
LOCK TABLES `cart` WRITE;
INSERT IGNORE INTO `cart` VALUES
(1, 2, '2025-04-01 10:00:00.000000'),
(2, 3, '2025-04-02 11:00:00.000000'),
(3, 4, '2025-04-03 09:30:00.000000'),
(4, 5, '2025-04-04 14:00:00.000000');
UNLOCK TABLES;

-- ============================================================
-- cart_detail
-- ============================================================
LOCK TABLES `cart_detail` WRITE;
INSERT IGNORE INTO `cart_detail` VALUES
(1, 1, 1, 1),
(2, 1, 5, 2),
(3, 2, 3, 1),
(4, 3, 7, 1),
(5, 4, 2, 1),
(6, 4, 6, 1);
UNLOCK TABLES;

-- ============================================================
-- orders
-- ============================================================
LOCK TABLES `orders` WRITE;
INSERT IGNORE INTO `orders` VALUES
(1, 2, 1, 'Nguyễn Văn A', '0911111111', '123 Lê Lợi, Q1, TP.HCM',   34990000,  3499000, 'COD',           'DELIVERED', b'1', '2025-03-10 09:00:00.000000'),
(2, 3, 2, 'Trần Thị B',   '0922222222', '45 Nguyễn Huệ, Q1, TP.HCM', 33990000,  6798000, 'BANK_TRANSFER', 'DELIVERED', b'1', '2025-03-15 14:30:00.000000'),
(3, 4, NULL,'Lê Văn C',   '0933333333', '78 Trần Phú, Đà Nẵng',       29990000,     NULL, 'COD',           'WAIT',  b'0', '2025-04-01 10:00:00.000000'),
(4, 2, 3, 'Nguyễn Văn A', '0911111111', '123 Lê Lợi, Q1, TP.HCM',   38990000, 19495000, 'MOMO',          'PROCESSING',   b'0', '2025-04-05 16:00:00.000000'),
(5, 5, 4, 'Phạm Thị D',   '0944444444', '99 Hoàng Diệu, Hải Phòng',  24990000,  3748500, 'BANK_TRANSFER', 'CANCELLED', b'1', '2025-03-20 08:00:00.000000');
UNLOCK TABLES;

-- ============================================================
-- order_detail
-- ============================================================
LOCK TABLES `order_detail` WRITE;
INSERT IGNORE INTO `order_detail` VALUES
(1, 1,  3, 1, 34990000),
(2, 2,  7, 3, 33990000),
(3, 3,  9, 5, 29990000),
(4, 4,  4, 2, 38990000),
(5, 5, 11, 7, 24990000);
UNLOCK TABLES;

-- ============================================================
-- product_review
-- ============================================================
LOCK TABLES `product_review` WRITE;
INSERT IGNORE INTO `product_review` VALUES
(1, 1, 1, 2, 5, 'Máy rất đẹp, hiệu năng mạnh, pin tốt!',              b'1', '2025-03-20 10:00:00.000000'),
(2, 2, 3, 3, 4, 'Camera đỉnh, màn hình sắc nét, hơi nặng một chút.', b'1', '2025-03-25 15:00:00.000000'),
(3, 3, 5, 4, 5, 'Giá tốt, cấu hình cao, rất hài lòng.',               b'1', '2025-04-10 09:00:00.000000'),
(4, 5, 7, 5, 4, 'Pixel 9 Pro chụp ảnh đẹp, Android thuần.',           b'1', '2025-03-28 11:00:00.000000'),
(5, 1, 2, 3, 4, 'Bản 512GB xứng đáng với giá tiền.',                  b'0', '2025-04-01 08:30:00.000000');
UNLOCK TABLES;

-- ============================================================
-- warranty
-- ============================================================
LOCK TABLES `warranty` WRITE;
INSERT IGNORE INTO `warranty` VALUES
(1,  3, 12, '2025-03-10 00:00:00.000000', '2026-03-10 00:00:00.000000'),
(2,  7, 12, '2025-03-15 00:00:00.000000', '2026-03-15 00:00:00.000000'),
(3,  9, 12, '2025-04-01 00:00:00.000000', '2026-04-01 00:00:00.000000'),
(4,  4, 24, '2025-04-05 00:00:00.000000', '2027-04-05 00:00:00.000000'),
(5, 11, 12, '2025-03-20 00:00:00.000000', '2026-03-20 00:00:00.000000');
UNLOCK TABLES;

-- ============================================================

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
