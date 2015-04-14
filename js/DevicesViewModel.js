// Devices ViewModel
(function (myApp) {

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
            }
        });

        // creates a new device and sets it up for editing
        self.loadDevices = function () {

            var devices = {"physicalDevices":[
                              {
                                                    "key": 8,
                                                    "displayName": "CO_6500",
                                                    "portCollection": [
                                                        {
                                                            "key": 45,
                                                            "displayName": "5.1",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 46,
                                                            "displayName": "5.2",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 47,
                                                            "displayName": "5.3",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 48,
                                                            "displayName": "5.4",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 49,
                                                            "displayName": "5.5",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 50,
                                                            "displayName": "5.6",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 51,
                                                            "displayName": "5.7",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 52,
                                                            "displayName": "5.8",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 53,
                                                            "displayName": "5.9",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 54,
                                                            "displayName": "5.10",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 55,
                                                            "displayName": "5.11",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 56,
                                                            "displayName": "5.12",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 57,
                                                            "displayName": "5.13",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 58,
                                                            "displayName": "5.14",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 59,
                                                            "displayName": "5.15",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 60,
                                                            "displayName": "5.16",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 61,
                                                            "displayName": "5.17",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 62,
                                                            "displayName": "5.18",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 63,
                                                            "displayName": "5.19",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 64,
                                                            "displayName": "5.20",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 65,
                                                            "displayName": "5.21",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 66,
                                                            "displayName": "5.22",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 67,
                                                            "displayName": "5.23",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 68,
                                                            "displayName": "5.24",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 69,
                                                            "displayName": "5.25",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 70,
                                                            "displayName": "5.26",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        }
                                                    ],
                                                    "centralOfficeKey": 2,
                                                    "adminLogin": "security",
                                                    "adminPassword": "security",
                                                    "physicalDeviceTypeKey": 1,
                                                    "physicalDeviceTypeName": "OVERTURE_6504",
                                                    "location": {
                                                        "key": 3,
                                                        "displayName": "Central_Office_001",
                                                        "centralOfficeKey": 2,
                                                        "isCentralOfficeLocation": true
                                                    },
                                                    "readyStatus": "readyForUse",
                                                    "networkPhysicalConnection": {
                                                        "key": null,
                                                        "networkPhysicalDeviceKey": 280,
                                                        "networkPhysicalDeviceName": "supermicro-215",
                                                        "networkPhysicalDevicePortKey": 656,
                                                        "networkPhysicalDevicePortName": "1.4",
                                                        "networkFacingPortName": "5.12",
                                                        "networkFacingPortKey": 56,
                                                        "cpeTrunkVlanValue": null
                                                    },
                                                    "networkCloudConnection": {
                                                        "key": null,
                                                        "cloudKey": 2,
                                                        "cloudName": "Office_001_Cloud",
                                                        "networkFacingPortName": "5.25",
                                                        "networkFacingPortKey": 69
                                                    },
                                                    "coreProviderPort": {
                                                        "key": 8,
                                                        "coreProviderPortKey": 66,
                                                        "coreProviderPortName": "5.22",
                                                        "coreEntryVlanValue": 500,
                                                        "coreExitVlanValue": 500
                                                    },
                                                    "adminIPAddress": "10.11.11.10"
                                                },
                              {
                                                    "key": 280,
                                                    "displayName": "supermicro-215",
                                                    "portCollection": [
                                                        {
                                                            "key": 653,
                                                            "displayName": "1.1",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 654,
                                                            "displayName": "1.2",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 655,
                                                            "displayName": "1.3",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        },
                                                        {
                                                            "key": 656,
                                                            "displayName": "1.4",
                                                            "ipAddressCollection": [],
                                                            "ipAddressCollectionAsString": ""
                                                        }
                                                    ],
                                                    "centralOfficeKey": 2,
                                                    "adminLogin": "security",
                                                    "adminPassword": "security",
                                                    "physicalDeviceTypeKey": 102,
                                                    "physicalDeviceTypeName": "OVERTURE_65VSE",
                                                    "location": {
                                                        "key": 52,
                                                        "displayName": "supermicro-215",
                                                        "centralOfficeKey": 2,
                                                        "isCentralOfficeLocation": false
                                                    },
                                                    "readyStatus": "readyForUse",
                                                    "networkPhysicalConnection": {
                                                        "key": null,
                                                        "networkPhysicalDeviceKey": 8,
                                                        "networkPhysicalDeviceName": "CO_6500",
                                                        "networkPhysicalDevicePortKey": 56,
                                                        "networkPhysicalDevicePortName": "5.12",
                                                        "networkFacingPortName": "1.4",
                                                        "networkFacingPortKey": 656,
                                                        "cpeTrunkVlanValue": 323
                                                    },
                                                    "networkCloudConnection": {
                                                        "key": null,
                                                        "cloudKey": 2,
                                                        "cloudName": "Office_001_Cloud",
                                                        "networkFacingPortName": "1.4",
                                                        "networkFacingPortKey": 656
                                                    },
                                                    "coreProviderPort": null,
                                                    "adminIPAddress": "172.16.1.215"
                                                }
                           ]};
            for (var idx in devices.physicalDevices) {
                // create a new instance of a Device
                var d = Object.create(myApp.Device).withInstanceCopy(
                            devices.physicalDevices[idx].key,
                            devices.physicalDevices[idx].displayName,
                            devices.physicalDevices[idx].adminIPAddress,
                            devices.physicalDevices[idx].readyStatus,
                            devices.physicalDevices[idx].location.displayName,
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
                if (vnfData.availability == "available for use") {
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
                }
            };
            // creates a new service and sets it up for editing
            self.loadServices = function () {

                var c_services = {"CompVNFTypes":[
                                     {
                                            "key": 56,
                                            "displayName": "vTesthead_through_Router",
                                            "portNames": [
                                                "dp0p2p1"
                                            ],
                                            "nestedVNFTypeLinks": [
                                                {
                                                    "key": 1,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 1,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": null
                                                    }
                                                },
                                                {
                                                    "key": 2,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 1,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 2,
                                                            "displayName": "Testhead_001",
                                                            "vnfTypeBase": {
                                                                "key": 54,
                                                                "displayName": "Spirent",
                                                                "portNames": [
                                                                    "admin0",
                                                                    "test1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 3,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 3,
                                                        "nestedVNFType": {
                                                            "key": 1,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 2,
                                                            "displayName": "Testhead_001",
                                                            "vnfTypeBase": {
                                                                "key": 54,
                                                                "displayName": "Spirent",
                                                                "portNames": [
                                                                    "admin0",
                                                                    "test1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                }
                                            ],
                                            "vnfTypeProperties": []
                                        },
                                     {
                                            "key": 63,
                                            "displayName": "vEnterprise",
                                            "portNames": [
                                                "dp0p2p1",
                                                "eth1",
                                                "eth1_SBC"
                                            ],
                                            "nestedVNFTypeLinks": [
                                                {
                                                    "key": 9,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 6,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": null
                                                    }
                                                },
                                                {
                                                    "key": 10,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 6,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 7,
                                                            "displayName": "Firewall_001",
                                                            "vnfTypeBase": {
                                                                "key": 60,
                                                                "displayName": "PfSense",
                                                                "portNames": [
                                                                    "eth0",
                                                                    "eth1",
                                                                    "eth2",
                                                                    "eth3"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 11,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 2,
                                                        "nestedVNFType": {
                                                            "key": 6,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 8,
                                                            "displayName": "Testhead_001",
                                                            "vnfTypeBase": {
                                                                "key": 54,
                                                                "displayName": "Spirent",
                                                                "portNames": [
                                                                    "admin0",
                                                                    "test1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 12,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 3,
                                                        "nestedVNFType": {
                                                            "key": 6,
                                                            "displayName": "Router_001",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 9,
                                                            "displayName": "SBC_001",
                                                            "vnfTypeBase": {
                                                                "key": 62,
                                                                "displayName": "Metaswitch_SBC",
                                                                "portNames": [
                                                                    "eth0",
                                                                    "eth1",
                                                                    "eth2"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 13,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 7,
                                                            "displayName": "Firewall_001",
                                                            "vnfTypeBase": {
                                                                "key": 60,
                                                                "displayName": "PfSense",
                                                                "portNames": [
                                                                    "eth0",
                                                                    "eth1",
                                                                    "eth2",
                                                                    "eth3"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": null
                                                    }
                                                },
                                                {
                                                    "key": 14,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 2,
                                                        "nestedVNFType": {
                                                            "key": 7,
                                                            "displayName": "Firewall_001",
                                                            "vnfTypeBase": {
                                                                "key": 60,
                                                                "displayName": "PfSense",
                                                                "portNames": [
                                                                    "eth0",
                                                                    "eth1",
                                                                    "eth2",
                                                                    "eth3"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 8,
                                                            "displayName": "Testhead_001",
                                                            "vnfTypeBase": {
                                                                "key": 54,
                                                                "displayName": "Spirent",
                                                                "portNames": [
                                                                    "admin0",
                                                                    "test1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 15,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 9,
                                                            "displayName": "SBC_001",
                                                            "vnfTypeBase": {
                                                                "key": 62,
                                                                "displayName": "Metaswitch_SBC",
                                                                "portNames": [
                                                                    "eth0",
                                                                    "eth1",
                                                                    "eth2"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 2,
                                                        "nestedVNFType": null
                                                    }
                                                }
                                            ],
                                            "vnfTypeProperties": []
                                        },
                                     {
                                            "key": 150,
                                            "displayName": "Router_Firewall",
                                            "portNames": [
                                                "External_Port",
                                                "Internal_Port"
                                            ],
                                            "nestedVNFTypeLinks": [
                                                {
                                                    "key": 100,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 100,
                                                            "displayName": "Router",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": null
                                                    }
                                                },
                                                {
                                                    "key": 101,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 100,
                                                            "displayName": "Router",
                                                            "vnfTypeBase": {
                                                                "key": 55,
                                                                "displayName": "Brocade_5600",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1",
                                                                    "dp0p4p1",
                                                                    "dp0p5p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 101,
                                                            "displayName": "Firewall",
                                                            "vnfTypeBase": {
                                                                "key": 103,
                                                                "displayName": "Firewall",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 102,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 101,
                                                            "displayName": "Firewall",
                                                            "vnfTypeBase": {
                                                                "key": 103,
                                                                "displayName": "Firewall",
                                                                "portNames": [
                                                                    "dp0p2p1",
                                                                    "dp0p3p1"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": null
                                                    }
                                                }
                                            ],
                                            "vnfTypeProperties": []
                                        },
                                     {
                                            "key": 257,
                                            "displayName": "firewall-router",
                                            "portNames": [
                                                "wan",
                                                "lan"
                                            ],
                                            "nestedVNFTypeLinks": [
                                                {
                                                    "key": 153,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 153,
                                                            "displayName": "router",
                                                            "vnfTypeBase": {
                                                                "key": 256,
                                                                "displayName": "Vyatta_3.5R",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4",
                                                                    "port5",
                                                                    "port6",
                                                                    "port7",
                                                                    "port8",
                                                                    "port9",
                                                                    "port10",
                                                                    "port11",
                                                                    "port12",
                                                                    "port13",
                                                                    "port14",
                                                                    "port15",
                                                                    "port16",
                                                                    "port17",
                                                                    "port18",
                                                                    "port19",
                                                                    "port20"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 154,
                                                            "displayName": "switch",
                                                            "vnfTypeBase": {
                                                                "key": 1,
                                                                "displayName": "SWITCH",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4",
                                                                    "port5",
                                                                    "port6",
                                                                    "port7",
                                                                    "port8",
                                                                    "port9",
                                                                    "port10",
                                                                    "port11",
                                                                    "port12",
                                                                    "port13",
                                                                    "port14",
                                                                    "port15",
                                                                    "port16",
                                                                    "port17",
                                                                    "port18",
                                                                    "port19",
                                                                    "port20",
                                                                    "port21",
                                                                    "port22",
                                                                    "port23",
                                                                    "port24"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "default",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 154,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": {
                                                            "key": 155,
                                                            "displayName": "firewall",
                                                            "vnfTypeBase": {
                                                                "key": 201,
                                                                "displayName": "Fortigate Firewall",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 2,
                                                        "nestedVNFType": {
                                                            "key": 154,
                                                            "displayName": "switch",
                                                            "vnfTypeBase": {
                                                                "key": 1,
                                                                "displayName": "SWITCH",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4",
                                                                    "port5",
                                                                    "port6",
                                                                    "port7",
                                                                    "port8",
                                                                    "port9",
                                                                    "port10",
                                                                    "port11",
                                                                    "port12",
                                                                    "port13",
                                                                    "port14",
                                                                    "port15",
                                                                    "port16",
                                                                    "port17",
                                                                    "port18",
                                                                    "port19",
                                                                    "port20",
                                                                    "port21",
                                                                    "port22",
                                                                    "port23",
                                                                    "port24"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "default",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 155,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 2,
                                                        "nestedVNFType": {
                                                            "key": 153,
                                                            "displayName": "router",
                                                            "vnfTypeBase": {
                                                                "key": 256,
                                                                "displayName": "Vyatta_3.5R",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4",
                                                                    "port5",
                                                                    "port6",
                                                                    "port7",
                                                                    "port8",
                                                                    "port9",
                                                                    "port10",
                                                                    "port11",
                                                                    "port12",
                                                                    "port13",
                                                                    "port14",
                                                                    "port15",
                                                                    "port16",
                                                                    "port17",
                                                                    "port18",
                                                                    "port19",
                                                                    "port20"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 155,
                                                            "displayName": "firewall",
                                                            "vnfTypeBase": {
                                                                "key": 201,
                                                                "displayName": "Fortigate Firewall",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    }
                                                },
                                                {
                                                    "key": 156,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": {
                                                            "key": 153,
                                                            "displayName": "router",
                                                            "vnfTypeBase": {
                                                                "key": 256,
                                                                "displayName": "Vyatta_3.5R",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4",
                                                                    "port5",
                                                                    "port6",
                                                                    "port7",
                                                                    "port8",
                                                                    "port9",
                                                                    "port10",
                                                                    "port11",
                                                                    "port12",
                                                                    "port13",
                                                                    "port14",
                                                                    "port15",
                                                                    "port16",
                                                                    "port17",
                                                                    "port18",
                                                                    "port19",
                                                                    "port20"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "Small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 0,
                                                        "nestedVNFType": null
                                                    }
                                                },
                                                {
                                                    "key": 157,
                                                    "nestedVNFTypeConnector1": {
                                                        "portIndex": 2,
                                                        "nestedVNFType": {
                                                            "key": 155,
                                                            "displayName": "firewall",
                                                            "vnfTypeBase": {
                                                                "key": 201,
                                                                "displayName": "Fortigate Firewall",
                                                                "portNames": [
                                                                    "port1",
                                                                    "port2",
                                                                    "port3",
                                                                    "port4"
                                                                ],
                                                                "implType": "VNFT"
                                                            },
                                                            "customOptimization": "small",
                                                            "scaleAlarmProfileType": null
                                                        }
                                                    },
                                                    "nestedVNFTypeConnector2": {
                                                        "portIndex": 1,
                                                        "nestedVNFType": null
                                                    }
                                                }
                                            ],
                                            "vnfTypeProperties": []
                                        }
                                        ]};
                var s_services = {"VNFTypes":[
                                     {
                                             "key": 1,
                                             "displayName": "SWITCH",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3",
                                                 "port4",
                                                 "port5",
                                                 "port6",
                                                 "port7",
                                                 "port8",
                                                 "port9",
                                                 "port10",
                                                 "port11",
                                                 "port12",
                                                 "port13",
                                                 "port14",
                                                 "port15",
                                                 "port16",
                                                 "port17",
                                                 "port18",
                                                 "port19",
                                                 "port20",
                                                 "port21",
                                                 "port22",
                                                 "port23",
                                                 "port24"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": null,
                                             "availableCustomOptimizations": [
                                                 "default"
                                             ],
                                             "vnfTypeProperties": [],
                                             "vnfTypeAttributes": [
                                                 {
                                                     "key": 1,
                                                     "name": "OvrSwitch",
                                                     "value": "true"
                                                 }
                                             ],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 54,
                                             "displayName": "Spirent",
                                             "portNames": [
                                                 "admin0",
                                                 "test1"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "stcv-4.47.5296.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 21,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "54"
                                                 },
                                                 {
                                                     "key": 22,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "54"
                                                 },
                                                 {
                                                     "key": 23,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "54"
                                                 },
                                                 {
                                                     "key": 24,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "54"
                                                 },
                                                 {
                                                     "key": 25,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "54"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [
                                                 {
                                                     "key": 54,
                                                     "userName": "admin",
                                                     "password": "spt_admin",
                                                     "script": "#!/bin/bash\necho dns 8.8.8.8\necho lserver 74.62.253.85\necho activate\necho reboot",
                                                     "vnfScriptType": "Boot",
                                                     "usePrivateKey": false,
                                                     "vnfTypeKey": 54,
                                                     "portName": "admin0"
                                                 }
                                             ],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 55,
                                             "displayName": "Brocade_5600",
                                             "portNames": [
                                                 "dp0p2p1",
                                                 "dp0p3p1",
                                                 "dp0p4p1",
                                                 "dp0p5p1"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Brocade_Vyatta_5600_4port.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small",
                                                 "Medium",
                                                 "Large"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 26,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "55"
                                                 },
                                                 {
                                                     "key": 27,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "55"
                                                 },
                                                 {
                                                     "key": 28,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "55"
                                                 },
                                                 {
                                                     "key": 29,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "55"
                                                 },
                                                 {
                                                     "key": 30,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "55"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 55
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 55
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 55
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 60,
                                             "displayName": "PfSense",
                                             "portNames": [
                                                 "eth0",
                                                 "eth1",
                                                 "eth2",
                                                 "eth3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "pfSense.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 46,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "60"
                                                 },
                                                 {
                                                     "key": 47,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "60"
                                                 },
                                                 {
                                                     "key": 48,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "60"
                                                 },
                                                 {
                                                     "key": 49,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "60"
                                                 },
                                                 {
                                                     "key": 50,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "60"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 62,
                                             "displayName": "Metaswitch_SBC",
                                             "portNames": [
                                                 "eth0",
                                                 "eth1",
                                                 "eth2"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "MetaSwitch_SBC_20140417b.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 51,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "62"
                                                 },
                                                 {
                                                     "key": 52,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "62"
                                                 },
                                                 {
                                                     "key": 53,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "62"
                                                 },
                                                 {
                                                     "key": 54,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "62"
                                                 },
                                                 {
                                                     "key": 55,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "62"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 102,
                                             "displayName": "Router",
                                             "portNames": [
                                                 "dp0p2p1",
                                                 "dp0p3p1"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Brocade_Vyatta_5600_4port.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Medium",
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 105,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "102"
                                                 },
                                                 {
                                                     "key": 106,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "102"
                                                 },
                                                 {
                                                     "key": 107,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "102"
                                                 },
                                                 {
                                                     "key": 108,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "102"
                                                 },
                                                 {
                                                     "key": 109,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "102"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 103,
                                             "displayName": "Firewall",
                                             "portNames": [
                                                 "dp0p2p1",
                                                 "dp0p3p1"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Brocade_Vyatta_5600_4port.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small",
                                                 "Large"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 110,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "103"
                                                 },
                                                 {
                                                     "key": 111,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "103"
                                                 },
                                                 {
                                                     "key": 112,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "103"
                                                 },
                                                 {
                                                     "key": 113,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "103"
                                                 },
                                                 {
                                                     "key": 114,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "103"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 103
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 103
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 103
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 201,
                                             "displayName": "Fortigate Firewall",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3",
                                                 "port4"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Fortigate_GM_03172015_8Gig.qcow2",
                                             "availableCustomOptimizations": [
                                                 "small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 155,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "201"
                                                 },
                                                 {
                                                     "key": 156,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "201"
                                                 },
                                                 {
                                                     "key": 157,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "201"
                                                 },
                                                 {
                                                     "key": 158,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "201"
                                                 },
                                                 {
                                                     "key": 159,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "201"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 201
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 201
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 201
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 202,
                                             "displayName": "Demo_PBX_01",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Demo_IPPBX_01.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 160,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "202"
                                                 },
                                                 {
                                                     "key": 161,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "202"
                                                 },
                                                 {
                                                     "key": 162,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "202"
                                                 },
                                                 {
                                                     "key": 163,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "202"
                                                 },
                                                 {
                                                     "key": 164,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "202"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 203,
                                             "displayName": "Demo_PBX_02",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Demo_IPPBX_02.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 165,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "203"
                                                 },
                                                 {
                                                     "key": 166,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "203"
                                                 },
                                                 {
                                                     "key": 167,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "203"
                                                 },
                                                 {
                                                     "key": 168,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "203"
                                                 },
                                                 {
                                                     "key": 169,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "203"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 204,
                                             "displayName": "PBX_GM_01",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Asterisk_GoldMaster_01.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 170,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "204"
                                                 },
                                                 {
                                                     "key": 171,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "204"
                                                 },
                                                 {
                                                     "key": 172,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "204"
                                                 },
                                                 {
                                                     "key": 173,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "204"
                                                 },
                                                 {
                                                     "key": 174,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "204"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 205,
                                             "displayName": "PBX_GM_02",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Asterisk_GoldMaster_02.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 175,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "205"
                                                 },
                                                 {
                                                     "key": 176,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "205"
                                                 },
                                                 {
                                                     "key": 177,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "205"
                                                 },
                                                 {
                                                     "key": 178,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "205"
                                                 },
                                                 {
                                                     "key": 179,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "205"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": []
                                         },
                                     {
                                             "key": 206,
                                             "displayName": "Brocade_5400",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3",
                                                 "port4"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Brocade5400_64_v6.6R3_20Port.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Normal"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 180,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "206"
                                                 },
                                                 {
                                                     "key": 181,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "206"
                                                 },
                                                 {
                                                     "key": 182,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "206"
                                                 },
                                                 {
                                                     "key": 183,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "206"
                                                 },
                                                 {
                                                     "key": 184,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "206"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 206
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 206
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 206
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 253,
                                             "displayName": "Asterisk_Demo_GM",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Asterisk_Demo_GM.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 210,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "253"
                                                 },
                                                 {
                                                     "key": 211,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "253"
                                                 },
                                                 {
                                                     "key": 212,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "253"
                                                 },
                                                 {
                                                     "key": 213,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "253"
                                                 },
                                                 {
                                                     "key": 214,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "253"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 253
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 253
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 253
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 254,
                                             "displayName": "Demo_Router",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3",
                                                 "port4"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Demo_Router.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 215,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "254"
                                                 },
                                                 {
                                                     "key": 216,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "254"
                                                 },
                                                 {
                                                     "key": 217,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "254"
                                                 },
                                                 {
                                                     "key": 218,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "254"
                                                 },
                                                 {
                                                     "key": 219,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "254"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [
                                                 {
                                                     "key": 100,
                                                     "userName": "vyatta",
                                                     "password": "vyatta",
                                                     "script": "echo $PATH",
                                                     "vnfScriptType": "Boot",
                                                     "usePrivateKey": false,
                                                     "vnfTypeKey": 254,
                                                     "portName": "port1"
                                                 }
                                             ],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 254
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 254
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 254
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 255,
                                             "displayName": "Demo_Asterisk",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "Demo_Asterisk.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 220,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "255"
                                                 },
                                                 {
                                                     "key": 221,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "255"
                                                 },
                                                 {
                                                     "key": 222,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "255"
                                                 },
                                                 {
                                                     "key": 223,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "255"
                                                 },
                                                 {
                                                     "key": 224,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "255"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 255
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 255
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 255
                                                 }
                                             ]
                                         },
                                     {
                                             "key": 256,
                                             "displayName": "Vyatta_3.5R",
                                             "portNames": [
                                                 "port1",
                                                 "port2",
                                                 "port3",
                                                 "port4",
                                                 "port5",
                                                 "port6",
                                                 "port7",
                                                 "port8",
                                                 "port9",
                                                 "port10",
                                                 "port11",
                                                 "port12",
                                                 "port13",
                                                 "port14",
                                                 "port15",
                                                 "port16",
                                                 "port17",
                                                 "port18",
                                                 "port19",
                                                 "port20"
                                             ],
                                             "availability": "available for use",
                                             "imageFileName": "vyatta-kvm_3.5R1_amd64.qcow2",
                                             "availableCustomOptimizations": [
                                                 "Small",
                                                 "Medium"
                                             ],
                                             "vnfTypeProperties": [
                                                 {
                                                     "key": 225,
                                                     "propertyName": "METADATA_POLL_FREQ",
                                                     "propertyValue": "60",
                                                     "propertyDescription": "VNF Poll Frequency",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "256"
                                                 },
                                                 {
                                                     "key": 226,
                                                     "propertyName": "METADATA_SCRIPT",
                                                     "propertyValue": "NONE",
                                                     "propertyDescription": "Metadata Script",
                                                     "exposed": false,
                                                     "mandatory": true,
                                                     "shared": false,
                                                     "vnfTypeKey": "256"
                                                 },
                                                 {
                                                     "key": 227,
                                                     "propertyName": "METADATA_STATUS",
                                                     "propertyValue": "NOT_READY",
                                                     "propertyDescription": "VNF Metadata Status",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "256"
                                                 },
                                                 {
                                                     "key": 228,
                                                     "propertyName": "METADATA_TIMESTAMP",
                                                     "propertyValue": "0",
                                                     "propertyDescription": "VNF Metadata Timestamp",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "256"
                                                 },
                                                 {
                                                     "key": 229,
                                                     "propertyName": "EVENT_TYPE",
                                                     "propertyValue": "BOOT",
                                                     "propertyDescription": "Metadata Event Type",
                                                     "exposed": false,
                                                     "mandatory": false,
                                                     "shared": false,
                                                     "vnfTypeKey": "256"
                                                 }
                                             ],
                                             "vnfTypeAttributes": [],
                                             "vnfTypeScripts": [],
                                             "scaleAlarmTypes": [],
                                             "measurementTypes": [
                                                 {
                                                     "key": null,
                                                     "meterType": "network",
                                                     "vnfTypeKey": 256
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "disk",
                                                     "vnfTypeKey": 256
                                                 },
                                                 {
                                                     "key": null,
                                                     "meterType": "cpu",
                                                     "vnfTypeKey": 256
                                                 }
                                             ]
                                         }
                               ]};
                for (var idx in c_services.CompVNFTypes) {
                    // create a new instance of a service
                    self.createService(c_services.CompVNFTypes[idx]);
                }
                for (var idx in s_services.VNFTypes) {
                    // create a new instance of a service
                    self.createService(s_services.VNFTypes[idx]);
                }
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

            self.createSPort = function (vnfData) {
                if (vnfData.availability == "available for use") {
                    for (var i in vnfData.portNames) {
                        var sp = Object.create(myApp.Port).withInstanceCopy(
                            i,
                            vnfData.portNames[i],
                            null,
                            self.type.SRV);
                        console.log(sp);

                        if (!sp) {
                            continue;
                        }

                        // check to see that the service doesn't already exist in our list
                        if (self.ServicePortCollection.indexOf(sp) > -1) {
                            continue;
                        }

                        // add the device to the collection
                        self.ServicePortCollection.push(sp);
                        console.log(sp);
                    }
                }
            };
            // creates a new service and sets it up for editing
            self.loadServicePorts = function () {
                var s_services = {"VNFTypes":[
                                                         {
                                                                 "key": 1,
                                                                 "displayName": "SWITCH",
                                                                 "portNames": [
                                                                     "port1",
                                                                     "port2",
                                                                     "port3",
                                                                     "port4",
                                                                     "port5",
                                                                     "port6",
                                                                     "port7",
                                                                     "port8",
                                                                     "port9",
                                                                     "port10",
                                                                     "port11",
                                                                     "port12",
                                                                     "port13",
                                                                     "port14",
                                                                     "port15",
                                                                     "port16",
                                                                     "port17",
                                                                     "port18",
                                                                     "port19",
                                                                     "port20",
                                                                     "port21",
                                                                     "port22",
                                                                     "port23",
                                                                     "port24"
                                                                 ],
                                                                 "availability": "available for use",
                                                                 "imageFileName": null,
                                                                 "availableCustomOptimizations": [
                                                                     "default"
                                                                 ],
                                                                 "vnfTypeProperties": [],
                                                                 "vnfTypeAttributes": [
                                                                     {
                                                                         "key": 1,
                                                                         "name": "OvrSwitch",
                                                                         "value": "true"
                                                                     }
                                                                 ],
                                                                 "vnfTypeScripts": [],
                                                                 "scaleAlarmTypes": [],
                                                                 "measurementTypes": []
                                                             }
                                                   ]};
                for (var idx in s_services.VNFTypes) {
                    // create a new instance of a service port
                    self.createSPort(s_services.VNFTypes[idx]);
                }
            };
            return this;
        };
    // add our ViewModel to the public namespace
    myApp.ServicesViewModel = ServicesViewModel;
    myApp.DevicesViewModel = DevicesViewModel;
    myApp.PortsViewModel = PortsViewModel;
} (window.myApp));