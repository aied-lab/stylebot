import { OutfitAnalysis, CanvasTheme, CanvasThemeId } from '../types/stylist';

export const CANVAS_THEMES: Record<CanvasThemeId, CanvasTheme> = {
  noir: {
    id: 'noir',
    name: 'Vogue 曜黑金 (Noir Gold)',
    bgGradient: ['#09090b', '#18181b'],
    cardBg: 'rgba(24, 24, 27, 0.75)',
    cardBorder: 'rgba(217, 180, 106, 0.35)',
    textColor: '#fafafa',
    textMuted: '#a1a1aa',
    accentColor: '#d9b46a',
    accentSecondary: '#fbbf24',
    scoreGradient: ['#f59e0b', '#d9b46a'],
    radarFill: 'rgba(217, 180, 106, 0.28)',
    radarStroke: '#d9b46a',
  },
  atelier: {
    id: 'atelier',
    name: '巴黎工坊 燕麥白 (Atelier Sand)',
    bgGradient: ['#f9f6f0', '#ebe4d5'],
    cardBg: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(180, 145, 115, 0.4)',
    textColor: '#292524',
    textMuted: '#78716c',
    accentColor: '#b45309',
    accentSecondary: '#c2410c',
    scoreGradient: ['#c2410c', '#d97706'],
    radarFill: 'rgba(194, 65, 12, 0.22)',
    radarStroke: '#c2410c',
  },
  street: {
    id: 'street',
    name: '原宿潮流 霓虹黑 (Cyber Street)',
    bgGradient: ['#0b0f19', '#111827'],
    cardBg: 'rgba(17, 24, 39, 0.8)',
    cardBorder: 'rgba(163, 230, 53, 0.4)',
    textColor: '#f3f4f6',
    textMuted: '#9ca3af',
    accentColor: '#a3e635',
    accentSecondary: '#38bdf8',
    scoreGradient: ['#a3e635', '#22c55e'],
    radarFill: 'rgba(163, 230, 53, 0.25)',
    radarStroke: '#a3e635',
  },
  minimal: {
    id: 'minimal',
    name: '北歐極簡 冰川銀 (Studio Titanium)',
    bgGradient: ['#121316', '#202227'],
    cardBg: 'rgba(32, 34, 39, 0.8)',
    cardBorder: 'rgba(56, 189, 248, 0.35)',
    textColor: '#f8fafc',
    textMuted: '#94a3b8',
    accentColor: '#38bdf8',
    accentSecondary: '#818cf8',
    scoreGradient: ['#38bdf8', '#818cf8'],
    radarFill: 'rgba(56, 189, 248, 0.25)',
    radarStroke: '#38bdf8',
  },
};

export interface CanvasRenderOptions {
  themeId?: CanvasThemeId;
  progress?: number; // 0 to 1 for intro animation
  audioLevel?: number; // 0 to 1 for live audio pulsation
  showGrid?: boolean;
}

