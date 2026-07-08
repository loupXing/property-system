package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class Unit {
    private Integer id;
    private Integer buildingId;
    private String unitNumber;
    private Integer floor;
    private Double area;
    private String type;
    private String status;
    private LocalDateTime createdAt;
    private String buildingName;
    private String communityName;
    private String residentName;
}
