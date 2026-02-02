package com.sbms.trading_service.repository;

import com.sbms.trading_service.entity.Party;
import com.sbms.trading_service.entity.PartyType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PartyRepository extends JpaRepository<Party, Long> {
    List<Party> findByBusinessIdAndPartyType(UUID businessId, PartyType partyType);
    boolean existsByIdAndBusinessId(Long id, UUID businessId);
}