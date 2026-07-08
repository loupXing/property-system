package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class Community {
    private Integer id;
    private String name;
    private String address;
    private Double area;
    private Integer buildingCount;
    private Integer unitCount;
    private String contactPhone;
    private String description;
    private LocalDateTime createdAt;
}
