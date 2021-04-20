## excel配表规范  
	1.第一行为注释，第二行是类型(int、string、array) 第三行字段名
	2.从第四行开始才是数据。
	3.默认第一列为id，索引用
## 配置表excel导表说明  
### [win]  
	1.安装python 3.7.0   
	2.安装xlrd插件https://pypi.python.org/pypi/xlrd (进入对应目录执行python setup.py install)   
	3.安装openpyxl插件https://pypi.python.org/pypi/openpyxl   
### [win/mac]  
    1.运行python excel2json.py excel json  
	2.可在creator中的developer中导出 
### TODO
	1.配表工具不做多语言校验，因此需要配置人员自己拟定多语言处理，后期会支持id为字符串形式。  
