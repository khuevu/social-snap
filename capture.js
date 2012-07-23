/* Utils function */
function getViewableHeight() {
    return Math.max(window.innerHeight, document.body.parentNode.scrollHeight, document.body.parentNode.clientHeight);
}
function getViewableWidth() {
    return Math.max(window.innerWidth, document.body.parentNode.scrollWidth, document.body.parentNode.clientWidth);
}
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
capturePopup.style.height = '700px';
//image holder
var imageHolder = document.createElement('div');
imageHolder.id = 'imageHolder';
imageHolder.style.width = '500px';
imageHolder.style.height = '500px';
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

debugger;

document.body.appendChild(captureCanvas);
document.body.appendChild(capturePopup);
//document.body.appendChild(imageTest);

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
    this.initialize = function() {
        this.popup = document.getElementById('captureView'); 
        //set top and left position
        var offsetTop = window.innerHeight / 2 - parseInt(this.popup.style.height) / 2 + window.scrollY;
        offsetTop = offsetTop > 0 ? offsetTop : 0;
        var offsetLeft = window.innerWidth / 2 - parseInt(this.popup.style.width) / 2 + window.scrollX;
        offsetLeft = offsetLeft > 0 ? offsetLeft : 0; 
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
        if (!this.mousePressed)
            return;
        //clear old selection drawing: 
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //draw the new selection
        var width = currentPoint.x - this.startPoint.x;
        var height = currentPoint.y - this.startPoint.y;
        //console.log("start: " + this.startPoint.x + " - " + this.startPoint.y + " width, height: " + width + " - " + height);
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
        this.ctx.strokeStyle = 'yellow';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        //disable mouse scrolling
        document.body.style.overflow = 'hidden';
    }

    this.captureSelection = function() {
        //TODO: calculate offest from window view
        //use window.scrollX, window.scrollY 
        var x = this.startPoint.x - window.scrollX;
        var y = this.startPoint.y - window.scrollY;
        var width = this.endPoint.x - this.startPoint.x;
        var height = this.endPoint.y - this.startPoint.y;
        //send start and end points coo)dinate to background process
        chrome.extension.sendRequest({action: 'capture'}, function(response) {
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
    controller.startSelection({x: event.offsetX, y: event.offsetY}); 
}
captureCanvas.onmouseup = function() {
    controller.endSelection({x: event.offsetX, y: event.offsetY});
} 
captureCanvas.onmousemove = function() {
    controller.updateSelection({x: event.offsetX, y: event.offsetY});
}
document.onkeydown = function() {
    var keyId = event.keyCode; 
    console.log('Key ID ' + keyId);
    switch(keyId) {
        case 13: controller.captureSelection();
            break;
        case 27: controller.exit();
            break;
    }
}
