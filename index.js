const fs = require('fs');
const gui = require('gui');
const lame = require('lame');
const path = require('path');
const schedule = require('node-schedule');
const speaker = require('speaker');

const assistantImages = [0, 1, 2, 3, 4].map((index) => (
  gui.Image.createFromPath(path.join(__dirname, 'images', `${index}.png`))
));
const assistantSounds = [0, 1, 2, 3].map((index) => (
  path.join(__dirname, 'sounds', `${index}.mp3`)
));

const win = gui.Window.create({
  frame: false,
  transparent: true
});
const contentView = gui.Container.create();
let currentImageIndex = 0;

const playSound = (index) => {
  const file = assistantSounds[index];

  if (!file) {
    return;
  }

  const decoder = new lame.Decoder();

  fs.createReadStream(file).pipe(decoder).once('format', () => {
    const output = new speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 22050,
      mode: lame.MONO
    });

    decoder.pipe(output);
  });
};

const initializeSchedules = () => {
  schedule.scheduleJob('0 30 15 * * 5', () => {
    currentImageIndex = 1;
    contentView.schedulePaint();
    playSound(0);
  });

  schedule.scheduleJob('0 31 15 * * 5', () => {
    currentImageIndex = 0;
    contentView.schedulePaint();
  });

  schedule.scheduleJob('0 45 15 * * 5', () => {
    currentImageIndex = 2;
    contentView.schedulePaint();
    playSound(1);
  });

  schedule.scheduleJob('0 46 15 * * 5', () => {
    currentImageIndex = 0;
    contentView.schedulePaint();
  });

  schedule.scheduleJob('0 0 16 * * 5', () => {
    currentImageIndex = 3;
    contentView.schedulePaint();
    playSound(2);
  });

  schedule.scheduleJob('0 1 16 * * 5', () => {
    currentImageIndex = 0;
    contentView.schedulePaint();
  });

  schedule.scheduleJob('0 15 16 * * 5', () => {
    currentImageIndex = 4;
    contentView.schedulePaint();
    playSound(3);
  });
};

const initializeUserInterface = () => {
  win.setTitle('Punssi-Buddy');
  win.setAlwaysOnTop(true);
  win.setContentSize({ width: 134, height: 124 });
  win.onClose = () => gui.MessageLoop.quit();

  contentView.setMouseDownCanMoveWindow(true);
  win.setContentView(contentView);

  contentView.onDraw = (self, painter) => {
    painter.drawImage(assistantImages[currentImageIndex], {
      x: 0,
      y: 0,
      width: 134,
      height: 124
    });
  };

  win.center();
  win.activate();
};

initializeSchedules();
initializeUserInterface();

if (!process.versions.yode) {
  gui.MessageLoop.run();
  process.exit(0);
}
