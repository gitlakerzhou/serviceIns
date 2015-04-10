(function (myApp) {
    Device = {
        withObserver: function() {
                // "id" property
                this.id = ko.observable("");
                // "Description" property
                this.description = ko.observable("");
                // "ip" property
                this.ip = ko.observable(0);
                // "status" property
                this.status = ko.observable(0);
                this.location = ko.observable("");
                this.diskUsage = ko.observable(0);
                this.cpuUsage = ko.observable(0);
                this.ramUsage = ko.observable(0);

                // Computed Observables

                // simply combines the Sku and Description properties
                this.statusAndDescription = ko.computed(function () {
                    var s = self.status() || "";
                    var description = self.description() || "";

                    return s + ": " + description;
                });
                return this;
        },
        withInstanceCopy: function(id, des, ip, status, loc, du, cu, ru) {
            this.id = id;
            this.description = des;
            this.ip = ip;
            this.status = status;
            this.location = loc;
            this.diskUsage = du;
            this.cpuUsage = cu;
            this.ramUsage = ru;
            this.statusAndDescription = status + ": " + des;
            return this;
        }
    };
    myApp.Device = Device;

    Service = {
        withObserver: function() {
                    // "id" property
                    this.name = ko.observable("");
                    // "Description" property
                    this.imageOption = ko.observable([]);
                    // "ip" property
                    this.ports = ko.observable([]);

                    return this;
            },
        withInstanceCopy: function(name, ports, imageOption) {
                    this.name = name;
                    this.imageOption = imageOption;
                    this.ports = ports;

                    return this;
                }
    };

    // add to our namespace

    myApp.Service = Service;

    Port = {
        withInstanceCopy: function (key, name, owner, ownerType) {
            var self = this;
            self.key = key;
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
            self.bwp = ko.observable("");
            self.state = ko.computed(function() {
              return ("available");
            });
            self.connToType = ko.observable("");
            return this;
        }
    };
    myApp.Port = Port;

} (window.myApp));