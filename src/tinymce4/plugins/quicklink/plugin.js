tinymce.PluginManager.add('quicklink', function (editor) {
    editor.on("init", function () {
        var quickLink, selection = editor.selection, dom = tinymce.DOM, editorDom = editor.dom;

        var Constants = {
            OK : "ok",
            EDIT : "edit",
            UNLINK : "unlink",
            CLOSE : "close"
        };

        var QuickLink = function (parentNode) {
            this._render(parentNode);
            this._bindEvent();
        };

        QuickLink.prototype = {
            _render : function (parentNode) {
                var html = [];
                html.push('<div class="mce-qlink-foward">');
                html.push('<div class="mce-qlink-link-wrap"><span class="mce-qlink-span">' + editor.getSettingsMessage("quick.link.foward") + '</span><a class="mce-qlink-link" target="_blank"></a>&#x200D;</div>');
                html.push('<div class="mce-qlink-ico-edit mce-plugin-ico mce-plugin-ico-edit" _v="' + Constants.EDIT + '" title="' + editor.getSettingsMessage("quick.link.edit") + '"></div>');
                html.push('<div class="mce-qlink-ico-unlink mce-plugin-ico mce-plugin-ico-unlink" _v="' + Constants.UNLINK + '" title="' + editor.getSettingsMessage("quick.link.unlink") + '"></div>');
                html.push('</div>');

                html.push('<div class="mce-qlink-edit"><input class="mce-qlink-input"/><div class="mce-qlink-ico-tick mce-plugin-ico mce-plugin-ico-tick" _v="' + Constants.OK + '" title="' + editor.getSettingsMessage("quick.link.ok") + '"></div></div>');
                html.push('<div class="mce-qlink-ico-close mce-plugin-ico mce-plugin-ico-close" _v="' + Constants.CLOSE + '" title="' + editor.getSettingsMessage("quick.link.close") + '"></div>');

                this.el = dom.add(parentNode, "div", {"class" : "mce-qlink-wrap", "style" : "display: none;"}, html.join(""));
            },
            _bindEvent : function () {
                var el = this.el;

                dom.bind(el, "click", function (e) {
                    var value = dom.getAttrib(e.target, "_v");
                    if (value) {
                        if (value == Constants.EDIT) {
                            this.toggle(false);

                        } else if (value == Constants.UNLINK) {
                            this.target && editor.execCommand("mceUnlink", false, this.target);
                            this.hide();

                        } else if (value == Constants.CLOSE) {
                            this.hide();

                        } else if (value == Constants.OK) {
                            this._changeHref() && this.hide();

                        }
                    }
                }, this);

                this.input = dom.select(".mce-qlink-input", el)[0];
                dom.bind(this.input, "keyup", function (e) {
                    if (e.keyCode == 13) {
                        this._changeHref() && this.hide();
                        e.preventDefault()
                        e.stopPropagation();
                    }

                }, this);

                this.link = dom.select(".mce-qlink-link", el)[0];
            },
            _changeHref : function () {
                if (this.target) {
                    var value = this.input.value;
                    if (value) {
                        dom.setAttrib(this.target, "href", value);
                        return true;
                    }
                }
            },
            _convertHref : function (href) {
                if (!href) return "";

                var strLength = (new String(href)).length, maxLength = 50;

                if (strLength <= maxLength) {
                    return href;
                }

                var splitLength = maxLength / 2;
                var start = href.substring(0, splitLength);
                var end = href.substring(strLength - splitLength);
                return start + "..." + end;
            },
            toggle : function (type) {
                var target = this.target;
                if (target) {
                    var href = dom.getAttrib(target, "href");
                    var foward = dom.select(">.mce-qlink-foward", this.el)[0];
                    var edit = dom.select(">.mce-qlink-edit", this.el)[0];
                    if (type) {
                        var link = this.link;
                        dom.setAttrib(link, "href", href);
                        dom.setText(link, this._convertHref(href));
                        dom.show(foward);
                        dom.hide(edit);
                    } else {
                        this.input.value = href;
                        dom.show(edit);
                        dom.hide(foward);
                    }
                }
            },
            showAt : function (targetNode) {
                if (targetNode) {
                    this.target = targetNode;

                    var href = dom.getAttrib(targetNode, "href");

                    if (href) {
                        this.toggle(true);
                    } else {
                        this.toggle(false);
                    }

                    var doc = editorDom.doc, el = this.el;
                    var position = editorDom.getPos(targetNode), targetHeight = editorDom.getHeight(targetNode);
                    var top = position.y - (doc.documentElement.scrollTop || doc.body.scrollTop) + targetHeight;
                    var left = position.x - (doc.documentElement.scrollLeft || doc.body.scrollLeft);

                    dom.show(el);

                    var offset = 10, elSize = dom.getSize(el);
                    var areaContainerSize = dom.getSize(editor.getContentAreaContainer());
                    var minTop = offset, minLeft = offset;
                    var maxTop = areaContainerSize.h - elSize.h - offset;
                    var maxLeft = areaContainerSize.w - elSize.w - offset;
                    top = Math.min(maxTop, top);
                    top = Math.max(minTop, top);
                    left = Math.min(maxLeft, left);
                    left = Math.max(minLeft, left);

                    dom.setStyles(el, {"top" : top, "left" : left});
                }
            },
            hide : function () {
                dom.hide(this.el);
                this.input.value = "";
                dom.setHTML(this.link, "");
                delete this.target;
            }
        };

        editor.addCommand("mceUnlink", function (ui, node) {
            if (node && node.nodeName.toLocaleLowerCase() == "a") {
                selection.select(node);
                editor.getDoc().execCommand("unlink");
                selection.collapse(false);
            }
        });

        var lastTime, lastParentNodes;
        editor.on("nodeChange", function (e) {
            lastParentNodes = e.parents;
            var now = lastTime = tinymce.getTimestamp();

            setTimeout(function () {
                if (now == lastTime && lastParentNodes) {
                    for (var i = 0, len = lastParentNodes.length; i < len; i++) {
                        var node = lastParentNodes[i];
                        if (node.nodeName.toLocaleLowerCase() == "a" && (node.parentNode || node.parentElement)) {
                            quickLink = quickLink || new QuickLink(editor.getContentAreaContainer());
                            quickLink.showAt(node);
                            break;
                        }
                    }
                }
            }, 500);

            quickLink && quickLink.hide();
        });

    });
});