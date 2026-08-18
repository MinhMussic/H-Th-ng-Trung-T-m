export interface TimeGreetingData {
  period: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  periodLabel: string;
  greetingTitle: string;
  greetingSubtitle: string;
  iconType: 'sun' | 'sunrise' | 'sun-medium' | 'coffee' | 'sunset' | 'moon' | 'sparkles' | 'music';
  badgeBg: string;
  badgeText: string;
  gradientBg: string;
  accentColor: string;
  defaultWishes: string[];
}

export const JOYFUL_MOOD_WISHES: string[] = [
  '🎵 Âm nhạc là giai điệu của tâm hồn. Chúc bạn một ngày luôn ngân vang những nốt nhạc hạnh phúc!',
  '✨ Nụ cười của bạn là bản hòa tấu đẹp nhất hôm nay. Hãy luôn vui tươi và tỏa sáng nhé!',
  '☕ Mỗi buổi sáng là một cơ hội mới để tạo nên những điều kỳ diệu. Tự tin bước tới nhé!',
  '🎹 Giữ vững nhịp điệu yêu thương, cuộc sống sẽ luôn tràn ngập những thanh âm ngọt ngào!',
  '🌟 Chúc bạn có một ngày làm việc và học tập tràn đầy hứng khởi, vạn sự hanh thông!',
  '🍀 Hôm nay chắc chắn sẽ là một ngày tuyệt vời với vô vàn niềm vui bất ngờ dành cho bạn!',
  '🎼 Đừng quên mỉm cười và thả lỏng đôi vai, bạn đang làm rất tốt mọi thứ!',
  '🎸 Cuộc sống như một phím đàn, hãy chơi những nốt nhạc rực rỡ và tự tin nhất của riêng mình!',
  '🌈 Dù ngày hôm nay có bận rộn đến đâu, hãy dành chút thời gian lắng nghe một bài hát bạn yêu thích nhé!',
  '☀️ Năng lượng tích cực sẽ thu hút những điều may mắn. Chúc bạn một ngày tràn đầy năng lượng!',
  '🎉 Chúc bạn một ngày ngập tràn tiếng cười, niềm say mê và những thành quả ngọt ngào!',
  '🎻 Hãy để từng nốt nhạc xua tan mọi mệt mỏi và thắp sáng niềm tin trong bạn!',
  '🌸 Chúc bạn luôn an yên trong tâm hồn, vui vẻ trong từng khoảnh khắc và ngập tràn may mắn!',
  '💫 Những điều kỳ diệu nhất thường bắt đầu từ một nụ cười rạng rỡ. Hãy mỉm cười thật tươi nào!',
  '🎶 Âm nhạc không chỉ để lắng nghe, mà để cảm nhận hạnh phúc hiện diện mỗi ngày!',
  '🌻 Chúc bạn ngày mới rạng ngời như ánh hướng dương đón nắng, tràn đầy nhiệt huyết và yêu đời!',
  '🎈 Mọi việc bạn làm hôm nay đều sẽ gặt hái được những kết quả tuyệt vời hơn cả mong đợi!',
  '🕊️ Bình an trong từng hơi thở, tươi vui trong từng nụ cười. Chúc bạn một ngày thật trọn vẹn!'
];

