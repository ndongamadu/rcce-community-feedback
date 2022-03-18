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

let communityFeedbackData, filteredCommunityFeedbackData;
let organisationsArr = [];

let emergenciesFilterArr = ["All selected"],
    feedbackTypesArr = ["All selected"];

let filteredFromPieChartGender = 'all',
    filteredFromBarChartPop = 'all';

let genderPieChart,
    popGroupsBarChart;

let emergencyPiechart,
    feedbackPieChart,
    channelPieChart;

let topicBarChart,
    categoryBarChart;

let barChartHeight = 350;
let pieChartHeight = 200;

let topNumberOfBarChartElement = 10;

let adm2Arr = [],
    adm2CodesArr = [];

function generateKeyFigures() {
    var numFeedback = filteredCommunityFeedbackData.length - 1,
        numOrgs = 0;
    // var data = d3.nest()
    //     .key(function(d) { return d[config['Framework']['Organisation']]; })
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
                // onclick: function(d) {
                //     console.log(d)
                // }
        },
        color: {
            pattern: pieChartColorRange
        },
    });

    return chart;
} //generatePieChart

function generateBarChart(bind, data, height = barChartHeight) {
    var chart = c3.generate({
        bindto: '#' + bind,
        size: {
            height: height
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

function generateTimeline() {

} //generateTimeline

// return calculated and pie/bar chart formatted dataset
function getDataForChart(chartType, dataColumn, data = communityFeedbackData) {
    var data = d3.nest()
        .key(function(d) {
            return d[config['Framework'][dataColumn]];
        })
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

function updateChart(chart, chartID) {
    var newData;

    chartID == "Gender" ? newData = getDataForChart("Pie", "Gender", filteredCommunityFeedbackData) :
        chartID == "Population" ? newData = getDataForChart("Bar", "Population", filteredCommunityFeedbackData) :
        chartID == "Emergency" ? newData = getDataForChart("Pie", "Emergency", filteredCommunityFeedbackData) :
        chartID == "Type" ? newData = getDataForChart("Pie", "Type", filteredCommunityFeedbackData) :
        chartID == "Channel" ? newData = getDataForChart("Pie", "Channel", filteredCommunityFeedbackData) :
        chartID == "Category" ? newData = getDataForChart("Bar", "Category", filteredCommunityFeedbackData) :
        chartID == "Code" ? newData = getDataForChart("Bar", "Code", filteredCommunityFeedbackData) : null;
    chart.load({ columns: newData, unload: true });
} //updateChart

function generateDataForMap(CFdata = communityFeedbackData) {
    var data = d3.nest()
        .key(function(d) { return d[config.Map.Admin2]; })
        .rollup(function(d) { return d.length; })
        .entries(CFdata).sort(sortNestedData);
    return data;
} //generateDataForMap

let mapChoroplethData = [];
let isMobile = $(window).width() < 767 ? true : false;
let g, mapsvg, projection, width, height, zoom, path;
let viewportWidth = document.getElementById('mapping').offsetWidth; //window.innerWidth;
let currentZoom = 1;
let mapClicked = false;
let selectedCountryFromMap = "all";
let Adm2SelectedFromMap = false;
let mapFillColor = '#ccc', //'#204669',
    mapInactive = '#fff',
    mapActive = '#2F9C67',
    hoverColor = '#2F9C67';

// let mapColorRange = ['#f0473a', '#f37066', '#f79992', '#fac2bd', '#fdebe9'];
let mapColorRange = ['#fdebe9', '#fac2bd', '#f79992', '#f37066', '#f0473a'];
let mapScale = d3.scaleQuantize()
    .domain([0, 100])
    .range(mapColorRange);

function initiateMap() {
    width = viewportWidth - 10;
    // height = (isMobile) ? 400 : 500;
    height = 500;
    var mapScale = width / Math.PI; //(isMobile) ? width / 3.5 : width / 23;4587526
    var mapCenter = (isMobile) ? [12, 12] : [28, -20.1]; // deplace la carte vertical, horizontal

    projection = d3.geoMercator()
        .center(mapCenter)
        .scale(3000)
        .translate([width / 2.9, height / 1.6]);

    path = d3.geoPath().projection(projection);

    zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);


    mapsvg = d3.select('#map').append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .on("wheel.zoom", null)
        .on("dblclick.zoom", null);

    mapsvg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#fff");
    // .attr("fill", "#99daea");
    // .attr("fill", "#ccd4d8");

    //map tooltips
    var maptip = d3.select('#map').append('div').attr('class', 'd3-tip map-tip hidden');
    g = mapsvg.append("g").attr('id', 'countries')
        .selectAll("path")
        .data(geomData.features)
        .enter()
        .append("path")
        .attr('d', path)
        .attr('id', function(d) {
            return d.properties.ADM1_EN;
        })
        .attr('class', function(d) {
            var className = (adm2Arr.includes(d.properties.ADM1_EN)) ? 'hasFeedback' : 'inactive';
            return className;
        });

    mapsvg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

    choroplethMap();

    //zoom controls
    d3.select("#zoom_in").on("click", function() {
        zoom.scaleBy(mapsvg.transition().duration(500), 1.5);
    });
    d3.select("#zoom_out").on("click", function() {
        zoom.scaleBy(mapsvg.transition().duration(500), 0.5);
    });

    var tipPays = d3.select('#countries').selectAll('path')
    g.filter('.hasFeedback')
        .on("mousemove", function(d) {
            showMapTooltip(d, maptip);
        })
        .on("mouseout", function(d) {
            maptip.classed('hidden', true);
        })
        .on("click", function(d) {
            Adm2SelectedFromMap = true;
            selectedCountryFromMap = d.properties.ADM1_EN;

            // mapsvg.select('g').selectAll('.clicked').each(function(element, index) {
            //     var mapScale = d3.scaleQuantize()
            //         .domain([0, 100])
            //         .range(mapColorRange);
            //     d3.select(this).attr('fill', function(d) {
            //         var max = mapChoroplethData[0].value;
            //         var filtered = mapChoroplethData.filter(pt => pt.key == d.properties.ADM1_EN);
            //         var num = (filtered.length != 0) ? filtered[0].value : null;
            //         var clr = (num == null) ? '#F2F2EF' : mapScale(Math.round((num * 100) / max));
            //         return clr;
            //     });
            // });

            mapsvg.select('g').selectAll('.hasFeedback').attr('fill', mapFillColor);

            $(this).attr('fill', hoverColor);

            mapsvg.select('g').selectAll('.hasFeedback').classed('clicked', false);
            $(this).attr('fill', hoverColor);
            $(this).addClass('clicked');

            updateChartsFromSelection();
        })

} //initiateMap

// zoom on buttons click
function zoomed() {
    const { transform } = d3.event;
    currentZoom = transform.k;

    if (!isNaN(transform.k)) {
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);

    }
}



// elevalute each map unit's number of feedbacks and colors it accordingly 
function choroplethMap(CFdata = communityFeedbackData) {
    var mapData = (CFdata == undefined) ? mapChoroplethData : generateDataForMap(CFdata);

    var legendTitle = "Number of Deployments";
    var select = $('#rankingSelect').val();
    var max = mapData[0].value;
    mapsvg.selectAll('path').each(function(element, index) {
        d3.select(this).transition().duration(500).attr('fill', function(d) {
            var filtered = mapData.filter(pt => pt.key == d.properties.ADM1_EN);
            var num = (filtered.length != 0) ? filtered[0].value : null;
            var clr = (num == null) ? '#F2F2EF' : mapScale(Math.round((num * 100) / max));
            return clr;
        });
    });

    // var legend = d3.legendColor()
    //     .labelFormat(d3.format(',.0f'))
    //     .title(legendTitle)
    //     .cells(mapColorRange.length)
    //     .scale(mapScale);


    // d3.select('#legend').remove();

    // var div = d3.select('#map');
    // var svg = div.append('svg')
    //     .attr('id', 'legend')
    //     .attr('height', '115px');

    // svg.append('g')
    //     .attr('class', 'scale')
    //     .call(legend);

} //choroplethMap

function showMapTooltip(d, maptip) {
    var filtered = mapChoroplethData.filter(pt => pt.key == d.properties.ADM1_EN);
    var value = filtered[0].value; // en pourcentage a calculer si tu veux 
    var mouse = d3.mouse(mapsvg.node()).map(function(d) { return parseInt(d); });
    var text = "Region : " + d.properties.ADM1_EN + "<br> Value: " + value;

    maptip
        .classed('hidden', false)
        .attr('style', 'left:' + (mouse[0]) + 'px; top:' + (mouse[1] + 25) + 'px')
        .html(text);
} //showMapTooltip

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
    if (filteredFromPieChartGender != "all") {
        data = data.filter(function(d) {
            return d[config["Framework"]["Gender"]] == filteredFromPieChartGender;
        })
    }

    if (filteredFromBarChartPop != "all") {
        data = data.filter(function(d) {
            return d[config["Framework"]["Population"]] == filteredFromBarChartPop;
        })
    }

    return data;
} //getFilteredDataFromSelection

function updateChartsFromSelection(dataArg) {

    var data = (dataArg == undefined) ? getFilteredDataFromSelection() : dataArg;

    // update charts 
    var newData_gender = getDataForChart("Pie", "Gender", data);
    genderPieChart.load({ columns: newData_gender });

    var newData_pop = getDataForChart("Bar", "Population", data);
    popGroupsBarChart.load({ columns: newData_pop });

    var newData_emergency = getDataForChart("Pie", "Emergency", data);
    emergencyPiechart.load({ columns: newData_emergency });

    var newData_channel = getDataForChart("Pie", "Channel", data);
    channelPieChart.load({ columns: newData_channel });

    var newData_feedback = getDataForChart("Pie", "Type", data);
    feedbackPieChart.load({ columns: newData_feedback });
    // console.log(newData_feedback)

    var newData_topic = getDataForChart("Bar", "Code", data);
    topicBarChart.load({ columns: newData_topic });

    var newData_cat = getDataForChart("Bar", "Category", data);
    categoryBarChart.load({ columns: newData_cat });

    // update key figures too

} //updateChartsFromSelection

function updateAll() {
    var data = getFilteredDataFromSelection();
    updateChartsFromSelection(data);

    // update map choropleth
    choroplethMap(data);
}

function resetAllFilters() {
    Adm2SelectedFromMap = false;
    selectedCountryFromMap = "all";
    $('#emergencySelect').val('all');
    $('#feedbackTypeSelect').val('all');
    //reset chart gender selection
    filteredFromPieChartGender = 'all';
    filteredFromBarChartPop = 'all';

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
let geodataUrl = 'data/adm2.json';
let dataURL = 'data/data.csv';
let configFile = 'config/config.json'

let geomData;
let config;

$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.json(geodataUrl),
            d3.json(configFile),
            d3.csv(dataURL)
        ]).then(function(data) {
            geomData = topojson.feature(data[0], data[0].objects.adm2);
            config = data[1];
            communityFeedbackData = data[2];
            filteredCommunityFeedbackData = communityFeedbackData;
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