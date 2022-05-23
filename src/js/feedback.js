let geodataUrl = 'data/equateur.json';
let dataURL = 'data/drc_all_cf_data.csv';
let configFile = 'config/config.json';

let geomData;
let config;
let communityFeedbackData,
    globalFilteredCFData;
let totalNumberOfFeedback;
$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.json(geodataUrl),
            d3.json(configFile),
            d3.csv(dataURL),
        ]).then(function(data) {
            geomData = topojson.feature(data[0], data[0].objects.Equateur_ZS);
            config = data[1];
            communityFeedbackData = data[2];
            // console.log(communityFeedbackData)

            communityFeedbackData.forEach(element => {
                element[config.Feedback.Framework.Aggregation] = +element[config.Feedback.Framework.Aggregation];
                var mm = moment(element[config.Feedback.Framework.Date], [config.Feedback.Framework.DateFormat]);

                var date = new Date(mm.year(), mm.month(), mm.date());
                var dateF = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
                element["GoodDate"] = dateF;
            });
            globalFilteredCFData = communityFeedbackData;
            totalNumberOfFeedback = d3.sum(communityFeedbackData, (d) => { return d[config.Feedback.Framework.Aggregation]; });

            // console.log(communityFeedbackData);

            initViz();


            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();
});

// general variables/const
let primaryColor = '#204669',
    secondaryColor = '#a6b5c3',
    tertiaryColor = '#e9edf0';

let outbreakPie, feedbackTypePie;
let timeLineChart;

let overviewTable;
const topNValues = 5;

function initViz() {

    generateKeyFigures();
    generateDropdowns();
    generateDateDropdown();

    const outbreakColors = ['#D20E1E', '#118DFF', '#12239E'];
    outbreakPie = generatePieChart('topicPie', getPieChartData('Emergency'), outbreakColors);
    feedbackTypePie = generatePieChart('feedbackType', getPieChartData('Type'));

    //timeline
    var tlData = getTimelineData();
    timeLineChart = generateTimeline(tlData);
    //table
    generateDatatable();

    //map
    initiateMap();

    // 
    // generateTabsDataTable();
}
//remove empty values of an array object
function trimArray(arr) {
    var trimedArr = [];
    for (let index = 0; index < arr.length; index++) { //remove empty elements
        if (arr[index]) {
            trimedArr.push(arr[index]);
        }
    }
    return trimedArr;
}

function generateKeyFigures() {
    var numFeedback = d3.sum(globalFilteredCFData, (d) => { return d[config.Feedback.Framework.Aggregation]; }),
        numOrgs = getColumnUniqueValues("Org").length + 1;
    // feedbacks
    $('.statFeedback h5').html('');
    $('.statFeedback h5').html(numFeedback);
    // orgs
    $('.statOrg #num').html('');
    $('.statOrg #num').html(numOrgs);

} //generateKeyFigures

function getColumnUniqueValues(col, data = globalFilteredCFData) {
    var arr = [];
    data.forEach(element => {
        arr.includes(element[config.Feedback.Framework[col]]) ? null : arr.push(element[config.Feedback.Framework[col]]);
    });
    return trimArray(arr);
} //getColumnUniqueValues

function generateDropdowns() {
    var colsArr = ['Emergency', 'Type', 'Date', 'Gender', 'Population'];
    for (let index = 0; index < colsArr.length; index++) {
        const col = colsArr[index];
        var id = (col == 'Emergency') ? 'emergencySelect' :
            (col == 'Type') ? 'feedbackTypeSelect' :
            (col == 'Gender') ? 'vulnerableSelect' :
            (col == 'Population') ? 'demographicSelect' : 'dateSelect';

        var options = "";
        var data = getColumnUniqueValues(col);
        data.unshift('Select all');
        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            i == 0 ? options += '<option value="all" selected>' + element + '</option>' :
                options += '<option value="' + element + '">' + element + '</option>';
        }
        $('#' + id).append(options);
        d3.select('#' + id).property('value', 'all');
    }

} //generateEmergenciesDropdown
let monthsCal = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'Septembre', 'October', 'November', 'December']

