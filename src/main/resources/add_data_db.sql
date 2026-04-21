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
INSERT INTO `user` VALUES
(1, 'admin',      'Nguyễn Quản Trị', 'admin@shop.vn',   '$2a$10$gFd2tfwrmXW2mJw0koh2j.ulKFlTYcohJvj8Gg.6lkWS7d/H1qphu.', '0900000001', 'ADMIN'),
(2, 'nguyenvana', 'Nguyễn Văn A',    'vana@gmail.com',  '$2a$10$cyZRV9znuUt5HFo/bI422.4B/vxKu2E6vmHjrekd/adEa2LbgxZ9q', '0911111111', 'EMPLOYEE'),
(3, 'tranthib',   'Trần Thị B',      'thib@gmail.com',  '$2a$10$gFd2tfwrmXW2mJw0koh2j.ulKFlTYcohJvj8Gg.6lkWS7d/H1qphu', '0922222222', 'CUSTOMER'),
(4, 'levanc',     'Lê Văn C',        'vanc@gmail.com',  '$2a$10$sf/R07qS5J7f424ybNR4A.W1IYBkJxwXB3IQl/45fC2D0v7fG1buG', '0933333333', 'CUSTOMER'),
(5, 'phamthid',   'Phạm Thị D',      'thid@gmail.com',  '$2a$10$sf/R07qS5J7f424ybNR4A.W1IYBkJxwXB3IQl/45fC2D0v7fG1buG', '0944444444', 'CUSTOMER');
UNLOCK TABLES;

-- ============================================================
-- product
-- ============================================================
LOCK TABLES `product` WRITE;
INSERT INTO `product` VALUES
(1, 'iPhone 15 Pro Max', 'Apple',   'https://example.com/iphone15promax.jpg'),
(2, 'Samsung Galaxy S24 Ultra', 'Samsung', 'https://example.com/s24ultra.jpg'),
(3, 'Xiaomi 14 Ultra',   'Xiaomi',  'https://example.com/xiaomi14ultra.jpg'),
(4, 'OPPO Find X7 Pro',  'OPPO',    'https://example.com/findx7pro.jpg'),
(5, 'Google Pixel 9 Pro','Google',  'https://example.com/pixel9pro.jpg');
UNLOCK TABLES;

-- ============================================================
-- product_variant
-- ============================================================
LOCK TABLES `product_variant` WRITE;
INSERT INTO `product_variant` VALUES
(1, 1, 'Black Titanium',  256, '8GB',  'A17 Pro',              4422, '2796x1290', 34990000, 50, 'https://example.com/ip15pm_black.jpg'),
(2, 1, 'White Titanium',  512, '8GB',  'A17 Pro',              4422, '2796x1290', 38990000, 30, 'https://example.com/ip15pm_white.jpg'),
(3, 2, 'Titanium Gray',   256, '12GB', 'Snapdragon 8 Gen 3',   5000, '3088x1440', 33990000, 40, 'https://example.com/s24u_gray.jpg'),
(4, 2, 'Titanium Yellow', 512, '12GB', 'Snapdragon 8 Gen 3',   5000, '3088x1440', 37990000, 20, 'https://example.com/s24u_yellow.jpg'),
(5, 3, 'Black',           256, '16GB', 'Snapdragon 8 Gen 3',   5000, '3200x1440', 29990000, 35, 'https://example.com/xm14u_black.jpg'),
(6, 4, 'Silver',          256, '12GB', 'Dimensity 9300',        5000, '3168x1440', 27990000, 25, 'https://example.com/findx7_silver.jpg'),
(7, 5, 'Hazel',           128, '12GB', 'Tensor G4',             4700, '2992x1344', 24990000, 45, 'https://example.com/pixel9pro_hazel.jpg');
UNLOCK TABLES;

-- ============================================================
-- device
-- ============================================================
LOCK TABLES `device` WRITE;
INSERT INTO `device` VALUES
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
INSERT INTO `voucher` VALUES
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
INSERT INTO `apply_condition` VALUES
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
INSERT INTO `apply_condition_variant` VALUES
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
INSERT INTO `cart` VALUES
(1, 2, '2025-04-01 10:00:00.000000'),
(2, 3, '2025-04-02 11:00:00.000000'),
(3, 4, '2025-04-03 09:30:00.000000'),
(4, 5, '2025-04-04 14:00:00.000000');
UNLOCK TABLES;

-- ============================================================
-- cart_detail
-- ============================================================
LOCK TABLES `cart_detail` WRITE;
INSERT INTO `cart_detail` VALUES
(1, 1, 1, 1),
(2, 1, 5, 2),
(3, 2, 3, 1),
(4, 3, 7, 1),
(5, 4, 2, 1),
(6, 4, 6, 1);
UNLOCK TABLES;

-- ============================================================
-- order
-- ============================================================
LOCK TABLES `order` WRITE;
INSERT INTO `order` VALUES
(1, 2, 1, 'Nguyễn Văn A', '0911111111', '123 Lê Lợi, Q1, TP.HCM',   34990000,  3499000, 'COD',           'DELIVERED', b'1', '2025-03-10 09:00:00.000000'),
(2, 3, 2, 'Trần Thị B',   '0922222222', '45 Nguyễn Huệ, Q1, TP.HCM', 33990000,  6798000, 'BANK_TRANSFER', 'DELIVERED', b'1', '2025-03-15 14:30:00.000000'),
(3, 4, NULL,'Lê Văn C',   '0933333333', '78 Trần Phú, Đà Nẵng',       29990000,     NULL, 'COD',           'SHIPPING',  b'0', '2025-04-01 10:00:00.000000'),
(4, 2, 3, 'Nguyễn Văn A', '0911111111', '123 Lê Lợi, Q1, TP.HCM',   38990000, 19495000, 'MOMO',          'PENDING',   b'0', '2025-04-05 16:00:00.000000'),
(5, 5, 4, 'Phạm Thị D',   '0944444444', '99 Hoàng Diệu, Hải Phòng',  24990000,  3748500, 'BANK_TRANSFER', 'DELIVERED', b'1', '2025-03-20 08:00:00.000000');
UNLOCK TABLES;

-- ============================================================
-- order_detail
-- ============================================================
LOCK TABLES `order_detail` WRITE;
INSERT INTO `order_detail` VALUES
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
INSERT INTO `product_review` VALUES
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
INSERT INTO `warranty` VALUES
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
