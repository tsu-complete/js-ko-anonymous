
;(function ( factory ) {
    "use strict";

    if ("function" === typeof define && define.amd) {
        define(["knockout"], factory);
    } else if ("undefined" !== typeof module) {
        factory(require("knockout"));
    } else {
        factory(window.ko);
    }

})(function ( ko ) {
    "use strict";

    var registry;

    /**
     * knockout base object
     * @namespace ko
     */

    /**
     * developer facing static api and helper functions
     * @namespace anonymous
     * @memberof ko
     */

    /**
     * storage for all registered templates
     * @memberof ko.anonymous
     * @member registry
     * @private
     */
    registry = {  };

    ko.anonymous = {
        /**
         * alias fastest defer option
         * @memberof ko.anonymous
         * @method defer
         * @param {Function} callback call in earliest next cycle
         * @example
         * ko.anonymous.defer(function () {
         *   // called on next cycle...
         * });
         */
        defer: window.setImmediate || window.setTimeout
        /**
         * create an anonymous template if the template isn't already
         * @memberof ko.anonymous
         * @method make
         * @param {Element|String} template what to make anonymous
         * @return {Element} anonymous template
         * @example
         * ko.anonymous.make("<span>Hello!</span>");
         */
    ,   make: function ( template ) {
            var element;

            if (template instanceof Element) {
                element = template;
            } else {
                // check if template exists in registry
                if (registry.hasOwnProperty(template)) {
                    return registry[template];
                }
                element = document.createElement("template");
                element.innerHTML = template;
            }

            if (!element._is_anonymous) {
                new ko.templateSources.anonymousTemplate(element)
                    .nodes(element);
                Object.defineProperty(element, "_is_anonymous", {value: true});
            }

            return template;
        }
        /**
         * make an anonymous template and store for later use
         * @memberof ko.anonymous
         * @method register
         * @param {String} name what to alias template as
         * @param {Element|String} template what to make anonymous and store
         * @return {Element} anonymous template
         * @example
         * ko.anonymous.register("hello", "<span>Hello!</span>");
         * ko.anonymous.register("alias", "hello");
         */
    ,   register: function ( name, template ) {
            registry[name] = ko.anonymous.make(template);
        }
    };

    /**
     * knockout binding handlers object
     * @namespace bindingHandlers
     * @memberof ko
     */

    /**
     * binding handler for anonymous templating
     * @namespace anonymous
     * @memberof ko.bindingHandlers
     */
    ko.bindingHandlers.anonymous = {
        /**
         * initialize anonymous binding on an element
         * @method init
         * @memberof ko.bindingHandlers.anonymous
         * @param {Element} element dom element being bound
         * @param {Function} valueAccessor returns options
         * @param {Function} allBindingsAccessor returns bindings for element
         * @param {Object} viewModel current data for  element
         * @param {Object} bindingContext current context for element
         * @param {Object|Element|String} options
         *  expected return value of valueAccessor
         * @param {Element|String} options.template anonymous template
         * @param {Object} [options.with]
         *  data to render with, defaults to the current context
         * @param {String} [options.as] what to name this new context
         * @param {Function|Boolean} [options.defer]
         *   call with render function, call when ready
         *   should rendering be deferred
         * @param {Function} [options.after] call when template is rendered
         * @return {Object} control object for knockout
         * @example
         * // NOTE: used only by knockout, invoked as
         * <!-- ko anonymous:"<span>Hello!</span>" -->
         * <!-- /ko -->
         * // or
         * <div data-bind="
         *   anonymous: {
         *     template: 'hello'
         *   , with: {
         *       name: 'Tsukumo'
         *     }
         *   , as: 'user'
         *   }
         * "></div>
         */
        init: function (
            element
        ,   valueAccessor
        // jshint ignore:start
        // reason; need last parameter
        ,   allBindingsAccessor
        ,   viewModel
        // jshint ignore:end
        ,   bindingContext
        ) {
            var options, placeholder, render;

            options = valueAccessor();

            // normalize options
            if ("string" === typeof options || options instanceof Element) {
                options = { template: options };
            }

            // create placeholder to later replace in case virtual element
            // virtual elements will not have children, so fake it
            placeholder = document.createElement("placeholder");
            // hide the placeholder so it cannot be seen if rendering is slow
            placeholder.setAttribute("hidden", "true");
            // empty the element and prepend, virtual or not
            ko.virtualElements.emptyNode(element);
            ko.virtualElements.prepend(element, placeholder);

            // given a with, create a new context
            if (options["with"]) {
                bindingContext = bindingContext.createChildContext(
                    options["with"], options.as
                );
            // otherwise change the context if as is specified
            } else if (options.as) {
                bindingContext = bindingContext.createChildContext(
                    bindingContext.$rawData, options.as
                );
            }

            // ensure template is anonymous
            options.template = ko.anonymous.make(options.template);

            // create render function for use with defer
            render = function ( ) {
                ko.renderTemplate(options.template, bindingContext,
                    { }, placeholder, "replaceNode");
                if ("function" === options.after) {
                    options.after();
                }
            };

            // pass render function to some defer or invoke it immediately
            if (options.defer) {
                if (options.defer instanceof Function) {
                    options.defer(render);
                } else {
                    ko.anonymous.defer(render);
                }
            } else {
                render();
            }

            // notify knockout this binding will control its descendants
            return { controlsDescendantBindings: true };
        }
    };

    // allow anonymous to be a virtual element
    ko.virtualElements.allowedBindings.anonymous = true;

    return ko;
});

