// Define the namespace
window.myApp = {};

(function(myApp){

    // constructor function for App
    function App(){

        // core logic to run when all
        // dependencies are loaded
        this.run = function(){

            // create an instance of our ViewModel
            var vm = new myApp.MasterVM();
        }
    }

    // make sure its public
    myApp.App = App;

    var root = "/osa";
    var token = '';
    function apiLogin(){
        $.post(root+'/auth/login?' + $.now(),
            {
                j_username: "admin",
                j_password: "admin"
            },
            function(data, status){
                token = data;
            });
    };
    function apiPost(path, input, callback){
        /*$.post(root + '/api' + path, input,
            function(data, status){
                callback.call(data);
            }).fail( function() {
	    alert("API call failed: "+ path);
        });*/
	$.ajax({
	  type: "POST",
	  url: root + '/api' + path,
	  data: input,
	  success: function(data, status){
                callback.call(data);
            },
	  contentType: 'application/json', 
	  processData: false,
	  beforeSend: function(x, s) {
                //osa.ajax.showLoadingBar();
                s.data = (s.data) ? JSON.stringify(s.data) : null;
            }
	});
    };
    function apiGet(path, callback) {
        $.get(root + '/api' + path,
            function(data) {
                   callback.call(data);
        }).fail( function() {
	    console.log("API call failed: "+ path);
        });
    };
    myApp.apiLogin = apiLogin;
    myApp.apiPost = apiPost;
    myApp.apiGet = apiGet;
    }

(window.myApp));


$(document).ready(function()
{
    $(".defaultText").focus(function(srcc)
    {
        if ($(this).val() == $(this)[0].title)
        {
            $(this).removeClass("defaultTextActive");
            $(this).val("");
        }
    });
    
    $(".defaultText").blur(function()
    {
        if ($(this).val() == "")
        {
            $(this).addClass("defaultTextActive");
            $(this).val($(this)[0].title);
        }
    });
    
    $(".defaultText").blur();        
});
