/* Capture image from tab */
function captureSelection(start, end, imageUrl) {

}
/* browser action */
chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.executeScript(tab.id, {file: "capture.js"});
        chrome.tabs.insertCSS(tab.id, {file: "style.css"});
        //chrome.tabs.executeScript(tab.id, {file: "facebook.js"});
    });

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    //var startPoint = request.start;
    //var endPoint = request.end;
    //var x = startPoint.x;
    //var y = startPoint.y;
    //var width = endPoint.x - startPoint.x;
    //var height = endPoint.y - startPoint.y;
    //capture whole window of selected tab
    if (request.action === 'capture') {
        chrome.tabs.captureVisibleTab(null, function(imageUrl) {
                sendResponse({image: imageUrl}); 
            });
    }
    else if (request.action === 'activate') {
        //loop through open window to find access token redirected url 
        var redirectedUrl = null;
        console.log('here here is run');
        /*
        chrome.windows.onCreated.addListener(function(popup) {
                //record the window id. 
                var popupId = popup.id;
                console.log(popupId);
                console.log(popup);
                var popupWindow = chrome.windows.get(popupId, {populate: true}, function(windowWithTabs) {
                        var currentTab =  
                    
                    });
                while (true) { 
                    for (var i = 0; i < popup.tabs.length; i++) {
                        console.log(popup.tabs[i]);
                        if (popup.tabs[i].url.match('www.facebook.com/connect/login_success.html')) {
                            redirectedUrl = popup.tabs[i].url; 
                            break;
                        } 
                    }
                    //if successfully retrieve the url
                    if (redirectedUrl) {
                        
                        sendResponse({accessToken: redirectedUrl});
                        break;
                    }
                }
            }); 
         */   
        setTimeout(3000, function() {console.log('delay to wait for the login popup to be created');});
        chrome.windows.getAll({populate: true}, function (windows) {
                for (var i = 0; i < windows.length; i++) {
                    var w = windows[i]; 
                    console.log(w);
                    if (w.type === 'popup') {
                        console.log(w.tabs[0].url) ;  
                        //if it is facebook popup
                        var url = w.tabs[0].url;
                        if (url.indexOf('https://www.facebook.com/connect/login_success.html') != -1) {
                            var accessToken = url.match('access_token=(.*?)&')[1];
                            var expireIn = url.match('expires_in=([0-9]*)')[1];
                            console.log('accessToken ' + accessToken);
                            chrome.windows.remove(w.id, function() {console.log('closed the logged in popup');});
                            sendResponse({'accessToken': accessToken, 'expireIn': expireIn});
                        }
                    }
                } 
            });
        
    }
});