function getDatesArr(data = globalFilteredCFData) {
    var maxDateArr = d3.max(data, (d) => { return d["GoodDate"]; }).split('-');
    var minDateArr = d3.min(data, (d) => { return d["GoodDate"]; }).split('-');

    var maxYear = maxDateArr[0],
        maxMonth = maxDateArr[1],
        minYear = minDateArr[0],
        minMonth = minDateArr[1];

    var yearsArr = [];
    if (minYear < maxYear) {
        for (minYear; minYear <= maxYear; minYear++) {
            yearsArr.push(minYear);
        }
    } else yearsArr.push(minYear);

    // var monthsArr = [];
    // for (let index = 0; index <= maxMonth - 1; index++) {
    //     monthsArr.push(monthsCal[index]);
    // }
    return yearsArr;
} //getDatesArr

function generateDateDropdown() {
    var years = getDatesArr();
    var yOpts = '';
    if (years.length == 1) {
        yOpts += '<option value="' + years[0] + '"disabled selected>' + years[0] + '</option>';
        $('#dateYearSelect').append(yOpts);
        $('#dateYearSelect').multipleSelect({
            displayValues: false,
            selectAll: false
        });
    } else {
        for (let index = 0; index < years.length; index++) {
            const element = years[index];
            yOpts += '<option value="' + element + '" selected>' + element + '</option>';
        }
        $('#dateYearSelect').append(yOpts);
        $('#dateYearSelect').multipleSelect({
            displayValues: true,
            selectAll: true
        });
    }

    var monthsOpt = '';
    for (let index = 0; index < monthsCal.length; index++) {
        const element = monthsCal[index];
        monthsOpt += '<option value="' + element + '" selected>' + element + '</option>';
    }
    $('#dateMonthSelect').append(monthsOpt);
    $('#dateMonthSelect').multipleSelect({
        displayValues: true,
        selectAll: true
    });
} //generateDateDropdown

function getPieChartData(colName, dataArg = globalFilteredCFData) {
    var data = d3.nest()
        .key(function(d) {
            return d[config.Feedback.Framework[colName]];
        })
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d[config.Feedback.Framework.Aggregation];
            });
        })
        .entries(dataArg);

    var colonnes = [];
    data.forEach(element => {
        var arr = [];
        arr.push(element.key, element.value);
        colonnes.push(arr);
    });
    return colonnes;
} //getPieChartData

function getBarChartData(colName, dataArg = globalFilteredCFData) {
    var data = d3.nest()
        .key(function(d) {
            return d[config.Feedback.Framework[colName]];
        })
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d[config.Feedback.Framework.Aggregation];
            });
        })
        .entries(dataArg).sort(sortNestedData);

    var xArr = ['x'],
        yArr = ['#feedback'];
    data.forEach(element => {
        xArr.push(element.key);
        yArr.push(element.value);
    });
    return [xArr, yArr];
} //getPieChartData

function getTimelineData(dataArg = globalFilteredCFData) {
    var data = d3.nest()
        .key((d) => { return d["GoodDate"]; })
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d[config.Feedback.Framework.Aggregation];
            });
        })
        .entries(dataArg);

    var xArr = ['x'],
        bars = ['bars'],
        lines = ['cumul'],
        colonnes = [];
    data.forEach(element => {
        xArr.push(element.key);
        bars.push(element.value);
        lines.push(element.value);
    });
    colonnes.push(xArr);
    colonnes.push(bars);
    colonnes.push(lines);

    return colonnes;
} //getTimelineData

function getSparklineData(dataArg = globalFilteredCFData) {
    //filter sur le bon range d'abord
    var data = d3.nest()
        .key(function(d) {
            return d["GoodDate"];
        })
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d[config.Feedback.Framework.Aggregation];
            });
        })
        .entries(dataArg);

    var xArr = ['x'],
        yArr = ['#feedback'],
        colonnes = [];
    data.forEach(element => {
        xArr.push(element.key);
        yArr.push(element.value);
    });
    colonnes.push(xArr);
    colonnes.push(yArr);
    return colonnes;
} //getSparklineData

function generateTimeline(data) {
    var chart = c3.generate({
        bindto: '#timeline',
        data: {
            x: 'x',
            // xFormat: '%d/%m/%Y',
            types: {
                bars: 'bar',
                cumul: 'area'
            },
            columns: data
        },
        // color: {
        //     pattern: mainColor
        // },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    centered: true,
                    outer: false,
                    fit: true,
                    format: '%m-%Y'
                }
            },
            y: {
                show: true,
                tick: {
                    centered: true,
                    outer: false,
                    fit: true,
                    count: 3,
                    format: d3.format('d')
                }
            }
        },
        size: {
            height: 200,
            width: 610
        },
        // padding: { right: 20 },
        legend: {
            hide: true
        },
        // point: { show: false },

    });
    return chart;
} //generateTimeline

