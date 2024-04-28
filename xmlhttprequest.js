(function(xhr) {

    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function(method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = (new Date()).toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function(header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function(postData) {

        this.addEventListener('load', function() {
            var myUrl = this._url ? this._url.toLowerCase() : this._url;
            if(myUrl) {

                if (postData) {
                    if (typeof postData === 'string') {
                        try {
                            this._requestHeaders = postData;    
                        } catch(err) {
                            console.log('Request Header JSON decode failed, transfer_encoding field could be base64');
                            console.log(err);
                        }
                    }
                }

                // var responseHeaders = this.getAllResponseHeaders();

                if ( this.responseType == "" || this.responseType == "text") {
                    try {
                        let response = JSON.parse(this.responseText);
                        window.postMessage([this._url, response, this._requestHeaders]);
                    } catch(err) {
                        if (!err.name.includes("SyntaxError")) {
                            console.log("Error in responseType try catch");
                            console.log(err);
                        }
                    }
                }
            }
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);