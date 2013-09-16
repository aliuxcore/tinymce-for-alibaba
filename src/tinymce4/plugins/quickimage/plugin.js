tinymce.PluginManager.add('quickimage', function (editor) {
    editor.on("init", function () {
        var quickImage, selection = editor.selection, dom = tinymce.DOM, editorDom = editor.dom;

        var Constants = {
            SMALL : "small",
            MIDDLE : "middle",
            BIG : "big",
            ORIGINAL : "original",
            REMOVE : "remove",
            CLOSE : "close"
        };

        var QuickImage = function (parentNode) {
            this._render(parentNode);
            this._bindEvent();
        };

        QuickImage.prototype = {
            _render : function (parentNode) {
                var html = ['<a _v="' + Constants.SMALL + '">' + editor.getSettingsMessage("quick.image.small") + '</a>-'];
                html.push('<a _v="' + Constants.MIDDLE + '">' + editor.getSettingsMessage("quick.image.middle") + '</a>-');
                html.push('<a _v="' + Constants.BIG + '">' + editor.getSettingsMessage("quick.image.big") + '</a>-');
                html.push('<a _v="' + Constants.ORIGINAL + '">' + editor.getSettingsMessage("quick.image.original") + '</a>-');
                html.push('<a _v="' + Constants.REMOVE + '">' + editor.getSettingsMessage("quick.image.remove") + '</a>');
                html.push('<div class="mce-quick-img-ico mce-plugin-ico mce-plugin-ico-cross" _v="' + Constants.CLOSE + '" title="' + editor.getSettingsMessage("quick.image.close") + '"></div>');

                this.el = dom.add(parentNode, "div", {"class" : "mce-quick-img-wrap", "style" : "display: none;"}, html.join(""));
            },
            _bindEvent : function () {
                dom.bind(this.el, "click", function (e) {
                    var value = dom.getAttrib(e.target, "_v");
                    if (value) {
                        if (value == Constants.SMALL || value == Constants.MIDDLE || value == Constants.BIG || value == Constants.ORIGINAL) {
                            this._changeTargetSize(value);
                            this.hide();

                        } else if (value == Constants.REMOVE) {
                            this.target && editor.execCommand("mceImageDelete", false, this.target);
                            this.hide();

                        } else if (value == Constants.CLOSE) {
                            this.hide();

                        }
                    }
                }, this);
            },
            _changeTargetSize : function (value) {
                var target = this.target;
                if (target) {
                    editorDom.setAttribs(target, {"height" : null, "width" : null});

                    var origWidth = editorDom.getAttrib(target, "origwidth");
                    var origHeight = editorDom.getAttrib(target, "origheight");
                    if (!origWidth || !origHeight) {
                        editorDom.setStyles(target, {"width" : "auto", "height" : "auto"});
                        var size = editorDom.getSize(target);
                        origWidth = size.w, origHeight = size.h;
                        editorDom.setAttribs(target, {"origwidth" : origWidth, "origheight" : origHeight});
                    }

                    var width = this.getConstantsWidth(value) || "auto", height;
                    if (width == "auto") {
                        height = "auto";
                    } else {
                        height = parseInt(width / (origWidth / origHeight));
                    }

                    editorDom.setStyles(target, {
                        "width" : width,
                        "height" : height
                    });
                }
            },
            getConstantsWidth : function (value) {
                if (value == Constants.SMALL) {
                    return 80;
                } else if (value == Constants.MIDDLE) {
                    return 240;
                } else if (value == Constants.BIG) {
                    return 480;
                }
            },
            showAt : function (targetNode) {
                if (targetNode) {
                    this.target = targetNode;

                    var doc = editorDom.doc, el = this.el;
                    var position = editorDom.getPos(targetNode), targetHeight = editorDom.getSize(targetNode).h;
                    var top = position.y - (doc.documentElement.scrollTop || doc.body.scrollTop) + targetHeight;
                    var left = position.x - (doc.documentElement.scrollLeft || doc.body.scrollLeft);

                    var elSize = this.size;
                    if (!elSize) {
                        dom.show(el);
                        elSize = this.size = dom.getSize(el);
                    }

                    var offset = 10;
                    var areaContainerSize = dom.getSize(editor.getContentAreaContainer());
                    var minTop = offset, minLeft = offset;
                    var maxTop = areaContainerSize.h - elSize.h - offset;
                    var maxLeft = areaContainerSize.w - elSize.w - offset;
                    top = Math.min(maxTop, top);
                    top = Math.max(minTop, top);
                    left = Math.min(maxLeft, left);
                    left = Math.max(minLeft, left);

                    dom.setStyles(el, {"top" : top, "left" : left});
                    dom.show(el);
                }
            },
            hide : function () {
                dom.hide(this.el);
                delete this.target;
            }
        };

        editor.addCommand("mceImageDelete", function (ui, node) {
            if (node && node.nodeName.toLocaleLowerCase() == "img") {
                var rng = editorDom.createRng();

                rng.setStartAfter(node);
                rng.setEndAfter(node);

                selection.setRng(rng);

                editorDom.remove(node);
            }
        });

        editor.on("nodeChange", function (e) {
            var node = e.element, doHide = true;

            if (node && node.nodeName.toLocaleLowerCase() == "img") {
                quickImage = quickImage || new QuickImage(editor.getContentAreaContainer());
                quickImage.showAt(node);
                doHide = false;
            }

            doHide && quickImage && quickImage.hide();
        });
    });
});