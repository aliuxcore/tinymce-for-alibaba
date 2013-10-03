tinymce.PluginManager.add('loading', function (editor) {

    editor.on("init", function () {
        var loadingNode, dom = tinymce.DOM;

        editor.showLoading = function (callback, context) {
            loadingNode = loadingNode || dom.add(editor.getContentAreaContainer(), "div", {"class" : "mce_loading"}, editor.getSettingsMessage("loading.title"));

            dom.show(loadingNode);

            callback && setTimeout(function () {
                callback.call(context || editor);
            }, 50);
        };

        editor.hideLoading = function () {
            loadingNode && dom.hide(loadingNode);
        };

        editor.on("SetContent", function () {
            editor.hideLoading();
        });

    });
});