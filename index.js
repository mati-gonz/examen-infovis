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

// selectorData
let topSelector = "02/03";
let bottomSelector = "03/04";

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

const colores = ["#008863", "#ee2836", "#AC9EEB", "black"];

var parseTime = d3.timeParse("%m/%d/%Y");

var parseData = function (d) {
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


const contendorVis2 = svg2.append("g")

let lastTransformation = d3.zoomIdentity;

svg1
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", WIDTH_VIS1)
    .attr("height", HEIGHT_VIS1);

const contenedorEjeX2 = svg2
    .append("g")
    .attr("transform", `translate(${MARGIN_2.left}, ${HEIGHT_VIS2})`)

const contenedorEjeX = svg1
    .append("g")
    .attr("transform", `translate(${MARGIN_1.left}, ${HEIGHT_VIS1})`)
    .attr("clip-path", "url(#clip)");

const contenedorEjeY = svg1
    .append("g")
    .attr("transform", `translate(${MARGIN_1.left}, 0)`)


function joinData(data) {
    const grupoSeason = d3.groups(data, d => d.season)
    const grupoEquipo = d3.groups(data, d => d.club)

    grupoSeason.map((d) => {
        var nuevo_año = false;
        d[1].map(fecha => {
            if (fecha.date.getMonth() < 7) {
                nuevo_año = true;
            }
            if (nuevo_año) {
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

    const selectorUno = d3.select("#container-selector-1")
        .append("select")
        .attr("id", "selector-1")
        .attr("name", "seleccion-temporada-1")
        .selectAll("#selector-1")
        .data(agruparGolesMes)
        .enter()
        .append("option")
        .attr("id", "option-temporada")
        .text(d => `${d[1][0][0]}, ${d[1][0][1][0].club}`)
        .attr("value", d => d[1][0][0]);

    const selectorDos = d3.select("#container-selector-2")
        .append("select")
        .attr("id", "selector-2")
        .attr("name", "seleccion-temporada-2")
        .selectAll("#selector-2")
        .data(agruparGolesMes)
        .enter()
        .append("option")
        .attr("id", "option-temporada")
        .text(d => `${d[1][0][0]}, ${d[1][0][1][0].club}`)
        .attr("value", d => d[1][0][0])
        .attr("selected", d => d[1][0][0] == "03/04" ? "selected" : null);



    // VISUALIZACIÓN 1

    // EJE X

    const mesMinimo = d3.min(grupoSeason, d => d3.min(d[1], d => d.date))
    const mesMaximo = d3.max(grupoSeason, d => d3.max(d[1], d => d.date))

    const escalaX = d3
        .scaleLinear()
        .domain([mesMinimo, mesMaximo])
        .range([15, WIDTH_VIS1 - 15])

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

    const areaBase = d3
        .area()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return escalaX(d[0])
        })
        .y(HEIGHT_VIS1);


    const area = d3
        .area()
        .curve(d3.curveMonotoneX)
        .x((d) => {
            return escalaX(d[0])
        })
        .y0(HEIGHT_VIS1)
        .y1((d) => {
            return escalaY(d[1].length)
        });

    svg1
        .append("text")
        .attr("class", "titulo-ejeX")
        .text("Meses de la Temporada")
        .attr("transform", `translate(${WIDTH_VIS1 / 2 + MARGIN_1.left}, ${HEIGHT_VIS1 + MARGIN_1.top + 15})`)
        .attr("font-size", 35)
        .style("text-anchor", "middle")
        .style("font-family", "Bebas Neue, cursive")

    svg1
        .append("text")
        .attr("class", "titulo-ejeY")
        .text("Goles por mes")
        .attr("font-size", 35)
        .style("text-anchor", "middle")
        .style("font-family", "Bebas Neue, cursive")
        .attr("transform", `rotate (-90, 270, 220)`)

    let enterAndUpdate = Vis1(topSelector, bottomSelector);

    function Vis1(temporada1, temporada2) {
        const filtered = agruparGolesMes.filter(d => {
            if (d[1][0][0] === temporada1 || d[1][0][0] === temporada2) {
                return true;
            }
            return false
        })
        const enterAndUpdate = svg1
            .selectAll(".goal-area")
            .data(filtered, d => d[1][0][0])
            .join(
                enter => enter.append("path")
                    .attr("class", "goal-area")
                    .attr("d", (d) => {
                        return areaBase(d[0])
                    })
                ,
                update => update,
                exit => exit.transition("bye")
                    .duration(800).attr("d", (d) => { return areaBase(d[0]) }).remove()
            )
            .attr("opacity", 0.4)
            .attr("fill", d => COLOR(d[0][0][1][0].club))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("transform", `translate(${MARGIN_1.left}, 0)`)
            .attr("clip-path", "url(#clip)")
            .attr("class", "goal-area");

        enterAndUpdate
            .transition("actualizar-forma")
            .duration(1000)
            .attr("d", (d) => {
                return area(d[0])
            })

        return enterAndUpdate;
    }

    d3.select("#selector-1").on("change", (event, d) => {
        const value = event.target.value;
        topSelector = value;

        enterAndUpdate = Vis1(topSelector, bottomSelector);
    })

    d3.select("#selector-2").on("change", (event, d) => {
        const value = event.target.value;
        bottomSelector = value;

        enterAndUpdate = Vis1(topSelector, bottomSelector);
    })

    // Contruimos nuestra función manejadora de zoom
    const manejadorZoom = (evento) => {
        const transformacion = evento.transform;
        // Actualizamos el rango de la escala considerando la transformación realizada.
        escalaX.rangeRound([transformacion.applyX(15), transformacion.applyX(WIDTH_VIS1 - 15)])

        // Actualizamos posición en X
        enterAndUpdate
            .attr("x", (d) => escalaX(d[0][1]))
            .attr("d", (d) => area(d[0]))

        // Actualizamos el ejeX
        contenedorEjeX.call(ejeX);
        // Guardamos dicha transformación en nuestra variable global.
        lastTransformation = transformacion;
    };

    const zoom = d3.zoom()
        .extent([[0, 0], [WIDTH_1, HEIGHT_1]])
        .translateExtent([[0, 0], [WIDTH_1, HEIGHT_1]])
        .scaleExtent([1, 4])
        .on("zoom", manejadorZoom);

    svg1.call(zoom);


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

    let enterAndUpdate2 = Vis2("todas");

    function Vis2(competicion) {
        const filtered = grupoEquipo.map((d) => {
            let newFiltered = d[1].filter(e => {
                if (competicion == "todas") {
                    return true;
                } else if (competicion == "liga") {
                    if (e.competition == 'Liga Portugal' || e.competition == 'Premier League' || e.competition == 'Serie A' || e.competition == 'LaLiga') {
                        return true;
                    }
                    return false;
                } else if (competicion == "champions") {
                    if (e.competition == 'UEFA Champions League') {
                        return true;
                    }
                    return false;
                }
            })
            return { name: d[0], goles: newFiltered.length };
        })

        // Solo añade barrras
        const enterAndUpdateVis = contendorVis2
            .selectAll("rect")
            .data(filtered, d => `${d.name}`)
            .join(
                enter => {
                    const barras = enter
                        .append("rect")
                        .attr("class", "barra")
                        .attr("width", 0)
                        .attr("height", yScale2.bandwidth())
                        .attr("fill", d => COLOR(d.name))


                    return barras.attr("transform", d => `translate(${MARGIN_2.left}, ${yScale2(d.name)})`)
                },
                update => update,
                exit => { return exit.remove() })

        contendorVis2
            .selectAll("rect")
            .transition()
            .duration(1000)
            .attr("width", d => xScale2(d.goles))

        contendorVis2
            .selectAll("text")
            .data(filtered, d => `${d.name}`)
            .join("text")
            .attr("class", "texto-barra")
            .attr("x", d => xScale2(d.goles) + 25)
            .attr("y", yScale2.bandwidth() / 2 + 10)
            .attr("font-size", 35)
            .style("text-anchor", "middle")
            .style("font-family", "Bebas Neue, cursive")
            .style("display", "none")
            .attr("transform", d => `translate(${MARGIN_2.left}, ${yScale2(d.name)})`)
            .text(d => d.goles)

        contendorVis2
            .selectAll("rect")
            .transition()
            .duration(1000)
            .attr("width", d => xScale2(d.goles))


        // Solo añade texto

        contendorVis2
            .selectAll("image")
            .data(filtered, d => `${d.name}`)
            .join(
                enter => {
                    const barras = enter
                        .append("svg:image")
                        .attr('y', (yScale2.bandwidth() / 2) - logoHeight / 2)
                        .attr('x', -MARGIN_2.left / 2 - logoWidth / 2)
                        .attr('width', logoWidth)
                        .attr('height', yScale2.bandwidth())
                        .attr("xlink:href", d => `./assets/team_images/${d.name}.png`)


                    return barras.attr("transform", d => `translate(${MARGIN_2.left}, ${yScale2(d.name)})`)
                },
                update => update,
                exit => { return exit.remove() })

        enterAndUpdateVis.on("mouseover", function (_, datos) {
            contendorVis2.selectAll("rect").attr('opacity', d => {
                if (d.name == datos.name) {
                    return 1;
                } else {
                    return 0.5;
                }
            })

            contendorVis2.selectAll(".texto-barra").style('display', d => {
                if (d.name == datos.name) {
                    return "block";
                }
                return "none";
            })

            d3.select("#foto-CR7")
                .attr("src", `./assets/CR7_Images/${datos.name}-CR7.png`)

        })

        enterAndUpdateVis.on("mouseout", function (_, datos) {

            contendorVis2.selectAll("rect").attr('opacity', d => 1)

            contendorVis2.selectAll(".texto-barra").style('display', d => "none")

            d3.select("#foto-CR7")
                .attr("src", `./assets/CR7_Images/${datos.name}-CR7.png`)

        })

        return enterAndUpdateVis;
    }

    svg2
        .append("text")
        .attr("class", "titulo-ejeX")
        .text("Cantidad de goles")
        .attr("transform", `translate(${WIDTH_VIS2 / 2 + MARGIN_2.left}, ${HEIGHT_VIS2 + MARGIN_2.top + 25})`)
        .attr("font-size", 35)
        .style("text-anchor", "middle")
        .style("font-family", "Bebas Neue, cursive")



    d3.select("#filtro-competiciones").on("change", (event) => {
        // Obtengo el valor del selector
        const value = event.target.value;
        enterAndUpdate2 = Vis2(value);
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