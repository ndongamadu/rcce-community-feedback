// =============================== *** File b_default ***  ===============================
/**
 * Feedback Page
 */
//Display the default Feedback->Home view
function initFeedbackHomePage() {
    communityFeedbackData.forEach(element => {
        emergenciesFilterArr.includes(element[configurations["Emergency"]]) ? null : emergenciesFilterArr.push(element[configurations["Emergency"]]);
        feedbackTypesArr.includes(element[configurations["Type"]]) ? null : feedbackTypesArr.push(element[configurations["Type"]]);
    });

    generateKeyFigures();
    generateEmergenciesDropdown();
    generateFeedbackTypesDropdown();


    // gender piechart
    var genderData = getDataForChart("Pie", "Gender");
    genderPieChart = generatePieChart("genderPieChart", genderData);

    // population group bar chart
    var popData = getDataForChart("Bar", "Population");
    popGroupsBarChart = generateBarChart("popGroupChart", popData);


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
    console.log(categoryData)

    categoryBarChart = generateBarChart("categoryBarChart", categoryData);

    // topic bar chart
    // var topicData = getDataForChart("Bar", "Population");
    topicBarChart = generateBarChart("topicBarChart", categoryData);



    $('#home').removeClass('hidden');
} //initFeedbackHomePage


/**
 * End Feedback Page
 */
// =============================== *** End File b_default ***  ===============================