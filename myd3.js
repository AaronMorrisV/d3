/*
//I am trying to manipulate my data into the same format as the original csv file that was supplied with this data visualisation.

dictionary = {3.3: [[350,"lol"], [275, "wagwan"]],5.5: [[500, "Aug 3 2017"], [450, "Apr 3 2019"]], 7.5: [[1000, "Aug 7 2019"],[995, "Jan 28 2019"],["987, Mar 14 2018"]]}

//Then to put it in the form: date, size1, size2, size3.... \n

output = "date,";
var leastData = (dictionary[Object.keys(dictionary)[0]]).length; //initialise the least data variable. this is the value of the least data entries.
console.log(leastData + "le");
for (var key in dictionary) {
    // check if the property/key is defined in the object itself, not in parent
    if (dictionary.hasOwnProperty(key)) {           
        console.log(key, dictionary[key], "argh");
        console.log(key, dictionary[key].length);
        output = output.concat(key + ",");
        if(dictionary[key].length < leastData){
            leastData = dictionary[key].length;
        }
    }
}
output = output.slice(0,-1); //remove last comma
output = output.concat("\n");
console.log(output);
var i, j;
console.log(Object.keys(dictionary).length + " legn");
console.log(leastData + "least data");

//for (i = 0; i < leastData; i++) {
//    for(j = 0; j < Object.keys(dictionary).length; j++){
//        output.concat(dictionary[j][i] + ",");
//    }
//    output.concat("\n");
//}


for(var key in dictionary){
    output = output.concat(dictionary[key][0][0] + ",");
}
output.concat("\n");
console.log(output);
*/

/*
//Data parser
class DataEntry{
    constructor(date, size, price){
        this.date = date;
        this.size = size;
        this.price = price;
    }
}

document.getElementById('file').onchange = function(){

    var file = this.files[0];
    var arr = []
    var reader = new FileReader();
    reader.onload = function(progressEvent){
        //Convert text file to array
        arr = this.result.split('\n')
        j=0;
        while(j < arr.length){
            arr[j] = arr[j].split("\t");
            j+=1;
        }
        arr = [].concat.apply([], arr); //Flatten array of arrays
        
        //Convert each row of text file to seperate data entry, extracting only the important information
        var dataEntries = [];
        var parseDate = d3.timeParse("%A, %B %d, %Y");
        //console.log(parseDate("Tuesday, August 6, 2019"));
        i=0;
        while (i < arr.length){
            dataEntry = new DataEntry();
            dataEntry.date = parseDate(arr[i]);
            dataEntry.size = arr[i+2];
            dataEntry.price = arr[i+3].slice(1).replace(",", "");
            dataEntries.push(dataEntry);
            i+=4;
        }
        console.log(dataEntries);
    };
    reader.readAsText(file);
};
*/
/*
class Graph{
    constructor(col1, col2, width, height, data){ //col1 #hex, col2 #hex, width int, height int, data [csv, ..., csv] 
        this.col1 = col1;
        this.col2 = col2;
        this.width = width;
        this.height = height;
    }
}
let MyGraph = new Graph("#ff0000", "#6a0dad", 900, 500, 1);
*/

//let myGraph = new Graph(800,400,"#ff0000","#0000ff", true,"https://raw.githubusercontent.com/AaronMorrisV/d3/master/origData.csv")
//let myGraph = new Graph("https://raw.githubusercontent.com/AaronMorrisV/d3/master/origData.csv");
class Graph{
    /*constructor(data,width,height,col1,col2,interactive,data){
        this.width = width;
        this.height = height;
        this.col1 = col1;
        this.col2 = col2;
        this.interactive = interactive; //this is a boolean.
        this.data = data;

    }*/
    constructor(data){
        this.data = data;
    }

   

    // set the dimensions and margins of the graph
    margin = {top: 20, right: 30, bottom: 0, left: 10},
        width = 860 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // Parse the Data
    //d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered_wide.csv", function(data) {

    d3.csv("https://raw.githubusercontent.com/AaronMorrisV/d3/master/origData.csv", function(data) {
        // List of groups = header of the csv files
        keys = data.columns.slice(1);
        //console.log(keys);

        // Add X axis
        x = d3.scaleLinear()
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
        y = d3.scaleLinear()
            .domain([-100000, 100000])
            .range([ height, 0 ]);

        col1 = "#ff00ff";
        col2 = "#6a0dad";//"#00d4ff";

        //var col1 = "#ffff00";
        //var col2 = "#00ffff";//"#00d4ff";

        function genColorPal(a, b, num){
            i = 0;
            arry = [];
            while(i < num){
                arry.push(lerpColor(a,b,i/(num-1)))
                i+=1;
            }
            return arry;
        }

        //Lerp Color function by Rosszurowski https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
        function lerpColor(a, b, amount) { 
            ah = parseInt(a.replace(/#/g, ''), 16),
                ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
                bh = parseInt(b.replace(/#/g, ''), 16),
                br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
                rr = ar + amount * (br - ar),
                rg = ag + amount * (bg - ag),
                rb = ab + amount * (bb - ab);
            return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
        }

        // color palette
        color = d3.scaleOrdinal()
            .domain(keys)
            .range(genColorPal(col1,col2, keys.length)); //d3.schemeDark2
        
        //stack the data?
        stackedData = d3.stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(keys)
            (data)

        // create a tooltip
        Tooltip = svg
            .append("text")
            .attr("x", 0)
            .attr("y", 0)
            .style("opacity", 0)
            .style("font-size", 17)

        // Three function that change the tooltip when user hover / move / leave a cell
        mouseover = function(d) {
            Tooltip.style("opacity", 1)
            d3.selectAll(".myArea").style("opacity", .2)
            d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
        }
        mousemove = function(d,i) {
            grp = keys[i]
            Tooltip.text(grp)
        }
        mouseleave = function(d) {
            Tooltip.style("opacity", 0)
            d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
        }

        // Area generator
        area = d3.area()
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
            .style("fill", function(d) { return color(d.key); console.log(color(d.key)); })
            .attr("d", area)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    })
}