const pieChartHeight = 200;
const pieChartColorRange = [primaryColor, secondaryColor, tertiaryColor];

function generatePieChart(bind, data, colorRange = pieChartColorRange) {
    var chart = c3.generate({
        bindto: '#' + bind,
        size: {
            height: pieChartHeight,
            width: 250
        },
        data: {
            columns: data,
            type: 'pie'
        },
        color: {
            pattern: colorRange
        },
        legend: {
            hide: true
        }
    });
    $('#' + bind).data('c3-chart', chart);
    return chart;
} //generatePieChart

function sortNestedData(a, b) {
    if (a.value > b.value) {
        return -1
    }
    if (a.value < b.value) {
        return 1
    }
    return 0;
} //sortNestedData

function getTopNTopics(dataArg) {
    var emergArr = getColumnUniqueValues("Emergency");
    var data = [];
    emergArr.forEach(element => {
        var filter = dataArg.filter((d) => { return d[config.Feedback.Framework.Emergency] == element; });
        var arr = d3.nest()
            .key((d) => { return d[config.Feedback.Framework.Topic]; })
            .rollup(function(d) { return d.length; })
            .entries(filter).sort(sortNestedData);

        var size = (arr.length >= topNValues) ? topNValues : arr.length;
        for (let index = 0; index < size; index++) {
            data.push({
                "emergency": element,
                "key": arr[index].key,
                "value": arr[index].value
            });
        }

    });
    data = data.sort(sortNestedData);
    var returnArg = [];
    var size = (data.length >= topNValues) ? topNValues : data.length;
    for (let index = 0; index < size; index++) {
        returnArg.push(data[index]);
    }
    return returnArg;
}

function createCodePctChart(id, value, total = totalNumberOfFeedback) {
    var colors = ['#D20E1E', '#12239E'];
    var labelArr = ['#feedback', 'total'];
    var data = [
        [labelArr[0], value],
        [labelArr[1], total - value]
    ];

    if (typeof(value) == typeof([])) {
        colors = ['#D20E1E', '#12239E', '#1f77b4', '#aec7e8'];
        var sommeVals = 0;
        data = value;
        for (let index = 0; index < value.length; index++) {
            const element = value[index];
            labelArr.push(element[0]);
            sommeVals += element[1];
        }

        labelArr.push('total');
        data.push(['total', total - sommeVals]);
    }
    const chart = c3.generate({
        bindto: '#percentage' + id,
        size: {
            width: 140,
            height: 40
        },
        data: {
            columns: data,
            type: 'bar',
            groups: [
                labelArr
            ]
        },
        color: {
            pattern: colors
        },
        axis: {
            rotated: true,
            x: {
                show: false
            },
            y: {
                show: false
            }
        },
        legend: {
            show: false
        },
        tooltip: { show: false }
    });

    return chart;
}

function generateCodesCharts(data) {
    //gauge charts
    d3.select('#datatable')
        .selectAll('.percentage')
        .attr('id', (d, i) => {
            return "percentage" + i;
        });
    // area charts
    d3.select('#datatable')
        .selectAll('.spark')
        .attr('id', (d, i) => {
            return "spark" + i;
        });

    for (let index = 0; index < data.length; index++) {
        const id = index + 1;
        createCodePctChart(id, data[index][3]);
        //spark
        var sparkdata = getSparkChartData(data[index][1], data[index][2]);
        createSparkLine(id, sparkdata);
    }
}

function createSparkLine(id, data) {
    var chart = c3.generate({
        bindto: '#spark' + id,
        size: {
            width: 180,
            height: 60
        },
        data: {
            x: 'x',
            columns: data,
            type: 'area'
        },
        axis: {
            x: {
                type: 'category',
                show: false
            },
            y: { show: false }
        },
        point: { show: false },
        // tooltip: { show: false },
        legend: { hide: true }
    });

    return chart;
} //generateSparkLine

function getSparkChartData(emergency, topic, dataArg = globalFilteredCFData) {
    var filter = dataArg.filter((d) => {
        return (d[config.Feedback.Framework.Emergency] == emergency) && (d[config.Feedback.Framework.Topic] == topic);
    });
    var data = getSparklineData(filter);

    return data;
} //getSparkChartData

