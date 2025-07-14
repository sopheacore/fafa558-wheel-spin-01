let spinCount = 0;
let bgMusicStarted = false;
let spinning = false;

function startBackgroundMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusicStarted) {
    bgMusic.volume = 1.0;
    bgMusic.play().catch(() => {});
    bgMusicStarted = true;
    console.log('✅ Background music started');
  }
}

function reduceBackgroundMusicVolume() {
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusicStarted) {
    bgMusic.volume = Math.max(bgMusic.volume * 0.5, 0.05);
    console.log('✅ Background music volume reduced');
  }
}

function spinWheel() {
  if (spinning) return;
  spinning = true;

  console.log('✅ Spin triggered. spinCount:', spinCount);

  if (typeof fbq === 'function') {
    fbq('trackCustom', 'SpinAttempt');
    console.log('✅ Meta Pixel: SpinAttempt fired');
  }

  const spinButton = document.querySelector('.spin-button');
  spinButton.classList.add('hide-animation');
  spinButton.disabled = true;

  setTimeout(() => {
    spinButton.style.display = 'none';
  }, 500);

  startBackgroundMusic();
  reduceBackgroundMusicVolume();

  const wheel = document.getElementById('wheel');
  const pointer = document.querySelector('.pointer');
  const modal = document.getElementById('winModal');
  const retryModal = document.getElementById('retryModal');

  const clickSound = document.getElementById('clickSound');
  const spinSound = document.getElementById('spinSound');
  const modalSound = document.getElementById('modalSound');

  if (clickSound) { clickSound.currentTime = 0; clickSound.play().catch(() => {}); }

  wheel.style.transition = 'none'; wheel.style.transform = 'rotate(0deg)';
  pointer.style.transition = 'none'; pointer.style.transform = 'rotate(0deg)';

  setTimeout(() => {
    try {
      const rotations = 10;
      const targetAngle = spinCount === 0 ? 20 : 0;
      const totalDegrees = (rotations * 360) + targetAngle;

      wheel.style.transition = 'transform 4s ease-out';
      wheel.style.transform = `rotate(${totalDegrees}deg)`;

      pointer.style.transition = 'transform 4s ease-out';
      pointer.style.transform = `rotate(${-totalDegrees}deg)`;

      if (spinSound) { spinSound.currentTime = 0; spinSound.play().catch(() => {}); }

      setTimeout(() => {
        if (spinSound) { spinSound.pause(); spinSound.currentTime = 0; }
        if (modalSound) { modalSound.currentTime = 0; modalSound.play().catch(() => {}); }

        if (spinCount === 0) {
          retryModal.style.display = 'flex';
          spinCount++;
          console.log('🔁 Showing retry modal');
        } else {
          modal.style.display = 'flex';

          if (typeof fbq === 'function') {
            fbq('trackCustom', 'SpinWin');
            console.log('✅ Meta Pixel: SpinWin fired');
          }

          if (typeof confetti === 'function') {
            try {
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, zIndex: 2000 });
              console.log('🎉 Confetti launched');
            } catch (e) {
              console.warn('❌ Confetti error:', e);
            }
          }

          spinCount = 0;
        }

        spinning = false;

      }, 4000);

    } catch (err) {
      console.error('❌ Spin error:', err);
      spinning = false;
    }
  }, 50);
}

function enableSpinAgain() {
  spinning = false;
  const spinButton = document.querySelector('.spin-button');
  spinButton.classList.remove('hide-animation');
  spinButton.style.display = 'block';
  spinButton.disabled = false;
  console.log('✅ Ready to spin again');
}

function retrySpin() {
  reduceBackgroundMusicVolume();
  document.getElementById('retryModal').style.display = 'none';
  enableSpinAgain();
  console.log('🔄 Retry spin triggered');
}

document.getElementById('winModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
    enableSpinAgain();
  }
});

document.getElementById('retryModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
    enableSpinAgain();
  }
});

document.addEventListener('click', startBackgroundMusic, { once: true });

document.addEventListener('click', e => {
  if (['BUTTON', 'IMG'].includes(e.target.tagName)) {
    reduceBackgroundMusicVolume();
  }
});

// ✅ Meta Pixel PURCHASE EVENT on claim button
document.querySelectorAll('.trackable-link').forEach(link => {
  link.addEventListener('click', function() {
    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', {
        value: 10.00,
        currency: 'USD'
      });
      console.log('✅ Meta Pixel: Purchase event fired!');
    }
  });
});
