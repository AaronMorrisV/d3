// https://www.boxofficemojo.com/release/rl3246360065/

class Graph {
// CONSTRUCTOR - START//
/**
     * Takes in 4 parameters from which the graph will be made upon initialisation. Default values are assigned to each parameter if none are given.
     * @class
     * @classdesc Graph object which facilitates the creation of a streamgraph.
     * @param {int} [width=600] width - Graph width in pixels
     * @param {int} [height=500] height - Graph height in pixels
     * @param {string} [title='Title'] title - Graph title
     * @param {string} [data='https://raw.githubusercontent.com/AaronMorrisV/d3/master/movies.csv'] data - URL of the data to be used
     * @example
     * let graph = new Graph(800,600, 'Movie Revenue');
     * // creates a graph object named 'graph' with the parameters;
     * // width:800, height: 600, title: 'Movie Revenue', data: 'https://raw.githubusercontent.com/AaronMorrisV/d3/master/movies.csv'.
     */
    constructor (width, height, title, data) {
        this.height = (typeof height !== 'undefined') ? height : 500;
        this.width = (typeof width !== 'undefined') ? width : 600;
        this.title = (typeof title !== 'undefined') ? title : 'Title';
        document.getElementById('title').innerHTML = this.title;
        this.data = (typeof data !== 'undefined') ? data : 'https://raw.githubusercontent.com/AaronMorrisV/d3/master/movies.csv';
    }
// CONSTRUCTOR - END//

// GETTERS AND SETTERS - START//
    /**
    * @property {string} graphTitle - e.g. 'title'
    * @property {string} colour1 - Must be of form #rrggbb
    * @property {string} colour2 - Must be of form #rrggbb
    * @property {int} scale - e.g. '2'
    */
    set graphTitle (_title) { this.title = _title; document.getElementById('title').innerHTML = this.title; }
    get graphTitle () { return this.title; }
    set colour1 (_col) {
        if (this.checkInput(_col)) {
            document.getElementById('col1').value = _col;
            this.updateAllColours();
        }
    }

    get colour1 () { return document.getElementById('col1').value; }
    set colour2 (_col) {
        if (this.checkInput(_col)) {
            document.getElementById('col2').value = _col;
            this.updateAllColours();
        }
    }

