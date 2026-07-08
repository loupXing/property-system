package com.property.controller;

import com.property.entity.Bill;
import com.property.entity.RepairOrder;
import com.property.mapper.DashboardMapper;
import com.property.mapper.FeeMapper;
import com.property.mapper.RepairMapper;
import com.property.vo.DashboardVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardMapper dashboardMapper;
    private final FeeMapper feeMapper;
    private final RepairMapper repairMapper;

    public DashboardController(DashboardMapper dashboardMapper, FeeMapper feeMapper, RepairMapper repairMapper) {
        this.dashboardMapper = dashboardMapper;
        this.feeMapper = feeMapper;
        this.repairMapper = repairMapper;
    }

    @GetMapping
    public DashboardVO dashboard() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("communityCount", dashboardMapper.countCommunities());
        stats.put("buildingCount", dashboardMapper.countBuildings());
        stats.put("unitCount", dashboardMapper.countUnits());
        stats.put("residentCount", dashboardMapper.countResidents());
        stats.put("vacantUnits", dashboardMapper.countVacantUnits());
        stats.put("unpaidBills", dashboardMapper.countUnpaidBills());
        stats.put("unpaidAmount", feeMapper.countUnpaidAmount().get("total"));
        stats.put("paidAmount", feeMapper.countPaidAmount().get("total"));
        stats.put("pendingRepairs", dashboardMapper.countPendingRepairs());
        stats.put("parkingTotal", dashboardMapper.countParkingTotal());
        stats.put("parkingOccupied", dashboardMapper.countParkingOccupied());

        List<RepairOrder> recentRepairs = repairMapper.findRecent(5);
        List<Bill> recentBills = dashboardMapper.findRecentBills(5);

        DashboardVO vo = new DashboardVO();
        vo.setStats(stats);
        vo.setRecentRepairs(recentRepairs);
        vo.setRecentBills(recentBills);
        return vo;
    }
}
