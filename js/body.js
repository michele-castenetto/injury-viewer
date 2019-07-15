(function() {
    
    var noop = function() {};


    var _this = {};

    _this.handleSphereClick = noop;



    //#region materials 


    var _getEmissiveMaterialRGB = function (scene, color) {
        color = color || {};
        var r = color.r || 0;
        var g = color.g || 0;
        var b = color.b || 0;
        var a = color.a || 1;
        var materialName = "mat_emis_rgba_" + r + "_" + g + "_" + b + "_" + a;

        var material = scene.getMaterialByName(materialName);

        if (material) { return material; }

        material = new BABYLON.StandardMaterial(materialName, scene);
        // material.diffuseColor = new BABYLON.Color3(r/255, g/255, b/255);
        material.emissiveColor = new BABYLON.Color3(r / 255, g / 255, b / 255);
        material.disableLighting = true;
        material.alpha = a;

        return material;
    };


    // var _getXRayMaterial = function(scene) {
    //     var material = new BABYLON.StandardMaterial("xray", scene);
    //     material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    //     material.alpha = 0.1;
    //     var fresnel_params = new BABYLON.FresnelParameters();
    //     fresnel_params.isEnabled = true;
    //     // fresnel_params.leftColor = new BABYLON.Color3(0.5, 0.6, 1);
    //     fresnel_params.leftColor = new BABYLON.Color3(0.5, 0.6, 0.8);
    //     fresnel_params.rightColor = new BABYLON.Color3(0, 0, 0);
    //     fresnel_params.power = 2;
    //     fresnel_params.bias = 0.1;
    //     var fresnel_params2 = new BABYLON.FresnelParameters();
    //     fresnel_params2.isEnabled = true;
    //     fresnel_params2.leftColor = new BABYLON.Color3(1, 1, 1);
    //     // fresnel_params2.rightColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    //     fresnel_params2.rightColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    //     fresnel_params2.power = 2;
    //     fresnel_params2.bias = 0.5;
    //     material.emissiveFresnelParameters = fresnel_params;
    //     material.opacityFresnelParameters = fresnel_params2;
    //     return material;
    // };


    var _getXRayMaterial = function(scene) {
        
        var material = new BABYLON.StandardMaterial("xray", scene);
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        material.alpha = 0.1;
        var fresnel_params = new BABYLON.FresnelParameters();
        fresnel_params.isEnabled = true;
        // fresnel_params.leftColor = new BABYLON.Color3(0.5, 0.6, 1);
        fresnel_params.leftColor = new BABYLON.Color3(0.5, 0.6, 0.7);
        fresnel_params.rightColor = new BABYLON.Color3(0, 0, 0);
        fresnel_params.power = 2;
        fresnel_params.bias = 0.1;
        var fresnel_params2 = new BABYLON.FresnelParameters();
        fresnel_params2.isEnabled = true;
        fresnel_params2.leftColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        // fresnel_params2.rightColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        fresnel_params2.rightColor = new BABYLON.Color3(0.05, 0.05, 0.05);
        fresnel_params2.power = 2;
        fresnel_params2.bias = 0.5;
        material.emissiveFresnelParameters = fresnel_params;
        material.opacityFresnelParameters = fresnel_params2;

        return material;

    };



    var _getAlphaMaterial = function() {
        var material = new BABYLON.StandardMaterial("mat", scene);
        material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        // material.specularColor = new BABYLON.Color3(0.1,0.1,0.1);
        // material.ambientColor = new BABYLON.Color3(0.1,0.1,0.1);
        material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        material.alpha = 0.2;
        // material.pointsCloud = true;
        // mesh.material = material;

        return material;
    };


    var _resetMeshColor = function(mesh) {
        // reset mesh color
		var colors = [];
		var count = mesh.getTotalVertices() * 4;
		var i;
		for(i=0; i<count; i+=4) {
			colors[i] = 1;
			colors[i+1] = 1;
			colors[i+2] = 1;
			colors[i+3] = 1;
		}
		mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colors);
    };


    //#endregion materials 




    var createSphere = function(params) {
        
        var sphere = BABYLON.MeshBuilder.CreateSphere("", {
            diameter: params.diameter
        }, scene);
        
        var color = params.color;
        // sphere.material = _getEmissiveMaterialRGB(scene, {r: color.r, g: color.g, b: color.b, a: 0.5});
        // sphere.setPosition(params.position);
        engine3d.setMeshPosition(sphere, params.position);

        sphere.appdata = params.data;

        sphere.renderingGroupId = 2;

        return sphere;

    };


    var highLightMesh = function(mesh) {

        var sphere = BABYLON.MeshBuilder.CreateSphere("", {
            diameter: 0.05
        }, scene);

        sphere.material = _getEmissiveMaterialRGB(scene, {r: 220, g: 150, b: 0, a: 0.5});

        sphere.position = mesh.position;

        mesh._highLightMesh = sphere;

    };

    var unhighLightMesh = function(mesh) {
        if (mesh._highLightMesh) {
            mesh._highLightMesh.dispose();
        }
    };





    var scene = null;
    var canvas = null;
    var container = null;
    var camera = null;
    var engine3d = null;
    var highLightLayer = null;
    

    var _dataMesh = [];

    var _hoveredMesh = null;
    var _focusedMesh = null;
    

    


    _this.getHoveredMesh = function() {
        return _hoveredMesh;
    };



    _this.setFocusedMesh = function(id) {
        
        _dataMesh.forEach(function(mesh) {
            engine3d.scaleMesh(mesh, 1);
            highLightLayer.removeMesh(mesh);
            unhighLightMesh(mesh);
        });

        if (!id) { return; }

        var meshSearch = _dataMesh.findOne(function(mesh) {
            return mesh.appdata && mesh.appdata.id === id;
        });

        if (meshSearch) {
            engine3d.scaleMesh(meshSearch, 1.3);
            // highLightLayer.addMesh(meshSearch, new BABYLON.Color3(1, 0.4, 0));
            highLightMesh(meshSearch);

        }

    };



    //#region init_helpers


    var _initEngine = function() {

        engine3d = new Engine3d({
            domnode: document.querySelector(".box_body")
        });
        window.engine3d = engine3d;
    
    
        engine3d.createCartesianAxis(1);
        engine3d.toggleCartesianAxis(false);
    

        scene = engine3d.scene;
        canvas = engine3d.canvas;
        container = engine3d.container;
        camera = scene.activeCamera;


        highLightLayer = new BABYLON.HighlightLayer("hl1", scene);
        highLightLayer.blurHorizontalSize = 0.5;
        highLightLayer.blurVerticalSize = 0.5;
        // highLightLayer.outerGlow = true;
        // scene.setRenderingAutoClearDepthStencil(1, false);
        // scene.setRenderingAutoClearDepthStencil(2, false);
        
    
        camera.radius = 1.5;
        camera.lowerRadiusLimit = 1;
        camera.upperRadiusLimit = 4;
        engine3d.focusCamera(1.5, 90, 70);

    };


    var _loadHumanGeometry = function() {


        engine3d.loadFile("./geometries/human1.obj",  function(err, meshes) {
            if (err) { return console.log(err); }
    
            // console.log("meshes", meshes);
    
            var mesh = meshes[0];
            
            // mesh.scale(0.05);
            engine3d.scaleMesh(mesh, 0.05);
    

            // serve per il compute della matrice di trasformazione!
            // var boundingBox = mesh.createBoundingBox();
            // var boundingBox = engine3d.createMeshBoundingBox(mesh);

            mesh.computeWorldMatrix(true);


            Engine3d.prototype.disableEdges = function(rootmesh) {

                if (rootmesh.geometry) {
                    rootmesh.disableEdgesRendering();
                }
    
                var meshes = rootmesh.getChildMeshes();
                meshes.forEach(function(mesh) {
                    if(mesh.geometry) {
                        mesh.disableEdgesRendering();
                    }
                });
    
            };

            
            // var size = mesh.getSize();
            var size = engine3d.getMeshSize(mesh);
            // console.log("size", size);
    
            mesh.position.y -= size.y/2;
    
            mesh.material = _getXRayMaterial(scene);
    
        });
    };

    var _listen = function() {

        var onPointerMove = function(event) {

            var picked_info = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
                return mesh.appdata;
            });
            
            var pickedMesh = picked_info && picked_info.pickedMesh;
    
    
            if (_hoveredMesh === pickedMesh) {
                return;
            }
            if (_hoveredMesh) {
                engine3d.scaleMesh(_hoveredMesh, 1);
                // highLightLayer.removeMesh(_hoveredMesh);
                unhighLightMesh(_hoveredMesh);
            } 
            
            _hoveredMesh = pickedMesh;
            
            if (_hoveredMesh) {
                engine3d.scaleMesh(_hoveredMesh, 1.3);
                // highLightLayer.addMesh(_hoveredMesh, new BABYLON.Color3(1, 0.4, 0));
                highLightMesh(_hoveredMesh);


                if (_this.handleHover) {
                    _this.handleHover(_hoveredMesh.appdata);
                }
            } else {
                if (_this.handleHover) {
                    _this.handleHover(null);
                }
            }
    
        };
        canvas.addEventListener("pointermove", onPointerMove);
    
        var onPointerUp = function(event) {
            if (_hoveredMesh) {
                // console.log("_hoveredMesh", _hoveredMesh);
                // console.log("appdata", _hoveredMesh.appdata);
                if (_this.handleSphereClick) {
                    _this.handleSphereClick(_hoveredMesh.appdata);
                }
            }  
        };
    
        canvas.addEventListener("pointerup", onPointerUp);
    };


    var _loadBodyMap = function() {
        // ##TODO 
        // var node = new BABYLON.Mesh(id, scene);

        // console.log("BODY_MAP", BODY_MAP);

        Object.keys(BODY_MAP).forEach(function(key) {
            var bodypart = BODY_MAP[key];

            createSphere({
                data: {label: key}, 
                diameter: 0.04,
                position: bodypart.position,
                color: {r: 220, g: 220, b: 100}
            });

        });
    };


    //#endregion init_helpers


    _this.init = function() {

        _initEngine();

        _loadHumanGeometry();

        _listen();

        // _loadBodyMap();



        // ##DEBUG
        // var sphere = createSphere({
        //     data: {}, 
        //     diameter: 0.04,
        //     position: {x: 0, y: 0, z: 0},
        //     color: {r: 200, g: 200, b: 0}
        // });
        // sphere.material = _getEmissiveMaterialRGB(scene, {r: 255, g: 255, b: 0, a: 1});
        // highLightLayer.addMesh(sphere, BABYLON.Color3.Red());        


        
        var button = UI.Button();
        button.mount(container);
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
            
            var bodypart = BODY_MAP[injury.bodyLocation];
            if (!bodypart) { return; }
            
            var injury_level = injury.injury_level;

            var color = {r: 100, g: 200, b: 100, a: 0.5};
            if (injury_level <= 1) {
                color = {r: 100, g: 200, b: 100, a: 0.5};
            } else if(injury_level <= 4) {
                color = {r: 220, g: 220, b: 100, a: 0.5};
            } else {
                color = {r: 220, g: 100, b: 100, a: 0.5};
            }

            var position = bodypart.position;
            if (injury.offset) {
                position.x = injury.offset.x;
            }


            var sphere = createSphere({
                data: injury, 
                diameter: 0.03,
                position: bodypart.position,
                color: color
            });

            sphere.material = _getEmissiveMaterialRGB(scene, color);

            _dataMesh.push(sphere);

        });

    };



    window.BODY = _this;


})();