/**
 * Behaviors Page
 */

let situationDataUrl = 'data/deep.csv';
let configFile = 'config/config.json';
let testDataURL = 'data/radial.csv';

let situationData;
let config;
let factorsArr = [];
let datatableContext;

const radialDict = [];
let max = 0;

let outbreaksArr = ["All outbreaks"],
    areasArr = ["All areas"],
    groupsArr = ["All groups"],
    radialColumns = ["factor", "health", "interventions", "outbreak"];
$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.csv(situationDataUrl),
            d3.json(configFile)
        ]).then(function(data) {
            situationData = data[0];
            config = data[1];

            // clean data
            situationData = situationData.filter((d) => {
                return d[config.Context.Framework.Dimension] != "";
            });
            situationData.forEach(element => {
                if (element[config.Context.Framework.Type_outbreak] == "Disease") {
                    outbreaksArr.includes(element[config.Context.Framework.Type_outbreak_subdim]) ? '' : outbreaksArr.push(element[config.Context.Framework.Type_outbreak_subdim]);
                }
                areasArr.includes(element[config.Context.Framework.Admin2]) ? '' : areasArr.push(element[config.Context.Framework.Admin2]);
                groupsArr.includes(element[config.Context.Framework.Population]) ? '' : groupsArr.push(element[config.Context.Framework.Population]);
                // element['Outbreak'] = codeImpactData(element[config.Context.Framework.Outbreak]);
                factorsArr.includes(element[config.Context.Framework.Subdimension]) ? '' : factorsArr.push(element[config.Context.Framework.Subdimension]);
            });

            //removed empty elements
            factorsArr = trimArray(factorsArr);
            outbreaksArr = trimArray(outbreaksArr);
            areasArr = trimArray(areasArr);
            groupsArr = trimArray(groupsArr);

            for (let index = 0; index < factorsArr.length; index++) {
                const element = factorsArr[index];
                radialDict.push({
                    "id": index + 1,
                    "factor": element
                });
            }

            getRadialData();

            genenrateContextDropdowns();
            generateContextKeyFigures();
            generateRadialChart();
            // generate right legends items
            createTableLegends();

            generateHtmlTable();
            generateContextDataTable();
            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();

});

function trimArray(arr) {
    var trimedArr = [];
    for (let index = 0; index < arr.length; index++) { //remove empty elements
        if (arr[index]) {
            trimedArr.push(arr[index]);
        }
    }
    return trimedArr;
}

function generateContextKeyFigures(data = situationData) {
    var refs = data.length - 1,
        lastDate = getLastDate(data);
    // data points
    $('.statContext h5').html('');
    $('.statContext h5').html(refs);
    // date
    $('.statContextNum #num').html('');
    $('.statContextNum #num').text(lastDate);

} //generateContextKeyFigures

function getLastDate(data = situationData) {
    var max = d3.max(data, function(d) { return d['Date'] });
    return max;
} //getLastDate

function genenrateContextDropdowns() {
    var outbreaksOpt = '',
        areasOpt = '',
        groupsOpt = '';
    $('#outbreakSelect').html('');
    $('#areaSelect').html('');
    $('#groupsSelect').html('');
    //outbreak select
    for (let index = 0; index < outbreaksArr.length; index++) {
        const element = outbreaksArr[index];
        index == 0 ? outbreaksOpt += '<option value="all" selected>' + element + '</option>' :
            outbreaksOpt += '<option value="' + element + '">' + element + '</option>';

    }
    //area select
    for (let index = 0; index < areasArr.length; index++) {
        const element = areasArr[index];
        index == 0 ? areasOpt += '<option value="all" selected>' + element + '</option>' :
            areasOpt += '<option value="' + element + '">' + element + '</option>';

    }
    //vulnerable group select
    for (let index = 0; index < groupsArr.length; index++) {
        const element = groupsArr[index];
        index == 0 ? groupsOpt += '<option value="all" selected>' + element + '</option>' :
            groupsOpt += '<option value="' + element + '">' + element + '</option>';

    }
    $('#outbreakSelect').append(outbreaksOpt);
    $('#areaSelect').append(areasOpt);
    $('#groupsSelect').append(groupsOpt);

} //genenrateBehaviorsFilters

