# Stream Graph Maker

## Quick Start Example

View an example [here](https://aaronmorrisv.github.io/d3).

Add a reference to the following in the head tag of your html file.
>The stylesheet can be found here
```html
<script src = "https://d3js.org/d3.v4.js"></script>
<script src = "myd3.js"></script>
<script src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.js"></script>
<link rel = "stylesheet" href = "style.css">
```

Add the following in your body tag.

```html
<div id = "graphxy" class = "graph"></div>
<h1 id = "title"></h1>
<input id = "col1" class = "colourInput" value="#2448A8" type = "color">
<input id = "col2" class = "colourInput" value="#89E9E4" type = "color">
<input id = "scale" class = "dimension" value = "1" max = "10" step = "0.1" type = "number">
```

Create a graph object supplying a width, height, title and data (default values are assigned to each parameter if none are given).
```javascript
let graph = new Graph(800,600, 'Movie Revenue', 'https://raw.githubusercontent.com/AaronMorrisV/d3/master/movies.csv');
```
Initialise the graph
```javascript
graph.graphInit('#graphxy');
```

And just like that, you have your graph made!

You can then interact with the buttons on screen: Colour1, Colour2, Scale.

## Data
Movie revenue data for example visualisation courtesy of [BoxOfficeMojo.com by IMDbPro - an IMDb company](
https://www.boxofficemojo.com/release/rl3246360065/)
#### License and Site Access
"Subject to your compliance with these Conditions of Use and your payment of any applicable fees, IMDb or its content providers grants you a limited, non-exclusive, non-transferable, non-sublicenseable license to access and make personal and non-commercial use of the IMDb Services including digital content available through the IMDb Services..." - [BoxOfficeMojo.com by IMDbPro - Conditions](https://www.imdb.com/conditions)
## Script Sources
In this visualisation I utilised a number of functions: 

* lerpColor() - [Rosszurowski](https://gist.github.com/rosszurowski/67f04465c424a9bc0dae)
* hexToHSL() - [Xenozauros](https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf)
* makeItRain() - [Sarah Lesh](http://sarahlesh.com/makeItRain/)
   * The following css styles were also made by [Sarah Lesh](http://sarahlesh.com/makeItRain/): @-webkit-keyframes sway, span.billsBillsBills, @-webkit-keyframes drop