function getTableData(dataArg = globalFilteredCFData) {
    var data = getTopNTopics(dataArg);
    var dt = [];
    for (let index = 0; index < data.length; index++) {
        dt.push([
            index + 1,
            data[index].emergency,
            data[index].key,
            data[index].value
        ])
    }
    return dt;
} //getTableData

function updateDataTable(data = globalFilteredCFData) {
    var dt = getTableData(data);
    $('#datatable').dataTable().fnClearTable();
    $('#datatable').dataTable().fnAddData(dt);

    generateCodesCharts(dt);

} //updateDataTable

function generateDatatable(data) {
    var dtData = getTableData();

    overviewTable = $('#datatable').DataTable({
        data: dtData,
        "columns": [
            //
            { "width": "1%" },
            { "width": "5%" },
            { "width": "15%" },
            { "width": "5%" },
            { "width": "9%" },
            { "width": "9%" },
        ],
        "columnDefs": [{
                "className": "percentage",
                "targets": [4]
            },
            {
                "className": "spark",
                "targets": [5]
            },
            {
                "defaultContent": "-",
                "targets": "_all"
            },
        ],
        "bLengthChange": false,
        "order": false,
        "dom": "Blrt"
    });

    //generateCodesCharts
    generateCodesCharts(dtData);
}
let mapadm2Arr;
let isMobile = $(window).width() < 767 ? true : false;
let g, mapsvg, projection, width, height, zoom, path;
let currentZoom = 1;
let mapFillColor = '#ccc', //'#204669',
    mapInactive = '#fff',
    mapActive = '#2F9C67',
    hoverColor = '#2F9C67';

let mapColorRange = ['#fdebe9', '#fac2bd', '#f79992', '#f37066', '#f0473a'];
let mapScale = d3.scaleQuantize()
    .domain([0, 100])
    .range(mapColorRange);

function initiateMap() {
    mapadm2Arr = getColumnUniqueValues("Adm2");
    width = (isMobile) ? 400 : 610;
    height = 400; //(isMobile) ? 400 : 400;
    // height = 500;
    var mapScale = (isMobile) ? width * 3.7 * 2 : width * 3.7
    var mapCenter = [17.1, -0.5]; //[28, -20.1]; //(isMobile) ? [12, 12] : [28, -20.1]; // deplace la carte vertical, horizontal

    projection = d3.geoMercator()
        .center(mapCenter)
        .scale(4500) //3000
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
            var className = (mapadm2Arr.includes(d.properties.Nom)) ? 'hasFeedback' : 'inactive';
            return className;
        });
    // .attr('fill', 'red');

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

    var tipPays = d3.select('#countries').selectAll('path');
    g.filter('.hasFeedback')
        .on("mousemove", function(d) {
            // var mapData = generateDataForMap();
            showMapTooltip(d, maptip);
        })
        .on("mouseout", function(d) {
            maptip.classed('hidden', true);
        });

} //initiateMap

function showMapTooltip(d, maptip) {
    var mapData = generateDataForMap(globalFilteredCFData);
    var filtered = mapData.filter(pt => pt.key == d.properties.Nom);
    var value = filtered[0].value; // en pourcentage a calculer si tu veux 
    var mouse = d3.mouse(mapsvg.node()).map(function(d) { return parseInt(d); });
    var text = "Region : " + d.properties.Nom + "<br> # feedback: " + value;

    maptip
        .classed('hidden', false)
        .attr('style', 'left:' + (mouse[0]) + 'px; top:' + (mouse[1] + 25) + 'px')
        .html(text);
} //showMapTooltip

// zoom on buttons click
function zoomed() {
    const { transform } = d3.event;
    currentZoom = transform.k;

    if (!isNaN(transform.k)) {
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);

    }
}

function choroplethMap(CFdata = globalFilteredCFData) {
    var mapData = generateDataForMap(CFdata);
    var max = mapData[0].value;
    mapsvg.selectAll('path').each(function(element, index) {
        d3.select(this).transition().duration(500).attr('fill', function(d) {
            var filtered = mapData.filter(pt => pt.key == d.properties.Nom);
            var num = (filtered.length != 0) ? filtered[0].value : null;
            var clr = (num == null) ? '#F2F2EF' : mapScale(Math.round((num * 100) / max));
            return clr;
        });
    });
}

