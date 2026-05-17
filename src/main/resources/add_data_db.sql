
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
'https://res.cloudinary.com/durs02or1/image/upload/v1778659200/pbl3_mobileshop/oppo-reno-14-5g.webp'),

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
'https://res.cloudinary.com/durs02or1/image/upload/v1778659200/pbl3_mobileshop/oppo-find-x9-pro.webp'),

(12, 'iPhone 16 Plus', 'Apple',
'Điện thoại cao cấp với màn hình lớn, hiệu năng mạnh mẽ và thời lượng pin ấn tượng.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955145/pbl3_mobileshop/iphone-16-plus.webp'),

(13, 'Samsung Galaxy S26 Plus', 'Samsung',
'Smartphone flagship sở hữu màn hình AMOLED sắc nét, camera cao cấp và hiệu năng vượt trội.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955147/pbl3_mobileshop/samsung-galaxy-s26-plus.webp'),

(14, 'Samsung Galaxy Z Flip 6', 'Samsung',
'Điện thoại gập thời trang với thiết kế nhỏ gọn, màn hình linh hoạt và hiệu năng mạnh.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955148/pbl3_mobileshop/samsung-galaxy-z-flip-6.webp'),

(15, 'Xiaomi 15 Pro', 'Xiaomi',
'Smartphone cao cấp với camera chất lượng cao, sạc nhanh và hiệu năng mạnh mẽ.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955149/pbl3_mobileshop/xiaomi-15-pro.webp'),

(16, 'Sony Xperia 1 VII', 'Sony',
'Điện thoại cao cấp dành cho giải trí và nhiếp ảnh với màn hình chất lượng điện ảnh.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955148/pbl3_mobileshop/sony-xperia-1-VII.webp'),

(17, 'Google Pixel 10 Pro', 'Google',
'Điện thoại Pixel với Android thuần, camera AI thông minh và trải nghiệm mượt mà.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955142/pbl3_mobileshop/goolgle-pixel-10-pro.webp'),

(18, 'Oppo F33 Pro', 'OPPO',
'Smartphone tầm trung với thiết kế đẹp, camera AI hiện đại và pin dung lượng lớn.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955146/pbl3_mobileshop/oppo-f33-pro.webp'),

(19, 'Vivo Y6', 'Vivo',
'Điện thoại phổ thông phù hợp nhu cầu học tập, giải trí và sử dụng hằng ngày.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955149/pbl3_mobileshop/vivo-y6.webp'),

(20, 'Realme C100 5G', 'Realme',
'Smartphone giá rẻ hỗ trợ 5G với hiệu năng ổn định và thiết kế trẻ trung.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955146/pbl3_mobileshop/realme-c100-5g.webp'),

(21, 'Samsung Galaxy A36', 'Samsung',
'Điện thoại tầm trung với màn hình đẹp, pin tốt và hỗ trợ 5G hiện đại.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955147/pbl3_mobileshop/samsung-galaxy-a36.webp'),

(22, 'Xiaomi Poco F7 Pro', 'Xiaomi',
'Smartphone hiệu năng cao dành cho gaming với chip mạnh và màn hình tốc độ cao.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955151/pbl3_mobileshop/xiaomi-poco-f7-pro.webp'),

(23, 'Infinix GT 50 Pro', 'Infinix',
'Điện thoại gaming giá tốt với cấu hình mạnh và thiết kế hiện đại.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955144/pbl3_mobileshop/infinix-gt-50-pro.webp'),

(24, 'ZTE Nubia Red Magic 10 Pro', 'ZTE',
'Gaming phone cao cấp với hệ thống tản nhiệt mạnh mẽ và hiệu năng vượt trội.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955150/pbl3_mobileshop/zte-nubia-red-magic-10-pro.webp'),

(25, 'Honor 600 Pro', 'Honor',
'Smartphone cao cấp với camera AI hiện đại và thiết kế sang trọng.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955143/pbl3_mobileshop/honor-600-pro.webp'),

(26, 'Huawei Pura 90 Pro Max', 'Huawei',
'Điện thoại flagship nổi bật với camera cao cấp, thiết kế tinh tế và hiệu năng mạnh.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955143/pbl3_mobileshop/huawei-pure-90-pro-max.webp'),

(27, 'Blackview Shark 6', 'Blackview',
'Điện thoại giá rẻ với độ bền cao và thời lượng pin ổn định.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955142/pbl3_mobileshop/blackview-shark-6.webp'),

