/**
 * Behaviors Page
 */

let situationDataUrl = 'data/deep.csv';
let configFile = 'config/config.json';

let situationData;
let config;
let factorsArr = [];
let datatableContext;

let outbreaksArr = ["All outbreaks", "Outbreak 1", "Outbreak 2", "Outbreak 3"],
    areasArr = ["All areas", "Area 1", "Area 2", "Area 3"],
    groupsArr = ["All groups", "Vulnerable Group 1", "Vulnerable Group 2"];
$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.csv(situationDataUrl),
            d3.json(configFile),
        ]).then(function(data) {
            situationData = data[0];
            config = data[1];

            // clean data
            situationData = situationData.filter((d) => {
                return d[config.Context.Framework.Dimension] != "";
            });
            situationData.forEach(element => {
                factorsArr.includes(element[config.Context.Framework.Subdimension]) ? '' : factorsArr.push(element[config.Context.Framework.Subdimension]);
            });
            console.log(situationData)
            genenrateContextDropdowns();
            generateSunBurstChart();
            generateHtmlTable();
            generateBehaviorsDataTable();
            // generateSunBurstChart();
            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();

});

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


function getSunburstData(data = situationData, factors = factorsArr) {
    var jsonObj = { "name": "data", "children": [] };
    var impactArr = config.Context.Framework.Impact;

    factors.forEach(factor => {
        var jsFactor = { "name": factor, "children": [] };
        var fdata = data.filter((d) => { return d[config.Context.Framework.Subdimension] == factor; });
        for (let index = 0; index < impactArr.length; index++) {
            const impact = impactArr[index];
            var impactData = d3.nest()
                .key((d) => { return d[config.Context.Framework.Subdimension]; })
                .key((d) => { return d[impact]; })
                .rollup((d) => { return d.length; })
                .entries(fdata);
            jsFactor["children"].push({ "name": impact, "children": impactData[0].values });
        }

        jsonObj["children"].push(jsFactor);
    });
    return jsonObj;
} //getSunburstData

// Variables
var width = 500;
var height = 500;
var radius = Math.min(width, height) / 2;

function generateSunBurstChart() {
    var data = getSunburstData();
    //data = nodedata;

    var g = d3.select('#sunburst').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

    // Data strucure
    var partition = d3.partition()
        .size([2 * Math.PI, radius]);
    // Find data root
    var root = d3.hierarchy(data)
        .sum(function(d) { return d.value });
    // Size arcs
    partition(root);
    var arc = d3.arc()
        .startAngle(function(d) { return d.x0 })
        .endAngle(function(d) { return d.x1 })
        .innerRadius(function(d) { return d.y0 })
        .outerRadius(function(d) { return d.y1 });

    // Put it all together
    g.selectAll('path')
        .data(root.descendants())
        .enter().append('path')
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .style('stroke', '#fff')
        .style("fill", function(d) {
            return getColor(d);
        });

} //generateSunBurstChart

function getColor(data) {
    var color = '#ccc';

    if (data.height == 2) {
        color = '#5C3160';
    } else if (data.height == 1) {
        color = '#7A1600'; // outbreak
        color = data.data.name == config.Context.Framework.Health ? '#EE3224' :
            data.data.name == config.Context.Framework.Interventions ? '#786A65' : null;
    } else {
        var healthColors = {
                "Increase": '#eb4034',
                "Neutral": '#aba59f',
                "Decrease": '#34e627'
            },
            interventionsColors = {
                "Enable": '#b01e13',
                "Neutral": '#c7c2bd',
                "Hinder": '#43c23a'
            },
            outbreakColors = {
                "Facilitate": '#ed766d',
                "Neutral": '#e8e5e1',
                "Discourage": '#0e9905'
            };
        var range = config.Context.Framework.ImpactDictionay.Health.includes(data.data.key) ? healthColors :
            config.Context.Framework.ImpactDictionay.Interventions.includes(data.data.key) ? interventionsColors : outbreakColors;
        color = range[data.data.key];
    }


    return color; //range[data.data.key];
} //getColor

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
            const hd = headers[index];
            vals.push(element[hd]);
        }
        console.log(getTaggedImpact(element))
        vals.push(getTaggedImpact(element));
        dt.push(vals)
    });
    return dt;
} //getDataTableData

//v1 return concatenated values of config.Context.Framework.Impact elements
function getTaggedImpact(row) {
    var impactArr = ['Health', 'Interventions', 'Outbreak'];
    var formattedTags = "";
    impactArr.forEach(element => {
        var label = config.Context.Framework[element],
            className = String(row[config.Context.Framework[element]]).toLowerCase();
        formattedTags += '<label class="alert tag-' + className + '">' + label + '</label>';;
    });
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

function generateBehaviorsDataTable() {
    var dtData = getDataTableData();
    console.log(dtData)
    datatableContext = $('#datatableContext').DataTable({
        data: dtData,
        "columns": [
            { "width": "1%" },
            { "width": "25%" },
            { "width": "5%" },
            { "width": "10%" }
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

} //generateBehaviorsDataTable