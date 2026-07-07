package com.property.mapper;

import com.property.entity.RepairOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface RepairMapper {
    List<RepairOrder> findAll(@Param("status") String status, @Param("category") String category);
    RepairOrder findById(Integer id);
    int insert(RepairOrder order);
    int update(RepairOrder order);
    int deleteById(Integer id);
    List<RepairOrder> findRecent(int limit);
}
