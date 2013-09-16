/**
 * Compiled inline version. (Library mode)
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports, undefined) {
	"use strict";

	var modules = {};

	function require(ids, callback) {
		var module, defs = [];

		for (var i = 0; i < ids.length; ++i) {
			module = modules[ids[i]] || resolve(ids[i]);
			if (!module) {
				throw 'module definition dependecy not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	function define(id, dependencies, definition) {
		if (typeof id !== 'string') {
			throw 'invalid module definition, module id must be defined and be a string';
		}

		if (dependencies === undefined) {
			throw 'invalid module definition, dependencies must be specified';
		}

		if (definition === undefined) {
			throw 'invalid module definition, definition function must be specified';
		}

		require(dependencies, function() {
			modules[id] = definition.apply(null, arguments);
		});
	}

	function defined(id) {
		return !!modules[id];
	}

	function resolve(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length; ++fi) {
			if (!target[fragments[fi]]) {
				return;
			}

			target = target[fragments[fi]];
		}

		return target;
	}

	function expose(ids) {
		for (var i = 0; i < ids.length; i++) {
			var target = exports;
			var id = ids[i];
			var fragments = id.split(/[.\/]/);

			for (var fi = 0; fi < fragments.length - 1; ++fi) {
				if (target[fragments[fi]] === undefined) {
					target[fragments[fi]] = {};
				}

				target = target[fragments[fi]];
			}

			target[fragments[fragments.length - 1]] = modules[id];
		}
	}

// Included from: js/tinymce/plugins/paste/classes/Clipboard.js

/**
 * Clipboard.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains logic for getting HTML contents out of the clipboard.
 *
 * @class tinymce.pasteplugin.Clipboard
 * @private
 */
