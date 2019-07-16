

(function() {
    

    var getjson = GUTILS.REQUEST.getjson;
    var noop = function() {};


    var _this = {};



    _this.handleSphereClick = noop;


    var engine3d = null;
    
    var _dataMesh = [];
    var _bodyMap = null;

    var _hoveredMesh = null;
    var _focusedMesh = null;
    

    


    _this.getHoveredMesh = function() {
        return _hoveredMesh;
    };


    _this.setFocusedMesh = function(id) {
        
        _dataMesh.forEach(function(mesh) {
            engine3d.scaleMesh(mesh, 1);
            engine3d.unhighLightMesh(mesh);
        });

        if (!id) { return; }

        var meshSearch = _dataMesh.findOne(function(mesh) {
            return mesh.appdata && mesh.appdata.id === id;
        });

        if (meshSearch) {
            engine3d.scaleMesh(meshSearch, 1.3);
            engine3d.highLightMesh(meshSearch);
        }

    };



    //#region init_helpers


    var _initEngine = function(domnode) {


        engine3d = new Engine3d({
            domnode: domnode
        });
        window.engine3d = engine3d;
    
        
        // engine3d.createCartesianAxis(1);
        // engine3d.toggleCartesianAxis(false);
        

        var camera = engine3d.scene.activeCamera;
        
        camera.radius = 1.5;
        camera.lowerRadiusLimit = 1;
        camera.upperRadiusLimit = 4;
        engine3d.focusCamera(1.5, 90, 70);


    };

    

    var _loadHumanGeometry = function(geometryPath) {


        engine3d.loadFile(geometryPath,  function(err, meshes) {
            if (err) { return console.log(err); }
            // console.log("meshes", meshes);
    
            var mesh = meshes[0];
            
            
            engine3d.scaleMesh(mesh, 0.05);
    

            // serve per il compute della matrice di trasformazione!
            mesh.computeWorldMatrix(true);
            
            
            var size = engine3d.getMeshSize(mesh);
            // console.log("size", size);
    
            mesh.position.y -= size.y/2;
    
            mesh.material = engine3d.getXRayMaterial();

    
        });
    };


    var _listen = function() {


        var onPointerMove = function(event) {

            var picked_info = engine3d.getPickInfo();
            
            var pickedMesh = picked_info && picked_info.pickedMesh;
    
    
            if (_hoveredMesh === pickedMesh) {
                return;
            }
            if (_hoveredMesh) {
                engine3d.scaleMesh(_hoveredMesh, 1);
                engine3d.unhighLightMesh(_hoveredMesh);
            } 
            
            _hoveredMesh = pickedMesh;
            
            if (_hoveredMesh) {
                engine3d.scaleMesh(_hoveredMesh, 1.3);
                engine3d.highLightMesh(_hoveredMesh);


                if (_this.handleHover) {
                    _this.handleHover(_hoveredMesh.appdata);
                }
            } else {
                if (_this.handleHover) {
                    _this.handleHover(null);
                }
            }
    
        };
        engine3d.canvas.addEventListener("pointermove", onPointerMove);
    
        var onPointerUp = function(event) {
            if (_hoveredMesh) {
                if (_this.handleSphereClick) {
                    _this.handleSphereClick(_hoveredMesh.appdata);
                }
            }  
        };
        
        engine3d.canvas.addEventListener("pointerup", onPointerUp);

    };


    var _loadBodyMap = function(bodyMapPath, callback) {
        getjson(bodyMapPath, function(err, data) {
            if (err) { return console.log(err); }
            _bodyMap = data;
            callback(null);
        });
    };



    //#endregion init_helpers

    
    _this.init = function(domnode, geometryPath, bodyMapPath, callback) {

        _initEngine(domnode);

        _loadHumanGeometry(geometryPath);

        _listen();

        _loadBodyMap(bodyMapPath, function(err) {
            if (err) { return console.log(err); }
            callback(null);
        });


        var button = UI.Button();
        button.mount(engine3d.container);
        button.update({
            className: "button_control",
            iconClass: "icon-spinner11",
            handleClick: function() {
                engine3d.toggleCameraRotateAnimation();
            }
        });

    };



    _this.setData = function(injuries) {
        

        _dataMesh.forEach(function(mesh) {
            mesh.dispose();
        });
        _dataMesh = [];
        
        // separa le sfere che fanno riferimento ad un unica parte del corpo 
        // per fare in modo che non si sovrappongano in un unico punto
        var injuriesGroupMap = injuries.reduce(function(acc, injury) {

            if (!acc[injury.bodyLocation]) {
                acc[injury.bodyLocation] = [];
            }

            acc[[injury.bodyLocation]].push(injury);
            return acc;

        }, {});

        var injuriesGroups = Object.keys(injuriesGroupMap).map(function(key) {
            return injuriesGroupMap[key];
        });
        
        
        injuriesGroups.forEach(function(g) {
            if (g.length <= 1) { return; }

            var deltaOffset = 0.04;
            var xOffset = - deltaOffset * Math.floor(g.length/2);
            g.forEach(function(e) {
                e.offset = {x: xOffset ,y: 0, z: 0};
                xOffset += deltaOffset;
            });

        });


        // disegna le sfere
        injuries.forEach(function(injury) {
            
            var bodypart = _bodyMap[injury.bodyLocation];
            if (!bodypart) { return; }
            
            
            var color = _this.getLevelColor(injury.injury_level);
            color.a = 0.5;

            var position = bodypart.position;
            if (injury.offset) {
                position.x = injury.offset.x;
            }


            var sphere = engine3d.createSphere({
                data: injury, 
                diameter: 0.03,
                position: bodypart.position
            });

            sphere.material = engine3d.getEmissiveMaterialRGB(color);

            _dataMesh.push(sphere);

        });

    };



    window.BODY = _this;


})();