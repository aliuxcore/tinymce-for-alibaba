tinymce.PluginManager.add('formlink', function (editor) {
    var W = window, D = document, aym = W.aym, cnst = aym.cnst, util = aym.util, env = aym.env;

    function showDialog() {
        var data = {}, selection = editor.selection, dom = editor.dom, selectedElm, anchorElm, initialText;

        selectedElm = selection.getNode();
        anchorElm = dom.getParent(selectedElm, 'a[href]');
        if (anchorElm) {
            selection.select(anchorElm);
        }

        data.text = initialText = selection.getContent({format : 'text'});
        data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
        data.target = anchorElm ? dom.getAttrib(anchorElm, 'target') : '';

        if (selectedElm.nodeName == "IMG") {
            data.text = initialText = " ";
        }

        var oDomNoe = $(this.getEl());
        var d = aym.global.ControlsWidget.getControl(cnst.CONTROLS.LINK_EDIT_DD);
        d.onForShow(cnst.EVENT.CONTROLBUTTONCLICK, $.proxy(function (oValues) {

            var data = oValues;
            if (data.text != initialText) {
                if (anchorElm) {
                    editor.focus();
                    anchorElm.innerHTML = data.text;

                    dom.setAttribs(anchorElm, {
                        href : data.href,
                        target : data.target ? data.target : null
                    });

                    selection.select(anchorElm);
                } else {
                    editor.insertContent(dom.createHTML('a', {
                        href : data.href,
                        target : data.target ? data.target : null
                    }, data.text));
                }
            } else {
                editor.execCommand('mceInsertLink', false, {
                    href : data.href,
                    target : data.target
                });
            }

        }, editor)).show({
                trigger : oDomNoe,
                target : oDomNoe,
                target_x : 'L',
                target_y : 'B',
                obj_x : 'L',
                obj_y : 'T'
            }, data);
    }

    editor.addButton('link', {
        icon : 'link',
        tooltip : editor.getSettingsMessage("button.link.insert.edit"),
        shortcut : 'Ctrl+K',
        onclick : function () {
            showDialog.call(this);
        },
        stateSelector : 'a[href]'
    });

    editor.addButton('unlink', {
        icon : 'unlink',
        tooltip : editor.getSettingsMessage("button.link.remove"),
        cmd : 'unlink',
        stateSelector : 'a[href]'
    });

});