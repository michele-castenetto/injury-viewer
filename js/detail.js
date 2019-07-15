(function() {
    
    var _this = {};


    var iconMap = {
        "TRAUMA" : "./svg/bruise.svg",
        "FRATTURA" : "./svg/fracture1.svg",
        "OPERAZIONE" : "./svg/operation1.svg",
    };
    var colorMap = {

    };

    var getLevelColor = function(injury_level) {
        if (injury_level <= 1) {
            return {r: 100, g: 200, b: 100};
        } else if(injury_level <= 4) {
            return {r: 200, g: 200, b: 100};
        } else {
            return {r: 200, g: 100, b: 100};
        }
    };


    _this.setData = function(injury, a) {

        document.querySelector(".init_message").style = "display:none";

        document.querySelector(".detail").style = "display:block";

        var titleNode = document.querySelector(".detail .title").innerHTML = injury.label.toUpperCase();


        var date = (injury.dateObj.day  ? injury.dateObj.day + "/" : "") + (injury.dateObj.month ? injury.dateObj.month + "/" : "") + injury.dateObj.year;

        document.querySelector(".detail .date .value").innerHTML = date;

        document.querySelector(".detail .age .value").innerHTML = injury.age;

        document.querySelector(".detail .description .value").innerHTML = injury.description;




        var imgNode = document.createElement("img");
        imgNode.setAttribute("src", iconMap[injury.type]);
        imgNode.setAttribute("class", "icon_svg");
        
        
        var color = getLevelColor(injury.injury_level);
        var borderStyleString = '3px solid rgb(' + color.r + ',' + color.g + ',' + color.b + ')';

        document.querySelector(".detail .box_icon").innerHTML = "";
        document.querySelector(".detail .box_icon").append(imgNode);
        document.querySelector(".detail .box_icon").style.border = borderStyleString;


        var diagnosticNode = document.querySelector(".detail .diagnostic .value"); 
        diagnosticNode.innerHTML = "";

        injury.diagnostic.forEach(function(diagnostic) {

            var node = document.createElement("div");
            node.setAttribute("class", "diagnostic_element");
            node.innerHTML = diagnostic;

            diagnosticNode.append(node);

        });

    };










    window.DETAIL = _this;

})();