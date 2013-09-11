tinymce.PluginManager.add('imageuploader', function (editor) {
    var W = window, D = document, aym = W.aym, cnst = aym.cnst, util = aym.util, env = aym.env;

    function showImageUploaderDialog() {
        var sOwner = editor.getSettings().attach_owner;
        var d = new aym.control.ui.ImageUploaderDialog(util.id());
        d.onForShow(cnst.EVENT.SUCCESS,
            function (o) {
                var oFile = o.file;

                if (oFile) {
                    var sTempUrl = oFile.tempUrl;

                    if (sTempUrl) {
                        aym.global.UserData.fetchAttachToken(function (sToken) {
                            var sFilename = oFile.name;
                            var oParam = {
                                e : sOwner,
                                m : sOwner,
                                f : sTempUrl,
                                s : sToken,
                                n : sFilename
                            };

                            var ext = sFilename.substring(sFilename.lastIndexOf('.') + 1).toLowerCase();
                            if (ext) {
                                oParam.ext = ext;
                            }

                            var sUrl = util.addUrlParam(env.attachUrlPrefix.downloadTemp, util.buildQuery(oParam));
                            editor.insertContent('<img src="' + sUrl + '"/>');
                        });
                    }
                }
            }).onForShow(cnst.EVENT.AFTERSHOW, function () {
                this.setOwner(sOwner);
            });
        d.show();
    }

    function showNetworkImageDropdown() {
        var oDomNoe = $(this.getEl());

        var d = aym.global.ControlsWidget.getControl(cnst.CONTROLS.NETWORK_IMAGE_DD);
        d.onForShow(cnst.EVENT.CONTROLBUTTONCLICK, $.proxy(function (sUrl) {

            this.insertContent('<img src="' + sUrl + '"/>');

        }, editor)).show({
                trigger : oDomNoe,
                target : oDomNoe,
                target_x : 'L',
                target_y : 'B',
                obj_x : 'L',
                obj_y : 'T'
            });
    }

    editor.addButton('imageuploader', {
        type : 'extsplitbutton',
        icon : 'image',
        tooltip : editor.getSettingsMessage("button.image"),
        beforeShowMenu : function () {
            var menuItems = this.menu.items();
            var localImage = editor.settings.local_image;
            for (var i = 0, len = menuItems.length; i < len; i++) {
                var menuItem = menuItems[i];
                var settings = menuItem.settings;
                if (settings.value == "local") {

                    if (localImage) {
                        $(menuItem.getEl()).show();
                    } else {
                        $(menuItem.getEl()).hide();
                    }
                    break;
                }
            }
        },
        menu : [
            {
                text : editor.getSettingsMessage("imageuploader.local"),
                value : "local"
            },
            {
                text : editor.getSettingsMessage("imageuploader.network"),
                value : "network"
            }
        ],
        onselect : function (e) {
            var oControl = e.control, oSettings = oControl.settings;
            var sValue = oSettings.value;

            if (sValue == "network") {
                showNetworkImageDropdown.call(this);
            } else if (sValue == "local") {
                showImageUploaderDialog();
            }
        },
        onclick : function () {
            editor.fire("click");

            var localImage = editor.settings.local_image;
            if (localImage) {
                showImageUploaderDialog();
            } else {
                showNetworkImageDropdown.call(this);
            }
        }
    });

});