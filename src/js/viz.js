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