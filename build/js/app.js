'use strict';

var wrapper = function wrapper(fn) {
    return function () {
        if (arguments[1] === Object(arguments[1]) && !Array.isArray(arguments[1])) {
            for (var attr in arguments[1]) {
                fn.call(null, arguments[0], attr, arguments[1][attr]);
            }
        } else if (Array.isArray(arguments[1])) {
            var el = arguments[0];
            arguments[1].forEach(function (a) {
                fn.call(null, el, a);
            });
        } else {
            fn.apply(null, arguments);
        }
    };
};

var attributelist = {
    set: function set(el, attr) {
        wrapper(function (e, a, v) {
            e.setAttribute(a, v);
        })(el, attr);
    },
    toggle: function toggle(el, attr) {
        wrapper(function (e, a) {
            e.setAttribute(a, e.getAttribute(a) === 'false' ? true : false);
        })(el, attr);
    }
};

var KEY_CODES = {
    RETURN: 13,
    TAB: 9
};
var instances = [];
var triggerEvents = ['click', 'keydown', 'touchstart'];
var defaults = {
    titleClass: '.js-tabs__link',
    currentClass: 'active',
    active: 0,
    styles: [{
        position: 'absolute',
        clip: 'rect(0, 0, 0, 0)'
    }, {
        position: 'relative',
        clip: 'auto'
    }]
};
var StormTabs = {
    init: function init() {
        var _this = this;

        var hash = location.hash.slice(1) || null;
        this.links = [].slice.call(this.DOMElement.querySelectorAll(this.settings.titleClass));
        this.targets = this.links.map(function (el) {
            return document.getElementById(el.getAttribute('href').substr(1)) || console.error('Tab target not found');
        });

        this.current = this.settings.active;
        if (!!hash) {
            this.targets.forEach(function (target, i) {
                if (target.getAttribute('id') === hash) {
                    _this.current = i;
                }
            });
        }

        this.initAria().initTitles().setStyles().open(this.current);
    },
    initAria: function initAria() {
        var _this2 = this;

        this.links.forEach(function (el, i) {
            attributelist.set(el, {
                'role': 'tab',
                'aria-expanded': false,
                'aria-selected': false,
                'aria-controls': _this2.targets[i].getAttribute('id')
            });
        });

        this.targets.forEach(function (el) {
            attributelist.set(el, {
                'role': 'tabpanel',
                'aria-hidden': true,
                'tabIndex': '-1'
            });
        });
        return this;
    },
    initTitles: function initTitles() {
        var _this3 = this;

        var handler = function handler(i) {
            _this3.toggle(i);
        };

        this.links.forEach(function (el, i) {
            triggerEvents.forEach(function (ev) {
                el.addEventListener(ev, function (e) {
                    if (!!e.keyCode && e.keyCode === KEY_CODES.TAB) {
                        return;
                    }
                    if (!!!e.keyCode || e.keyCode === KEY_CODES.RETURN) {
                        e.preventDefault();
                        handler.call(_this3, i);
                    }
                }, false);
            });
        });

        return this;
    },
    setStyles: function setStyles() {
        var _this4 = this;

        this.targets.forEach(function (target, i) {
            for (var s in _this4.settings.styles[Number(i === _this4.current)]) {
                target.style[s] = _this4.settings.styles[Number(i === _this4.current)][s];
            }
        });

        return this;
    },
    change: function change(type, i) {
        var methods = {
            open: {
                classlist: 'add',
                tabIndex: {
                    target: this.targets[i],
                    value: '0'
                }
            },
            close: {
                classlist: 'remove',
                tabIndex: {
                    target: this.targets[this.current],
                    value: '-1'
                }
            }
        };

        this.links[i].classList[methods[type].classlist](this.settings.currentClass);
        this.targets[i].classList[methods[type].classlist](this.settings.currentClass);
        attributelist.toggle(this.targets[i], 'aria-hidden');
        attributelist.toggle(this.links[i], ['aria-selected', 'aria-expanded']);
        attributelist.set(methods[type].tabIndex.target, {
            'tabIndex': methods[type].tabIndex.value
        });
    },
    open: function open(i) {
        this.change('open', i);
        this.current = i;
        this.setStyles();
        return this;
    },
    close: function close(i) {
        this.change('close', i);
        this.setStyles();
        return this;
    },
    toggle: function toggle(i) {
        if (this.current === i) {
            return;
        }

        window.history.pushState({ URL: this.links[i].getAttribute('href') }, '', this.links[i].getAttribute('href'));
        if (this.current === null) {
            this.open(i);
            return this;
        }
        this.close(this.current).open(i);
        return this;
    }
};
var create = function create(el, i, opts) {
    instances[i] = Object.assign(Object.create(StormTabs), {
        DOMElement: el,
        settings: Object.assign({}, defaults, opts)
    });
    instances[i].init();
};

var init = function init(sel, opts) {
    var els = [].slice.call(document.querySelectorAll(sel));

    if (els.length === 0) {
        throw new Error('Tabs cannot be initialised, no augmentable elements found');
    }

    els.forEach(function (el, i) {
        create(el, i, opts);
    });
    return instances;
};

var reload = function reload(sel, opts) {
    [].slice.call(document.querySelectorAll(sel)).forEach(function (el, i) {
        if (!instances.filter(function (instance) {
            return instance.btn === el;
        }).length) {
            create(el, instances.length, opts);
        }
    });
};

var destroy = function destroy() {
    instances = [];
};

var Tabs = { init: init, reload: reload, destroy: destroy };

Tabs.init('.js-tabs');
//# sourceMappingURL=app.js.map
