var Jraw = (function () {
'use strict';

// A mathematical vector
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.x = 0;
        this.y = 0;
        if (x)
            this.x = x;
        if (y)
            this.y = y;
    }
    /**
     * Sums to vectors together
     */
    Vector.add = function (vector1, vector2) {
        return new Vector(vector1.x + vector2.x, vector1.y + vector2.y);
    };
    /**
     * Subtracts `vector2` from `vector1` (e.i. `vector1 - vector2`)
     */
    Vector.subtract = function (vector1, vector2) {
        return new Vector(vector1.x - vector2.x, vector1.y - vector2.y);
    };
    /**
     * Clones the `Vector`
     */
    Vector.prototype.clone = function () {
        return new Vector(this.x, this.y);
    };
    /**
     * Adds `vector` to this Vector
     */
    Vector.prototype.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
    };
    /**
     * Subtracts `vector` from this Vector
     */
    Vector.prototype.subtract = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
    };
    /**
     * Multiplies this Vector by `num`
     * @param num The Multiplier
     */
    Vector.prototype.multiply = function (num) {
        this.x *= num;
        this.y *= num;
    };
    /**
     * Divides this Vector by num
     * @param num The divisor
     */
    Vector.prototype.divide = function (num) {
        this.x = this.x / num;
        this.y = this.y / num;
    };
    /**
     * Returns the heading of this Vector
     */
    Vector.prototype.heading = function () {
        return Math.atan(this.y / this.x);
    };
    /**
     * Returns the angle of this Vector
     */
    Vector.prototype.angle = function () {
        return Math.atan2(this.y, this.x);
    };
    /**
     * Returns the magnitude of this Vector
     */
    Vector.prototype.magnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    /**
     * Normalizes this Vector (i.e. Reduces it to a magnitude of `1`)
     */
    Vector.prototype.normalize = function () {
        var m = this.magnitude();
        if (m > 0) {
            this.divide(m);
        }
    };
    /**
     * Limits the magnitude of this vector to `num`
     * @param num The limit
     */
    Vector.prototype.limit = function (num) {
        if (this.magnitude() > num) {
            this.normalize();
            this.multiply(num);
        }
    };
    return Vector;
}());

/*

Jraw.js - A JavaScript library for manipulating HTML canvases

By, Justin Taddei <mail@justintaddei.com>
Website: justintaddei.com

*/
window.requestAnimationFrame =
    window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(function () {
                callback(Date.now());
            }, 1000 / 60);
        };
window.cancelAnimationFrame =
    window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        function (id) {
            return window.clearTimeout(id);
        };
