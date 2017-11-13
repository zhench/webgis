define([
        "dojo/_base/declare", "dojo/_base/array", "dojo/query", "dojo/dom-style", "dojo/on", "dojo/fx", "dojo/_base/fx", "dojo/_base/lang", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-geomety", "dijit/_Widget", "dijit/_Container", "dojo/dnd/Moverable", "dijit/_TemplatedMixin", "dojo/text!./templates/MoveableWidgetFrame.html"
    ],
    function(declare, array, query, domStyle, on, coreFx, fx, lang, domAttr, domClass, domGeom, _Widget, _Container, Moverable, _TemplatedMixin, template) {
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
            },
            startup: function() {
                if (this.started) {
                    return;
                }
                console.log("WidgetFrame::starup");
                var children = this.getChildren();
                array.forEach(children, function(child) {
                    child.startup();
                });
                for (var i = 0; i < children.length; i++) {
                    var c = children[i];
                    if (c.setMap && c.setId && c.setAlarm && c.setTitle && c.setIcon && c.setState && c.setConfig) {
                        this.setWidget(c, true);
                        break;
                    }
                }
                var p = this.getParent();
                var pw;
                if (p === null) {
                    pw = 300;
                } else {
                    pw = domStyle.get(p.containerNode, "width");
                    if (p.contentWidth) {
                        pw = p.contentWidth;
                    }
                }
                domStyle.set(this.domNode, "width", pw + "px");

                this.widgetWidth = domStyle.get(this.domNode, "width");

                this.boxMaximized.paddingTop = domStyle.get(this.boxNode, "paddingTop");
                this.boxMaximized.paddingBottom = domStyle.get(this.boxNode, "paddingBottom");
                this.boxMaximized.paddingLeft = domStyle.get(this.boxNode, "paddingLeft");
                this.boxMaximized.paddingRight = domStyle.get(this.domNode, "paddingRigth");
                this.boxMaximized.marginleft = domStyle.get(this.domNode, "marginLeft");
                this.boxMaximized.w = this.widgetWidth - (this.boxMaximized.marginleft + this.boxMaximized.paddingLeft + this.boxMaximized.paddingRight);
                for (var i = 0; i < this.widget.panels.length; i++) {
                    this.widget.showPanel(i);
                    var h = domStyle.get(this.boxNode, "height");
                    this.boxMaximized.h.push(h);
                }
                this.widget.showPanel(0);
                if (this.state === "minimized") {
                    this.minimized(0);
                } else {
                    this.maximized(0);
                }
                fx.fadeIn({ node: this.domNode }).play();
                this.moveableHandle = new Moverable(this.id, { handle: 'dragHandle' });
                console.log("widgetFrame::startup ended");
            },
            setWidget: function(widget, childAlreadyAdded) {
                if (this.widget) {
                    return;
                }
                if (!childAlreadyAdded) {
                    this.addChild(widget);
                }
                this.widget = widget;
                try {
                    this.title = widget.title;
                    this.titleNode.innerHTML = this.title;

                    var minBtn = query(".wbMinimize", this.domNode)[0];
                    minBtnTd = minBtn.parentNode;
                    if (widget.panels.length > 1) {
                        array.forEach(widget.panels, lang.hitch(this, function(item, idx, arr) {
                            var td = document.createElement("TD");
                            var btn = document.createElement("DIV");
                            domClass.add(btn, "widgetButton");
                            domStyle.set(btn, "backgroundImage", "url(" + require.toUrl("webgis2book/widgets/" + item.buttonIcon) + ")");
                            domAttr.set(btn, "title", item.buttonText);
                            if (this.state === "minimized") {
                                domStyle.set(btn, "display", "none");
                            }
                            td.appendChild(btn);
                            minBtnTd.parentNode.insertBefore(td, minBtnTd);
                            on(btn, "click", lang.hitch(this, function() {
                                this.selectPanel(idx);
                            }));
                        }))
                    }
                } catch (err) {
                    console.error(err);
                }
            },
            maximize: function(duration) {
                var boxEndProperties = {
                    height: this.boxMaximized.h[this.widget.panelIndex],
                    paddingTop: this.boxMaximized.paddingTop,
                    marginTop: 0,
                    marginLeft: this.boxMaximized.marginLeft,
                    width: this.boxMaximized.w,
                    paddingLeft: this.boxMaximized.paddingLeft,
                    paddingRight: this.boxMaximized.paddingRight
                };
                var badgeEndProperties = { left: 0 };
                if (duration !== 0 && !duration) {
                    duration = 350;
                }
                if (duration <= 0) {
                    //不使用动画效果
                    for (var key in boxEndProperties) {
                        boxEndProperties[key] = boxEndProperties[key] + "px";
                    }
                    for (var key in badgeEndProperties) {
                        badgeEndProperties[key] = badgeEndProperties[key] + "px";
                    }
                    domStyle.set(this.badgeNode, badgeEndProperties);
                    domStyle.set(this.boxNode, boxEndProperties);
                    domStyle.set(this.contentNode, "overflow", "auto");
                    query(".widgetButton", this.domNode).style("display", "block");
                    this.statue = "maximized";
                } else {
                    try {
                        var badgeSlider = fx.animateProperty({ node: this.badgeNode, properties: badgeEndProperties });
                        var hShrink = fx.animateProperty({
                            node: this.boxNox,
                            properties: {
                                marginLeft: 0,
                                width: 10,
                                paddingLeft: 0,
                                paddingRight: 0
                            },
                            onEnd: lang.hitch(this, function() {
                                var hGrow = fx.animateProperty({
                                    node: this.boxNode,
                                    properties: {
                                        width: boxEndProperties.width,
                                        paddingLeft: boxEndProperties.paddingLeft,
                                        paddingRight: boxEndProperties.paddingRight,
                                        marginLeft: boxEndProperties.marginLeft
                                    }
                                });
                                var vGrow = fx.animateProperty({
                                    node: this.boxNode,
                                    beforeBegin: lang.hitch(this, function() {
                                        domStyle.set(this.contentNode, "display", "block");
                                    }),
                                    onEnd: lang.hitch(this, function() {
                                        this.state = "maximized";
                                        domStyle.set(this.contentNode, "display", "block");
                                        query(".widgetButton", this.domNode).style("display", "block");
                                    }),
                                    properties: {
                                        height: boxEndProperties.height,
                                        paddingTop: boxEndProperties.paddingTop,
                                        paddingBottom: boxEndProperties.paddingBottom,
                                        marginTop: boxEndProperties.marginTop
                                    }
                                });
                                coreFx.chain([hGrow, vGrow]).play();
                            })
                        })
                        cor.combine([badgeSlider, hShrink]).play();
                        thiss.state = "maximizing";
                    } catch (err) {
                        console.error(drr);

                    }
                }
            }
        })
    });