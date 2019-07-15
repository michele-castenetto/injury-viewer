(function() {
    
    var getjson = GUTILS.REQUEST.getjson;
    
    
    
    var _this = {};

    _this._data = {};
    _this._injuriesSelected = [];

    _this.filter_level_value = "all";
    _this.filter_type_value = "all";



    BODY.init();
    
    // handler click su body
    BODY.handleSphereClick = function(injuryData) {
        DETAIL.setData(injuryData);
    };
    // handler click su timeline
    TIMELINE.handleClick = function(injuryData) {
        DETAIL.setData(injuryData);
    };
    
    // handler per sincronizzare hover tra timeline e body
    TIMELINE.handleHover = function(injuryData) {
        if ( BODY.getHoveredMesh() ) { return; }

        if (injuryData) {
            BODY.setFocusedMesh(injuryData.id);
        } else {            
            BODY.setFocusedMesh();
        }
    };
    // handler per sincronizzare hover tra body e timeline
    BODY.handleHover = function(appdata) {
        TIMELINE.focusData = appdata;
    };



    // init select controls


    var applyFilters = function() {

        var filter_level_value = _this.filter_level_value;
        var threshold = levelMap[filter_level_value];

        var filter_type_value = _this.filter_type_value;

        var types = typeMap[filter_type_value];

        _this._injuriesSelected = _this._data.injuries
        .filter(function(injury) {
            return injury.injury_level >= threshold.lower &&
            injury.injury_level <= threshold.upper;
        })
        .filter(function(injury) {
            return types.indexOf(injury.type) !== -1; 
        });

        TIMELINE.setData(_this._injuriesSelected);
        BODY.setData(_this._injuriesSelected);
        
    };


    var levelMap = {
        all: { lower: 0, upper: 10 },
        low: { lower: 0, upper: 1},
        medium: { lower: 2, upper: 4},
        high: { lower: 5, upper: 10}
    };
    var edd_filter_level = easydropdown(document.querySelector('#select_ingiury_level'), {
        callbacks: {
            onSelect: function(value) {
                _this.filter_level_value = value;
                applyFilters();
            }
        }
    });
    var typeMap = {
        all: ["OPERAZIONE", "TRAUMA", "FRATTURA"],
        operazione: ["OPERAZIONE"],
        trauma: ["TRAUMA"],
        frattura: ["FRATTURA"],
    };
    var edd_filter_type = easydropdown(document.querySelector('#select_injury_type'), {
        callbacks: {
            onSelect: function(value) {
                _this.filter_type_value = value;
                applyFilters();
            }
        }
    });


    var edd_patient = easydropdown(document.querySelector('#select_patient'), {
        callbacks: {
            onSelect: function(value) {
                var filePath = "./data/data_" + value + ".json";
                loadData(filePath);
            }
        }
    });




    var serHeaderData = function(anagraphic) {

        document.querySelector(".header .patient .label").innerHTML = "Patient: ";
        document.querySelector(".header .patient .value").innerHTML = anagraphic.name + " " + anagraphic.surname;

        document.querySelector(".header .birthDate .label").innerHTML = "BirthDate: ";
        document.querySelector(".header .birthDate .value").innerHTML = anagraphic.birthDate;

    };
    var loadData = function(filePath) {
        
        getjson(filePath, function(err, data) {
            if (err) { return console.log(err); }
            
    
            var anagraphic = data.anagraphic;
            var injuries = data.injuries;
    
    
            _this._data = data;
            _this._injuriesSelected = injuries;
    
    
            serHeaderData(anagraphic);
    
            var birthDate = moment(anagraphic.birthDate, "DD-MM-YYYY");
    
    
            // esegue il parsing degli oggetti data con moment
            injuries.forEach(function(injury) {
                
                var dateObj = injury.dateObj;
    
                var dateString = (dateObj.day || "01") + (dateObj.month || "01") + (dateObj.year);
                
                var date = moment(dateString, "DDMMYYYY");
                
                injury.date = date;
                injury.dateUnix = date.unix();
                injury.age = injury.date.diff(birthDate, 'year');
    
            });
    
            // ordina i dati per data
            injuries.sort(function(i1, i2) {
                return i1.date - i2.date;
            });
    

            TIMELINE.setData(_this._injuriesSelected);
    
            BODY.setData(_this._injuriesSelected);
    
    
        });


    };


    loadData("./data/data_1.json");

    
    window.APP = _this;

})();

