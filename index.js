#!/usr/bin/env node
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
const scheduledJobs = [];

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
  const scheduleInfo = [
    {
      hour: 15,
      minute: 30,
      image: 1,
      sound: 0
    },
    {
      hour: 15,
      minute: 45,
      image: 2,
      sound: 1
    },
    {
      hour: 16,
      minute: 0,
      image: 3,
      sound: 2
    },
    {
      hour: 16,
      minute: 15,
      image: 4,
      sound: 3
    }
  ];

  scheduleInfo.forEach((info) => {
    scheduledJobs.push(schedule.scheduleJob(
      `0 ${info.minute} ${info.hour} * * 5`,
      () => {
        if (typeof info.image !== 'undefined') {
          currentImageIndex = info.image;
          contentView.schedulePaint();
        }
        if (typeof info.sound !== 'undefined') {
          playSound(info.sound);
        }
      }
    ));
    scheduledJobs.push(schedule.scheduleJob(
      `0 ${info.minute + 1} ${info.hour} * * 5`,
      () => {
        currentImageIndex = 0;
        contentView.schedulePaint();
      }
    ));
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