var mathExt = {
    /**
     * `Math.PI * 2`
     */
    TAU: Math.PI * 2,
    /**
     * Converts degrees to radians
     */
    toRad: function (degs) {
        return degs * (Math.PI / 180);
    },
    /**
     * Converts radians to degrees
     */
    toDeg: function (rads) {
        return rads * (180 / Math.PI);
    },
    /**
     * Returns of random number, optionally within a given range
     *
     * If `min` is omitted then the range is `0 <= x <= max`
     *
     * @param min The minimum value
     * @param max The maximum value
     */
    random: function (max, min) {
        var r = Math.random();
        if (!max) {
            return r;
        }
        if (!min) {
            return r * max;
        }
        if (min < 0) {
            min = Math.abs(min);
            max += min;
            r *= max;
            r -= min;
        }
        else {
            do {
                r = Math.random() * max;
            } while (r < min);
        }
        return r;
    },
    /**
     * Constrains a number within the given range
     * @param num The number to constrain
     * @param min Minimum value
     * @param max Maximum volume
     */
    constrain: function (num, min, max) {
        return Math.max(Math.min(num, max), min);
    },
    /**
     * Converts polar coordinates to cartesian coordinates
     *
     * @param theta The angle in radians
     */
    toCartesian: function (radius, theta) {
        var x = radius * Math.cos(theta);
        var y = radius * Math.sin(theta);
        return {
            x: x,
            y: y
        };
    },
    /**
     * Converts cartesian coordinates to polar coordinates
     */
    toPolar: function (x, y) {
        var vec = new Vector(x, y);
        return {
            theta: vec.angle(),
            radius: vec.magnitude()
        };
    }
};
// Jraw
var Jraw = /** @class */ (function () {
    function Jraw(canvas) {
        this.connectPaths = false;
        this.translation = new Vector(0, 0);
        this.scaled = new Vector(1, 1);
        this.rotation = 0;
        this._animationRunning = false;
        this.canvasElement = canvas;
        this.context = this.canvasElement.getContext('2d');
        this.width = this.canvasElement.width;
        this.height = this.canvasElement.height;
        this.matrixStack = [
            {
                translation: this.translation.clone(),
                scale: this.scaled.clone(),
                rotation: 0
            }
        ];
        this.animationLoop = this.animationLoop.bind(this);
    }
    Object.defineProperty(Jraw.prototype, "animating", {
        get: function () {
            return this._animationRunning;
        },
        enumerable: true,
        configurable: true
    });
    Jraw.prototype.startAnimation = function () {
        if (this._animationRunning)
            return;
        this._animationRunning = true;
        requestAnimationFrame(this.animationLoop);
    };
    Jraw.prototype.animationLoop = function (timestamp) {
        if (!this._animationRunning || typeof this.animation !== 'function') {
            this._animationRunning = false;
            return;
        }
        this.animation(timestamp);
        requestAnimationFrame(this.animationLoop);
    };
    Jraw.prototype.stopAnimation = function () {
        this._animationRunning = false;
    };
    Jraw.prototype.toggleAnimaion = function () {
        if (this.animating)
            this.stopAnimation();
        else
            this.startAnimation();
    };
    Jraw.prototype.setTextAlign = function (mode) {
        this.context.textAlign = mode;
        return this;
    };
    Jraw.prototype.setTextBaseline = function (mode) {
        this.context.textBaseline = mode;
        return this;
    };
    Jraw.prototype.setFont = function (font) {
        this.context.font = font;
        return this;
    };
    Jraw.prototype.text = function (string, x, y, font, align, baseline, maxWidth) {
        var _this = this;
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (font === void 0) { font = this.context.font; }
        if (align === void 0) { align = this.context.textAlign; }
        if (baseline === void 0) { baseline = this.context.textBaseline; }
        if (maxWidth === void 0) { maxWidth = Infinity; }
        var previousTextAlign = this.context.textAlign;
        var previousBaseline = this.context.textBaseline;
        var previousFont = this.context.font;
        this.setTextAlign(align)
            .setTextBaseline(baseline)
            .setFont(font);
        return {
            fill: function (color) {
                if (color === void 0) { color = _this.context.strokeStyle; }
                var previousColor = _this.context.strokeStyle;
                _this.context.fillStyle = color;
                _this.context.fillText(string, x, y, maxWidth);
                _this.context.fillStyle = previousColor;
                _this.setTextAlign(previousTextAlign)
                    .setTextBaseline(previousBaseline)
                    .setFont(previousFont);
                return _this;
            },
            stroke: function (color) {
                if (color === void 0) { color = _this.context.strokeStyle; }
                var previousColor = _this.context.strokeStyle;
                _this.context.strokeStyle = color;
                _this.context.strokeText(string, x, y, maxWidth);
                _this.context.strokeStyle = previousColor;
                _this.setTextAlign(previousTextAlign)
                    .setTextBaseline(previousBaseline)
                    .setFont(previousFont);
                return _this;
            }
        };
    };
    Jraw.prototype.resizeCanvas = function (x, y) {
        this.width = this.canvasElement.width = x;
        this.height = this.canvasElement.height = y;
    };
    Jraw.prototype.clear = function () {
        this.context.clearRect(0 - this.translation.x, 0 - this.translation.y, this.width, this.height);
        this.newPath();
        return this;
    };
    Jraw.prototype.save = function () {
        this.context.save();
        return this;
    };
    Jraw.prototype.restore = function () {
        this.context.restore();
        return this;
    };
    Jraw.prototype.scale = function (x, y) {
        y = y || x;
        this.context.scale(x, y);
        this.scaled.add(new Vector(x, y));
        return this;
    };
    Jraw.prototype.rotate = function (angle) {
        this.context.rotate(angle);
        this.rotation += angle;
        return this;
    };
    Jraw.prototype.translate = function (x, y) {
        this.context.translate(x, y);
        this.translation.add(new Vector(x, y));
        return this;
    };
    Jraw.prototype.pushMatrix = function () {
        this.matrixStack.push({
            translation: this.translation.clone(),
            scale: this.scaled.clone(),
            rotation: this.rotation
        });
        return this;
    };
    Jraw.prototype.resetMatrix = function () {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.translation = new Vector(0, 0);
        this.scaled = new Vector(0, 0);
        this.rotation = 0;
        return this;
    };
    Jraw.prototype.popMatrix = function () {
        this.resetMatrix();
        var stack = this.matrixStack.pop();
        if (!stack)
            return this;
        this.translate(stack.translation.x, stack.translation.y);
        this.scale(stack.scale.x, stack.scale.y);
        this.rotate(stack.rotation);
        return this;
    };
    Jraw.prototype.setFill = function (color) {
        this.context.fillStyle = color;
        return this;
    };
    Jraw.prototype.setStroke = function (color) {
        this.context.strokeStyle = color;
        return this;
    };
    Jraw.prototype.stroke = function (color, width) {
        if (color === void 0) { color = this.context.strokeStyle; }
        if (width === void 0) { width = this.context.lineWidth; }
        var previousStroke = this.context.strokeStyle;
        var previousWidth = this.context.lineWidth;
        this.setStrokeWidth(width);
        this.setStroke(color);
        this.context.stroke();
        this.setStrokeWidth(previousWidth);
        this.setStroke(previousStroke);
        return this;
    };
    Jraw.prototype.fill = function (color) {
        if (color === void 0) { color = this.context.fillStyle; }
        var previousColor = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.fill();
        this.context.fillStyle = previousColor;
        return this;
    };
    Jraw.prototype.rect = function (x, y, w, h) {
        if (!this.connectPaths) {
            this.newPath();
        }
        this.context.rect(x, y, w, h);
        return this;
    };
    Jraw.prototype.triangle = function (c1X, c1Y, c2X, c2Y, c3X, c3Y) {
        if (!this.connectPaths) {
            this.newPath();
        }
        this.line(c1X, c1Y, c2X, c2Y, c3X, c3Y, c1X, c1Y);
        return this;
    };
    Jraw.prototype.circle = function (x, y, r) {
        if (!this.connectPaths) {
            this.newPath();
        }
        this.context.arc(x, y, r, 0, Jraw.math.TAU);
        return this;
    };
    Jraw.prototype.newPath = function () {
        this.context.beginPath();
        return this;
    };
    Jraw.prototype.closePath = function () {
        this.context.closePath();
        return this;
    };
    Jraw.prototype.arc = function (x, y, r, sA, eA, counterclockwise) {
        if (!this.connectPaths) {
            this.newPath();
        }
        this.context.arc(x, y, r, sA, eA, counterclockwise);
        return this;
    };
    Jraw.prototype.lineTo = function (x, y) {
        this.context.lineTo(x, y);
        return this;
    };
    Jraw.prototype.moveTo = function (x, y) {
        this.context.moveTo(x, y);
        return this;
    };
    Jraw.prototype.line = function () {
        var points = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            points[_i] = arguments[_i];
        }
        if (!this.connectPaths) {
            this.newPath();
        }
        this.moveTo(points[0], points[1]);
        for (var i = 2; i < points.length; i += 2) {
            this.lineTo(points[i], points[i + 1]);
        }
        return this;
    };
    Jraw.prototype.setStrokeWidth = function (width) {
        this.context.lineWidth = width;
        return this;
    };
    Jraw.prototype.image = function (img, x, y, w, h) {
        if (w && h) {
            this.context.drawImage(img, x, y, w, h);
        }
        else {
            this.context.drawImage(img, x, y);
        }
        return this;
    };
    Jraw.math = mathExt;
    return Jraw;
}());

return Jraw;

}());
