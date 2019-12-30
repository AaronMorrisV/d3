/*colour matching*/
    //base sepia HSL colour space
    var baseH = 38;
    var baseS = 21.4;
    var baseL = 54.1;

    var input1 = document.getElementById("col1");
    var input2 = document.getElementById("col2");
    backgroundChange();
    input1.addEventListener('change', function (evt) {
        console.log(input1.value);
        backgroundChange();
        sakuraColourChange(this.value,input2.value)
    });
    input2.addEventListener('change', function (evt) {
        backgroundChange();
        sakuraColourChange(input1.value,this.value)
    });

    function backgroundChange(){
        document.body.style.background = "linear-gradient(0deg, #"+input1.value+" -10%, #"+input2.value+" 15%, #ffffff 50%)";
        console.log(document.body.style.background);
    }
    function sakuraColourChange(col1,col2){
        _hsl = hexToHSL(lerpColor("#"+col1,"#"+col2,0.5));
        var newH = _hsl.h - baseH;
        var newS = 100 + (_hsl.l-baseS);
        var newL = 100 + (_hsl.l-baseL)
        document.getElementById('snow-bg').style.filter = "brightness(50%) sepia(1) hue-rotate("+ newH +"deg) saturate("+ newS +"%) brightness("+ newL +"%)";
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