export const getTimeGreeting = (date: Date = new Date()): TimeGreetingData => {
  const hours = date.getHours();

  // 04:00 - 06:59: Bình minh / Sáng sớm
  if (hours >= 4 && hours < 7) {
    return {
      period: 'dawn',
      periodLabel: 'Sáng sớm an lành',
      greetingTitle: 'Chào buổi sáng sớm an lành! 🌅',
      greetingSubtitle: 'Khởi đầu ngày mới với tâm thế thảnh thơi, hít thở thật sâu và đón nhận năng lượng tươi mới nhé!',
      iconType: 'sunrise',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700',
      badgeText: 'text-amber-800 dark:text-amber-300',
      gradientBg: 'from-amber-500/15 via-orange-500/10 to-emerald-500/15 border-amber-500/30',
      accentColor: '#f59e0b',
      defaultWishes: [
        '🌅 Khởi đầu ngày mới với một tách trà ấm và giai điệu êm dịu!',
        '✨ Chúc bạn một ngày tràn ngập sự tươi mới và nhiều năng lượng tích cực.',
        '🎵 Hãy để âm nhạc thức tỉnh mọi hứng khởi trong ngày mới của bạn!'
      ]
    };
  }

  // 07:00 - 10:59: Buổi sáng rạng rỡ
  if (hours >= 7 && hours < 11) {
    return {
      period: 'morning',
      periodLabel: 'Buổi sáng rạng rỡ',
      greetingTitle: 'Chào buổi sáng ngập tràn năng lượng! ☀️',
      greetingSubtitle: 'Chúc bạn một ngày mới học tập và làm việc thật hiệu quả, luôn rạng rỡ nụ cười trên môi!',
      iconType: 'sun',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      gradientBg: 'from-emerald-500/15 via-teal-500/10 to-green-500/15 border-emerald-500/30',
      accentColor: '#10b981',
      defaultWishes: [
        '☀️ Chúc bạn một buổi sáng làm việc tràn đầy hứng khởi và niềm say mê!',
        '🎶 Âm nhạc là liều vitamin tinh thần tốt nhất cho ngày mới!',
        '🍀 May mắn và niềm vui sẽ luôn đồng hành cùng bạn suốt ngày hôm nay.'
      ]
    };
  }

  // 11:00 - 13:59: Buổi trưa an nhiên
  if (hours >= 11 && hours < 14) {
    return {
      period: 'noon',
      periodLabel: 'Buổi trưa an nhiên',
      greetingTitle: 'Chào buổi trưa an nhiên & ngon miệng! 🍽️',
      greetingSubtitle: 'Đừng quên ăn trưa đủ chất và dành chút thời gian nghỉ ngơi thư giãn để nạp lại năng lượng nhé!',
      iconType: 'sun-medium',
      badgeBg: 'bg-yellow-100 dark:bg-yellow-950/70 border-yellow-300 dark:border-yellow-700',
      badgeText: 'text-yellow-800 dark:text-yellow-300',
      gradientBg: 'from-yellow-500/15 via-amber-500/10 to-orange-500/15 border-yellow-500/30',
      accentColor: '#eab308',
      defaultWishes: [
        '🍽️ Chúc bạn bữa trưa ngon miệng và có phút giây nghỉ ngơi thật thoải mái!',
        '🎵 Một khúc nhạc acoustic nhẹ nhàng sẽ giúp giấc ngủ trưa thêm phần thư thái.',
        '✨ Nạp năng lượng đầy đủ để buổi chiều tiếp tục bứt phá nhé!'
      ]
    };
  }

  // 14:00 - 17:59: Buổi chiều cảm hứng
  if (hours >= 14 && hours < 18) {
    return {
      period: 'afternoon',
      periodLabel: 'Buổi chiều cảm hứng',
      greetingTitle: 'Chào buổi chiều thăng hoa cảm hứng! ☕',
      greetingSubtitle: 'Thưởng thức một tách cà phê thơm và để những giai điệu du dương tiếp thêm động lực cho bạn!',
      iconType: 'coffee',
      badgeBg: 'bg-orange-100 dark:bg-orange-950/70 border-orange-300 dark:border-orange-700',
      badgeText: 'text-orange-800 dark:text-orange-300',
      gradientBg: 'from-orange-500/15 via-amber-500/10 to-rose-500/15 border-orange-500/30',
      accentColor: '#f97316',
      defaultWishes: [
        '☕ Một ngụm cà phê cùng bản nhạc yêu thích cho buổi chiều thêm rực rỡ!',
        '🎹 Chúc bạn buổi chiều gặt hái thật nhiều tiến bộ và niềm vui âm nhạc.',
        '🌟 Vượt qua những nhiệm vụ cuối ngày thật nhẹ nhàng và trôi chảy nhé!'
      ]
    };
  }

  // 18:00 - 21:59: Buổi tối ấm áp
  if (hours >= 18 && hours < 22) {
    return {
      period: 'evening',
      periodLabel: 'Buổi tối ấm áp',
      greetingTitle: 'Chào buổi tối ấm áp & vui vầy! 🌇',
      greetingSubtitle: 'Gác lại những bộn bề sau ngày dài, hãy tận hưởng buổi tối bình yên và sum vầy bên những người thân yêu!',
      iconType: 'sunset',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700',
      badgeText: 'text-indigo-800 dark:text-indigo-300',
      gradientBg: 'from-indigo-500/15 via-purple-500/10 to-pink-500/15 border-indigo-500/30',
      accentColor: '#6366f1',
      defaultWishes: [
        '🌇 Chúc bạn một buổi tối thư thái, trọn vẹn niềm vui và tiếng cười.',
        '🎶 Hãy thả hồn vào những thanh âm êm dịu để giải tỏa mọi căng thẳng!',
        '💖 Buổi tối ấm áp bên bữa cơm gia đình và những người thân yêu.'
      ]
    };
  }

  // 22:00 - 03:59: Đêm muộn thanh bình
  return {
    period: 'night',
    periodLabel: 'Đêm muộn thanh bình',
    greetingTitle: 'Chào đêm muộn thanh bình & êm dịu! 🌙',
    greetingSubtitle: 'Thời gian để cơ thể và tâm hồn nghỉ ngơi. Chúc bạn có một giấc ngủ thật sâu và những giấc mơ ngọt ngào!',
    iconType: 'moon',
    badgeBg: 'bg-slate-800 dark:bg-slate-800 border-slate-700',
    badgeText: 'text-slate-200 dark:text-slate-200',
    gradientBg: 'from-slate-800/40 via-indigo-950/30 to-slate-900/40 border-slate-700/50',
    accentColor: '#818cf8',
    defaultWishes: [
      '🌙 Chúc bạn có một giấc ngủ thật ngon và những giấc mơ âm nhạc bay bổng.',
      '✨ Tạm gác lại âu lo, ngày mai sẽ là một ngày mới tuyệt vời hơn nữa!',
      '🎧 Một bản nhạc piano ru êm sẽ đưa bạn vào giấc ngủ thật dễ chịu.'
    ]
  };
};

export const getRandomWish = (excludeCurrent?: string): string => {
  const pool = JOYFUL_MOOD_WISHES.filter(w => w !== excludeCurrent);
  if (pool.length === 0) return JOYFUL_MOOD_WISHES[0];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
};

export const formatVietnameseDate = (date: Date = new Date()): { dayOfWeek: string; dateFormatted: string; timeFormatted: string } => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = days[date.getDay()];
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return {
    dayOfWeek,
    dateFormatted: `${dayOfWeek}, ngày ${day}/${month}/${year}`,
    timeFormatted: `${hours}:${minutes}:${seconds}`
  };
};
