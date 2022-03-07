// console.log("Bismillahi rahmani rahim")
// =============================== *** File a_generic ***  ===============================
/**
 * Feedback Page
 */

// let config = {

// };

let primaryColor = '#204669',
    secondaryColor = '#a6b5c3',
    tertiaryColor = '#e9edf0';
let pieChartColorRange = [primaryColor, secondaryColor, tertiaryColor];

let communityFeedbackData;
let organisationsArr = [];

let emergenciesFilterArr = ["All selected"],
    feedbackTypesArr = ["All selected"];

let genderPieChart,
    popGroupsBarChart;

let emergencyPiechart,
    feedbackPieChart,
    channelPieChart;

let topicBarChart,
    categoryBarChart;

let barChartHeight = 200;
let pieChartHeight = 200;

let topNumberOfBarChartElement = 5;

function generateKeyFigures() {
    var numFeedback = communityFeedbackData.length - 1,
        numOrgs = 0;
    // var data = d3.nest()
    //     .key(function(d) { return d[configurations['Organisation']]; })
    //     .rollup(function(d) { return d.length })
    //     .entries(communityFeedbackData);
    // data.forEach(element => {
    //     organisationsArr.push(element.key);
    // });
    numOrgs = 10; //organisationsArr.length;
    // feedbacks
    $('.statFeedback h5').html('');
    $('.statFeedback h5').html(numFeedback);
    // orgs
    $('.statOrg #num').html('');
    $('.statOrg #num').text(numOrgs);

} //generateKeyFigures

function generateEmergenciesDropdown() {
    var options = "";
    for (let index = 0; index < emergenciesFilterArr.length; index++) {
        const element = emergenciesFilterArr[index];
        index == 0 ? options += '<option value="all" selected>' + element + '</option>' :
            options += '<option value="' + element + '">' + element + '</option>';
    }
    $('#emergencySelect').append(options);
} //generateEmergenciesDropdown

function generateFeedbackTypesDropdown() {
    var options = "";
    for (let index = 0; index < feedbackTypesArr.length; index++) {
        const element = feedbackTypesArr[index];
        index == 0 ? options += '<option value="all" selected>' + element + '</option>' :
            options += '<option value="' + element + '">' + element + '</option>';
    }
    $('#feedbackTypeSelect').append(options);
} //generateFeedbackTypesDropdown

function generatePieChart(bind, data) {
    var chart = c3.generate({
        bindto: '#' + bind,
        size: {
            height: pieChartHeight
        },
        data: {
            columns: data,
            type: 'pie'
        },
        color: {
            pattern: pieChartColorRange
        },
    });

    return chart;
} //generatePieChart

function generateBarChart(bind, data) {
    var chart = c3.generate({
        bindto: '#' + bind,
        size: {
            height: barChartHeight
        },
        data: {
            x: 'x',
            columns: data,
            type: 'bar'
        },
        color: {
            pattern: [primaryColor]
        },
        axis: {
            rotated: true,
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
    return chart;
} //generateBarChart

// return calculated and pie/bar chart formatted dataset
function getDataForChart(chartType, dataColumn, data = communityFeedbackData) {
    var data = d3.nest()
        .key(function(d) { return d[configurations[dataColumn]]; })
        .rollup(function(d) { return d.length; })
        .entries(data);
    data.sort(sortNestedData);
    var xArr = [],
        yArr = [],
        colonnes = [];
    if (chartType == "Pie") {
        data.forEach(element => {
            var arr = [];
            arr.push(element.key, element.value);
            colonnes.push(arr);
        });
    } else {
        xArr.push('x');
        yArr.push('value');

        //first topNumberOfBarChartElement values
        if (data.length > topNumberOfBarChartElement) {
            for (let index = 0; index < topNumberOfBarChartElement; index++) {
                const element = data[index];
                xArr.push(element.key);
                yArr.push(element.value);
            }
        } else {
            data.forEach(element => {
                xArr.push(element.key);
                yArr.push(element.value);
            });
        }
        colonnes.push(xArr);
        colonnes.push(yArr);
    }
    return colonnes;
} //getDataForChart


function sortNestedData(a, b) {
    if (a.value > b.value) {
        return -1
    }
    if (a.value < b.value) {
        return 1
    }
    return 0;
} //sortNestedData

/**
 * End Feedback Page
 */
// =============================== *** End File a_generic ***  ===============================
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

/**
 * End   Feedback Page
 */
// =============================== *** End File c_updatePageContent ***  ===============================
// =============================== *** File d_update ***  ===============================

//Click event handler for nav-items
$('.navSite').on('click', function() {
    $('.navSite').removeClass('active');
    $('.navPage').addClass('hidden');

    console.log("Changing page")

    //Add active class to the clicked item
    $(this).addClass('active');

    var nav = $('a', this).attr('value');

    $('#' + nav + "-page").removeClass('hidden');
});

// =============================== *** End File d_update ***  ===============================
// v1.0 
//  console.log("Bismillahi rahmani rahim")
let geodataUrl = 'data/wld.json';
let dataURL = 'data/data.csv';
let configFile = 'data/configuration.csv'

let geomData;
let configurations;

$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.json(geodataUrl),
            d3.csv(configFile),
            d3.csv(dataURL)
        ]).then(function(data) {
            geomData = topojson.feature(data[0], data[0].objects.worldtopo12022020);
            configurations = data[1][0];
            communityFeedbackData = data[2];
            // console.log(configurations)
            /**
             * functions to show the vis
             */
            initFeedbackHomePage();

            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();
});