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
	    this.COName = '';
            this.statusAndDescription = status + ": " + des;
	    this.centralOfficeKey = 0;
	    this.phyConn = null;
	    this.cloudConn = null;
	    this.cpPort = null;
	    this.availabilityZone = "";
	    this.availabilityZoneId = 0;
	    this.cloudName = "";
	    this.cloudId = 0;
	    this.computeNodeGuid = '';
	    this.computeNodeGuidId = '';
	    this.hostAgg = 'Unaggregatted';
	    this.hostAggId = 0;
            return this;
        }
    };
    myApp.Device = Device;

    VNFInst = {
        withInstanceCopy: function(name, ports, imageOption, key, type) {
                    this.name = name;
		   
                    this.imageOption = imageOption;
                    this.ports = ports;
                    this.key = key;
		    this.type = type;
		    return this;
                }
    };

    // add to our namespace

    myApp.VNFInst = VNFInst;

    function so_endpoint(type) {
    };

    so_link = {
        withInstanceCopy: function(endPoint_1, endPoint_2, attributes) {
                    this.endPoint_1 = endPoint_1;
		   
                    this.endPoint_2 = endPoint_2;
                    this.bwToSite = attributes.bwToSite;
                    this.bwFromSite = attributes.bwFromSite;
		    this.subnetCidrIp = attributes.subnetCidrIp;
		    this.subnetCidrBits = attributes.subnetCidrBits;
		    this.isConnectToExRouter = attributes.isConnectToExRouter;

		    this.allowDhcpRangeLow = attributes.allowDhcpRangeLow;
		    this.allowDhcpRangeHigh = attributes.allowDhcpRangeHigh;
                    return this;
                }
    };
    myApp.so_link = so_link;

    // add to our namespace

    myApp.VNFInst = VNFInst;

    Service = {
        withInstanceCopy: function(name, ports, imageOption, key) {
                    this.name = name;
		   
                    this.imageOption = imageOption;
                    this.ports = ports;
                    this.key = key;
		    this.vnfList = ko.observableArray([]);
		    this.links = ko.observableArray([]);
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
	    self.ownerId = 0;
            self.ownerType = ownerType;
            var initIP = 0; //TODO: read the initIP from Owner
            var initIPMask = "255.255.255.0";//TODO: read real
            self.ip = ko.observable(initIP);
            self.ipMask = ko.observable(initIPMask);
            var initVLAN = 100; //TODO: read the vlan
            self.vlan = ko.observable(initVLAN);
            self.peerPort = ko.observable();
	    //self.peerType = ko.observable('');
	    self.siteId = 0;
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
	    self.peerDevName = "";
	    self.peerDevPortKey = 0;
	    self.peerDevPortName = "";
	    self.peerDevCpeTrunkVlan = null;
	    self.cloudKey = 0;
	    self.cloudName = '';
	    self.coreEntryVlan = 0;
	    self.coreExitVlan = 0;
	    self.info = self.calculate;
	    self.connToType = "NoPeer";
	    self.explicitCidr = false;
	    self.connectExtRouter = false;
	    self.floatingIp = false;
	    self.subnetCidrIp = '';
	    self.subnetCidrBits = 0;
	    self.AllowedDhcpRangeLow = '';
	    self.AllowedDhcpRangeHigh = '';

            self.state = ko.computed(function() {
              return ("available");
            });

	    self.isInuse = function() {
		var inuse = true;
		if (self.ownerType == "PhyConn") {
		    //physical port
		    switch (self.connToType) {
		    case 'NoPeer':
			inuse = false;
		    break;
		    case 'PhyConn':
			inuse = true;
		    break;
		    case 'Site':
			inuse = false;
		    break;
		    case 'CloudConn':
			inuse = true;
		    break;
		    case 'CoreProviderP':
			inuse = true;
		    break;
		    }
		}
		if (self.ownerType == "SrvPort") {
		    if (self.connToType == 'NoPeer') 
			inuse = false;
		    else 
			inuse = true;
		}
		return inuse;
	    };

            self.calculate = function() {
		var s = '';
		console.log(self.ownerType + "/" + self.connToType);
		if (self.ownerType == "PhyConn") {
		    //physical port
		    switch (self.connToType) {
		    case 'NoPeer':
			s += "Not connected"
		    break;
		    case 'PhyConn': // connect to a port on another physical device
			s += "Connected to " + self.peerDevPortName + " on " + self.peerDevName;
		    break;
		    case 'Site':
			s += self.siteName() + "\n" + " IN: " + self.siteInOp() + '/' + self.siteInTag() + '/' + self.InBwp +"\n";
		    break;
		    case 'CloudConn':
			s += "Connected to "+self.cloudName;
		    break;
		    case 'CoreProviderP':
			s += "Core Provider Entry VLAN: " + self.coreEntryVlan + "; Exit VLAN: " + self.coreExitVlan;
		    break;
		    case 'SrvPort':
			s += "Connected to Service Port";
		    break;
		    }
		}
		else if (self.ownerType == "SrvPort") {
		    s += self.linkSummary();
		}
		return s;
	    };
	    self.linkSummary = function() {
		var s = '';
		//console.log(self.ownerType + "/" + self.connToType);
		if (self.peerPort() && self.connToType) {
		    s += self.pname + ' --> ' ;
		    //physical port
		    switch (self.connToType) {
		    case 'NoPeer':
			s += "Not connected, bug!"
		    break;
		    case 'PhyConn': // service port connected to a physical port
			s += self.peerPort().pname + " on " + self.peerPort().owner.description;
		    break;
		    case 'Site':
			s += self.peerPort().siteName() + " on " + self.peerPort().owner.description;
		    break;
		    case 'SrvPort':
			s += self.peerPort().pname + " on " + self.peerPort().owner.name;
		    break;
		    }
		}
		else
		    s += "Not connected";

		console.log(s);
		return s;			
	    };
            
            return this;
        }
    };
    myApp.Port = Port;

} (window.myApp));