(28, 'Motorola Razr Ultra 2026', 'Motorola',
'Điện thoại gập cao cấp với thiết kế độc đáo và hiệu năng mạnh mẽ.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955145/pbl3_mobileshop/motorola-razr-ultra-2026.webp'),

(29, 'Cubot X100', 'Cubot',
'Smartphone giá rẻ phù hợp nhu cầu cơ bản với thiết kế nhỏ gọn.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955142/pbl3_mobileshop/cubot-x100.webp'),

(30, 'OnePlus Nord CE6', 'OnePlus',
'Điện thoại tầm trung với hiệu năng tốt, màn hình đẹp và sạc nhanh.',
'https://res.cloudinary.com/durs02or1/image/upload/v1778955145/pbl3_mobileshop/oneplus-nord-ce6.webp');
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
 'https://res.cloudinary.com/durs02or1/image/upload/v1778659256/pbl3_mobileshop/oppo-find-x9-pro-magenta-variant.jpg'),

-- iPhone 16 Plus (product_id: 12)
(26, 12, 'Đen', '128GB', '8GB', 'Apple A18', '4674mAh', '2796x1290', '6.7 inch', '12MP', '48MP + 12MP', '1 Nano SIM/eSIM', 16990000, 15,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955219/pbl3_mobileshop/iphone-16-plus-black-variant.webp'),
(27, 12, 'Trắng', '256GB', '8GB', 'Apple A18', '4674mAh', '2796x1290', '6.7 inch', '12MP', '48MP + 12MP', '1 Nano SIM/eSIM', 16990000, 12,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955220/pbl3_mobileshop/iphone-16-plus-white-variant.webp'),
(28, 12, 'Xanh lá', '256GB', '8GB', 'Apple A18', '4674mAh', '2796x1290', '6.7 inch', '12MP', '48MP + 12MP', '1 Nano SIM/eSIM', 16990000, 10,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955219/pbl3_mobileshop/iphone-16-plus-green-variant.webp'),

-- Samsung Galaxy S26 Plus (product_id: 13)
(29, 13, 'Trắng', '128GB', '8GB', 'Snapdragon 8 Gen 5', '4900mAh', '2340x1080', '6.7 inch', '12MP', '50MP + 10MP + 12MP', '2 Nano SIM', 21990000, 8,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955230/pbl3_mobileshop/samsung-galaxy-s26-plus-white-variant.webp'),
(30, 13, 'Đen', '256GB', '12GB', 'Snapdragon 8 Gen 5', '4900mAh', '2340x1080', '6.7 inch', '12MP', '50MP + 10MP + 12MP', '2 Nano SIM', 25990000, 14,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955229/pbl3_mobileshop/samsung-galaxy-s26-plus-black-variant.webp'),
(31, 13, 'Tím', '512GB', '12GB', 'Snapdragon 8 Gen 5', '4900mAh', '2340x1080', '6.7 inch', '12MP', '50MP + 10MP + 12MP', '2 Nano SIM', 31990000, 6,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955230/pbl3_mobileshop/samsung-galaxy-s26-plus-purple-variant.webp'),

-- Samsung Galaxy Z Flip 6 (product_id: 14)
(32, 14, 'Đen', '256GB', '12GB', 'Snapdragon 8 Gen 3', '4000mAh', '2640x1080', '6.7 inch', '10MP', '50MP + 12MP', '1 Nano SIM + 1 eSIM', 17490000, 11,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955231/pbl3_mobileshop/samsung-galaxy-z-flip-6-black-variant.webp'),
(33, 14, 'Trắng', '512GB', '12GB', 'Snapdragon 8 Gen 3', '4000mAh', '2640x1080', '6.7 inch', '10MP', '50MP + 12MP', '1 Nano SIM + 1 eSIM', 21990000, 7,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955232/pbl3_mobileshop/samsung-galaxy-z-flip-6-white-variant.webp'),
(34, 14, 'Xanh dương', '512GB', '12GB', 'Snapdragon 8 Gen 3', '4000mAh', '2640x1080', '6.7 inch', '10MP', '50MP + 12MP', '1 Nano SIM + 1 eSIM', 21990000, 9,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955232/pbl3_mobileshop/samsung-galaxy-z-flip-6-blue-variant.webp'),

-- Xiaomi 15 Pro (product_id: 15)
(35, 15, 'Bạc', '512GB', '16GB', 'Snapdragon 8 Gen 4', '5400mAh', '3200x1440', '6.73 inch', '32MP', '50MP + 50MP + 50MP', '2 Nano SIM', 17990000, 10,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955237/pbl3_mobileshop/xiaomi-15-pro-silver-variant.webp'),
(36, 15, 'Trắng', '1TB', '16GB', 'Snapdragon 8 Gen 4', '5400mAh', '3200x1440', '6.73 inch', '32MP', '50MP + 50MP + 50MP', '2 Nano SIM', 18990000, 8,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955239/pbl3_mobileshop/xiaomi-15-pro-white-variant.webp'),
(37, 15, 'Đen', '1TB', '16GB', 'Snapdragon 8 Gen 4', '5400mAh', '3200x1440', '6.73 inch', '32MP', '50MP + 50MP + 50MP', '2 Nano SIM', 18990000, 12,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955236/pbl3_mobileshop/xiaomi-15-pro-black-variant.webp'),

-- Sony Xperia 1 VII (product_id: 16)
(38, 16, 'Nâu', '256GB', '12GB', 'Snapdragon 8 Gen 5', '5200mAh', '3840x1644', '6.5 inch', '12MP', '48MP + 48MP + 48MP', '2 Nano SIM', 27990000, 5,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955233/pbl3_mobileshop/sony-xperia-1-VII-brown-variant.webp'),
(39, 16, 'Đỏ', '512GB', '16GB', 'Snapdragon 8 Gen 5', '5200mAh', '3840x1644', '6.5 inch', '12MP', '48MP + 48MP + 48MP', '2 Nano SIM', 30990000, 4,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955234/pbl3_mobileshop/sony-xperia-1-VII-red-variant.webp'),

-- Google Pixel 10 Pro (product_id: 17)
(40, 17, 'Đen', '256GB', '16GB', 'Google Tensor G5', '5050mAh', '2992x1344', '6.7 inch', '42MP', '50MP + 48MP + 48MP', '1 Nano SIM + 1 eSIM', 26990000, 7,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955211/pbl3_mobileshop/google-pixel-10-pro-black-variant.webp'),
(41, 17, 'Trắng', '512GB', '16GB', 'Google Tensor G5', '5050mAh', '2992x1344', '6.7 inch', '42MP', '50MP + 48MP + 48MP', '1 Nano SIM + 1 eSIM', 29900000, 6,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955211/pbl3_mobileshop/google-pixel-10-pro-white-variant.webp'),
(42, 17, 'Xanh lá', '1TB', '16GB', 'Google Tensor G5', '5050mAh', '2992x1344', '6.7 inch', '42MP', '50MP + 48MP + 48MP', '1 Nano SIM + 1 eSIM', 36990000, 3,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955211/pbl3_mobileshop/google-pixel-10-pro-green-variant.webp'),

-- Oppo F33 Pro (product_id: 18)
(43, 18, 'Đỏ', '128GB', '8GB', 'Dimensity 7300', '5000mAh', '2412x1080', '6.67 inch', '32MP', '50MP + 8MP + 2MP', '2 Nano SIM', 10990000, 20,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955225/pbl3_mobileshop/oppo-f33-pro-red-variant.webp'),
(44, 18, 'Trắng', '256GB', '8GB', 'Dimensity 7300', '5000mAh', '2412x1080', '6.67 inch', '32MP', '50MP + 8MP + 2MP', '2 Nano SIM', 11990000, 18,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955226/pbl3_mobileshop/oppo-f33-pro-white-variant.webp'),
(45, 18, 'Xanh', '256GB', '8GB', 'Dimensity 7300', '5000mAh', '2412x1080', '6.67 inch', '32MP', '50MP + 8MP + 2MP', '2 Nano SIM', 11990000, 15,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955224/pbl3_mobileshop/oppo-f33-pro-blue-variant.webp'),

-- Vivo Y6 (product_id: 19)
(46, 19, 'Trắng', '256GB', '8GB', 'Snapdragon 685', '5000mAh', '2400x1080', '6.64 inch', '16MP', '50MP + 2MP', '2 Nano SIM', 7990000, 25,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955235/pbl3_mobileshop/vivo-y6-white-variant.webp'),
(47, 19, 'Đen', '512GB', '8GB', 'Snapdragon 685', '5000mAh', '2400x1080', '6.64 inch', '16MP', '50MP + 2MP', '2 Nano SIM', 9490000, 22,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955235/pbl3_mobileshop/vivo-y6-black-variant.webp'),

-- Realme C100 5G (product_id: 20)
(48, 20, 'Xanh dương', '128GB', '4GB', 'Snapdragon 4 Gen 2', '5000mAh', '2400x1080', '6.72 inch', '8MP', '50MP + 2MP', '2 Nano SIM', 5990000, 30,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955227/pbl3_mobileshop/realme-c100-5g-blue-variant.webp'),
(49, 20, 'Đen', '128GB', '6GB', 'Snapdragon 4 Gen 2', '5000mAh', '2400x1080', '6.72 inch', '8MP', '50MP + 2MP', '2 Nano SIM', 6990000, 28,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955226/pbl3_mobileshop/realme-c100-5g-black-variant.webp'),

-- Samsung Galaxy A36 (product_id: 21)
(50, 21, 'Trắng', '128GB', '8GB', 'Exynos 1480', '5000mAh', '2340x1080', '6.5 inch', '13MP', '50MP + 8MP + 5MP', '2 Nano SIM', 6990000, 15,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955229/pbl3_mobileshop/samsung-galaxy-a36-white-variant.webp'),
(51, 21, 'Đen', '256GB', '8GB', 'Exynos 1480', '5000mAh', '2340x1080', '6.5 inch', '13MP', '50MP + 8MP + 5MP', '2 Nano SIM', 7990000, 18,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955228/pbl3_mobileshop/samsung-galaxy-a36-black-variant.webp'),

-- Xiaomi Poco F7 Pro (product_id: 22)
(52, 22, 'Đen Carbon', '256GB', '12GB', 'Snapdragon 8 Gen 3', '5000mAh', '3200x1440', '6.67 inch', '16MP', '50MP + 8MP + 2MP', '2 Nano SIM', 11990000, 14,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955239/pbl3_mobileshop/xiaomi-poco-f7-pro-black-variant.webp'),
(53, 22, 'Bạc', '512GB', '12GB', 'Snapdragon 8 Gen 3', '5000mAh', '3200x1440', '6.67 inch', '16MP', '50MP + 8MP + 2MP', '2 Nano SIM', 13490000, 11,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955240/pbl3_mobileshop/xiaomi-poco-f7-pro-silver-variant.webp'),

-- Infinix GT 50 Pro (product_id: 23)
(54, 23, 'Bạc', '256GB', '12GB', 'Dimensity 8200 Ultimate', '5000mAh', '2436x1080', '6.78 inch', '32MP', '108MP + 2MP + 2MP', '2 Nano SIM', 8490000, 16,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955216/pbl3_mobileshop/infinix-gt-50-pro-silver-variant.webp'),
(55, 23, 'Đen', '512GB', '12GB', 'Dimensity 8200 Ultimate', '5000mAh', '2436x1080', '6.78 inch', '32MP', '108MP + 2MP + 2MP', '2 Nano SIM', 9490000, 12,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955215/pbl3_mobileshop/infinix-gt-50-pro-black-variant.webp'),
(56, 23, 'Đỏ', '512GB', '12GB', 'Dimensity 8200 Ultimate', '5000mAh', '2436x1080', '6.78 inch', '32MP', '108MP + 2MP + 2MP', '2 Nano SIM', 9490000, 10,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955216/pbl3_mobileshop/infinix-gt-50-pro-red-variant.webp'),

-- ZTE Nubia Red Magic 10 Pro (product_id: 24)
(57, 24, 'Đen', '256GB', '12GB', 'Snapdragon 8 Gen 5', '6500mAh', '2480x1116', '6.8 inch', '16MP', '50MP + 50MP + 2MP', '2 Nano SIM', 17990000, 8,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955299/pbl3_mobileshop/zte-nubia-red-magic-10-pro-black-variant.webp'),
(58, 24, 'Bạc', '512GB', '16GB', 'Snapdragon 8 Gen 5', '6500mAh', '2480x1116', '6.8 inch', '16MP', '50MP + 50MP + 2MP', '2 Nano SIM', 21990000, 5,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955299/pbl3_mobileshop/zte-nubia-red-magic-10-pro-silver-variant.webp'),

-- Honor 600 Pro (product_id: 25)
(59, 25, 'Đen', '256GB', '12GB', 'Snapdragon 8s Gen 4', '5200mAh', '2700x1224', '6.78 inch', '50MP', '50MP + 32MP + 12MP', '2 Nano SIM', 20990000, 9,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955212/pbl3_mobileshop/honor-600-pro-black-variant.webp'),
(60, 25, 'Trắng', '512GB', '16GB', 'Snapdragon 8s Gen 4', '5200mAh', '2700x1224', '6.78 inch', '50MP', '50MP + 32MP + 12MP', '2 Nano SIM', 21990000, 6,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955213/pbl3_mobileshop/honor-600-pro-white-variant.webp'),

-- Huawei Pura 90 Pro Max (product_id: 26)
(61, 26, 'Xanh lá', '256GB', '12GB', 'Kirin 9020', '5100mAh', '2844x1260', '6.8 inch', '13MP', '50MP + 50MP + 40MP', '2 Nano SIM', 25990000, 6,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955214/pbl3_mobileshop/huawei-pure-90-pro-max-green-variant.webp'),
(62, 26, 'Đen', '512GB', '16GB', 'Kirin 9020', '5100mAh', '2844x1260', '6.8 inch', '13MP', '50MP + 50MP + 40MP', '2 Nano SIM', 33990000, 8,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955214/pbl3_mobileshop/huawei-pure-90-pro-max-black-variant.webp'),
(63, 26, 'Cam', '1TB', '16GB', 'Kirin 9020', '5100mAh', '2844x1260', '6.8 inch', '13MP', '50MP + 50MP + 40MP', '2 Nano SIM', 37990000, 4,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955215/pbl3_mobileshop/huawei-pure-90-pro-max-orange-variant.webp'),

-- Blackview Shark 6 (product_id: 27)
(64, 27, 'Xanh lá', '128GB', '4GB', 'Unisoc T606', '5000mAh', '1600x720', '6.6 inch', '8MP', '13MP + 2MP', '2 Nano SIM', 2990000, 40,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955209/pbl3_mobileshop/blackview-shark-6-green-variant.webp'),
(65, 27, 'Xanh dương', '128GB', '4GB', 'Unisoc T606', '5000mAh', '1600x720', '6.6 inch', '8MP', '13MP + 2MP', '2 Nano SIM', 2990000, 35,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955208/pbl3_mobileshop/blackview-shark-6-blue-variant.webp'),
(66, 27, 'Đen', '128GB', '4GB', 'Unisoc T606', '5000mAh', '1600x720', '6.6 inch', '8MP', '13MP + 2MP', '2 Nano SIM', 2990000, 38,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955207/pbl3_mobileshop/blackview-shark-6-black-variant.webp'),

-- Motorola Razr Ultra 2026 (product_id: 28)
(67, 28, 'Nâu gỗ', '512GB', '16GB', 'Snapdragon 8 Gen 5', '4500mAh', '2640x1080', '6.9 inch', '32MP', '50MP + 50MP', '1 Nano SIM + 1 eSIM', 27999000, 5,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955222/pbl3_mobileshop/motorola-razr-ultra-2026-brown-variant.webp'),
(68, 28, 'Xanh dương', '512GB', '16GB', 'Snapdragon 8 Gen 5', '4500mAh', '2640x1080', '6.9 inch', '32MP', '50MP + 50MP', '1 Nano SIM + 1 eSIM', 27999000, 7,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955221/pbl3_mobileshop/motorola-razr-ultra-2026-blue-variant.webp'),

-- Cubot X100 (product_id: 29)
(69, 29, 'Gold', '128GB', '8GB', 'MediaTek Helio G99', '5100mAh', '2408x1080', '6.57 inch', '16MP', '64MP + 8MP', '2 Nano SIM', 39990000, 15,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955210/pbl3_mobileshop/cubot-x100-gold-variant.webp'),

-- OnePlus Nord CE6 (product_id: 30)
(70, 30, 'Trắng', '256GB', '8GB', 'Snapdragon 7s Gen 2', '5500mAh', '2412x1080', '6.7 inch', '16MP', '50MP + 8MP', '2 Nano SIM', 8999000, 20,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955224/pbl3_mobileshop/oneplus-nord-ce6-white-variant.webp'),
(71, 30, 'Đen', '256GB', '8GB', 'Snapdragon 7s Gen 2', '5500mAh', '2412x1080', '6.7 inch', '16MP', '50MP + 8MP', '2 Nano SIM', 8999000, 22,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955222/pbl3_mobileshop/oneplus-nord-ce6-black-variant.webp'),
(72, 30, 'Xanh dương', '256GB', '8GB', 'Snapdragon 7s Gen 2', '5500mAh', '2412x1080', '6.7 inch', '16MP', '50MP + 8MP', '2 Nano SIM', 8999000, 18,
 'https://res.cloudinary.com/durs02or1/image/upload/v1778955223/pbl3_mobileshop/oneplus-nord-ce6-blue-variant.webp');
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
