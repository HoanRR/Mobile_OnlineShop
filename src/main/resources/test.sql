-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: test
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `apply_condition`
--

DROP TABLE IF EXISTS `apply_condition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apply_condition` (
  `apply_condition_id` bigint NOT NULL AUTO_INCREMENT,
  `min_value` double DEFAULT NULL,
  `voucher_id` bigint DEFAULT NULL,
  PRIMARY KEY (`apply_condition_id`),
  KEY `fk_ac_voucher` (`voucher_id`),
  CONSTRAINT `fk_ac_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apply_condition`
--

LOCK TABLES `apply_condition` WRITE;
/*!40000 ALTER TABLE `apply_condition` DISABLE KEYS */;
INSERT INTO `apply_condition` VALUES (1,500000,1),(2,1000000,2),(3,2000000,3),(4,300000,4),(5,5000000,5);
/*!40000 ALTER TABLE `apply_condition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apply_condition_variant`
--

DROP TABLE IF EXISTS `apply_condition_variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apply_condition_variant` (
  `apply_condition_id` bigint NOT NULL,
  `product_variant_id` bigint NOT NULL,
  KEY `fk_acv_condition` (`apply_condition_id`),
  KEY `fk_acv_variant` (`product_variant_id`),
  CONSTRAINT `fk_acv_condition` FOREIGN KEY (`apply_condition_id`) REFERENCES `apply_condition` (`apply_condition_id`),
  CONSTRAINT `fk_acv_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apply_condition_variant`
--

LOCK TABLES `apply_condition_variant` WRITE;
/*!40000 ALTER TABLE `apply_condition_variant` DISABLE KEYS */;
INSERT INTO `apply_condition_variant` VALUES (1,1),(1,2),(2,3),(2,4),(3,1),(3,3),(4,5),(4,7),(5,2),(5,4);
/*!40000 ALTER TABLE `apply_condition_variant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `cart_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `update_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (1,2,'2025-04-01 10:00:00.000000'),(2,3,'2025-04-02 11:00:00.000000'),(3,4,'2025-04-03 09:30:00.000000'),(4,5,'2025-04-04 14:00:00.000000');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_detail`
--

DROP TABLE IF EXISTS `cart_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_detail` (
  `cart_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `cart_id` bigint DEFAULT NULL,
  `product_variant_id` bigint DEFAULT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`cart_detail_id`),
  KEY `fk_cd_cart` (`cart_id`),
  KEY `fk_cd_variant` (`product_variant_id`),
  CONSTRAINT `fk_cd_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`cart_id`),
  CONSTRAINT `fk_cd_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_detail`
--

LOCK TABLES `cart_detail` WRITE;
/*!40000 ALTER TABLE `cart_detail` DISABLE KEYS */;
INSERT INTO `cart_detail` VALUES (1,1,1,1),(2,1,5,2),(3,2,3,1),(4,3,7,1),(5,4,2,1),(6,4,6,1);
/*!40000 ALTER TABLE `cart_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device` (
  `device_id` bigint NOT NULL AUTO_INCREMENT,
  `imei` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT NULL,
  `product_variant_id` bigint DEFAULT NULL,
  PRIMARY KEY (`device_id`),
  UNIQUE KEY `imei` (`imei`),
  KEY `fk_device_variant` (`product_variant_id`),
  CONSTRAINT `fk_device_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device`
--

LOCK TABLES `device` WRITE;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` VALUES (1,'354321010000001','AVAILABLE',1),(2,'354321010000002','AVAILABLE',1),(3,'354321010000003','SOLD',1),(4,'354321020000001','AVAILABLE',2),(5,'354321020000002','AVAILABLE',2),(6,'354322010000001','AVAILABLE',3),(7,'354322010000002','SOLD',3),(8,'354322020000001','AVAILABLE',4),(9,'354323010000001','AVAILABLE',5),(10,'354324010000001','AVAILABLE',6),(11,'354325010000001','SOLD',7),(12,'354325010000002','AVAILABLE',7);
/*!40000 ALTER TABLE `device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order` (
  `order_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `voucher_id` bigint DEFAULT NULL,
  `receiver_name` varchar(255) NOT NULL,
  `receiver_phone` varchar(20) NOT NULL,
  `shipping_address` varchar(500) NOT NULL,
  `total_amount` double NOT NULL,
  `discount_amount` double DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `order_status` varchar(20) DEFAULT NULL,
  `is_paid` bit(1) DEFAULT NULL,
  `order_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  KEY `fk_order_user` (`user_id`),
  KEY `fk_order_voucher` (`voucher_id`),
  CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_order_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
INSERT INTO `order` VALUES (1,2,1,'Nguyễn Văn A','0911111111','123 Lê Lợi, Q1, TP.HCM',34990000,3499000,'COD','DELIVERED',_binary '','2025-03-10 09:00:00.000000'),(2,3,2,'Trần Thị B','0922222222','45 Nguyễn Huệ, Q1, TP.HCM',33990000,6798000,'BANK_TRANSFER','DELIVERED',_binary '','2025-03-15 14:30:00.000000'),(3,4,NULL,'Lê Văn C','0933333333','78 Trần Phú, Đà Nẵng',29990000,NULL,'COD','SHIPPING',_binary '\0','2025-04-01 10:00:00.000000'),(4,2,3,'Nguyễn Văn A','0911111111','123 Lê Lợi, Q1, TP.HCM',38990000,19495000,'MOMO','PENDING',_binary '\0','2025-04-05 16:00:00.000000'),(5,5,4,'Phạm Thị D','0944444444','99 Hoàng Diệu, Hải Phòng',24990000,3748500,'BANK_TRANSFER','DELIVERED',_binary '','2025-03-20 08:00:00.000000');
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_detail` (
  `order_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `order_id` bigint DEFAULT NULL,
  `device_id` bigint DEFAULT NULL,
  `variant_id` bigint DEFAULT NULL,
  `price_at_purchase` double DEFAULT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `fk_od_order` (`order_id`),
  KEY `fk_od_device` (`device_id`),
  KEY `fk_od_variant` (`variant_id`),
  CONSTRAINT `fk_od_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`),
  CONSTRAINT `fk_od_order` FOREIGN KEY (`order_id`) REFERENCES `order` (`order_id`),
  CONSTRAINT `fk_od_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_detail`
--

LOCK TABLES `order_detail` WRITE;
/*!40000 ALTER TABLE `order_detail` DISABLE KEYS */;
INSERT INTO `order_detail` VALUES (1,1,3,1,34990000),(2,2,7,3,33990000),(3,3,9,5,29990000),(4,4,4,2,38990000),(5,5,11,7,24990000);
/*!40000 ALTER TABLE `order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_id` bigint NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `product_image_link` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'iPhone 15 Pro Max','Apple','https://example.com/iphone15promax.jpg'),(2,'Samsung Galaxy S24 Ultra','Samsung','https://example.com/s24ultra.jpg'),(3,'Xiaomi 14 Ultra','Xiaomi','https://example.com/xiaomi14ultra.jpg'),(4,'OPPO Find X7 Pro','OPPO','https://example.com/findx7pro.jpg'),(5,'Google Pixel 9 Pro','Google','https://example.com/pixel9pro.jpg');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_review`
--

DROP TABLE IF EXISTS `product_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_review` (
  `product_review_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `product_variant_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `comment` varchar(1000) NOT NULL,
  `is_purchased` bit(1) DEFAULT NULL,
  `review_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`product_review_id`),
  KEY `fk_pr_product` (`product_id`),
  KEY `fk_pr_variant` (`product_variant_id`),
  KEY `fk_pr_user` (`user_id`),
  CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`),
  CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `fk_pr_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_review`
--

LOCK TABLES `product_review` WRITE;
/*!40000 ALTER TABLE `product_review` DISABLE KEYS */;
INSERT INTO `product_review` VALUES (1,1,1,2,5,'Máy rất đẹp, hiệu năng mạnh, pin tốt!',_binary '','2025-03-20 10:00:00.000000'),(2,2,3,3,4,'Camera đỉnh, màn hình sắc nét, hơi nặng một chút.',_binary '','2025-03-25 15:00:00.000000'),(3,3,5,4,5,'Giá tốt, cấu hình cao, rất hài lòng.',_binary '','2025-04-10 09:00:00.000000'),(4,5,7,5,4,'Pixel 9 Pro chụp ảnh đẹp, Android thuần.',_binary '','2025-03-28 11:00:00.000000'),(5,1,2,3,4,'Bản 512GB xứng đáng với giá tiền.',_binary '\0','2025-04-01 08:30:00.000000');
/*!40000 ALTER TABLE `product_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variant`
--

DROP TABLE IF EXISTS `product_variant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variant` (
  `product_variant_id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `storage_capacity` bigint DEFAULT NULL,
  `ram` varchar(100) DEFAULT NULL,
  `chip` varchar(100) DEFAULT NULL,
  `battery_capacity` bigint DEFAULT NULL,
  `resolution` varchar(100) DEFAULT NULL,
  `price` double NOT NULL,
  `total_available` bigint NOT NULL,
  `variant_image_link` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`product_variant_id`),
  KEY `fk_pv_product` (`product_id`),
  CONSTRAINT `fk_pv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variant`
--

LOCK TABLES `product_variant` WRITE;
/*!40000 ALTER TABLE `product_variant` DISABLE KEYS */;
INSERT INTO `product_variant` VALUES (1,1,'Black Titanium',256,'8GB','A17 Pro',4422,'2796x1290',34990000,50,'https://example.com/ip15pm_black.jpg'),(2,1,'White Titanium',512,'8GB','A17 Pro',4422,'2796x1290',38990000,30,'https://example.com/ip15pm_white.jpg'),(3,2,'Titanium Gray',256,'12GB','Snapdragon 8 Gen 3',5000,'3088x1440',33990000,40,'https://example.com/s24u_gray.jpg'),(4,2,'Titanium Yellow',512,'12GB','Snapdragon 8 Gen 3',5000,'3088x1440',37990000,20,'https://example.com/s24u_yellow.jpg'),(5,3,'Black',256,'16GB','Snapdragon 8 Gen 3',5000,'3200x1440',29990000,35,'https://example.com/xm14u_black.jpg'),(6,4,'Silver',256,'12GB','Dimensity 9300',5000,'3168x1440',27990000,25,'https://example.com/findx7_silver.jpg'),(7,5,'Hazel',128,'12GB','Tensor G4',4700,'2992x1344',24990000,45,'https://example.com/pixel9pro_hazel.jpg');
/*!40000 ALTER TABLE `product_variant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `roles` varchar(20) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin','Nguyễn Quản Trị','admin@shop.vn','$2a$10$hashAdmin','0900000001','ADMIN'),(2,'nguyenvana','Nguyễn Văn A','vana@gmail.com','$2a$10$hashVanA','0911111111','USER'),(3,'tranthib','Trần Thị B','thib@gmail.com','$2a$10$hashThiB','0922222222','USER'),(4,'levanc','Lê Văn C','vanc@gmail.com','$2a$10$hashVanC','0933333333','USER'),(5,'phamthid','Phạm Thị D','thid@gmail.com','$2a$10$hashThiD','0944444444','USER');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `voucher_id` bigint NOT NULL AUTO_INCREMENT,
  `voucher_code` varchar(50) NOT NULL,
  `discount_percentage` double NOT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `usage_limit` bigint DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `voucher_code` (`voucher_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
INSERT INTO `voucher` VALUES (1,'SALE10',10,'2025-01-01 00:00:00.000000','2025-12-31 23:59:59.000000',100),(2,'SUMMER20',20,'2025-06-01 00:00:00.000000','2025-08-31 23:59:59.000000',50),(3,'FLASH50',50,'2025-04-01 00:00:00.000000','2025-04-30 23:59:59.000000',20),(4,'NEWUSER15',15,'2025-01-01 00:00:00.000000','2026-01-01 00:00:00.000000',200),(5,'VIP30',30,'2025-03-01 00:00:00.000000','2025-12-31 23:59:59.000000',30);
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warranty`
--

DROP TABLE IF EXISTS `warranty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warranty` (
  `warranty_id` bigint NOT NULL AUTO_INCREMENT,
  `device_id` bigint DEFAULT NULL,
  `warranty_month` int DEFAULT NULL,
  `start_date` datetime(6) DEFAULT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`warranty_id`),
  KEY `fk_warranty_device` (`device_id`),
  CONSTRAINT `fk_warranty_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warranty`
--

LOCK TABLES `warranty` WRITE;
/*!40000 ALTER TABLE `warranty` DISABLE KEYS */;
INSERT INTO `warranty` VALUES (1,3,12,'2025-03-10 00:00:00.000000','2026-03-10 00:00:00.000000'),(2,7,12,'2025-03-15 00:00:00.000000','2026-03-15 00:00:00.000000'),(3,9,12,'2025-04-01 00:00:00.000000','2026-04-01 00:00:00.000000'),(4,4,24,'2025-04-05 00:00:00.000000','2027-04-05 00:00:00.000000'),(5,11,12,'2025-03-20 00:00:00.000000','2026-03-20 00:00:00.000000');
/*!40000 ALTER TABLE `warranty` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21  1:41:21
