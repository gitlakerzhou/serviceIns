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
    }
    function apiGet(path, callback) {
        $.get(root + '/api' + path,
            function(data) {
                   callback.call(data);
        }).fail( function() {
	    console.log("API call failed: "+ path);
        });
    }
    myApp.apiLogin = apiLogin;
    myApp.apiGet = apiGet;
    }

(window.myApp));
