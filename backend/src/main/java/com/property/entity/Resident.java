package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class Resident {
    private Integer id;
    private Integer unitId;
    private String name;
    private String phone;
    private String idCard;
    private String type;
    private String moveInDate;
    private String status;
    private LocalDateTime createdAt;
    private String unitNumber;
    private String buildingName;
    private String communityName;
}
