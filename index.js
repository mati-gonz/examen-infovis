const WIDTH_VIS1 = 800;
const HEIGHT_VIS1 = 600;
const WIDTH_VIS2 = 1000;
const HEIGHT_VIS2 = 1000;
const DATA = "data/CR7_DATA.csv";

var parseTime = d3.timeParse("%m/%d/%Y")

var parseData= function(d) {
    return {
        season: d.season,
        competition: d.competition,
        date: parseTime(d.date),
        club: d.club,
    };
}

const svg1 = d3.select("#container-vis-1")
    .append("svg")
    .attr("width", WIDTH_VIS1)
    .attr("height", HEIGHT_VIS1)
    .attr("class", "vis-1");

const svg2 = d3.select("#container-vis-2")
    .append("svg")
    .attr("width", WIDTH_VIS2)
    .attr("height", HEIGHT_VIS2)
    .attr("class", "vis-2");

const datos = d3.csv(DATA, parseData)
    .then(data => {
        console.log(data);
    });