/**
 * support IE8+/Safari/Chrome/Firefox
 * @author lynweklm@gmail.com
 * @beta 0.0.1
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
                var count = this.length;
                this[count] = val;
                this.length = count + 1;
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
            }
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
            div.className = classNames.join(" ");
        };
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
     * 此处获取需要的区域之后，还创建了滑道和滑块Node Object，计算了此区域的大小
     * @return {Object}
     */
    function getScrollTarget(){
        var scrollBody   = document.querySelector('.appelsin-scroll'),
            scrollBar    = document.createElement("DIV"),
            scrollWay    = document.createElement("DIV"),
            existsWay    = document.querySelector('.appelsin-scroll-way'),//if exists
            box          = scrollBody.getBoundingClientRect(),
            width        = box.width,
            height       = box.height;
        scrollBar.setAttribute('class' , 'appelsin-scroll-bar');
        scrollWay.setAttribute('class' , 'appelsin-scroll-way');
        if(existsWay){
            scrollBody.removeChild(existsWay);//remove the scrollWay if exists
        };
        appelsinScroll.scrollBody = scrollBody;
        console.log("get scroll target success");
        return {
            body : scrollBody,
            scrollWay : scrollWay,
            scrollBar : scrollBar,
            width : width,
            height : height
        };
    };
    //set a wrapper before insert scrollway
    function setScrollContent(){
        var scrollBody = appelsinScroll.scrollBody,
            children   = scrollBody.childNodes,
            scrollContent = document.createElement('DIV'),
            tempNode;
        scrollContent.setAttribute('class' , 'appelsin-scroll-content');
        for(var i = children.length - 1 ; i >= 0 ; i --){
            tempNode = children[i];
            scrollContent.appendChild(tempNode);
        };
        scrollBody.appendChild(scrollContent);
        appelsinScroll.scrollContent = scrollContent;
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
        wheelEventHandler(element , scrollWay);
        //console.log("set mouse event");
    };
    /**
     * 设置滑道上的鼠标点击事件监听
     * @param {Node Object} element
     */
    function setScrollClickEvent(element , type){
        eventHandler.addHandler(element , "click" , function(e){
            var content     = appelsinScroll.scrollContent,
                scrollType  = (type === "horizon") ? "Width" : "Height",
                offsetType  = (type === "horizon") ? "X" : "Y",
                scrollSize  = element["offset" + scrollType],
                contentSize = content["scroll" + scrollType],
                offset      = e["offset" + offsetType],
                scrollBar   = getFirstElementChild(element),
                distance;
            distance = parseInt(translateCord(scrollSize - 30 , offset , contentSize - scrollSize - 10));
            content.style.marginTop = -distance + "px";
            updateScrollBarPosition(scrollBar , scrollSize , offset);
            //console.log("one click event");
        });
        //console.log("set click event");
    };
    /**
     * 设置滑块的事件监听
     * @param {Node Object} element
     */
    function setScrollBarEvent(element , type){
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
            eventHandler.addHandler(document , "mousemove" , mouseMoveHandler(that , flag , type));
            eventHandler.addHandler(document , "mouseup" , mouseUpHandler(flag));
        });
    };
    /**
     * mouse move handler
     * @param  {Node Object} context 滑块
     * @param  {Object} flag    记录事件监听回调函数的id
     * @param  {String} type    滑块类型（horizon / vertical）
     * @return {function} handlerQueue[dist] 事件函数
     */
    function mouseMoveHandler(context , flag , type){
        var dist = handlerQueue.length + 1;
        handlerQueue[dist]    = function(){
            var scrollWay     = context.parentNode,
                content       = appelsinScroll.scrollContent,
                contentType   = (type === "horizon") ? "Width" : "Height",
                sizeType      = (type === "horizon") ? "width" : "height",
                marginType    = (type === "horizon") ? "left" : "top",
                contentSize   = content["scroll" + contentType],
                margin        = scrollWay.getBoundingClientRect()[marginType],
                scrollWaySize = scrollWay.getBoundingClientRect()[sizeType],
                offset,
                positon;
            event.toELement = context;
            offset = parseInt(event.clientY - margin);
            updateScrollBarPosition(context , scrollWaySize , offset);
            positon = translateCord(scrollWaySize , offset , contentSize - scrollWaySize - 10);
            content.style.marginTop = -positon + "px";
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
            console.log(event);
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
    function wheelEventHandler(element , scrollWay){
        //判断浏览器
        var isFF =/FireFox/i.test(navigator.userAgent),
            distance  = 0,
            contentSize = element.scrollHeight - 10;
        if(containClass(scrollWay , "appelsin-scroll-way-vertical")){
            eventHandler.addHandler(element , "mousewheel" , function(e){
                stopPropagation(e);
                var scrollBar = getFirstElementChild(scrollWay),
                    scrollSize  = scrollWay.getBoundingClientRect().height,
                    positon,
                    offset;
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
                };
                //console.log(scrollSize);
                updateScrollBarPosition(scrollBar , scrollSize , distance);
                positon = translateCord(scrollSize , distance , contentSize - scrollSize);
                getFirstElementChild(element).style.marginTop = -positon + "px";
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
    function updateScrollBarPosition(scrollBar , total , margin){
        var top    = 15,
            bottom = total - 15,
            offset;
        if(margin > bottom){
            offset = bottom;
        }else if(margin < top){
            offset = top;
        }else{
            offset = margin;
        };
        scrollBar.style.marginTop = offset - 15 + "px";
    };
   /**
    * 初始化滑道事件
    * @param {object} opt 设置事件配置项
    */
    function initScrollEvent(opt){
        if(opt.click.ele){
            setScrollClickEvent(opt.click.ele);
        };
        if(opt.mouse.ele){
            setScrollMouseEvent(opt.mouse.ele , opt.mouse.scrollWay);
        };
    };
   /**
    * 组装滑块与滑道，并为它们加入相应的class name
    * @param {Node Object} scrollBar 滑块
    * @param {Node Object} scrollWay 滑道
    * @param {int} size 滑道大小，水平则是宽度，垂直则是高度
    * @param {string} type 滑道类型
    * Warning 对滑块的事件监视要在此添加
    */
    function scrollFactory(scrollBar , scrollWay , size , type){
        if(type){
            var scrollBody = appelsinScroll.scrollBody,
                scrollBarTemp,
                scrollWayTemp,
                sizeType = (type === "horizon") ? "width" : "height";
            scrollBarTemp = scrollBar.cloneNode();
            scrollWayTemp = scrollWay.cloneNode();
            addClass(scrollBarTemp , 'appelsin-scroll-bar-' + type);
            addClass(scrollWayTemp , 'appelsin-scroll-way-' + type);
            scrollWayTemp.style[sizeType] = size - 10 + "px";
            scrollWayTemp.appendChild(scrollBarTemp);
            insertScrollWay(scrollWayTemp);
            setScrollBarEvent(scrollBarTemp , type);
        };
    };
    /**
     * 讲需要自定义滑块的部分的子元素外边通过setScrollContent加上自定义的容器
     * 然后将滑道滑块通过scrollFactory组装
     * 然后加上事件监听
     * 插入到DOM相应的部分中
     * @param  {Node Object} scrollWay 滑道
     */
    function insertScrollWay(scrollWay){
        //the option of scrollbar event
        var scrollBody    = appelsinScroll.scrollBody,
            option = {
                "click" : {
                    "ele" : scrollWay
                },
                "mouse" : {
                    "ele" : scrollBody,
                    "scrollWay" : scrollWay
                }
            };
        setScrollContent();
        initScrollEvent(option);
        scrollBody.appendChild(scrollWay);
    };
    /**
     * API exposed
     * @type {Object}
     */
    var appelsinScrollPrototype = {
        init : function(vertical , horizon){
            var target = getScrollTarget(),
                scrollBody = target.body,
                scrollWay  = target.scrollWay,
                scrollBar  = target.scrollBar,
                width      = target.width,
                height     = target.height;
            if(horizon || vertical){
                horizon = horizon ? "horizon" : false;
                vertical= vertical? "vertical": false;
                scrollFactory(scrollBar , scrollWay , width , horizon);
                scrollFactory(scrollBar , scrollWay , width , vertical);
            }else{
                throw "unsupported params type , bool needed";
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
        if(event.stopPropagation){
            event.stopPropagation();
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
    extend(appelsinScroll , appelsinScrollPrototype);
})(window , document);