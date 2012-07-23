/* Capture image from tab */
function captureSelection(start, end, imageUrl) {

}
/* browser action */
chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.executeScript(tab.id, {file: "capture.js"});
        chrome.tabs.insertCSS(tab.id, {file: "style.css"});
    });

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    //var startPoint = request.start;
    //var endPoint = request.end;
    //var x = startPoint.x;
    //var y = startPoint.y;
    //var width = endPoint.x - startPoint.x;
    //var height = endPoint.y - startPoint.y;
    //capture whole window of selected tab
    chrome.tabs.captureVisibleTab(null, function(imageUrl) {
            sendResponse({image: imageUrl}); 
        });
});