define("tinymce/pasteplugin/Clipboard", [
	"tinymce/Env",
	"tinymce/util/Tools",
    "tinymce/util/StringUtils",
	"tinymce/util/VK"
], function(Env, Tools, StringUtils, VK) {
	function hasClipboardData() {
		// Gecko is excluded until the fix: https://bugzilla.mozilla.org/show_bug.cgi?id=850663
		return !Env.gecko && (("ClipboardEvent" in window) || (Env.webkit && "FocusEvent" in window));
	}

	return function(editor) {
		var self = this, plainTextPasteTime;

		function now() {
			return new Date().getTime();
		}

		function isPasteKeyEvent(e) {
			// Ctrl+V or Shift+Insert
			return (VK.metaKeyPressed(e) && e.keyCode == 86) || (e.shiftKey && e.keyCode == 45);
		}

		function innerText(elm) {
			return elm.innerText || elm.textContent;
		}

		function shouldPasteAsPlainText() {
			return now() - plainTextPasteTime < 100 || self.pasteFormat == "text";
		}

		// TODO: Move this to a class?
		function process(content, items) {
			Tools.each(items, function(v) {
				if (v.constructor == RegExp) {
					content = content.replace(v, '');
				} else {
					content = content.replace(v[0], v[1]);
				}
			});

			return content;
		}

		function processHtml(html) {
            var param = {content : html};
            var args = editor.fire('PastePreProcess', param);

//			if (editor.settings.paste_remove_styles || (editor.settings.paste_remove_styles_if_webkit !== false && Env.webkit)) {
//				args.content = args.content.replace(/ style=\"[^\"]+\"/g, '');
//			}

            if (!args.isDefaultPrevented()) {
                editor.insertContent(param.content);
            }
		}

		function processText(text) {
			text = editor.dom.encode(text).replace(/\r\n/g, '\n');

			var startBlock = editor.dom.getParent(editor.selection.getStart(), editor.dom.isBlock);

			if ((startBlock && /^(PRE|DIV)$/.test(startBlock.nodeName)) || !editor.settings.forced_root_block) {
				text = process(text, [
					[/\n/g, "<br>"]
				]);
			} else {
				text = process(text, [
					[/\n\n/g, "</p><p>"],
					[/^(.*<\/p>)(<p>)$/, '<p>$1'],
					[/\n/g, "<br />"]
				]);
			}

			var args = editor.fire('PastePreProcess', {content: text});

			if (!args.isDefaultPrevented()) {
				editor.insertContent(args.content);
			}
		}

		function createPasteBin() {
			var scrollTop = editor.dom.getViewPort().y;

			// Create a pastebin and move the selection into the bin
			var pastebinElm = editor.dom.add(editor.getBody(), 'div', {
				contentEditable: false,
				"data-mce-bogus": "1",
				style: 'position: absolute; top: ' + scrollTop + 'px; left: 0; width: 1px; height: 1px; overflow: hidden'
			}, '<div contentEditable="true" data-mce-bogus="1">X</div>');

			editor.dom.bind(pastebinElm, 'beforedeactivate focusin focusout', function(e) {
				e.stopPropagation();
			});

			return pastebinElm;
		}

		function removePasteBin(pastebinElm) {
			editor.dom.unbind(pastebinElm);
			editor.dom.remove(pastebinElm);
		}

		editor.on('keydown', function(e) {
			// Shift+Ctrl+V
			if (VK.metaKeyPressed(e) && e.shiftKey && e.keyCode == 86) {
				plainTextPasteTime = now();
			}
		});

		// Use Clipboard API if it's available
		if (hasClipboardData()) {
			editor.on('paste', function(e) {
				var clipboardData = e.clipboardData;

                function processImage() {
                    if (Tools.isSupportFileReader()) {
                        var items = clipboardData.items;
                        if (items && items.length > 0) {
                            var oPasteItem = null;

                            for (var i = 0, len = items.length; i < len; i++) {
                                var item = items[i], sType = (item.type || '').toLowerCase();

                                if (StringUtils.startsWithIgnoreCase(sType, "text/")) {
                                    oPasteItem = null;
                                    break;
                                } else if (StringUtils.startsWithIgnoreCase(sType, "image/")) {
                                    oPasteItem = item;
                                }
                            }

                            if (oPasteItem) {
                                var fileReader = new FileReader();

                                fileReader.onload = function () {
                                    editor.insertContent('<img src="' + this.result + '" />');
                                };

                                fileReader.readAsDataURL(oPasteItem.getAsFile());
                            }
                        }
                    }
                }

				function processByContentType(contentType, processFunc) {
					for (var ti = 0; ti < clipboardData.types.length; ti++) {
						if (clipboardData.types[ti] == contentType) {
							processFunc(clipboardData.getData(contentType));
							//clipboardData.items[ti].getAsString(processFunc);
							return true;
						}
					}
				}

				if (clipboardData) {
					e.preventDefault();

                    if (shouldPasteAsPlainText()) {
                        // First look for HTML then look for plain text
                        processByContentType('text/plain', processText) || processByContentType('text/html', processHtml) || processImage();

                    } else {
                        // First look for HTML then look for plain text
                        processByContentType('text/html', processHtml) || processByContentType('text/plain', processText) || processImage();
                    }
                }
            });
		} else {
			if (Env.ie) {
				var keyPasteTime = 0;

				editor.on('keydown', function(e) {
					if (isPasteKeyEvent(e) && !e.isDefaultPrevented()) {
						// Prevent undoManager keydown handler from making an undo level with the pastebin in it
						e.stopImmediatePropagation();

						var pastebinElm = createPasteBin();
						keyPasteTime = now();

						editor.dom.bind(pastebinElm, 'paste', function() {
							setTimeout(function() {
								editor.selection.setRng(lastRng);
								removePasteBin(pastebinElm);

								if (shouldPasteAsPlainText()) {
									processText(innerText(pastebinElm.firstChild));
								} else {
									processHtml(pastebinElm.firstChild.innerHTML);
								}
							}, 0);
						});

						var lastRng = editor.selection.getRng();
						pastebinElm.firstChild.focus();
						pastebinElm.firstChild.innerText = '';
					}
				});

				// Explorer fallback
				editor.on('init', function() {
					var dom = editor.dom;

					// Use a different method if the paste was made without using the keyboard
					// for example using the browser menu items
					editor.dom.bind(editor.getBody(), 'paste', function(e) {
						if (now() - keyPasteTime > 100) {
							var gotPasteEvent, pastebinElm = createPasteBin();

							e.preventDefault();

							dom.bind(pastebinElm, 'paste', function(e) {
								e.stopPropagation();
								gotPasteEvent = true;
							});

							var lastRng = editor.selection.getRng();

							// Select the container
							var rng = dom.doc.body.createTextRange();
							rng.moveToElementText(pastebinElm.firstChild);
							rng.execCommand('Paste');
							removePasteBin(pastebinElm);

							if (!gotPasteEvent) {
								alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
								return;
							}

							editor.selection.setRng(lastRng);

							if (shouldPasteAsPlainText()) {
								processText(innerText(pastebinElm.firstChild));
							} else {
								processHtml(pastebinElm.firstChild.innerHTML);
							}
						}
					});
				});
			} else {
//				editor.on('init', function() {
//					editor.dom.bind(editor.getBody(), 'paste', function(e) {
//						var doc = editor.getDoc();
//
//						e.preventDefault();
//
//						// Paste as plain text when not using the keyboard
//						if (e.clipboardData || doc.dataTransfer) {
//							processText((e.clipboardData || doc.dataTransfer).getData('Text'));
//							return;
//						}
//
//						e.preventDefault();
//						editor.windowManager.alert('Please use Ctrl+V/Cmd+V keyboard shortcuts to paste contents.');
//					});
//				});

				// Old Gecko/WebKit/Opera fallback
				editor.on('keydown', function(e) {
					if (isPasteKeyEvent(e) && !e.isDefaultPrevented()) {
						// Prevent undoManager keydown handler from making an undo level with the pastebin in it
						e.stopImmediatePropagation();

						var pastebinElm = createPasteBin();
						var lastRng = editor.selection.getRng();

						// Hack for #6051
						if (Env.webkit && editor.inline) {
							pastebinElm.contentEditable = true;
						}

						editor.selection.select(pastebinElm, true);

						editor.dom.bind(pastebinElm, 'paste', function(e) {
							e.stopPropagation();

							setTimeout(function() {
								removePasteBin(pastebinElm);
								editor.lastRng = lastRng;
								editor.selection.setRng(lastRng);

								var pastebinContents = pastebinElm.firstChild;

								// Remove last BR Safari on Mac adds trailing BR
								if (pastebinContents.lastChild && pastebinContents.lastChild.nodeName == 'BR') {
									pastebinContents.removeChild(pastebinContents.lastChild);
								}

								if (shouldPasteAsPlainText()) {
									processText(innerText(pastebinContents));
								} else {
									processHtml(pastebinContents.innerHTML);
								}
							}, 0);
						});
					}
				});
			}

			// Prevent users from dropping data images on Gecko
			if (!editor.settings.paste_data_images) {
				editor.on('drop', function(e) {
					var dataTransfer = e.dataTransfer;

					if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
						e.preventDefault();
					}
				});
			}
		}

		// Block all drag/drop events
		if (editor.paste_block_drop) {
			editor.on('dragend dragover draggesture dragdrop drop drag', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
		}

		this.paste = processHtml;
		this.pasteText = processText;
	};
});

