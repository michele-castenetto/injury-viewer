(function() {
    

    var GUIDGEN = GUTILS.GUIDGEN;


    var _computeMeshBoundingInfo = function(scene, mesh) {
        
        if (!mesh) { console.error('No mesh provided in _computeMeshBoundingInfo'); return null; }
        var meshes = mesh.getChildMeshes();
        meshes.push(mesh);
        
        var min = new BABYLON.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        var max = new BABYLON.Vector3(- Number.MAX_VALUE, - Number.MAX_VALUE, - Number.MAX_VALUE);

        for (var i = 0; i <= meshes.length; i++) {
            var currentMesh = meshes[i];

            if (!currentMesh) { continue; }
            
            // ##NOTA Necessario per mesh clonate o mesh a cui sono state applicate trasformazioni
            currentMesh.computeWorldMatrix(true);

            var bounds = currentMesh.getBoundingInfo();
            var minimum = bounds.boundingBox.minimumWorld;
            var maximum = bounds.boundingBox.maximumWorld;

            if (minimum.x < min.x) min.x = minimum.x;
            if (minimum.y < min.y) min.y = minimum.y;
            if (minimum.z < min.z) min.z = minimum.z;
            if (maximum.x > max.x) max.x = maximum.x;
            if (maximum.y > max.y) max.y = maximum.y;
            if (maximum.z > max.z) max.z = maximum.z;
        }
        var boundingInfo = new BABYLON.BoundingInfo(min, max);

        return boundingInfo;
    };


    var _createMeshBoundingBox = function(scene, mesh) {

        var boundingInfo = _computeMeshBoundingInfo(scene, mesh);

        var size = boundingInfo.maximum.subtract(boundingInfo.minimum);

        var bounding_material = scene.getMaterialByName("mat_boundingbox");

        if (!bounding_material) {
            bounding_material = new BABYLON.StandardMaterial('mat_boundingbox', scene);
            bounding_material.wireframe = true;
        }
        var boundingMesh = BABYLON.MeshBuilder.CreateBox( mesh.id + '__boundingMesh', { width: size.x, height: size.y, depth: size.z }, scene);
        boundingMesh.material = bounding_material;
        boundingMesh.isVisible = false;

        return boundingMesh;

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


        Engine3d.prototype.setWheelPrecision = function(value) {
            value = value || 100;
            var camera = this.scene.activeCamera;
            camera.wheelPrecision = value;
        };

        


        //#endregion metodi_init


        
        
        //#region metodi_load


        Engine3d.prototype.loadImage = function(url, callback) {

            var m = new BABYLON.Material('', this.scene);

            m.isReady();

            BABYLON.Tools.LoadImage(
                url, 
                function(image) {
                    callback(null, image);
                },
                function(error) {
                    callback(error);
                }
            );
        };


        Engine3d.prototype.loadTexture = function(url, callback) {
            var texture = new BABYLON.Texture(
                url, 
                this.scene,  
                false, 
                true, 
                // BABYLON.Texture.BILINEAR_SAMPLINGMODE,
                // BABYLON.Texture.NEAREST_SAMPLINGMODE,
                BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                function() {
                    callback(null, texture);
                },
                function(error) {
                    callback(error);
                },
                null,
                true
            );
        };

    

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




        Engine3d.prototype.enableEdges = function(rootmesh, includeChilds, params) {
            params = params || {};

            // var edgesWidth = params.edgesWidth || 1.5;
            var edgesWidth = params.edgesWidth || 0.5;
            var edgesColor = params.edgesColor || new BABYLON.Color4.FromInts(255, 164, 32, 255);

            if (rootmesh.geometry) {
                rootmesh.enableEdgesRendering();
                rootmesh.edgesWidth = edgesWidth;  
                rootmesh.edgesColor = edgesColor;
            }

            if (includeChilds !== true) { return; }

            var meshes = rootmesh.getChildMeshes();
            meshes.forEach(function(mesh) {
                if(mesh.geometry && mesh.getBoundingInfo().boundingSphere.radius > 0.1) {
                    mesh.enableEdgesRendering();
                    mesh.edgesWidth = edgesWidth; 
                    mesh.edgesColor = edgesColor; 
                }
            });

        };

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






        Engine3d.prototype.createMeshBoundingBox = function(mesh) {
            return _createMeshBoundingBox(this.scene, mesh);
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



        // BABYLON.Mesh.prototype.getSize = function() {
        //     this.refreshBoundingInfo();
        //     var boundingInfo = this.getBoundingInfo();
        //     var minimumWorld = boundingInfo.boundingBox.minimumWorld;
        //     var maximumWorld = boundingInfo.boundingBox.maximumWorld;
        //     var size = maximumWorld.subtract(minimumWorld);
        //     return size;
        // };
        

        // BABYLON.Mesh.prototype.createBoundingBox = function() {
        //     var scene = this.getScene();
        //     return _createMeshBoundingBox(scene, this);
        // };
        
        // BABYLON.Mesh.prototype.translatePivot = function(translation) {
        //     this.setPivotPoint(new BABYLON.Vector3(translation.x, translation.y, translation.z));
        // };

        // BABYLON.Mesh.prototype.setPosition = function(point) {
        //     point = point || {};
        //     var startPoint = this.getAbsolutePosition();
        //     var x = point.x !== undefined ? point.x : startPoint.x;
        //     var y = point.y !== undefined ? point.y : startPoint.y;
        //     var z = point.z !== undefined ? point.z : startPoint.z;
        //     var position = new BABYLON.Vector3(x, y, z);
        //     this.position = position;
        // };
        
        // BABYLON.Mesh.prototype.move = function(point) {
        //     var startPoint = this.getAbsolutePosition();
        //     var x = point.x !== undefined ? point.x : startPoint.x;
        //     var y = point.y !== undefined ? point.y : startPoint.y;
        //     var z = point.z !== undefined ? point.z : startPoint.z;
        //     var targetPoint = new BABYLON.Vector3(x, y, z);
        //     var diff = targetPoint.subtract(startPoint);
        //     this.position.addInPlace(diff);
        // };
        // BABYLON.Mesh.prototype.translate = function(point) {
        //     var x = point.x !== undefined ? point.x : 0;
        //     var y = point.y !== undefined ? point.y : 0;
        //     var z = point.z !== undefined ? point.z : 0;
        //     var translation = new BABYLON.Vector3(x, y, z);
        //     this.position.addInPlace(translation);
        // };
        // BABYLON.Mesh.prototype.scale = function(scaling) {
        //     if (typeof scaling === "number") {
        //         scaling = new BABYLON.Vector3(scaling, scaling, scaling);
        //     }
        //     this.scaling = scaling;
        // };
        // BABYLON.Mesh.prototype.rotateX = function(angle) {
        //     // var quaternion = new BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, BABYLON.Tools.ToRadians(angle));
        //     // this.rotationQuaternion = quaternion;
        //     angle = BABYLON.Tools.ToRadians(angle);
        //     this.rotate(BABYLON.Axis.X, angle, BABYLON.Space.LOCAL);
        // };
        // BABYLON.Mesh.prototype.rotateY = function(angle) {

        //     angle = BABYLON.Tools.ToRadians(angle);
        //     this.rotate(BABYLON.Axis.Y, angle, BABYLON.Space.LOCAL);
        // };
        // BABYLON.Mesh.prototype.rotateZ = function(angle) {
        //     angle = BABYLON.Tools.ToRadians(angle);
        //     this.rotate(BABYLON.Axis.X, angle, BABYLON.Space.LOCAL);
        // };

        
        // BABYLON.Mesh.prototype.hide = function(filter_func) {
        //     this.getChildMeshes(false, filter_func)
        //     .forEach(function(childmesh) {
        //         childmesh.isVisible = false;
        //     });
        //     this.isVisible = false;
        // };
        // BABYLON.Mesh.prototype.show = function(filter_func) {
        //     this.getChildMeshes(false, filter_func)
        //     .forEach(function(childmesh) {
        //         childmesh.isVisible = true;
        //     });
        //     this.isVisible = true;
        // };







        Engine3d.prototype.getMesh = function(name) {
            var mesh = this.scene.getMeshByName(name);
            return mesh;
        };
        Engine3d.prototype.removeMesh = function(mesh) {
            if(!mesh) {
                return;
            }
            mesh.dispose();
        };
        Engine3d.prototype.removeMeshByName = function(name) {
            var scene = this.scene;
            var mesh = scene.getMeshByName(name);
            this.removeMesh(mesh);
        };
        
        Engine3d.prototype.removeMeshes = function(rootMesh) {
            var _this = this;
            var meshes = [];
            if (rootMesh === null) {
                return;
            }
            if (rootMesh === undefined) {
                meshes = this.scene.meshes;
            } else {
                meshes = rootMesh.getChildMeshes();
                meshes.push(rootMesh);
            }
            meshes.forEach(function(mesh) {
                _this.scene.removeMesh(mesh);
            });
        };


        Engine3d.prototype.hideMesh = function(mesh) {
            if (!mesh) {
                return;
            }
            mesh.getChildMeshes().forEach(function(childmesh) {
                childmesh.isVisible = false;
            });
            mesh.isVisible = false;
        };   
        Engine3d.prototype.showMesh = function(mesh) {
            if (!mesh) {
                return;
            }
            mesh.getChildMeshes().forEach(function(childmesh) {
                childmesh.isVisible = true;
            });
            mesh.isVisible = true;
        };

        //#endregion metodi_mesh




        //#region tools


        
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