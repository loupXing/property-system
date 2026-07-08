package com.property.mapper;

import com.property.entity.ParkingSpace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ParkingMapper {
    List<ParkingSpace> findAll(@Param("communityId") Integer communityId, @Param("status") String status);
    ParkingSpace findById(Integer id);
    int insert(ParkingSpace space);
    int update(ParkingSpace space);
    int deleteById(Integer id);
}
