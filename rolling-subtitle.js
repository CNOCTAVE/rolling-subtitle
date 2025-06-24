// rolling-subtitle - play rolling subtitle in browser.
// Copyright (C) 2024-2025  Yu Hongbo, CNOCTAVE

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
class SubtitleInstance {
    constructor(element, container) {
        this.element = element;
        this.container = container;
        this.animationId = null;
    }

    /**
     * 开始滚动字幕
     * @param {number} speed - 滚动速度(像素/帧)
     */
    play(speed = 1) {
        // 重置位置
        this.element.style.left = this.container.offsetWidth + 'px';
        
        // 停止之前的动画
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // 动画循环
        const animate = () => {
            const currentLeft = parseInt(this.element.style.left);
            const newLeft = currentLeft - speed;
            
            // 如果完全滚出左侧，则重置到右侧
            if (newLeft < -this.element.offsetWidth) {
                this.element.style.left = this.container.offsetWidth + 'px';
            } else {
                this.element.style.left = newLeft + 'px';
            }
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * 开始滚动字幕。滚动结束后自动停止
     * @param {number} speed - 滚动速度(像素/帧)
     */
    playOnce(speed = 1) {
        this.play(speed);
        const totalWidth = this.element.offsetWidth + this.container.offsetWidth;
        const duration = totalWidth / speed * 1000 / 60; // 计算总时长（毫秒）
        setTimeout(() => {
            this.stop();
            this.element.style.left = this.container.offsetWidth + 'px'; // 重置位置
        }, duration);
    }
    
    /**
     * 停止滚动
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 销毁字幕实例，停止动画并移除DOM元素
     */
    destroy(){
        this.stop();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.element = null;
        this.container = null;
    }
    
    /**
     * 获取字幕容器元素
     */
    getElement() {
        return this.container;
    }
}

class RollingSubtitle {
    /**
     * 初始化字幕元素
     * @param {string} text - 要显示的字幕文本
     * @param {object} options - 配置选项
     * @param {string|HTMLElement} parent - 父元素ID或DOM元素
     * @returns {SubtitleInstance} 字幕实例对象
     */
    static init(text, options = {}, parent) {
        // 创建外层容器
        const container = document.createElement('div');
        container.className = 'rolling-subtitle-container';
        
        // 创建字幕元素
        const subtitle = document.createElement('div');
        subtitle.className = 'rolling-subtitle';
        subtitle.textContent = text;
        
        // 应用样式
        container.style.cssText = [
            'position: relative',
            'overflow: hidden',
            'white-space: nowrap',
            `width: ${options.width || '100%'}`,
            `height: ${options.height || '50px'}`,
            `line-height: ${options.height || '50px'}`,
            `background-color: ${options.bgColor || 'transparent'}`,
            `color: ${options.color || '#000'}`,
            `font-size: ${options.fontSize || '16px'}`
        ].join(';');
        
        subtitle.style.cssText = [
            'position: absolute',
            'display: inline-block'
        ].join(';');
        
        container.appendChild(subtitle);
        
        // 自动添加到父元素
        if (parent) {
            const parentEl = typeof parent === 'string' 
                ? document.getElementById(parent) 
                : parent;
            if (parentEl) {
                parentEl.appendChild(container);
                if (options.top === true) {
                    parentEl.classList.add('top-subtitle');
                }
                else if (options.bottom === true) {
                    parentEl.classList.add('bottom-subtitle');
                }
            }
        }
        
        return new SubtitleInstance(subtitle, container);
    }
}

// UMD导出
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.RollingSubtitle = factory());
}(this, () => RollingSubtitle));