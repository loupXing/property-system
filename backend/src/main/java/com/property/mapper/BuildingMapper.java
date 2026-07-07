package com.property.mapper;

import com.property.entity.Building;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface BuildingMapper {
    List<Building> findAll(@Param("communityId") Integer communityId);
    Building findById(Integer id);
    int insert(Building building);
    int update(Building building);
    int deleteById(Integer id);
}
