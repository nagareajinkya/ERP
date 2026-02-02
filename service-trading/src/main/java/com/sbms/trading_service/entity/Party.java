package com.sbms.trading_service.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "parties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Immutable
public class Party {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "party_id")
    private Long id;

    @Column(nullable = false)
    private UUID businessId; 

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", nullable = false)
    private PartyType partyType;

    @Column(name = "party_name", nullable = false)
    private String name;

    private String phoneNumber;
    
    private String city;
    
    private String gstin;

    @Column(precision = 12, scale = 2)
    private BigDecimal currentBalance;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}