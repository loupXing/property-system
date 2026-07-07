package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class RepairOrder {
    private Integer id;
    private Integer unitId;
    private Integer residentId;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String handler;
    private String result;
    private LocalDateTime createdAt;
    private String completedAt;
    private String unitNumber;
    private String buildingName;
    private String communityName;
    private String residentName;
}
