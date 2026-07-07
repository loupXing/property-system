package com.property.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import com.property.entity.Bill;
import java.util.List;

@Mapper
public interface DashboardMapper {
    @Select("SELECT COUNT(*) FROM communities")
    int countCommunities();

    @Select("SELECT COUNT(*) FROM buildings")
    int countBuildings();

    @Select("SELECT COUNT(*) FROM units")
    int countUnits();

    @Select("SELECT COUNT(*) FROM residents WHERE status = '在住'")
    int countResidents();

    @Select("SELECT COUNT(*) FROM units WHERE status = '空置'")
    int countVacantUnits();

    @Select("SELECT COUNT(*) FROM bills WHERE status = '未缴'")
    int countUnpaidBills();

    @Select("SELECT COUNT(*) FROM repair_orders WHERE status IN ('待处理', '处理中')")
    int countPendingRepairs();

    @Select("SELECT COUNT(*) FROM parking_spaces")
    int countParkingTotal();

    @Select("SELECT COUNT(*) FROM parking_spaces WHERE status = '已租'")
    int countParkingOccupied();

    List<Bill> findRecentBills(int limit);
}
