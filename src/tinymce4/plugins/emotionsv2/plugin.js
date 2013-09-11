tinymce.PluginManager.add('emotionsv2', function (editor) {
    var W = window, D = document, aym = W.aym, cnst = aym.cnst, util = aym.util, env = aym.env;

    function showEmotionsDropdown() {
        var oDomNoe = $(this.getEl());

        var d = aym.global.ControlsWidget.getControl(cnst.CONTROLS.EMOTIONS_V2_PICKER);
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

    editor.addButton('emoticons', {
        type : 'extbutton',
        tooltip : editor.getSettingsMessage("button.emotion"),
        onClick : function (e) {
            showEmotionsDropdown.call(this);
        }
    });

});