
(function(o, undefined) {
    o.ui = o.ui || {};

    var _openBox;
    var __closeOpenBoxes = function() {
        _openBoxes.hide();
    };

    o.ui.modalBox = {
        type: 'alert',
        title: "Message",
        message: '',
        buttonList: [],
        boxID: 0,

        getTypes: function() {
            return ['info', 'warn', 'alert'];
        },

        initialize: function() {
            this.buttonList = [];
            this.$CONTAINER = $("<div></div>").addClass('modal-box three-d-go');
            this.$OVERLAY = $("<div></div>").addClass('overlay');
            this.$BOXWRAPPER = $("<div></div").addClass('window-wrapper').addClass('flip-from-middle-horiz anim-fast');
            this.$BOX = $('<div></div>').addClass('window');
            this.$TITLE = $("<h1></h1>").addClass('title');
            this.$MESG = $("<p></p>").addClass('message');
            this.$BUTTONCONTAINER = $('<div></div>').addClass('button-container');

            this.$BOX.append(this.$TITLE).append(this.$MESG).append(this.$BUTTONCONTAINER);
            this.$BOXWRAPPER.append(this.$BOX);
            this.$CONTAINER.append(this.$OVERLAY).append(this.$BOXWRAPPER);

            //this.$CONTAINER.hide();
            this.$OVERLAY.hide();
            this.$BOXWRAPPER.addClass('hide');
        },

        create: function(options) {
            var _this = this;
            this.initialize();
            this.$CONTAINER.addClass(options.type || this.getTypes()[0]);
            this.$TITLE.html(options.title);
            this.$MESG.html(options.mesg);

            if (!options.buttons) {
                this.addButton('Close', _this.hide, true);
            }
            else {
                for (var i = 0; i < options.buttons.length; i++) {
                    this.addButton(options.buttons[i].action, options.buttons[i].callback);
                }
            }

            if (options.primaryAction) {
                this.setPrimaryButton[options.primaryAction];
            }

            _openBox = this;
            return this;
        },

        addButton: function(actionName, callback, isPrimaryAction) {
            var _this = this;
            callback = callback || $.noop;

            this.buttonList[actionName] =
                $('<a></a>', {
                    html: actionName,
                    href: '#',
                    click: function(ev) {
                        ev.preventDefault();
                        callback.call(_this);
                    },
                    'class': 'button button-3'
                })
                .appendTo(_this.$BUTTONCONTAINER);

            if (isPrimaryAction) {
                this.setPrimaryButton(actionName);
            }
        },

        setPrimaryButton: function(actionName) {
            if (this.buttonList[actionName]) {
                this.buttonList[actionName].addClass('primaryAction')
            }
        },

        alert: function(title, mesg, isOverrideOpened) {
            if (!_openBox) {
                this.create({type: 'alert', title: title, mesg: mesg}).show();
            }
        },

        warn: function(title, mesg, isOverrideOpened) {
            if (!_openBox) {
                this.create({type: 'warn', title: title, mesg: mesg}).show();
            }
        },

        show: function() {
            $("#main-area").addClass("zoom-out");
            this.$CONTAINER.appendTo('body').hide();
            this.$CONTAINER.show();
            this.$OVERLAY.fadeIn();
            this.$BOXWRAPPER.removeClass("hide");
        },

        hide: function() {
            var _this = this;
            this.buttonList = [];
            this.$OVERLAY.fadeOut(ANIMATE_SPEED);
            this.$BOXWRAPPER.addClass('hide');
            setTimeout(function() {
                _this.$TITLE.empty();
                _this.$MESG.empty();
                _this.$BUTTONCONTAINER.empty();
                _this.$CONTAINER.hide().remove();
                $("#main-area").removeClass("zoom-out");
                _openBox = null;
            }, ANIMATE_SPEED);

        }
    };

    window.osa = o;

}((window.osa || {}), undefined));