import { getState } from './state.js';
import { CONFIG } from './config.js';

export async function shareResult(title, message, scoreOrValue) {
  const state = getState();
  const nickname = 'Giocatore';
  const course = 'Politecnico';
  
  // Create sharing image via Canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, 1080, 1080);
  
  // Grid pattern
  ctx.strokeStyle = 'rgba(204,255,0,0.05)';
  ctx.lineWidth = 2;
  for(let i=0; i<1080; i+=80) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 1080); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(1080, i); ctx.stroke();
  }
  
  // Branding
  ctx.fillStyle = '#CCFF00';
  ctx.font = 'bold 80px "Bebas Neue", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(CONFIG.texts.brandName.toUpperCase(), 540, 150);
  
  // Nickname & Course
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '50px "Barlow Condensed", sans-serif';
  ctx.fillText(`${nickname} — ${course}`, 540, 250);
  
  // Main Message
  ctx.fillStyle = '#00E5FF';
  ctx.font = 'bold 100px "Bebas Neue", sans-serif';
  ctx.fillText(title.toUpperCase(), 540, 500);
  
  // Score / Value
  ctx.fillStyle = '#FF3D00';
  ctx.font = 'bold 150px "Bebas Neue", sans-serif';
  ctx.fillText(scoreOrValue, 540, 680);
  
  // Footer
  ctx.fillStyle = '#666666';
  ctx.font = '40px "Barlow", sans-serif';
  ctx.fillText("Puoi battere questo record?", 540, 950);
  
  const textToShare = `${message} Gioca a ${CONFIG.texts.brandName}: ${window.location.origin}`;
  
  try {
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const file = new File([blob], 'record.png', { type: 'image/png' });
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: CONFIG.texts.brandName,
        text: textToShare,
        files: [file]
      });
    } else {
      fallbackShare(textToShare);
    }
  } catch (err) {
    console.warn("Web Share failed, falling back", err);
    fallbackShare(textToShare);
  }
}

function fallbackShare(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}
