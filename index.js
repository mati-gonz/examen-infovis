// Constantes y funciones de procesamiento de datos

MARGIN_1 = {
    top: 50,
    bottom: 30,
    right: 50,
    left: 100,
}

MARGIN_2 = {
    top: 50,
    bottom: 50,
    right: 50,
    left: 100,
}

const WIDTH_1 = 1200;
const HEIGHT_1 = 800;
const WIDTH_2 = 750;
const HEIGHT_2 = 700;

const WIDTH_VIS1 = WIDTH_1 - MARGIN_1.left - MARGIN_1.right;
const HEIGHT_VIS1 = HEIGHT_1 - MARGIN_1.top - MARGIN_1.bottom;

const WIDTH_VIS2 = WIDTH_2 - MARGIN_2.left - MARGIN_2.right;
const HEIGHT_VIS2 = HEIGHT_2 - MARGIN_2.top - MARGIN_2.bottom;

const logoHeight = 110;
const logoWidth = 60;

const DATA = "https://raw.githubusercontent.com/mati-gonz/examen-infovis/main/assets/data/CR7_DATA.csv";

const mesesTemporadaRegular = {
    12: "Ene",
    13: "Feb",
    14: "Mar",
    15: "Abr",
    16: "May",
    17: "Jun",
    18: "Jul",
    19: "Ago",
    7: "Ago",
    8: "Sep",
    9: "Oct",
    10: "Nov",
    11: "Dic"
};

const colores = ["green", "red", "blue", "black"];

var parseTime = d3.timeParse("%m/%d/%Y");

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
    
const contenedorEjeX = svg1
    .append("g")
    .attr("transform", `translate(${MARGIN_1.left}, ${HEIGHT_VIS1})`)

const contenedorEjeY = svg1
    .append("g")
    .attr("transform", `translate(${MARGIN_1.left}, 0)`)


function joinData(data) {
    const grupoSeason = d3.groups(data, d => d.season)
    const grupoEquipo = d3.groups(data, d => d.club)

    grupoSeason.map((d) => {
        var nuevo_año = false;
        d[1].map( fecha => {
            if (fecha.date.getMonth() < 7){
                nuevo_año = true;
            }
            if (nuevo_año){
                fecha.date = fecha.date.getMonth() + 12;
            } else {
                fecha.date = fecha.date.getMonth();
            }
        })
    });

    const agruparGolesMes = d3.groups(grupoSeason, (d) => {
        const grupoFechas = d3.groups(d[1], b => b.date)
        return grupoFechas
    })

    const COLOR = d3.scaleOrdinal(colores).domain(data.map(d => d.club))

    console.log(agruparGolesMes)


    //console.log(grupoSeason)

    // VISUALIZACIÓN 1

    // EJE X

    const mesMinimo = d3.min(grupoSeason, d => d3.min(d[1], d => d.date))
    const mesMaximo = d3.max(grupoSeason, d => d3.max(d[1], d => d.date))

    const escalaX = d3
        .scaleLinear()
        .domain([mesMinimo, mesMaximo])
        .range([0, WIDTH_VIS1])
    
    const ejeX = d3.axisBottom(escalaX);
    ejeX.tickFormat((d) => mesesTemporadaRegular[d]);

    contenedorEjeX
        .call(ejeX)
        .selectAll("text")
        .attr("font-size", 17)
    
    // EJE Y

    const golesMinimoEnUnMes = d3.min(agruparGolesMes, d => d3.min(d[0], b => b[1].length))
    const golesMaximoEnUnMes = d3.max(agruparGolesMes, d => d3.max(d[0], b => b[1].length))

    const escalaY = d3
        .scaleLinear()
        .domain([0, golesMaximoEnUnMes])
        .range([HEIGHT_VIS1, MARGIN_1.top]);

    const ejeY = d3.axisLeft(escalaY);

    contenedorEjeY
        .call(ejeY)
        .selectAll("text")
        .attr("font-size", 17)
    
    const area = d3
        .area()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            console.log("primer log")
            console.log(d)
            console.log(d[0])

            return escalaX(d[0])
        })
        .y0(HEIGHT_VIS1)
        .y1((d) => {
            console.log("segundo log")
            console.log(d)
            console.log(d[1].length)

            return escalaY(d[1].length)});
    
    const menosGoles = [agruparGolesMes[0], agruparGolesMes[1]]

    const enterAndUpdate = svg1
        .selectAll(".goal-area")
        .data(menosGoles)
        .join("path")
        .attr("class", "goal-area")
        .attr("fill", d => COLOR(d[0][0][1][0].club))
        .attr("opacity", 0.5)
        .attr("d", (d) => {
            console.log("area log")
            console.log(d[0])
            return area(d[0])
        })
        .attr("transform", `translate(${MARGIN_1.left}, 0)`)
        .attr("class", "goal-area")


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