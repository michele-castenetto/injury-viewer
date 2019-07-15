;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.ApiService = factory();
    }
}(this, function() {
    
    
    var xhrRequest = function (props, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status == "200") {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, message: xhr.statusText, xhr: xhr }, null);
                }
            }
        };
        var requestType = props.method || 'GET';
        var requestUrl = props.url;
        var requestAsync = props.async === false ? false : true;
        var requestData = props.body || null;
        // var responseType = props.responseType || null;
        var headers = props.headers || {};

        xhr.open(requestType, requestUrl, requestAsync);

        for (var key in headers) {
            xhr.setRequestHeader(key, headers[key]);
        }

        xhr.send(requestData);
    };

    
    var Response = (function () {
        function Response(props) {
            props = props || {};
            var d = new Date();
            this.time = props.time || d.toLocaleString();
            this.status = props.status || Response.OK;
            this.logout = props.logout || false;
            this.message = props.message || '';
            this.data = props.data || null;
        }

        Response.OK = 'OK';
        Response.ERROR = 'ERROR';
        Response.WARN = 'WARNING';

        return Response;
    })();


    var Request = (function () {
        function Request(props) {
            props = props || {};
            var d = new Date();
            this.time = props.time || d.toLocaleString();
            this.app_version = props.app_version || '';
            this.data = props.data || null;
        }

        return Request;
    })();


    var ApiService = (function () {

        
        function ApiService(server) {
            this.server = server || "";
            this.token = null;
        }
        
        
        ApiService.prototype.setServer = function (server) {
            this.server = server;
        };


        ApiService.prototype.setToken = function (token) {
            this.token = token;
        };


        ApiService.prototype.buildRequest = function(request) {
            return Object.assign({}, request, {
                url: this.server + "" + request.url,
                headers:  Object.assign({}, request.headers, {
                    "Content-Type": "application/json; charset=utf-8",
                    "x-access-token": this.token || ""
                }),
                body: JSON.stringify(new Request({
                    data: request.body
                }))
            });
        };
    
    
        ApiService.prototype.buildResponse = function(result) {
            result = JSON.parse(result);
            const response = new Response(result);
            if (response.status === Response.ERROR) { console.error(response); }
            return response;
        };



        ApiService.prototype.sendRequest = function(params, callback) {
            var _this = this;
            var request = this.buildRequest(params);

            xhrRequest(request, function(err, result) {
                if (err) {return callback(err);}
                var response = _this.buildResponse(result);
                callback(null, response);
            });
    
        };

        return ApiService;

    })();
    
    
    return ApiService;

}));

