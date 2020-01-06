/*colour matching*/

var input1 = document.getElementById("col1");
var input2 = document.getElementById("col2");

input1.addEventListener('change', function (evt) {
    moneyColourChange(this.value,input2.value)
    updateInputColour(this);
    backgroundChange();
    updateAxisColour();
    makeItRain();

});
input2.addEventListener('change', function (evt) {
    moneyColourChange(input1.value,this.value)
    updateInputColour(this);
    backgroundChange();
    updateAxisColour();
    makeItRain();

});



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

//hexToHsl function by https://gist.github.com/xenozauros/f6e185c8de2a04cdfecf
function hexToHSL(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        r = parseInt(result[1], 16);
        g = parseInt(result[2], 16);
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

backgroundChange();
function backgroundChange(){
    document.body.style.background = "linear-gradient(0deg, #"+input2.value+" -10%, #"+input1.value+" 15%, #ffffff 50%)";
}

//base sepia HSL colour space
var baseH = 87;
var baseS = 8;
var baseL = 86;

moneyColourChange(col1.value,col2.value);
function moneyColourChange(col1,col2){
    _hsl = hexToHSL(lerpColor("#"+col1,"#"+col2,0.5));
    var newH = _hsl.h - baseH;
    var newS = 100 + (_hsl.l-baseS);
    var newL = 100 + (_hsl.l-baseL)
    var bills = document.getElementsByClassName("billsBillsBills");
    for (var i = 0; i < bills.length; i++) {
        bills[i].style.filter = "brightness(50%) sepia(1) hue-rotate("+ newH +"deg) saturate("+ newS +"%) brightness("+ newL +"%)";
        //Do something
    }
    //document.getElementById('snow-bg').style.filter = "brightness(50%) sepia(1) hue-rotate("+ newH +"deg) saturate("+ newS +"%) brightness("+ newL +"%)";
}

//input field colour matching
updateInputColour(document.getElementById('col1'));
updateInputColour(document.getElementById('col2'));
function updateInputColour(_elem){
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

function updateAxisColour(){
    var newColour = lerpColor(col1.value,col2.value,0.5);
    var lines = document.getElementsByTagName("line");
    for(var i = 0; i < lines.length; i++){
       lines[i].style.stroke = newColour;
    }
    var texts = document.getElementsByTagName("text");
    for(var i = 0; i < texts.length; i++){
        texts[i].style.fill = newColour;
     }
}