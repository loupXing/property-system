package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class Bill {
    private Integer id;
    private Integer unitId;
    private Integer feeTypeId;
    private Double amount;
    private String period;
    private String status;
    private String dueDate;
    private String paidAt;
    private LocalDateTime createdAt;
    private String unitNumber;
    private String buildingName;
    private String communityName;
    private String feeTypeName;
}
