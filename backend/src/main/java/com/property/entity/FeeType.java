package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class FeeType {
    private Integer id;
    private String name;
    private Double unitPrice;
    private String unit;
    private String description;
    private LocalDateTime createdAt;
}
