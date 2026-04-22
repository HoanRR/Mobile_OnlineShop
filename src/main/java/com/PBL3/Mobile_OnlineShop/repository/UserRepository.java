package com.PBL3.Mobile_OnlineShop.repository;

import com.PBL3.Mobile_OnlineShop.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.PBL3.Mobile_OnlineShop.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA sẽ tự động tạo câu lệnh SQL (SELECT count(*) ...)
    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    Boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    @Query("SELECT u FROM User u WHERE " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<User> findUsersWithFilters(@Param("role") Role role, @Param("search") String search, Pageable pageable);
}