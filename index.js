// Constantes y funciones de procesamiento de datos

MARGIN_1 = {
    top: 30,
    bottom: 30,
    right: 35,
    left: 35,
}

MARGIN_2 = {
    top: 50,
    bottom: 50,
    right: 50,
    left: 100,
}

const WIDTH_1 = 800;
const HEIGHT_1 = 700;
const WIDTH_2 = 750;
const HEIGHT_2 = 700;

const WIDTH_VIS1 = WIDTH_1 - MARGIN_1.left - MARGIN_1.right;
const HEIGHT_VIS1 = HEIGHT_1 - MARGIN_1.top - MARGIN_1.bottom;

const WIDTH_VIS2 = WIDTH_2 - MARGIN_2.left - MARGIN_2.right;
const HEIGHT_VIS2 = HEIGHT_2 - MARGIN_2.top - MARGIN_2.bottom;

const logoHeight = 110;
const logoWidth = 60;

const DATA = "https://raw.githubusercontent.com/mati-gonz/examen-infovis/main/assets/data/CR7_DATA.csv";
const mesesTemporadaRegular = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const colores = ["green", "red", "blue", "black"]

var parseTime = d3.timeParse("%m/%d/%Y")

var parseData= function(d) {
    return {
        season: d.Season,
        competition: d.Competition,
        date: parseTime(d.Date),
        club: d.Club,
    };
}

// Construccion de las visualizaciones

const svg1 = d3.select("#container-vis-1")
    .append("svg")
    .attr("width", WIDTH_1)
    .attr("height", HEIGHT_1)
    .attr("class", "vis-1");

const svg2 = d3.select("#container-vis-2")
    .append("svg")
    .attr("width", WIDTH_2)
    .attr("height", HEIGHT_2)
    .attr("class", "vis-2")
    .attr("transform", `translate(0, 0)`)
  
const contenedorEjeX2 = svg2
    .append("g")
    .attr("transform", `translate(${MARGIN_2.left}, ${HEIGHT_VIS2})`)


function joinData(data) {
    const grupoSeason = d3.groups(data, d => d.season)
    const grupoEquipo = d3.groups(data, d => d.club)

    // VISUALIZACIÓN 1

    console.log(grupoSeason);

    // const escalaX = d3
    //     .scalePoint()
    //     .domain(d3.range(mesesTemporadaRegular.length))
    //     .range([0, WIDTH_VIS1])
    //     .padding(1);
    
    // const escalaY = d3
    //     .scaleLinear()
    //     .domain([
    //       0,
    //       d3.max(grupoSeason, (serie) => d3.max(serie, (arreglo) => arreglo[1])),
    //     ])
    //     .range([HEIGHT - 10, 10]);

    // VISUALIZACIÓN 2

    const yScale2 = d3
        .scaleBand()
        .domain(grupoEquipo.map(d => d[0]))
        .rangeRound([0, HEIGHT_VIS2])
        .paddingOuter(0.1)
        .paddingInner(0.4)
        .align(0.5)
    
    const xScale2 = d3
        .scaleLinear()
        .domain([0, d3.max(grupoEquipo, d => d[1].length)])
        .range([0, WIDTH_VIS2])
    
    const COLOR = d3.scaleOrdinal(colores).domain(data.map(d => d.club))

    const ejeX2 = d3.axisBottom(xScale2);

    contenedorEjeX2
        .call(ejeX2)
        .selectAll("text")
        .attr("font-size", 25)

    const enterAndUpdate2 = svg2
        .selectAll(".barra-equipo")
        .data(grupoEquipo)
        .join("g")
        .attr("transform", d => `translate(${MARGIN_2.left}, ${yScale2(d[0])})`)
        .attr("class", "barra-equipo")
    
    enterAndUpdate2
        .append("rect")
        .attr("width", d => xScale2(d[1].length))
        .attr("height", yScale2.bandwidth())
        .attr("fill", d => COLOR(d[0]))

    enterAndUpdate2
        .append("svg:image")
        .attr('y', (yScale2.bandwidth()/2) - logoHeight/2)
        .attr('x', -MARGIN_2.left/2 - logoWidth/2)
        .attr('width', logoWidth)
        .attr('height', yScale2.bandwidth())
        .attr("xlink:href", d => `./assets/team_images/${d[0]}.png`)
    
    svg2
        .append("text")
        .attr("class", "titulo-ejeX")
        .text("Cantidad de goles")
        .attr("transform", `translate(${WIDTH_VIS2/2 + MARGIN_2.left}, ${HEIGHT_VIS2 + MARGIN_2.top + 25})`)
        .attr("font-size", 35)
        .style("text-anchor", "middle") 
        .style("font-family", "Bebas Neue, cursive")
    
    enterAndUpdate2.on("mouseover", function(_, datos) {
        enterAndUpdate2.attr('opacity', d => {
            if(d[0] == datos[0]){
                return 1;
            } else {
                return 0.5;
            }
        })

        d3.select("#foto-CR7")
            .attr("src", `./assets/CR7_Images/${datos[0]}-CR7.png`)

    })

}

// Carga de datos

const datos = d3.csv(DATA, parseData)
    .then(data => {
        joinData(data);
    })
    .catch(error => {
        console.log(error);
    });