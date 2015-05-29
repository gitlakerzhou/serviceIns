// Devices ViewModel
(function (myApp) {

    this.serviceSelectionNotice = new ko.subscribable();
    this.deviceSelectionNotice = new ko.subscribable();
    this.newLinkNotice = new ko.subscribable();
    this.delLinkNotice = new ko.subscribable();
    this.availablePorts = [];
    this.availableSrvPorts = ko.observableArray([]);
    this.availableSites = ko.observableArray([]);
    this.availablePhyPorts = ko.observableArray([]);
    this.selectedDevice = ko.observable(null);
    this.portsUpdate = function(port, toAdd) {
	if (toAdd && port.isInuse() == false) {
	    if (this.availablePorts.indexOf(port) <= -1)
		this.availablePorts.push(port);
	    if (this.availableSites.indexOf(port) <= -1 && port.connToType == 'Site')
		this.availableSites.push(port);
	    if (this.availablePhyPorts.indexOf(port) <= -1 && port.connToType == 'NoPeer')
		this.availablePhyPorts.push(port);
	    if (this.availableSrvPorts.indexOf(port) <= -1 && port.connToType == 'NoPeer')
		this.availableSrvPorts.push(port);
	} else {
	    if (this.availablePorts.indexOf(port) > -1)
		this.availablePorts.pop(port);
	    if (this.availableSites.indexOf(port) > -1)
		this.availableSites.pop(port);
	    if (this.availablePhyPorts.indexOf(port) > -1)
		this.availablePhyPorts.pop(port);
	    if (this.availableSrvPorts.indexOf(port) > -1)
		this.availableSrvPorts.pop(port);
	}
    }
/*  This work is licensed under Creative Commons GNU LGPL License.
    License: http://creativecommons.org/licenses/LGPL/2.1/
    Version: 0.9
    Author:  Stefan Goessner/2006
    Web:     http://goessner.net/
*/
var json2xml = function(o, tab) {
    var toXml = function(v, name, ind) {
        var xml = "";
        if (v instanceof Array) {
            for (var i=0, n=v.length; i<n; i++) xml += ind + toXml(v[i], name, ind+"\t") + "\n";
        }
        else if (typeof(v) == "object") {
            var hasChild = false;
            xml += ind + "<" + name;
            for (var m in v) {
                if (m.charAt(0) == "@")
                    xml += " " + m.substr(1) + "=\"" + ((v[m]) ? v[m].toString() : '') + "\"";
                else
                    hasChild = true;
            }

            xml += hasChild ? ">" : "/>";
            if (hasChild) {
                for (var m in v) {
                    if (m == "#text") xml += v[m];
                    else if (m == "#cdata") xml += "<![CDATA[" + v[m] + "]]>";
                    else if (m.charAt(0) != "@") xml += toXml(v[m], m, ind+"\t");
                }
                xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
            }
        }
        else {
            xml += ind + "<" + name + ">" + ((v) ? v.toString() : '') +  "</" + name + ">";
        }
        return xml;
    }, xml="";
    for (var m in o) xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
};

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
        
        selectedDevice.subscribe(function(newValue) {
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
	    console.log(selectedDevice());
            if (device) {
                selectedDevice(device);
                self.device = device;
		self.getCloudInfo(device);
		self.getCentralOfficeName(device);
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
            context.fillText(Math.round(percentage * 100) + '%', x, y+5);
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
		self.device.diskUsage = ko.observable(((tDisk -  availableRsource.availableDiskspace)/tDisk).toFixed(4));
		//selectedDevice(self.device);
		self.resourceDashBoard(self.device);
		console.log(self.device);
		console.log(selectedDevice());
	}

        self.getActiveResources = function(COResourceList) {
	    console.log(COResourceList);
	    for (var cor in COResourceList) {
		var cons = COResourceList[cor].computeNodeResources;
		for (var con in cons) {
		console.log(cons[con]);
		console.log( self.device);
		console.log( selectedDevice() );
		if ((cons[con].displayName == self.device.description) || 
			(cons[con].displayName == 'ensemble' && self.device.description == 'CO_6500')) {
			self.device.computeNodeGuid = cons[con].displayName;
			self.device.computeNodeGuidId = cons[con].key;
			for (var vnfi in cons[con].vnfInstanceResources) {
			    aRam += cons[con].vnfInstanceResources[vnfi].totalRam;
			    aCpu += cons[con].vnfInstanceResources[vnfi].totalVirtualCPUCount;
			    aDisk += cons[con].vnfInstanceResources[vnfi].totalDiskspace;
			}
			//need to get clound id somewhere 
			myApp.apiGet('/availableResources/list/'+self.device.COKey+'/' + self.device.cloudId + '/'+cons[con].key, 
				function(){self.getAvailableResources(this)});
		}
		}		
	    }
	};
	self.getResourceUsage = function(device) {
		myApp.apiGet('/activeResources/list/'+device.COKey, function(){self.getActiveResources(this)});
	};
	self.updateCloudInfo = function(cloudList) {
	    for (var c in cloudList) {
		if (cloudList[c].centralOfficeKey == self.device.COKey) {
		    self.device.cloudId = cloudList[c].key;
		    self.device.cloudName = cloudList[c].displayName;
		}
	    }
	    self.getAZInfo(self.device);
	    self.getResourceUsage(self.device);
	    self.resourceDashBoard(self.device);
	};
	self.getCloudInfo = function(device) {
	    myApp.apiGet('/clouds/list', function(){self.updateCloudInfo(this)});
	};
	self.updateCentralOfficeName = function(co) {
	    for (var c in co) {
		if (co[c].key == self.device.COKey) {
		    self.device.COName = co[c].displayName;
		    break;
		}
	    }
	};
	self.getCentralOfficeName = function(device) {
	    myApp.apiGet('/centralOffices/list', function(){self.updateCentralOfficeName(this)});
	};
	self.updateAZInfo = function(az) {
	    console.log(az);
	    self.device.availabilityZone = az[0].displayName;
	    self.device.availabilityZoneId = az[0].key;
	    for (var i in az[0].hostAggregateDTOCollection) {
		for (var j in az[0].hostAggregateDTOCollection[i].computeNodeDTOCollection) {
		    if (az[0].hostAggregateDTOCollection[i].computeNodeDTOCollection[j].key == self.device.computeNodeGuidId) {
			self.device.hostAgg = az[0].hostAggregateDTOCollection[i].displayName;
			self.device.hostAggId = az[0].hostAggregateDTOCollection[i].key;
		    }
		}
	    }
	    selectedDevice(self.device);
	    console.log( self.device);
	};
	self.getAZInfo = function(device) {
	    myApp.apiGet('/cloudAvailabilityZones/list/'+ device.cloudId + '/' + device.location.key, function(){self.updateAZInfo(this)});
	};
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
		d.location = devices[idx].location;
		d.phyConn = devices[idx].networkPhysicalConnection;
		d.cloudConn = devices[idx].networkCloudConnection;
		d.cpPort = devices[idx].coreProviderPort;
		d.centralOfficeKey = devices[idx].centralOfficeKey;
                console.log(d);
		//self.device = d;
                //selectedDevice(d);

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
                //selectedDevice(null);
            }
	
        };

        // load list of physical devices 
        self.loadDevices = function () {
            myApp.apiGet('/physicalDevices/list', function(){self.populateDevices(this)});
        };

        // logic that is called whenever a user is done editing a device or done adding a device
        self.doneEditingDevice = function () {
            // get a reference to our currently selected device
            var p = selectedDevice();

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
            selectedDevice(null);
        };

        // logic that removes the selected device from the collection
        self.removeDevice = function () {
            // get a reference to our currently selected device
            var p = selectedDevice();

            // ignore if it is null
            if (!p) {
                return;
            }

            // empty the selectedDevice
            selectedDevice(null);

            // simply remove the item from the collection
            return self.deviceCollection.remove(p);
        };
        return this;
    }
    function ServicesViewModel() {
            var self = this;

            // the device that we want to view/edit
            self.selectedService = ko.observable();
	    self.serviceName = ko.observable();
	    self.serviceLinks = ko.observableArray([]);
	    self.serviceVnfIns = ko.observableArray([]);

            self.selectedService.subscribe(function(newValue) {
                //serviceSelectionNotice.notifySubscribers(newValue, "SelectedService");
            });
	    self.curVnfInsName = '';
            self.vnfInsName = ko.observable('');
	    self.vnfInsCollection = ko.observableArray(self.curVnfInsName);

            self.selectedImage = ko.observable();

            // the device collection
            self.ServiceCollection = ko.observableArray([]);

            // the available image collection
             self.ImageCollection = ko.observableArray([]);

            // services list view selected item
            self.listViewSelectedService = ko.observable(null);
	    self.listViewServiceVnfInstances = ko.observable(null);
            // services list view selected item
            self.listViewSelectedImage = ko.observable(null);
	    self.listViewLinks = ko.observable(null);


            // push any changes in the list view to our main selectedService
            self.listViewSelectedService.subscribe(function (service) {
                if (service) {
                    self.selectedService(service);
                    self.ImageCollection(service.imageOption);
		    self.updataVnfInsName();
                }
            });
	    self.listViewServiceVnfInstances.subscribe(function(vnf) {
		if (vnf) {
		    serviceSelectionNotice.notifySubscribers({vnfi:vnf, links:self.serviceLinks()}, "SelectedService");
		    //console.log("new vnf instance");
		}
	    });
	    self.listViewLinks.subscribe(function(link) {
		if (link) {
		    //newLinkNotice.notifySubscribers(link, "NewLink");
		}
	    });
	    newLinkNotice.subscribe(function(link) {
                self.serviceLinks.push(link);
            }, self, "NewLink");
	    delLinkNotice.subscribe(function(link) {
                self.serviceLinks.remove(link);
            }, self, "DelLink");

	    self.updataVnfInsName = function() {
		var found = false;
		if (self.vnfInsCollection().length == 0) return;
		for (vnfi in self.vnfInsCollection()) {
		    if (self.vnfInsCollection()[vnfi].key == self.selectedService().key &&
			self.vnfInsCollection()[vnfi].imageOption == self.selectedImage()) {
			self.curVnfInsName =  self.vnfInsCollection()[vnfi].name;
			found = true;
		    }
		}
		if ( !found) self.curVnfInsName = '';
			    };
            // push any changes in the list view to our main selectedServiceImage
            self.listViewSelectedImage.subscribe(function (image) {
                if (image) {
                    self.selectedImage(image);
                }
            });
	    self.addVnfToList = function () {
			console.log(self.vnfInsName());
			console.log(self.selectedService());
			console.log(self.selectedImage());
		    for (var i in self.vnfInsCollection()) {
			if (self.vnfInsCollection()[i].name == self.vnfInsName()) {
			    alert ('VNF instance name ' + self.vnfInsName() + ' has been used!');
			    return;
			}
		    }

                    var s = Object.create(myApp.VNFInst).withInstanceCopy(
                                self.vnfInsName(),
                                self.selectedService().ports,
                                self.selectedImage(),
                                self.selectedService().key,
				self.selectedService().name);

                    if (!s) {
                        return;
                    }

                    // check to see that the service doesn't already exist in our list
                    if (self.vnfInsCollection.indexOf(s) > -1) {
                        return;
                    }

                    // add the device to the collection
                    self.vnfInsCollection.push(s);
		    //self.curVnfInsName = '';
                    console.log(s);
            };

	    self.getEndpoint = function (p) {
		var ep = {};
		switch (p.ownerType) {
		case 'SrvPort':
		    ep['VNFEndPoint'] = {
			'@vnfName': p.owner.name,
			
			'@portName': p.pname,
			'@mirrored': 'false',
			"IPAddressInfo": {
			    '@staticIP': '',
			    '@assignFloatingIP':  'false'
			}
		    };
		break;
		case 'PhyConn':
		    if (p.connToType == 'Site') {
			ep['SiteEndPoint'] = {
			    '@siteName': p.siteName(),
			    '@siteID': p.siteId,
			    '@mirrored': 'false',
			    "BandwidthProfile": [{
				'@bandwidthDirection': "ToCustomer",
				'@customBandwidthProfile': p.siteOutBwp()	
			    },{
				'@bandwidthDirection': "FromCustomer",
				'@customBandwidthProfile': p.siteInBwp()
			    }]
			}	
		    } else {
			ep['DeviceEndPoint'] = {
			    '@mirrored': 'false',
			    '@centralOfficeID': ''+p.owner.COKey,
			    '@centralOfficeName': p.owner.COName,
			    '@physicalDeviceID': ''+p.owner.id,
			    '@physicalDeviceName': p.owner.description,
			    '@portName': p.pname,
			    '@portID': ''+p.key,
			    '@siteID': ''+p.siteId,
			    '@siteName': p.siteName()
			}	
		    }
		break;
		}
		return ep;
	    }

	    self.submitServiceOrder = function () {
		var so = {};
		// -----------------------------------------------------------------
            	// BUILD XML
            	// -----------------------------------------------------------------
            	//hardcode tenant infor
            	// removed ID and CentralOffices
            	// name became ServiceName
            	// added tenantName and tenantKey
            	so['ServiceOrderDesc'] = {
                	'@serviceName': self.serviceName(),
                	'@tenantName': "OVERTURE NETWORKS",
                	'@tenantKey': "1",
                	'@xsi:schemaLocation': "http://192.168.50.77:8080/osa/xml/ServiceOrderRequestVersion2_1.xsd",
                	'@xmlns': "http://www.overturenetworks.com/ServiceOrderRequestVersion2_1",
               		'@xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
                	'ServiceOrderCarrier':[]
           	 };

		var optimizations = [];
		//optimizations on physical device should be all the same --?
		optimizations.push({

		    '@cloudName': selectedDevice().cloudName,
		    '@cloudID': ''+selectedDevice().cloudId,
		    
		    '@cloudLocationName': selectedDevice().location.displayName,
		    '@cloudLocationID': ''+selectedDevice().location.key,
		    '@availabilityZone': selectedDevice().availabilityZone,
		    '@availabilityZoneID': ''+selectedDevice().availabilityZoneId,
		    '@hostAggregate': selectedDevice().hostAgg,
		    '@hostAggregateID': ''+selectedDevice().hostAggId,
		    '@computeNodeGuid': selectedDevice().computeNodeGuid,
		    '@computeNodeGuidID': ''+selectedDevice().computeNodeGuidId

		});

            	var xmlSOCs = {};

            	//for (var i in cos) if (cos.hasOwnProperty(i)) 
            	var i = 0;
		{
                	xmlSOCs[i] = {}; // may not always have a VNF since we have sites now.
                	xmlSOCs[i].VirtualizedNetworkFunctions = {}; // require the container even if empty
                	// Build the VNF Information
                	if (self.vnfInsCollection().length > 0) {
                    	    xmlSOCs[i].VirtualizedNetworkFunctions.VirtualizedNetworkFunction = [];
                    	    for (var j in self.vnfInsCollection()) {
				//find the corresponding vnf template as "service" object
				var vnf = null;
				for (var k in self.ServiceCollection()) {
				    if (self.ServiceCollection()[k].key == self.vnfInsCollection()[j].key)
					vnf = self.ServiceCollection()[k];
				}
				var vnfPorts = [];
				for (var pt in vnf.ports) { vnfPorts.push({'@name':vnf.ports[pt]})}
                        	xmlSOCs[i].VirtualizedNetworkFunctions.VirtualizedNetworkFunction.push({
                            	"@name": self.vnfInsCollection()[j].name,
                            	"@type": self.vnfInsCollection()[j].type,
                            	"Ports": { "Port": vnfPorts},
                            	"@customOptimization": self.vnfInsCollection()[j].imageOption,
                            	"Optimizations": optimizations, //selectedDevice.,
                            	"InstanceProperties": {},
                            	"ScaleAlarmProfile" : [],
                        	});
                   	    }
                	}
			// --------------------------------------------------------------------------
                	// INTERCONNECTIONS
                	// Build the Interconnection information (Removed old way and replaced with this.)
                	// --------------------------------------------------------------------------
               		var xmlIntrCntcs = {};            // This is the object we will build and place in the XML
               		xmlIntrCntcs["InterConnections"] = {};
                	var intrCnctns = xmlIntrCntcs.InterConnections;
			if (typeof (intrCnctns.InterConnection) === "undefined")
			    intrCnctns.InterConnection = [];
			for (link in self.serviceLinks()) {
			    var endPointSrc = self.getEndpoint(self.serviceLinks()[link]);
			    var endPointDst = self.getEndpoint(self.serviceLinks()[link].peerPort());
			}

		    // Subnet and CIDR info
                    var nwCIDR = '';//linkData.nwIntCIDR;
                    
                    if (nwCIDR == "") { // && !(linkData.nwHasExtGW)) {
                        intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst]});
                    }
                    /*else {
                        
                        var subnet = {"@networkCIDR": nwCIDR,"@externalGatewayStaticIP" : linkData.nwExtGW, "@externalGateway": linkData.nwHasExtGW + ""};
                        intrCnctns.InterConnection.push({EndPoint: [endPointSrc, endPointDst], Subnet: [subnet]});


                        // If Ranges, include
                        if (linkData.nwDhcpRanges.length > 0) {
                            for (var l=0; l<linkData.nwDhcpRanges.length; l++) {
                                intrCnctns.InterConnection[i].Subnet[0]["DHCPRange"] = {"@begin": linkData.nwDhcpRanges[l].begin, "@end": linkData.nwDhcpRanges[l].end};
                            }
                        }
                    }*/



			xmlSOCs[i].InterConnections = xmlIntrCntcs.InterConnections;

                	so["ServiceOrderDesc"]["ServiceOrderCarrier"].push(xmlSOCs[i]);
			console.log(so);

		}
		//send the SO to server
		self.ServiceOrderV2('<?xml version="1.0" encoding="UTF-8"?>' + json2xml(so));
		return;
	    };

	    self.SOCallback = function(data) {
		alert ("All done");
	    }

	    self.ServiceOrderV2 = function (data) {
		console.log(data);
		myApp.apiPost('/serviceOrdersV2/add?'+ $.now(), data, function(){self.SOCallback(this)});
	    };
	    self.removeVnfFromList = function () {

		self.vnfInsCollection.remove(function(vnfi) {
		    if (vnfi.key == self.selectedService().key &&
			vnfi.imageOption == self.selectedImage()) {
			alert('VNF instance ' + vnfi.name + ' removed');
		        return (true);	
		    }	
		});
            };

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

            self.connOptions = ko.observableArray(['NoPeer','SrvPort', 'Site', 'PhyConn','CloudConn','CoreProviderP']);
            self.type = {NOPR:"NoPeer",SRV:"SrvPort",PHY:"PhyConn",SITE:"Site",CLOUD:"CloudConn",CPP:"CoreProviderP" };
	    self.copyAPs = ko.observableArray([]);
            // the device collection
            self.ServicePortCollection = ko.observableArray([]);
	    self.linkCollection = ko.observableArray([]);
            self.vnfInstances = ko.observableArray([]);
            serviceSelectionNotice.subscribe(function(newValue) {
                self.vnfInstances.push(newValue.vnfi);
                console.log(newValue);
		self.ServicePortCollection.removeAll();
                self.reloadServicePorts(newValue.vnfi, newValue.links);

            }, self, "SelectedService");

	    self.selectedPort = ko.observable({pname:"name"}); //ko.observable(self.ServicePortCollection.indexOf(0));

	    self.listViewPeerType = ko.observable(null);
	    self.listViewPeerType.subscribe(function(type) {
		if (type) {
		}
	    });

            // creates a new service and sets it up for editing
            self.reloadServicePorts = function (vnfi, links) {
                var pIdx = [];
		for (var l in links) {
		    if (links[l].owner.name == vnfi.name) {
			self.ServicePortCollection.push(links[l]);
			portsUpdate(links[l], true);
			pIdx.push(links[l].key);
		    }
		}

                for (var idx in vnfi.ports) {
		    var existingLink = false;
		    for (skip = 0; skip <  pIdx.length; skip ++) {
			if (idx == pIdx[skip]) {
			    //already in 
			    existingLink = true;
			}
		    }
		    if (existingLink)
			continue;
         	    var sp = Object.create(myApp.Port).withInstanceCopy(
                        idx,
                        vnfi.ports[idx],
                        vnfi,
                        self.type.SRV);
                    //console.log(sp);

                    if (!sp) {
                        continue;
                    }

                    // check to see that the service doesn't already exist in our list
                    if (self.ServicePortCollection.indexOf(sp) > -1) {
                        continue;
                    }
		    sp.info = sp.calculate();
                    // add the device to the collection
                    self.ServicePortCollection.push(sp);
		    portsUpdate(sp, true);

		    self.ServicePortCollection.sort(function(left, right) {
				return left.key == right.key ? 0 : (left.key < right.key ? -1 : 1)
			    });

                    //console.log(sp);
                }
                return  self.ServicePortCollection();
            };
	    self.addLink =  function(port) {
		//console.log(port);
		self.selectedPort(port);
		self.copyAPs (availablePorts);
		console.log(self.copyAPs());
		console.log(availablePorts);
		$( "#NewLink" ).dialog({
	            resizable: true,
		    width:400,
	            height:500,
	            buttons: {
	                "Add Link": function() {
			    self.ServicePortCollection.remove(function(pt) {return pt.key == port.key});

			    port.info = port.calculate();
			    self.ServicePortCollection.push(port);
			    portsUpdate(port, true);

			    self.ServicePortCollection.sort(function(left, right) {
				return left.key == right.key ? 0 : (left.key < right.key ? -1 : 1)
			    });
			    //self.linkCollection.push(port);
			    newLinkNotice.notifySubscribers(port, "NewLink");
			    console.log(port);
			    console.log(port.peerPort());
			    $(this).dialog( "close" );
	                },
	                Cancel: function() {
	                    $(this).dialog( "close" );
	                }
	            }
		});
	    };
	    self.delLink =  function(port) {
		//console.log(port);
		self.selectedPort(port);
		self.copyAPs (availablePorts);

		$( "#DelLink" ).dialog({
	            resizable: true,
		    width:400,
	            height:500,
	            buttons: {
	                "Delete Link": function() {
			    //self.linkCollection.push(port);
			    delLinkNotice.notifySubscribers(port, "DelLink");
			    port.connToType = "NoPeer";
			    port.peerPort = ko.observable();
			    self.ServicePortCollection.remove(function(pt) {return pt.key == port.key});
			    port.info = port.calculate();
			    self.ServicePortCollection.push(port);
			    portsUpdate(port, true);

			    self.ServicePortCollection.sort(function(left, right) {
				return left.key == right.key ? 0 : (left.key < right.key ? -1 : 1)
			    });
			    $(this).dialog( "close" );
	                },
	                Cancel: function() {
	                    $(this).dialog( "close" );
	                }
	            }
		});

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

            self.connOptions = ko.observableArray(['NoPeer','SrvPort', 'Site', 'PhyConn','CloudConn','CoreProviderP']);
            self.type = {NOPR:"NoPeer",SRV:"SrvPort",PHY:"PhyConn",SITE:"Site",CLOUD:"CloudConn",CPP:"CoreProviderP" };

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
                        dev,
                        self.type.PHY);
                    if (dev.phyConn !=  null && sp.key == dev.phyConn.networkFacingPortKey) {
			console.log("in phyconn");
			sp.connToType = self.type.PHY;
			sp.peerDevName = dev.phyConn.networkPhysicalDeviceName;
			sp.peerDevPortKey = dev.phyConn.networkPhysicalDevicePortKey;
			sp.peerDevPortName = dev.phyConn.networkPhysicalDevicePortName;
			sp.peerDevCpeTrunkVlan = dev.phyConn.cpeTrunkVlanValue;
		    }
		    if (dev.cloudConn !=  null && sp.key == dev.cloudConn.networkFacingPortKey) {
			console.log("in cloud phyconn");
			sp.cloudKey = dev.cloudConn.cloudKey;
			sp.cloudName = dev.cloudConn.cloudName;
			sp.connToType = self.type.CLOUD;
		    }
		    if (dev.cpPort !=  null && sp.key == dev.cpPort.coreProviderPortKey) {
			console.log("in cp phyconn");
			sp.coreEntryVlan = dev.cpPort.coreEntryVlanValue;
			sp.coreExitVlan = dev.cpPort.coreExitVlanValue;
			sp.connToType = self.type.CPP;
		    }
                    if (!sp) {
                        continue;
                    }

                    // check to see that the service doesn't already exist in our list
                    if (ports.indexOf(sp) > -1) {
                        continue;
                    }

                    // add the device to the collection
                    sp.info = sp.calculate();
                    self.PhysicalPortCollection.push(sp);
		    portsUpdate(sp, true);

                    ports.push(sp);
		    console.log(sp);
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
                                self.ports[p].connToType = self.type.SITE;
                                self.ports[p].siteName = ko.observable(site[0].displayName);
				self.ports[p].siteId = site[0].key;
				
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
				self.ports[p].info = self.ports[p].calculate();
                                self.PhysicalPortCollection.push(self.ports[p]);
				portsUpdate(self.ports[p], true);

				self.PhysicalPortCollection.sort(function(left, right) {
					return left.key == right.key ? 0 : (left.key < right.key ? -1 : 1)
				});
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
	ko.applyBindings(self.ServicePortsViewModel, document.getElementById("NewLink"));
	ko.applyBindings(self.ServicePortsViewModel, document.getElementById("DelLink"));
	ko.applyBindings(self.PhysicalPortsViewModel, document.getElementById("PhysicalPortView"));
	ko.applyBindings(self.ServicesViewModel, document.getElementById("ServiceOrder"));
        return this;
    };
    myApp.MasterVM = masterVM;
} (window.myApp));
