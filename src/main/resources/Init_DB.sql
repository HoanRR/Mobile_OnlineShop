-- ============================================================
-- Init_DB.sql
-- Mục đích: Tạo cấu trúc CSDL (chỉ bảng, không có dữ liệu)
-- Thứ tự DROP phải ngược với thứ tự tạo (tránh lỗi FK)
-- ============================================================

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



-- ============================================================
-- CREATE TABLE IF NOT EXISTS theo thứ tự: cha trước, con sau
-- ============================================================

CREATE TABLE IF NOT EXISTS `user` (
  `user_id`      BIGINT       NOT NULL AUTO_INCREMENT,
  `username`     VARCHAR(100) NOT NULL,
  `name`         VARCHAR(255) DEFAULT NULL,
  `email`        VARCHAR(255) NOT NULL,
  `password`     VARCHAR(255) NOT NULL,
  `phone_number` VARCHAR(20)  NOT NULL,
  `roles`        VARCHAR(20)  NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_user_email`        (`email`),
  UNIQUE KEY `uq_user_phone`        (`phone_number`),
  UNIQUE KEY `uq_user_username`     (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `invalidated_token` (
  `id`          VARCHAR(255) NOT NULL,
  `expiry_time` DATETIME(6)  DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `product` (
  `product_id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `product_name`       VARCHAR(255) NOT NULL,
  `brand`              VARCHAR(255) DEFAULT NULL,
  `product_image_link` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `product_variant` (
  `product_variant_id` BIGINT       NOT NULL AUTO_INCREMENT,
  `product_id`         BIGINT       DEFAULT NULL,
  `color`              VARCHAR(100) DEFAULT NULL,
  `storage_capacity`   BIGINT       DEFAULT NULL,
  `ram`                VARCHAR(100) DEFAULT NULL,
  `chip`               VARCHAR(100) DEFAULT NULL,
  `battery_capacity`   BIGINT       DEFAULT NULL,
  `resolution`         VARCHAR(100) DEFAULT NULL,
  `price`              DOUBLE       NOT NULL,
  `total_available`    BIGINT       NOT NULL,
  `variant_image_link` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`product_variant_id`),
  CONSTRAINT `fk_pv_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `device` (
  `device_id`          BIGINT      NOT NULL AUTO_INCREMENT,
  `imei`               VARCHAR(50) NOT NULL,
  `status`             VARCHAR(20) DEFAULT NULL,
  `product_variant_id` BIGINT      DEFAULT NULL,
  PRIMARY KEY (`device_id`),
  UNIQUE KEY `uq_device_imei` (`imei`),
  CONSTRAINT `fk_device_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `voucher` (
  `voucher_id`          BIGINT      NOT NULL AUTO_INCREMENT,
  `voucher_code`        VARCHAR(50) NOT NULL,
  `discount_percentage` DOUBLE      NOT NULL,
  `start_date`          DATETIME(6) DEFAULT NULL,
  `end_date`            DATETIME(6) DEFAULT NULL,
  `usage_limit`         BIGINT      DEFAULT NULL,
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `uq_voucher_code` (`voucher_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `apply_condition` (
  `apply_condition_id` BIGINT NOT NULL AUTO_INCREMENT,
  `min_value`          DOUBLE DEFAULT NULL,
  `voucher_id`         BIGINT DEFAULT NULL,
  PRIMARY KEY (`apply_condition_id`),
  CONSTRAINT `fk_ac_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `apply_condition_variant` (
  `apply_condition_id` BIGINT NOT NULL,
  `product_variant_id` BIGINT NOT NULL,
  CONSTRAINT `fk_acv_condition` FOREIGN KEY (`apply_condition_id`) REFERENCES `apply_condition` (`apply_condition_id`),
  CONSTRAINT `fk_acv_variant`   FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id`   BIGINT      NOT NULL AUTO_INCREMENT,
  `user_id`   BIGINT      DEFAULT NULL,
  `update_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `uq_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `cart_detail` (
  `cart_detail_id`     BIGINT NOT NULL AUTO_INCREMENT,
  `cart_id`            BIGINT DEFAULT NULL,
  `product_variant_id` BIGINT DEFAULT NULL,
  `quantity`           INT    NOT NULL,
  PRIMARY KEY (`cart_detail_id`),
  CONSTRAINT `fk_cd_cart`    FOREIGN KEY (`cart_id`)            REFERENCES `cart`            (`cart_id`),
  CONSTRAINT `fk_cd_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `orders` (
  `order_id`         BIGINT       NOT NULL AUTO_INCREMENT,
  `user_id`          BIGINT       DEFAULT NULL,
  `voucher_id`       BIGINT       DEFAULT NULL,
  `receiver_name`    VARCHAR(255) NOT NULL,
  `receiver_phone`   VARCHAR(20)  NOT NULL,
  `shipping_address` VARCHAR(500) NOT NULL,
  `total_amount`     DOUBLE       NOT NULL,
  `discount_amount`  DOUBLE       DEFAULT NULL,
  `payment_method`   VARCHAR(20)  DEFAULT NULL,
  `order_status`     VARCHAR(20)  DEFAULT NULL,
  `is_paid`          BIT(1)       DEFAULT NULL,
  `order_date`       DATETIME(6)  DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  CONSTRAINT `fk_order_user`    FOREIGN KEY (`user_id`)    REFERENCES `user`    (`user_id`),
  CONSTRAINT `fk_order_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `order_detail` (
  `order_detail_id`   BIGINT NOT NULL AUTO_INCREMENT,
  `order_id`          BIGINT DEFAULT NULL,
  `device_id`         BIGINT DEFAULT NULL,
  `variant_id`        BIGINT DEFAULT NULL,
  `price_at_purchase` DOUBLE DEFAULT NULL,
  PRIMARY KEY (`order_detail_id`),
  CONSTRAINT `fk_od_order`   FOREIGN KEY (`order_id`)   REFERENCES `orders`           (`order_id`),
  CONSTRAINT `fk_od_device`  FOREIGN KEY (`device_id`)  REFERENCES `device`          (`device_id`),
  CONSTRAINT `fk_od_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variant` (`product_variant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `product_review` (
  `product_review_id`  BIGINT       NOT NULL AUTO_INCREMENT,
  `product_id`         BIGINT       NOT NULL,
  `product_variant_id` BIGINT       DEFAULT NULL,
  `user_id`            BIGINT       NOT NULL,
  `rating`             INT          NOT NULL,
  `comment`            VARCHAR(1000) NOT NULL,
  `is_purchased`       BIT(1)       DEFAULT NULL,
  `review_date`        DATETIME(6)  DEFAULT NULL,
  PRIMARY KEY (`product_review_id`),
  CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`)         REFERENCES `product`         (`product_id`),
  CONSTRAINT `fk_pr_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variant` (`product_variant_id`),
  CONSTRAINT `fk_pr_user`    FOREIGN KEY (`user_id`)            REFERENCES `user`            (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `warranty` (
  `warranty_id`    BIGINT NOT NULL AUTO_INCREMENT,
  `device_id`      BIGINT DEFAULT NULL,
  `warranty_month` INT    DEFAULT NULL,
  `start_date`     DATETIME(6) DEFAULT NULL,
  `end_date`       DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`warranty_id`),
  CONSTRAINT `fk_warranty_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
