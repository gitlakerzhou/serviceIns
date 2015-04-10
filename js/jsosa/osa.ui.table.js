
(function(o, undefined) {

    o.ui = o.ui || {};
    o.ui.table = function(displayObj, tableRef) {
        var headers = [],
            values = [],
            $table;

        this.create = function(displayObj, tableRef) {
            var _this = this;
            this.headers = [];
            this.values = [];
            this.$table = tableRef || null;


            for (var i in displayObj) {
                if (displayObj.hasOwnProperty(i)) {
                    // Build the headers, either from the object passed
                    // itself, or from the table given.
                    if (!this.$table) {
                        for (var j in displayObj[i]) {
                            if(displayObj[i].hasOwnProperty(j)) {
                                this.addHeader(j);
                            }
                        }
                    }
                    else {
                        var tableId = this.$table.attr("id") + '-';
                        this.$table.find('thead').first().find('th').each(function() {
                            _this.addHeader(this.id.replace(tableId, ''));
                        });
                    }

                    // By using the headers just defined above,
                    // Add the values to the table from the object displayed.
                    var o = {};
                    for (var k in this.headers) {
                    	if(k.toString() == "centralOfficeCollection") {
                    		o[k] = this.customHeaders(k, displayObj[i][k]);
                    	}  else if (this.headers.hasOwnProperty(k)) {
                            o[k] = displayObj[i][k];
                        }
                    }
                    //this.values.push(displayObj[i]);
                    this.values.push(o);
                }
            }
            return this;
        };

        this.addHeader = function(h) {
            this.headers[h] = 1;
        };

        // TODO
        this.setColumnAction = function(headerName, cb) {
        };

        this.getHeaderMetadata = function() {
            var ret = {};
            if (this.$table) {

            }

            for (var i in this.headers) {
                if (this.headers.hasOwnProperty(i)) {
                    ret[i] = 'string';
                }
            }

            return ret;
        };


        this.populate = function() {
            if (this.$table) {
                this.populateRows(this.$table.find("tbody").first());
            }
        };
        
        this.customHeaders = function(k, data) {
        	var str= '' ;
        	if(k.toString() == "centralOfficeCollection") {
        		for (var i in data) {
        			if(data.hasOwnProperty(i)) {
        				str += data[i].displayName + " ";
        			}
        		}
        	}
        	
        	return str;
        };


        this.populateRows = function(where) {
            for (var i = 0; i < this.values.length; i++) {
                var $tr = $("<tr></tr>");

                for (var j in this.values[i]) {
                    $("<td></td>").html(this.values[i][j]).appendTo($tr);
                }

                $tr.appendTo(where);
            }
        };

        this.generate = function() {
            var $t  = $("<table></table>").addClass("main-area-table");
            var $th = $("<thead></thead>").appendTo($t);
            var $tb = $("<tbody></tbody>").appendTo($t);
            var $tHeaderRow = $("<tr></tr>").addClass("header-row").appendTo($th);

            for (var i in this.headers) {
                if (this.headers.hasOwnProperty(i)) {
                    $("<td></td>").html(i).appendTo($tHeaderRow);
                }
            }

            this.populateRows($tb);
            return $t;
        };

        return this.create(displayObj, tableRef);
    };

    window.osa = o;

}((window.osa || {}), undefined));