function getFactorId(factor) {
    var id = 0;
    for (let index = 0; index < radialDict.length; index++) {
        const element = radialDict[index];
        if (element.factor == factor) {
            id = element.id;
            break;
        }
    }
    return id;
} //getFactorId

//returns health: [Neg, Neu, Pos]
function formatNestedFactorData(impact, data) {
    var arr = [0, 0, 0];
    if (impact == "Health") {
        data.forEach(element => {
            element.key == "Decrease" ? arr[0] = element.value :
                element.key == "Neutral" ? arr[1] = element.value :
                element.key == "Increase" ? arr[2] = element.value : null;
        });
    }
    if (impact == "Interventions") {
        data.forEach(element => {
            element.key == "Hinder" ? arr[0] = element.value :
                element.key == "Neutral" ? arr[1] = element.value :
                element.key == "Enable" ? arr[2] = element.value : null;
        });
    }
    if (impact == "Outbreak") {
        data.forEach(element => {
            element.key == "Discourage" ? arr[0] = element.value :
                element.key == "Neutral" ? arr[1] = element.value :
                element.key == "Facilitate" ? arr[2] = element.value : null;
        });
    }
    // if (data.length != 3) {
    //     for (let index = 0; index < arr.length; index++) {
    //         arr[index] == undefined ? arr[index] = 0 : null;
    //     }
    // }
    return arr;
} //formatNestedFactorData

function getRadialData(data = situationData) {
    var radialData = [];
    var impacts = ['Health', 'Interventions', 'Outbreak'];

    for (let index = 0; index < factorsArr.length; index++) {
        const factor = factorsArr[index];
        var filter = data.filter((d) => {
            return d[config.Context.Framework.Subdimension] == factor;
        });
        var factorData = []
        for (let k = 0; k < impacts.length; k++) {
            const impact = impacts[k];

            var impactDt = d3.nest()
                .key((d) => {
                    return d[config.Context.Framework[impact]];
                })
                .rollup((d) => { return d.length; })
                .entries(filter);
            factorData.push({ "impact": impact, "data": impactDt });
        }
        var healthArr = formatNestedFactorData('Health', factorData[0]['data']),
            InterArr = formatNestedFactorData('Interventions', factorData[1]['data']),
            OutbreakArr = formatNestedFactorData('Outbreak', factorData[2]['data']);
        //
        radialData.push({
            'id': getFactorId(factor),
            'factor': factor,
            // negatives
            'health - Neg': healthArr[0],
            'int - Neg': InterArr[0],
            'out - Neg': OutbreakArr[0],
            // neutrals
            'health - Neu': healthArr[1],
            'int - Neu': InterArr[1],
            'out - Neu': OutbreakArr[1],

            // positives
            'health - Pos': healthArr[2],
            'int - Pos': InterArr[2],
            'out - Pos': OutbreakArr[2],
            //
            'total': d3.sum([...healthArr, ...InterArr, ...OutbreakArr])
        })
    } //end factorArr loop

    return radialData;
} //getRadialData

function filterRadialData(data) {
    var filtered = [];
    data.forEach(element => {
        var allValuesAreZero = true;

        for (let index = 0; index < headers.length; index++) {
            if (element[headers[index]] != 0) {
                allValuesAreZero = false;
                break;
            }
        }
        (!allValuesAreZero) ? filtered.push(element): null;
    });
    return filtered;
} // filterRadialData

var g;
var radialChartScale;

const healthColorArr = ["#dd4465", "#eed9c4", "#209770"], //"#E9F1EA", "#2F9C67", "#9EC8AE"
    InterventionsColorArr = ["#e76889", "#faf0e6", "#47b983"], //"#D90368", "#E996AD", "#FAE7EA"
    OutbreakColorArr = ["#ca2142", "#c7b099", "#0c5a3d"]; //"#204669", "#798BA5", "#DBDEE6"

