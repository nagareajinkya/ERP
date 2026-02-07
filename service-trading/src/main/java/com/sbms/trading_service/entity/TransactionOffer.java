package com.sbms.trading_service.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transaction_offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransactionOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(name = "offer_id", nullable = false)
    private String offerId; // MongoDB ID from Smart Ops

    @Column(name = "offer_name")
    private String offerName;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount;
}
