/* Utils function */
function getViewableHeight() {
	return Math.max(window.innerHeight, document.body.parentNode.scrollHeight, document.body.parentNode.clientHeight);
}
function getViewableWidth() {
	return Math.max(window.innerWidth, document.body.parentNode.scrollWidth, document.body.parentNode.clientWidth);
}

//initialize currentTab Id: 
//create canvas to draw selection area
var captureCanvas = document.createElement('canvas');
captureCanvas.className = 'screen';
captureCanvas.id = 'captureCanvas';
captureCanvas.height = getViewableHeight();
captureCanvas.width = getViewableWidth();
//popup window
var capturePopup = document.createElement('div');
capturePopup.className = 'popUp';
capturePopup.style.display = 'none';
capturePopup.id = 'captureView';
capturePopup.style.width = '600px';
capturePopup.style.height = '680px';

//image holder
var imageHolder = document.createElement('div');
imageHolder.id = 'imageHolder';
imageHolder.style.width = '500px';
imageHolder.style.height = '480px';
imageHolder.align = 'center';
capturePopup.appendChild(imageHolder);
//canvas to display image
var imageDisplay = document.createElement('canvas');
imageDisplay.id = 'imageDisplay';
imageHolder.appendChild(imageDisplay);
//share toolbox
var toolbox = document.createElement('div');
toolbox.id = 'toolbox';
toolbox.style.height = '150px';
toolbox.style.width = '500px';
capturePopup.appendChild(toolbox);

//loader 
var loaderBox = document.createElement('div');
loaderBox.id = 'loader';
loaderBox.style.height = '150px';
loaderBox.style.width = '500px';
loaderBox.style.display = 'none';
var loaderNote = document.createElement('div');
loaderNote.innerText = 'Uploading image, please wait...';
loaderNote.style.width = '450px';
loaderBox.appendChild(loaderNote);
capturePopup.appendChild(loaderBox);
//caption input box
var captionContainer = document.createElement('div');
captionContainer.style.width = '450px';
var captionInput = document.createElement('textarea');
captionInput.id = 'caption';
captionInput.placeholder = 'Your caption message...'
var buttonContainer = document.createElement('div');
buttonContainer.style.width = '450px';
var shareFbButton = document.createElement('button');
shareFbButton.id = 'share-facebook';
shareFbButton.innerText = 'Upload to Facebook';

//toolbox.appendChild(captionInput);
captionContainer.appendChild(captionInput);
toolbox.appendChild(captionContainer);
//toolbox.appendChild(document.createElement('br'));
buttonContainer.appendChild(shareFbButton);
toolbox.appendChild(buttonContainer);
//bind click handler
shareFbButton.addEventListener('click', shareFacebook);
//fbLogin form
document.body.appendChild(captureCanvas);
document.body.appendChild(capturePopup);

function CaptureView() {
	this.popup = null;
	this.imageCanvas = null;
	this.show = function() {
		this.popup.style.display = 'block';
	}
	this.hide = function() {
		this.popup.style.display = 'none';
	}
	this.setImage = function(imageUrl, x, y, w, h) {
		this.imageCanvas.width = w;
		this.imageCanvas.height = h;
		//set image 
		var imgCtx = this.imageCanvas.getContext('2d');
		var imageObj = new Image();
		console.log('x ' + x + ', y ' + y + ', w ' + w + ', h' + h);
		imageObj.onload = function() {
			imgCtx.drawImage(imageObj, x, y, w, h, 0, 0, w, h);
		}
		imageObj.src = imageUrl;
	}
    this.showLoadingStatus = function() {
        this.popup.querySelector("#toolbox").style.display = 'none'; 
        this.popup.querySelector("#loader").style.display = 'block'
    }
	this.initialize = function() {
		this.popup = document.getElementById('captureView');
		//set top and left position
		var offsetTop = window.innerHeight / 2 - parseInt(this.popup.style.height) / 2 + window.scrollY;
		offsetTop = offsetTop > 0 ? offsetTop: 0;
		var offsetLeft = window.innerWidth / 2 - parseInt(this.popup.style.width) / 2 + window.scrollX;
		offsetLeft = offsetLeft > 0 ? offsetLeft: 0;
		console.log('offset top ' + offsetTop + ' - offset left ' + offsetLeft);
		this.popup.style.top = offsetTop + 'px';
		this.popup.style.left = offsetLeft + 'px';
		//set image display canvas
		this.imageCanvas = this.popup.querySelector("#imageDisplay");
	}
	this.initialize();
}

