package com.sbms.trading_service.repository;

import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.sbms.trading_service.entity.Transaction;

import org.springframework.data.repository.query.Param;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t.partyId, SUM(t.totalAmount) FROM Transaction t WHERE t.businessId = :businessId AND UPPER(t.type) = 'SALE' GROUP BY t.partyId ORDER BY SUM(t.totalAmount) DESC")
    List<Object[]> findTopSpenders(@Param("businessId") UUID businessId);

    @Query("SELECT t.partyId, COUNT(t) FROM Transaction t WHERE t.businessId = :businessId GROUP BY t.partyId ORDER BY COUNT(t) DESC")
    List<Object[]> findFrequentVisitors(@Param("businessId") UUID businessId);

    // standard method for "All" types
    List<Transaction> findByBusinessIdAndPartyNameContainingIgnoreCaseAndDateBetweenOrderByDateDesc(
        UUID businessId, String partyName, LocalDate startDate, LocalDate endDate
    );

    // standard method for specific "Type" (today,yesterday,this week,this month)
    List<Transaction> findByBusinessIdAndPartyNameContainingIgnoreCaseAndTypeAndDateBetweenOrderByDateDesc(
        UUID businessId, String partyName, String type, LocalDate startDate, LocalDate endDate
    );

    // Find by Party ID
    List<Transaction> findByBusinessIdAndPartyIdOrderByDateDesc(UUID businessId, Long partyId);

    // Order by createdAt (date + time) to ensure proper descending chronology
    @Query("SELECT t FROM Transaction t JOIN t.products tp WHERE tp.product.id = :productId AND t.type = :type AND t.businessId = :businessId ORDER BY t.createdAt DESC")
    List<Transaction> findTransactionsByProductAndType(
        @Param("productId") Long productId,
        @Param("type") String type,
        @Param("businessId") UUID businessId
    );
}
