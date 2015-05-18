// Devices ViewModel
(function (myApp) {

    this.serviceSelectionNotice = new ko.subscribable();
    this.deviceSelectionNotice = new ko.subscribable();

    // constructor function
    function DevicesViewModel() {
        var self = this;
        var aRam = 0;
	var aDisk = 0;
	var aCpu = 0;
        var tRam = 0;
	var tDisk = 0;
	var tCpu = 0;
        // the device that we want to view/edit
        self.device = null;
        self.selectedDevice = ko.observable(null);
        self.selectedDevice.subscribe(function(newValue) {
                console.log("change the selected device");
                deviceSelectionNotice.notifySubscribers(newValue, "SelectedDevice");
            });


        // the device collection
        self.deviceCollection = ko.observableArray([]);

        // device list view selected item, reflect user's selection at UI
        self.listViewSelectedItem = ko.observable(null);

        // push any changes in the list view to our  main selectedDevice
        // update both device and selectedDevice together
        self.listViewSelectedItem.subscribe(function (device) {
	    console.log(device);
            console.log(self.device);
	    console.log(self.selectedDevice());
            if (device) {
                self.selectedDevice(device);
                self.device = device;
		self.getResourceUsage(device);
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
	self.getAvailableResources = function(availableRsource) {
		console.log(availableRsource);
		tRam = availableRsource.totalRam;
		tDisk = availableRsource.totalDiskspace;
		tCpu = availableRsource.totalVirtualCPUCount;
		console.log(tRam);
		self.device.ramUsage = ko.observable(((tRam - availableRsource.availableRam)/tRam).toFixed(3));
		self.device.cpuUsage = ko.observable(((tCpu - availableRsource.availableVirtualCPUCount)/tCpu).toFixed(3));
		self.device.diskUsage = ko.observable(((tDisk -  availableRsource.availableDiskspace)/tDisk).toFixed(3));
		//self.selectedDevice(self.device);
		self.resourceDashBoard(self.device);
		console.log(self.device);
		console.log(self.selectedDevice());
	}

        self.getActiveResources = function(COResourceList) {
	    console.log(COResourceList);
	    for (var cor in COResourceList) {
		var cons = COResourceList[cor].computeNodeResources;
		for (var con in cons) {
		console.log(cons[con]);
		console.log( self.device);
		console.log( self.selectedDevice() );
		if ((cons[con].displayName == self.device.description) || 
			(cons[con].displayName == 'ensemble' && self.device.description == 'CO_6500')) {
			for (var vnfi in cons[con].vnfInstanceResources) {
			    aRam += cons[con].vnfInstanceResources[vnfi].totalRam;
			    aCpu += cons[con].vnfInstanceResources[vnfi].totalVirtualCPUCount;
			    aDisk += cons[con].vnfInstanceResources[vnfi].totalDiskspace;
			}
			//need to get clound id somewhere 
			myApp.apiGet('/availableResources/list/'+self.device.COKey+'/2/'+cons[con].key, function(){self.getAvailableResources(this)});
		}
		}		
	    }
	};
	self.getResourceUsage = function(device) {
		myApp.apiGet('/activeResources/list/'+device.COKey, function(){self.getActiveResources(this)});
	}

        self.resourceDashBoard = function (sDevice) {
             var canvas = document.getElementById('DevRes');
             var context = canvas.getContext('2d');
		context.clearRect ( 0 , 0 , canvas.width, canvas.height );

             var r = canvas.width/6-10;
             var y = 15;
	    console.log(sDevice);
	     context.font = "12px Comic Sans MS";
            context.fillStyle = "blue";
            context.textAlign = "left";
            context.fillText('Status:', 5, y);
		context.fillText(sDevice.status(), 65, y);
            context.fillText('Admin IP:', 5, y+30);
                context.fillText(sDevice.ip(), 65, y+30);
		y = canvas.width/6 + 60;
	    console.log("uage:"+sDevice.cpuUsage()+' '+sDevice.ramUsage());
             self.drawResDashBoardPercentage(context,
                 canvas.width/6+3, y, r, 'CPU',
                 sDevice.cpuUsage());
             self.drawResDashBoardPercentage(context,
                 canvas.width/2, y, r, 'RAM',
                 sDevice.ramUsage());
             self.drawResDashBoardPercentage(context,
                 canvas.width * 5/6-3, y, r, 'DISK',
                 sDevice.diskUsage());

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
                            0,0,0,
			    devices[idx].portCollection,
			    devices[idx].centralOfficeKey);
                console.log(d);
		//self.device = d;
                //self.selectedDevice(d);

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

        // load list of physical devices 
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
    function ServicePortsViewModel() {
            var self = this;

            // non editable data
            self.state = {NOTUSED:"Available",CONNECTED:"Connected",CONFIGURED:"Configured",USED:"InService"};

            self.connOptions = ko.observableArray(['ServicePort', 'ExternalPort']);
            self.type = {SRV:"ServicePort", PHY:"PhysicalPort"};

            // the device collection
            self.ServicePortCollection = ko.observableArray([]);
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
    function convertToObservable(list) 
        { 
           var newList = []; 
           console.log(list);
           $.each(list, function (i, obj) {
            var newObj = {}; 
            Object.keys(obj).forEach(function (key) { 
                newObj[key] = ko.observable(obj[key]); 
            }); 
            newList.push(newObj); 
            }); 
            return newList; 
        };
    function PhysicalPortsViewModel() {
            var self = this;

            // non editable data
            self.state = {NOTUSED:"Available",CONNECTED:"Connected",CONFIGURED:"Configured",USED:"InService"};

            self.connOptions = ko.observableArray(['NoPeer','SrvPort', 'Site', 'PhyPort']);
            self.type = {SRV:"SrvPort",PHY:"PhyPort",SITE:"Site"};

            // the device collection
            self.PhysicalPortCollection = ko.observableArray([]);
            
            self.device = null;
            self.deviceV = ko.observable(self.device);
            self.ports = [];
            deviceSelectionNotice.subscribe(function(newValue) {
                self.device = newValue;
	        console.log(newValue);
		self.PhysicalPortCollection.removeAll();
                self.ports = self.reloadPhysicalPorts(newValue);
                                
                for (var p in self.ports) {
                    self.loadSites(self.device.id, self.ports[p].key);
                }

            }, self, "SelectedDevice");

            // creates a new service and sets it up for editing
            self.reloadPhysicalPorts = function (dev) {
                var ports = [];

                for (var idx in dev.ports) {
                    var sp = Object.create(myApp.Port).withInstanceCopy(
                        dev.ports[idx].key,
                        dev.ports[idx].displayName,
                        null,
                        self.type.PHY);
                    //console.log(sp);


                    if (!sp) {
                        continue;
                    }

                    // check to see that the service doesn't already exist in our list
                    if (ports.indexOf(sp) > -1) {
                        continue;
                    }

                    // add the device to the collection
                    self.PhysicalPortCollection.push(sp);
                    ports.push(sp);
                }
                console.log(ports);
                //ports = convertToObservable(ports);
                return ports;
            };

            self.siteInfoUpdate = function (site) {
                if (site.length > 0) {
                    var port_key = site[0].portKey;
                    var dev_key  = site[0].deviceKey;
                    var bwps     = site[0].siteBandwidthProfileCollection;
		    var bwpsIn = '';
		    var bwpsOut = '';
                    for (var b in bwps) {
			if (bwps[b].bandwidthDirection == "Unknown") {
				bwpsIn = bwps[b].displayName;
				bwpsOut = bwps[b].displayName;
			} else if (bwps[b].bandwidthDirection == "Ingress") {
				bwpsIn = bwps[b].displayName;
			} else if (bwps[b].bandwidthDirection == "Egress") {
				bwpsOut = bwps[b].displayName;
			}

		    }

                    console.log(bwpsIn + bwpsOut);
                    if (self.device.id == dev_key) {
                        console.log(self.type);
                        for (var p in self.ports) {
                            if (self.ports[p].key == port_key) {
                                self.PhysicalPortCollection.remove(function(pt) {return pt.key == port_key});
                                self.ports[p].connToType = ko.observable(self.type.SITE);
                                self.ports[p].siteName = ko.observable(site[0].displayName);
				
				for (var v in site[0].vlanInfoCollection) {
					if (site[0].vlanInfoCollection[v].vlanDirection == "Ingress") {
						self.ports[p].siteInOp = ko.observable(site[0].vlanInfoCollection[v].vlanOperation);
						self.ports[p].siteInTag = ko.observable(site[0].vlanInfoCollection[v].vlanTagType);
						self.ports[p].siteInValue = ko.observable(site[0].vlanInfoCollection[v].vlanValue);
						self.ports[p].siteInTag = ko.observable(site[0].vlanInfoCollection[v].vlanTagType);
						self.ports[p].siteInBwp = ko.observable(bwpsIn);
					}
					if (site[0].vlanInfoCollection[v].vlanDirection == "Egress") {
						self.ports[p].siteOutOp = ko.observable(site[0].vlanInfoCollection[v].vlanOperation);
						self.ports[p].siteOutTag = ko.observable(site[0].vlanInfoCollection[v].vlanTagType);
						self.ports[p].siteOutValue = ko.observable(site[0].vlanInfoCollection[v].vlanValue);
						self.ports[p].siteOutTag = ko.observable(site[0].vlanInfoCollection[v].vlanTagType);
						self.ports[p].siteOutBwp = ko.observable(bwpsOut);
					}

				}
                                //self.ports[p].siteInOp = ko.observable(site[0].
                                self.PhysicalPortCollection.push(self.ports[p]);
				//self.PhysicalPortCollection.sort(function(left, right) {
				//	return left.pname == right.pname ? 0 : (left.pname < right.pname ? -1 : 1)
				//});
                            }
                        }
                    }
                }
            };
 
	    //load site on the physical device
            self.loadSites = function (dev_key, port_key) {
                var sites = myApp.apiGet('/sites/list/'+dev_key+'/'+port_key, function(){self.siteInfoUpdate(this)});
            };
            return this;
        };

    function masterVM(){
        var self = this;
        self.ServicesViewModel = new ServicesViewModel();
        self.DevicesViewModel  = new DevicesViewModel();
        self.ServicePortsViewModel    = new ServicePortsViewModel();
        self.ServicesViewModel.loadServices();
	self.PhysicalPortsViewModel = new PhysicalPortsViewModel();
        self.DevicesViewModel.loadDevices();
        //self.PortsViewModel.loadServicePorts();
        ko.applyBindings(self.DevicesViewModel, document.getElementById("deviceListView"));
        ko.applyBindings(self.DevicesViewModel, document.getElementById("deviceView"));
        ko.applyBindings(self.ServicesViewModel, document.getElementById("ServiceSelectionView"));
        ko.applyBindings(self.ServicePortsViewModel, document.getElementById("PortView"));
	ko.applyBindings(self.PhysicalPortsViewModel, document.getElementById("PhysicalPortView"));

        return this;
    };
    myApp.MasterVM = masterVM;
} (window.myApp));