function generateDataForMap(CFdata = communityFeedbackData) {
    var data = d3.nest()
        .key(function(d) { return d[config.Map.Admin2]; })
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                return d[config.Feedback.Framework.Aggregation];
            });
        })
        .entries(CFdata).sort(sortNestedData);
    return data;
} //generateDataForMap

function updateDataSourceFromSelects() {
    var data = communityFeedbackData;

    var emergencySelected = $('#emergencySelect').val();
    var feedbackTypeSelected = $('#feedbackTypeSelect').val();
    var demographicSelected = $('#demographicSelect').val();
    var vulnerableSelected = $('#vulnerableSelect').val();

    if (emergencySelected != "all") {
        data = data.filter(function(d) {
            return d[config.Feedback.Framework.Emergency] == emergencySelected;
        })
    }
    if (feedbackTypeSelected != "all") {
        data = data.filter(function(d) {
            return d[config.Feedback.Framework.Type] == feedbackTypeSelected;
        })
    }
    if (demographicSelected != "all") {
        data = data.filter(function(d) {
            return d[config.Feedback.Framework.Population] == demographicSelected;
        })
    }
    if (vulnerableSelected != "all") {
        data = data.filter(function(d) {
            return d[config.Feedback.Framework.Gender] == vulnerableSelected;
        })
    }
    // handle data is void

    globalFilteredCFData = data;
} //getFilteredDataFromSelects

function updateVisuals() {
    // get new data
    updateDataSourceFromSelects();

    generateKeyFigures();
    // update pie charts
    outbreakPie.load({
        columns: getPieChartData('Emergency'),
        unload: true
    });
    feedbackTypePie.load({
        columns: getPieChartData('Type'),
        unload: true
    });
    var tlData = getTimelineData();
    //update timeline
    timeLineChart.load({
        columns: tlData,
        unload: true
    });

    //update datatable
    updateDataTable();

    // update map choropleth
    choroplethMap();
}

$('#emergencySelect').on("change", function() {
    updateVisuals();
});

$('#feedbackTypeSelect').on("change", function() {
    updateVisuals();
});

$('#vulnerableSelect').on("change", function() {
    updateVisuals();
});

$('#demographicSelect').on("change", function() {
    updateVisuals();
});

//reset 
$('#fResetAll').on("click", function() {
    $('#emergencySelect').val('all');
    $('#feedbackTypeSelect').val('all');
    $('#vulnerableSelect').val('all');
    $('#demographicSelect').val('all');
    // reset dates !

    updateVisuals();
});

//Click event handler for nav-items
$('.navFeedback').on('click', function() {
    $('.navFeedback a').removeClass('active');
    $('.navigation').addClass('hidden');


    //Add active class to the clicked item
    var nav = $('a', this).attr('value');
    if (["rumours", "suggestions", "questions"].includes(nav)) {
        //filter tabs datatable
        updateTabsDataTable(nav);
        nav = "tabsContent";
    } else if (nav == 'metrics') {
        if (metricsDataTable == undefined) {
            generateMetrics();
        }

    }
    $('#' + nav).removeClass('hidden');
    $('a', this).addClass('active');

});

// others tabs

function updateTabsDataTable(nav) {
    var type = config.Feedback.Framework.Types[nav];
    var filter = communityFeedbackData.filter((d) => { return d[config.Feedback.Framework.Type] == type; });
    // var title = (type == "rumours") ? "Rumors & believes" : type;

    $('#tabsContent .panel-title').html(type);

    var max = d3.sum(filter, (d) => { return d[config.Feedback.Framework.Aggregation]; });
    if (tabsDataTable == undefined) {
        //create the table 
        generateTabsDataTable(filter);
    } else {
        var dt = getTabsDataTableData(filter);
        $('#tabsDataTable').dataTable().fnClearTable();
        $('#tabsDataTable').dataTable().fnAddData(dt);
        generateTabsDTCodesCharts(dt, max);
    }


} //updateTabsDataTable

let tabsDataTable;

