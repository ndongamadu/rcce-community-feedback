// =============================== *** File b_default ***  ===============================
/**
 * Feedback Page
 */
//Display the default Feedback->Home view
function initFeedbackHomePage() {
    filteredCommunityFeedbackData.forEach(element => {
        emergenciesFilterArr.includes(element[config['Framework']['Emergency']]) ? null : emergenciesFilterArr.push(element[config['Framework']["Emergency"]]);
        feedbackTypesArr.includes(element[config['Framework']["Type"]]) ? null : feedbackTypesArr.push(element[config['Framework']["Type"]]);
        adm2Arr.includes(element[config.Map.Admin2]) ? null : adm2Arr.push(element[config.Map.Admin2]);
        adm2CodesArr.includes(element[config["Map"]["Admin2_code"]]) ? null : adm2CodesArr.push(element[config["Map"]["Admin2_code"]]);
    });

    generateKeyFigures();
    generateEmergenciesDropdown();
    generateFeedbackTypesDropdown();


    // gender piechart
    var genderData = getDataForChart("Pie", "Gender");
    // genderPieChart = generatePieChart("genderPieChart", genderData);
    genderPieChart = c3.generate({
        bindto: '#genderPieChart',
        size: {
            height: pieChartHeight
        },
        data: {
            columns: genderData,
            type: 'pie',
            onclick: function(d) {
                filteredFromPieChartGender = d.name;
                updateAll();
            }
        },
        color: {
            pattern: pieChartColorRange
        },
    });

    // population group bar chart
    var popData = getDataForChart("Bar", "Population");
    //popGroupsBarChart = generateBarChart("popGroupChart", popData, 250);
    popGroupsBarChart = c3.generate({
        bindto: '#popGroupChart',
        size: {
            height: 250
        },
        data: {
            x: 'x',
            columns: popData,
            type: 'bar',
            onclick: function(d) {
                filteredFromBarChartPop = popData[0][d.x + 1];
                updateAll();
            }
        },
        color: {
            pattern: [primaryColor]
        },
        axis: {
            // rotated: true,
            x: {
                type: 'category',
                tick: {
                    centered: true,
                    outer: false
                }
            },
            y: {
                tick: {
                    centered: true,
                    outer: false,
                    fit: true,
                    count: 5,
                    format: d3.format('d')
                }
            }
        },
        legend: {
            show: false
        }
    });


    // Emergency piechart
    var emergencyData = getDataForChart("Pie", "Emergency");
    emergencyPiechart = generatePieChart("emergencyPieChart", emergencyData);
    // feedbakc pie chart
    var feedbackData = getDataForChart("Pie", "Type");
    feedbackPieChart = generatePieChart("feedbackPieChart", feedbackData);
    // channel pie chart
    var channelData = getDataForChart("Pie", "Channel");
    channelPieChart = generatePieChart("channelPieChart", channelData);

    // category bar chart
    var categoryData = getDataForChart("Bar", "Category");
    categoryBarChart = generateBarChart("categoryBarChart", categoryData);

    // topic bar chart
    var topicData = getDataForChart("Bar", "Code");
    topicBarChart = generateBarChart("topicBarChart", topicData);

    mapChoroplethData = generateDataForMap();
    // display map
    initiateMap();

} //initFeedbackHomePage


/**
 * End Feedback Page
 */
// =============================== *** End File b_default ***  ===============================