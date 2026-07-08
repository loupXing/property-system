package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class ParkingSpace {
    private Integer id;
    private Integer communityId;
    private String spaceNumber;
    private String type;
    private String status;
    private Integer unitId;
    private Double monthlyFee;
    private LocalDateTime createdAt;
    private String communityName;
    private String unitNumber;
}
