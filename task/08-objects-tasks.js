'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}

Rectangle.prototype.getArea = function () {
    return this.width * this.height;
};


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    return Object.setPrototypeOf(JSON.parse(json), proto);
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CssSelector {
    
    element(value) {
        if (this.elementName) {
            throw new Error('Element name already defined');
        }
        if (anyExist([this.idName, this.classNames, this.attrNames,
            this.pseudoClassNames, this.pseudoElementName])) {
            throw new Error('Wrong order');
        }
        this.elementName = value;
        return this;
    }
    
    id(value) {
        if (this.idName) {
            throw new Error('Id already defined');
        }
        if (anyExist([this.classNames, this.attrNames,
            this.pseudoClassNames, this.pseudoElementName])) {
            throw new Error('Wrong order');
        }
        this.idName = `#${value}`;
        return this;
    }
    
    class(value) {
        if (anyExist([this.attrNames, this.pseudoClassNames,
            this.pseudoElementName])) {
            throw new Error('Wrong order');
        }
        if (!this.classNames) { this.classNames = []; }
        this.classNames.push(`.${value}`);
        return this;
    }
    
    attr(value) {
        if (anyExist([this.pseudoClassNames, this.pseudoElementName])) {
            throw new Error('Wrong order');
        }
        if (!this.attrNames) { this.attrNames = []; }
        this.attrNames.push(`[${value}]`);
        return this;
    }
    
    pseudoClass(value) {
        if (this.pseudoElementName) {
            throw new Error('Wrong order');
        }
        if (!this.pseudoClassNames) { this.pseudoClassNames = []; }
        this.pseudoClassNames.push(`:${value}`);
        return this;
    }
    
    pseudoElement(value) {
        if (this.pseudoElementName) {
            throw new Error('Pseudo element already defined');
        }
        this.pseudoElementName = `::${value}`;
        return this;
    }
    
    getSelectorsArray() {
        return [this.elementName, this.idName, this.classNames,
            this.attrNames, this.pseudoClassNames, this.pseudoElementName]
            .reduce((p, c) => c ? p.concat(c) : p, []);
    }
    
    stringify() {
        return this.getSelectorsArray()
            .join('');
    }
}

class CombinedSelector {
    constructor(selectors) {
        this.selectors = selectors || [];
    }
    
    getSelectorsArray() {
        return this.selectors;
    }
    
    stringify() {
        return this.getSelectorsArray()
            .join('');
    }
    
    static combine(selector1, combinator, selector2) {
        return new CombinedSelector(selector1.getSelectorsArray().concat(
            ` ${combinator} `,
            selector2.getSelectorsArray()));
    }
}

function anyExist(values) {
    return values.some(x => x);
}

const cssSelectorBuilder = {

    element: function(value) {
        return new CssSelector().element(value);
    },

    id: function(value) {
        return new CssSelector().id(value);
    },

    class: function(value) {
        return new CssSelector().class(value);
    },

    attr: function(value) {
        return new CssSelector().attr(value);
    },

    pseudoClass: function(value) {
        return new CssSelector().pseudoClass(value);
    },

    pseudoElement: function(value) {
        return new CssSelector().pseudoElement(value);
    },

    combine: function(selector1, combinator, selector2) {
        return CombinedSelector.combine(selector1, combinator, selector2);
    },
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
