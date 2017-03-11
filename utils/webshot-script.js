function() {


    if (document) {
        if (document.head) {
            // set default background to white
            var style = document.createElement('style');
            var text = document.createTextNode('body { background: #fff }');
            style.setAttribute('type', 'text/css');
            style.appendChild(text);

            document.head.insertBefore(style, document.head.firstChild);


            //remove modal in photobucket
            // var script = document.createElement('script');
            // var scriptText = "var modals = document.getElementsByClassName('modal');";
            // scriptText += "for (var i = 0; i < modals.length; i++)" +
            //               "{ modals[i].style.display = 'none'; }";
            // scriptText += "var backdrops = document.getElementsByClassName('modal-backdrop');";
            // scriptText += "for (var i = 0; i < backdrops.length; i++)" +
            //               "{ backdrops[i].style.display = 'none'; }";

            // var scriptTextNode = document.createTextNode(scriptText);
            // script.setAttribute('type', 'text/javascript');
            // script.appendChild(scriptTextNode);
            // document.head.insertBefore(script, document.head.firstChild);


            var modals = document.getElementsByClassName('modal')
            var backdrops = document.getElementsByClassName('modal-backdrop')

            for (var i = 0; i < modals.length; i++) {
              modals[i].style.display = 'none';
            }
            for (var i = 0; i < backdrops.length; i++) {
              backdrops[i].style.display = 'none';
            }
        }
    }


    // return page dimension
    return JSON.stringify({
        width: Math.max(
            document.body.offsetWidth,
            document.body.scrollWidth,
            document.documentElement.clientWidth,
            document.documentElement.scrollWidth,
            document.documentElement.offsetWidth
        ),
        height: Math.max(
            document.body.offsetHeight,
            document.body.scrollHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        )
    })
}
