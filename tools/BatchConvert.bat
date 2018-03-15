@echo off
chcp 65001
echo batch convert obj To gltf
echo 请选择要执行的操作，目前支持转换模型到gltf、glb、b3dm、b3dm瓦片,分别对应操作顺序1-4
echo 其他操作还不支持
echo q 退出
echo.
:cho
set num=
set para=
set /p num=请选择需要执行的操作
if  "%num%"=="1" (
    echo 转换为gltf
) else (
    if "%num%"=="2" ( set para=-b ) else (
        if "%num%"=="3" ( set para=--b3dm ) else (
            if "%num%"=="4" ( set para=--tileset ) else (
                if "%num%"=="q" ( exit ) else (
                     echo 选择无效，请重新输入 
                     goto cho
                     )   
                )
             )   
         )
)

echo 脚本中写入对应的路径
set dirPath=
set /p dirPath=
echo 路径为:%dirPath%
echo 开始转换
for /r %dirPath% %%i in (*.obj) do (
    echo %%i
    call obj23dtiles -i %%i %para%
    ) 
echo 转换完毕
echo 继续选择 r ,其他则退出
set again=
set /p again=
if  "%again%"=="r" goto cho else exit 
pause
