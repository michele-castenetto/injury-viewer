(function() {
    

    var timeLine = new p5(function(p) {
        
        var parentNode = null;

        // dati 
        p.injuries = [];
        // flag che segnala l'avvenuto caricamento dei dati
        p.dataLoaded = false;
        p.minDate = null;
        p.maxDate = null;
        
        // elemento su cui effettuare il focus
        p.focusData = null;
        // elemento corrente all'hover del mouse
        p.hovered = null;
        // mappa icone svg
        var iconMap = {};

        // costanti di dimensione
        var RADIUS = 20;
        var LINE_RADIUS = 8;
        var MARGIN = 20;
        var MINYEARSPACE = 50;


        // variabili per scale e translate
        var scaleFactor = 1;
        var translatePosX = 0;
        var translatePosY = 0;

        p.resetView = function() {
            scaleFactor = 1;
            translatePosX = 0;
            translatePosY = 0;
        };

        var mouseWorldX;
        var mouseWorldY;
        // ##OLD
        // var calcMouseWorldPos = function() {
        //     mouseWorldX = (p.mouseX - translatePosX) / scaleFactor;
        //     mouseWorldY = (p.mouseY - translatePosY) / scaleFactor;
        // };
        var calcMouseWorldPos = function() {
            // mouseWorldX = p.mouseX;
            // mouseWorldY = p.mouseY;
            mouseWorldX = ( (p.mouseX - p.width/2) / scaleFactor + p.width/2) ;
            mouseWorldX -= translatePosX;
            mouseWorldY = ( (p.mouseY - p.height/2) / scaleFactor + p.height/2) ;
            mouseWorldY -= translatePosY;
        };


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

        var healingViewMode = 0;

        p.setHealingViewMode = function() {
            healingViewMode = (healingViewMode + 1) % 3;
        };


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
            
            p.translate(p.width/2, p.height/2);
            p.scale(scaleFactor);
            p.translate(-p.width/2, -p.height/2);
            
            p.translate(translatePosX, translatePosY);

            calcMouseWorldPos();
            
            drawGraph();

            drawData();

            drawLegend();
            
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


                // var distance = p.dist(p.mouseX, p.mouseY, pos.x, pos.y);
                var distance = p.dist(mouseWorldX, mouseWorldY, pos.x, pos.y);
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
                // var healingTime = injury.healing_time * 24 * 3600;
                // var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);

                // p.stroke(50, 100, 200, 100);  
                // p.strokeWeight(6);
                // p.line(pos.x, pos.y + RADIUS, healingPosX, pos.y + RADIUS);

                // p.noStroke();
                // p.fill(50, 100, 200, 100);
                // p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 4), healingPosX - pos.x, 6);
                // p.fill(200, 100);
                // p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 10), healingPosX - pos.x, 6);


                // healing time
                var healingDays = injury.healing_time;
                var healingTime = injury.healing_time * 24 * 3600;
                var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);
                p.noStroke();
                // p.fill(200, 100);
                // p.rect(pos.x + 15, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 12), 30, 6);
                // p.fill(50, 100, 200, 150);
                // p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 12), healingPosX - pos.x, 6);
                // p.rect(pos.x + 15, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 12), 30, 6);
                p.fill(50, 100, 200, 100);
                if (healingViewMode === 0) {
                    p.rect(pos.x + healingDays/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 6), healingDays, 6);
                } else if(healingViewMode === 1) {
                    p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 6), healingPosX - pos.x, 6);
                }


            });

            if (p.handleHover) {
                p.handleHover(p.hovered);
            }

            if (!injuryHighlighted) { return; }
            
            var injury = injuryHighlighted;

            // p.stroke(200);
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
            // var healingTime = injury.healing_time * 24 * 3600;
            // var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);
            // p.stroke(50, 100, 200, 100);  
            // p.strokeWeight(5);
            // p.line(pos.x, pos.y + RADIUS, healingPosX, pos.y + RADIUS);
            // p.noStroke();
            // p.fill(50, 100, 200, 100);
            // p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * RADIUS * 1.2, healingPosX - pos.x, 8);

            // healing time
            var healingDays = injury.healing_time;
            var healingTime = injury.healing_time * 24 * 3600;
            var healingPosX = p.map(injury.dateUnix + healingTime, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);
            p.noStroke();
            // p.fill(200, 100);
            // p.rect(pos.x + 15, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 12), 30, 6);
            p.fill(50, 100, 200, 100);
            if (healingViewMode === 0) {
                p.rect(pos.x + healingDays/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 6), healingDays, 6);
            } else if(healingViewMode === 1) {
                p.rect(pos.x + (healingPosX - pos.x)/2, pos.y - (Math.sign(p.height/2 - pos.y)) * (RADIUS + 6), healingPosX - pos.x, 6);
            }

        };


        var drawGraph = function() {

            if (!p.dataLoaded) { return; }

            var minYear = p.minDate.year();
            var maxYear = p.maxDate.year();

            p.stroke(235);
            p.strokeWeight(1);


            // calcolo per capire se non mostrare alcuni riferimenti anno nel grafico
            // in modo perche non si sovrappongano
            var yearStep = 0;
            var yearNum = maxYear - minYear;
            var yearSpace = ( p.width - 2 * MARGIN )/yearNum;

            if (yearSpace < MINYEARSPACE) {
                
                var ratio = MINYEARSPACE/yearSpace;

                var newYearNum = yearNum/ratio;

                yearStep = Math.floor(yearNum/newYearNum);

            }


            // p.stroke(200, 100);
            // p.strokeWeight(6);
            // p.line(20, MARGIN * 2, p.width - 20, MARGIN * 2);

            p.stroke(150, 170, 200, 100);  
            p.strokeWeight(6);
            p.line(20, p.height/2, p.width - 20, p.height/2);

            for (var year = minYear; year <= maxYear + 1; year++) {

                if (yearStep !== 0 && year % yearStep !== 0) { continue; }


                var date = moment("01-01-"+ year, "DD-MM-YYYY");
                var time = date.unix();
                var position = p.map(time, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);

                // p.stroke(200, 100);
                // p.strokeWeight(2);
                // p.fill(253);
                // p.ellipse(position, MARGIN * 2, LINE_RADIUS, LINE_RADIUS);

                p.stroke(235);
                p.strokeWeight(1);
                p.line(position, MARGIN * 2, position, p.height - MARGIN * 3);


                // p.stroke(235);
                // p.strokeWeight(1);
                p.textAlign(p.CENTER);
                p.textSize(10);
                p.fill(200);
                p.text(year, position, 20); 

            }

        };


        var drawLegend = function() {
            p.noStroke();
            p.fill(50, 100, 200, 100);

            if (healingViewMode === 0) {
                p.rect(MARGIN + 15, p.height - MARGIN - 6, 30, 6);
            } else if(healingViewMode === 1) {
                var monthTime = p.map(p.minDate.unix() + 30 * 24 * 3600, p.minDate.unix(), p.maxDate.unix(), MARGIN, p.width - MARGIN);
                p.rect(MARGIN + (monthTime - MARGIN)/2, p.height - MARGIN - 6, monthTime - MARGIN, 6);
            }

            if (healingViewMode === 2) {
                return;
            }

            p.textAlign(p.LEFT);
            p.fill(200);
            p.textSize(12);
            p.text("tempo di guarigione (1 mese)", MARGIN, p.height - MARGIN - 12); 
        };


        // evento click
        p.mousePressed = function() {
            if (p.hovered) {
                if (p.handleClick) {
                    p.handleClick(p.hovered);
                }
            }
            startPos.x = p.mouseX;
            startPos.y = p.mouseY;
            moveViewport = true;
        };

        // evento resize per adattare il canvas al suo contenitore
        p.windowResized = function() {
            p.resizeCanvas(parentNode.offsetWidth, parentNode.offsetHeight);
        };


        // eventi zoom e move

        var startPos = new p5.Vector(0, 0);
        var moveViewport = false;
        
        p.keyPressed = function() {
            if(p.key == 'r') {
                p.resetView();
            }
            if(p.key == 't') {
                p.setHealingViewMode();
            }
        };


        p.mouseWheel = function(event) {
            var e = event.delta;

            var isInsideCanvas = p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;

            if (!isInsideCanvas) { return; }

            scaleFactor += e * -0.001;
            if(scaleFactor < 1) {
                scaleFactor = 1;
            }
            if (scaleFactor === 1) {
                translatePosX = 0;
                translatePosY = 0;
            }

        };
        
        p.mouseDragged = function() {
            if(moveViewport === false) {return;}
            
            translatePosX += (p.mouseX - startPos.x)/scaleFactor;
            translatePosY += (p.mouseY - startPos.y)/scaleFactor;
            startPos.x = p.mouseX;
            startPos.y = p.mouseY;
        };
                
        p.mouseReleased = function() {
            moveViewport = false;
        };



    }, document.querySelector(".box_timeline"));

    
    window.TIMELINE = timeLine;


})();