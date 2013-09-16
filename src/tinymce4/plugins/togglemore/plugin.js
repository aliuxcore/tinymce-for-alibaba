tinymce.PluginManager.add('togglemore', function (editor) {
    var container, iframe, toolbar, bottomToolbar;
    var dom = tinymce.DOM, activeCls = "ext-btn-togglemore-active";

    function toggleMore() {
        if (!container) {
            container = editor.getContainer().firstChild;
        }

        if (!iframe) {
            var nodes = dom.select(">iframe", editor.getContentAreaContainer());
            if (nodes.length > 0) {
                iframe = nodes[0];
            }
        }

        if (!toolbar || !bottomToolbar) {
            var rootPanelItems = editor.theme.panel.items();
            toolbar = rootPanelItems[0].getEl();
            bottomToolbar = rootPanelItems[0].items()[1].getEl();
        }

        var containerHeight = dom.getSize(container).h;

        if (dom.isHidden(bottomToolbar)) {
            this.addClass(activeCls);
            dom.show(bottomToolbar);
        } else {
            this.removeClass(activeCls);
            dom.hide(bottomToolbar);
        }

        dom.setStyle(iframe, "height", containerHeight - dom.getSize(toolbar).h);

        editor.fire("ResizeEditor");
    }

    editor.addButton('togglemore', {
        tooltip : editor.getSettingsMessage("button.toggle.more"),
        onClick : toggleMore
    });

});