// Included from: js/tinymce/plugins/paste/classes/WordFilter.js

/**
 * WordFilter.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class parses word HTML into proper TinyMCE markup.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */
define("tinymce/pasteplugin/WordFilter", [
	"tinymce/util/Tools",
    "tinymce/util/StringUtils",
	"tinymce/html/DomParser",
	"tinymce/html/Schema",
	"tinymce/html/Serializer",
	"tinymce/html/Node"
], function(Tools, StringUtils, DomParser, Schema, Serializer, Node) {
	return function(editor) {
        var dom = tinymce.DOM, contains = StringUtils.contains;

        function mergeStyle(styleNode, body, win) {
            var sheet = styleNode.sheet, computeNodes = {};
            if (sheet) {
                var rules = sheet.rules;
                if (rules) {
                    for (var j = 0, rLen = rules.length; j < rLen; j++) {
                        var rule = rules[j];
                        if (rule.type == 1 && rule.style.cssText) {
                            var allowNodes = dom.select(rule.selectorText, body);
                            for (var k = 0, aLen = allowNodes.length; k < aLen; k++) {
                                var allowNode = allowNodes[k];
                                var nodeId = allowNode.getAttribute("id");
                                if (!nodeId) {
                                    nodeId = dom.uniqueId();
                                    allowNode.setAttribute("id", nodeId);
                                }

                                if (!computeNodes[nodeId]) {
                                    computeNodes[nodeId] = allowNode;
                                }
                            }
                        }
                    }
                }
            }

            for (var k in computeNodes) {
                var allowNode = computeNodes[k], styleArray = [];
                var styles = win.getComputedStyle(allowNode, null);
                for (var p = 0, stLen = 110; p < stLen; p++) {
                    var styleName = styles[p];
                    if ((!contains(styleName, "webkit")) && (!contains(styleName, "transition"))
                        && styleName != "width" && styleName != "height" && styleName != "box-sizing" && styleName != "caption-side"
                        && styleName != "direction" && styleName != "opacity" && styleName != "tab-size"
                        && styleName != "zoom" && styleName != "empty-cells" && (!contains(styleName, "border-image"))
                        && (styleName == "background-color" || (!contains(styleName, "background")))) {
                        var styleValue = styles.getPropertyValue(styleName);
                        if (styleValue && styleValue != "0" && styleValue != "0px" && styleValue != "none" &&
                            styleValue != "auto" && styleValue != "static" && styleValue != "visible" && styleValue != "normal"
                            && styleValue != "baseline" && styleValue != "rgb(0, 0, 0)" && styleValue != "rgba(0, 0, 0, 0)")
                            styleArray.push(styleName + ":" + styleValue);
                    }
                }

                var styleObj = allowNode.style;
                var width = styleObj.width, height = styleObj.height;

                if (width) {
                    styleArray.push("width:" + width);
                }
                if (height) {
                    styleArray.push("height:" + height);
                }

                styleObj.cssText = styleArray.join(";");
                allowNode.removeAttribute("id");
                allowNode.removeAttribute("lang");
                allowNode.removeAttribute("class");
            }
        }

        function cleanBody(body) {
            var childNodes = body.childNodes, removeNodes = [];
            for (var j = 0, len = childNodes.length; j < len; j++) {
                var child = childNodes[j], nodeName = child.nodeName.toLowerCase();
                if (child.nodeType != 1 || nodeName == "meta" || nodeName == "link" || nodeName == "style") {
                    removeNodes.push(child);
                }
            }

            dom.remove(removeNodes);
        }

        function isWordOrExcel(body) {
            var nodes = dom.select(">meta", body);
            for (var i = 0, len = nodes.length; i < len; i++) {
                var meta = nodes[i], content = meta.getAttribute("content");

                if (content) {
                    content = content.toLowerCase();
                    if (contains(content, "excel") || contains(content, "word")) {
                        return 1;
                    }
                }
            }
            return 0;
        }

        function setDefaultTableBorder(body) {
            var nodes = dom.select(">table", body);
            for (var j = 0, len = nodes.length; j < len; j++) {
                var node = nodes[j];
                dom.setTableBorder(node, 1, 1);
                dom.setStyle(node, "border-collapse", "collapse");
            }
        }

        function fixMarginLeft(body) {
            var children = body.children;
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                var ml = dom.getStyle(child, "margin-left");
                if (ml && StringUtils.startsWithIgnoreCase(ml, "-")) {
                    dom.setStyle(child, "margin-left", "0px");
                }
            }
        }

        editor.on('PastePreProcess', function (e) {
            var content = e.content;

            //use iframe to parse , can read style in chrome , IE and FF not support
            var body = tinymce.getHelperIframeBody(), win = tinymce.getHelperIframeWin();
            dom.setHTML(body, content);

            var nodes = dom.select(">style", body);
            for (var i = 0, len = nodes.length; i < len; i++) {
                mergeStyle(nodes[i], body, win);
            }

            setDefaultTableBorder(body);
            isWordOrExcel(body) && cleanBody(body);
            fixMarginLeft(body);

            e.content = body.innerHTML;
            dom.setHTML(body, "");
        });
	};
});

