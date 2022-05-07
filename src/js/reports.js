/**
 * Reports Page
 */

let reportsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQerZvzh2FT_wxMVxYrKXQpEf_b2-8e5ATvhFHqaSdZE-MYq82EiRXNzzZu5vUKwcipc75aOOejTJ0y/pub?gid=0&single=true&output=csv';
let configFile = 'config/config.json';

let reportsData;
let config;
let datatableRports;
let tagsArr = [];

$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.csv(reportsUrl),
            d3.json(configFile),
        ]).then(function(data) {
            reportsData = data[0];
            config = data[1];

            tagsArr = config.Reports.Tags;

            // reportsData.forEach(element => {
            //     var tags = getTagsAsArray(element['Keywords']);
            //     for (let index = 0; index < tags.length; index++) {
            //         const item = tags[index];
            //         tagsArr.includes(item) ? null : tagsArr.push(item);
            //     }
            // });
            /**
             * functions to show the vis
             */
            generateTags();
            generateReportDataTable();

            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();

});


function generateReportDataTable() {
    var dtData = getDataTableData();
    datatableRports = $('#datatable').DataTable({
        data: dtData,
        "columns": [{
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": '<i class="fa fa-plus-circle"></i>',
                "width": "1%"
            },
            { "width": "5%" },
            { "width": "15%" },
            { "width": "15%" },
            { "width": "45%" },
            { "width": "10%" },
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
        "dom": "Blrtp",
        // "buttons": {
        //     "buttons": [{
        //         extend: 'excelHtml5',
        //         "className": "exportData",
        //         exportOptions: {
        //             page: ':all',
        //             format: {
        //                 header: function(data, columnIdx) {
        //                     var hd = ['Name', 'Scale', '# Feedbacks (last 6 months)', 'Target', 'Details', 'Keyword', 'National Coordination', 'Inter-agency', 'Partners', 'Contact email', 'Status'];
        //                     if (columnIdx >= 8) {
        //                         return hd[columnIdx - 8];
        //                     } else {
        //                         return data;
        //                     }
        //                 }
        //             }
        //         }
        //     }]
        // }


    });

    // $('#datatable tbody').on('click', 'td.details-control', function() {
    //     var tr = $(this).closest('tr');
    //     var row = datatable.row(tr);
    //     if (row.child.isShown()) {
    //         row.child.hide();
    //         tr.removeClass('shown');
    //         tr.css('background-color', '#fff');
    //         tr.find('td.details-control i').removeClass('fa-minus-circle');
    //         tr.find('td.details-control i').addClass('fa-plus-circle');
    //     } else {
    //         row.child(format(row.data())).show();
    //         tr.addClass('shown');
    //         tr.css('background-color', '#f5f5f5');
    //         $('#cfmDetails').parent('td').css('border-top', 0);
    //         $('#cfmDetails').parent('td').css('padding', 0);
    //         $('#cfmDetails').parent('td').css('background-color', '#f5f5f5');
    //         tr.find('td.details-control i').removeClass('fa-plus-circle');
    //         tr.find('td.details-control i').addClass('fa-minus-circle');

    //     }
    // });


} //generateReportDataTable

function updateDataTable(data = reportsData) {
    var dt = getDataTableData(data);
    $('#datatable').dataTable().fnClearTable();
    $('#datatable').dataTable().fnAddData(dt);

} //updateDataTable

function getDataTableData(data = reportsData) {
    var dt = [];
    data.forEach(element => {
        dt.push(
            [
                element['ID'],
                element['Type'],
                element['Authors'],
                element['Title'],
                element['Description'],
                element['Publication date'],
                element['Link'] != '' ? '<a href="' + element['Link'] + '" target="blank"><i class="fa fa-external-link"></i></a>' : null,
                //hidden
                // element['Name'], element['Scale'], element['# Feedbacks (last 6 months)'], element['Target'],
                // element['Details'], element['Keyword'], element['National Coordination'], element['Inter-agency'],
                // element['Partners'], element['Contact email'], element['Status']
            ]);
    });
    return dt;
} //getDataTableData

$('#searchInput').keyup(function() {
    datatableRports.search($('#searchInput').val()).draw();
});


function generateTags() {
    var tagsToDisplay = '<label><strong>Filter table by: </strong></label><label><button type="button" class="btn tagFilter tag-all active" id="all" value="all">All</button></label>';
    for (let index = 0; index < tagsArr.length; index++) {
        const tag = tagsArr[index],
            tagId = String(tagsArr[index]).toLowerCase(),
            classname = 'tag-' + tagId;
        tagsToDisplay += '<label><button type="button" class="btn tagFilter ' + classname + '" id="' + tagId + '" value ="' + tagId + '">' + tag + '</button></label>';

    }
    $('.tagFiltersReport').html('');
    $('.tagFiltersReport').append(tagsToDisplay);

    var tagButtons = document.getElementsByClassName("tagFilter");
    for (var i = 0; i < tagButtons.length; i++) {
        tagButtons[i].addEventListener('click', clickButton);
    }

} //generateTags

function clickButton() {
    $('.btn').removeClass('active');
    var tagSelected = this.value;
    var data = reportsData;

    if (tagSelected == "all") {
        updateDataTable(data);

    } else {
        var filteredData = data.filter(function(d) {
            var tagArr = getTagsAsArray(d[config.Reports.TagColumn]);
            return tagArr.includes(tagSelected) ? d : null;
        });
        updateDataTable(filteredData);
    }

    $(this).toggleClass('active');

} //clickButton

function getTagsAsArray(item) {
    var items = [];
    var arr = item.split(",");
    var trimedArr = arr.map(x => x.trim());
    for (let index = 0; index < trimedArr.length; index++) { //remove empty elements
        if (trimedArr[index]) {
            items.push(trimedArr[index]);
        }
    }
    return items;

} //getTagsAsArray


/**
 * End Reports Page
 */