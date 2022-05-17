/**
 * Behaviors Page
 */

let socialDataUrl = 'data/Besda_zim.csv';
let configFile = 'config/config.json';

let socialData;
let config;
let datatableBehaviors;

let indicatorsArr = ["All indicators"],
    dimensionsArr = ["All dimensions"];
let dateMin,
    dateMax;

$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.csv(socialDataUrl),
            d3.json(configFile),
        ]).then(function(data) {
            socialData = data[0];
            config = data[1];
            dateMin = d3.min(socialData, function(d) {
                return d[config.Behaviors.Date]
            });
            dateMax = d3.max(socialData, function(d) {
                return d[config.Behaviors.Date]
            });

            socialData.forEach(element => {
                indicatorsArr.includes(element[config.Behaviors.Indicator]) ? null : indicatorsArr.push(element[config.Behaviors.Indicator]);
                dimensionsArr.includes(element[config.Behaviors.Dimension]) ? null : dimensionsArr.push(element[config.Behaviors.Dimension]);
            });
            console.log(socialData);
            generateHtmlTable();
            generateBehaviorsKeyFigures();
            genenrateBehaviorsFilters();
            generateBehaviorsDataTable();
            // generateReportDataTable();

            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();

});

//Click event handler for nav-items
$('.navBehaviors').on('click', function() {
    $('.navBehaviors a').removeClass('active');
    $('.navigation').addClass('hidden');


    //Add active class to the clicked item
    var nav = $('a', this).attr('value');
    console.log("nav to activated: " + nav)
    $('#' + nav).removeClass('hidden');
    $('a', this).addClass('active');
});


function genenrateBehaviorsFilters(data = socialData) {
    var indicatorsOpt = '',
        dimensionOpt = '';
    $('#indicators').html('');
    $('#dimensions').html('');
    for (let index = 0; index < indicatorsArr.length; index++) {
        const element = indicatorsArr[index];
        index == 0 ? indicatorsOpt += '<option value="all" selected>' + element + '</option>' :
            indicatorsOpt += '<option value="' + element + '">' + element + '</option>';

    }
    for (let index = 0; index < dimensionsArr.length; index++) {
        const element = dimensionsArr[index];
        index == 0 ? dimensionOpt += '<option value="all" selected>' + element + '</option>' :
            dimensionOpt += '<option value="' + element + '">' + element + '</option>';

    }
    $('#indicators').append(indicatorsOpt);
    $('#indicators').multipleSelect({ filter: true });

    $('#dimensions').append(dimensionOpt);
    $('#dimensions').multipleSelect({ filter: true });
    //datepicker
    $('#datepicker').datepicker({
        // "format": 'mm-dd-yyyy',
        "endDate": new Date(dateMax),
        "startDate": new Date(dateMin)
    });
    $('#datepicker').datepicker('setDate', new Date(dateMax));
} //genenrateBehaviorsFilters

function generateBehaviorsKeyFigures(data = socialData) {
    var numDataPoints = data.length - 1,
        lastDate = getLastDate(data);
    // data points
    $('.statBehaviors h5').html('');
    $('.statBehaviors h5').html(numDataPoints);
    // date
    $('.statBehaviorsDate #num').html('');
    $('.statBehaviorsDate #num').text(lastDate);

} //generateBehaviorsKeyFigures
function generateHtmlTable() {
    $('#datatableBehaviors').html('');
    var arr = config.Behaviors.TableHeadersCleaned;
    var table = "<thead><tr><th></th>";
    for (let index = 0; index < arr.length; index++) {
        const element = arr[index];
        table += '<th>' + element + '</th>';
    }
    table += '</tr></thead>';
    $('#datatableBehaviors').html(table);

} //generateHtmlTable

function getLastDate(data = socialData) {
    var max = d3.max(data, function(d) { return d[config.Behaviors.Date] });
    return max;
} //getLastDate

function updateDataTable(data = socialData) {
    var dt = getDataTableData(data);
    $('#datatableBehaviors').dataTable().fnClearTable();
    $('#datatableBehaviors').dataTable().fnAddData(dt);

} //updateDataTable

function getDataTableData(data = socialData) {
    var dt = [];
    var headers = config.Behaviors.TableHeaders;
    data.forEach(element => {
        var vals = []; //start with the id
        vals.push(element[""]);
        for (let index = 0; index < headers.length; index++) {
            const hd = headers[index];
            vals.push(element[hd])
        }
        dt.push(vals)
    });
    return dt;
} //getDataTableData

function applyFilters() {
    var data = socialData;
    var indicFilter = $('#indicators').val(),
        dimenseionFilter = $('#dimensions').val();

    if (indicFilter != "all") {
        data = data.filter(function(d) { return d[config.Behaviors.Indicator] == indicFilter; });
    }
    if (dimenseionFilter != "all") {
        data = data.filter(function(d) { return d[config.Behaviors.Dimension] == dimenseionFilter; });
    }
    return data;
} //applyFilters

$('#indicators').on('change', function(d) {
    var filter = applyFilters();
    updateDataTable(filter);
});
$('#dimensions').on('change', function(d) {
    var filter = applyFilters();
    updateDataTable(filter);
});

function generateBehaviorsDataTable() {
    var dtData = getDataTableData();
    datatableBehaviors = $('#datatableBehaviors').DataTable({
        data: dtData,
        "columns": [
            { "width": "1%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "25%" },
            { "width": "5%" },
            { "width": "5%" },
            { "width": "5%" },
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
        "pageLength": 20,
        "bLengthChange": false,
        "pagingType": "simple_numbers",
        "order": [
            [1, 'asc']
        ],
        "dom": "Blrtp"
    });

} //generateBehaviorsDataTable