    get colour2 () { return document.getElementById('col2').value; }
    set scale (_scale) { this.updateGraphScale(_scale); }
    get scale () { return document.getElementById('scale').value; }
// GETTERS AND SETTERS - END//

// GRAPH INITALISATION - START//
    /**
    * Initialises the graph within the div of id "#graph" using the values supplied in the constructor <br>
    * @function graphInit
    * @param {string} _divId - The id of the div where the graph will be initialised.
    * @example
    * graph.graphInit("#graph");
    */
    graphInit (_divId) {
    // INPUT HANDLER INITIALISATION - START//
        var input1 = document.getElementById('col1');
        var input2 = document.getElementById('col2');
        var scaleInput = document.getElementById('scale');

        input1.addEventListener('change', function (evt) {
            _this.makeItRain();
            _this.updateAllColours();
        });
        input2.addEventListener('change', function (evt) {
            _this.makeItRain();
            _this.updateAllColours();
        });
        scaleInput.addEventListener('change', function (evt) {
            _this.updateGraphScale(scaleInput.value, _divId);
        });
        this.updateAllColours();
    // INPUT HANDLER INITIALISATION - END//

    // GRAPH CREATION - START//
        // Need to maintain reference to "this" withing d3.csv() function.
        var _this = this;
        // Apply margins to the graph and adjust the height and width of the graph accordingly
        var margin = 50;
        var width = this.width - 2 * margin;
        var height = this.height - 2 * margin;
        // Append an svg (with appropriate width and height) to the container with a g as child
        var svg = d3.select(_divId)
            .append('svg')
                .attr('width', width + 2 * margin)
                .attr('height', height + 2 * margin)
            .append('g')
                .attr('transform',
                    'translate(' + margin + ',' + margin + ')');

        // Parse the Data
        d3.csv(this.data, function (data) {
            // The keys of the data are the first column in the data, so we slice the first column of the data to obtain the keys
            var keys = data.columns.slice(1);
                var dates = d3.extent(data, function (d) { return d.year; });
                var minDate = new Date(dates[0]);
                var maxDate = new Date(dates[1]);
                var x = d3.scaleTime()
                .domain([minDate, maxDate])
                .range([0, width]);
                var xAxis = d3.axisBottom().scale(x);

            // Add X axis to the graph
            svg.append('g').attr('class', 'xAxis').call(xAxis);

            // Add X axis label:
            svg.append('text')
                .attr('text-anchor', 'end')
                // .attr("x", 0)
                .attr('y', -7)
                .text('Time')
                .attr('class', 'time');

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([-30000000, 30000000])
                .range([height, 0]);

            // Create an ordinal scale variable with the domain of the keys and a range equal to the colour palette created by linearly interpolating between the two colours keys.length number of times
            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(_this.genColorPal(input1.value, input2.value, keys.length));

            // Stack the data to create streamgraph
            var stackedData = d3.stack()
                .offset(d3.stackOffsetSilhouette)
                .keys(keys)(data);

            // Three functions that change the tooltip when user hover / move / leave a cell
            // On mouseover of a graph area....
            var mouseover = function (d) {
                // Fade out all graph areas
                d3.selectAll('.myArea')
                .style('opacity', 0.2);
                // Fade in the graph area which is currently being hovered over
                d3.select(this)
                .style('opacity', 1);
            };
            // On mousemove...
            var mousemove = function (d, i) {
                // Change title text to the title of the data section which is currently being hovered over
                document.getElementById('title').innerHTML = keys[i];
            };
            // On mouse leave...
            var mouseleave = function (d) {
                // Fade in all graph areas
                d3.selectAll('.myArea').style('opacity', 1).style('transform', 'scale(1)');
                document.getElementById('title').innerHTML = _this.title;
            };

            // Area generator
            var area = d3.area()
                .x(function (d) { return x(new Date(d.data.year)); })
                .y0(function (d) { return y(d[0]); })
                .y1(function (d) { return y(d[1]); });

            // Show the areas
            svg
                .selectAll('mylayers')
                .data(stackedData)
                .enter()
                .append('path')
                .attr('class', 'myArea')
                // Style the areas
                .style('transition', '0.5s')
                .style('transform-origin', 'center center')
                .style('fill', function (d) { return color(d.key); })
                // Events
                .attr('d', area)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseleave', mouseleave);
        });
    // GRAPH CREATION - END//
    }
// GRAPH INITIALISATION - END//

// COLOUR HANDLER - START//
    /**
    * Uses the values of the colour pickers to update all other elements which utilise colour: graph, background, axis and money. <br>
    * Does so by calling updateGraphColours, updateBackgroundColour, updateAxisColour, updateMoneyColour.
    * @function updateAllColours
    * @example
    * graph.updateAllColours();
    */
    updateAllColours () {
        var input1 = document.getElementById('col1');
        var input2 = document.getElementById('col2');
        this.updateGraphColours(input1.value, input2.value);
        this.updateBackgroundColour(input1.value, input2.value);
        this.updateAxisColour(input1.value, input2.value);
        this.updateMoneyColour(input1.value, input2.value);
    }

    /**
    * Update the data graph only with the two colours specified.
    * @function updateGraphColours
    * @param {string} _col1 - The 1st (i.e. left-most) colour of the graph.
    * @param {string} _col2 - The 2nd (i.e. right-most) colour of the graph.
    * @example
    * graph.updateGraphColours("#ff0000", "#0000ff");
    */
    updateGraphColours (_col1, _col2) {
        var _this = this;
        d3.csv(_this.data, function (data) {
            var keys = data.columns.slice(1);
            var color = d3.scaleOrdinal()
                .domain(keys)
                .range(_this.genColorPal(_col1, _col2, keys.length));

            d3
                .selectAll('.myArea')
                .transition()
                .duration(1000)
                .style('fill', function (d) { return color(d.key); });
        });
    }

