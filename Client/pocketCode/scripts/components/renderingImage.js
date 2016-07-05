﻿/// <reference path='../components/sprite.js' />

PocketCode.RenderingImage = (function () {

    function RenderingImage(args) {

        if (!args || !(typeof args === 'object'))
            throw new Error('The rendering object has to be initialized using a sprite parameter object');

        this._width = 0;
        this._height = 0;

        this._scaling = 1.0;
        this._flipX = false;
        this._rotation = 0.0;

        this.graphicEffects = args.graphicEffects || [];    //TODO: store effects and use canvas = ImageHelper.setFilters(canvas filter[]);
        this.merge(args);   //NOTICE: all parameters have the same names as the public interface of this object- merge will set all ogf these
    }

    //properties
    Object.defineProperties(RenderingImage.prototype, {
        //object: {
        //    get: function () {
        //        return this._canvasElement;
        //    },
        //},
        id: {
            get: function () {
                return this._id;
            },
            set: function (value) {
                this._id = value;
            },
        },
        look: {
            get: function () {
                return this._canvasElement; //inlcuding filters: needed for drawing sprites for collision detection
            },
            set: function (value) {
                if (!value)
                    return;
                else if (!(value instanceof HTMLCanvasElement))
                    throw new Error('invalid look setter: HTMLCanvasElement expected');

                this._canvasElement = value;
                this._originalElement = value;

                this._width = value.width;
                this._height = value.height;

                //restore graphicEffects to new look
                this.graphicEffects = this._graphicEffects;
            },
        },
        x: {
            value: 0.0,
            writable: true,
        },
        y: {
            value: 0.0,
            writable: true,
        },
        scaling: {
            set: function (value) {
                this._scaling = value;
            },
        },
        rotation: {
            set: function (value) {
                this._rotation = value;
            }
        },
        flipX: {
            set: function (value) {
                this._flipX = value;
            }
        },
        visible: {
            value: true,
            writable: true,
        },

        graphicEffects: {
            set: function (filters) {
                if (!(filters instanceof Array))
                    throw new Error('invalid argument: effects');

                this._graphicEffects = filters;
                if (!this._originalElement || filters.length == 0)
                    return;

                if (!this._canvasElement || !filters.length)
                    return;

                var imageElement = this._originalElement;
                var canvasElement = document.createElement('canvas');
                canvasElement.width = imageElement.width;
                canvasElement.height = imageElement.height;
                canvasElement.getContext('2d').drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);

                PocketCode.ImageHelper.setFilters(canvasElement, filters);
                this._canvasElement = canvasElement;
            }
        },
    });

    //methods
    RenderingImage.prototype.merge({
        containsPoint: function (point) {
            if (!this._originalElement || !this.visible || (this._width === 0 && this._height === 0))
                return false;

            var tl = { x: (this.x - this._scaling * this._width / 2.0), y: (this.y - this._scaling * this._height / 2.0) };
            var bl = { x: (this.x - this._scaling * this._width / 2.0), y: (this.y + this._scaling * this._height / 2.0) };
            var tr = { x: (this.x + this._scaling * this._width / 2.0), y: (this.y - this._scaling * this._height / 2.0) };

            if (!this._rotation) {
                return (point.x >= tl.x && point.x <= tr.x &&
                        point.y >= tl.y && point.y <= bl.y);
            }

            //rotate point back
            var rad = -this._rotation * (Math.PI / 180.0);
            var centerToPoint = { x: point.x - this.x, y: point.y - this.y };
            point = {
                x: centerToPoint.x * Math.cos(rad) - centerToPoint.y * Math.sin(rad) + this.x,
                y: centerToPoint.x * Math.sin(rad) + centerToPoint.y * Math.cos(rad) + this.y
            };

            //return (point.x.toFixed(4) >= tl.x && point.x.toFixed(4) <= tr.x && point.y.toFixed(4) >= tl.y && point.y.toFixed(4) <= bl.y);
            //please notice: toFixed() string formatting function and returns a string- try not to convert numbers to strings to number during calculations
            return (point.x >= tl.x && point.x <= tr.x && point.y >= tl.y && point.y <= bl.y);
        },

        draw: function (context) {
            if (!this._originalElement || !this.visible || (this._width === 0 && this._height === 0))
                return;

            context.save();
            context.translate(this.x, -this.y);

            context.rotate(this._rotation * (Math.PI / 180.0));
            context.scale(
                this._scaling * (this._flipX ? -1.0 : 1.0),
                this._scaling
            );

            context.globalAlpha = this._canvasElement.getContext('2d').globalAlpha;
            this._canvasElement && context.drawImage(this._canvasElement, -this._width / 2.0, -this._height / 2.0, this._width, this._height);
            context.restore();
        }
    });

    return RenderingImage;
})();