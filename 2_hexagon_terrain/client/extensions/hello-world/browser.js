'use strict';

const { join } = require('path');
const cp = require('child_process');

// 扩展内定义的方法
exports.methods = {
    log() {
        const excelpath = join(__dirname,'./../../../design/excel');
        const outpath = join(__dirname,'./../../assets/scripts/db')
        const pythonPath = join(__dirname,'./../../../design/tool/excel2ts.py')
        const cmdstr = `python ${pythonPath} ${excelpath} ${outpath}`;
        cp.exec(cmdstr, (error, stdout, stderr)=>{
            console.log('Hello World',stdout);
        })
    },
};

// 当扩展被启动的时候执行
exports.load = function() {};

// 当扩展被关闭的时候执行
exports.unload = function() {};