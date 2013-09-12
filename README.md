<h5>2013-09-09</h5>
<ol>
    <li>新增quote plugin for webmail，用来隐藏引用的文字，只适用于webmail</li>
    <li>对DEMO做了汉化</li>
</ol>

<h5>2013-09-06</h5>
<ol>
    <li>修复中文输入法无法undo</li>
</ol>

<h5>2013-09-05</h5>
<ol>
    <li>修复上下左右键进行nodeChange，并进行延时处理，方便字体探测</li>
</ol>

<h5>2013-09-03</h5>
<ol>
    <li>恢复官方的一些代码，采用写新类继承官方的类，而不是修改官方的类</li>
    <li>CSS重构，不修改一行官方CSS，采用覆盖的方法来达到自定义CSS</li>
    <li>重新制作icon图片，删去alimail相关的icon</li>
</ol>

<h5>2013-08-31</h5>
<ol>
    <li>优化了setContent和getContent的性能 ，修改默认参数为raw，也就是不使用tinymce的转换逻辑</li>
    <li>升级到官方版本4.0.5</li>
</ol>

<h5>2013-08-29</h5>
<ol>
    <li>重构Word、Excel粘贴的代码，Chrome下可以保持99%的样式，IE低点，FF更低</li>
    <li>重构（撤回、重做）代码，解决了编辑大文本的时候速度很慢的问题</li>
    <li>重构了字体和字体大小探测器，win7系统开启默认字体探测，其他系统只显示默认字体，字体大小全部探测</li>
</ol>
