2013-09-09
1.新增quote plugin for webmail，用来隐藏引用的文字，只适用于webmail
2.对DEMO做了汉化

2013-09-06
1.修复中文输入法无法undo

2013-09-05
1.修复上下左右键进行nodeChange，并进行延时处理，方便字体探测

2013-09-03
1.恢复官方的一些代码，采用写新类继承官方的类，而不是修改官方的类
2.CSS重构，不修改一行官方CSS，采用覆盖的方法来达到自定义CSS
3.重新制作icon图片，删去alimail相关的icon

2013-08-31
1.优化了setContent和getContent的性能 ，修改默认参数为raw，也就是不使用tinymce的转换逻辑
2.升级到官方版本4.0.5

2013-08-29
1.重构Word、Excel粘贴的代码，Chrome下可以保持99%的样式，IE低点，FF更低
2.重构（撤回、重做）代码，解决了编辑大文本的时候速度很慢的问题
3.重构了字体和字体大小探测器，win7系统开启默认字体探测，其他系统只显示默认字体，字体大小全部探测