const negativesColorArr = ["#dd4465", "#e76889", "#ca2142"],
    neutralsColorArr = ["#eed9c4", "#faf0e6", "#c7b099"],
    positivesColorArr = ["#209770", "#47b983", "#0c5a3d"];
const impactColorRange = [...negativesColorArr, ...neutralsColorArr, ...positivesColorArr];
var headers = [
    'health - Neg', 'int - Neg', 'out - Neg',
    'health - Neu', 'int - Neu', 'out - Neu',
    'health - Pos', 'int - Pos', 'out - Pos'
];

function generateRadialChart(dataArg) {
    d3.select('#radial').select('svg')
        // .transition().delay(100).duration(500)
        .remove();
    var dataToFilter = getRadialData(dataArg);

    var data = filterRadialData(dataToFilter);

    var maxi = d3.max(data, function(d) { return d.total; });
    maxi > max ? max = maxi : null;

    // Variables
    var width = 620;
    var height = 520;
    g = d3.select('#radial').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
    var innerRadius = 75,
        outerRadius = 300; //Math.min(width, height) / 5;

    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);

    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius]);

    radialChartScale = d3.scaleOrdinal()
        .domain(['health - Neg', 'int - Neg', 'out - Neg', 'health - Neu', 'int - Neu', 'out - Neu', 'out - Neu', 'health - Pos', 'int - Pos', 'out - Pos'])
        .range(impactColorRange);
    // .range(["#98abc5", "#8a89a6", "#7b6888"]);

    x.domain(data.map(function(d) { return d.id; }));
    // y.domain([0, d3.max(data, function(d) { return d.total; })]);
    y.domain([0, max]);
    // radialChartScale.domain(['health', 'interventions', 'outbreak']);

    var radialtip = d3.select('#radial').append('div').attr('class', 'd3-tip map-tip hidden');

    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(headers)(data))
        .enter().append("g")
        .attr("fill", function(d) {
            return radialChartScale(d.key);
        })
        .selectAll("path")
        .data(function(d) { return d; })
        .enter().append("path")
        .attr("class", "bar")
        .transition()
        .ease(d3.easeLinear)
        .attr("d", d3.arc()

            .innerRadius(function(d) { return y(d[0]); })
            .outerRadius(function(d) { return y(d[1]); })
            .startAngle(function(d) { return x(d.data.id); })
            .endAngle(function(d) { return x(d.data.id) + x.bandwidth(); })

            .padAngle(0.01)
            .padRadius(innerRadius))
        .delay((d, i) => {
            return i * 50;
        });

    g.selectAll("path").on("mousemove", function(d) {
            var x = d3.event.pageX,
                y = d3.event.pageY;
            showRadialTooltip(d, radialtip, x, y);
        })
        .on("mouseout", function() {
            radialtip.classed('hidden', true);
        });
    // .on("click", function(d) {
    //     return console.log(d)
    // });

    var label = g.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr('id', 'labels')
        .attr("text-anchor", "middle")
        .attr("transform", function(d) { return "rotate(" + ((x(d.id) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });


    label.append("line")
        .transition()
        .attr("x2", -5)
        .attr("stroke", "#000")
        .delay((d, i) => {
            return i * 50;
        });

    label.append("text")
        .attr("transform", function(d) { return (x(d.id) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
        .transition()
        .text(function(d) { return d.id; })
        .delay((d, i) => {
            return i * 50;
        });

} //generateRadialChart

function showRadialTooltip(d, radialtip, x, y) {
    radialtip
        .classed('hidden', false)
        // .attr('style', 'left:' + (mouse[0]) + 'px; top:' + (mouse[1] + 100) + 'px')
        .attr('style', 'left:' + x + 'px; top:' + y + 'px')
        .html(d.data.factor);
} //showMapTooltip

function createD3OrdinalLegend(impact) {
    var colorRange = [],
        arr = [];
    if (impact == "Health") {
        colorRange = healthColorArr;
        arr = config.Context.Framework.ImpactDictionay.Health;
    }
    if (impact == "Interventions") {
        colorRange = InterventionsColorArr;
        arr = config.Context.Framework.ImpactDictionay.Interventions;
    }
    if (impact == "Outbreak") {
        colorRange = OutbreakColorArr;
        arr = config.Context.Framework.ImpactDictionay.Outbreak;
    }
    var ordinal = d3.scaleOrdinal()
        .domain(arr)
        .range(colorRange);

    return d3.legendColor().scale(ordinal);
}

function getImpactColorAndVocab(impact) {
    var colorRange = [],
        label = "",
        arr = [];
    if (impact == "Health") {
        colorRange = healthColorArr;
        arr = config.Context.Framework.ImpactDictionay.Health;
        label = config.Context.Framework.Health;
    }
    if (impact == "Interventions") {
        colorRange = InterventionsColorArr;
        arr = config.Context.Framework.ImpactDictionay.Interventions;
        label = config.Context.Framework.Interventions;
    }
    if (impact == "Outbreak") {
        colorRange = OutbreakColorArr;
        arr = config.Context.Framework.ImpactDictionay.Outbreak;
        label = config.Context.Framework.Outbreak;
    }
    return [colorRange, arr, label];
} //getImpactColorAndVocab

function createTableLegends() {
    //factors legends
    $('#factorLegend').html('');
    //factors listing
    var factorLegend = '<ul>';
    radialDict.forEach(element => {
        factorLegend += '<li>' + element.id + ": " + element.factor + '</li>';
    });
    factorLegend += '</ul>';

    var tab = '<table class="table table-light table-hover table-sm table-borderless" id="tableLegend">';
    // '<thead class="table-light">' +
    // '<tr>' +
    // '<th></th>' +
    // '<th>Negatives</th>' +
    // '<th>Neutral</th>' +
    // '<th>Positives</th>' +
    // '</tr>' +
    // '</thead>';
    //tbody
    tab += '<tbody>';
    var impactArr = ['Health', 'Interventions', 'Outbreak'];
    for (let index = 0; index < impactArr.length; index++) {
        const impact = impactArr[index];

        let [colArr, vocabs, label] = getImpactColorAndVocab(impact);
        //row
        var tabRow = '<tr><th scope="row">' + label + '</th>';
        //td
        for (let k = 0; k < colArr.length; k++) {
            const color = colArr[k];
            tabRow += '<td bgcolor="' + color + '">' + vocabs[k] + '</td>';
        }
        tabRow += '</tr>';
        // add row to tables
        tab += tabRow;
    }
    tab += '</tbody>';

    $('#factorLegend').html(factorLegend);
    $('#impactLegend').append(tab);
} //createTableLegends

function createLegends() {
    $('#factorLegend').html('');
    //factors listing
    var factorLegend = '<ul>';
    radialDict.forEach(element => {
        factorLegend += '<li>' + element.id + ": " + element.factor + '</li>';
    });
    factorLegend += '</ul>';

    var impactArr = ['Health', 'Interventions', 'Outbreak'];


    var div = d3.select('#impactLegend');

    impactArr.forEach(impact => {
        div.append('div')
            .attr('class', 'ordinalLegend')
            .attr('id', impact);

        d3.select('#' + impact).append('h5').text(config.Context.Framework[impact]);

        d3.select('#' + impact).append('svg')
            .attr('class', 'scale')
            .call(createD3OrdinalLegend(impact));
    });

    $('#factorLegend').html(factorLegend);

} //createLegends



function generateHtmlTable() {
    $('#datatableContext').html('');
    var arr = config.Context.Framework.TableHeadersCleaned;
    var table = "<thead><tr><th></th>";
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        table += '<th>' + element + '</th>';
    }
    table += '</tr></thead>';
    $('#datatableContext').html(table);

} //generateHtmlTable

function getDataTableData(data = situationData) {
    var dt = [];
    var headers = config.Context.Framework.TableHeaders;
    data.forEach(element => {
        var vals = []; //start with the id
        for (let index = 0; index < headers.length; index++) {
            var value = "";
            headers[index] == "Health and social consequences" ? value = getTaggedImpact("health", element[headers[index]]) :
                headers[index] == "Interventions to control the outbreak" ? value = getTaggedImpact("Interventions", element[headers[index]]) :
                headers[index] == "Spread of the outbreak" ? value = getTaggedImpact("Outbreak", element[headers[index]]) : value = element[headers[index]];

            vals.push(value);
        }
        // vals.push(getTaggedImpact(element));
        dt.push(vals)
    });
    return dt;
} //getDataTableData

//v1 return concatenated values of config.Context.Framework.Impact elements
function getTaggedImpact(className, value) {
    var formattedTags = (value != "") ? '<label class="alert tag-' + className + ' ' + value + '">' + value + '</label>' : null;

    return formattedTags;
} //getTaggedImpact

// table impact colors
const impactHealthDecrease = '',
    impactHealthIncrease = '',
    impactHealthNeutral = '';

const impactOutbreakDiscourage = '',
    impactOutbreakFacilitate = '',
    impactOutbreakNeutral = '';

const impactInterventionsEnable = '',
    impactInterventionsHinder = '',
    impactInterventionsNeutral = '';

function getTableImpactColor(impactVocab) {
    var col = ''
    if (['Decrease', 'Increase', 'Neutral'].includes(impactVocab)) {
        col = (impactVocab == "Decrease") ? impactHealthDecrease :
            col = (impactVocab == "Increase") ? impactHealthIncrease : impactHealthNeutral;

        return;
    }
    if (['Discourage', 'Facilitate', 'Neutral'].includes(impactVocab)) {
        col = (impactVocab == "Discourage") ? impactOutbreakDiscourage :
            col = (impactVocab == "Facilitate") ? impactOutbreakFacilitate : impactOutbreakNeutral;

        return;
    }
    if (['Enable', 'Hinder', 'Neutral'].includes(impactVocab)) {
        col = (impactVocab == "Decrease") ? impactInterventionsEnable :
            col = (impactVocab == "Increase") ? impactInterventionsHinder : impactInterventionsNeutral;

        return;
    }

} //getTableImpactColor

function generateContextDataTable() {
    var dtData = getDataTableData();
    datatableContext = $('#datatableContext').DataTable({
        data: dtData,
        "columns": [
            { "width": "1%" },
            { "width": "20%" },
            { "width": "10%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" }
        ],
        "columnDefs": [{
                "className": "dt-head-left",
                "targets": "_all"
            },
            {
                "defaultContent": "-",
                "targets": "_all"
            },
            { "targets": [0], "visible": false }
            // { "targets": [8], "visible": false }, { "targets": [9], "visible": false }, { "targets": [10], "visible": false },
            // { "searchable" : true, "targets": "_all"},
            // {"type": "myDate","targets": 4}
        ],
        "pageLength": 10,
        "bLengthChange": false,
        "pagingType": "simple_numbers",
        "order": [
            [1, 'asc']
        ],
        "dom": "Blrtp"
    });

} //generateContextDataTable

function getFilteredData() {
    var filter = situationData;
    var outbreak = $('#outbreakSelect').val(),
        area = $('#areaSelect').val(),
        pop = $('#groupsSelect').val();

    if (outbreak != "all") {
        filter = filter.filter(function(d) { return d[config.Context.Framework.Type_outbreak_subdim] == outbreak; });
    }
    if (area != "all") {
        filter = filter.filter(function(d) { return d[config.Context.Framework.Admin2] == area; });
    }
    if (pop != "all") {
        filter = filter.filter(function(d) { return d[config.Context.Framework.Population] == pop; });
    }
    return filter;
} //getFilteredData

$('#outbreakSelect').on('change', function(d) {
    var filter = getFilteredData();
    generateRadialChart(filter);
});
$('#areaSelect').on('change', function(d) {

    var filter = getFilteredData();
    console.log(filter);
    generateRadialChart(filter);
});
$('#groupsSelect').on('change', function(d) {
    var filter = getFilteredData();
    generateRadialChart(filter);
});