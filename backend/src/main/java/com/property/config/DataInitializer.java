package com.property.config;

import com.property.entity.*;
import com.property.mapper.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserMapper userMapper;
    private final CommunityMapper communityMapper;
    private final BuildingMapper buildingMapper;
    private final UnitMapper unitMapper;
    private final ResidentMapper residentMapper;
    private final FeeMapper feeMapper;
    private final RepairMapper repairMapper;
    private final AnnouncementMapper announcementMapper;
    private final ParkingMapper parkingMapper;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DataInitializer(UserMapper userMapper, CommunityMapper communityMapper, BuildingMapper buildingMapper,
                           UnitMapper unitMapper, ResidentMapper residentMapper, FeeMapper feeMapper,
                           RepairMapper repairMapper, AnnouncementMapper announcementMapper, ParkingMapper parkingMapper) {
        this.userMapper = userMapper;
        this.communityMapper = communityMapper;
        this.buildingMapper = buildingMapper;
        this.unitMapper = unitMapper;
        this.residentMapper = residentMapper;
        this.feeMapper = feeMapper;
        this.repairMapper = repairMapper;
        this.announcementMapper = announcementMapper;
        this.parkingMapper = parkingMapper;
    }

    @Override
    public void run(String... args) {
        if (userMapper.count() > 0) {
            System.out.println("数据库已有数据，跳过初始化");
            return;
        }
        System.out.println("正在初始化示例数据...");
        seed();
        System.out.println("示例数据初始化完成！");
        System.out.println("默认账号: admin / admin123");
    }

    private void seed() {
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setName("系统管理员");
        admin.setRole("admin");
        admin.setPhone("13800000000");
        userMapper.insert(admin);

        Community c1 = new Community();
        c1.setName("阳光花园");
        c1.setAddress("北京市朝阳区阳光路88号");
        c1.setArea(120000.0);
        c1.setContactPhone("010-88888888");
        c1.setDescription("高端住宅小区，绿化率40%");
        communityMapper.insert(c1);

        Community c2 = new Community();
        c2.setName("翠湖名苑");
        c2.setAddress("北京市海淀区翠湖路66号");
        c2.setArea(85000.0);
        c2.setContactPhone("010-66666666");
        c2.setDescription("毗邻翠湖公园，环境优美");
        communityMapper.insert(c2);

        int[][] buildingDefs = {
            {c1.getId(), 18, 4}, {c1.getId(), 18, 4}, {c1.getId(), 12, 6},
            {c2.getId(), 20, 4}, {c2.getId(), 20, 4}
        };
        String[] buildingNames = {"1号楼", "2号楼", "3号楼", "A栋", "B栋"};
        int[] buildingIds = new int[5];
        for (int i = 0; i < 5; i++) {
            Building b = new Building();
            b.setCommunityId(buildingDefs[i][0]);
            b.setName(buildingNames[i]);
            b.setFloors(buildingDefs[i][1]);
            b.setUnitsPerFloor(buildingDefs[i][2]);
            buildingMapper.insert(b);
            buildingIds[i] = b.getId();
        }

        String[] unitTypes = {"住宅", "住宅", "住宅", "商铺"};
        String[] unitStatuses = {"已入住", "已入住", "空置", "已入住"};
        int[] unitIds = new int[200];
        int unitIdx = 0;
        for (int bi = 0; bi < 5; bi++) {
            int floors = Math.min(buildingDefs[bi][1], 5);
            int upf = buildingDefs[bi][2];
            for (int f = 1; f <= floors; f++) {
                for (int u = 1; u <= upf; u++) {
                    Unit unit = new Unit();
                    unit.setBuildingId(buildingIds[bi]);
                    unit.setUnitNumber(f + String.format("%02d", u));
                    unit.setFloor(f);
                    unit.setArea(80.0 + Math.floor(Math.random() * 60));
                    unit.setType(unitTypes[(f + u) % 4]);
                    unit.setStatus(unitStatuses[(f + u) % 4]);
                    unitMapper.insert(unit);
                    unitIds[unitIdx++] = unit.getId();
                }
            }
        }

        String[] names = {"张伟", "李娜", "王强", "刘洋", "陈静", "赵明", "孙丽", "周杰", "吴芳", "郑浩"};
        String[] phones = {"13812345678", "13923456789", "13734567890", "13645678901", "13556789012",
            "13467890123", "13378901234", "13289012345", "13190123456", "13001234567"};
        for (int i = 0; i < 10; i++) {
            Resident r = new Resident();
            r.setUnitId(unitIds[i * 3]);
            r.setName(names[i]);
            r.setPhone(phones[i]);
            r.setIdCard(String.format("110101199%02d01011234", i));
            r.setType(i % 3 == 0 ? "业主" : "租户");
            r.setMoveInDate("2023-06-01");
            r.setStatus("在住");
            residentMapper.insert(r);
        }

        String[][] feeDefs = {
            {"物业管理费", "2.5", "元/㎡/月", "按建筑面积收取"},
            {"停车费", "300", "元/月", "地下车位月租"},
            {"垃圾清运费", "20", "元/月", "生活垃圾清运"},
            {"公共维修基金", "0.5", "元/㎡/月", "公共设施维护"}
        };
        int[] feeTypeIds = new int[4];
        for (int i = 0; i < 4; i++) {
            FeeType ft = new FeeType();
            ft.setName(feeDefs[i][0]);
            ft.setUnitPrice(Double.parseDouble(feeDefs[i][1]));
            ft.setUnit(feeDefs[i][2]);
            ft.setDescription(feeDefs[i][3]);
            feeMapper.insertType(ft);
            feeTypeIds[i] = ft.getId();
        }

        String[] periods = {"2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03"};
        for (int i = 0; i < 20; i++) {
            Bill bill = new Bill();
            bill.setUnitId(unitIds[i]);
            bill.setFeeTypeId(feeTypeIds[i % 4]);
            Unit unit = unitMapper.findById(unitIds[i]);
            bill.setAmount(i % 4 == 0 ? Math.round(unit.getArea() * 2.5 * 100) / 100.0 : Double.parseDouble(feeDefs[i % 4][1]));
            bill.setPeriod(periods[i % 6]);
            bill.setStatus(i % 3 == 0 ? "未缴" : "已缴");
            bill.setDueDate("2026-01-31");
            if ("已缴".equals(bill.getStatus())) bill.setPaidAt("2026-01-15 10:00:00");
            feeMapper.insertBill(bill);
        }

        String[] repairTitles = {"厨房水管漏水", "卧室窗户关不严", "电梯按键失灵", "卫生间下水道堵塞", "客厅灯不亮",
            "空调制冷效果差", "门锁损坏", "阳台护栏松动"};
        String[] categories = {"水电", "门窗", "电梯", "管道", "其他"};
        String[] repairStatuses = {"待处理", "处理中", "已完成", "已完成", "待处理", "处理中", "已完成", "待处理"};
        for (int i = 0; i < 8; i++) {
            RepairOrder ro = new RepairOrder();
            ro.setUnitId(unitIds[i]);
            ro.setResidentId(i + 1);
            ro.setTitle(repairTitles[i]);
            ro.setDescription("住户报修：" + repairTitles[i] + "，请尽快处理。");
            ro.setCategory(categories[i % 5]);
            ro.setPriority(i < 2 ? "紧急" : "普通");
            ro.setStatus(repairStatuses[i]);
            if (!"待处理".equals(repairStatuses[i])) ro.setHandler("李师傅");
            if ("已完成".equals(repairStatuses[i])) ro.setCompletedAt("2026-01-20 15:00:00");
            repairMapper.insert(ro);
        }

        String[][] announcements = {
            {"关于春节期间物业服务安排的通知", "尊敬的业主：春节期间（2月10日-2月17日）物业服务中心正常值班，值班电话：010-88888888。祝大家新春快乐！", "通知", "true"},
            {"小区绿化改造工程公告", "为提升小区环境品质，计划于3月1日起对中心花园进行绿化改造，工期约15天，施工期间请注意安全。", "公告", "false"},
            {"2026年第一季度物业费缴纳提醒", "请各位业主于2026年1月31日前缴纳第一季度物业费，可通过物业前台或线上渠道缴费。逾期未缴将产生滞纳金。", "通知", "true"},
            {"电梯年度检修通知", "根据特种设备安全管理规定，本小区所有电梯将于2月15日-2月16日进行年度检修，检修期间电梯暂停使用，请业主提前做好准备。", "公告", "false"}
        };
        for (String[] a : announcements) {
            Announcement ann = new Announcement();
            ann.setTitle(a[0]);
            ann.setContent(a[1]);
            ann.setType(a[2]);
            ann.setAuthor("物业管理处");
            ann.setIsPinned(Boolean.parseBoolean(a[3]));
            announcementMapper.insert(ann);
        }

        for (int i = 1; i <= 30; i++) {
            ParkingSpace ps = new ParkingSpace();
            ps.setCommunityId(i <= 15 ? c1.getId() : c2.getId());
            ps.setSpaceNumber((i <= 15 ? "A" : "B") + "-" + String.format("%03d", i % 15 + 1));
            ps.setType(i % 3 == 0 ? "地下" : "地上");
            ps.setStatus(i % 4 == 0 ? "空闲" : "已租");
            if (!"空闲".equals(ps.getStatus())) ps.setUnitId(unitIds[i % unitIdx]);
            ps.setMonthlyFee(i % 3 == 0 ? 500.0 : 300.0);
            parkingMapper.insert(ps);
        }
    }
}
