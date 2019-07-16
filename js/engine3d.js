(function() {
    

    var GUIDGEN = GUTILS.GUIDGEN;



    var Engine3d = (function() {


        var Engine3d = function Engine3d(params) {

            this.domnode = null;

            this.canvas = null;
            this.engine = null;
            this.scene = null;
            

            this.rotationAnimation = false;
            this._rotationCameraAnimationHelper = (function () {
                var camera = this.scene.activeCamera;
                camera.alpha += 0.01;
            }).bind(this);
            
            this.init(params);

        };





        //#region metodi_init
        
        

        Engine3d.prototype.move = function(node) {
            if (!node) return;
            node.append(this.container);
            this.resize();
        };
        

        Engine3d.prototype.toggle = function(visible) {
            if (visible === true || visible === false) {} else {
                visible = this.container.style.display !== 'none' ? true : false;
                visible = !visible;
            }
            this.container.style.display = visible ? 'block' : 'none';
            this.canvas.style.display = visible ? 'block' : 'none';
            this.toggleDebugLayer(false);
        };
        Engine3d.prototype.show = function() { this.toggle(true); }; 
        Engine3d.prototype.hide = function() { this.toggle(false); }; 
        

        var _createCanvasGrafica = function() {
            var guid = GUIDGEN.generate();
            var el = document.createElement("canvas");  
            el.className = "canvas_grafica";
            el.id = "_canvas_" + guid;
            el.style.width = "100%";
            el.style.height = "100%";
            el.style.touchAction = "none";
            el.style.outline = "none";
            el.style.display = "none";
            return el;
        };
        var _createCanvasContainer = function() {
            var guid = GUIDGEN.generate();
            var el = document.createElement("div");  
            el.className = "g3dcontainer";
            el.id = "_container_" + guid;
            el.style.width = "100%";
            el.style.height = "100%";
            el.style.display = "none";
            el.style.position = "relative";
            return el;
        };

        
        Engine3d.prototype.init = function(params) {            
            params = params || {};


            if (!BABYLON.Engine.isSupported()) {
                var message = 'Your browser does not support WebGL!';
                console.error(message);
                throw message;
            }
            
            var canvas = _createCanvasGrafica();
            this.canvas = canvas;

            var container = _createCanvasContainer();
            this.container = container;

            container.append(canvas);
            document.querySelector('body').append(container);
            

            var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
            this.engine = engine;
            
                
            var scene = new BABYLON.Scene(engine);


            scene.useRightHandedSystem = true;
            scene.clearColor = new BABYLON.Color3(0.99, 0.99, 0.99);
            this.scene = scene;


            // ##NOTA Per evitare errore file gltf.manifest
            // this.engine.enableOfflineSupport = false;
            

            this.addWindowEvents();
            
            if (params.camera !== false) { this.addCamera(); }
            if (params.domnode) { this.move(params.domnode); }
            
            this.start();
            this.show();
            this.resize();
            
        };

        
        var _render = function(_this) {
            _this.scene.render();
        };
        Engine3d.prototype.start = function() {
            var _this = this;
            this.engine.runRenderLoop(function(){
                _render(_this);
            });
            // this.canvas.style.display = "block";
            this.engine.resize();
        };


        Engine3d.prototype.stop = function() {
            // this.canvas.style.display = "none";
            this.engine.stopRenderLoop();
        };


        Engine3d.prototype.resize = function() {
            var _this = this;
            _this.engine.resize();
        };


        Engine3d.prototype.addCamera = function(params) {
            params = params || {};

            var camera = new BABYLON.ArcRotateCamera("camera_engine3d_", 0, 0, 1, BABYLON.Vector3.Zero(), this.scene);
            camera.wheelPrecision = 100;
            camera.radius = params.radius || 4;
            camera.alpha = params.radius || ( Math.PI / 180 ) * 60;
            camera.beta = params.radius || ( Math.PI / 180 ) * 60;
            camera.maxZ = 1000;
            camera.minZ = 0;

            camera.attachControl(this.canvas, false);

            return camera;
            
        };


        Engine3d.prototype.focusCamera = function(radius, alpha, beta) {
            radius = radius || 4;

            var scene = this.scene;
            var camera = scene.activeCamera;
            
            camera.radius = radius;

            if(alpha) { camera.alpha = (Math.PI/180) * alpha; }
            if(beta) { camera.beta = (Math.PI/180) * beta; }
            
        };



        Engine3d.prototype.addWindowEvents = function() {
            var _this = this;

            /* Resize event */
            window.addEventListener('resize', function(){
                _this.engine.resize();
            });

        };



        //#endregion metodi_init



        
        
        //#region metodi_load


        var _loadFile = function(scene, base, path, callback, callback_progress) {
            var onSuccess = function(meshes) { 
                try { callback(null, meshes); 
                } catch (error) { callback(error); }
            };
            var onProgress = function(event) { callback_progress && callback_progress(event)};
            var onError = function(scene, error) { 
                console.log('_loadFile onError');
                callback(error); 
            };
            BABYLON.SceneLoader.ImportMesh(
                null, // mesh to import, null for all
                base, // base path
                path, // file path
                scene,
                onSuccess,
                onProgress,
                onError
            );
        };

        
        var _decodePath = function(path){
            var fileStart = path.lastIndexOf('/') + 1;
            var fileName = path.substring(fileStart);
            var filePath = path.substring(0, fileStart);
            return [filePath, fileName];
        };


        Engine3d.prototype.loadFile = function(filepath, callback) {
            var decodedpath = _decodePath(filepath);
            _loadFile(this.scene, decodedpath[0], decodedpath[1], callback);
        };



        //#endregion metodi_load





        //#region metodi_mesh


        Engine3d.prototype.createSphere = function(params) {

            var scene = this.scene;

            var sphere = BABYLON.MeshBuilder.CreateSphere("", {
                diameter: params.diameter
            }, scene);
            
            engine3d.setMeshPosition(sphere, params.position);
    
            sphere.appdata = params.data;
    
            sphere.renderingGroupId = 2;
            
            return sphere;
            
        };


        Engine3d.prototype.highLightMesh = function(mesh) {

            var scene = this.scene;

            var sphere = BABYLON.MeshBuilder.CreateSphere("", {
                diameter: 0.05
            }, scene);
    
            sphere.material = this.getEmissiveMaterialRGB({r: 220, g: 150, b: 0, a: 0.5});
            
            sphere.position = mesh.position;
    
            mesh._highLightMesh = sphere;

        };
        Engine3d.prototype.unhighLightMesh = function(mesh) {
            if (mesh._highLightMesh) {
                mesh._highLightMesh.dispose();
            }
        };


        Engine3d.prototype.getMeshSize = function(mesh) {
            mesh.refreshBoundingInfo();
            var boundingInfo = mesh.getBoundingInfo();
            var minimumWorld = boundingInfo.boundingBox.minimumWorld;
            var maximumWorld = boundingInfo.boundingBox.maximumWorld;
            var size = maximumWorld.subtract(minimumWorld);
            return size;
        };


        Engine3d.prototype.scaleMesh = function(mesh, scaling) {
            if (typeof scaling === "number") {
                scaling = new BABYLON.Vector3(scaling, scaling, scaling);
            }
            mesh.scaling = scaling; 
        };


        Engine3d.prototype.hideMesh = function(mesh, filter_func) {
            mesh.getChildMeshes(false, filter_func)
            .forEach(function(childmesh) {
                childmesh.isVisible = false;
            });
            mesh.isVisible = false;
        };
        Engine3d.prototype.showMesh = function(mesh, filter_func) {
            mesh.getChildMeshes(false, filter_func)
            .forEach(function(childmesh) {
                childmesh.isVisible = true;
            });
            mesh.isVisible = true;
        };


        Engine3d.prototype.setMeshPosition = function(mesh, point) {
            point = point || {};
            var startPoint = mesh.getAbsolutePosition();
            var x = point.x !== undefined ? point.x : startPoint.x;
            var y = point.y !== undefined ? point.y : startPoint.y;
            var z = point.z !== undefined ? point.z : startPoint.z;
            var position = new BABYLON.Vector3(x, y, z);
            mesh.position = position;
        };


        // var _computeMeshBoundingInfo = function(scene, mesh) {
            
        //     if (!mesh) { console.error('No mesh provided in _computeMeshBoundingInfo'); return null; }
        //     var meshes = mesh.getChildMeshes();
        //     meshes.push(mesh);
            
        //     var min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        //     var max = new BABYLON.Vector3(- Number.MAX_VALUE, - Number.MAX_VALUE, - Number.MAX_VALUE);

        //     for (var i = 0; i <= meshes.length; i++) {
        //         var currentMesh = meshes[i];

        //         if (!currentMesh) { continue; }
                
        //         // ##NOTA Necessario per mesh clonate o mesh a cui sono state applicate trasformazioni
        //         currentMesh.computeWorldMatrix(true);

        //         var bounds = currentMesh.getBoundingInfo();
        //         var minimum = bounds.boundingBox.minimumWorld;
        //         var maximum = bounds.boundingBox.maximumWorld;

        //         if (minimum.x < min.x) min.x = minimum.x;
        //         if (minimum.y < min.y) min.y = minimum.y;
        //         if (minimum.z < min.z) min.z = minimum.z;
        //         if (maximum.x > max.x) max.x = maximum.x;
        //         if (maximum.y > max.y) max.y = maximum.y;
        //         if (maximum.z > max.z) max.z = maximum.z;
        //     }
        //     var boundingInfo = new BABYLON.BoundingInfo(min, max);

        //     return boundingInfo;
        // };
        // var _createMeshBoundingBox = function(scene, mesh) {

        //     var boundingInfo = _computeMeshBoundingInfo(scene, mesh);

        //     var size = boundingInfo.maximum.subtract(boundingInfo.minimum);

        //     var bounding_material = scene.getMaterialByName("mat_boundingbox");

        //     if (!bounding_material) {
        //         bounding_material = new BABYLON.StandardMaterial('mat_boundingbox', scene);
        //         bounding_material.wireframe = true;
        //     }
        //     var boundingMesh = BABYLON.MeshBuilder.CreateBox( mesh.id + '__boundingMesh', { width: size.x, height: size.y, depth: size.z }, scene);
        //     boundingMesh.material = bounding_material;
        //     boundingMesh.isVisible = false;

        //     return boundingMesh;

        // };
        // Engine3d.prototype.createMeshBoundingBox = function(mesh) {
        //     return _createMeshBoundingBox(this.scene, mesh);
        // };




        
        //#endregion metodi_mesh





        //#region materials


        Engine3d.prototype.getEmissiveMaterialRGB = function(color) {

            var scene = this.scene;

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


        Engine3d.prototype.getXRayMaterial = function() {

            var scene = this.scene;

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


        //#endregion materials





        //#region tools


        Engine3d.prototype.getPickInfo = function() {
            var scene = this.scene;
            var picked_info = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
                return mesh.appdata;
            });
            return picked_info;
        };


        var _createLine = function(scene, point1, point2, color) {
            var line = BABYLON.Mesh.CreateLines("axisX", [
                point1,
                point2
            ], scene);
            line.color = color;
            return line;
        };
        var _createCartesianAxis = function(scene, size) {

            var cartesian_axis = new BABYLON.Mesh('cartesian_axis_world', scene);

            var axisX = _createLine(scene, new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Color3(1, 0, 0) );
            var axisY = _createLine(scene, new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Color3(0, 1, 0) );
            var axisZ = _createLine(scene, new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Color3(0, 0, 1) );

            axisX.parent = cartesian_axis;
            axisY.parent = cartesian_axis;
            axisZ.parent = cartesian_axis;
            
            return cartesian_axis;

        };
        Engine3d.prototype.createCartesianAxis = function(size) {
            var _this = this;
            var cartesianAxis = _createCartesianAxis(_this.scene, size);
            this.cartesianAxis = cartesianAxis;
            return cartesianAxis;
        };
        Engine3d.prototype.toggleCartesianAxis = function(visible) {
            if (visible === true || visible === false) {
                
            } else {
                visible = !this.cartesianAxis.isVisible;
            }
            // visible ? this.cartesianAxis.show() : this.cartesianAxis.hide();
            visible ? this.showMesh(this.cartesianAxis) : this.hideMesh(this.cartesianAxis);
        };


        Engine3d.prototype.toggleDebugLayer = function(visible) {
            if (visible === true || visible === false) {
                
            } else {
                visible = !this.scene.debugLayer.isVisible();
            }
            visible ? this.scene.debugLayer.show() : this.scene.debugLayer.hide();
        };


        //#endregion tools




        //#region animations


        Engine3d.prototype.toggleCameraRotateAnimation = function(active, speed) {

            var scene = this.scene;
            var _this = this;

            if (active === true || active === false) {
                this.rotationAnimation = active;
            } else {
                this.rotationAnimation = !this.rotationAnimation;
            }

            this.rotationAnimation ? scene.registerBeforeRender(_this._rotationCameraAnimationHelper) : scene.unregisterBeforeRender(_this._rotationCameraAnimationHelper);
            
        };


        //#endregion animations




        return Engine3d;


    })();


    window.Engine3d = Engine3d;

    
})();