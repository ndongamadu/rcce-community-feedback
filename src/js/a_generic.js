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