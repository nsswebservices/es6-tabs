'use strict';

import attributelist from './attributelist'

let KEY_CODES = {
            RETURN: 13,
            TAB: 9
        },
        instances = [],
        triggerEvents = ['click', 'keydown', 'touchstart'],
        defaults = {
            titleClass: '.js-tabs__link',
            currentClass: 'active',
            active: 0,
			styles: [
				{
					position: 'absolute',
            		clip: 'rect(0, 0, 0, 0)'
				},
				{
					position: 'relative',
					clip:'auto'
				}]
        },
        StormTabs = {
            init() {
                let hash = location.hash.slice(1) || null;
                this.links = [].slice.call(this.DOMElement.querySelectorAll(this.settings.titleClass));
                this.targets = this.links.map(el => {
                    return document.getElementById(el.getAttribute('href').substr(1)) || console.error('Tab target not found');
                 });

                this.current = this.settings.active;
                if (!!hash) {
                    this.targets.forEach((target, i) => {
                        if (target.getAttribute('id') === hash) {
                            this.current = i;
                        }
                    });
                }
                
                this.initAria()
                    .initTitles()
					.setStyles()
                    .open(this.current);
            },
            initAria() {
                this.links.forEach((el, i) => {
                    attributelist.set(el, {
                        'role' : 'tab',
                        'aria-expanded' : false,
                        'aria-selected' : false,
                        'aria-controls' : this.targets[i].getAttribute('id')
                    });
                });

                this.targets.forEach(el => {
                    attributelist.set(el, {
                        'role' : 'tabpanel',
                        'aria-hidden' : true,
                        'tabIndex': '-1'
                    });
                });
                return this;
            },
            initTitles() {
                let handler = i => {
                    this.toggle(i);
                };

                this.links.forEach((el, i) => {
                    triggerEvents.forEach(ev => {
                        el.addEventListener(ev, e => {
                            if(!!e.keyCode && e.keyCode === KEY_CODES.TAB) { return; }
                            if(!!!e.keyCode || e.keyCode === KEY_CODES.RETURN){
                                e.preventDefault();
                                handler.call(this, i);
                            }
                        }, false);
                    });
                    
                });

                return this;
            },
			setStyles() {
				this.targets.forEach((target, i) => {
					for(let s in this.settings.styles[Number(i === this.current)]) {
						target.style[s] = this.settings.styles[Number(i === this.current)][s];
					}
				});
				
				return this;
			},
            change(type, i) {
                let methods = {
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
            open(i) {
                this.change('open', i);
                this.current = i;
				this.setStyles();
                return this;
            },
            close(i) {
                this.change('close', i);
				this.setStyles();
                return this;
            },
            toggle(i) {
                if(this.current === i) { return; }
                
                 window.history.pushState({ URL: this.links[i].getAttribute('href') }, '', this.links[i].getAttribute('href'));
                if(this.current === null) { 
                    this.open(i);
                    return this;
                }
                    this.close(this.current)
                    .open(i);
                return this;
                }
            };

	
let create = (el, i, opts) => {
    instances[i] = Object.assign(Object.create(StormTabs), {
        DOMElement: el,
        settings: Object.assign({}, defaults, opts)
    });
    instances[i].init();
}

let init = (sel, opts) => {
    var els = [].slice.call(document.querySelectorAll(sel));
    
    if(els.length === 0) {
        throw new Error('Tabs cannot be initialised, no augmentable elements found');
    }
    
    els.forEach((el, i) => {
        create(el, i, opts);
    });
    return instances;
    
}

let reload = (sel, opts) => {
    [].slice.call(document.querySelectorAll(sel)).forEach((el, i) => {
        if(!instances.filter(instance => { return (instance.btn === el); }).length) {
            create(el, instances.length, opts);
        }
    });
}

let destroy = () => {
    instances = [];  
}

let Tabs = { init, reload, destroy }

export { Tabs };