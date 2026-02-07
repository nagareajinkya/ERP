package com.sbms.trading_service.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.sbms.trading_service.enums.TransactionType;
import com.sbms.trading_service.enums.PaymentMode;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@AttributeOverride(name = "id", column = @Column(name = "transaction_id"))
public class Transaction extends BaseEntity {

    @Column(name = "party_id")
    private Long partyId; 

    @Column(name = "party_name")
    private String partyName;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // SALE, PURCHASE, RECEIPT, PAYMENT

    // Financials
    @Column(precision = 10, scale = 2)
    private BigDecimal subTotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal paidAmount;

    // Settlement Information (for RECEIPT/PAYMENT types)
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode")
    private PaymentMode paymentMode;

    @Column(name = "reference_number")
    private String referenceNumber;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Relations
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionProduct> products = new ArrayList<>();

    public void addProduct(TransactionProduct product) {
        products.add(product);
        product.setTransaction(this);
    }

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionOffer> offers = new ArrayList<>();

    public void addOffer(TransactionOffer offer) {
        offers.add(offer);
        offer.setTransaction(this);
    }
}
