// Devices ViewModel
(function (myApp) {

    this.serviceSelectionNotice = new ko.subscribable();

    // constructor function
    function DevicesViewModel() {
        var self = this;

        // the device that we want to view/edit
        self.selectedDevice = ko.observable();
        // the device collection
        self.deviceCollection = ko.observableArray([]);

        // device list view selected item
        self.listViewSelectedItem = ko.observable(null);

        // push any changes in the list view to our  main selectedDevice
        self.listViewSelectedItem.subscribe(function (device) {
            if (device) {
                self.selectedDevice(device);
		self.resourceDashBoard(device);
            }
        });
	self.drawResDashBoardPercentage = function(context, x, y, r, name, percentage) {
            var s = 0;
            var grad = context.createRadialGradient(x, y, r * 0.95, x, y, r * 1.05);
            grad.addColorStop(0, 'red');
            grad.addColorStop(0.5, 'white');
            grad.addColorStop(1, 'red');
            var degrees = percentage * 360.0;
            var radians = degrees * (Math.PI / 180);

            context.beginPath();
            context.arc(x, y, r, s, radians, false);
            context.strokeStyle = grad;
            context.lineWidth = r * 0.4;
            context.stroke();

            s = radians;
            grad = context.createRadialGradient(x, y, r * 0.95, x, y, r * 1.05);
            grad.addColorStop(0, 'green');
            grad.addColorStop(0.5, 'white');
            grad.addColorStop(1, 'green');
            degree = (1 - percentage) * 360.0;
            radians = 360 * (Math.PI / 180);

            context.beginPath();
            context.arc(x, y, r, s, radians, false);
            context.strokeStyle = grad;
            context.stroke();

            //TODO:take the font and size to CSS
            context.font = "10px Comic Sans MS";
            context.fillStyle = "blue";
            context.textAlign = "center";
            context.fillText(percentage * 100 + '%', x, y+5);
            context.font = "12px Comic Sans MS";
            context.fillText(name, x, y + r + 18);
        };

        self.resourceDashBoard = function (sDevice) {
             var canvas = document.getElementById('DevRes');
             var context = canvas.getContext('2d');

             var r = canvas.width/6-10;
             var y = 15;
	     context.font = "12px Comic Sans MS";
            context.fillStyle = "blue";
            context.textAlign = "left";
            context.fillText('Status:', 5, y);
		context.fillText(sDevice.status, 65, y);
            context.fillText('Admin IP:', 5, y+30);
                context.fillText(sDevice.ip, 65, y+30);
		y = canvas.width/6 + 60;

             self.drawResDashBoardPercentage(context,
                 canvas.width/6+3, y, r, 'CPU',
                 sDevice.cpuUsage);
             self.drawResDashBoardPercentage(context,
                 canvas.width/2, y, r, 'RAM',
                 sDevice.ramUsage);
             self.drawResDashBoardPercentage(context,
                 canvas.width * 5/6-3, y, r, 'DISK',
                 sDevice.diskUsage);

        };
	self.populateDevices = function (devices) {
	    for (var idx in devices) {
                // create a new instance of a Device
                var d = Object.create(myApp.Device).withInstanceCopy(
                            devices[idx].key,
                            devices[idx].displayName,
                            devices[idx].adminIPAddress,
                            devices[idx].readyStatus,
                            devices[idx].location.displayName,
                            0,0,0);
                console.log(d);
                self.selectedDevice(d);

                if (!d) {
                    return;
                }

                // check to see that the device
                // doesn't already exist in our list
                if (self.deviceCollection.indexOf(d) > -1) {
                    return;
                }

                // add the device to the collection
                self.deviceCollection.push(d);
                //self.selectedDevice(null);
            }
	
        };

        // creates a new device and sets it up for editing
        self.loadDevices = function () {
            myApp.apiGet('/physicalDevices/list', function(){self.populateDevices(this)});
        };

        // logic that is called whenever a user is done editing a device or done adding a device
        self.doneEditingDevice = function () {
            // get a reference to our currently selected device
            var p = self.selectedDevice();

            // ignore if it is null
            if (!p) {
                return;
            }

            // check to see that the device
            // doesn't already exist in our list
            if (self.deviceCollection.indexOf(p) > -1) {
                return;
            }

            // add the device to the collection
            self.deviceCollection.push(p);

            // clear out the selected device
            self.selectedDevice(null);
        };

        // logic that removes the selected device from the collection
        self.removeDevice = function () {
            // get a reference to our currently selected device
            var p = self.selectedDevice();

            // ignore if it is null
            if (!p) {
                return;
            }

            // empty the selectedDevice
            self.selectedDevice(null);

            // simply remove the item from the collection
            return self.deviceCollection.remove(p);
        };
        return this;
    }
    function ServicesViewModel() {
            var self = this;

            // the device that we want to view/edit
            self.selectedService = ko.observable();
            self.selectedService.subscribe(function(newValue) {
                serviceSelectionNotice.notifySubscribers(newValue, "SelectedService");
            });


            self.selectedImage = ko.observable();

            // the device collection
            self.ServiceCollection = ko.observableArray([]);

            // the available image collection
             self.ImageCollection = ko.observableArray([]);

            // services list view selected item
            self.listViewSelectedService = ko.observable(null);

            // services list view selected item
            self.listViewSelectedImage = ko.observable(null);

            // push any changes in the list view to our main selectedService
            self.listViewSelectedService.subscribe(function (service) {
                if (service) {
                    self.selectedService(service);
                    self.ImageCollection(service.imageOption);
                }
            });

            // push any changes in the list view to our main selectedServiceImage
            self.listViewSelectedImage.subscribe(function (image) {
                if (image) {
                    self.selectedImage(image);
                }
            });

            self.createService = function (vnfData) {
                    var s = Object.create(myApp.Service).withInstanceCopy(
                                vnfData.displayName,
                                vnfData.portNames,
                                vnfData.availableCustomOptimizations,
                                vnfData.key);

                    if (!s) {
                        return;
                    }

                    // check to see that the service doesn't already exist in our list
                    if (self.ServiceCollection.indexOf(s) > -1) {
                        return;
                    }

                    // add the device to the collection
                    self.ServiceCollection.push(s);
                    console.log(s);
            };
	    self.populateServices = function(services) {
                for (var idx in services) {
                    // create a new instance of a service
                    self.createService(services[idx]);
                }
	    };

            // creates a new service and sets it up for editing
            self.loadServices = function () {
		myApp.apiGet('/centralOfficeCompositeVNFTypes/list', function(){
			self.populateServices(this);
		});
		myApp.apiGet('/centralOfficeVirtualNetworkFunctionTypes/list', function(){
                        self.populateServices(this);
                });
            };

            // logic that is called whenever a user is done editing
            // a device or done adding a device
            self.doneEditingService = function () {
                // get a reference to our currently selected device
                var p = self.selectedService();

                // ignore if it is null
                if (!p) {
                    return;
                }

                // check to see that the device
                // doesn't already exist in our list
                if (self.ServiceCollection.indexOf(p) > -1) {
                    return;
                }

                // add the device to the collection
                self.ServiceCollection.push(p);

                // clear out the selected device
                self.selectedService(null);
            };

            // logic that removes the selected device
            // from the collection
            self.removeService = function () {
                // get a reference to our currently selected device
                var p = self.selectedService();

                // ignore if it is null
                if (!p) {
                    return;
                }

                // empty the selectedDevice
                self.selectedService(null);

                // simply remove the item from the collection
                return self.ServiceCollection.remove(p);
            };
            return this;
        };
    function PortsViewModel() {
            var self = this;

            // non editable data
            self.state = {NOTUSED:"Available",CONNECTED:"Connected",CONFIGURED:"Configured",USED:"InService"};

            self.connOptions = ko.observableArray(['ServicePort', 'ExternalPort']);
            self.type = {SRV:"ServicePort", PHY:"PhysicalPort"};

            // the device collection
            self.ServicePortCollection = ko.observableArray([]);
            self.physicalPortCollection = ko.observableArray([]);
            self.serviceTemplate = ko.observable("select a service template");
            serviceSelectionNotice.subscribe(function(newValue) {
                self.serviceTemplate(newValue);
                console.log(newValue);
                self.ServicePortCollection(self.reloadServicePorts(newValue));
            }, self, "SelectedService");

            // creates a new service and sets it up for editing
            self.reloadServicePorts = function (vnfTemp) {
                var sPorts = [];

                for (var idx in vnfTemp.ports) {
                    var sp = Object.create(myApp.Port).withInstanceCopy(
                        idx,
                        vnfTemp.ports[idx],
                        null,
                        self.type.SRV);
                    //console.log(sp);

                    if (!sp) {
                        continue;
                    }

                    // check to see that the service doesn't already exist in our list
                    if (sPorts.indexOf(sp) > -1) {
                        continue;
                    }

                    // add the device to the collection
                    sPorts.push(sp);
                    //self.ServicePortCollection[idx].valueHasMutated();
                    //console.log(sp);
                }
                return sPorts;
            };
            return this;
        };

    function masterVM(){
        var self = this;
        self.ServicesViewModel = new ServicesViewModel();
        self.DevicesViewModel  = new DevicesViewModel();
        self.PortsViewModel    = new PortsViewModel();
        self.ServicesViewModel.loadServices();
        self.DevicesViewModel.loadDevices();
        //self.PortsViewModel.loadServicePorts();
        ko.applyBindings(self.DevicesViewModel, document.getElementById("deviceListView"));
        ko.applyBindings(self.DevicesViewModel, document.getElementById("deviceView"));
        ko.applyBindings(self.ServicesViewModel, document.getElementById("ServiceSelectionView"));
        ko.applyBindings(self.PortsViewModel, document.getElementById("PortView"));
        return this;
    };
    myApp.MasterVM = masterVM;
} (window.myApp));
