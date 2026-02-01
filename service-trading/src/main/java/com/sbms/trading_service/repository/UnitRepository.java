package com.sbms.trading_service.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sbms.trading_service.entity.Unit;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    Optional<Unit> findByNameAndBusinessId(String name, UUID businessId);
}
