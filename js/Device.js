(function (myApp) {
    Device = {
        withInstanceCopy: function(id, des, ip, status, loc, du, cu, ru, ports, COKey) {
            this.id = id;
            this.description = des;
            this.ip = ko.observable(ip);
            this.ports = ports;
            this.status = ko.observable(status);
            this.location = loc;
            this.diskUsage =  ko.observable(du);
            this.cpuUsage =  ko.observable(cu);
            this.ramUsage =  ko.observable(ru);
	    this.COKey = COKey;
            this.statusAndDescription = status + ": " + des;
            return this;
        }
    };
    myApp.Device = Device;

    Service = {
        withInstanceCopy: function(name, ports, imageOption, key) {
                    this.name = name;
                    this.imageOption = imageOption;
                    this.ports = ports;
                    this.key = key;
                    return this;
                }
    };

    // add to our namespace

    myApp.Service = Service;

    Port = {
        withInstanceCopy: function (key, name, owner, ownerType) {
            var self = this;
            self.key = key;
            self.deviceKey = 0;
            self.pname = name;
            self.owner = owner;
            self.ownerType = ownerType;
            var initIP = 0; //TODO: read the initIP from Owner
            var initIPMask = "255.255.255.0";//TODO: read real
            self.ip = ko.observable(initIP);
            self.ipMask = ko.observable(initIPMask);
            var initVLAN = 100; //TODO: read the vlan
            self.vlan = ko.observable(initVLAN);
            self.peerPorts = ko.observable([]);
            self.siteName = ko.observable("");
            self.siteTenantName = ko.observable("");
            self.siteInOp = ko.observable("");
            self.siteInTag = ko.observable("");
            self.siteInBwp = ko.observable("");
            self.siteInValue = ko.observable("");
            self.siteOutOp = ko.observable("");
            self.siteOutTag = ko.observable("");
            self.siteOutBwp = ko.observable("");
            self.siteOutValue = ko.observable("");
            self.siteVlan = ko.observable("");

            self.state = ko.computed(function() {
              return ("available");
            });
            self.connToType = ko.observable("");
            return this;
        }
    };
    myApp.Port = Port;

} (window.myApp));
