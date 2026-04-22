@echo off
setlocal

echo "Running postpack script for Windows"

if exist dist rmdir /s /q dist
mkdir dist

tar -x -z -f "%npm_package_name%-%npm_package_version%.tgz" -C dist --strip-components=1
tar -c -a -f "%npm_package_name%-%npm_package_version%.zip" -C dist *

if exist "%npm_package_name%-%npm_package_version%.tgz" del /f /q "%npm_package_name%-%npm_package_version%.tgz"
if exist dist rmdir /s /q dist

endlocal