function CaptureCanvasController() {
	this.canvas = null;
	this.startPoint = null;
	this.endPoint = null;
	this.mousePressed = false;
	//handle mouse pressed when user start selection
	this.startSelection = function(startPoint) {
		this.mousePressed = true;
		this.startPoint = startPoint;
	};
	//handle mouse drag
	this.updateSelection = function(currentPoint) {
		if (!this.mousePressed) return;
		//clear old selection drawing: 
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		//draw the new selection
		var width = currentPoint.x - this.startPoint.x;
		var height = currentPoint.y - this.startPoint.y;
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		//highlight selection
		this.ctx.clearRect(this.startPoint.x, this.startPoint.y, width, height);
		this.ctx.strokeRect(this.startPoint.x, this.startPoint.y, width, height);
	};
	//handle mouse released
	this.endSelection = function(endPoint) {
		this.mousePressed = false;
		this.endPoint = endPoint;
	};

	this.initialize = function() {
		this.canvas = document.getElementById('captureCanvas');
		this.ctx = this.canvas.getContext('2d');
		this.ctx.strokeStyle = 'black';
		this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		//disable mouse scrolling
		document.body.style.overflow = 'hidden';
	}

	this.captureSelection = function() {
		//use window.scrollX, window.scrollY 
        var x = this.startPoint.captureX;
        var y = this.startPoint.captureY;
        //handle zoom 
        var zoomRatio = document.documentElement.clientWidth / document.width;
        x = x / zoomRatio;
        y = y / zoomRatio;
		var width = this.endPoint.x - this.startPoint.x;
		var height = this.endPoint.y - this.startPoint.y;
        var tempBlackOut = (function(context, canvas) {
            return function() {
                context.clearRect(0, 0, canvas.width, canvas.height); 
                context.fillStyle = 'rgba(0, 0, 0, 1)';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
        })(this.ctx, this.canvas);
		chrome.extension.sendRequest({
			action: 'capture'
		},
		function(response) {
            //black the background and popup view window
            tempBlackOut();
			captureView.setImage(response.image, x, y, width, height);
			captureView.show();
		});
	};

	this.exit = function() {
		document.body.removeChild(this.canvas);
		document.body.removeChild(captureView.popup);
		//enable scrolling
		document.body.style.overflow = 'scroll';
	}

	this.initialize();
}

//initialize the controller
var controller = new CaptureCanvasController();
var captureView = new CaptureView();
//bind event handler 
captureCanvas.onmousedown = function() {
    console.log(event.clientX + " - " + event.clientY);
	controller.startSelection({
		x: event.offsetX,
		y: event.offsetY, 
        captureX: event.clientX,
        captureY: event.clientY
	});
}
captureCanvas.onmouseup = function() {
	controller.endSelection({
		x: event.offsetX,
		y: event.offsetY,
        captureX: event.clientX,
        captureY: event.clientY
	});
}
captureCanvas.onmousemove = function() {
	controller.updateSelection({
		x: event.offsetX,
		y: event.offsetY,
        captureX: event.clientX,
        captureY: event.clientY
	});
}
document.onkeydown = function() {
	var keyId = event.keyCode;
	switch (keyId) {
	case 13:
		controller.captureSelection();
		break;
	case 27:
		controller.exit();
		break;
	}
}
//
//simulate FireFox sendAsBinary for Chrome
if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
	XMLHttpRequest.prototype.sendAsBinary = function(string) {
		var bytes = Array.prototype.map.call(string, function(c) {
			return c.charCodeAt(0) & 0xff;
		});
		this.send(new Uint8Array(bytes).buffer);
	}
}
// -------------------- FACEBOOK
// ------------------------------------------------//
function shareFacebook() {
	//request to authorization page
	var authorizeUrl = 'https://www.facebook.com/dialog/oauth?client_id=425303964177321&redirect_uri=https://www.facebook.com/connect/login_success.html&scope=publish_stream&response_type=token&display=popup';
	//send request to background  
	var popupWindow = null;
    chrome.storage.local.get(['accessToken', 'expireTime'], function(data){
            var accessToken = data.accessToken;         
            var expireTime = data.expireTime;
            var currentTime = (new Date()).getTime();
            if (accessToken && (currentTime < expireTime)) {
                getDataAndUploadToFacebook(accessToken);  
            } else {
                 chrome.extension.sendRequest({
                    'action': 'activate'
                },
                function(response) {
                    var today = new Date();
                    //calculate the future expireTime in milli second from
                    //epcho time 
                    var expireTime = today.getTime() + parseInt(response.expireIn) * 1000;
                    console.log(expireTime);
                    chrome.storage.local.clear(function() {
                        chrome.storage.local.set({'accessToken': response.accessToken, 'expireTime': expireTime});
                        });
                    getDataAndUploadToFacebook(response.accessToken);
                });

                popupWindow = window.open(authorizeUrl, "Facebook Permission", "left=" + ((window.screenX || window.screenLeft) + 10) + ",top=" + ((window.screenY || window.screenTop) + 10) + ",height=270px,width=500px,resizable=0,alwaysRaised=1");
            } 
        });
	
	}

function prepareMIMEMessage(binData, message, accessToken) {
	var boundary = '-------';
	var newLine = '\r\n';
	var blankLine = '\r\n\r\n';
	//binaryData
	var data = newLine + boundary + newLine + "Content-Disposition: form-data; name=\"source\"; filename=\"capture.png\"" + newLine + "Content-Type: image/png" + blankLine + binData;
	//form data: message
	data = data + newLine + boundary + newLine + "Content-Disposition: form-data; name=\"message\"" + blankLine + message;
	//end
	data = data + newLine + boundary + '--' + newLine;
	return data;

}
function getDataAndUploadToFacebook(fbAccessToken) {
    captureView.showLoadingStatus(); 
    var caption = captionInput.value;
	captureView.imageCanvas.toBlob(function(blob) {
		var fileReader = new FileReader();
		fileReader.onloadend = function(evt) {
			if (event.target.readyState == FileReader.DONE) {
				uploadFacebookPhoto(evt.target.result, caption, fbAccessToken);
			}
		}
		fileReader.readAsBinaryString(blob);
	},
	"image/png");
}

function uploadFacebookPhoto(imageData, caption, accessToken) {

	var photoUrl = 'https://graph.facebook.com/651244951/photos?access_token=' + accessToken;
	var xhr = new XMLHttpRequest();
	xhr.open("POST", photoUrl, true);
	xhr.setRequestHeader("Content-type", "multipart/form-data; boundary=-----")
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			console.log('successfully post the message');
            controller.exit();
		}
	};
	var data = prepareMIMEMessage(imageData, caption, accessToken);
	xhr.sendAsBinary(data);

}

