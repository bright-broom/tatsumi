/**
 * 株式会社タツミ サイトコンテンツ（Single Source of Truth）
 *
 * 出典: 現行サイト http://tatsumi-oni.co.jp/ （クライアント提供素材として取得）
 * - 文章は現行サイトの原稿をベースに、リニューアル用に要約・整理しています。
 * - 画像は public/images/tatsumi/ 配下。現行サイトから取得した Web 用解像度のため、
 *   本番前にクライアントから元データ（高解像度）を受け取って差し替えるのが理想です。
 */
import newsData from "./news.json";

export type Img = { src: string; alt: string };
const img = (name: string, alt: string): Img => ({ src: `/images/tatsumi/${name}`, alt });

export const site = {
  name: "TATSUMI",
  legalName: "株式会社タツミ",
  tagline: "本格的な鬼瓦からエクステリアや記念品、贈答品まで",
  description:
    "兵庫県伝統的工芸品「淡路鬼瓦」の指定窯元、株式会社タツミ。鬼師が一つひとつ手作りする鬼瓦・飾り瓦、瓦のインテリア・エクステリア「瓦風 -kaze-」、ギャラリー瓦廊、工場見学・ワークショップのご案内。",
  url: "https://tatsumi-oni.co.jp",
  ogImage: "/images/tatsumi/hero-1.jpg",
  address: "〒656-0341 兵庫県南あわじ市津井976",
  tel: "0799-38-0309",
  fax: "0799-38-0025",
  storeUrl: "https://tatsumioni.theshop.jp/",
  blogUrl: "http://tatsumi-oni.boo.jp/",
  reserveUrl: "#", // TODO: 工場見学・ワークショップ予約専用サイトの URL を確認して差し替え
  instagram: "#", // TODO: 公式アカウント URL
  line: "#", // TODO: 公式 LINE URL
};

export const nav = [
  { label: "淡路鬼瓦", en: "ONIGAWARA", href: "#onigawara" },
  { label: "取扱商品", en: "PRODUCTS", href: "#products" },
  { label: "瓦風", en: "KAZE", href: "#kaze" },
  { label: "瓦廊", en: "GALLERY", href: "#gallery" },
  { label: "見学・体験", en: "VISIT", href: "#visit" },
  { label: "会社案内", en: "COMPANY", href: "#company" },
] as const;

export const hero = {
  eyebrow: "兵庫県伝統的工芸品「淡路鬼瓦」指定窯元",
  heading: ["鬼師の手が、", "土に宿す力。"],
  lead: "淡路島・南あわじ市津井。播磨灘に面したこの地で、私たちは代々瓦作りに励んできました。本格的な鬼瓦から、エクステリア、記念品・贈答品まで。",
  slides: [
    img("hero-1.jpg", "鬼師による鬼瓦の手作り製作"),
    img("hero-2.jpg", "いぶし瓦の屋根"),
    img("hero-3.jpg", "瓦風 -kaze- の灯りと透かし瓦"),
    img("hero-4.jpg", "庭園に敷かれた瓦のアプローチ"),
  ],
  stats: [
    { value: "1610", unit: "年", label: "淡路瓦の起源" },
    { value: "1000", unit: "℃+", label: "焼成・燻化の温度" },
    { value: "3", unit: "ヶ月", label: "大物の乾燥期間" },
    { value: "2006", unit: "年", label: "ギャラリー瓦廊 開設" },
  ],
};

export const about = {
  label: "PHILOSOPHY",
  heading: "日本の伝統と文化を守る",
  body: [
    "私たちは淡路島の南西部、南あわじ市津井地区の播磨灘に面した自然豊かな環境で、代々瓦作りに励んできました。",
    "現在の主な仕事は鬼瓦・棟瓦の製造ですが、手造り職人が手掛ける壁・床・庭のアプローチ、飾り瓦など、焼き物と手作りの技術を活かして広い範囲に目を向けています。",
  ],
  elements: [
    { kanji: "土", en: "EARTH", text: "一に土。淡路島の良質な原土" },
    { kanji: "窯", en: "KILN", text: "二に窯。1000℃超で焼き、燻す" },
    { kanji: "細工", en: "CRAFT", text: "三に細工。鬼師の手仕事" },
  ],
  images: [img("about-2.jpg", "ヘラで鬼瓦を仕上げる鬼師の手元"), img("company-1.jpg", "播磨灘に面した津井の町並み")],
};

