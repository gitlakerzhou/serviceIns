// Define the namespace
window.myApp = {
    'username':  '',
    'password': '',
    'isLogin': false};

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
    var loginState = false;
    function apiLogin(un, up){
        $.post(root+'/auth/login?' + $.now(),
            {
                j_username: un,
                j_password: up
            },
            function(data, status){
                token = data;
		myApp.isLogin = true;
		
                var app = new App();
                app.run();

            }).fail( function() {
	        login();
        });
    };
    function apiLogout(){
        $.post(root+'/auth/logout?' ,
            "",
            function(data, status){
                alert("logging out" + myApp.username);
		app = {};
            }).fail( function() {
	        alert("Failed to logging out " + myApp.username);
        });
    };

    function login() {
	if( myApp.username == '' || myApp.password == '' || myApp.isLogin == false) {
	    $( "#LoginBox" ).dialog({
	        resizable: true,
	        width:300,
	        height:220,
	        buttons: {
	            "Login": function() {
		    myApp.username = $("#uname").val();
		    myApp.password = $("#upass").val();

		    apiLogin(myApp.username, myApp.password);
                    $(this).dialog( "close" );
	            }
	        }
	    });
	} else {
	    apiLogin(myApp.username, myApp.password);
	}
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
		if (callback != null)
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
    myApp.login = login;
    myApp.apiLogout = apiLogout;
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

    $("div#tabs").tabs();   
/*$("div#tabs").tabs({
  beforeActivate: function (event, ui) {
    alert(ui.newPanel.attr('id'));
  }
});*/             
      
});
