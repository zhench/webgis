define([
        "dojo/_base/declare", "dojo/_base/array", "dojo/query", "dojo/dom-style", "dojo/on", "dojo/fx", "dojo/_base/fx", "dojo/_base/lang", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-geomety", "dijit/_Widget", "dijit/_Container", "dojo/dnd/Moverable", "dijit/_TemplatedMixin", "dojo/text!./templates/MoveableWidgetFrame.html"
    ],
    function(declare, array, query, domStyle, on, coreFx, fx, lang, domClass, domGeom, _Widget, _Container, Moverable, _TemplatedMixin, template) {
        return declare([_Widget, _TemplatedMixin, _Container], {
            widget: null,
            icon: "",
            title: "",
            state: "maximized",
            boxNode: null,
            badgeNode: null,
            contentNode: null,
            titleNode: null,
            //调用postCreate创建框架后自动计算
            widgetWidth: 100,
            boxMaximized: null,
            templatePath,
            template,
            constructor: function() {
                this.boxMaximized = {
                    w: 100,
                    h: [],
                    paddingTop: 100,
                    paddingBottom: 100,
                    paddingLeft: 100,
                    paddingRight: 100,
                    marginleft: 100
                };
            },
            postCreate: function() {
                try {
                    this.boxNode = query(".widgetBadgedPane", this.domNode)[0];
                    this.contentNode = query(".widgetHolder", this.domNode)[0];
                    this.badgeNode = query(".widgetButton.wbMinimize", this.domNode)[0];
                } catch (err) {
                    console.error(err);
                }
            }
        })
    });