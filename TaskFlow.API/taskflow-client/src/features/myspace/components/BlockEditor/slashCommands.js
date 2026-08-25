import { BLOCK_TYPES } from "./blockTypes";

export const SLASH_COMMANDS = [
  // TEMEL
  { label: "Metin", type: BLOCK_TYPES.TEXT, icon: "notes", keywords: ["text", "metin", "yazı"], description: "Düz metin yazmaya başla.", category: "Temel" },
  { label: "Başlık 1", type: BLOCK_TYPES.HEADING_1, icon: "format_h1", keywords: ["h1", "başlık 1", "büyük"], description: "Büyük bölüm başlığı.", category: "Temel" },
  { label: "Başlık 2", type: BLOCK_TYPES.HEADING_2, icon: "format_h2", keywords: ["h2", "başlık 2", "orta"], description: "Orta bölüm başlığı.", category: "Temel" },
  { label: "Başlık 3", type: BLOCK_TYPES.HEADING_3, icon: "format_h3", keywords: ["h3", "başlık 3", "küçük"], description: "Küçük bölüm başlığı.", category: "Temel" },
  { label: "To-do List", type: BLOCK_TYPES.TODO, icon: "check_box", keywords: ["todo", "görev", "task", "yapılacaklar"], description: "Yapılacakları takip et.", category: "Temel" },
  { label: "Bullet List", type: BLOCK_TYPES.BULLET_LIST, icon: "format_list_bulleted", keywords: ["bullet", "madde", "liste"], description: "Maddeli liste oluştur.", category: "Temel" },
  { label: "Numbered List", type: BLOCK_TYPES.NUMBERED_LIST, icon: "format_list_numbered", keywords: ["number", "numaralı", "liste", "123"], description: "Numaralı liste oluştur.", category: "Temel" },
  { label: "Divider", type: BLOCK_TYPES.DIVIDER, icon: "horizontal_rule", keywords: ["divider", "çizgi", "ayırıcı"], description: "Yatay ayırıcı çizgi.", category: "Temel" },
  
  // İÇERİK
  { label: "Quote", type: BLOCK_TYPES.QUOTE, icon: "format_quote", keywords: ["quote", "alıntı", "söz"], description: "Alıntı oluştur.", category: "İçerik" },
  { label: "Callout", type: BLOCK_TYPES.CALLOUT, icon: "lightbulb", keywords: ["callout", "uyarı", "bilgi", "vurgu"], description: "Öne çıkan uyarı/bilgi kutusu.", category: "İçerik" },
  { label: "Code", type: BLOCK_TYPES.CODE, icon: "code", keywords: ["code", "kod", "yazılım", "script"], description: "Kod bloğu ekle.", category: "İçerik" },
  { label: "Link", type: BLOCK_TYPES.LINK, icon: "link", keywords: ["link", "bağlantı", "url"], description: "Hızlı bağlantı ekle.", category: "İçerik" },
  { label: "Image", type: BLOCK_TYPES.IMAGE, icon: "image", keywords: ["image", "resim", "görsel", "fotoğraf"], description: "URL ile görsel ekle.", category: "İçerik" },
  { label: "File", type: BLOCK_TYPES.FILE, icon: "attach_file", keywords: ["file", "dosya", "ek"], description: "Dosya ekle (Demo).", category: "İçerik" },
  { label: "Bookmark", type: BLOCK_TYPES.BOOKMARK, icon: "bookmark", keywords: ["bookmark", "yer imi", "önizleme"], description: "Link önizleme kartı.", category: "İçerik" },
  { label: "Embed", type: BLOCK_TYPES.EMBED, icon: "integration_instructions", keywords: ["embed", "video", "iframe", "youtube"], description: "Dış içerik yerleştir.", category: "İçerik" },
  { label: "Equation", type: BLOCK_TYPES.EQUATION, icon: "functions", keywords: ["equation", "matematik", "formül", "denklem"], description: "Matematik formülü ekle.", category: "İçerik" },
  
  // GELİŞMİŞ
  { label: "Toggle", type: BLOCK_TYPES.TOGGLE, icon: "arrow_drop_down_circle", keywords: ["toggle", "açılır", "kapanır", "gizli"], description: "İç içe açılıp kapanan liste.", category: "Gelişmiş" },
  { label: "Table", type: BLOCK_TYPES.TABLE, icon: "table", keywords: ["table", "tablo", "grid", "excel"], description: "Basit tablo oluştur.", category: "Gelişmiş" },
  { label: "Columns", type: BLOCK_TYPES.COLUMNS, icon: "view_column", keywords: ["columns", "kolon", "sütun", "yan yana"], description: "Yan yana kolonlar.", category: "Gelişmiş" },
  { label: "Database", type: BLOCK_TYPES.DATABASE, icon: "database", keywords: ["database", "veritabanı", "taskflow", "tablo"], description: "TaskFlow veri tablosu.", category: "Gelişmiş" }
];
