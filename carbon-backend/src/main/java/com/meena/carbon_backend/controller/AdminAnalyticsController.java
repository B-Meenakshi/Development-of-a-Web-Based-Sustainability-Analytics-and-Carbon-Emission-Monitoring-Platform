package com.meena.carbon_backend.controller;

import com.meena.carbon_backend.entity.Activity;
import com.meena.carbon_backend.entity.User;
import com.meena.carbon_backend.repository.ActivityRepository;
import com.meena.carbon_backend.repository.UserRepository;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminAnalyticsController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityRepository activityRepository;


    // =========================================================
    // GET FILTERED ANALYTICS ACTIVITIES
    // =========================================================

    @GetMapping("/activities")
    public List<AdminAnalyticsActivity> getActivities(

            @RequestParam(defaultValue = "") String user,

            @RequestParam(defaultValue = "All") String category,

            @RequestParam(defaultValue = "monthly") String period,

            @RequestParam(required = false) String selectedDate,

            @RequestParam(required = false) String startDate,

            @RequestParam(required = false) String endDate
    ) {

        LocalDate selected = parseDate(selectedDate, LocalDate.now());

        LocalDate start = parseDate(startDate, selected.withDayOfMonth(1));

        LocalDate end = parseDate(endDate, selected);

        return getFilteredActivities(
                user,
                category,
                period,
                selected,
                start,
                end
        );
    }


    // =========================================================
    // EXCEL DOWNLOAD
    // =========================================================

    @GetMapping("/download/excel")
    public ResponseEntity<byte[]> downloadExcel(

            @RequestParam(defaultValue = "") String user,

            @RequestParam(defaultValue = "All") String category,

            @RequestParam(defaultValue = "monthly") String period,

            @RequestParam(required = false) String selectedDate,

            @RequestParam(required = false) String startDate,

            @RequestParam(required = false) String endDate
    ) {

        try {

            LocalDate selected =
                    parseDate(selectedDate, LocalDate.now());

            LocalDate start =
                    parseDate(
                            startDate,
                            selected.withDayOfMonth(1)
                    );

            LocalDate end =
                    parseDate(endDate, selected);


            List<AdminAnalyticsActivity> activities =
                    getFilteredActivities(
                            user,
                            category,
                            period,
                            selected,
                            start,
                            end
                    );


            // =================================================
            // CREATE WORKBOOK
            // =================================================

            Workbook workbook = new XSSFWorkbook();

            Sheet sheet =
                    workbook.createSheet("Analytics");


            // =================================================
            // HEADER STYLE
            // =================================================

            CellStyle headerStyle =
                    workbook.createCellStyle();

            Font headerFont =
                    workbook.createFont();

            headerFont.setBold(true);

            headerStyle.setFont(headerFont);

            headerStyle.setFillForegroundColor(
                    IndexedColors.LIGHT_GREEN.getIndex()
            );

            headerStyle.setFillPattern(
                    FillPatternType.SOLID_FOREGROUND
            );

            headerStyle.setBorderBottom(
                    BorderStyle.THIN
            );

            headerStyle.setBorderTop(
                    BorderStyle.THIN
            );

            headerStyle.setBorderLeft(
                    BorderStyle.THIN
            );

            headerStyle.setBorderRight(
                    BorderStyle.THIN
            );


            // =================================================
            // HEADER ROW
            // =================================================

            Row headerRow =
                    sheet.createRow(0);

            String[] headers = {

                    "ID",
                    "User Name",
                    "User Email",
                    "Category",
                    "Activity",
                    "Details",
                    "Amount",
                    "Unit",
                    "Emission (kg CO2e)",
                    "Date",
                    "Emission Factor"

            };


            for (int i = 0; i < headers.length; i++) {

                Cell cell =
                        headerRow.createCell(i);

                cell.setCellValue(headers[i]);

                cell.setCellStyle(headerStyle);
            }


            // =================================================
            // DATA ROWS
            // =================================================

            int rowNumber = 1;

            for (
                    AdminAnalyticsActivity activity
                    : activities
            ) {

                Row row =
                        sheet.createRow(rowNumber++);


                row.createCell(0)
                        .setCellValue(
                                activity.getId() != null
                                        ? activity.getId()
                                        : 0
                        );


                row.createCell(1)
                        .setCellValue(
                                safe(activity.getUserName())
                        );


                row.createCell(2)
                        .setCellValue(
                                safe(activity.getUserEmail())
                        );


                row.createCell(3)
                        .setCellValue(
                                safe(activity.getCategory())
                        );


                row.createCell(4)
                        .setCellValue(
                                safe(activity.getActivity())
                        );


                row.createCell(5)
                        .setCellValue(
                                safe(activity.getDetails())
                        );


                row.createCell(6)
                        .setCellValue(
                                activity.getAmount()
                        );


                row.createCell(7)
                        .setCellValue(
                                safe(activity.getUnit())
                        );


                row.createCell(8)
                        .setCellValue(
                                activity.getEmission()
                        );


                row.createCell(9)
                        .setCellValue(
                                activity.getDate() != null
                                        ? activity.getDate().toString()
                                        : ""
                        );


                row.createCell(10)
                        .setCellValue(
                                activity.getEmissionFactor() != null
                                        ? activity.getEmissionFactor()
                                        : 0
                        );
            }


            // =================================================
            // AUTO SIZE COLUMNS
            // =================================================

            for (int i = 0; i < headers.length; i++) {

                sheet.autoSizeColumn(i);

            }


            // =================================================
            // WRITE FILE
            // =================================================

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            workbook.write(outputStream);

            workbook.close();


            byte[] excelFile =
                    outputStream.toByteArray();


            // =================================================
            // RESPONSE
            // =================================================

            return ResponseEntity.ok()

                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=carbon_analytics.xlsx"
                    )

                    .contentType(
                            MediaType.parseMediaType(
                                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            )
                    )

                    .body(excelFile);


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }


    // =========================================================
    // FILTERING LOGIC
    // =========================================================

    private List<AdminAnalyticsActivity> getFilteredActivities(

            String userSearch,

            String category,

            String period,

            LocalDate selectedDate,

            LocalDate startDate,

            LocalDate endDate

    ) {

        List<User> users =
                userRepository.findAll();


        List<AdminAnalyticsActivity> result =
                new ArrayList<>();


        // =====================================================
        // DETERMINE DATE RANGE
        // =====================================================

        LocalDate filterStart =
                selectedDate;

        LocalDate filterEnd =
                selectedDate;


        if (period != null) {

            switch (period.toLowerCase()) {

                case "daily":

                    filterStart =
                            selectedDate;

                    filterEnd =
                            selectedDate;

                    break;


                case "weekly":

                    filterStart =
                            selectedDate.with(
                                    TemporalAdjusters.previousOrSame(
                                            DayOfWeek.MONDAY
                                    )
                            );

                    filterEnd =
                            selectedDate.with(
                                    TemporalAdjusters.nextOrSame(
                                            DayOfWeek.SUNDAY
                                    )
                            );

                    break;


                case "monthly":

                    filterStart =
                            selectedDate.withDayOfMonth(1);

                    filterEnd =
                            selectedDate.withDayOfMonth(
                                    selectedDate.lengthOfMonth()
                            );

                    break;


                case "date to date":

                case "datetodate":

                case "date_to_date":

                    filterStart =
                            startDate;

                    filterEnd =
                            endDate;

                    break;


                default:

                    filterStart =
                            selectedDate.withDayOfMonth(1);

                    filterEnd =
                            selectedDate.withDayOfMonth(
                                    selectedDate.lengthOfMonth()
                            );

                    break;
            }
        }


        // =====================================================
        // NORMALIZE DATES
        // =====================================================

        if (filterStart == null) {

            filterStart =
                    LocalDate.now();
        }


        if (filterEnd == null) {

            filterEnd =
                    filterStart;
        }


        // =====================================================
        // USER SEARCH
        // =====================================================

        String search =
                userSearch == null
                        ? ""
                        : userSearch.trim().toLowerCase();


        // =====================================================
        // CATEGORY
        // =====================================================

        String selectedCategory =
                category == null
                        ? "All"
                        : category.trim();


        // =====================================================
        // LOOP USERS
        // =====================================================

        for (User user : users) {


            String userName =
                    user.getFullName() == null
                            ? ""
                            : user.getFullName();


            String userEmail =
                    user.getEmail() == null
                            ? ""
                            : user.getEmail();


            // =================================================
            // USER FILTER
            // =================================================

            if (!search.isEmpty()) {

                boolean nameMatches =
                        userName
                                .toLowerCase()
                                .contains(search);


                boolean emailMatches =
                        userEmail
                                .toLowerCase()
                                .contains(search);


                if (!nameMatches && !emailMatches) {

                    continue;
                }
            }


            // =================================================
            // GET USER ACTIVITIES
            // =================================================

            List<Activity> activities =
                    activityRepository
                            .findByUserEmailOrderByDateDesc(
                                    userEmail
                            );


            for (Activity activity : activities) {


                // =============================================
                // DATE FILTER
                // =============================================

                LocalDate activityDate =
                        activity.getDate();


                if (activityDate == null) {

                    continue;
                }


                if (
                        activityDate.isBefore(filterStart)
                                ||
                        activityDate.isAfter(filterEnd)
                ) {

                    continue;
                }


                // =============================================
                // CATEGORY FILTER
                // =============================================

                if (
                        !selectedCategory.equalsIgnoreCase("All")
                                &&
                        (
                                activity.getCategory() == null
                                        ||
                                !activity
                                        .getCategory()
                                        .equalsIgnoreCase(
                                                selectedCategory
                                        )
                        )
                ) {

                    continue;
                }


                // =============================================
                // CREATE DTO
                // =============================================

                AdminAnalyticsActivity item =
                        new AdminAnalyticsActivity();


                item.setId(
                        activity.getId()
                );


                item.setUserEmail(
                        userEmail
                );


                item.setUserName(
                        userName
                );


                item.setCategory(
                        activity.getCategory()
                );


                item.setActivity(
                        activity.getActivity()
                );


                item.setDetails(
                        activity.getDetails()
                );


                item.setAmount(
                        activity.getAmount()
                );


                item.setUnit(
                        activity.getUnit()
                );


                item.setEmission(
                        activity.getEmission()
                );


                item.setDate(
                        activity.getDate()
                );


                item.setEmissionFactor(
                        activity.getEmissionFactor()
                );


                result.add(item);
            }
        }


        // =====================================================
        // SORT NEWEST FIRST
        // =====================================================

        result.sort(
                Comparator.comparing(
                        AdminAnalyticsActivity::getDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );


        return result;
    }


    // =========================================================
    // DATE PARSER
    // =========================================================

    private LocalDate parseDate(
            String value,
            LocalDate defaultValue
    ) {

        if (
                value == null
                        ||
                value.trim().isEmpty()
        ) {

            return defaultValue;
        }


        try {

            return LocalDate.parse(value);

        } catch (Exception e) {

            return defaultValue;
        }
    }


    // =========================================================
    // SAFE STRING
    // =========================================================

    private String safe(String value) {

        return value == null
                ? ""
                : value;
    }


    // =========================================================
    // DTO
    // =========================================================

    public static class AdminAnalyticsActivity {

        private Long id;

        private String userEmail;

        private String userName;

        private String category;

        private String activity;

        private String details;

        private double amount;

        private String unit;

        private double emission;

        private LocalDate date;

        private Double emissionFactor;


        public Long getId() {

            return id;
        }


        public void setId(Long id) {

            this.id = id;
        }


        public String getUserEmail() {

            return userEmail;
        }


        public void setUserEmail(String userEmail) {

            this.userEmail = userEmail;
        }


        public String getUserName() {

            return userName;
        }


        public void setUserName(String userName) {

            this.userName = userName;
        }


        public String getCategory() {

            return category;
        }


        public void setCategory(String category) {

            this.category = category;
        }


        public String getActivity() {

            return activity;
        }


        public void setActivity(String activity) {

            this.activity = activity;
        }


        public String getDetails() {

            return details;
        }


        public void setDetails(String details) {

            this.details = details;
        }


        public double getAmount() {

            return amount;
        }


        public void setAmount(double amount) {

            this.amount = amount;
        }


        public String getUnit() {

            return unit;
        }


        public void setUnit(String unit) {

            this.unit = unit;
        }


        public double getEmission() {

            return emission;
        }


        public void setEmission(double emission) {

            this.emission = emission;
        }


        public LocalDate getDate() {

            return date;
        }


        public void setDate(LocalDate date) {

            this.date = date;
        }


        public Double getEmissionFactor() {

            return emissionFactor;
        }


        public void setEmissionFactor(
                Double emissionFactor
        ) {

            this.emissionFactor =
                    emissionFactor;
        }
    }
}