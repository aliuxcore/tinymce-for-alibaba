tinymce.PluginManager.add('quote', function (editor) {
    var W = window, D = document, aym = W.aym, cnst = aym.cnst, util = aym.util, env = aym.env;

    var dataStore = {}, quoteDivCls = "tinymce_quote_line";

    function removeQuotePrompt() {
        $(editor.getContentAreaContainer()).children(".mce_quote_toggle").remove();
    }

    function mergeQuote(quoteLineNode) {
        if (quoteLineNode.length > 0) {
            var dataId = quoteLineNode.attr("quote_data_id"), data = dataStore[dataId];

            if (data) {
                quoteLineNode.nextAll("." + cnst.ALIYUN_PREVIOUS_QUOTE).html(data);
            }
            quoteLineNode.remove();
        }
    }

    editor.on("ConvertSetContent", function (e) {
        removeQuotePrompt();

        var content = e && e.content;
        if (content && (new RegExp("<div[^>]*class=(\"|')?" + cnst.ALIYUN_PREVIOUS_QUOTE + "(\"|')?[^>]*>", 'gi').test(content))) {
            var iframe = tinymce.DOM.getContentIframe();
            var body = iframe.contents().find("body"), bodyDom = body.get(0);
            bodyDom.innerHTML = content;

            var quoteNode = body.children("." + cnst.ALIYUN_PREVIOUS_QUOTE);
            if (quoteNode.length > 0) {
                var innerHtml = quoteNode.html();
                if (innerHtml) {
                    var id = util.id();
                    dataStore[id] = innerHtml;
                    quoteNode.empty().before('<div class="' + quoteDivCls + '" quote_data_id="' + id + '"></div>');

                    var quotePromptNode = $('<div class="mce_quote_toggle" title="' + $M("editor.plugin.quote.toggle.title") + '"><img src="' + aym.global.PathManager.image("ellipsis.png", 1) + '"/></div>');
                    quotePromptNode.click(function () {
                        mergeQuote($(editor.getBody()).find("." + quoteDivCls));
                        removeQuotePrompt();
                        editor.undoManager.clear();

                    }).appendTo(editor.getContentAreaContainer());

                    e.content = body.html();
                }
            }
            bodyDom.innerHTML = "";
        }
    });

    editor.on("ConvertGetContent", function (e) {
        var content = e && e.content;
        if (content && (new RegExp("<div[^>]*class=(\"|')?" + quoteDivCls + "(\"|')?[^>]*>", 'gi').test(content))) {
            var iframe = tinymce.DOM.getContentIframe();
            var body = iframe.contents().find("body"), bodyDom = body.get(0);
            bodyDom.innerHTML = content;

            mergeQuote(body.find("." + quoteDivCls));

            e.content = body.html();
            bodyDom.innerHTML = "";
        }
    });

    editor.on("ClearConvertContent", function (e) {
        dataStore = {};
        removeQuotePrompt();
    });

});