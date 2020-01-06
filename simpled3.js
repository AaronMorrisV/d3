class Graph{
    //Constructor taking the width and height (in pixels) as well as the data from which the graph will be made
    constructor(width,height,data){
        this.height = (typeof height !== 'undefined') ? height : 500;
        this.width = (typeof height !== 'undefined') ? width : 600;
        //this.height = height;
        //this.width = width;
        this.data = (typeof height !== 'undefined') ? data : "https://raw.githubusercontent.com/AaronMorrisV/d3/master/data1.csv";
        //this.data = data;
    }
    
    set graphTitle(_title){
        var title = _title;
        document.getElementById("title").innerHTML = title;
    }

    set colour1(_col){
        var col = this.cleanseInput(_col);
        col1.value = col;
        updateInputColour(col1);
        this.updateGraphColours(col, col2.value);
    }
    get colour1(){
       return col1.value;
    }

    set colour2(_col){
        var col = this.cleanseInput(_col);
        col2.value = _col;
        updateInputColour(col2);
        this.updateGraphColours(col1.value,col);
    }
    get colour2(){
        return col2.value;
    }

    //Ensure that the input is a valid hex colour (6 digits)
    cleanseInput(val){
        while(val.length < 6){
            val += "f";
        }
        if(val.length > 6){
            val = val.slice(0,6);
        }
        return val;
    }

    set scale(_scale){
        d3.select("#graph")
            .style("transform","translate(-50%,-50%) scale("+_scale+")")
        document.getElementById("scale").value = _scale;
    }
    get scale(){
        return document.getElementById("scale").value;
    }

    updateGraphColours(_col1, _col2){
        var _this = this;
        d3.csv(this.data, function(data) {
            var keys = data.columns.slice(1)

            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(_this.genColorPal(_col1,_col2, keys.length));

            d3
                .selectAll("path")
                .transition()
                .duration(1000)
                .style("fill", function(d) { return color(d.key); })
        })
    }

    //Generate a colour palette. I.e. if there are 5 different sections in the graph, linearly interpolate between two colour values a and b in 5 equal intervals
    genColorPal(a,b,num){
        var i = 0;
        var arry = [];
        while(i < num){
            //Lerp Color function by Rosszurowski https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
            //lerpColor() is reference to colourMatching.js script
            arry.push(lerpColor(a,b,i/(num-1)))
            i+=1;
        }
        return arry;
    }

    graphInit(){
        //Apply margins to the graph and adjust the height and width of the graph accordingly
        var margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = this.width - margin.left - margin.right,
            height = this.height - margin.top - margin.bottom;
        
        //append an svg (with appropriate width and height) to the container with a g as child
        var svg = d3.select("#graph")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
        
        var _this = this; //Need to maintain reference to "this" withing d3.csv() function.

        // Parse the Data
        d3.csv(this.data, function(data) {
            //The keys of the data are the first column in the data, so we slice the first column of the data to obtain the keys
            var keys = data.columns.slice(1);
            
            //Add X axis
            /*var x = d3.scaleLinear()
                .domain(d3.extent(data, function(d) { console.log(d.year);return d.year;  }))
                .range([ 0, width ]);
            console.log(d3.extent(data, function(d) { return d.year;  }));*/
            var dates = d3.extent(data, function(d) { return d.year;  });

            var minDate = new Date(dates[0]),
                maxDate = new Date(dates[1]);
            //var x = d3.time.scale().domain([minDate, maxDate]).range([0, w]);
            var x = d3.scaleTime()
                .domain([minDate, maxDate])
                .range([ 0, width ]);

            /*var max = 0;
            var allData;
            console.log(data.columns);
            for (var i = 0; i < keys.length; i++) {
                max = Math.max(max, d3.max(data, function(d) { return d.hey; } ));
                console.log(max);
                //Do something
            }*/
            var x_axis = d3.axisBottom()
                   .scale(x);
                svg.append("g")
                    .attr("class", "xAxis")
                   .call(x_axis);

            //Customization of tick values
            svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

            //Add X axis label:
            svg.append("text")
                .attr("text-anchor", "end")
                //.attr("x", 0)
                .attr("y", -7)
                .text("Time")
                .attr("class", "time");

            //Add Y axis
            var y = d3.scaleLinear()
                .domain([-30000000, 30000000])
                .range([ height, 0 ]);

            //Initialise the graph to use the values of the colour selectors
            var col1 = d3.select('#col1').property('value');
            var col2 = d3.select('#col2').property('value');

            //Create an ordinal scale variable with the domain of the keys and a range equal to the colour palette created by linearly interpolating between the two colours keys.length number of times
            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(_this.genColorPal(col1,col2, keys.length));

            //Stack the data to create streamgraph
            var stackedData = d3.stack()
                .offset(d3.stackOffsetSilhouette)
                .keys(keys)
                (data)

            //Three functions that change the tooltip when user hover / move / leave a cell

            //On mouseover of a graph area....
            var mouseover = function(d) {
                //Fade out all graph areas
                Tooltip.style("opacity", 1)
                d3.selectAll(".myArea")
                .style("opacity", .2)
                
                //Fade in and scale up the graph area which is currently being hovered over
                d3.select(this)
                .style("opacity", 1)
            }
            //On mousemove...
            var mousemove = function(d,i) {
                //Set the text of the tooltip equal to the value of the key which is currently being hovered over
                var grp = keys[i];
                //console.log(grp);
                //Tooltip.text(grp)
                document.getElementById('title').innerHTML = grp;
            }
            //On mouse leave...
            var mouseleave = function(d) {
                //Fade out tooltip
                Tooltip.style("opacity", 0)
                //Fade in all graph areas
                d3.selectAll(".myArea").style("opacity", 1).style("transform", "scale(1)")
                //document.getElementById('fuji').innerHTML = 
            }

            //Area generator
            var area = d3.area()
                .x(function(d) { return x(new Date(d.data.year)); })
                .y0(function(d) {  return y(d[0]); })
                .y1(function(d) {  return y(d[1]); })


            //Show the areas
            svg
                .selectAll("mylayers")
                .data(stackedData)
                .enter()
                .append("path")
                .attr("class", "myArea")
                //Style the areas
                .style("transition", "0.5s")
                .style("transform-origin", "center center")
                .style("fill", function(d) { return color(d.key); })
                //Events
                .attr("d", area)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)


            //Handle the interactive colour selection
            d3.select('body').selectAll('.colourInput')
                //When either color selector changes...
                .on('change',function () {
                    var col1 = d3.select('#col1').property('value');
                    var col2 = d3.select('#col2').property('value');
                    //Create an ordinal scale variable with the domain of the keys and a range equal to the colour palette created by linearly interpolating between the two colours keys.length number of times
                    var color = d3.scaleOrdinal()
                            .domain(keys)
                            .range(_this.genColorPal(col1,col2, keys.length));
                    //Update colours of the areas
                    d3
                        .selectAll(".myArea")
                        .transition()
                        .duration(1000)
                        .style("fill", function(d) { return color(d.key); })
                        
                })
            
            //Handle the interactive scaling selection
            d3.select('body').selectAll('.dimension')
                .on('change',function () {
                    var scale = d3.select('#scale').property('value');
                    //Set the transform:scale() styling property of the graph equal to the value of the scale input
                    d3.select("#graph")
                        .style("transform","translate(-50%,-50%) scale("+scale+")")
                })
            
        })
    }
}
