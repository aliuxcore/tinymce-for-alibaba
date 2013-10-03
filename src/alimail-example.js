aym.createClass("aym.control.ui.HtmlEditor", "aym.control.SharedUIControl", function (aym, base) {
    var EDITOR_HEIGHT = 300;
    return {
        initialize : function (oParent, oDomNode, config) {
            base.callBase(this, cnst.CONSTRUCT_NAME, [
                oParent, oDomNode, util.extend({
                    resize : true,
                    localImage : 1,
                    borderWidth : 1,
                    fullScreen : true,
                    height : EDITOR_HEIGHT
                }, config, 1)
            ]);

            this.__bIsHtml = 1;
            this.__bReadonly = 0;
            this.__oDelayFuns = [];
            this.publish(cnst.EVENT.CHANGE, cnst.EVENT.CONTROLRESIZE);
            this._initPlainEditor();
            this._initHtmlEditor();
        },
        _initPlainEditor : function () {
            var oPlainEditor = this.__oPlainEditor = this.el.find(".textarea_content");
            oPlainEditor.parents(".htmleditor_field_plain").css({borderWidth : util.getInt(this.cfg("borderWidth"))});

            var fnDirty = $.proxy(function () {
                this.status("plainDirty", 1);
            }, this);

            oPlainEditor.bind({
                keyup : fnDirty,
                paste : fnDirty
            });
        },
        _buildPlugins : function () {
            var oPlugins = [
                "advlist", "autolink", "formlink", "imageuploader", "lists", "hr", "togglemore",
                "textcolor", "insertdatetime", "tablev2", "emotionsv2", "paste", "quickimage", "quicklink", "loading"
            ];

            if ((!env.isIE6) && (!env.isIE7) && this.cfg("fullScreen")) {
                oPlugins.push("fullscreen");
            }
            return oPlugins;
        },
        _initHtmlEditor : function () {
            var sId = util.id(), _self = this;
            this.el.find(".htmleditor_field_editor").attr("id", sId);

            var toolbar_1 = [
                "fullscreen undo redo", "fontselect fontsizeselect",
                "bold italic underline strikethrough removeformat",
                "forecolor backcolor", "table imageuploader emoticons togglemore"
            ];
            var toolbar_2 = [
                "alignleft aligncenter alignright alignjustify",
                "bullist numlist outdent indent", "link hr inserttime"
            ];

            tinymce.init({
                selector : "#" + sId,
                theme : "modern",
                height : this.cfg("height"),
                resize : this.cfg("resize"),
                border_width : this.cfg("borderWidth"),
                target_list : false,
                convert_urls : false,
                visual : false,
                keep_values : false,
                forced_root_block : 'div',
                show_system_default_font : true,
                content_style : aym.global.HtmlTemplateCache.getTemplate('editorContentCss'),
                local_image : !!this.cfg("localImage"),
                attach_owner : aym.global.UserData.getEmail(),
                plugins : this._buildPlugins(),
                toolbar_1 : toolbar_1.join(" | "),
                toolbar_2 : toolbar_2.join(" | "),
                default_style_fun : aym.util.getDefaultFontStyle,
                render_empty_fun : aym.util.renderEmptyNodeWithDefaultFontStyle,
                init_instance_callback : function () {
                    _self._afterEditorInitialized.call(_self, this);
                },
                quote_class : cnst.ALIYUN_PREVIOUS_QUOTE,
                menu_class : "aym_scroll mce-y-scroll",
                iframe_class : "aym_editor_iframe aym_scroll aym_scroll_auto",
                full_screen_compute_top_fun : function () {
                    var top = "0px", oWrapNode = $(".aym_page_wrap");
                    if (oWrapNode.length > 0) {
                        top = oWrapNode.offset().top + "px";
                    }
                    return top;
                },
                i18n_messages : {
                    //tinymce.js
                    "default.font" : $M("editor.core.font.default"),
                    "button.ok" : $M("common.ok"),
                    "button.cancel" : $M("common.cancel"),
                    "button.bold" : $M("editor.button.title.bold"),
                    "button.italic" : $M("editor.button.title.italic"),
                    "button.underline" : $M("editor.button.title.underline"),
                    "button.strikethrough" : $M("editor.menu.title.strikethrough"),
                    "button.outdent" : $M("editor.button.title.indent.decrease"),
                    "button.indent" : $M("editor.button.title.indent.increase"),
                    "button.horizontal.line" : $M("editor.menu.title.horizontal.line"),
                    "button.remove.format" : $M("editor.menu.title.clear.format"),
                    "button.align.left" : $M("editor.button.title.align.left"),
                    "button.align.center" : $M("editor.button.title.align.center"),
                    "button.align.right" : $M("editor.button.title.align.right"),
                    "button.align.justify" : $M("editor.button.title.align.justify"),
                    "button.undo" : $M("editor.button.title.undo"),
                    "button.redo" : $M("editor.button.title.redo"),
                    "font.family.list" : $M("editor.core.font.family.zhcn") + ";" + $M("editor.core.font.family.en"),
                    "button.font.family" : $M("editor.button.title.font.family"),
                    "font.size.list" : $M("editor.core.font.size.simple"),
                    "button.font.size" : $M("editor.button.title.font.size"),

                    //advlist/plugin.js
                    "button.number.list" : $M("editor.button.title.number.list"),
                    "number.default" : $M("editor.menu.title.default"),
                    "number.lower.alpha" : $M("editor.menu.title.number.lower.alpha"),
                    "number.lower.greek" : $M("editor.menu.title.number.lower.greek"),
                    "number.lower.roman" : $M("editor.menu.title.number.lower.roman"),
                    "number.upper.alpha" : $M("editor.menu.title.number.upper.alpha"),
                    "number.upper.roman" : $M("editor.menu.title.number.upper.roman"),
                    "button.bullet.list" : $M("editor.button.title.bullet.list"),
                    "bullet.default" : $M("editor.menu.title.default"),
                    "bullet.circle" : $M("editor.menu.title.bullet.circle"),
                    "bullet.disc" : $M("editor.menu.title.bullet.disc"),
                    "bullet.square" : $M("editor.menu.title.bullet.square"),

                    //togglemore/plugin.js
                    "button.toggle.more" : $M("editor.button.title.toggle.more"),

                    //emotionsv2/plugin.js is only for alimail
                    "button.emotion" : $M("editor.button.title.emotion"),

                    //formlink/plugin.js is only for alimail
                    "button.link.insert.edit" : $M("editor.button.title.link.insert.edit"),
                    "button.link.remove" : $M("editor.button.title.link.remove"),

                    //fullscreen/plugin.js
                    "button.fullscreen" : $M("editor.button.title.fullscreen"),

                    //imageuploader/plugin.js is only for alimail
                    "button.image" : $M("editor.button.title.image"),
                    "imageuploader.local" : $M("editor.plugin.imageuploader.local"),
                    "imageuploader.network" : $M("editor.plugin.imageuploader.network"),

                    //insertdatetime/plugin.js
                    "button.date.time" : $M("editor.menu.title.date.time"),

                    //textcolor/plugin.js
                    "button.text.color" : $M("editor.button.title.text.color"),
                    "button.background.color" : $M("editor.button.title.background.color"),

                    //quote/plugin.js
                    "image.quote.title" : $M("editor.plugin.quote.toggle.title"),

                    //quickimage/plugin.js
                    "quick.image.small" : $M("editor.plugin.quickimage.small"),
                    "quick.image.middle" : $M("editor.plugin.quickimage.middle"),
                    "quick.image.big" : $M("editor.plugin.quickimage.big"),
                    "quick.image.original" : $M("editor.plugin.quickimage.original"),
                    "quick.image.remove" : $M("editor.plugin.quickimage.remove"),
                    "quick.image.close" : $M("editor.plugin.quickimage.close"),

                    //loading/plugin.js
                    "loading.title" : $M("editor.core.prompt.loading"),

                    //quicklink/plugin.js
                    "quick.link.foward" : $M("editor.plugin.quicklink.forward"),
                    "quick.link.edit" : $M("editor.plugin.quicklink.edit"),
                    "quick.link.unlink" : $M("editor.plugin.quicklink.unlink"),
                    "quick.link.ok" : $M("editor.plugin.quicklink.ok"),
                    "quick.link.close" : $M("editor.plugin.quicklink.close")
                }
            });
        },
        _afterEditorInitialized : function (oHtmlEditor) {
            this.__oHtmlEditor = oHtmlEditor;
            this.clearDirty();

            this.__oHtmlEditor.on("ResizeEditor", $.proxy(function () {
                    this.fire(cnst.EVENT.CONTROLRESIZE);

                }, this)).on("click", $.proxy(function () {
                    this.el.click();

                }, this));

            util.delay($.proxy(function () {
                this.fire(cnst.EVENT.CONTROLRESIZE);
            }, this));

            env.isIE && this._getHtmlEditorBody().attr("hideFocus", "hideFocus");

            var oDelayFuns = this.__oDelayFuns;
            while (oDelayFuns.length > 0) {
                var fn = oDelayFuns.shift();
                fn.call(this);
            }

            this.status("ready", 1);
        },
        toggleTextMode : function (sPrompt) {
            this._waitForReady(function () {
                var fnToggle = function (sValue) {
                    this.setTextMode(sValue);
                    this.focus();
                };

                if (this.__bIsHtml) {
                    util.confirm(sPrompt || '', $.proxy(function () {
                        fnToggle.call(this, 0);
                    }, this));
                } else {
                    fnToggle.call(this, 1);
                }
            });
        },
        setTextMode : function (bIsHtml) {
            this._waitForReady(function () {
                if ((!!bIsHtml) ^ (!!this.__bIsHtml)) {
                    this._togglePlainEditor(bIsHtml ? 0 : 1);
                    this.__oHtmlEditor && $(this.__oHtmlEditor.getContainer())[bIsHtml ? "show" : "hide"]();

                    if (bIsHtml) {
                        this._setHtmlContent(util.renderEmptyNodeWithDefaultFontStyle() + util.convertTextToHtml(this.__oPlainEditor.val()));
                    } else {
                        this.clearUndo();
                        this.__oPlainEditor.val(util.convertHtmlToText(this._getHtmlContent()));
                    }

                    this.__bIsHtml = bIsHtml;
                    this.fire(cnst.EVENT.CHANGE, {html : bIsHtml});
                    this.fire(cnst.EVENT.CONTROLRESIZE);
                }
            });
        },
        _togglePlainEditor : function (flag) {
            var oParentNode = this.__oPlainEditor.parents(".htmleditor_field_plain");
            if (flag) {
                oParentNode.show();
                var oHtmlEditorHeight = $(this.__oHtmlEditor.getContainer()).outerHeight(true);
                var offset = oParentNode.outerHeight(true) - oParentNode.height();
                oParentNode.find(".textarea_content").height(oHtmlEditorHeight - offset);
            } else {
                oParentNode.hide();
            }
        },
        setEditorOwner : function (sOwner) {
            if (sOwner) {
                this.status('owner', sOwner);

                this._addHtmlEditorSetting(function () {
                    return {attach_owner : this.status('owner')};
                });
            }
        },
        allowLocalImage : function (bAllowLocalImage) {
            if (util.isDef(bAllowLocalImage)) {
                this.cfg('localImage', !!bAllowLocalImage);

                this._addHtmlEditorSetting(function () {
                    return {local_image : this.cfg('localImage')};
                });
            }
        },
        _addHtmlEditorSetting : function (fnCb) {
            this._waitForReady(function () {
                fnCb && util.extend(this.__oHtmlEditor.getSettings(), fnCb.call(this), 1);
            });
        },
        _waitForReady : function (fnCb) {
            if (this.isEditorReady()) {
                fnCb && fnCb.call(this);
            } else {
                this.__oDelayFuns.push(fnCb);
            }
        },
        insertContent : function (sContent, bHtml) {
            if (this.__bIsHtml) {
                if (!bHtml) {
                    sContent = util.convertTextToHtml(sContent);
                }

                this.__oHtmlEditor.insertContent(sContent);
            } else {
                if (bHtml) {
                    sContent = util.convertHtmlToText(sContent);
                }

                var oTextNode = this.__oPlainEditor;
                var nPos = oTextNode.cursorPos();
                var sOldText = oTextNode.val();

                if (nPos < 0) {
                    nPos = sOldText.length;
                }

                oTextNode.val(sOldText.substring(0, nPos) + sContent + sOldText.substring(nPos));
                oTextNode.cursorPos(nPos + sContent.length);
            }

            this.focus();
        },
        focus : function () {
            if (this.__bIsHtml) {
                this.__oHtmlEditor && this.__oHtmlEditor.focus();
            } else {
                return this.__oPlainEditor.focus();
            }
        },
        setEditorReadonly : function (newValue) {
            this._waitForReady(function () {
                if ((!!this.__bReadonly) ^ (!!newValue)) {
                    this.__bReadonly = newValue;
                    this.__oPlainEditor.prop('readonly', newValue ? 'readonly' : '');
                    this._getHtmlEditorBody().attr('contentEditable', newValue ? 'false' : 'true');

                    var items = this.__oHtmlEditor.theme.panel.items();
                    if (items && items.length >= 2) {
                        var oToolbarNode = $(items[0].getEl());
                        var oIframeNode = $(items[1].getEl()).find("iframe");
                        if (newValue) {
                            var h = oToolbarNode.outerHeight(true);
                            oToolbarNode.hide();
                            oIframeNode.height(oIframeNode.height() + h);
                        } else {
                            oToolbarNode.show();
                            var h = oToolbarNode.outerHeight(true);
                            oIframeNode.height(oIframeNode.height() - h);
                        }
                    }
                }
            });
        },
        getContent : function () {
            return this.__bIsHtml ? this._getHtmlContent() : this.__oPlainEditor.val();
        },
        setContent : function (c, bHtml) {
            this._waitForReady(function () {
                this.setTextMode(!!bHtml);

                if (bHtml) {
                    this._setHtmlContent(c);
                } else {
                    this.__oPlainEditor.val(c);
                }

                this.clearDirty();
            });
        },
        _getHtmlContent : function () {
            var oHtmlEditor = this.__oHtmlEditor;
            return oHtmlEditor ? oHtmlEditor.getContent() : "";
        },
        _getHtmlEditorBody : function () {
            var oHtmlEditor = this.__oHtmlEditor;
            return oHtmlEditor ? $(oHtmlEditor.getBody()) : null;
        },
        showLoading : function (fnCb, context) {
            var editor = this.__oHtmlEditor;
            if (editor && editor.showLoading) {
                editor.showLoading(fnCb, context);
            } else {
                fnCb && fnCb.call(context || this);
            }
        },
        _setHtmlContent : function (c) {
            var editor = this.__oHtmlEditor;
            if (editor) {
                editor.setContent(c || "");
                this.clearUndo();
            }
        },
        clearUndo : function () {
            var editor = this.__oHtmlEditor;
            editor && editor.undoManager.clear();
        },
        clear : function () {
            this.setContent('', 1);
            this.allowLocalImage(1);
            this.setEditorReadonly(0);
            this.setEditorOwner(aym.global.UserData.getEmail());
            this.__oHtmlEditor && this.__oHtmlEditor.fire("ClearConvertContent");
        },
        clearDirty : function () {
            this.__bLastHtmlFlag = this.__bIsHtml;
            this.status("plainDirty", 0);
            if (this.__oHtmlEditor) {
                this.__oHtmlEditor.isNotDirty = true;
            }
        },
        isDirty : function () {
            if (this.__bIsHtml != this.__bLastHtmlFlag) {
                return 1;
            }

            if (this.__bIsHtml) {
                return this.__oHtmlEditor ? this.__oHtmlEditor.isDirty() : 0;
            } else {
                return this.status("plainDirty");
            }
        },
        isEditorReady : function () {
            return !!this.status("ready");
        },
        isHtml : function () {
            return this.__bIsHtml;
        },
        _doDispose : function () {
            base.callBase(this, cnst.DISPOSE_NAME);

            this.__oHtmlEditor && tinymce.remove(this.__oHtmlEditor);
            this.__oHtmlEditor = this.__oPlainEditor = null;
        }
    };
});