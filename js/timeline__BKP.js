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



        // p.PShape s;

        // void setup() {
        //   size(100, 100);
        //   // The file "bot.svg" must be in the data folder
        //   // of the current sketch to load successfully
        //   s = loadShape("bot.svg");
        // }
        
        // void draw() {
        //   shape(s, 10, 10, 80, 80);
        // }

        var bruise_icon = null;
        var fracture_icon = null;
        var operation_icon = null;
        var iconMap = {
            "TRAUMA" : bruise_icon,
            "FRATTURA" : fracture_icon,
            "OPERAZIONE" : operation_icon,
        };
        
        var loadIcons = function() {
            p.imageMode(p.CENTER);
            bruise_icon = p.loadImage("./svg/bruise.svg");
            fracture_icon = p.loadImage("./svg/fracture1.svg");
            operation_icon = p.loadImage("./svg/operation1.svg");
        };


        p.setup = function() {

            var renderer = p.createCanvas(100, 100);
            
            var canvas = renderer.canvas;
            
            parentNode = canvas.parentNode;

            p.resizeCanvas(parentNode.offsetWidth, parentNode.offsetHeight);

            loadIcons();


        };


        p.draw = function() {

            p.background(250);

            drawGraph();

            drawData();
            
            p.image(bruise_icon, 100, p.height/2, 50, 50);
            p.image(fracture_icon, 200, p.height/2, 50, 50);
            p.image(operation_icon, 300, p.height/2, 50, 50);

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

                                
                p.strokeWeight(1);
                p.stroke(220);
                p.line(posX, posY, posX, p.height/2);

                p.fill(250);
                p.strokeWeight(1);
                p.ellipse(posX, p.height/2, 5, 5);


                p.noStroke();
                if (p.focusData) {
                    var id = p.focusData.id;
                    if (injury.id === id) {
                        radius = 30;
                        p.stroke(240, 200, 0);
                        p.strokeWeight(3);
                    }
                } 

                if (p.hovered && p.hovered.id === injury.id) {
                    radius = 30;
                    p.stroke(240, 200, 0);
                    p.strokeWeight(3);
                }
                if (p.handleHover) {
                    p.handleHover(p.hovered);
                }


                var injury_level = injury.injury_level;
                if (injury_level <= 1) {
                    p.fill(100, 200, 100);
                } else if(injury_level <= 4) {
                    p.fill(200, 200, 100);
                } else {
                    p.fill(200, 100, 100);
                }
                
                p.ellipse(posX, posY, radius, radius);
                

            });
        };


        var drawGraph = function() {

            p.stroke(200);
            p.strokeWeight(2);
            p.line(20, p.height/2, p.width - 20, p.height/2);

            
            if (!p.dataLoaded) { return; }


            // p.fill(250);

            var minYear = p.minDate.year();
            var maxYear = p.maxDate.year();

            for (var year = minYear; year <= maxYear + 1; year++) {

                var date = moment("01-01-"+ year, "DD-MM-YYYY");
                var time = date.unix();
                var position = p.map(time, p.minDate.unix(), p.maxDate.unix(), 20, p.width - 20);

                // p.ellipse(position, p.height/2, 5, 5);
                p.stroke(230);
                p.strokeWeight(1);
                p.line(position, 30, position, p.height- 10);


                p.textAlign(p.CENTER);
                p.textSize(10);
                p.fill(200);
                // p.text(year, position, p.height/2 - 15); 
                p.text(year, position, 20); 

            }

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