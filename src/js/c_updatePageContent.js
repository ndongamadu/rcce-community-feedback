// =============================== *** File c_updatePageContent ***  ===============================
/**
 * Feedback Page
 */
//Controls each onglet (nav bar menus)'s behavior


var feedbackNavs = document.getElementsByClassName("feedbackNav");
for (var i = 0; i < feedbackNavs.length; i++) {
    feedbackNavs[i].addEventListener('click', updateFeedbackFromNavs);
}

function updateFeedbackFromNavs() {
    $('.navigation').removeClass('active');
    $('.navigation').addClass('hidden');
    var nav = this.value;


    $('#' + nav).removeClass('hidden');
    $(this).toggleClass('active');

} //updateFeedbackFromNavs

//Click event handler for nav-items
$('.navFeedback').on('click', function() {
    $('.navFeedback').removeClass('active');
    $('.navigation').addClass('hidden');


    //Add active class to the clicked item
    $(this).addClass('active');

    var nav = $('a', this).attr('value');

    $('#' + nav).removeClass('hidden');
});

function getFilteredDataFromSelection() {
    var data = communityFeedbackData;
    var emergencySelected = $('#emergencySelect').val();
    var feedbackTypeSelected = $('#feedbackTypeSelect').val();

    // console.log("====before filtered data===")
    // console.log(data)
    if (emergencySelected != "all") {
        data = data.filter(function(d) {
            return d[config['Framework']['Emergency']] == emergencySelected;
        })
    }
    if (feedbackTypeSelected != "all") {
        data = data.filter(function(d) {
            return d[config['Framework']['Type']] == feedbackTypeSelected;
        })
    }
    if (selectedCountryFromMap != "all") {
        data = data.filter(function(d) {
            return d[config["Map"]["Admin2"]] == selectedCountryFromMap;
        })
    }

    return data;
} //getFilteredDataFromSelection

function updateChartsFromSelection(dataArg) {

    var data = (dataArg == undefined) ? getFilteredDataFromSelection() : dataArg;

    // update charts 
    var newData_emergency = getDataForChart("Pie", "Emergency", data);
    // d3.select('#Emergency svg').classed('hidden', false);
    emergencyPiechart.load({ columns: newData_emergency, unload: true });
    // emergencyPiechart.resize({ height: pieChartHeight });

    var newData_channel = getDataForChart("Pie", "Channel", data);
    channelPieChart.load({ columns: newData_channel, unload: true });

    var newData_feedback = getDataForChart("Pie", "Type", data);
    feedbackPieChart.load({ columns: newData_feedback, unload: true });
    // console.log(newData_feedback)

    var newData_topic = getDataForChart("Bar", "Code", data);
    topicBarChart.load({ columns: newData_topic, unload: true });

    var newData_cat = getDataForChart("Bar", "Category", data);
    categoryBarChart.load({ columns: newData_cat, unload: true });

} //updateChartsFromSelection

function resetAllFilters() {
    Adm2SelectedFromMap = false;
    selectedCountryFromMap = "all";
    $('#emergencySelect').val('all');
    $('#feedbackTypeSelect').val('all');
    var data = getFilteredDataFromSelection();
    updateChartsFromSelection(data);
    choroplethMap();

}

$('#emergencySelect').on("change", function(d) {
    // reset map selection
    selectedCountryFromMap = "all"; // and the boolean too

    var data = getFilteredDataFromSelection();
    updateChartsFromSelection(data);

    // update map choropleth
    choroplethMap(data);
});

$('#feedbackTypeSelect').on("change", function(d) {
    // reset map selection
    selectedCountryFromMap = "all"; // and the boolean too

    var data = getFilteredDataFromSelection();
    updateChartsFromSelection(data);

    // update map choropleth
    choroplethMap(data);
});

$('#dateSelect').on("change", function(d) {
    updateChartsFromSelection();
});

$('#fResetAll').on("click", function(d) {
    resetAllFilters();
})

/**
 * End   Feedback Page
 */
// =============================== *** End File c_updatePageContent ***  ===============================