function generateTabsDataTable(dataArg = communityFeedbackData) {
    var dtData = getTabsDataTableData(dataArg);
    tabsDataTable = $('#tabsDataTable').DataTable({
        data: dtData,
        "columns": [
            //
            { "width": "1%" },
            { "width": "3%" },
            { "width": "6%" },
            { "width": "20%" },
            { "width": "5%" },
            { "width": "8%" },
            { "width": "8%" },
        ],
        "columnDefs": [{
                "className": "percentage",
                "targets": [5]
            },
            {
                "className": "spark",
                "targets": [6]
            },
            {
                "defaultContent": "-",
                "targets": "_all"
            },
        ],
        "bLengthChange": false,
        // "paging": false,
        // "scrollY": 600,
        "pageLength": 15,
        // "bLengthChange": false,
        // "pagingType": "simple_numbers",
        "order": false,
        "dom": "Blrtp"
    });

    generateTabsDTCodesCharts(dtData);
} //generateTabsDataTable

function getTabsDataTableData(dataArg) {
    var data = getFormattedTabsTableData(dataArg);
    var dt = [];
    for (let index = 0; index < data.length; index++) {
        dt.push([
            index + 1,
            data[index].emergency,
            data[index].code,
            data[index].topic,
            data[index].value
        ])
    }
    return dt;
} //getTabsDataTableData

function getFormattedTabsTableData(dataArg) {
    var emergArr = getColumnUniqueValues("Emergency");
    var data = [];
    emergArr.forEach(element => {
        var filter = dataArg.filter((d) => { return d[config.Feedback.Framework.Emergency] == element; });
        var arr = d3.nest()
            .key((d) => {
                return [d[config.Feedback.Framework.Code] + '/' + d[config.Feedback.Framework.Topic]];
            })
            .rollup(function(d) { return d.length; })
            .entries(filter).sort(sortNestedData);
        var size = arr.length;
        for (let index = 0; index < size; index++) {
            var codeTopic = String(arr[index].key).trim().split('/');
            data.push({
                "emergency": element,
                "code": codeTopic[0],
                "topic": codeTopic[1],
                "value": arr[index].value
            });
        }

    });
    data = data.sort(sortNestedData);
    return data;
}

function generateTabsDTCodesCharts(data, max) {
    //gauge charts
    // console.log(data);
    d3.select('#tabsDataTable')
        .selectAll('.percentage')
        .attr('id', (d, i) => {
            return "percentage-" + i;
        });

    // area charts
    d3.select('#tabsDataTable')
        .selectAll('.spark')
        .attr('id', (d, i) => {
            return "spark-" + i;
        });
    // restons sur les 15 premieres valeurs, qui sont affcichees sur la table
    for (let index = 0; index < 15; index++) {
        const id = "-" + data[index][0];
        createCodePctChart(id, data[index][4], max);
        //spark
        var sparkdata = getSparkChartDataForTabs(data[index][1], data[index][2], data[index][3]);
        // console.log(sparkdata);
        createSparkLine(id, sparkdata);
    }

}

function getSparkChartDataForTabs(emergency, code, topic, dataArg = communityFeedbackData) {
    // var filter = dataArg.filter((d) => {
    //     return (d[config.Feedback.Framework.Emergency] == emergency &&
    //         d[config.Feedback.Framework.Code] == code &&
    //         d[config.Feedback.Framework.Topic] == topic);
    // });
    // var filter2 = dataArg.filter((d) => {
    //     return (d[config.Feedback.Framework.Emergency] == emergency &&
    //         d[config.Feedback.Framework.Code] == code);
    // });
    var filter = dataArg
        .filter((d) => {
            return d[config.Feedback.Framework.Emergency] == emergency;
        })
        .filter((v) => { return v[config.Feedback.Framework.Code] == code });

    if (topic != "") {
        filter = filter.filter((v) => { return v[config.Feedback.Framework.Topic] == topic; });
    }

    var data = (filter.length == 0) ? [] : getSparklineData(filter);
    // console.log(filter);
    return data;
} //getSparkChartData

// Metrics
let demographicPie,
    genderPie,
    vulnerablesPie,
    channelsPie;

let metricsDataTable;

function generateMetrics() {
    demographicPie = generatePieChart('demographicPie', getPieChartData('Population'));
    genderPie = generatePieChart('genderPie', getPieChartData('Gender'));
    vulnerablesPie = generatePieChart('vulnerablesPie', getPieChartData('Population'));
    channelsPie = generatePieChart('channelsPie', getPieChartData('Emergency'));

    generateMetricsDataTable();

} //generateMetrics

