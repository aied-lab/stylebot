import { OutfitAnalysis } from '../types/stylist';

export interface SampleOutfitPreset {
  id: string;
  name: string;
  style: string;
  imageUrl: string;
  sampleAnalysis: OutfitAnalysis;
}

export const SAMPLE_OUTFITS: SampleOutfitPreset[] = [
  {
    id: 'sample-cleanfit',
    name: '極簡都會風 (Clean Fit Gent)',
    style: '都會極簡 • 質感通勤',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    sampleAnalysis: {
      id: 'sample-cf-01',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      timestamp: Date.now() - 3600000 * 2,
      title: '極簡都會摩登 (Urban Clean Fit)',
      score: 91,
      grade: 'S',
      styleCategory: 'Modern Minimalist',
      vibeKeywords: ['低飽和高級感', '俐落垂墜', '鬆弛氛圍', '修長比例'],
      dimensions: {
        colorHarmony: {
          score: 94,
          analysis: '大地米白與深灰對比分明，三色原則控制極佳，視覺沈穩且高級。',
        },
        silhouetteProportion: {
          score: 92,
          analysis: '短版微寬上身襯托高腰微錐形長褲，黃金三七分割比例拉長身形。',
        },
        occasionFit: {
          score: 89,
          analysis: '在文創展覽、週五商務休閒與精品咖啡廳均能展現低調品味。',
        },
        trendAndPersonality: {
          score: 88,
          analysis: '精準捕捉當代 Clean Fit 美學，乾淨不拖泥帶水，展現不費力的時髦。',
        },
        detailsAndAccessories: {
          score: 90,
          analysis: '皮革腕錶與簡約托特包呼應得宜，金屬飾品點到為止，精緻內斂。',
        },
      },
      colorPalette: [
        { name: '燕麥白 (Oatmeal)', hex: '#E6DFD5', percentage: 45, role: '主色' },
        { name: '冷炭灰 (Charcoal)', hex: '#2B2D33', percentage: 35, role: '輔色' },
        { name: '暖褐皮棕 (Saddle Brown)', hex: '#8C5A3C', percentage: 15, role: '點綴色' },
        { name: '極光銀 (Chrome)', hex: '#CBD5E1', percentage: 5, role: '點綴色' },
      ],
      garments: [
        { type: '上衣', item: '重磅純棉微落肩燕麥白打底衫', verdict: '領口平整厚實，質感與版型俱佳' },
        { type: '外套', item: '剪裁俐落的薄款微工裝襯衫外套', verdict: '肩線自然下垂，打造慵懶輪廓' },
        { type: '褲裝', item: '深炭灰微寬直筒高腰西褲', verdict: '垂墜感一流，完美修飾腿部線條' },
        { type: '鞋履', item: '復古德訓鞋 (German Army Trainer)', verdict: '色調呼應上衣，步履輕盈隨性' },
        { type: '配件', item: '極簡皮質肩背包與復古腕錶', verdict: '點睛之筆，提升整體穿搭成熟度' },
      ],
      highlights: [
        '色彩純度克制，低飽和色系營造出極具高級感的鬆弛氛圍。',
        '上下身的松緊度拿捏精準，既有量感又保持俐落身型線條。',
        '材質層次豐富（棉、西裝羊毛混紡、植鞣皮革）讓純色穿搭絕不沉悶。',
      ],
      recommendations: [
        {
          aspect: '飾品細節',
          tip: '可佩戴一條細款銀質扁蛇骨鍊，微敞開領口時能增加鎖骨處的精緻視覺錨點。',
          expectedImpact: '視覺焦點提升，強化摩登雅痞氛圍',
        },
        {
          aspect: '鞋履微調',
          tip: '若出席更正式的晚間聚會，換上一雙深咖啡色樂福鞋即可無縫銜接社交場合。',
          expectedImpact: '氣場轉換更加多元沈穩',
        },
      ],
      suitableOccasions: ['週五休閒辦公', '當代藝廊約會', '精品買手店探索'],
      seasonMatch: '春秋過渡季 / 初夏微涼',
      voiceCommentary: '這套造型的低飽和色彩與比例分割堪稱典範！鬆弛俐落的輪廓極富質感。若能在胸前點綴一條細銀項鍊，將會更顯精緻耀眼！',
      fashionQuote: '真正的優雅不在於引人注目，而在於被人銘記。',
    },
  },
  {
    id: 'sample-streetwear',
    name: '原宿高街潮流 (Tokyo Streetwear)',
    style: '高街混搭 • 機能率性',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    sampleAnalysis: {
      id: 'sample-st-02',
      imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      timestamp: Date.now() - 3600000 * 5,
      title: '高街先鋒潮流 (Cyber Street Trend)',
      score: 87,
      grade: 'A+',
      styleCategory: 'Avant-garde Streetwear',
      vibeKeywords: ['機能廓形', '街頭率性', '立體口袋', '視覺張力'],
      dimensions: {
        colorHarmony: {
          score: 86,
          analysis: '以純黑為基底，搭配芥末黃與銀灰色織帶細節，撞色鮮明大膽。',
        },
        silhouetteProportion: {
          score: 88,
          analysis: 'Oversize 廓形極具量感，褲腳微堆疊營造出濃厚裏原宿街頭氛圍。',
        },
        occasionFit: {
          score: 84,
          analysis: '音樂祭、潮流展會與街拍場景的絕對焦點，日常通勤稍顯張揚。',
        },
        trendAndPersonality: {
          score: 95,
          analysis: '個人風格強烈，大膽駕馭結構性解構單品，充滿前衛態度。',
        },
        detailsAndAccessories: {
          score: 89,
          analysis: '金屬扣件、掛繩耳機與斜背小包運用成熟，層次感極其豐富。',
        },
      },
      colorPalette: [
        { name: '深淵黑 (Obsidian Black)', hex: '#111215', percentage: 65, role: '主色' },
        { name: '水泥灰 (Concrete Grey)', hex: '#6B7280', percentage: 20, role: '輔色' },
        { name: '螢光芥末黃 (Volt Yellow)', hex: '#EAB308', percentage: 10, role: '點綴色' },
        { name: '霧銀 (Matte Silver)', hex: '#D1D5DB', percentage: 5, role: '點綴色' },
      ],
      garments: [
        { type: '外套', item: '多口袋立體防撕裂機能夾克', verdict: '金屬拉鍊與幾何拼接細節滿分' },
        { type: '上衣', item: '落肩水洗復古印花厚磅長 T', verdict: '下擺露出適當層次' },
        { type: '褲裝', item: '錐形飄帶工裝傘兵褲', verdict: '抽繩與大口袋立體感十足' },
        { type: '鞋履', item: '厚底越野跑鞋 / 解構球鞋', verdict: '鞋身科技感拉滿，支撐視覺份量' },
        { type: '配件', item: '銀色耳骨夾與金屬扣斜背包', verdict: '街頭必備潮流符號' },
      ],
      highlights: [
        '整體輪廓張力十足，強烈的黑魂街頭感極富視覺記憶點。',
        '高飽和的亮黃色標籤打破沈悶黑調，點睛效果堪稱教科書級別。',
        '異材質碰撞（防潑水尼龍、重磅水洗純棉、金屬五金）質感上乘。',
      ],
      recommendations: [
        {
          aspect: '下身長度調節',
          tip: '褲管抽繩可稍微收緊至腳踝上方兩公分，展現襪子層次與鞋舌細節，身型更顯俐落。',
          expectedImpact: '減少下半身堆積感，視覺增高 3 公分',
        },
        {
          aspect: '帽子搭配',
          tip: '搭配一頂水洗黑棒球帽或短毛線針織帽，能讓整體視覺焦點往上提拉。',
          expectedImpact: '強化造型完整度與酷帥感',
        },
      ],
      suitableOccasions: ['潮流特展', '音樂祭活動', '週末街頭探店'],
      seasonMatch: '秋冬季 / 初春天氣',
      voiceCommentary: '這套高街混搭的視覺張力非常強烈！芥末黃的點綴更是神來之筆。建議將褲管抽繩微收，讓俐落的鞋履細節徹底綻放！',
      fashionQuote: '潮流會褪去，但風格與態度永遠長存。',
    },
  },
  {
    id: 'sample-parisian',
    name: '法式復古浪漫 (Parisian Chic)',
    style: '復古優雅 • 法式鬆弛',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    sampleAnalysis: {
      id: 'sample-pa-03',
      imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
      timestamp: Date.now() - 3600000 * 8,
      title: '巴黎左岸復古優雅 (French Vintage Elegance)',
      score: 93,
      grade: 'S',
      styleCategory: 'Parisian Chic',
      vibeKeywords: ['法式慵懶', '微復古', '柔美剪裁', '經典韻味'],
      dimensions: {
        colorHarmony: {
          score: 96,
          analysis: '經典藏藍、奶白與勃根地酒紅點綴，極具法式古典油畫感。',
        },
        silhouetteProportion: {
          score: 93,
          analysis: '微收腰剪裁突顯自然曲線，裙擺弧度優美輕盈，步態生姿。',
        },
        occasionFit: {
          score: 95,
          analysis: '約會、劇院欣賞、下午茶或旅行街拍皆能流露無可挑剔的知性氣質。',
        },
        trendAndPersonality: {
          score: 90,
          analysis: '不盲隨快時尚，經典復古風格歷久彌新，辨識度極高。',
        },
        detailsAndAccessories: {
          score: 94,
          analysis: '絲巾領結與珍珠耳環精巧靈動，完美演繹 Effortless Chic。',
        },
      },
      colorPalette: [
        { name: '經典藏青 (Midnight Navy)', hex: '#1E293B', percentage: 50, role: '主色' },
        { name: '奶霜白 (Cream Ivory)', hex: '#FDFBF7', percentage: 30, role: '輔色' },
        { name: '勃根地酒紅 (Burgundy)', hex: '#881337', percentage: 15, role: '點綴色' },
        { name: '香檳金 (Champagne Gold)', hex: '#E2C799', percentage: 5, role: '點綴色' },
      ],
      garments: [
        { type: '外套', item: '法式粗花呢短版夾克 (Tweed Jacket)', verdict: '微墊肩修飾頭肩比，編織紋理細緻' },
        { type: '上衣', item: '真絲雪紡微透光奶白襯衫', verdict: '質地輕盈親膚，飄帶隨步履飄逸' },
        { type: '裙裝', item: '高腰直筒微 A 字海軍藍過膝裙', verdict: '勾勒纖細腰線，端莊大方' },
        { type: '鞋履', item: '拼色雙色粗跟瑪麗珍鞋', verdict: '復古法式精髓，舒適而典雅' },
        { type: '配件', item: '天然巴洛克珍珠耳飾與復古腕錶', verdict: '細膩光澤為臉龐帶來柔和補光' },
      ],
      highlights: [
        '優雅氣質流暢自然，將法式女人的自信與隨性表達得淋漓盡致。',
        '酒紅小皮件與珍珠的搭配互為輝映，高雅不落俗套。',
        '短外套搭配高腰裙，將視覺身材比例襯托至極致修長。',
      ],
      recommendations: [
        {
          aspect: '唇色與妝容呼應',
          tip: '搭配略帶藍調的法式復古紅唇，能與身上的勃根地酒紅點綴色完美共鳴。',
          expectedImpact: '面部明亮度飆升，整體造型完整度達到頂點',
        },
      ],
      suitableOccasions: ['法式燭光晚餐', '古典音樂會', '巴黎香榭麗舍漫步'],
      seasonMatch: '春意盎然 / 初秋午後',
      voiceCommentary: '這套法式穿搭散發著迷人的復古韻味！藏青與奶白的對比優雅極致。若抹上一抹經典法式紅唇，氣場立刻從名媛晉升為女神！',
      fashionQuote: '女人不該被衣服穿著，而是穿出衣服的靈魂。',
    },
  },
];
