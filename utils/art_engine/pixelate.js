const fs = require("fs");
const path = require("path");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { createCanvas, loadImage } = require("canvas");
const { format, pixelFormat } = require(`${FOLDERS.sourceDir}/artwork_config.js`);
const console = require("console");
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");

const buildSetup = () => {
  if (fs.existsSync(FOLDERS.pixelImagesDir)) {
    fs.rmSync(FOLDERS.pixelImagesDir, { recursive: true });
  }
  fs.mkdirSync(FOLDERS.pixelImagesDir);
};

const getImages = (_dir) => {
  try {
    return fs
      .readdirSync(_dir)
      .filter((item) => {
        let extension = path.extname(`${_dir}${item}`);
        if (extension == ".png" || extension == ".jpg") {
          return item;
        }
      })
      .map((i) => {
        return {
          filename: i,
          path: `${_dir}/${i}`,
        };
      });
  } catch {
    return null;
  }
};

const loadImgData = async (_imgObject) => {
  try {
    const image = await loadImage(`${_imgObject.path}`);
    return {
      imgObject: _imgObject,
      loadedImage: image,
    };
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const draw = (_imgObject) => {
  let size = pixelFormat.ratio;
  let w = canvas.width * size;
  let h = canvas.height * size;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(_imgObject.loadedImage, 0, 0, w, h);
  ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
};

const saveImage = (_loadedImageObject) => {
  fs.writeFileSync(
    `${FOLDERS.pixelImagesDir}/${_loadedImageObject.imgObject.filename}`,
    canvas.toBuffer("image/png")
  );
};

const startCreating = async () => {
  const images = getImages(FOLDERS.imagesDir);
  if (images == null) {
    console.log("Please generate collection first.");
    return;
  }
  let loadedImageObjects = [];
  images.forEach((imgObject) => {
    loadedImageObjects.push(loadImgData(imgObject));
  });
  await Promise.all(loadedImageObjects).then((loadedImageObjectArray) => {
    loadedImageObjectArray.forEach((loadedImageObject) => {
      draw(loadedImageObject);
      saveImage(loadedImageObject);
      console.log(`Pixelated image: ${loadedImageObject.imgObject.filename}`);
    });
  });
};

buildSetup();
startCreating();