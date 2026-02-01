package com.sbms.trading_service.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "units")
@Data
@EqualsAndHashCode(callSuper = true)
@AttributeOverride(name = "id", column = @Column(name = "unit_id"))
public class Unit extends BaseEntity {

    @Column(name = "unit", nullable = false)
    private String name; // e.g. "kg", "pcs"
}