export const onigawara = {
  label: "AWAJI ONIGAWARA",
  heading: "淡路鬼瓦 特注品の製作",
  lead: "特注品の鬼瓦や飾り瓦は、鬼師が一つひとつ手作りで製作しています。昔ながらの技を受け継ぎながら、現代の新たな感性を取り入れる。鬼師の土に込める想いは止むことがありません。",
  onishi: {
    title: "鬼師とは",
    body: "手作りで鬼瓦や飾り瓦を作る職人を「鬼師」と呼びます。土を知る仕事ともいえる鬼師は、全国でも非常に少なくなっています。",
    image: img("factory.jpg", "鬼瓦を手にする鬼師"),
  },
  process: [
    { no: "01", title: "図面", text: "焼成時の収縮率を踏まえて寸法を決める。仕上がりを左右する重要な工程です。" },
    { no: "02", title: "成形", text: "粘土で土台を作り、盛り土を重ね、金ベラ・木ベラと指先で数日かけて面を形にします。" },
    { no: "03", title: "乾燥", text: "通常でも半月、大きなものは約3ヶ月。時間をかけてゆっくり乾かします。" },
    { no: "04", title: "焼成・燻化", text: "1000℃以上で焼き、燻すことで淡路瓦特有の冴えのあるいぶし瓦になります。" },
  ],
  processImages: [img("oni-seisaku.jpg", "鬼瓦の成形作業"), img("oni-koutei.jpg", "乾燥中の鬼瓦が並ぶ工房")],
  categories: [
    img("oni-kimenbanner.jpg", "鬼面・古代鬼面"),
    img("oni-kyounomakibanner.jpg", "経の巻"),
    img("oni-robanbanner.jpg", "露盤"),
    img("oni-sisibanner.jpg", "唐獅子・鯱・鴟尾"),
    img("oni-b_sonotabanner.jpg", "その他鬼瓦"),
    img("oni-b_syokibanner.jpg", "鍾馗さん"),
    img("oni-b_magaribanner.jpg", "紐曲り・乗り"),
    img("oni-b_wanbanner.jpg", "隅蓋"),
    img("oni-b_sonotabanner_1.jpg", "その他飾り瓦"),
  ],
};

export const products = {
  label: "PRODUCTS",
  heading: "取扱商品",
  lead: "職人「鬼師」による鬼瓦・棟瓦の製造。焼き物の技術と手作りの技術で、さまざまな鬼瓦を製造・販売しています。",
  items: [
    img("goods-a_kaezu.jpg", "カエズ型鬼瓦"),
    img("goods-a_fukurin.jpg", "覆輪型鬼瓦"),
    img("goods-a_shaji.jpg", "社寺用鬼瓦"),
    img("goods-a_sonotaoni.jpg", "その他鬼瓦"),
    img("goods-a_roban.jpg", "露盤・棟飾り"),
    img("goods-a_shoki.jpg", "鍾馗"),
    img("goods-a_magari.jpg", "紐曲り"),
    img("goods-a_wan.jpg", "隅巴蓋"),
    img("goods-a_sonota.jpg", "その他"),
  ],
};

export const kaze = {
  label: "KAZE SERIES",
  heading: "瓦風 -kaze-",
  sub: "瓦のインテリア・エクステリア",
  lead: "屋根材としての「鬼瓦」「熨斗瓦」とは別に、新しい瓦の空間づくりとして設けた部門です。上質な淡路島の土と鬼師の斬新な感覚が、庭園や室内に新たな空気をもたらします。いぶしの程よい色調、静かな存在感、時とともに出る風合い。",
  image: img("gallery-03.jpg", "瓦風 -kaze- の灯り"),
  series: [
    {
      name: "瓦の間 -華- Series",
      en: "INTERIOR",
      text: "瓦小物や花器、灯り。手技の妙味と淡路島の天然土から生まれる、人にも環境にもやさしいかたち。",
      image: img("goods-kaze_hana.jpg", "瓦の間 -華- シリーズ"),
    },
    {
      name: "瓦の庭 -樹- Series",
      en: "EXTERIOR",
      text: "ガーデンデザイナーと鬼瓦職人の感性が交わる瓦空間。和風庭園からモダンな庭まで、オーダーで演出します。",
      image: img("goods-kaze_niwa.jpg", "瓦の庭 -樹- シリーズ"),
    },
  ],
  madeToOrder: ["記念品・贈答品", "花器・プランター", "表札・看板", "家紋", "鍾馗さん", "その他製作例"],
};

