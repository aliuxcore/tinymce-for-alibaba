/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('advlist', function(editor) {
	var olMenuItems, ulMenuItems, lastStyles = {};

	function buildMenuItems(listName, styleValues) {
		var items = [];

		tinymce.each(styleValues.split(/[ ,]/), function(styleValue) {
			items.push({
				text: styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function(chr) {return chr.toUpperCase();}),
				data: styleValue == 'default' ? '' : styleValue
			});
		});

		return items;
	}

//	olMenuItems = buildMenuItems('OL', editor.getParam(
//		"advlist_number_styles",
//		"default,lower-alpha,lower-greek,lower-roman,upper-alpha,upper-roman"
//	));
//
//	ulMenuItems = buildMenuItems('UL', editor.getParam("advlist_bullet_styles", "default,circle,disc,square"));

	function applyListFormat(listName, styleValue) {
		var list, dom = editor.dom, sel = editor.selection;

		// Check for existing list element
		list = dom.getParent(sel.getNode(), 'ol,ul');

		// Switch/add list type if needed
		if (!list || list.nodeName != listName || styleValue === false) {
			editor.execCommand(listName == 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList');
		}

		// Set style
		styleValue = styleValue === false ? lastStyles[listName] : styleValue;
		lastStyles[listName] = styleValue;

		list = dom.getParent(sel.getNode(), 'ol,ul');
		if (list) {
			dom.setStyle(list, 'listStyleType', styleValue);
			list.removeAttribute('data-mce-style');
            editor.undoManager.add();
		}

		editor.focus();
	}

	function updateSelection(e) {
		var listStyleType = editor.dom.getStyle(editor.dom.getParent(editor.selection.getNode(), 'ol,ul'), 'listStyleType') || '';

		e.control.items().each(function(ctrl) {
			ctrl.active(ctrl.settings.data === listStyleType);
		});
	}

	editor.addButton('numlist', {
		type: 'extsplitbutton',
		tooltip: editor.getSettingsMessage("button.number.list"),
        menu : [
            {text : editor.getSettingsMessage("number.default"), data : ""},
            {text : editor.getSettingsMessage("number.lower.alpha"), data : "lower-alpha"},
            {text : editor.getSettingsMessage("number.lower.greek"), data : "lower-greek"},
            {text : editor.getSettingsMessage("number.lower.roman"), data : "lower-roman"},
            {text : editor.getSettingsMessage("number.upper.alpha"), data : "upper-alpha"},
            {text : editor.getSettingsMessage("number.upper.roman"), data : "upper-roman"}
        ],
		onshow: updateSelection,
		onselect: function(e) {
			applyListFormat('OL', e.control.settings.data);
		},
		onclick: function() {
			applyListFormat('OL', false);
		}
	});

	editor.addButton('bullist', {
		type: 'extsplitbutton',
		tooltip: editor.getSettingsMessage("button.bullet.list"),
        menu : [
            {text : editor.getSettingsMessage("bullet.default"), data : ""},
            {text : editor.getSettingsMessage("bullet.circle"), data : "circle"},
            {text : editor.getSettingsMessage("bullet.disc"), data : "disc"},
            {text : editor.getSettingsMessage("bullet.square"), data : "square"}
        ],
		onshow: updateSelection,
		onselect: function(e) {
			applyListFormat('UL', e.control.settings.data);
		},
		onclick: function() {
			applyListFormat('UL', false);
		}
	});
});