// Helper to draw rounded rectangle
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Wrap text to fit width
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const characters = Array.from(text);
  let line = '';
  let lineCount = 0;
  let curY = y;

  for (let n = 0; n < characters.length; n++) {
    const testLine = line + characters[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = characters[n];
      curY += lineHeight;
      lineCount++;
      if (lineCount >= maxLines - 1) {
        // truncate remaining with ellipsis
        const remaining = characters.slice(n).join('');
        let truncated = line;
        for (let r = 0; r < remaining.length; r++) {
          if (ctx.measureText(truncated + remaining[r] + '...').width <= maxWidth) {
            truncated += remaining[r];
          } else {
            break;
          }
        }
        ctx.fillText(truncated + '...', x, curY);
        return curY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
  return curY + lineHeight;
}

export function drawDashboardOnCanvas(
  canvas: HTMLCanvasElement,
  analysis: OutfitAnalysis,
  userImage: HTMLImageElement | null,
  options: CanvasRenderOptions = {}
) {
  const {
    themeId = 'noir',
    progress = 1,
    audioLevel = 0,
    showGrid = true,
  } = options;

  const theme = CANVAS_THEMES[themeId] || CANVAS_THEMES.noir;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // 1. Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, theme.bgGradient[0]);
  bgGrad.addColorStop(1, theme.bgGradient[1]);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid / luxury watermark
  if (showGrid) {
    ctx.strokeStyle = theme.id === 'atelier' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // 2. Editorial Top Header
  const pad = 48;
  const headerY = pad;

  // Header Subtitle / Edition
  ctx.font = '600 13px "Cinzel", "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('HAUTE STYLIST EDITORIAL // REPORT #2026', pad, headerY + 16);

  // Date & ID
  const dateStr = new Date(analysis.timestamp || Date.now()).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  ctx.textAlign = 'right';
  ctx.font = '500 12px "Plus Jakarta Sans", monospace';
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(`DATE: ${dateStr}  |  REF: AI-${analysis.id.slice(0, 6).toUpperCase()}`, width - pad, headerY + 16);
  ctx.textAlign = 'left';

  // Title of the Outfit
  ctx.font = '700 32px "Noto Serif TC", "Cinzel", serif';
  ctx.fillStyle = theme.textColor;
  ctx.fillText(analysis.title, pad, headerY + 54);

  // Style category badge
  const categoryText = `${analysis.styleCategory}  •  ${analysis.seasonMatch}`;
  ctx.font = '600 14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText(categoryText, pad, headerY + 80);

  // Top separator rule
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, headerY + 96);
  ctx.lineTo(width - pad, headerY + 96);
  ctx.stroke();

  // 3. Main Layout Grid
  // Left Column: User Photo & Detected Garments (w: 480)
  // Right Column: Overall Score Ring, Radar Spider Chart, Color Swatches, Stylist Tips
  const colGap = 36;
  const leftColX = pad;
  const leftColW = 460;
  const rightColX = leftColX + leftColW + colGap;
  const rightColW = width - rightColX - pad;
  const contentStartY = headerY + 116;

  // ==================== LEFT COLUMN: PHOTO CARD ====================
  const photoH = 580;
  const photoCardY = contentStartY;

  // Photo frame background card
  roundRect(ctx, leftColX, photoCardY, leftColW, photoH, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw user image if available
  if (userImage && userImage.complete && userImage.naturalWidth > 0) {
    ctx.save();
    // Clip inner rect
    const innerPad = 12;
    roundRect(ctx, leftColX + innerPad, photoCardY + innerPad, leftColW - innerPad * 2, photoH - innerPad * 2, 12);
    ctx.clip();

    // Cover fit
    const imgRatio = userImage.naturalWidth / userImage.naturalHeight;
    const targetW = leftColW - innerPad * 2;
    const targetH = photoH - innerPad * 2;
    const targetRatio = targetW / targetH;

    let sx = 0, sy = 0, sWidth = userImage.naturalWidth, sHeight = userImage.naturalHeight;
    if (imgRatio > targetRatio) {
      sWidth = userImage.naturalHeight * targetRatio;
      sx = (userImage.naturalWidth - sWidth) / 2;
    } else {
      sHeight = userImage.naturalWidth / targetRatio;
      sy = (userImage.naturalHeight - sHeight) / 2;
    }

    ctx.drawImage(userImage, sx, sy, sWidth, sHeight, leftColX + innerPad, photoCardY + innerPad, targetW, targetH);
    ctx.restore();

    // Corner decorative brackets (Fashion Lookbook style)
    const bracketLen = 20;
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 2.5;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(leftColX + 24, photoCardY + 24 + bracketLen);
    ctx.lineTo(leftColX + 24, photoCardY + 24);
    ctx.lineTo(leftColX + 24 + bracketLen, photoCardY + 24);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(leftColX + leftColW - 24 - bracketLen, photoCardY + photoH - 24);
    ctx.lineTo(leftColX + leftColW - 24, photoCardY + photoH - 24);
    ctx.lineTo(leftColX + leftColW - 24, photoCardY + photoH - 24 - bracketLen);
    ctx.stroke();
  } else {
    // Placeholder photo box
    ctx.fillStyle = theme.id === 'atelier' ? '#e2dacf' : '#1f242d';
    roundRect(ctx, leftColX + 16, photoCardY + 16, leftColW - 32, photoH - 32, 12);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = '500 16px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textMuted;
    ctx.fillText('穿搭照片載入中...', leftColX + leftColW / 2, photoCardY + photoH / 2);
    ctx.textAlign = 'left';
  }

  // Floating Grade Badge on Photo top-right
  const gradeBadgeW = 100;
  const gradeBadgeH = 46;
  const gradeBadgeX = leftColX + leftColW - gradeBadgeW - 24;
  const gradeBadgeY = photoCardY + 24;

  roundRect(ctx, gradeBadgeX, gradeBadgeY, gradeBadgeW, gradeBadgeH, 23);
  ctx.fillStyle = 'rgba(10, 10, 12, 0.88)';
  ctx.fill();
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('HAUTE GRADE', gradeBadgeX + gradeBadgeW / 2, gradeBadgeY + 16);
  ctx.font = '800 20px "Cinzel", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(analysis.grade, gradeBadgeX + gradeBadgeW / 2, gradeBadgeY + 38);
  ctx.textAlign = 'left';

  // Bottom of Left Column: Vibe Keywords tags
  const vibeY = photoCardY + photoH + 16;
  let tagX = leftColX;
  ctx.font = '500 12px "Noto Sans TC", sans-serif';

  analysis.vibeKeywords.slice(0, 4).forEach((kw) => {
    const textW = ctx.measureText(`#${kw}`).width;
    const tagW = textW + 24;
    roundRect(ctx, tagX, vibeY, tagW, 28, 14);
    ctx.fillStyle = theme.cardBg;
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = theme.textColor;
    ctx.fillText(`#${kw}`, tagX + 12, vibeY + 18);
    tagX += tagW + 10;
  });

  // Garments Card under photo
  const garmentCardY = vibeY + 44;
  const garmentCardH = 340;
  roundRect(ctx, leftColX, garmentCardY, leftColW, garmentCardH, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('✦ 偵測穿搭單品剖析 (GARMENTS DETECTED)', leftColX + 20, garmentCardY + 32);

  let gY = garmentCardY + 60;
  analysis.garments.slice(0, 5).forEach((g) => {
    // Type pill
    roundRect(ctx, leftColX + 20, gY - 14, 52, 22, 6);
    ctx.fillStyle = theme.id === 'atelier' ? 'rgba(180, 83, 9, 0.12)' : 'rgba(217, 180, 106, 0.16)';
    ctx.fill();
    ctx.font = '600 11px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(g.type, leftColX + 46, gY + 1);
    ctx.textAlign = 'left';

    // Item name
    ctx.font = '600 13px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(g.item, leftColX + 82, gY + 2);

    // Verdict
    ctx.font = '400 12px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textMuted;
    const maxVW = leftColW - 100;
    wrapText(ctx, g.verdict, leftColX + 82, gY + 20, maxVW, 16, 1);

    gY += 52;
  });

  // ==================== RIGHT COLUMN: STATS & DASHBOARD ====================
  // 1. Overall Score Ring + Quick Breakdown Header
  const scoreCardH = 220;
  roundRect(ctx, rightColX, contentStartY, rightColW, scoreCardH, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Circular gauge on the left of score card
  const ringCenterX = rightColX + 110;
  const ringCenterY = contentStartY + scoreCardH / 2;
  const ringRadius = 72;

  // Background ring track
  ctx.beginPath();
  ctx.arc(ringCenterX, ringCenterY, ringRadius, 0, Math.PI * 2);
  ctx.strokeStyle = theme.id === 'atelier' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 10;
  ctx.stroke();

  // Animated Score Arc
  const currentScore = Math.round(analysis.score * progress);
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (Math.PI * 2 * (currentScore / 100));

  const arcGrad = ctx.createLinearGradient(
    ringCenterX - ringRadius,
    ringCenterY - ringRadius,
    ringCenterX + ringRadius,
    ringCenterY + ringRadius
  );
  arcGrad.addColorStop(0, theme.scoreGradient[0]);
  arcGrad.addColorStop(1, theme.scoreGradient[1]);

  ctx.beginPath();
  ctx.arc(ringCenterX, ringCenterY, ringRadius, startAngle, endAngle);
  ctx.strokeStyle = arcGrad;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Pulse effect if audio playing
  if (audioLevel > 0) {
    ctx.beginPath();
    ctx.arc(ringCenterX, ringCenterY, ringRadius + 12 + audioLevel * 10, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(217, 180, 106, ${0.15 + audioLevel * 0.35})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Score Number in Center
  ctx.textAlign = 'center';
  ctx.font = '800 48px "Cinzel", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.textColor;
  ctx.fillText(`${currentScore}`, ringCenterX, ringCenterY + 12);

  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('/ 100 PTS', ringCenterX, ringCenterY + 34);
  ctx.textAlign = 'left';

  // Right side of Score Card: Occasions & Season & Title review
  const scoreInfoX = rightColX + 220;
  ctx.font = '700 18px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.textColor;
  ctx.fillText('整體造型綜合指數', scoreInfoX, contentStartY + 45);

  ctx.font = '400 13px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.textMuted;
  ctx.fillText(`適合出席：${analysis.suitableOccasions.join('  •  ')}`, scoreInfoX, contentStartY + 76);

  // Fashion quote banner
  roundRect(ctx, scoreInfoX, contentStartY + 100, rightColW - 240, 84, 10);
  ctx.fillStyle = theme.id === 'atelier' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
  ctx.fill();

  ctx.font = 'italic 500 12px "Noto Serif TC", serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('“ 時尚絮語 ”', scoreInfoX + 16, contentStartY + 124);

  ctx.font = 'italic 400 12px "Noto Serif TC", serif';
  ctx.fillStyle = theme.textColor;
  wrapText(ctx, analysis.fashionQuote, scoreInfoX + 16, contentStartY + 146, rightColW - 270, 18, 2);

  // 2. Spider / Radar Chart (5 Dimensions)
  const radarCardY = contentStartY + scoreCardH + 20;
  const radarCardH = 360;
  roundRect(ctx, rightColX, radarCardY, rightColW, radarCardH, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('✦ 五大美學維度雷達分析 (AESTHETIC RADAR)', rightColX + 24, radarCardY + 32);

  // Draw 5-axis Radar chart
  const radarCenterX = rightColX + 175;
  const radarCenterY = radarCardY + 195;
  const radarRadius = 110;

  const radarAxes = [
    { name: '色彩協調', key: 'colorHarmony', val: analysis.dimensions.colorHarmony.score },
    { name: '比例剪裁', key: 'silhouetteProportion', val: analysis.dimensions.silhouetteProportion.score },
    { name: '場合契合', key: 'occasionFit', val: analysis.dimensions.occasionFit.score },
    { name: '流行風範', key: 'trendAndPersonality', val: analysis.dimensions.trendAndPersonality.score },
    { name: '細節飾品', key: 'detailsAndAccessories', val: analysis.dimensions.detailsAndAccessories.score },
  ];

  const totalAxes = radarAxes.length;
  const angleStep = (Math.PI * 2) / totalAxes;
  const chartStartAngle = -Math.PI / 2;

  // Background Web concentric polygons
  const webLevels = [0.25, 0.5, 0.75, 1];
  webLevels.forEach((level) => {
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const a = chartStartAngle + i * angleStep;
      const rx = radarCenterX + Math.cos(a) * radarRadius * level;
      const ry = radarCenterY + Math.sin(a) * radarRadius * level;
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.strokeStyle = theme.id === 'atelier' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Spokes
  for (let i = 0; i < totalAxes; i++) {
    const a = chartStartAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(radarCenterX, radarCenterY);
    ctx.lineTo(radarCenterX + Math.cos(a) * radarRadius, radarCenterY + Math.sin(a) * radarRadius);
    ctx.strokeStyle = theme.id === 'atelier' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
    ctx.stroke();

    // Axis label
    const labelDist = radarRadius + 24;
    const lx = radarCenterX + Math.cos(a) * labelDist;
    const ly = radarCenterY + Math.sin(a) * labelDist;

    ctx.textAlign = 'center';
    ctx.font = '600 11px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(`${radarAxes[i].name}`, lx, ly);

    ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(`${radarAxes[i].val}分`, lx, ly + 14);
  }
  ctx.textAlign = 'left';

  // Radar Polygon Data with progress
  ctx.beginPath();
  radarAxes.forEach((axis, i) => {
    const a = chartStartAngle + i * angleStep;
    const r = (axis.val / 100) * radarRadius * progress;
    const px = radarCenterX + Math.cos(a) * r;
    const py = radarCenterY + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.fillStyle = theme.radarFill;
  ctx.fill();
  ctx.strokeStyle = theme.radarStroke;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Radar vertices points
  radarAxes.forEach((axis, i) => {
    const a = chartStartAngle + i * angleStep;
    const r = (axis.val / 100) * radarRadius * progress;
    const px = radarCenterX + Math.cos(a) * r;
    const py = radarCenterY + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = theme.accentColor;
    ctx.fill();
    ctx.strokeStyle = theme.textColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  // Radar Right Column: Mini score bars & text feedback
  const barListX = rightColX + 370;
  const barListW = rightColW - 390;
  let barY = radarCardY + 60;

  radarAxes.forEach((item) => {
    ctx.font = '600 12px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(item.name, barListX, barY);

    ctx.textAlign = 'right';
    ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(`${item.val}`, barListX + barListW, barY);
    ctx.textAlign = 'left';

    // Bar background
    roundRect(ctx, barListX, barY + 6, barListW, 6, 3);
    ctx.fillStyle = theme.id === 'atelier' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    ctx.fill();

    // Bar fill
    const fillW = (item.val / 100) * barListW * progress;
    roundRect(ctx, barListX, barY + 6, fillW, 6, 3);
    ctx.fillStyle = theme.accentColor;
    ctx.fill();

    barY += 56;
  });

  // 3. Extracted Color Palette Card
  const colorCardY = radarCardY + radarCardH + 20;
  const colorCardH = 150;
  roundRect(ctx, rightColX, colorCardY, rightColW, colorCardH, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('✦ 造型配色比例解析 (COLOR HARMONY PALETTE)', rightColX + 24, colorCardY + 30);

  // Color Swatches row
  const swatchCount = Math.min(analysis.colorPalette.length, 5);
  const swatchTotalW = rightColW - 48;
  const swatchItemW = (swatchTotalW - (swatchCount - 1) * 14) / swatchCount;

  analysis.colorPalette.slice(0, 5).forEach((color, idx) => {
    const sX = rightColX + 24 + idx * (swatchItemW + 14);
    const sY = colorCardY + 46;

    // Color box
    roundRect(ctx, sX, sY, swatchItemW, 44, 8);
    ctx.fillStyle = color.hex || '#333333';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Color details
    ctx.font = '600 11px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(color.name, sX, sY + 60);

    ctx.font = '500 10px monospace';
    ctx.fillStyle = theme.textMuted;
    ctx.fillText(color.hex.toUpperCase(), sX, sY + 74);

    ctx.font = '600 10px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.accentColor;
    ctx.fillText(`${color.role} ${color.percentage}%`, sX, sY + 88);
  });

  // 4. Stylist Tips & Recommendations Card
  const tipsCardY = colorCardY + colorCardH + 20;
  const tipsCardH = 180;
  roundRect(ctx, rightColX, tipsCardY, rightColW, tipsCardH, 16);
  ctx.fillStyle = theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 14px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('✦ 造型升級建議 (STYLIST RECOMMENDATIONS)', rightColX + 24, tipsCardY + 30);

  let tipY = tipsCardY + 56;
  analysis.recommendations.slice(0, 2).forEach((rec, idx) => {
    // Number badge
    roundRect(ctx, rightColX + 24, tipY - 14, 22, 22, 11);
    ctx.fillStyle = theme.accentColor;
    ctx.fill();

    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = theme.id === 'atelier' ? '#ffffff' : '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(`${idx + 1}`, rightColX + 35, tipY + 1);
    ctx.textAlign = 'left';

    // Aspect & impact
    ctx.font = '700 13px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textColor;
    ctx.fillText(`【${rec.aspect}】 預期效果：${rec.expectedImpact}`, rightColX + 54, tipY);

    // Tip text
    ctx.font = '400 12px "Noto Sans TC", sans-serif';
    ctx.fillStyle = theme.textMuted;
    wrapText(ctx, rec.tip, rightColX + 54, tipY + 18, rightColW - 78, 16, 2);

    tipY += 56;
  });

  // ==================== FOOTER RIBBON & VERIFICATION SEAL ====================
  const footerY = height - 58;

  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, footerY - 14);
  ctx.lineTo(width - pad, footerY - 14);
  ctx.stroke();

  // Stylist voice preview indicator
  ctx.font = '500 11px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('🎙 專屬造型師講評：', pad, footerY + 10);

  ctx.font = '400 11px "Noto Sans TC", sans-serif';
  ctx.fillStyle = theme.textMuted;
  const quoteLimitW = width - pad * 2 - 280;
  wrapText(ctx, `“${analysis.voiceCommentary}”`, pad + 115, footerY + 10, quoteLimitW, 14, 1);

  // Verification Seal
  ctx.textAlign = 'right';
  ctx.font = '700 11px "Cinzel", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = theme.accentColor;
  ctx.fillText('VERIFIED BY AI STYLIST STUDIO', width - pad, footerY + 10);
  ctx.textAlign = 'left';

  ctx.restore();
}
