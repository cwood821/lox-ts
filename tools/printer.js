"use strict";
exports.__esModule = true;
exports.AstPrinter = void 0;
var Token = require("../src/token")["default"];
var TokenType = require("../src/types").TokenType;
var _a = require("./expr"), Grouping = _a.Grouping, Literal = _a.Literal, Unary = _a.Unary, Binary = _a.Binary, Visitor = _a.Visitor, Expr = _a.Expr;
// let { Visitor, Expr } = require("./expr");
// import Token from "../token";
var AstPrinter = /** @class */ (function () {
    function AstPrinter() {
    }
    AstPrinter.prototype.print = function (expr) {
        return expr.accept(this);
    };
    AstPrinter.prototype.visitBinary = function (expr) {
        console.log(expr, expr.operator);
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    };
    AstPrinter.prototype.visitGrouping = function (expr) {
        return this.parenthesize("group", expr.expression);
    };
    AstPrinter.prototype.visitLiteral = function (expr) {
        if (expr.value == null)
            return "nil";
        return expr.value.toString();
    };
    AstPrinter.prototype.visitUnary = function (expr) {
        console.log(expr, expr.operator);
        return this.parenthesize(expr.operator.lexeme, expr.right);
    };
    AstPrinter.prototype.parenthesize = function (name) {
        var _this = this;
        var exprs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            exprs[_i - 1] = arguments[_i];
        }
        var ret = "";
        ret += "(" + name;
        exprs.forEach(function (expr) {
            ret += " ";
            ret += expr.accept(_this);
        });
        ret += ")";
        return ret;
    };
    return AstPrinter;
}());
exports.AstPrinter = AstPrinter;

// function main() {
//     console.log(Token);
//     var expr = new Binary(new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)), new Token(TokenType.STAR, "*", null, 1), new Grouping(new Literal(45.67)));
//     var printer = new AstPrinter();
//     console.log(printer.print(expr));
// }
// main();
