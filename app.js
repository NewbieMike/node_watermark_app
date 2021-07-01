const Jimp = require('jimp'); //import pakietu Jimp
const inquirer = require('inquirer'); //import pakietu Inquirer
const fs = require('fs'); //import pakietu fs
const { start } = require('repl');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
    try {
    const image = await Jimp.read(inputFile); // read pozwala na załadowanie pliku graficznego i przypisujemy ją do zmiennej image
    // await gwarantuje, że kompilacja nie ruszy dalej do momentu w którym plik nie zostanie załadowany
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);//Ładuejmy font wraz z rozmiarem i kolorem
    //loadFont ładuje nam font i przypisuje do zmiennej żebyśmy mogli wpisać go w obrazek
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
  
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
     //przyjnuje 4 parametry: styl czcionki, umiejscowienie w: poziomie i pionie, treść tekstu
    await image.quality(100).writeAsync(outputFile);
    //zapisuje w określonej jakości, writeAsync pozwala zapisać jako osobny plik dany obrazek
    console.log('File converted!');
  } catch {
    console.log('Something went wrong... Try again!');
  }
    startApp();
  };

//addTextWatermarkToImage('./test.jpg', './test-with-watermark.jpg', 'Hello world');

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
    try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
  
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log('File converted!');
    } catch {
      console.log('Something went wrong... Try again!');
    } 
    startApp();
  };
//addImageWatermarkToImage('./test.jpg', './test-with-watermark2.jpg', './logo.png');


const startApp = async () => {

    // Ask if user is ready
    const answer = await inquirer.prompt([{
        name: 'start',
        message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
        type: 'confirm'
      }]);
  
    // if answer is no, just quit the app
    if(!answer.start) process.exit();
  
    // ask about input file and watermark type
    const options = await inquirer.prompt([{
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    }, {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    }]);
    const prepareOutputFilename = (filename) => {
        const [ name, ext ] = filename.split('.');
        return `${name}-with-watermark.${ext}`;
      };
      if(options.watermarkType === 'Text watermark') {
        const text = await inquirer.prompt([{
          name: 'value',
          type: 'input',
          message: 'Type your watermark text:',
        }]);
        options.watermarkText = text.value;

        if(fs.existsSync('./img/' + options.inputImage)) {
            addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText);
            // console.log('File converted!');
            // startApp();
        } else {
            console.log('Something went wrong... Try again!');
        };
        
      }
      else {
        const image = await inquirer.prompt([{
          name: 'filename',
          type: 'input',
          message: 'Type your watermark name:',
          default: 'logo.png',
        }])
        options.watermarkImage = image.filename;

        if (fs.existsSync('./img/' + options.inputImage)) {
            addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage);
            console.log('File converted!');
            startApp();
        } else {
            console.log('Something went wrong... Try again!');
        }
        
      }
      
  }
  
  startApp();