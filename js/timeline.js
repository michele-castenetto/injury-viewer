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

        var RADIUS = 20;
        var LINE_RADIUS = 8;
        var MARGIN = 20;


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
            p.rectMode(p.CENTER);

        };


        p.draw = function() {

            p.background(253);

            drawGraph();

            drawData();
            
        };
        

        var getPosition = function(injury, index) {
            var posX = p.map(injury.dateUnix, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);
            var posY = p.height/2;
            var offsetY = [-80, 80, -40, 40][index % 4];
            posY += offsetY;
            return {
                x: posX,
                y: posY
            };
        };


        var drawData = function() {

            if (!p.dataLoaded) { return; }

            var minDistance = p.width;
            p.hovered = null;

            p.injuries.forEach(function(injury, index) {

                var pos = getPosition(injury, index);
                injury.pos = pos;

                var distance = p.dist(p.mouseX, p.mouseY, pos.x, pos.y);
                if( distance <= RADIUS) {
                    if (distance <= minDistance) {
                        p.hovered = injury;
                        minDistance = distance;
                    }
                } 

            });


            var injuryHighlighted = p.focusData || p.hovered; 
            var injuryHighlightedId = injuryHighlighted && injuryHighlighted.id || ""; 

            
            
            p.injuries.forEach(function(injury, index) {
                
                if (injury.id === injuryHighlightedId) {
                    return;
                }


                // p.stroke(200);
                // p.strokeWeight(2);
                p.stroke(150, 170, 200, 100);  
                p.strokeWeight(3);
                p.fill(253);


                // var pos = getPosition(injury, index);
                var pos = injury.pos;

                p.line(pos.x, pos.y + (Math.sign(p.height/2 - pos.y)) * RADIUS, pos.x, p.height/2);

                p.strokeWeight(2);
                p.ellipse(pos.x, p.height/2, LINE_RADIUS, LINE_RADIUS);
                p.strokeWeight(3);

                var color = p.getLevelColor(injury.injury_level).color;
                
                // ##OLD cerchio colorato interno                
                // p.noStroke();
                // p.stroke(color.r, color.g, color.b, 150);  
                // p.fill(255, 0);
                // p.fill(color.r, color.g, color.b, 70);
                // p.ellipse(pos.x, pos.y, RADIUS*1.5, RADIUS*1.5);
                
                p.noStroke();
                p.fill(color.r, color.g, color.b, 100);
                p.ellipse(pos.x, pos.y, RADIUS * 1.7, RADIUS * 1.7);


                p.fill(255, 0);
                p.stroke(150, 170, 200, 100);
                p.ellipse(pos.x, pos.y, RADIUS*2, RADIUS*2);


                var injuty_type = injury.type;
                var icon = iconMap[injuty_type];
                if (icon) { p.image(icon, pos.x, pos.y, RADIUS, RADIUS); }


                // healing time
                var healingTime = injury.healing_time * 24 * 3600;
                var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);

                // p.stroke(50, 100, 200, 100);  
                // p.strokeWeight(6);
                // p.line(pos.x, pos.y + RADIUS, healingPosX, pos.y + RADIUS);
                p.noStroke();
                p.fill(50, 100, 200, 100);
                p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * RADIUS * 1.2, healingPosX - pos.x, 8);

            });

            if (p.handleHover) {
                p.handleHover(p.hovered);
            }

            if (!injuryHighlighted) { return; }
            
            var injury = injuryHighlighted;

            p.stroke(200);
            p.fill(250);
            p.strokeWeight(2);
            p.stroke(240, 200, 0);
            

            var pos = injury.pos;

            p.line(pos.x, pos.y + (Math.sign(p.height/2 - pos.y)) * RADIUS, pos.x, p.height/2);

            p.ellipse(pos.x, p.height/2, LINE_RADIUS, LINE_RADIUS);

            
            var color = p.getLevelColor(injury.injury_level).color; 
            p.noStroke();
            p.fill(color.r, color.g, color.b, 100);
            p.ellipse(pos.x, pos.y, RADIUS * 1.7, RADIUS * 1.7);


            var injuty_type = injury.type;
            var icon = iconMap[injuty_type];
            if (icon) { p.image(icon, pos.x, pos.y, RADIUS, RADIUS); }


            p.fill(255, 0);
            p.stroke(240, 200, 0);
            p.strokeWeight(5);
            p.ellipse(pos.x, pos.y, RADIUS * (2.2), RADIUS * (2.2));


            // healing time
            var healingTime = injury.healing_time * 24 * 3600;
            var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);

            // p.stroke(50, 100, 200, 100);  
            // p.strokeWeight(5);
            // p.line(pos.x, pos.y + RADIUS, healingPosX, pos.y + RADIUS);
            p.noStroke();
            p.fill(50, 100, 200, 100);
            p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * RADIUS * 1.2, healingPosX - pos.x, 8);

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
                var position = p.map(time, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);

                // p.ellipse(position, p.height/2, 5, 5);

                p.line(position, MARGIN * 2, position, p.height - MARGIN);


                p.textAlign(p.CENTER);
                p.textSize(10);
                p.fill(200);
                // p.text(year, position, p.height/2 - 15); 
                p.text(year, position, 20); 

            }

            // p.stroke(200);
            // p.strokeWeight(2);
            p.stroke(150, 170, 200, 100);  
            p.strokeWeight(6);


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