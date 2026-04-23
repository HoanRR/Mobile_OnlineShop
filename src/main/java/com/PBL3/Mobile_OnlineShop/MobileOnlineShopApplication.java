package com.PBL3.Mobile_OnlineShop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class MobileOnlineShopApplication {
	public static void main(String[] args) {
		SpringApplication.run(MobileOnlineShopApplication.class, args);
	}
}