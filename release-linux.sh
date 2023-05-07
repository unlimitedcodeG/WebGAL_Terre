echo "Welcome to build WebGAL Origine, the editor of WebGAL platform."
# 安装依赖
npm install yarn -g
yarn

# 清理
rm -rf release

mkdir release

# 进入 Terre 目录
cd packages/terre2
yarn build
yarn pkg
cd dist
cp -r WebGAL_Terre  ../../../release
rm WebGAL_Terre
cd ../
mkdir Exported_Games
cp -r public assets Exported_Games ../../release
cd ../../

# 进入 Origine 目录
cd packages/origine2
# 低内存，使用下一行限制内存使用
# export NODE_OPTIONS=--max_old_space_size=512000
yarn build
cp -rf dist/* ../../release/public/
cd ../../

# 进入 Electron 目录
cd packages/WebGAL-electron
yarn
yarn build
mkdir ../../release/assets/templates/WebGAL_Electron_Template
cp -rf build/linux-unpacked/* ../../release/assets/templates/WebGAL_Electron_Template/
cd ../../

# 克隆 WebGAL Android 模板
cd release/assets/templates/
git clone https://github.com/nini22P/WebGAL-Android.git
mv WebGAL-Android WebGAL_Android_Template
cd ../../../

cd release

# 删除冗余文件
rm -rf Exported_Games/*
rm -rf public/games/*
rm -rf public/games/.gitkeep
rm -rf assets/templates/WebGAL_Template/game/video/*
rm -rf assets/templates/WebGAL_Template/game/video/.gitkeep
rm -rf assets/templates/WebGAL_Android_Template/.git
rm -rf assets/templates/WebGAL_Android_Template/.gitattributes
rm -rf assets/templates/WebGAL_Android_Template/app/src/main/assets/webgal/.gitkeep


echo "WebGAL Origine is now ready to be deployed."
