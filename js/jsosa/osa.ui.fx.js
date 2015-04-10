
(function(o, undefined) {

    o.ui = o.ui || {};
    o.ui.fx = {

        pattern: function() {
            var DEFAULT_WIDTH = 700;
            var DEFAULT_HEIGHT = 500;
            var DEFAULT_NUMSHAPES = 1000;
            var DEFAULT_SIZE = 72;
            var DEFAULT_SPACEBETWEEN = 1;
            var DEFAULT_SIZERAND = 3;
            var DEFAULT_DISTANCE = 1;
            var DEFAULT_TRANS = 0.75;
            var DEFAULT_DISTRO = 'topleft';
            var DEFAULT_ROTATION = 'leftright';
            var DEFAULT_COLORS = ['#f8f8f8'];
            var _canG;

            // Various useful functions conveniently
            // wrapped in a class.
            var util = {

                // Nice helper function to generate a random number
                // from @min to @max and optional @step val
                random: function(min, max, step) {
                    step = step || 1;
                    return (Math.round(Math.random() * ((max - min)/step)) * step) + min;
                },

                // Exponentially-weighted random number generator
                exprandom: function(min, max, step) {
                    var r = Math.log(1 - Math.random()) / -3;
                    return (Math.round(r * ((max - min) / step)) * step) + min;
                },

                // Convert from Hex colors to RGBA color.
                hex2rgba: function(h, opacity) {
                    var cols = h.replace('#', '').match(/.{2}/g);

                    // If we can't parse the color, then throw something back
                    if (!cols || cols.length != 3) {
                        return 'rgba(0, 0, 0, 1)';
                    }

                    // Otherwise, go through the parsed list and convert to dec.
                    for (var i in cols) {
                        cols[i] = parseInt(cols[i], 16);
                    }
                    return 'rgba(' + cols.join(',') + ',' + opacity + ')';
                }
            };

            // Useful bit to be able to get a random entry from an array
            // (we do that a lot here).
            Array.prototype.randomEntry = function() {
                return this[util.random(0, this.length - 1)];
            };


            /////////////////////////////////
            // Shapes
            // This manages which shapes the user selected and handles the button
            // creation and drawing on the context.
            var shapeGenerator = function() {
                this.shapeList = [];
                this.size = DEFAULT_SIZE;
                this.numShapes = DEFAULT_NUMSHAPES;
                this.generatedNum = 0;
                this.sizeRand = DEFAULT_SIZERAND;
                this.maxW = 500;
                this.maxH = 500;

                // Adds a selected shapes from the form to the list of
                // 'active' shapes to use.
                this.addShape = function(type) {
                    this.shapeList.push(type);
                };

                // Resets the 'active' shapes list
                this.resetShapeList = function() {
                    this.generatedNum = 0;
                    this.shapeList = [];
                };


                // This is clearly the most important function of the whole app:
                // actually draws the shape with the given @color and @position to
                // the canvas (via @ctx).
                this.generateShape = function(ctx, color, position) {
                    if (this.shapeList.length > 0) {
                        var thisShapesSize = this.size * util.random(1, this.sizeRand);
                        var newShapeGuy = this.shapeList.randomEntry();

                        for (var p = 0; p < position.length; p++) {
                            ctx.save();
                            ctx.translate(position[p].x, position[p].y);
                            ctx.rotate(position[p].r);
                            ctx.fillStyle = color;
                            ctx.beginPath();

                            switch (newShapeGuy) {
                                case 'triangle':
                                    ctx.moveTo(0, 0);
                                    ctx.lineTo(0, thisShapesSize);
                                    ctx.lineTo(thisShapesSize, thisShapesSize);
                                    ctx.fill();
                                    break;
                                case 'triangle2':
                                    ctx.moveTo(0, 0);
                                    ctx.lineTo(0, thisShapesSize);
                                    ctx.lineTo(thisShapesSize / 2, thisShapesSize / 2);
                                    ctx.fill();
                                    break;
                                case 'triangle3':
                                    ctx.moveTo(0, 0);
                                    ctx.lineTo(0, thisShapesSize);
                                    ctx.lineTo(thisShapesSize, thisShapesSize / 2);
                                    ctx.fill();
                                    break;
                                case 'diamond':
                                    var s2 = thisShapesSize / 2;
                                    ctx.moveTo(s2, 0);
                                    ctx.lineTo(0, s2);
                                    ctx.lineTo(s2, thisShapesSize);
                                    ctx.lineTo(thisShapesSize, s2);
                                    ctx.fill();
                                    break;
                                case 'lines':
                                    ctx.strokeStyle = color;
                                    ctx.lineWidth = 1;
                                    ctx.lineCap = 'square';
                                    ctx.moveTo(0, 0);
                                    ctx.lineTo(0, thisShapesSize);
                                    ctx.lineTo(thisShapesSize, thisShapesSize / 2);
                                    ctx.lineTo(0, 0);
                                    ctx.stroke();
                                    ctx.lineWidth = 2;
                                    ctx.moveTo(thisShapesSize, 0);
                                    ctx.lineTo(0, thisShapesSize / 2);
                                    ctx.lineTo(thisShapesSize, thisShapesSize);
                                    ctx.stroke();
                                    ctx.moveTo(0, 0);
                                    ctx.lineWidth = 1;
                                    ctx.lineTo(thisShapesSize, thisShapesSize * 2);
                                    ctx.stroke();
                                    ctx.moveTo(thisShapesSize, 0);
                                    ctx.lineTo(0, thisShapesSize * 2);
                                    ctx.stroke();
                                    break;
                                default:
                                    break;
                            }

                            ctx.restore();
                        }
                    }
                };
            };


            /////////////////////////////////
            // Colors
            // Handles the generation of the color buttons, handles the interface
            // to ColourLovers, and handles the weighted values from the CL list.
            var colorScheme = function() {
                this.transparency = DEFAULT_TRANS;
                this.colorList = [];

                // Handles colors in hex format (we'll process them via util.hex2rgba).
                this.addColor = function(c, w) {
                    var count = w ? w * 100 : 1;
                    for (var i = 0; i < count; i++) {
                        this.colorList.push(c);
                    }
                };

                // Pretty self-explanatory, resets the list (either from
                // new scheme selection, reset button or form submission.
                this.resetColorList = function() {
                    this.colorList = [];
                };

                // Return a random color in RGBA format.
                this.generateColor = function() {
                    return util.hex2rgba(this.colorList.randomEntry(), this.transparency);
                };
            };

            /////////////////////////////////
            // Distribution Scheme
            // This handles the positioning and rotation of the elements on the field.
            // The schemes for the different distributions are calculated in this class.
            var distributionScheme = function() {
                this.space = DEFAULT_SPACEBETWEEN;
                this.distance = DEFAULT_DISTANCE;
                this.type = DEFAULT_DISTRO;
                this.docw = DEFAULT_WIDTH;
                this.doch = DEFAULT_HEIGHT;
                this.shapeSize = DEFAULT_SIZE;
                this.rotate = DEFAULT_ROTATION;

                // Easy wrapper that is called from the submit so
                // that we can use these values in this class.
                this.setDocSize = function(w, h, shapeSize) {
                    this.docw = w;
                    this.doch = h;
                    this.shapeSize = shapeSize;
                };

                // Gets the initial position for the distribution scheme
                // returns an obj as {x: #, y: #}
                this.getInitialPosition = function() {
                    var x, y;

                    switch(this.type) {
                        case 'even':
                        case 'topleft':
                            x = 0; y = 0;
                            break;
                        default:
                            x = 0; y = 0;
                            break;
                    }

                    return {x: x, y: y};
                };

                // This returns a set of points and rotations for shapeGenerator to position things
                // return value is an array of {x:#, y:#, r:#}
                // @i is the shape index, used specifically by spiral to generate position.
                this.generatePositions = function(i) {
                    var r, ret = [],
                        s  = ~~(this.shapeSize / this.space),
                        ss = ~~(this.docw / s) + 1;

                    switch(this.rotate) {
                        case 'ortho':
                            r = Math.PI / 180 * util.random(0, 270, 90);
                            break;
                        case 'leftright':
                            r = Math.PI / 180 * util.random(0, 180, 180);
                            break;
                        default:
                            r = 0;
                            break;
                    }

                    switch(this.type) {
                        case 'random':
                            ret.push({x: util.random(0, this.docw, s), y: util.random(0, this.doch, s), r:r});
                            break;

                        case 'even':
                            var x1 = (i % ss) * s;
                            var y1 = ~~((i * s) / this.docw) * s;
                            ret.push({x:x1, y:y1 , r:r});
                            break;

                        case 'topleft':
                            var w1 = ~~(this.docw / (2 * this.distance));
                            var h1 = ~~(this.doch / (2 * this.distance));
                            var w2 = util.exprandom(0, w1, s);
                            var h2 = util.exprandom(0, h1, s);
                            ret.push({x:w2, y:h2, r:r});
                            break;

                        case 'topright':
                            var w1 = ~~(this.docw / (2 * this.distance));
                            var h1 = ~~(this.doch / (2 * this.distance));
                            var w2 = this.docw - util.exprandom(0, w1, s);
                            var h2 = util.exprandom(0, h1, s);
                            ret.push({x:w2, y:h2, r:r});
                            break;

                        case 'center':
                            var w1 = ~~(this.docw / (2 * this.distance));
                            var h1 = ~~(this.doch / (2 * this.distance));
                            var w2 = util.exprandom(0, w1, s);
                            var h2 = util.exprandom(0, h1, s);
                            w2 = (Math.random() > 0.5) ? w2 * -1 : w2;
                            h2 = (Math.random() > 0.5) ? h2 * -1 : h2;
                            ret.push({x:w2, y:h2, r:r});
                            break;

                        default:
                            break;
                    }
                    return ret;
                };
            };


            /////////////////////////////////
            // Generator
            // The master of ceremonies, this will aggregate all of the objects
            // and render the image based on those parameters.
            var imageGenerator = function(w,h, shapeGenObj, colorSchemeObj, distroSchemeObj) {
                this.w = w;
                this.h = h;
                this.shapes = shapeGenObj;
                this.colorScheme = colorSchemeObj;
                this.distroScheme = distroSchemeObj;

                // Draw a Background Field with a BG Color
                // (which will remove that color from the list of colors)
                this.refresh = function(ctx) {
                    ctx.fillStyle = this.colorScheme.generateBGColor();
                    ctx.fillRect(0, 0, this.w, this.h);
                };

                // Generate the whole image.  Loop through the Shape Generator and
                // add the shapes based on the Distribution Scheme and Color Scheme
                this.generate = function(ctx) {
                    var ip = this.distroScheme.getInitialPosition();
                    ctx.translate(ip.x, ip.y);

//                    for (var i = 0; i < this.shapes.numShapes; i++) {
//                        this.shapes.generateShape(ctx, this.colorScheme.generateColor(), this.distroScheme.generatePositions(i));
//                    }
                };
            };

            this.render = function() {
                // Initialze Shapes
                var s = new shapeGenerator();
                var c = new colorScheme();
                var d = new distributionScheme();

                s.resetShapeList();
                c.resetColorList();

                var w = window.screen.width * (window.devicePixelRatio || 1);
                var h = window.screen.height * (window.devicePixelRatio || 1);

                DEFAULT_COLORS.map(function(e) {c.addColor(e); });

                // Process all the shape selections
                s.size = DEFAULT_SIZE;
                s.numShapes = DEFAULT_NUMSHAPES;
                s.sizeRand = DEFAULT_SIZERAND;
                s.addShape(['triangle3', 'triangle2', 'diamond'].randomEntry());

                // Process distribution options
                d.setDocSize(w, h, s.size);
                var canvTag = $("#decor").get(0);
                canvTag.width = w;
                canvTag.height = h;
                var ctx = canvTag.getContext('2d');

                _canG = new imageGenerator(w, h, s, c, d);
                _canG.generate(ctx);
                return false;
            };
        },

        renderPattern: function() {
            var wut = new osa.ui.fx.pattern();
            wut.render();
            //window.osa.ui.fx.pattern.render();
        }
    };

    window.osa = o;

}((window.osa || {}), undefined));