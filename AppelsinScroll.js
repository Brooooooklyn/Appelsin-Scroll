/**
 * support IE8+/Safari/Chrome/Firefox
 * @author lynweklm@gmail.com
 * @beta 0.0.2
 * @license MIT
 */
;(function(window , document , undefined){
    'use strict';
    var appelsinScroll = window.appelsinScroll || (window.appelsinScroll = {}),
        handlerQueue = { //handler queue include the handler of mouseup and mousemove
            length : 0
        },
        targetQueue = {
            length : 0,
            push : function(val){
                var count = this.length,
                    node  = this.initNode(val , count);
                this[count] = node;
                this.length = count + 1;
            },
            remove : function(flag){
                this.length = this.length - 1;
                freeQuee.push(flag);
                this.flag = undefined;
            },
            freeQuee : [],
            /**
             * Only create all needed node here and package them when Appelsin init
             * @param  {Object Node} scrollBody The node object needed to add scroll
             * @param  {Number} flag       [description]
             * @return {Object}            Include scrollBody scrollContent scrollWay scrollBar width height dist
             */
            initNode : function(scrollBody , flag){
                var scrollBar    = document.createElement("DIV"),
                    scrollWay    = document.createElement("DIV"),
                    existsWay    = document.querySelector('.appelsin-scroll-way'),//if exists
                    box          = scrollBody.getBoundingClientRect(),
                    width        = box.width,
                    height       = box.height,
                    scrollContent;
                scrollBar.setAttribute('class' , 'appelsin-scroll-bar');
                scrollWay.setAttribute('class' , 'appelsin-scroll-way');
                if(existsWay){
                    scrollBody.removeChild(existsWay);//remove the scrollWay if exists
                };
                scrollContent = setScrollContent(scrollBody);
                if(flag > 100){
                    throw "Too many element to handler";
                }else{
                    return {
                        scrollBody    : scrollBody,
                        scrollContent : scrollContent,
                        scrollWay     : scrollWay,
                        scrollBar     : scrollBar,
                        width         : width,
                        height        : height,
                        barPosition   : 0,
                        "$dist"       : flag
                    };
                }
            }
        };
    /**
     * 获取一个元素的第一个子元素
     * @param  {Node Object} element
     * @return {Node Object}
     */
    function getFirstElementChild(element){
        if(element.firstELementChild){
            return element.firstELementChild;
        }else{
            var children = element.childNodes;
            if(children.length > 0){
                for(var i = 0 ; i < children.length ; i ++){
                    if(children[i].nodeType === 1){
                        return children[i];
                    }else{
                        continue;
                    };
                };
                return children[0];
            }else{
                return document.createTextNode("");
            };
        };
    };
    /**
     * 判断一个元素是否在数组中
     * @param  {Array} array
     * @param  {AnyType} key
     * @return {bool}
     * TO-DO 对象/数组判断，针对不同情况作不同处理
     */
    function inArray(array , key){
        for(var i in array){
            if(array[i] === key){
                return true;
            }else{
                return false;
            };
        };
    };
    /**
     * 删除一个元素的class
     * @param  {Node Object} element 要删除class的元素
     * @param  {String} className 要删除的class
     */
    function deleteClass(element , className){
        if(element.classList){
            element.classList.remove(className);
        }else{
            var classNames = element.className.split(/\s+/),
                positon    = -1,
                i,
                len;
            for(i = 0 , len = classNames.length ; i < len ; i ++){
                if(classNames[i] === className){
                    positon = i;
                    break;
                };
            };
            classNames.splice(positon , 1);
            div.className = classNames.join(" ");
        };
    };
    /**
     * 向一个元素增加一个class name
     * @param {Node Object} element 要增加class的元素
     * @param {String} className 要增加的class 名
     * @return {Node Object} 返回增加class后的element
     */
    function addClass(element , className){
        if(element.classList){
            element.classList.add(className);
        }else{
            var classNames = element.className.split(/\s+/);
            if(inArray(classNames , className)){
                return;
            }else{
                classNames.push(className);
            };
            element.className = classNames.join(" ");
        };
        return element;
    };
    /**
     * 判断一个元素是否有className
     * @param  {Node Object} element 要判断的元素
     * @param  {String} className 要判断的类名
     * @return {Bool}
     */
    function containClass(element , className){
        if(element.classList){
            return element.classList.contains(className);
        }else{
            var classNames = element.className.split(/\s+/);
            return inArray(classNames , className);
        };
    };
    /**
     * 获取需要自定义滚动条的区域，即带有appelsin-scroll class name的区域
     * @return {Object Array} include the areas needed to add scroll
     */
    function getScrollTarget(scrollBody){
        var areas  = document.querySelectorAll(".appelsin-scroll"),
            length = areas.length,
            tempNode;
        for(var i = 0 ; i < length ; i++){
            tempNode = areas[i];
            targetQueue.push(tempNode);
        };
    };
    //set a wrapper before insert scrollway
    function setScrollContent(scrollBody){
        var children   = scrollBody.childNodes,
            scrollContent = document.createElement('DIV'),
            tempNode;
        scrollContent = addClass(scrollContent , 'appelsin-scroll-content');
        for(var i = children.length - 1 ; i >= 0 ; i --){
            tempNode = children[i];
            scrollContent.appendChild(tempNode);
        };
        scrollBody.appendChild(scrollContent);
        return scrollContent;
    };
    /**
     * 设置当鼠标进入需要滚动条的区域时显示滑道
     * @param {Node Object} element
     * @param {Node Object} scrollWay
     */
    function setScrollMouseEvent(element , scrollWay){
        eventHandler.addHandler(element , "mouseenter" , function(e){
            scrollWay.style.opacity = 0.9;
        });
        eventHandler.addHandler(element , "mouseleave" , function(){
            scrollWay.style.opacity = 0;
        });
        //console.log("set mouse event");
    };
    /**
     * 设置滑道上的鼠标点击事件监听
     * @param {Int} $dist
     */
    function setScrollClickEvent($dist){
        var target  = targetQueue[$dist],
            content = target.scrollContent,
            type    = target.type,
            element = target.scrollWay;
        eventHandler.addHandler(element , "click" , function(e){
            var scrollType   = (type === "horizon") ? "Width" : "Height",
                offsetType   = (type === "horizon") ? "X" : "Y",
                contentMargin= (type === "horizon") ? "marginLeft" : "marginTop",
                scrollSize   = element["offset" + scrollType],
                contentSize  = content["scroll" + scrollType],
                offset       = e["offset" + offsetType],
                scrollBar    = target.scrollBar,
                distance;
            distance = parseInt(translateCord(scrollSize - 30 , offset , contentSize - scrollSize - 10));
            content.style[contentMargin] = -distance + "px";
            updateScrollBarPosition(scrollBar , scrollSize , offset , $dist);
            //console.log("one click event");
        });
        //console.log("set click event");
    };
    /**
     * 设置滑块的事件监听
     * @param {Node Object} element
     */
    function setScrollBarEvent(element , $dist){
        var flag = {
                mousemoveFlag : undefined,
                mouseupFlag : undefined
            },
            scrollWay = element.parentNode;
        scrollWay.style.opacity = 0.9;
        eventHandler.addHandler(element , "click" , function(e){
            stopPropagation(e);
        });
        eventHandler.addHandler(element , "mousedown" , function(e){
            stopPropagation(e);
            var that = this;
            eventHandler.addHandler(document , "mousemove" , mouseMoveHandler($dist , flag));
            eventHandler.addHandler(document , "mouseup" , mouseUpHandler(flag));
        });
    };
    /**
     * mouse move handler
     * @param  {Node Object} context 滑块
     * @param  {Object} flag    记录事件监听回调函数的id
     * @return {function} handlerQueue[dist] 事件函数
     */
    function mouseMoveHandler($dist , flag){
        var dist = handlerQueue.length + 1,
            type = targetQueue[$dist].type;
        handlerQueue[dist]    = function(){
            var scrollWay     = targetQueue[$dist].scrollWay,
                scrollBar     = targetQueue[$dist].scrollBar,
                content       = targetQueue[$dist].scrollContent,
                contentSize,
                margin,
                scrollWaySize,
                contentType,
                sizeType,
                marginType,
                contentMargin,
                offset,
                positon;
            if(type === "vertical"){
                contentType  = "Height";
                sizeType     = "height";
                marginType   = "top";
                contentMargin= "marginTop";
            }else{
                contentType  = "Width";
                sizeType     = "width";
                marginType   = "left";
                contentMargin= "marginLeft";
            };
            margin           = scrollWay.getBoundingClientRect()[marginType];
            scrollWaySize    = parseInt(scrollWay.style[sizeType]);
            contentSize      = content["scroll" + contentType];
            event.toELement  = scrollWay;
            offset = parseInt(event.clientY - margin);
            updateScrollBarPosition(scrollBar , scrollWaySize , offset , $dist);
            positon = translateCord(scrollWaySize , offset , contentSize - scrollWaySize - 10);
            content.style[contentMargin] = -positon + "px";
            scrollWay.style.opacity = 0.9;
            //console.log(offset);
        };
        //console.log(handlerQueue);
        flag.mousemoveFlag = dist;
        handlerQueue.length = dist;
        return handlerQueue[dist];
    };
    /**
     * [mouseUpHandler]
     * @param  {Object} flag  mousemove函数在函数处理队列中的位置
     * @return {function} handlerQueue[dist] 事件处理函数
     */
    function mouseUpHandler(flag){
        var dist = handlerQueue.length + 1,
            mousemoveFlag = flag.mousemoveFlag;
        handlerQueue[dist] = function(){
            eventHandler.removeHandler(document , "mousemove" , handlerQueue[mousemoveFlag]);
            eventHandler.removeHandler(document , "mouseup" , handlerQueue[dist]);
            //console.log("stop record the pointer positon");
        };
        handlerQueue[length] = dist;
        flag.mouseupFlag = dist;
        return handlerQueue[dist];
    };
    /**
     * 鼠标滚轮事件处理，只支持垂直方向的滚动
     * @param  {Node Object} element   滚动区域
     * @param  {Node Object} scrollWay 滑道
     */
    function wheelEventHandler($dist){
        //判断浏览器
        var isFF          =/FireFox/i.test(navigator.userAgent),
            target        = targetQueue[$dist],
            scrollWay     = target.scrollWay,
            scrollContent = target.scrollContent,
            contentSize   = scrollContent.scrollHeight - 10,
            distance;
        if(containClass(scrollWay , "appelsin-scroll-way-vertical")){
            eventHandler.addHandler(scrollContent , "mousewheel" , function(e){
                var scrollBar   = target.scrollBar,
                    scrollSize  = scrollWay.getBoundingClientRect().height,
                    positon,
                    offset;
                distance = targetQueue[$dist]["barPosition"];
                if(!isFF){
                    offset = -e.wheelDelta / 120;
                }else{
                    offset = e.wheelDelta / 3;
                };
                if(distance + (offset * 20) < 0){
                    distance = 0;
                }else if(distance + (offset * 20) > scrollSize){
                    distance = scrollSize;
                }else{
                    distance += (offset * 20);
                    stopPropagation(e);
                };
                updateScrollBarPosition(scrollBar , scrollSize , distance , $dist);
                positon = translateCord(scrollSize , distance , contentSize - scrollSize);
                scrollContent.style.marginTop = -positon + "px";
                //console.log(distance);
            });
        }else{
            return;
        }
    };
    /**
     * 根据滑块在滑道的位置，计算出内容的偏移量.
     * @param  {int} total
     * @param  {int} margin
     * @param  {int} contentSize
     * @return {int}
     */
    function translateCord(total , margin , contentSize){
        var percent = (margin > total) ? 1 : margin/total;
        if(margin < 15){
            return 0;
        }else if(margin > total - 15){
            return contentSize;
        }else{
            return contentSize * percent;
        };
    };
   /**
    * 更新滑块的位置
    * @param {Node Object} scrollBar 改变位置的滑块
    * @param {int} total 滑道的总长
    * @param {int} margin 滑块相对滑道起始位置的位移
    */
    function updateScrollBarPosition(scrollBar , total , margin , $dist){
        var top    = 15,
            bottom = total - 15,
            offset;
        if(margin > bottom){
            offset = bottom - 15;
        }else if(margin < top){
            offset = top - 15;
        }else{
            offset = margin - 15;
        };
        scrollBar.style.transform = "translate(0px , " + offset + "px)";
        targetQueue[$dist]["barPosition"] = offset;
        //console.log(targetQueue[$dist]["barPosition"]);
    };
   /**
    * 组装滑块与滑道，并为它们加入相应的class name
    * @param {Object} target The target need to be packed
    * Warning 对滑块的事件监视要在此添加
    */
    function scrollFactory(target){
        var type          = target.type,
            sizeType      = (type === "horizon") ? "width" : "height",
            size          = target.size,
            scrollBar     = target.scrollBar,
            scrollWay     = target.scrollWay,
            scrollContent = target.scrollContent,
            scrollBody    = target.scrollBody;
        addClass(scrollBar , 'appelsin-scroll-bar-' + type);
        addClass(scrollWay , 'appelsin-scroll-way-' + type);
        scrollWay.style[sizeType] = size - 10 + "px";
        scrollWay.appendChild(scrollBar);
        scrollBody.appendChild(scrollWay);
        setScrollClickEvent(target["$dist"]);
        setScrollMouseEvent(scrollBody , scrollWay);
        setScrollBarEvent(scrollBar , target["$dist"]);
        wheelEventHandler(target["$dist"]);
    };
    /**
     * API exposed
     * @type {Object}
     */
    var appelsinScrollPrototype = {
        init : function(horizon){
            var length,
                target,
                scrollBody,
                scrollWay,
                scrollBar,
                size,
                type;
            getScrollTarget();
            length = targetQueue.length;
            for(var i = 0 ; i < length ; i++){
                target = targetQueue[i];
                scrollBody = target.scrollBody;
                scrollWay  = target.scrollWay;
                scrollBar  = target.scrollBar;
                type       = horizon ? "horizon" : "vertical";
                size       = (type === "horizon") ? target.width : target.height;
                targetQueue[i]['type'] = type;
                targetQueue[i]['size'] = size;
                scrollFactory(targetQueue[i]);
            };
        }
    };
    //cross browser event handler
    var eventHandler = {
        addHandler : function(element , type , handler){
            if(element.addEventListener){
                element.addEventListener(type , handler , false);
            }else if(element.attachEvent){
                element.attachEvent("on" + type , handler)
            }else{
                element["on" + type] = handler;
            };
        },
        removeHandler : function(element , type , handler){
            if(element.removeEventListener){
                element.removeEventListener(type , handler , false);
            }else if(element.detachEvent){
                element.detachEvent("on" + type , handler);
            }else{
                element["on" + type] = null;
            };
        }
    };
    /**
     * cross brower event stop propagation
     * @param  {event} event [事件]
     * @return {bool/void}
     */
    function stopPropagation(event){
        if(event.preventDefault){
            event.preventDefault();
        }else if(event.cancelBubble){
            event.cancelBubble = true;
        }else{
            return false;
        };
    };
    /**
     * object weak copy
     * @param  {Obj} obj 需要扩展的对象
     * @param  {Obj} proto 扩展
     */
    function extend(obj , proto){
        for(var key in proto){
            obj[key] = proto[key];
        };
    };
    /**
     * 判断浏览器支持哪一种trim，V8/TraceMonkey+/Nitro/Chakra 支持原生String的trim
     * @return {function}
     * @param {String} [value] [description]
     */
    var trim = (function() {
        if (!String.prototype.trim) {
            return function(value) {
                return isString(value) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
            };
        };
        return function(value) {
            return isString(value) ? value.trim() : value;
        };
    })();
    extend(appelsinScroll , appelsinScrollPrototype);
})(window , document);