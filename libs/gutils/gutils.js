
;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.GUTILS = factory();
    }
}(this, function() {



    var GUTILS = (function() {

        

        var _clearSlashes =function(path) {
            return path.toString().replace(/\/$/, '').replace(/^\//, '');
        };
    
        var _clearFinalSlash =function(path) {
            return path.toString().replace(/\/$/, '');
        };




        var b64toBlob = function(b64Data, contentType, sliceSize) {
            
            contentType = contentType || '';
            sliceSize = sliceSize || 512;
          
            var byteCharacters = atob(b64Data);
            var byteArrays = [];
          
            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);
            
                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }
            
                var byteArray = new Uint8Array(byteNumbers);
            
                byteArrays.push(byteArray);
            }
          
            var blob = new Blob(byteArrays, {type: contentType});
            return blob;

        };


        var saveBlob = function (blob, filename) {
            var a = document.createElement("a"),
            url = URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        };  
        
        


        // ##TODO puo funzionare solo se data è un arraybuffer ...
        // capire se ha senso tenere questo metodo
        var saveFile = function (data, filename, type) {
            var file = new Blob([data], {type: type});
            if (window.navigator.msSaveOrOpenBlob) // IE10+
                window.navigator.msSaveOrOpenBlob(file, filename);
            else { // Others
                var a = document.createElement("a"),
                url = URL.createObjectURL(file);
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);  
                }, 0); 
            }
        };
        // capire le differenza con quello sopra e capire se ha senso tenere
        // var saveFile = function(content, contentType, filename) {
        //     contentType = contentType || 'text/plain';
        //     filename = filename || 'export.txt';
        //     // var blob = b64toBlob(content, contentType);
        //     var blob = new Blob([content], {type: contentType});
            
        //     var a = document.createElement("a"),
        //     url = URL.createObjectURL(blob);
        //     a.href = url;
        //     a.download = filename;
        //     document.body.appendChild(a);
        //     a.click();
        //     setTimeout(function() {
        //         document.body.removeChild(a);
        //         window.URL.revokeObjectURL(url);  
        //     }, 0); 
        // }




        // ##TODO Analizzare codice ed estrarne parti "interessanti"
        // BABYLON.Tools.LoadImage = function (url, onload, onerror, database) {          
        //     var img = new Image();        
        //     img.crossOrigin = 'anonymous';        
        //     img.onload = function () {            
        //         onload(img);        
        //     };        
        //     img.onerror = function (err) {            
        //         onerror(img, err);        
        //     };        
        //     var noIndexedDB = function () {            
        //         img.src = url;        
        //     };        
        //     var loadFromIndexedDB = function () {            
        //         database.loadImageFromDB(url, img);        
        //     };        
        //     if (database && database.enableTexturesOffline && BABYLON.Database.isUASupportingBlobStorage) {            
        //         database.openAsync(loadFromIndexedDB, noIndexedDB);        
        //     }        
        //     else {            
        //         if (url.indexOf("file:") === -1) {                
        //             noIndexedDB();            
        //         }            
        //         else {                
        //             try {                    
        //                 var textureName = url.substring(5);                    
        //                 var blobURL;                    
        //                 try {                        
        //                     blobURL = URL.createObjectURL(BABYLON.FilesTextures[textureName], { oneTimeOnly: true });                    
        //                 }                    
        //                 catch (ex) {                        
        //                     // Chrome doesn't support oneTimeOnly parameter                        
        //                     blobURL = URL.createObjectURL(BABYLON.FilesTextures[textureName]);                    
        //                 }                    
        //                 img.src = blobURL;                
        //             }                
        //             catch (e) {                    
        //                 console.log("Error while trying to load texture: " + textureName);                    
        //                 img.src = null;                
        //             }            
        //         }        
        //     }        
        //     return img;    
        // };



        // ##TODO è meglio aggiungerla come prototype o come funzione a parte ?
        // Image.prototype.load = function( url, load_callback, progress_callback, error_callback ) {
        //     var _this = this;        
        //     var xhr = new XMLHttpRequest();
        //     _this.completedPercentage = 0;
        //     xhr.open( 'GET', url , true );
        //     xhr.responseType = 'arraybuffer';
        //     xhr.onload = function( event ) {
        //         var h = xhr.getAllResponseHeaders();
        //         var m = h.match( /^Content-Type\:\s*(.*?)$/mi );
        //         var mimeType = m[ 1 ] || 'image/png';
        //         // Remove your progress bar or whatever here. Load is done.
                
        //         var blob = new Blob( [ this.response ], { type: mimeType } );
        //         _this.src = window.URL.createObjectURL(blob);
        //         if ( load_callback ) { load_callback( this ); }
        //     };
        //     xhr.onprogress = function( event ) {
        //         if ( event.lengthComputable ) {
        //             _this.completedPercentage = parseInt( ( event.loaded / event.total ) * 100 );
        //         }
        //         if ( progress_callback ) { progress_callback( _this.completedPercentage ); }

        //         // Update your progress bar here. Make sure to check if the progress value
        //         // has changed to avoid spamming the DOM.
        //         // Something like: 
        //         // if ( prevValue != thisImage completedPercentage ) display_progress();
        //     };
        //     xhr.onerror = function( event ) {
        //         if ( error_callback ) { error_callback( event ); }

        //         // Update your progress bar here. Make sure to check if the progress value
        //         // has changed to avoid spamming the DOM.
        //         // Something like: 
        //         // if ( prevValue != thisImage completedPercentage ) display_progress();
        //     };
        //     xhr.onloadstart = function() {
        //         // Display your progress bar here, starting at 0
        //         _this.completedPercentage = 0;
        //     };
        //     xhr.onloadend = function() {
        //         // You can also remove your progress bar here, if you like.
        //         _this.completedPercentage = 100;
        //     };
        //     xhr.send();
        // };

        
        var loadImage = function( url, load_callback, progress_callback, error_callback ) {

            // var _this = this;        
            // _this.completedPercentage = 0;
            var completedPercentage = 0;
    
            var xhr = new XMLHttpRequest();
    
    
            xhr.open( 'GET', url , true );
            xhr.responseType = 'arraybuffer';
    
            xhr.onload = function( event ) {
                var h = xhr.getAllResponseHeaders();
                var m = h.match( /^Content-Type\:\s*(.*?)$/mi );
                var mimeType = m[1] || 'image/png';

                console.log("mimeType", mimeType);
                console.log("xhr", this);

                if (xhr.status == "200") {
                    var blob = new Blob( [ this.response ], { type: mimeType } );
                    // _this.src = window.URL.createObjectURL(blob);
                    if ( load_callback ) { load_callback( blob, this ); }
                    
                } else {
                    if ( error_callback ) { 
                        error_callback({
                            status: xhr.status, 
                            message: xhr.statusText, 
                            // response: xhr.responseText, 
                            xhr: xhr
                        }); 
                    }
                }

                // var blob = new Blob( [ this.response ], { type: mimeType } );
                // // _this.src = window.URL.createObjectURL(blob);
                // if ( load_callback ) { load_callback( blob, this ); }
    
            };
    
            xhr.onprogress = function( event ) {
                if ( event.lengthComputable ) {
                    completedPercentage = parseInt( ( event.loaded / event.total ) * 100 );
                }
                if ( progress_callback ) { progress_callback( completedPercentage ); }
    
            };
    
            xhr.onerror = function( event ) {
                if ( error_callback ) { error_callback( event ); }
            };
    
            
            // ##TODO a cosa servono ???
            // xhr.onloadstart = function() {
            //     console.log("onloadstart");
            //     completedPercentage = 0;
            // };
            // xhr.onloadend = function() {
            //     console.log("onloadend");
            //     completedPercentage = 100;
            // };
    
            xhr.send();
        };







        //#region varie



        var noop = function() {};


        // promisifica un funzione a callback
        var __promisify = function(fn, context) {
            return function() {
                var args = Array.from(arguments);
                return new Promise(function(resolve, reject) {
                    args.push(function callback(err, data) {
                        // Per evitare warning bluebird ??
                        // if (err) { return reject(new Error(err)); }
                        if (err) { return reject(err); }
                        resolve(data);
                    });
                    fn.apply(context, args);
                });
            };
        };


        // Si vorrebbe creare una funzione che ritorni una promise quando non viene passata 
        // la callback altrimenti chiami la callback
        // ##TODO capire come fare se l'ultimo argomento della funzione dovesse essere cmq una funzione
        var __getPromiseCallback = function(fn, context) {
            return function() {
                var args = Array.from(arguments);
                var last_arg = args[args.length-1];

                if(typeof last_arg === 'function') {
                    return fn.apply(context, args);
                }

                return new Promise(function(resolve, reject) {
                    args.push(function callback(err, data) {
                        // if (err) { return reject(new Error(err)); }
                        if (err) { return reject(err); }
                        resolve(data);
                    });
                    fn.apply(context, args);
                });
            };
        };





        var isNullorUndefined = function(item) {
            return typeof item === 'undefined' || item === null;
        };


        var getUrlVars = function() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
                vars[key] = value;
            });
            return vars;
        };
        

        var getQueryVariable = function(variable) {
            var query = window.location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == variable) {
                    return decodeURIComponent(pair[1]);
                }
            }
        };
        

        JSON.stringify_pretty = function(obj) {
            return JSON.stringify(obj, null, "    ");
        };

        
        Date.prototype.addSeconds = function( secondsToAdd ) {
            var milliseconds = this.getTime();
            milliseconds += secondsToAdd*1000;
            return new Date(milliseconds);
        };

        //#endregion varie





        //#region array


        var _checkQuery = function(item, query) {
            if (!item) {
                return false;
            }
            // se è una funzione la applico come funzione filtro ad item
            if (typeof query === 'function' ) {
                return query(item);
            }
            // se è un oggetto confronto in AND le sue proprietà con l'item
            for(var key in query) {
                if (item[key] !== query[key]) {
                    return false;
                }
            }
            return true;
        };

            
        Array.prototype.findAll = function(query) {
            var result = [];
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                if (_checkQuery(item, query)) {
                    result.push(item);
                }
            }
            return result;
        };

        
        Array.prototype.findOne = function (query) {
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                if (_checkQuery(item, query)) {
                    return item;
                }
            }
            return null;
        };


        Array.prototype.updateAll = function(query, updateItem) {
            var result = [];
            for (var index = 0; index < this.length; index++) {
                var item = this[index];
                if (!_checkQuery(item, query)) {
                    result.push(item);
                } else {
                    result.push(updateItem);
                }
            }
            return result;
        };
        
        
        Array.prototype.updateOne = function(query, updateItem) {
            var result = [];
            var foundOne = false;
            for (var index = 0; index < this.length; index++) {
                var item = this[index];
                if (foundOne || !_checkQuery(item, query)) {
                    result.push(item);
                } else {
                    result.push(updateItem);
                    foundOne = true;
                }
            }
            return result;
        };

        
        Array.prototype.removeAll = function(query) {
            var result = [];
            for (var index = 0; index < this.length; index++) {
                var item = this[index];
                if (!_checkQuery(item, query)) {
                    result.push(item);
                }
            }
            return result;
        };
        

        Array.prototype.removeOne = function(query) {
            var result = [];
            var foundOne = false;
            for (var index = 0; index < this.length; index++) {
                var item = this[index];
                if (foundOne || !_checkQuery(item, query)) {
                    result.push(item);
                } else {
                    foundOne = true;
                }
            }
            return result;
        };


        //#endregion array





        //#region array_index

        var _sortStringHelper = function(a, b){
            var comparison = 0;
            if (a < b) {
                comparison = -1;
            } else if (a > b) {
                
                comparison = 1;
            }
            return comparison;
        };


        // #OLD
        // Array.prototype.createIndexMap = function(keys) {
            
        //     keys = keys
        //     .sort(function(k1, k2) {
        //         return _sortStringHelper(k1, k2);
        //     });
        
        //     var indexes = {};
        //     this.forEach(function(item, index) {
        //         var index_key = keys.map(function(key) {
        //             return item[key];
        //         }).join("");
        //         indexes[index_key] = index;
        //         // indexes[index_key] = item;
        //     });
            
        //     this.arrayIndexes = this.arrayIndexes || {}; 
        //     this.arrayIndexes[keys.join("")] = {indexes: indexes, keys: keys};
            
        //     return indexes;
            
        // };  

        



        var IndexMap = (function() {
            function IndexMap(keys, map) {
                this.keys = keys;
                this.map = map;
            }
            return IndexMap;
        })();
        // crea dall'array un indice IndexMap  e lo aggiunge all'oggetto arrayIndexes
        // indicizzato con la concatenazione delle chiavi usate per costruire l'indice
        Array.prototype.createIndexMap = function(keys) {
            
            keys = keys
            .sort(function(k1, k2) {
                return _sortStringHelper(k1, k2);
            });
            
            var map = {};
            for (var index = 0; index < this.length; index++) {
                var item = this[index];
                var index_key = "";
                for (var index_keys = 0; index_keys < keys.length; index_keys++) {
                    var key = keys[index_keys];
                    index_key += item[key];
                }
                // map[index_key] = index;
                map[index_key] = item;
            }

            // var map = {};
            // this.forEach(function(item, index) {
            //     var index_key = keys.map(function(key) {
            //         return item[key];
            //     }).join("");
            //     map[index_key] = index;
            //     // map[index_key] = item;
            // });

            // var map = this.reduce(function(acc, item, index) {
            //     var index_key = keys.map(function(key) {
            //         return item[key];
            //     }).join("");
            //     acc[index_key] = index;
            //     // acc[index_key] = item;
            //     return acc;
            // }, {});
            
            this.arrayIndexes = this.arrayIndexes || {}; 
            this.arrayIndexes[keys.join("")] = new IndexMap(keys, map);

            return map;
            
        };  

        Array.prototype.getFinder = function(keys) {

            var _thisarray = this;

            keys = keys
            .sort(function(k1, k2) {
                return _sortStringHelper(k1, k2);
            });

            var arrayIndex = this.arrayIndexes[keys.join("")];
            
            if (!arrayIndex) {
                console.warn('no index found');
                return {
                    findWithQuery: function() {}, 
                    findWithKey: function() {}, 
                    getMap: function() {},
                    getKeys: function() {}
                };        
            }

            var indexMap = arrayIndex.map;

            return {
                findWithQuery: function (query) {

                    var item_key = keys.reduce(function(acc, k) {
                        return acc + query[k];
                    }, "");
        
                    // return _thisarray[indexMap[item_key]];
                    return indexMap[item_key];
                },
                findWithKey: function (item_key) {        
                    // return _thisarray[indexMap[item_key]];
                    return indexMap[item_key];
                },
                getMap: function() {
                    return indexMap;
                },
                getKeys: function() {
                    return keys;
                }
            };

        };



        var ArrayMap = (function() {
            function ArrayMap(keys, map) {
                this.keys = keys;
                this.map = map;
            }
            return ArrayMap;
        })();
        Array.prototype.createArrayMap = function(keys) {
            
            keys = keys
            .sort(function(k1, k2) {
                return _sortStringHelper(k1, k2);
            });

            var map = this.reduce(function(acc, item) {
                var index_key = keys.map(function(key) {
                    return item[key];
                }).join("");
                acc[index_key] = item;
                return acc;
            }, {});

            return new ArrayMap(keys, map);

        }; 

        //#endregion array_index


        


        // ##OLD

        // var TimeTest = (function() {

        //     var TimeTest = function() {
        //         this._counter = 0;
        //         this._times = [];
        //         this._items = [];
        //     };

        //     TimeTest.prototype.takeTime = function(label) {
        //         this._counter ++;
        //         this._times.push( { id: this._counter, label: label, time: new Date() });
        //     };

        //     TimeTest.prototype.addItemByID = function(text, id1, id2) {
        //         var timeItem1 = this._times.findOne({id: id1});
        //         var timeItem2 = this._times.findOne({id: id2});
        //         if (timeItem1 && timeItem2) {
        //             this._items.push({ etichetta: text, tempo: timeItem1.time - timeItem2.time});
        //         }
        //     };

        //     TimeTest.prototype.addItemByLabel = function(text, label1, label2) {
        //         var timeItem1 = this._times.findOne({label: label1});
        //         var timeItem2 = this._times.findOne({label: label2});
        //         if (timeItem1 && timeItem2) {
        //             this._items.push({ etichetta: text, tempo: timeItem1.time - timeItem2.time});
        //         }
        //     };

        //     TimeTest.prototype.addItem = function(text) {
        //         if (this._timeItems.length >= 2) {
        //             this._items.push({ etichetta: text, tempo: this._times[_times.length - 1] - this._times[_times.length - 2] });
        //         }
        //     };        

        //     TimeTest.prototype.getItemsText = function() {
        //         var value = "";
        //         this._items.forEach(function(item) {
        //             value += item.etichetta + ': ' + item.tempo + '\n';
        //         });
        //         return value;
        //     };       
            
        //     return TimeTest;
        // })();
        


        // ##TODO Da rifare per browser con oggetto performance
        // e per node con oggetto process hrtime

        // per browser è possibile usare anche console.time e console.timeEnd

        var TimeTest = (function() {
            
            var TimeTest = function() {
                this._time = null;
            };
            
            TimeTest.prototype.start = function() {
                this._time = new Date();
            };

            TimeTest.prototype.get = function(label) {
                var t = new Date();
                var diff = t - this._time;
                return diff;
            };

            TimeTest.prototype.log = function(label) {
                label = label ? label + ": " : "timetest: ";
                console.log(label + this.get());
            };
                            
            return TimeTest;
        })();

        
        var Random = (function () {
            var Random = function() {  
            };
            Random.prototype.next = function (a, b) {
                if (b < a) {
                    return 0;
                }
                if (b === undefined) {
                    b = a;
                    a = 0;
                }
                return Math.floor(a + Math.random() * (b - a));
            };
            Random.prototype.nextDouble = function () {
                return Math.random();
            };
            return Random;
        })();
        

        var Timer = (function() {

            function Timer (params) {
                this._functionToCall = params.functionToCall || function() {};
                this._interval = params.interval || 1000; 
                this._limit = params.limit || 0;        
                this._running = false;
                this._elapsed = 0;        
            }
            
            var run = function() {
                var that = this;
                if (that._limit && that._elapsed > that._limit) {
                    that._running = false;
                }
                if (!that._running) {
                    return;
                }
                that._elapsed += that._interval;
                that._functionToCall();
                setTimeout(function() {
                    run.apply(that);
                }, that._interval);  
            };

            Timer.prototype.start = function() {
                this._running = true;
                run.apply(this);
            };
            Timer.prototype.stop = function() {
                this._running = false;
            };
            return Timer;

        })();

                
        var Delayer = (function() {   
            var Delayer = function() {
                this._counter = 0;
            };
            Delayer.prototype.delay = function(functionToRun, interval) {
                var _this = this;
                this._counter++;
                setTimeout(function() {
                    _this._counter--;
                    if (_this._counter <= 0) {
                        functionToRun();
                    }
                }, interval);
            };
            return Delayer;
        })();




        
        var GUIDGEN;
        (function (_this) {
        
            var _last_time = 0;
            var _last_counter = 0;
        
            var _formatCounter = function (counter) {
                var string_counter = "";
                for (var i = 0; i < 6 - counter.toString().length; i++) {
                    string_counter += "0";
                }
                string_counter += counter;
                return string_counter;
            };
        
            
            var _generate_id = function () {
        
                var d = new Date();
                var time = d.getTime();
        
                if (time === _last_time) {
                    _last_counter = _last_counter + 1;
                    _last_counter = _last_counter % 100000;
                } else {
                    _last_time = time;
                    _last_counter = 0;
                }
        
                var id = parseInt(_last_time).toString(36) + parseInt(_formatCounter(_last_counter)).toString(36);
                
                return id;
        
            };
            
            _this.generate = _generate_id;
        
            return _this;
        
        })(GUIDGEN || (GUIDGEN = {}));


        
        
        var REQUEST = (function() {
            

            var _xhr_request = function(params, callback) {
                
                var xhr = new XMLHttpRequest();
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (xhr.status == "200") {
                            callback(null, xhr.responseText);
                        } else {
                            callback({status: xhr.status, message: xhr.statusText, response: xhr.responseText, xhr: xhr}, null);
                        }
                    }
                };

                var method = params.method || 'GET';
                var url = params.url;
                var async = params.async === false ? false : true;
                var body = params.body || null;
                var headers = params.headers || {};
                
                xhr.open(method, url, async);
                
                // xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                for (var key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }
                        
                xhr.send(body);
            };


            var _head_request = function(url, callback) {
                _xhr_request({
                    method: 'HEAD',
                    url: url
                }, callback);
            };
            

            var _get_request = function(url, headers, callback) {
                _xhr_request({
                    method: 'GET',
                    url: url,
                    headers: headers
                }, callback); 
            };
            

            var _post_request = function(url, data, headers, callback) {
                _xhr_request({
                    method: 'POST',
                    url: url,
                    data: data,
                    headers: headers
                }, callback); 
            };

                        
            var _get_json = function (url, callback) {
                _xhr_request({
                    url: url
                }, function (err, result) {
                    if (err) { return callback(err); }
                    try {
                        var json = JSON.parse(result);
                        callback(null, json);
                    } catch (e) {
                        callback(e);
                    }
                });
            };
            

            return {
                xhr_request: _xhr_request,
                head: _head_request,
                get: _get_request,
                post: _post_request,
                getjson: _get_json
            };

            
        })();


        
        
        var TASK = (function() {
            /**
             * Run the `tasks` collection of functions in parallel, without waiting until
             * the previous function has completed. 
             * @name parallel
             * @param {Array} tasks - A collection of callback based functions
             * (see below example)
             * @return {Object} An object with the run method then accept a callback to run once all
             * the functions have completed (succesfully or not).
             * This function gets a results array containing all the result arguments passed to the task callbacks.
             * Invoked with (err, results).
             * 
             *
             * @example 
             * TASK.parallel([
             *     function(cb) {
             *         setTimeout(function() {
             *             cb(null, 'one');
             *         }, 200);
             *     },
             *     function(cb) {
             *         setTimeout(function() {
             *             cb(null, 'two');
             *         }, 100);
             *     }
             * ]).run(function(err, results) {
             *      if (err) { return callback(err); }
             *      var errors = results.map(r => r.error).filter(r => r !== null);       
             *      if (errors.length) { return callback('errors: ' + errors); }
             *      console.log('results', results);
             * });
             *  
             */
            var parallel = function(fns) {
                return {
                    run: function(callback) {
                        var results = [];    

                        var fns_total = fns.length;
                        var fns_done = 0;
                        
                        if (fns_total === 0) { callback(null, results); }
                        
                        fns.forEach(function(fn, index) {
                            fn.apply(null, [function(err, result) {
                                results.push({
                                    index: index,
                                    error: err,
                                    result: result
                                });
                                fns_done++;
                                if (fns_done === fns_total ) { 
                                    results.sort(function(a, b) {
                                        return a.index - b.index;
                                    });
                                    callback(null, results); 
                                }
                            }]);
                        });
                    }
                };
            };


            /**
             * @param {Array<Function>} - A collection of callback based functions
             * @return {Task} - Task object with indexed object map for results "fnMap" and array of errors "errors"
             */
            var all = function(fns) {

                var fnMap = fns.reduce(function(acc, fn, index) {
                    acc[index] = {
                        index: index,
                        result: null,
                        error: null,
                        done: false
                    };
                    return acc;
                }, {});

                return {
                    fnMap: fnMap,
                    errors: [],
                    run: function(callback) {
                        var _this = this;  

                        if (fns.length === 0) { callback(null, _this); }
                        
                        fns.forEach(function(fn, index) {
                            fn.apply(null, [function(err, result) {
                                fnMap[index].error = err;
                                fnMap[index].result = result;
                                fnMap[index].done = true;
                                
                                var completed = Object.keys(fnMap)
                                .reduce(function(acc, index) {
                                    return acc + (fnMap[index].done ? 1 : 0); 
                                }, 0);
                                
                                if (completed === fns.length ) { 
                                    _this.errors = Object.keys(fnMap)
                                    .map(function(key) { return fnMap[key].error; })
                                    .filter(function(err) { return !!err; });

                                    callback(null, _this); 
                                }
                            }]);
                        });
                    }
                };
            };

            

            // ##TODO 
            // - eventuali miglioramenti guardando il codice di async, in particolare per come gestire gli errori
            // - cosa fare in caso di errore di una callback ? 
            return {
                parallel: parallel,
                all: all
            };

        })();



        // ##TODO capire quale dei due approcci è migliore!
        // var Animation = (function() {
        //     var Animation = function(animationFn) {
        //         this._runLoop = false;
        //         this._animationFn = animationFn;
        //     };
        //     Animation.prototype._runFrame = function() {
        //         var _this = this;
        //         if (!this._runLoop) { return; }
        //         requestAnimationFrame( _this._runFrame.bind(_this) );
        //         this._animationFn();
        //     };
        //     Animation.prototype.runFrame = function() {
        //         return _runFrame.bind(this);
        //     };
        //     Animation.prototype.start = function() {
        //         this._runLoop = true;
        //         this._runFrame();
        //     };
        //     Animation.prototype.stop = function() {
        //         this._runLoop = false;
        //     };
        //     return Animation;
        // })();
        var Animation = (function() {

            var Animation = function(animationFn) {
                this._runLoop = false;
                this._animationFn = animationFn;
            };

            var _runFrame = function() {
                var _this = this;
                if (!this._runLoop) { return; }
                requestAnimationFrame( function() { _runFrame.apply(_this); } );
                this._animationFn();
            };

            Animation.prototype.runFrame = function() {
                return _runFrame.bind(this);
            };

            Animation.prototype.start = function() {
                this._runLoop = true;
                _runFrame.apply(this);
            };

            Animation.prototype.stop = function() {
                this._runLoop = false;
            };

            return Animation;

        })();



        // ha una dipendenza da Animation
        // in alternativa si potrebbe usare una getFunction da passare a requestAnimatonFrame
        var scrollto = (function() {
            

            var easings = {
                linear: function(t) {
                    return t;
                },
                easeInQuad: function(t) {
                    return t * t;
                },
                easeOutQuad: function(t) {
                    return t * (2 - t);
                },
                easeInOutQuad: function(t) {
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                },
                easeInCubic: function(t) {
                    return t * t * t;
                },
                easeOutCubic: function(t) {
                    return (--t) * t * t + 1;
                },
                easeInOutCubic: function(t) {
                    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                },
                easeInQuart: function(t) {
                    return t * t * t * t;
                },
                easeOutQuart: function(t) {
                    return 1 - (--t) * t * t * t;
                },
                easeInOutQuart: function(t) {
                    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
                },
                easeInQuint: function(t) {
                    return t * t * t * t * t;
                },
                easeOutQuint: function(t) {
                    return 1 + (--t) * t * t * t * t;
                },
                easeInOutQuint: function(t) {
                    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
                }
            };
            

            var getTimeNow = function() {
                return 'now' in window.performance ? performance.now() : new Date().getTime();
            };


            var scrollto = function(destination, duration, easing, callback) {
    
                // console.log("scrollto");
                
                duration = duration || 200;
                easing = easing || "linear";
            
                var startPosition = window.pageYOffset;
                var startTime = getTimeNow();
                
                var documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
                var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
                var destinationOffset = typeof destination === 'number' ? destination : destination.offsetTop;
                var destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
                
            
                if ('requestAnimationFrame' in window === false) {
                    window.scroll(0, destinationOffsetToScroll);
                    if (callback) { callback(); }
                    return;
                }
                
                var animation = new Animation(function() {
                    
                    var now = getTimeNow();
                    var time = Math.min(1, ((now - startTime) / duration));
                    var timeFunction = easings[easing](time);
                    window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - startPosition)) + startPosition));
                    
                    if (window.pageYOffset === destinationOffsetToScroll) {
                        if (callback) { callback(); }
                        animation.stop();
                    }
                    
                    // ##TEST capire se risolve il problema che impedisce di scrollare la pagina (riscontrato solo con la build)
                    if (now >= startTime + duration) {
                        if (callback) { callback(); }
                        animation.stop();
                    }
                    
                });
            
                animation.start();
            
            };


            return scrollto;


        })();


        
        return {
            noop: noop,
            clearFinalSlash: _clearFinalSlash,
            promisify: __promisify,


            saveFile: saveFile,
            saveBlob: saveBlob,
            b64toBlob: b64toBlob,
            loadImage: loadImage,
            
            
            getUrlVars : getUrlVars,
            TimeTest : TimeTest,
            Random : Random,
            Timer : Timer,
            Delayer: Delayer,
            GUIDGEN: GUIDGEN,
            REQUEST: REQUEST,
            TASK: TASK,
            Animation: Animation,
            scrollto: scrollto
        };
        
        
    })();

    
    return GUTILS;


}));