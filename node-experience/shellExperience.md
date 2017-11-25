##### 在windows上写好一个脚本上传传到linux上，可能脚本就不能执行了

出现这种错误的原因是因为：CR/LF问题；在dos/window下按一次回车键实际上输入的是“回车（CR)”和“换行（LF）”，而linux /unix下按一次回车键只输入“换行（LF）”，所以修改的sh文件在每行都会多了一个CR，所以linux下运行时就会报错找不到命令。

举出两种解决方法：
1. 在editplus中“文档->文件格式(CR/LF)->UNIX”，这样linux下就能按unix的格式保存文件
2. 在vim中，输入:set ff=unix，同样也是转换成unix的格式。
