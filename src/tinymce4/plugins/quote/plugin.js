tinymce.PluginManager.add('quote', function (editor, url) {
    if (!tinymce.getHelperIframeWin()) {
        alert('paste plugin depand on hidden iframe, you must insert iframe node into the document,' +
            ' like <div id="tinymce_helper" style="display: none;"><iframe src="javascript:document.open();document.close();"></iframe></div>');
    }

    editor.on("init", function (e) {

        var dom = tinymce.DOM, selection = editor.selection, editorDom = editor.dom;
        var dataStore = {} , settings = editor.getSettings(),contentAreaContainer = editor.getContentAreaContainer();
        var quoteCls = settings.quote_class, quoteMarkCls = "tinymce_quote_mark", quotePromptCls = "mce_quote_toggle";
        var markStyle = "position:absolute;display:none;top:-999px;left:-999px;";

        function removeQuotePrompt() {
            var nodes = dom.select(">." + quotePromptCls, contentAreaContainer);
            dom.remove(nodes);
        }

        function insertQuotePrompt(body) {
            var nodes = dom.select(">." + quoteMarkCls, body);
            if (nodes && nodes.length > 0) {

                var nodes = dom.select(">." + quotePromptCls, contentAreaContainer);
                if (nodes.length == 0) {
                    var quotePromptNode = dom.add(contentAreaContainer, "div", {"class" : quotePromptCls, "title" : editor.getSettingsMessage("image.quote.title")}, '<img src="' + (url + '/img/ellipsis.png') + '"/>')
                    dom.bind(quotePromptNode, "click", function () {

                        var maskNodes = editorDom.select("." + quoteMarkCls, editor.getBody())
                        if (maskNodes.length > 0) {
                            mergeQuote(maskNodes[0], true);
                        }
                        removeQuotePrompt();
                        editor.undoManager.clear();
                    });
                }

            }
        }

        function mergeQuote(quoteMark, isEditor) {
            if (quoteMark) {
                var dataId = dom.getAttrib(quoteMark, "quote_data_id"), data = dataStore[dataId];

                if (data) {
                    var quoteNode = dom.getNext(quoteMark, "." + quoteCls);
                    if (quoteNode) {
                        if (isEditor) {
                            editor.execCommand("mceQuoteMerge", false, {node : quoteNode, html : data});
                        } else {
                            dom.setHTML(quoteNode, data);
                            dom.setAttrib(quoteNode, "style", null);
                        }
                    }
                }
                dom.remove(quoteMark);
            }
        }

        editor.addCommand("mceQuoteMerge", function (ui, value) {
            if (value) {
                var node = value.node, html = value.html;
                if (node && html) {
                    var rng = editorDom.createRng();

                    rng.setStartAfter(node);
                    rng.setEndAfter(node);

                    selection.setRng(rng);

                    dom.setHTML(node, html);
                    dom.setAttrib(node, "style", null);
                }
            }
        });

        editor.on("ConvertSetContent", function (e) {
            removeQuotePrompt();

            var content = e && e.content;
            if (content && (new RegExp("<div[^>]*class=(\"|')?" + quoteCls + "(\"|')?[^>]*>", 'gi').test(content))) {
                var body = tinymce.getHelperIframeBody();

                dom.setHTML(body, content);

                var nodes = dom.select(">." + quoteCls, body);
                if (nodes.length > 0) {
                    var quoteNode = nodes[0];
                    var innerHtml = quoteNode.innerHTML;
                    if (innerHtml) {
                        var id = dom.uniqueId();
                        dataStore[id] = innerHtml;
                        dom.setHTML(quoteNode, "");
                        quoteNode.parentNode.insertBefore(dom.create("div", {"style" : markStyle, "class" : quoteMarkCls, "quote_data_id" : id}), quoteNode);
                        quoteNode.style.cssText = markStyle;
                        e.content = body.innerHTML;

                        insertQuotePrompt(body);
                    }
                }
                dom.setHTML(body, "");
            }
        });

        editor.on("ConvertGetContent", function (e) {
            var content = e && e.content;
            if (content && (new RegExp("<div[^>]*class=(\"|')?" + quoteMarkCls + "(\"|')?[^>]*>", 'gi').test(content))) {
                var body = tinymce.getHelperIframeBody();
                dom.setHTML(body, content);

                var nodes = dom.select(">." + quoteMarkCls, body);
                if (nodes && nodes.length > 0) {
                    mergeQuote(nodes[0]);
                }

                e.content = body.innerHTML;
                dom.setHTML(body, "");
            }
        });

        editor.on("ClearConvertContent", function (e) {
            dataStore = {};
            removeQuotePrompt();
        });

        editor.on("AddRootBlocks Undo Redo", function (e) {
            var nodes = editorDom.select("." + quoteCls, editor.getBody());
            if (nodes.length == 0) {
                removeQuotePrompt();
            } else {
                insertQuotePrompt(editor.getBody());
            }
        });

    });
});