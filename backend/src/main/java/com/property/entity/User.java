package com.property.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;
import java.time.LocalDateTime;

@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@Data
public class User {
    private Integer id;
    private String username;
    private String password;
    private String name;
    private String role;
    private String phone;
    private LocalDateTime createdAt;
}
