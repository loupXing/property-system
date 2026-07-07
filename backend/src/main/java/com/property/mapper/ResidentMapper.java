package com.property.mapper;

import com.property.entity.Resident;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ResidentMapper {
    List<Resident> findAll(@Param("unitId") Integer unitId, @Param("status") String status);
    Resident findById(Integer id);
    int insert(Resident resident);
    int update(Resident resident);
    int deleteById(Integer id);
}
