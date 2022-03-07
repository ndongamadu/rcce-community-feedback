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