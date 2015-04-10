// Define the namespace
window.myApp = {};

(function(myApp){

    // constructor function for App
    function App(){

        // core logic to run when all
        // dependencies are loaded
        this.run = function(){

            // create an instance of our ViewModel
            var dvm = new myApp.DevicesViewModel();
            var svm = new myApp.ServicesViewModel();
            var pvm = new myApp.PortsViewModel();
            dvm.loadDevices();
            svm.loadServices();
            pvm.loadServicePorts();
            // tell Knockout to process our bindings
            ko.applyBindings(dvm, document.getElementById("deviceListView"));
            ko.applyBindings(dvm, document.getElementById("deviceView"));
            ko.applyBindings(svm, document.getElementById("ServiceSelectionView"));
            ko.applyBindings(pvm, document.getElementById("PortView"));
        }
    }

    // make sure its public
    myApp.App = App;

}(window.myApp));