function generateMetricsDataTable(dataArg = communityFeedbackData) {
    var dtData = getMetricsTableData(dataArg);
    metricsDataTable = $('#metricsTable').DataTable({
        data: dtData,
        "columns": [
            //
            { "width": "1%" },
            { "width": "3%" },

            { "width": "3%" },
            { "width": "3%" },
            { "width": "3%" },
            { "width": "3%" },
            { "width": "3%" },

            { "width": "5%" },
            { "width": "5%" },
            { "width": "9%" },
            { "width": "9%" }
        ],
        "columnDefs": [
            //
            {
                "className": "gender",
                "targets": [7]
            },
            {
                "className": "vul",
                "targets": [8]
            },
            {
                "className": "pct",
                "targets": [9]
            },
            {
                "className": "spk",
                "targets": [10]
            },
            {
                "defaultContent": "-",
                "targets": "_all"
            },
        ],
        "bLengthChange": false,
        "order": false,
        "dom": "Blrt"
    });
    generateMetricsTableCharts(dtData);
} //generateMetricsDataTable

function getMetricsTableData(dataArg) {
    var regData = d3.nest()
        .key((d) => { return d[config.Feedback.Framework.Adm1]; })
        .rollup((v) => {
            return d3.sum(v, function(d) {
                return d[config.Feedback.Framework.Aggregation];
            });
        })
        .entries(dataArg).sort(sortNestedData);

    var data = [];
    var i = 0;
    regData.forEach(reg => {
        i++;
        var filter = dataArg.filter(function(d) { return d[config.Feedback.Framework.Adm1] == reg.key });
        var arr = d3.nest()
            .key((d) => { return d[config.Feedback.Framework.Type]; })
            .rollup((v) => {
                return d3.sum(v, function(d) {
                    return d[config.Feedback.Framework.Aggregation];
                });
            })
            .entries(filter);

        var qval, reqVal, rumorsVal, otherVal = 0;
        for (let index = 0; index < arr.length; index++) {
            arr[index].key == config.Feedback.Framework.Types['rumours'] ? rumorsVal = arr[index].value :
                arr[index].key == config.Feedback.Framework.Types['questions'] ? qval = arr[index].value :
                arr[index].key == config.Feedback.Framework.Types['suggestions'] ? reqVal = arr[index].value : otherVal += arr[index].value;
        }

        data.push([
            i,
            reg.key,
            reg.value,
            rumorsVal,
            qval,
            reqVal,
            otherVal
        ]);
    });
    return data;
} //getMetricsTableData

function generateMetricsTableCharts(data, dataArg = communityFeedbackData) {
    console.log(data);

    //gender charts
    d3.select('#metricsTable')
        .selectAll('.gender')
        .attr('id', (d, i) => {
            return "percentage-" + i;
        });

    //vulnerable groups charts
    d3.select('#metricsTable')
        .selectAll('.vul')
        .attr('id', (d, i) => {
            return "vul-" + i;
        });


    //gauge charts
    d3.select('#metricsTable')
        .selectAll('.pct')
        .attr('id', (d, i) => {
            return "percentage-2-" + i;
        });

    // area charts
    d3.select('#metricsTable')
        .selectAll('.spk')
        .attr('id', (d, i) => {
            return "spark-" + i;
        });

    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const id = "-" + data[index][0];
        // Gender chart
        const filter = dataArg.filter((d) => { return d[config.Feedback.Framework.Adm1] == element[1]; });
        const genderdata = getPieChartData("Gender", filter);
        createCodePctChart(id, genderdata);

        // vulnerable chart
        const vuldata = getBarChartData("Population", filter);
        generateBarChart(id, vuldata);

        //gauge total
        const pctid = "-2" + id;
        createCodePctChart(pctid, element[2]);

        //spark
        var sparkdata = getSparklineData(filter);
        createSparkLine(id, sparkdata);
    }
}

function generateBarChart(id, data) {
    var chart = c3.generate({
        bindto: '#vul' + id,
        size: {
            height: 65,
            width: 100
        },
        data: {
            x: 'x',
            columns: data,
            type: 'bar'
        },
        bar: {
            width: {
                ratio: 0.2
            }
        },
        // color: {
        //     pattern: [primaryColor]
        // },
        axis: {
            x: {
                type: 'category',
                // show: false
                tick: {
                    centered: true,
                    outer: false,
                    fit: true
                }
            },
            y: {
                show: false
            }
        },
        legend: {
            show: false
        }
    });
    return chart;
} //generateBarChart