export const gallery = {
  label: "IBUSHI GALLERY",
  heading: "Ibushi Gallery 瓦廊",
  lead: "2006年10月、社内にオープンした淡路瓦専門の展示販売スペース。業界の方から淡路島観光のお客様まで、伝統建材いぶし瓦の魅力と、現代にも生きるモダンな魅力を感じていただけます。",
  hours: [
    { k: "平日", v: "9:00–17:00" },
    { k: "土曜", v: "9:00–16:00" },
    { k: "お昼休み", v: "12:00–13:00" },
    { k: "定休日", v: "日曜・GW・お盆・年末年始" },
    { k: "駐車場", v: "あり" },
  ],
  images: [
    img("gallery-02.jpg", "瓦廊の展示棚"),
    img("gallery-04.jpg", "達磨の飾り瓦"),
    img("gallery-07.jpg", "灯りに照らされた鬼面"),
    img("gallery-08.jpg", "獅子の飾り瓦"),
    img("gallery-09.jpg", "猿の飾り瓦"),
    img("gallery-10.jpg", "瓦廊の店内"),
    img("gallery-05.jpg", "瓦の植木鉢"),
    img("gallery-12.jpg", "瓦の花器と生け花"),
  ],
};

export const visit = {
  label: "VISIT & WORKSHOP",
  heading: "見る、触れる、つくる。",
  tour: {
    title: "工場見学",
    image: img("about-1.jpg", "工房に並ぶ鬼瓦"),
    text: "鬼師の手作り製作の現場や瓦を焼く窯、ギャラリーには展示できない大きな鬼瓦や100年以上前の古い鬼瓦の展示場をご覧いただけます。工場内の QR コードから英語の音声案内も聞けます。",
    facts: [
      { k: "所要時間", v: "40分〜1時間" },
      { k: "開催日", v: "平日（月〜金）のみ・3ヶ月前から予約可" },
      { k: "人数", v: "30名程度まで" },
      { k: "料金", v: "お一人 1,650円（小学生以下無料・団体割引あり）" },
    ],
  },
  workshops: [
    {
      title: "ミニ古代鬼瓦 絵付け体験",
      text: "完成品のミニ鬼瓦にペンや絵の具でカラフルに絵付け。いぶし瓦とは一味違うオリジナル鬼瓦が完成します。",
      time: "30分〜1時間",
      price: "1,980円（税込）",
      image: img("workshop-1.jpg", "ミニ鬼瓦の絵付け体験"),
    },
    {
      title: "熨斗瓦 絵描き体験",
      text: "屋根用の熨斗瓦に思い思いの絵を描いて、ご自宅のインテリアに。",
      time: "30分〜1時間",
      price: "1,980円（税込）",
      image: img("workshop-2.jpg", "熨斗瓦への絵描き体験"),
    },
    {
      title: "石膏型で古代鬼面づくり",
      text: "手のひらサイズの古代鬼面を石膏型で押し固めて作ります。焼成後に発送します。",
      time: "30分",
      price: "お問い合わせ",
      image: img("workshop-3.jpg", "石膏型で作った古代鬼面"),
    },
    {
      title: "モザイクアート体験",
      text: "瓦のカケラ（廃材）を使ったモザイクアート。額入り仕様も製作できます。",
      time: "60分",
      price: "お問い合わせ",
      image: img("workshop-4.jpg", "瓦片のモザイクアート"),
    },
  ],
  notes: [
    "絵付け体験の作品は当日お持ち帰りいただけます。",
    "絵付け体験は予約なしでも可能。10名以上の団体様は事前予約が必要です（30名程度まで）。",
    "手作りワークショップは事前予約制です。お電話・メール・公式LINEからどうぞ。",
  ],
};

