class Graph{
    constructor(width,height,data){
        this.height = height;
        this.width = width;
        this.data = data;
    }
    
    graphInit(container){
        var margin = {top: 20, right: 30, bottom: 0, left: 10},
            width = this.width - margin.left - margin.right,
            height = this.height - margin.top - margin.bottom;
        d3.select('body').selectAll('.dimension')
                //.attr('class', 'jscolor')
                //.attr('value', "0000ff")
                .on('change',function () {
                    var scale1 = d3.select('#scale1').property('value');
                    var scale2 = d3.select('#scale2').property('value');
                    d3.select("#graph1")
                        .style("transform","scale("+scale1+")")
                        //.attr("style", "transform:scale("+scale+") translate(-50%,-50%); transform-origin: top left; transition:0.3s; position:absolute;top:50%;left:50%;")
                    d3.select("#graph2")
                        .style("transform","scale("+scale2+")")
                        //.attr("style", "transform:scale("+scale+") translate(-50%,-50%); transform-origin: top left; transition:0.3s; position:absolute;top:50%;left:50%;")
                    
                })
        

        var svg = d3.select(container)
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


        const genColorPal = (a, b, num) =>{
            var i = 0;
            var arry = [];
            while(i < num){
                arry.push(lerpColor(a,b,i/(num-1)))
                i+=1;
            }
            return arry;
        }
        
        //Lerp Color function by Rosszurowski https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
        const lerpColor = (a, b, amount) =>{ 
            var ah = parseInt(a.replace(/#/g, ''), 16),
                ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
                bh = parseInt(b.replace(/#/g, ''), 16),
                br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
                rr = ar + amount * (br - ar),
                rg = ag + amount * (bg - ag),
                rb = ab + amount * (bb - ab);
            return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
        }
        
        // Parse the Data
        d3.csv(this.data, function(data) {
            // List of groups = header of the csv files
            var keys = data.columns.slice(1)

            // Add X axis
            var x = d3.scaleLinear()
                .domain(d3.extent(data, function(d) { return d.year; }))
                .range([ 0, width ]);
            svg.append("g")
                .attr("transform", "translate(0," + height*0.8 + ")")
                .call(d3.axisBottom(x).tickSize(-height*.7).tickValues([1900, 1925, 1975, 2000]))
                .select(".domain").remove()
            // Customization
            svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

            // Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height-30 )
                .text("Time (year)");

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([-100000, 100000])
                .range([ height, 0 ]);

            var col1 = d3.select('#col1').property('value');
            var col2 = d3.select('#col2').property('value');

            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(genColorPal(col1,col2, keys.length)); //d3.schemeDark2


            //stack the data?
            var stackedData = d3.stack()
                .offset(d3.stackOffsetSilhouette)
                .keys(keys)
                (data)

            // create a tooltip
            var Tooltip = svg
                .append("text")
                .attr("x", 0)
                .attr("y", 0)
                .style("opacity", 0)
                .style("font-size", 17)

            // Three function that change the tooltip when user hover / move / leave a cell
            var mouseover = function(d) {
                Tooltip.style("opacity", 1)
                d3.selectAll(".myArea")
                .style("opacity", .2)
                
                d3.select(this)
                .style("opacity", 1)
                .style("transform", "scale(1.2)")
            }
            var mousemove = function(d,i) {
                var grp = keys[i]
                Tooltip.text(grp)
            }
            var mouseleave = function(d) {
                Tooltip.style("opacity", 0)
                d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none").style("transform", "scale(1)")
            }

            // Area generator
            var area = d3.area()
                .x(function(d) { return x(d.data.year); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })

            // Show the areas
            svg
                .selectAll("mylayers")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", "myArea")
                .style("transition", "0.5s")
                .style("transform-origin", "center center")
                .style("fill", function(d) { 
                    return color(d.key); 
                })
                .attr("d", area)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            d3.select('body').selectAll('.jscolor')
                //.attr('class', 'jscolor')
                //.attr('value', "0000ff")
                .on('change',function () {
                    var col1 = d3.select('#col1').property('value');
                    var col2 = d3.select('#col2').property('value');
                    var color = d3.scaleOrdinal()
                            .domain(keys)
                            .range(genColorPal(col1,col2, keys.length)); //d3.schemeDark2
                    d3
                        .selectAll("path")
                        .transition()
                        .duration(1000)
                        .style("fill", function(d) { return color(d.key); })
                })
        })
    }
}