    /**
    * Update the background colour with the two colours specified.
    * @function updateBackgroundColour
    * @param {string} _col1 - The 1st (i.e. lower) colour of the background gradient.
    * @param {string} _col2 - The 2nd (i.e. upper) colour of the background gradient.
    * @example
    * graph.updateBackgroundColour("#ff0000", "#0000ff");
    */
    updateBackgroundColour (_col1, _col2) {
        document.body.style.transition = '3s';
        document.body.style.background = 'linear-gradient(0deg, ' + _col1 + ' -10%,' + _col2 + ' 15%, #ffffff 50%)';
    }

    /**
    * Update the colour of the x axis ticks and the x axis text with the middle value of the linear interpolation of the two colours specified.
    * @function updateAxisColour
    * @param {string} _col1 - The starting value of the linear interpolation.
    * @param {string} _col2 - The ending value of the linear interpolation.
    * @example
    * graph.updateAxisColour("#ff0000", "#0000ff");
    */
    updateAxisColour (_col1, _col2) {
        var newColour = this.lerpColor(_col1, _col2, 0.5);
        var lines = document.getElementsByTagName('line');
        for (var i = 0; i < lines.length; i++) {
            lines[i].style.stroke = newColour;
        }
        var texts = document.getElementsByTagName('text');
        for (i = 0; i < texts.length; i++) {
            texts[i].style.fill = newColour;
        }
    }

    /**
    * Update the colour of the falling money to be the middle value of the linear interpolation of the two colours specified.
    * @function updateMoneyColour
    * @param {string} _col1 - The starting value of the linear interpolation.
    * @param {string} _col2 - The ending value of the linear interpolation.
    * @example
    * graph.updateMoneyColour("#ff0000", "#0000ff");
    */
    updateMoneyColour (_col1, _col2) {
        // base sepia HSL colour space
        var baseH = 87;
        var baseS = 8;
        var baseL = 86;

        var _hsl = this.hexToHSL(this.lerpColor('#' + _col1, '#' + _col2, 0.5));

        var newH = _hsl.h - baseH;
        var newS = 100 + (_hsl.l - baseS);
        var newL = 100 + (_hsl.l - baseL);
        var bills = document.getElementsByClassName('billsBillsBills');
        for (var i = 0; i < bills.length; i++) {
            bills[i].style.filter = 'brightness(50%) sepia(1) hue-rotate(' + newH + 'deg) saturate(' + newS + '%) brightness(' + newL + '%)';
        }
    }

    /**
    * Create an array of hex values (colour palette) equally spaced between the two hex values provided in order to create a banded gradient of colours when viewed sequentially.
    * @function genColorPal
    * @param {string} _col1 - The starting value of the linear interpolation.
    * @param {string} _col2 - The ending value of the linear interpolation.
    * @param {int} _num - The number of hex values to be
    * @example
    * graph.genColorPal("#ff0000", "#0000ff", 5);
    * // returns ["#ff0000", "#bf003f", "#7f007f", "#3f00bf", "#0000ff"]
    */
    genColorPal (_col1, _col2, _num) {
        var i = 0;
        var arry = [];
        while (i < _num) {
            arry.push(this.lerpColor(_col1, _col2, i / (_num - 1)));
            i += 1;
        }
        return arry;
    }

