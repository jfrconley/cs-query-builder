// @flow
'use strict';

export type Expression = string | null

type Operator =
	"and" |
	"range" |
	"not" |
	"or" |
	"prefix" |
	"phrase" |
	"term" |
	"near"

type Options = { [x: string]: string | number }


function quote(value: string): string {
	return `'${value}'`;
}

function objectToQuery(obj: ?Object): string {
	if (obj == null) return '';
	const keys = Object.keys(obj);
	const max = keys.length;
	let retStr = "";

	for(let i = 0; i < max; i++) {
		const key = keys[i];
		const value = obj[key];
		if (typeof value === "string") {
			retStr += (`${key}="${value}"`);
		} else {
			retStr += (`${key}=${value}`);
		}
	}
	return retStr;
}

function toExpression(operator: Operator, field: ?string, value: Expression | number, options: ?Options): Expression {
	/*:: if(value==null) return null;*/
	if (field == null) {
		return `(${operator} ${objectToQuery(options)}` + ` ${value})`;
	} else {
		return `(${operator} field=${field} ${objectToQuery(options)}` + ` ${value})`;
	}
}

function isNullArray(inputArray: any[]): boolean {
	for (let i = 0, len = inputArray.length; i < len; i += 1)
		if (inputArray[i] != null)
			return false;
	return true;
}

module.exports = {
	and: function (options: ?Options, ...expressions: Expression[]): Expression {
		if (isNullArray(expressions)) {
			return null;
		}
		return toExpression('and', undefined, expressions.join(' '), options);
	},

	or: function (options: ?Options, ...expressions: Expression[]): Expression {
		if (isNullArray(expressions)) {
			return null;
		}
		return toExpression('or', undefined, expressions.join(' '), options);
	},

	not: function (options: ?Options, expression: Expression): Expression {
		if (expression == null) return null;
		return toExpression('not', undefined, expression, options);
	},

	rangeNum: function (field: string, lowerBound: ?number, upperBound: ?number, options: ?Options): Expression {
		if (field == null) throw new Error('Field must be defined in range');
		if ((lowerBound == null) && (upperBound == null)) return null;

		let expression = null;
		if (lowerBound == null && upperBound != null) {
			expression = `{,${upperBound}]`;
		} else if (upperBound == null && lowerBound != null) {
			expression = `[${lowerBound},}`;
		} else {
			/*:: if(lowerBound!=null && upperBound!=null)*/
			expression = `[${lowerBound},${upperBound}]`;
		}

		return toExpression('range', field, expression, options);
	},

	rangeStr: function (field: string, lowerBound: ?string, upperBound: ?string, options: ?Options): Expression {
		if (field == null) throw new Error('Field must be defined in range');
		if ((lowerBound == null) && (upperBound == null)) return null;

		let expression = null;
		if (lowerBound == null && upperBound != null) {
			expression = `{,'${upperBound}']`;
		} else if (upperBound == null && lowerBound != null) {
			expression = `['${lowerBound}',}`;
		} else {
			/*:: if(lowerBound!=null && upperBound!=null) */
			expression = `['${lowerBound}','${upperBound}']`;
		}

		return toExpression('range', field, expression, options);
	},

	termNum: function (field: string, value: ?number, options: ?Options): Expression {
		if (value == null) return null;

		return toExpression('term', field, value, options);
	},

	termStr: function (field: string, value: ?string, options: ?Options): Expression {
		if (value == null) return null;

		return toExpression('term', field, quote(value), options);
	},

	matchall: '(matchall)',

	near: function (field: string, value: ?string[], distance: number, options: ?Options): Expression {
		if (value == null) return null;

		if (options == null) {
			options = {distance: distance};
		} else {
			options.distance = distance;
		}
		return toExpression('near', field, quote(value.join(" ")), options);
	},

	phrase: function (field: string, value: ?string, options: ?Options): Expression {
		if (value == null) return null;

		return toExpression('phrase', field, quote(value), options);
	},

	prefix: function (field: string, value: ?string, options: ?Options): Expression {
		if (value == null) return null;

		return toExpression('prefix', field, quote(value), options);
	}
};