export const shop = {
  label: "ONLINE SHOP",
  heading: "手のひらの鬼瓦",
  lead: "卓上サイズの鬼瓦、壁掛け鬼瓦、瓦の小物をオンラインショップで販売しています。",
  items: [
    img("shop-1.jpg", "卓上鬼瓦 鬼面 IK-Ⅰ"),
    img("shop-2.jpg", "卓上鬼瓦 古代鬼面 IK-Ⅱ"),
    img("shop-3.jpg", "卓上鬼瓦 鬼面 IK-Ⅲ"),
    img("shop-4.jpg", "鬼達磨"),
    img("shop-5.jpg", "卓上鬼瓦 雲鬼"),
    img("shop-6.jpg", "鴟尾"),
    img("shop-7.jpg", "フクロウ"),
    img("shop-8.jpg", "招き猫 左手上げ"),
    img("shop-9.jpg", "コースター"),
  ],
};

export const history = {
  label: "HISTORY",
  heading: "淡路瓦の歴史",
  body: [
    "淡路瓦の起源は慶長15年（1610年）。淡路島を所領とした池田忠雄が成山城の築城にあたり、播州瓦の名工・清水理兵衛を呼び寄せて瓦を焼かせたのが始まりとされます。中心地の津井地区には、その約20年後の寛永年間に伝わったといわれています。",
    "旧西淡地区は良質な粘土に恵まれ、さくい土と粘い土を調合し、幾度もこねあげて原料土に仕上げてきました。現在も島内には約70軒の瓦製造業者があり、いぶし瓦の生産量では全国一を争う産地です。",
  ],
  aun: {
    title: "鬼面の「阿」と「吽」",
    text: "仁王像と同じく、鬼面瓦にも「阿」と「吽」があります。口を開いた「阿」は誕生を、口を閉じた「吽」は悟りを意味するといわれ、屋根に据える際は向かって右に阿、左に吽を納める考え方があります。",
    images: [img("history-3.jpg", "口を開いた阿形の鬼面"), img("history-4.jpg", "口を閉じた吽形の鬼面")],
  },
  images: [img("history-1.jpg", "古い鬼瓦の欠片"), img("history-2.jpg", "古い鬼瓦")],
};

export const suisan = {
  label: "FISHERIES",
  heading: "水産部 タツミのワカメ",
  text: "鳴門海峡周辺、南あわじ市産のわかめを自社水産工場で湯通し・塩蔵処理。「安心・安全・新鮮」をモットーに、めかぶ・葉・茎に選別した商品を販売しています。",
  // 注: 現行サイトの「成分と効用」（疾病予防の記述）は薬機法・景表法の観点で掲載を見送り。要クライアント確認。
  contact: { tel: "0799-38-0348", fax: "0799-38-0901" },
  images: [img("suisan-2.jpg", "収穫したワカメ"), img("suisan-3.jpg", "水産工場での作業")],
};

export const sdgs = {
  label: "SDGs",
  heading: "つくる責任 つかう責任",
  text: "2025年1月、SDGs推進宣言。淡路瓦の素材は100%地元淡路島で採れる原土です。製造工程で出る粘土の端材をすぐに水に浸けて保存し、再び混錬して使うことで、原土の使用率95%以上を目指しています。",
};

export const company = {
  label: "COMPANY",
  heading: "会社案内",
  rows: [
    { k: "社名", v: "株式会社タツミ（Tatsumi Corporation）" },
    { k: "所在地", v: site.address },
    { k: "TEL / FAX", v: `${site.tel} / ${site.fax}` },
    { k: "事業内容", v: "鬼瓦・棟瓦・飾り瓦の製造販売、瓦のインテリア・エクステリア製品「瓦風 -kaze-」、ギャラリー瓦廊の運営、工場見学・ワークショップ、水産部（わかめの加工販売）" },
    { k: "指定", v: "兵庫県伝統的工芸品「淡路鬼瓦」指定窯元" },
    // TODO: 設立年・代表者名・資本金・沿革はクライアントに確認（現行サイトでは画像のため未取得）
  ],
  access: "神戸淡路鳴門自動車道 西淡三原ICから約10km、車で約15分。ICを下りて信号を直進、湊交差点を左折し県道25号線へ。",
  image: img("company-2.jpg", "株式会社タツミの社屋と看板"),
};

export type NewsItem = { date: string; title: string; category: "NEWS" | "BLOG"; note: string };
export const news = newsData as NewsItem[];
