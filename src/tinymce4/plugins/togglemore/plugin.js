tinymce.PluginManager.add('togglemore', function (editor) {
    var activeCls = "ext-btn-togglemore-active";

    function toggleMore() {
        var oRootPanelItems = editor.theme.panel.items();
        var oToolbar = oRootPanelItems[0], oBottomToolbar = oToolbar.items()[1];
        var oIframe = $(oRootPanelItems[1].getEl()).children("iframe");

        var oContainerElm = editor.getContainer();
        var nContainerHeight = $(oContainerElm).children().height();

        if (oBottomToolbar.getEl().style.display == 'none') {
            this.addClass(activeCls);
            oBottomToolbar.show();
        } else {
            this.removeClass(activeCls);
            oBottomToolbar.hide();
        }

        var nToolBarHeigth = $(oRootPanelItems[0].getEl()).outerHeight(true);

        var nStatusBarHeigth = 0;
        if (oRootPanelItems.length > 2) {
            var oStatusBar = oRootPanelItems[2];
            if (oStatusBar.name && oStatusBar.name() == "statusbar") {
                nStatusBarHeigth = $(oRootPanelItems[2].getEl()).outerHeight(true);
            }
        }

        oIframe.height(nContainerHeight - nToolBarHeigth - nStatusBarHeigth);

        editor.fire("ResizeEditor");
    }

    editor.addButton('togglemore', {
        tooltip : editor.getSettingsMessage("button.toggle.more"),
        onClick : toggleMore
    });

});