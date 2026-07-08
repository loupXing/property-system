package com.property.mapper;

import com.property.entity.Unit;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UnitMapper {
    List<Unit> findAll(@Param("communityId") Integer communityId,
                       @Param("buildingId") Integer buildingId,
                       @Param("status") String status);
    Unit findById(Integer id);
    int insert(Unit unit);
    int update(Unit unit);
    int deleteById(Integer id);
    int updateStatus(@Param("id") Integer id, @Param("status") String status);
}
