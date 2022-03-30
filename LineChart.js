const xSize = 700; const ySize = 350;
const margin = 150;
const xMax = xSize - margin*2;
const yMax = ySize - margin;

const transitionSpeed = 1000;

let xExtent;
let yExtent;

//X Axis
let x = d3.scaleLinear();

//Y Axis
let y = d3.scaleLinear();

let selectedYears = [];

const svg = d3.select("body")
    .append("div")
    .attr("class","chart-container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + xSize + " " + ySize)
    .append("g")
    .attr("transform","translate(" + margin + "," + 75 + ")");


function brush(){
    console.log("Brush")
}
// Setup the axes on initialisation
function setupAxes(data,category){

    /* Get the 'limits' of the data - the full extent (mins and max)
    so the plotted data fits perfectly */

    xExtent = d3.extent( data, d=>{ return d.x } );
    yExtent = d3.extent( data, d=>{ return d.y } );

    //X Axis
    x.domain([ xExtent[0], xExtent[1] ])
        .range([0, xMax]);
     //Y Axis
    y.domain([ 0, 1 ])
        .range([ yMax, 0]);

    //bottom
    svg.append("g")
        .attr("transform", "translate(0," + yMax + ")")
        .attr("class","Xaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))) // https://stackoverflow.com/a/48267979

    svg.append("text")
        .attr("class","axisLabel")
        .attr("opacity",0)
        .attr("x",xMax/2)
        .attr("y",yMax + 50)
        .transition()
        .duration(transitionSpeed)
        .attr("opacity",1.0)
        .attr("fill","#212121")
        .text("Year")
        .attr("text-anchor","middle");

    //left y axis
    svg.append("g")
        .attr("class","Yaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisLeft(y));

    svg.append("text")
        .attr("class","axisLabel")
        .attr("opacity",0)
        .attr("x",-139)
        .attr("y",yMax /2)
        .transition()
        .duration(transitionSpeed)
        .attr("opacity",1.0)
        .attr("fill","#212121")
        .text("Avgerage Score");

    svg.append("text")
        .attr("class","title")
        .text("Average "+category+" Per Year")
        .attr("x",xMax/2)
        .attr("y",-50)
        .attr("fill","#212121")
        .attr("text-anchor","middle");

}

function updateAxes(data, category){

    let tmp = [];

    svg.selectAll(".title")
        .data(tmp)
        .exit()
        .remove()
    
    svg.append("text")
        .attr("class","title")
        .text("Average "+category+" Per Year")
        .attr("x",xMax/2)
        .attr("y",-50)
        .attr("fill","#212121")
        .attr("text-anchor","middle");
    
    // Change the extents so that the axes smoothly transition 
    xExtent = d3.extent( data, d=>{ return d.x } );
    yExtent = d3.extent( data, d=>{ return d.y } );

    //X Axis
    x.domain([ xExtent[0], xExtent[1] ])
        .range([0, xMax]);

    //Y Axis
    y.domain([ 0, 1 ])
        .range([ yMax, 0]);


    // TRANSITION AXES

    svg.selectAll(".Xaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")))

    svg.selectAll(".Yaxis")
        .transition()
        .duration(transitionSpeed)
        .call(d3.axisLeft(y))
}


function addLine(data){

    let tmp = [];
    
    // Remove old artifacts 

    svg.selectAll(".marker")
        .data(tmp)
        .exit()
        .remove()

    var l = svg.selectAll(".line")
        .data([data],d=>d.x)

    l.enter()
        .append("path")
        .attr("class","line")
        .merge(l)
        .transition()
        .duration(transitionSpeed)
        .attr("d", d3.line()
        .x(function(d) { return x(d.x) })
        .y(function(d) { return y(d.y) })
        )
        .attr("stroke", "#1db954")
        .attr("fill", "none")
        .attr("stroke-width", 2.25);


    var div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0)

    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class","marker")
        .attr("cx", function (d) { return x(d.x) } )
        .attr("cy", function (d) { return y(d.y) } )
        .attr("r", 7.5)
        .style("opacity", 0)
        .on("mouseover",function(event,d,i){

            //https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

            div.transition()		
                .duration(200)		
                .style("opacity", 0.7);	
            
            div	.html(d.x.getFullYear() + "<br/>"  + d.y.toFixed(2))	
                .style("left", event.pageX + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout",function(event,d,i){

            div.transition()		
                .duration(500)		
                .style("opacity", 0);
        });

        var brush = svg
            .call(d3.brushX()
            .extent([[0,0],[xMax,yMax]])
            .on("end",function(event){
                extent = event.selection;
                selectedYears = [];
                if(extent != null){
                    svg.selectAll(".marker")
                        .attr("id",function(d){
                            return isBrushed(extent,x(d.x), d.x)
                        })
                        buildData(selectedYears, true);
                    }
                }
            ));

        
}

function isBrushed(brushArea, x, date){
    let x0 = brushArea[0],
        x1 = brushArea[1];

    let id;
    if(x0 <= x && x <= x1){
        id = "selected";
        selectedYears.push(date.getFullYear())
        //console.log(date.getFullYear())
    } else{
        id = "unselected";
    }

    return id;
}