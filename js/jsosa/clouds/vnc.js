// ------------------------------------------------
// ON LOAD
// ------------------------------------------------
$(function() {
    var mainSpl = document.URL.split('&url=');
    var url = mainSpl[1];
    var tmp = mainSpl[0].split("?name=")[1].split("&so=");
    var name = tmp[0];
    var so = tmp[1];
    var title = name + " (" + so.split("%20").join(" ") + ")";

    $("#vncGoesHere").attr("src", url);
    $("#novncTitle").html(title);
    document.title = title;
});