(function() {
    
    var _this = {};


    _this.setData = function(injury, a) {

        document.querySelector(".init_message").style = "display:none";

        document.querySelector(".detail").style = "display:block";

        // image
        var imgNode = document.createElement("img");
        imgNode.setAttribute("src", _this.iconPathMap[injury.type]);
        imgNode.setAttribute("class", "icon_svg");
        var color = _this.getLevelColor(injury.injury_level).color;
        var borderStyleString = '2px solid rgba(' + color.r + ',' + color.g + ',' + color.b + ', 0.5)';
        document.querySelector(".detail .box_icon").innerHTML = "";
        document.querySelector(".detail .box_icon").append(imgNode);
        document.querySelector(".detail .box_icon").style.border = borderStyleString;

        // titolo
        document.querySelector(".detail .title").innerHTML = injury.label.toUpperCase();

        // data
        var date = (injury.dateObj.day  ? injury.dateObj.day + "/" : "") + (injury.dateObj.month ? injury.dateObj.month + "/" : "") + injury.dateObj.year;
        document.querySelector(".detail .date .value").innerHTML = date;

        // gravità
        var levelObj = _this.getLevelColor(injury.injury_level);
        var color = levelObj.color;
        // var borderStyleString = '3px solid rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        var colorStyleString = 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')';
        document.querySelector(".detail .level .value").innerHTML = levelObj.label;
        document.querySelector(".detail .level .value").style.color = colorStyleString;

        // eta
        document.querySelector(".detail .age .value").innerHTML = injury.age;

        // guarigione
        document.querySelector(".detail .healing .value").innerHTML = injury.healing_time;

        // descrizione
        document.querySelector(".detail .description .value").innerHTML = injury.description;

        

        
        // var diagnosticNode = document.querySelector(".detail .diagnostic .value"); 
        // diagnosticNode.innerHTML = "";

        // injury.diagnostic.forEach(function(diagnostic) {

        //     var node = document.createElement("div");
        //     node.setAttribute("class", "diagnostic_element");
        //     node.innerHTML = diagnostic;

        //     diagnosticNode.append(node);

        // });

    };










    window.DETAIL = _this;

})();