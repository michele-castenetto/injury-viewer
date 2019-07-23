(function() {
    

    var timeLine = new p5(function(p) {
        
        var parentNode = null;

        p.injuries = [];

        // flag che segnala l'avvenuto caricamento dei dati
        p.dataLoaded = false;


        p.minDate = null;
        p.maxDate = null;
        
        p.focusData = null;
        
        p.hovered = null;


        p.setData = function(injuries) {

            var dateArray = injuries.map(function(injury) {
                return injury.date;
            });

            var minDate = moment.min(dateArray);
            var maxDate = moment.max(dateArray);

            p.minDate = moment("0101" + minDate.year(), "DDMMYYYY");
            p.maxDate = moment("3112" + maxDate.year(), "DDMMYYYY");

            p.injuries = injuries;
            p.dataLoaded = true;

        };



        var bruise_icon = null;
        var fracture_icon = null;
        var operation_icon = null;
        var iconMap = {};


        var loadIcons = function() {
            
            Object.keys(p.iconPathMap).forEach(function(key) {
                var path = p.iconPathMap[key];
                iconMap[key] = p.loadImage(path);
            });

        };


        p.setup = function() {

            var renderer = p.createCanvas(100, 100);
            
            var canvas = renderer.canvas;
            
            parentNode = canvas.parentNode;

            p.resizeCanvas(parentNode.offsetWidth, parentNode.offsetHeight);

            loadIcons();

            p.imageMode(p.CENTER);

        };


        p.draw = function() {

            p.background(253);

            drawGraph();

            drawData();
            
        };
        

        var drawData = function() {

            if (!p.dataLoaded) { return; }

            var minDistance = p.width;
            p.hovered = null;

            p.injuries.forEach(function(injury, index) {

                var posX = p.map(injury.dateUnix, p.minDate.unix(), p.maxDate.unix(), 20, p.width - 20);
                var posY = p.height/2;
                var offsetY = [-80, 80, -40, 40][index % 4];
                posY += offsetY;


                var distance = p.dist(p.mouseX, p.mouseY, posX, posY);
                if( distance <= 20) {
                    if (distance <= minDistance) {
                        p.hovered = injury;
                        minDistance = distance;
                    }
                } 

            });




            p.injuries.forEach(function(injury, index) {
                
                p.stroke(200);
                p.noStroke();

                var posX = p.map(injury.dateUnix, p.minDate.unix(), p.maxDate.unix(), 20, p.width - 20);
                var posY = p.height/2;
                var offsetY = [-80, 80, -40, 40][index % 4];
                posY += offsetY;


                var radius = 20;
                var line_radius = 8;
                var highlight_color = p.color(240, 200, 0);


                p.stroke(200);

                if (p.focusData && p.focusData.id === injury.id) {
                    radius = 30;
                    p.fill(255, 0);
                    // p.stroke(240, 200, 0);
                    p.stroke(highlight_color);
                    p.strokeWeight(5);
                    p.ellipse(posX, posY, radius * (1.6), radius * (1.6));
                } 

                if (p.hovered && p.hovered.id === injury.id) {
                    radius = 30;
                    p.fill(255, 0);
                    // p.stroke(240, 200, 0);
                    p.stroke(highlight_color);
                    p.strokeWeight(5);
                    p.ellipse(posX, posY, radius * (1.6), radius * (1.6));
                }
                if (p.handleHover) {
                    p.handleHover(p.hovered);
                }


                p.fill(250);
                p.strokeWeight(2);
                p.line(posX, posY + (Math.sign(p.height/2 - posY)) * radius * (0.75), posX, p.height/2);

                p.strokeWeight(2);
                p.ellipse(posX, p.height/2, line_radius, line_radius);

                // p.stroke(220);
                // p.strokeWeight(1);
                






                var injuty_type = injury.type;

                var icon = iconMap[injuty_type];
                // console.log(icon);

                if (icon) {
                    p.image(icon, posX, posY, radius, radius);
                }
                
                p.strokeWeight(2);
                // var color = p.getLevelColor(injury.injury_level);
                var color = p.getLevelColor(injury.injury_level).color;
                p.stroke(color.r, color.g, color.b);  
                

                p.fill(255, 0);
                // p.fill(color.r, color.g, color.b);
                // p.ellipse(posX, posY, radius * (1.5), radius * (1.5));


                // healing time
                var healingTime = injury.healing_time * 24 * 3600;

                var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), 20, p.width - 20);

                p.stroke(50, 100, 200, 100);  
                p.strokeWeight(5);
                
                p.line(posX, posY + radius * (0.75), healingPosX, posY + radius * (0.75));

            });
        };


        var drawGraph = function() {

            if (!p.dataLoaded) { return; }

            var minYear = p.minDate.year();
            var maxYear = p.maxDate.year();

            p.stroke(235);
            p.strokeWeight(1);

            for (var year = minYear; year <= maxYear + 1; year++) {

                var date = moment("01-01-"+ year, "DD-MM-YYYY");
                var time = date.unix();
                var position = p.map(time, p.minDate.unix(), p.maxDate.unix(), 20, p.width - 20);

                // p.ellipse(position, p.height/2, 5, 5);

                p.line(position, 30, position, p.height- 10);


                p.textAlign(p.CENTER);
                p.textSize(10);
                p.fill(200);
                // p.text(year, position, p.height/2 - 15); 
                p.text(year, position, 20); 

            }

            p.stroke(200);
            p.strokeWeight(2);
            p.line(20, p.height/2, p.width - 20, p.height/2);


        };


        p.mousePressed = function() {
            if (p.hovered) {
                if (p.handleClick) {
                    p.handleClick(p.hovered);
                }
            }
        };


        p.windowResized = function() {
            p.resizeCanvas(parentNode.offsetWidth, parentNode.offsetHeight);
        };


    }, document.querySelector(".box_timeline"));

    
    window.TIMELINE = timeLine;


})();