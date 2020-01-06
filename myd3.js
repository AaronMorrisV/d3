//https://www.boxofficemojo.com/release/rl3246360065/
class Graph{
//CONSTRUCTOR - START//
    constructor(width,height,title,data){
        this.height = (typeof height !== 'undefined') ? height : 500;
        this.width = (typeof width !== 'undefined') ? width : 600;
        this.title = (typeof title !== 'undefined') ? title : "Title";
        document.getElementById("title").innerHTML = this.title;
        this.data = (typeof data !== 'undefined') ? data : "https://raw.githubusercontent.com/AaronMorrisV/d3/master/movies.csv";
    }
//CONSTRUCTOR - END//

//GETTERS AND SETTERS - START//
    set graphTitle(_title){ this.title = _title; document.getElementById('title').innerHTML = this.title; }
    get graphTitle(){ return this.title; }
    set colour1(_col){ document.getElementById("col1").value = this.cleanseInput(_col); this.updateAllColours(); }
    get colour1(){ return document.getElementById("col1").value; }
    set colour2(_col){ document.getElementById("col2").value = this.cleanseInput(_col); this.updateAllColours(); }
    get colour2(){ return document.getElementById("col2").value; }
    set scale(_scale){ this.updateGraphScale(_scale); }
    get scale(){ return document.getElementById("scale").value; }
//GETTERS AND SETTERS - END//

//GRAPH INITALISATION - START//
    graphInit(){
    //INPUT HANDLER INITIALISATION - START//
        var input1 = document.getElementById("col1"),
            input2 = document.getElementById("col2"),
            scaleInput = document.getElementById("scale");

        input1.addEventListener('change', function (evt) {
            _this.makeItRain();
            _this.updateAllColours();
        });
        input2.addEventListener('change', function (evt) {
            _this.makeItRain();
            _this.updateAllColours();
        });
        scaleInput.addEventListener('change', function(evt){
            _this.updateGraphScale(scaleInput.value);
        });
        this.updateAllColours();
    //INPUT HANDLER INITIALISATION - END//

    //GRAPH CREATION - START//
        var _this = this, //Need to maintain reference to "this" withing d3.csv() function.
            //Apply margins to the graph and adjust the height and width of the graph accordingly
            margin = 50,
            width = this.width - 2*margin,
            height = this.height - 2*margin;
        //append an svg (with appropriate width and height) to the container with a g as child
        var svg = d3.select("#graph")
            .append("svg")
                .attr("width", width + 2*margin)
                .attr("height", height + 2*margin)
            .append("g")
                .attr("transform",
                    "translate(" + margin + "," + margin + ")");
        
        // Parse the Data
        d3.csv(this.data, function(data) {
            //The keys of the data are the first column in the data, so we slice the first column of the data to obtain the keys
            var keys = data.columns.slice(1),
                dates = d3.extent(data, function(d) { return d.year;  }),
                minDate = new Date(dates[0]),
                maxDate = new Date(dates[1]),
                x = d3.scaleTime()
                .domain([minDate, maxDate])
                .range([ 0, width ]),
                xAxis = d3.axisBottom().scale(x);
            /*var max = 0;
            var allData;
            console.log(data.columns);
            for (var i = 0; i < keys.length; i++) {
                max = Math.max(max, d3.max(data, function(d) { return d.hey; } ));
                console.log(max);
                //Do something
            }*/
             
            //Add X axis to the graph
            svg.append("g").attr("class", "xAxis").call(xAxis);

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

            //Create an ordinal scale variable with the domain of the keys and a range equal to the colour palette created by linearly interpolating between the two colours keys.length number of times
            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(_this.genColorPal(input1.value,input2.value, keys.length));

            //Stack the data to create streamgraph
            var stackedData = d3.stack()
                .offset(d3.stackOffsetSilhouette)
                .keys(keys)
                (data)

            //Three functions that change the tooltip when user hover / move / leave a cell
            //On mouseover of a graph area....
            var mouseover = function(d) {
                //Fade out all graph areas
                d3.selectAll(".myArea")
                .style("opacity", .2)
                
                //Fade in and scale up the graph area which is currently being hovered over
                d3.select(this)
                .style("opacity", 1)
            }
            //On mousemove...
            var mousemove = function(d,i) {
                document.getElementById('title').innerHTML = keys[i];
            }
            //On mouse leave...
            var mouseleave = function(d) {
                //Fade in all graph areas
                d3.selectAll(".myArea").style("opacity", 1).style("transform", "scale(1)");
                document.getElementById('title').innerHTML = _this.title;
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
        })
    //GRAPH CREATION - END//
    }
//GRAPH INITIALISATION - END//

//COLOUR HANDLER - START//
    //Master function
    updateAllColours(){
        var input1 = document.getElementById("col1"),
            input2 = document.getElementById("col2");

        this.updateInputColour(input1);
        this.updateInputColour(input2)
        this.updateGraphColours(input1.value, input2.value);
        this.updateBackgroundColour(input1.value,input2.value);
        this.updateAxisColour(input1.value,input2.value);
        this.updateMoneyColour(input1.value,input2.value)
    }
    //Helper functions
    updateInputColour(_elem){
        //Ensure correct length of hex code (6 digits)
        while(_elem.value.length < 6){
            _elem.value += "f";
        }
        if(_elem.value.length > 6){
            _elem.value = _elem.value.slice(0,6);
        }
        //Change background colour of input field
        _elem.style.backgroundColor = "#"+_elem.value;

        //Change colour of text (black text on light backgrounds, white text on dark backgrounds)
        if (parseInt(_elem.value.slice(0,2),16)*0.299 + parseInt(_elem.value.slice(2,4),16)*0.587 + parseInt(_elem.value.slice(4,6),16)*0.114 > 186){
            _elem.style.color = "#000000";
        } 
        else{
            _elem.style.color = "#ffffff";
        }
    }
    updateGraphColours(_col1, _col2){
        var _this = this;

        d3.csv(_this.data, function(data) {
            var keys = data.columns.slice(1)

            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(_this.genColorPal(_col1,_col2, keys.length));

            d3
                .selectAll(".myArea")
                .transition()
                .duration(1000)
                .style("fill", function(d) { return color(d.key); })
        })
    }
    updateBackgroundColour(_col1,_col2){
        document.body.style.transition = "3s";
        document.body.style.background = "linear-gradient(0deg, #"+_col1+" -10%, #"+_col2+" 15%, #ffffff 50%)";
    }
    updateAxisColour(_col1,_col2){
        var newColour = this.lerpColor(_col1,_col2,0.5);
        var lines = document.getElementsByTagName("line");
        for(var i = 0; i < lines.length; i++){
        lines[i].style.stroke = newColour;
        }
        var texts = document.getElementsByTagName("text");
        for(var i = 0; i < texts.length; i++){
            texts[i].style.fill = newColour;
        }
    }
    updateMoneyColour(_col1,_col2){
        //base sepia HSL colour space
        var baseH = 87;
        var baseS = 8;
        var baseL = 86;
    
        var _hsl = this.hexToHSL(this.lerpColor("#"+_col1,"#"+_col2,0.5));
    
        var newH = _hsl.h - baseH;
        var newS = 100 + (_hsl.l-baseS);
        var newL = 100 + (_hsl.l-baseL)
        var bills = document.getElementsByClassName("billsBillsBills");
        for (var i = 0; i < bills.length; i++) {
            bills[i].style.filter = "brightness(50%) sepia(1) hue-rotate("+ newH +"deg) saturate("+ newS +"%) brightness("+ newL +"%)";
        }
    }
    //Generate a colour palette. I.e. if there are 5 different sections in the graph, linearly interpolate between two colour values a and b in 5 equal intervals
    genColorPal(a,b,num){
        var i = 0;
        var arry = [];
        while(i < num){
            //Lerp Color function by Rosszurowski https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
            arry.push(this.lerpColor(a,b,i/(num-1)))
            i+=1;
        }
        return arry;
    }
    //Function immediately below is by https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
    lerpColor(a, b, amount){ 
        var ah = parseInt(a.replace(/#/g, ''), 16),
            ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
            bh = parseInt(b.replace(/#/g, ''), 16),
            br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
            rr = ar + amount * (br - ar),
            rg = ag + amount * (bg - ag),
            rb = ab + amount * (bb - ab);
        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }
    //Function immediately below is by https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf
    hexToHSL(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var r = parseInt(result[1], 16),
            g = parseInt(result[2], 16),
            b = parseInt(result[3], 16);
            r /= 255, g /= 255, b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if(max == min){
            h = s = 0; // achromatic
            }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
            }
        var HSL = new Object();
        HSL['h']=h*360;
        HSL['s']=s*100;
        HSL['l']=l*100;
        return HSL;
    }
//COLOUR HANDLER - END//

//MISCELLANEOUS FUNCTIONS - START//
    //Graph scale update function
    updateGraphScale(_scale){
        d3.select("#graph")
            .style("transform","translate(-50%,-50%) scale("+_scale+")")
        document.getElementById("scale").value = _scale;
    }

    //Hex input cleansing function
    cleanseInput(val){//Ensure that the input is a valid hex colour (6 digits)
        while(val.length < 6){
            val += "f";
        }
        if(val.length > 6){
            val = val.slice(0,6);
        }
        return val;
    }

    //Falling money function
    //Function immediately below is by http://sarahlesh.com/makeItRain/
    makeItRain(){
        var bills = document.getElementsByClassName("billsBillsBills");
        for (var i = 0; i < bills.length; i++) {
            bills[i].style.opacity = "0";
        }
    
        var maxBills = 20;
    
        for (var i = 0; i < maxBills; i++){
    
            var random = $(window).width();
    
            var randomPosition = Math.floor(random*Math.random());
    
            var randomTime = Math.random() * 7;
            var randomSpeed = (Math.random()*20)+10;
    
            var bills = $("<span class='billsBillsBills'>")
                .css({
                    left : randomPosition,
                    top: '-150px',
                    "-webkit-animation-delay" : randomTime + "s",
                    "-webkit-animation-duration" : randomSpeed + "s"
                });
    
                $(bills).prepend('<img src="bill.svg" alt="a dollar bill">');

                $('body').append(bills);
    
        }; // end click function
    }
//MISCELLANEOUS FUNCTIONS - END//

}