// Included from: js/tinymce/plugins/paste/classes/Quirks.js

/**
 * Quirks.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various fixes for browsers. These issues can not be feature
 * detected since we have no direct control over the clipboard. However we might be able
 * to remove some of these fixes once the browsers gets updated/fixed.
 *
 * @class tinymce.pasteplugin.Quirks
 * @private
 */
define("tinymce/pasteplugin/Quirks", [
	"tinymce/Env",
	"tinymce/util/Tools"
], function(Env, Tools) {
	"use strict";

	return function(editor) {
		var explorerBlocksRegExp;

		function addPreProcessFilter(filterFunc) {
			editor.on('PastePreProcess', function(e) {
				e.content = filterFunc(e.content);
			});
		}

		function process(content, items) {
			Tools.each(items, function(v) {
				if (v.constructor == RegExp) {
					content = content.replace(v, '');
				} else {
					content = content.replace(v[0], v[1]);
				}
			});

			return content;
		}

		/**
		 * Removes WebKit fragment comments and converted-space spans.
		 *
		 * This:
		 *   <!--StartFragment-->a<span class="Apple-converted-space">&nbsp;</span>b<!--EndFragment-->
		 *
		 * Becomes:
		 *   a&nbsp;b
		 */
		function removeWebKitFragments(html) {
			html = process(html, [
				/^[\s\S]*<!--StartFragment-->|<!--EndFragment-->[\s\S]*$/g,        // WebKit fragment
				[/<span class="Apple-converted-space">\u00a0<\/span>/g, '\u00a0'], // WebKit &nbsp;
				/<br>$/															   // Traling BR elements
			]);

			return html;
		}

		/**
		 * Removes BR elements after block elements. IE9 has a nasty bug where it puts a BR element after each
		 * block element when pasting from word. This removes those elements.
		 *
		 * This:
		 *  <p>a</p><br><p>b</p>
		 *
		 * Becomes:
		 *  <p>a</p><p>b</p>
		 */
		function removeExplorerBrElementsAfterBlocks(html) {
			// Produce block regexp based on the block elements in schema
			if (!explorerBlocksRegExp) {
				var blockElements = [];

				Tools.each(editor.schema.getBlockElements(), function(block, blockName) {
					blockElements.push(blockName);
				});

				explorerBlocksRegExp = new RegExp(
					'(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*(<\\/?(' + blockElements.join('|') + ')[^>]*>)(?:<br>&nbsp;[\\s\\r\\n]+|<br>)*',
					'g'
				);
			}

			// Remove BR:s from: <BLOCK>X</BLOCK><BR>
			html = process(html, [
				[explorerBlocksRegExp, '$1']
			]);

			// IE9 also adds an extra BR element for each soft-linefeed and it also adds a BR for each word wrap break
			html = process(html, [
				[/<br><br>/g, '<BR><BR>'], // Replace multiple BR elements with uppercase BR to keep them intact
				[/<br>/g, ' '],            // Replace single br elements with space since they are word wrap BR:s
				[/<BR><BR>/g, '<br>']      // Replace back the double brs but into a single BR
			]);

			return html;
		}

		// Sniff browsers and apply fixes since we can't feature detect
//		if (Env.webkit) {
//			addPreProcessFilter(removeWebKitFragments);
//		}

		if (Env.ie) {
			addPreProcessFilter(removeExplorerBrElementsAfterBlocks);
		}
	};
});