    /**
    * Find the colour corresponding to the decimal value supplied along the linear interpolation of the two colours supplied. <br>
    * <b>This function was made by rosszurowski - https://gist.github.com/rosszurowski/67f04465c424a9bc0dae </b>
    * @function lerpColor
    * @param {string} a - The starting value of the linear interpolation.
    * @param {string} b - The ending value of the linear interpolation.
    * @param {float} amount - The decimal value along the linear interpolation for which the hex value will be returned.
    * @example
    * graph.lerpColor("#ff0000", "#0000ff", 0.5);
    * // returns "#7f007f" i.e. purple - the middle colour between red and blue
    */
    lerpColor (a, b, amount) {
        var ah = parseInt(a.replace(/#/g, ''), 16);
            var ar = ah >> 16; var ag = ah >> 8 & 0xff; var ab = ah & 0xff;
            var bh = parseInt(b.replace(/#/g, ''), 16);
            var br = bh >> 16; var bg = bh >> 8 & 0xff; var bb = bh & 0xff;
            var rr = ar + amount * (br - ar);
            var rg = ag + amount * (bg - ag);
            var rb = ab + amount * (bb - ab);
        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }

    /**
    * Takes a hex value as a parameter and returns the corresponding HSL values.
    * <b>This function was made by xenozauros - https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf </b> <br>
    * @function hexToHSL
    * @param {string} hex - The hex value for which the HSL values are to be returned.
    * @example
    * graph.hexToHSL("#ff0000");
    * // returns {h: 0, s: 360, l: 180}"
    */
    hexToHSL (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        var r = parseInt(result[1], 16) / 255;
        var g = parseInt(result[2], 16) / 255;
        var b = parseInt(result[3], 16) / 255;
        var max = Math.max(r, g, b); var min = Math.min(r, g, b);
        var h; var s; var l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
            h /= 6;
        }
        var HSL = {
            h: h * 360,
            s: s * 360,
            l: l * 360
        };
        return HSL;
    }
// COLOUR HANDLER - END//

// MISCELLANEOUS FUNCTIONS - START//
    /**
    * Updates the scale of the graph.
    * @function updateGraphScale
    * @param {float} _scale - The scale that the graph will be made.
    * @param {string} _divId - The id of the div where the graph will be initialised.
    * @example
    * graph.updateGraphScale(2, '#graph');
    */
    updateGraphScale (_scale, _divId) {
        d3.select(_divId)
            .style('transform', 'translate(-50%,-50%) scale(' + _scale + ')');
        document.getElementById('scale').value = _scale;
    }

    /**
    * Checks whether the supplied parameter is a 6 digit hex value of the form #rrggbb
    * @function checkInput
    * @param {string} _val - The hex value that will be checked.
    * @example
    * graph.checkInput("#a0c6b5");
    * // returns true
    * graph.checkInput("a0c6b5");
    * // returns false
    * graph.checkInput("#a0c6b55");
    * // returns false
    */
    checkInput (_val) {
        var validChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
        var strVal = _val.toString().toLowerCase();
        if (strVal[0] === '#' && strVal.length === 7) {
            for (var i = 1; i < strVal.length; i++) {
                if (validChars.includes(strVal[i]) && i === 6) {
                    return true;
                } else if (i === 6) {
                    console.log(strVal[i], i);
                    console.warn('The specified value "' + _val + '" does not conform to the required format.  The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.');
                    return false;
                }
            }
        } else {
            console.warn('The specified value "' + _val + '" does not conform to the required format.  The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.');
            return false;
        }
    }

    /**
    * Make money fall from the sky! <br>
    * <b>This function was made by sarahlesh, as were the css styles "@-webkit-keyframes sway, span.billsBillsBills, @-webkit-keyframes drop" - http://sarahlesh.com/makeItRain/ </b>
    * @function makeItRain
    */
    makeItRain () {
        var maxBills = 20;
        var bills = document.getElementsByClassName('billsBillsBills');
        for (var i = 0; i < bills.length; i++) {
            bills[i].style.opacity = '0';
        }

        for (i = 0; i < maxBills; i++) {
            var random = $(window).width();
            var randomPosition = Math.floor(random * Math.random());
            var randomTime = Math.random() * 7;
            var randomSpeed = (Math.random() * 20) + 10;

            bills = $("<span class='billsBillsBills'>")
                .css({
                    left: randomPosition,
                    top: '-150px',
                    '-webkit-animation-delay': randomTime + 's',
                    '-webkit-animation-duration': randomSpeed + 's'
                });
                $(bills).prepend('<img src="bill.svg" alt="a dollar bill">');
                $('body').append(bills);
        };
    }
// MISCELLANEOUS FUNCTIONS - END//
}
