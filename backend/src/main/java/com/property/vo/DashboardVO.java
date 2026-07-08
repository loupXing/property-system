package com.property.vo;

import com.property.entity.Bill;
import com.property.entity.RepairOrder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardVO {
    private Map<String, Object> stats;
    private List<RepairOrder> recentRepairs;
    private List<Bill> recentBills;
}
