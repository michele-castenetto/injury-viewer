(function() {
    
    var _this = {};


    var __render = function(template, data) {
        for (var key in data) {
            template = template.toString().replace(new RegExp('{{' + key + '}}', 'g'), data[key]);
        }
        return template;
    };
    
    var __htmlToDOMElements = function(html_string) {
        var fragment = document
        .createRange()
        .createContextualFragment(html_string.trim());
        return fragment.children[0];
    };


    var Button = (function() {
        return {
            mount: function(parentNode) {
                var node = document.createElement('div');
                this.node = node;
                this.parentNode = parentNode;
                parentNode.appendChild(this.node);
                return node;
            },
            update: function(props) {

                var _this = this;
                props = props || {};
                this.props = props;

                var iconClass = props.iconClass || this.props.iconClass || "";
                if (iconClass) {
                    var n = document.createElement('span');
                    n.setAttribute("class", iconClass);
                    this.node.appendChild(n);
                }

                var style = props.style || this.props.style || null;
                if (style) {
                    style = Object.keys(style).map(function(key) { return  key + ":" + style[key]; }).join(";");
                    this.node.setAttribute("style", style);
                }
                var className = props.className || this.props.className || "";
                this.node.setAttribute("class", className);
                
                // var label = props.label || this.props.label || "";
                // this.node.innerHTML = label;

                var handleClick = props.handleClick || this.props.handleClick || function() {};

                this.node.addEventListener('click', handleClick.bind(this), true);

            }
        };

    });
    _this.Button = Button;





    


    window.UI = _this;


})();