// Included from: js/tinymce/plugins/paste/classes/Plugin.js

/**
 * Plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains the tinymce plugin logic for the paste plugin.
 *
 * @class tinymce.pasteplugin.Plugin
 * @private
 */
define("tinymce/pasteplugin/Plugin", [
	"tinymce/PluginManager",
	"tinymce/pasteplugin/Clipboard",
	"tinymce/pasteplugin/WordFilter",
	"tinymce/pasteplugin/Quirks"
], function(PluginManager, Clipboard, WordFilter, Quirks) {
	var userIsInformed;

	PluginManager.add('paste', function(editor) {

        if (!tinymce.getHelperIframeWin()) {
            alert('paste plugin depand on hidden iframe, you must insert iframe node into the document,' +
                ' like <div id="tinymce_helper" style="display: none;"><iframe src="javascript:document.open();document.close();"></iframe></div>');
        }

		var self = this, clipboard;

		function togglePlainTextPaste() {
			if (clipboard.pasteFormat == "text") {
				this.active(false);
				clipboard.pasteFormat = "html";
			} else {
				clipboard.pasteFormat = "text";
				this.active(true);

				if (!userIsInformed) {
					editor.windowManager.alert(
						'Paste is now in plain text mode. Contents will now ' +
						'be pasted as plain text until you toggle this option off.'
					);

					userIsInformed = true;
				}
			}
		}

		self.clipboard = clipboard = new Clipboard(editor);
		self.quirks = new Quirks(editor);
		self.wordFilter = new WordFilter(editor);

		if (editor.settings.paste_as_text) {
			self.clipboard.pasteFormat = "text";
		}

		editor.addCommand('mceInsertClipboardContent', function(ui, value) {
			if (value.content) {
				self.clipboard.paste(value.content);
			}

			if (value.text) {
				self.clipboard.pasteText(value.text);
			}
		});

		editor.addButton('pastetext', {
			icon: 'pastetext',
			tooltip: 'Paste as text',
			onclick: togglePlainTextPaste,
			active: self.clipboard.pasteFormat == "text"
		});

		editor.addMenuItem('pastetext', {
			text: 'Paste as text',
			selectable: true,
			active: clipboard.pasteFormat,
			onclick: togglePlainTextPaste
		});
	});
});

expose(["tinymce/pasteplugin/Clipboard","tinymce/pasteplugin/WordFilter","tinymce/pasteplugin/Quirks","tinymce/pasteplugin/Plugin"]);
})(this);