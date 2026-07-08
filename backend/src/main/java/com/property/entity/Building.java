package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class Building {
    private Integer id;
    private Integer communityId;
    private String name;
    private Integer floors;
    private Integer unitsPerFloor;
    private String description;
    private LocalDateTime createdAt;
    private String communityName;
    private Integer unitCount;
}
