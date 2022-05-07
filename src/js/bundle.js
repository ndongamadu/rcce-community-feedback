let reportsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQerZvzh2FT_wxMVxYrKXQpEf_b2-8e5ATvhFHqaSdZE-MYq82EiRXNzzZu5vUKwcipc75aOOejTJ0y/pub?gid=0&single=true&output=csv';

let reports;
let reportsData;

$(document).ready(function() {
    function getData() {
        Promise.all([
            d3.csv(reportsUrl)
        ]).then(function(data) {
            reportsData = data[0];
            /**
             * functions to show the vis
             */
            //remove loader and show vis
            $('.loader').hide();
            $('#main').css('opacity', 1);
        }); // then
    } // getData

    getData();
});