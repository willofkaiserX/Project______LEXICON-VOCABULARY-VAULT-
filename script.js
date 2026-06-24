// Lexicon Vault - Vocabulary Tracker
// Main Application JavaScript

// =====================
// Storage Module
// =====================
const Storage = {
    KEYS: {
        VOCABULARY: 'lexicon_vault_vocabulary',
        STATISTICS: 'lexicon_vault_statistics',
        QUIZ_RESULTS: 'lexicon_vault_quiz_results',
        WORD_OF_DAY: 'lexicon_vault_word_of_day',
        STREAK: 'lexicon_vault_streak',
        XP: 'lexicon_vault_xp',
        ACHIEVEMENTS: 'lexicon_vault_achievements',
        SEARCH_HISTORY: 'lexicon_vault_search_history',
        DAILY_CHALLENGE: 'lexicon_vault_daily_challenge',
        SETTINGS: 'lexicon_vault_settings',
        CURRENT_LANGUAGE: 'lexicon_vault_language'
    },

    getCurrentLanguage() {
        return localStorage.getItem(this.KEYS.CURRENT_LANGUAGE) || 'en';
    },

    setCurrentLanguage(language) {
        localStorage.setItem(this.KEYS.CURRENT_LANGUAGE, language);
    },

    getVocabulary(language = null) {
        const lang = language || this.getCurrentLanguage();
        const data = localStorage.getItem(`${this.KEYS.VOCABULARY}_${lang}`);
        return data ? JSON.parse(data) : [];
    },

    saveVocabulary(vocabulary, language = null) {
        const lang = language || this.getCurrentLanguage();
        localStorage.setItem(`${this.KEYS.VOCABULARY}_${lang}`, JSON.stringify(vocabulary));
    },

    addWord(wordData, language = null) {
        const lang = language || this.getCurrentLanguage();
        const vocabulary = this.getVocabulary(lang);
        
        // Check for duplicates
        if (vocabulary.some(w => w.word.toLowerCase() === wordData.word.toLowerCase())) {
            return false;
        }

        const newWord = {
            id: Date.now(),
            word: wordData.word,
            meaning: wordData.meaning,
            example: wordData.example,
            pronunciation: wordData.pronunciation,
            partOfSpeech: wordData.partOfSpeech,
            synonyms: wordData.synonyms || [],
            dateAdded: new Date().toISOString(),
            learned: false,
            reviewCount: 0,
            difficult: false,
            favorite: false,
            rating: null,
            nextReview: new Date().toISOString(),
            language: lang,
            popularity: wordData.popularity || '★★★☆☆',
            contextExamples: wordData.contextExamples || {
                formal: wordData.example,
                casual: wordData.example,
                academic: wordData.example
            },
            // Backward compatibility: preserve new fields but provide defaults
            allDefinitions: wordData.allDefinitions || [],
            wordInsights: wordData.wordInsights || {},
            wordRelationships: wordData.wordRelationships || { synonyms: [], antonyms: [], wordFamily: [] },
            isJapanese: wordData.isJapanese || false,
            kana: wordData.kana || '',
            jlptLevel: wordData.jlptLevel || ''
        };

        vocabulary.push(newWord);
        this.saveVocabulary(vocabulary, lang);
        return true;
    },

    updateWord(wordId, updates, language = null) {
        const lang = language || this.getCurrentLanguage();
        const vocabulary = this.getVocabulary(lang);
        const index = vocabulary.findIndex(w => w.id === wordId);
        
        if (index !== -1) {
            vocabulary[index] = { ...vocabulary[index], ...updates };
            this.saveVocabulary(vocabulary, lang);
            return true;
        }
        return false;
    },

    deleteWord(wordId, language = null) {
        const lang = language || this.getCurrentLanguage();
        const vocabulary = this.getVocabulary(lang);
        const filtered = vocabulary.filter(w => w.id !== wordId);
        this.saveVocabulary(filtered, lang);
    },

    getStatistics() {
        const data = localStorage.getItem(this.KEYS.STATISTICS);
        return data ? JSON.parse(data) : {
            totalWords: 0,
            learnedWords: 0,
            pendingWords: 0,
            quizAccuracy: 0,
            currentStreak: 0,
            bestQuizScore: 0
        };
    },

    saveStatistics(stats) {
        localStorage.setItem(this.KEYS.STATISTICS, JSON.stringify(stats));
    },

    getQuizResults() {
        const data = localStorage.getItem(this.KEYS.QUIZ_RESULTS);
        return data ? JSON.parse(data) : [];
    },

    saveQuizResult(result) {
        const results = this.getQuizResults();
        results.push(result);
        localStorage.setItem(this.KEYS.QUIZ_RESULTS, JSON.stringify(results));
    },

    getWordOfDay() {
        const lang = this.getCurrentLanguage();
        const data = localStorage.getItem(`${this.KEYS.WORD_OF_DAY}_${lang}`);
        if (data) {
            const { word, date } = JSON.parse(data);
            const today = new Date().toDateString();
            if (date === today) {
                return word;
            }
        }
        return null;
    },

    setWordOfDay(word) {
        const lang = this.getCurrentLanguage();
        localStorage.setItem(`${this.KEYS.WORD_OF_DAY}_${lang}`, JSON.stringify({
            word,
            date: new Date().toDateString()
        }));
    },

    getStreak() {
        const data = localStorage.getItem(this.KEYS.STREAK);
        return data ? JSON.parse(data) : { current: 0, lastActive: null };
    },

    setStreak(streak) {
        localStorage.setItem(this.KEYS.STREAK, JSON.stringify(streak));
    },

    getXP() {
        const data = localStorage.getItem(this.KEYS.XP);
        return data ? JSON.parse(data) : { total: 0, level: 1 };
    },

    addXP(amount) {
        const xp = this.getXP();
        xp.total += amount;
        
        // Calculate level (every 100 XP = 1 level)
        xp.level = Math.floor(xp.total / 100) + 1;
        
        localStorage.setItem(this.KEYS.XP, JSON.stringify(xp));
        return xp;
    },

    getAchievements() {
        const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
        return data ? JSON.parse(data) : [];
    },

    unlockAchievement(achievementId) {
        const achievements = this.getAchievements();
        if (!achievements.includes(achievementId)) {
            achievements.push(achievementId);
            localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
            return true;
        }
        return false;
    },

    getSearchHistory() {
        const data = localStorage.getItem(this.KEYS.SEARCH_HISTORY);
        return data ? JSON.parse(data) : [];
    },

    addSearchHistory(term) {
        const history = this.getSearchHistory();
        // Remove if already exists
        const filtered = history.filter(h => h.toLowerCase() !== term.toLowerCase());
        // Add to beginning
        filtered.unshift(term);
        // Keep only last 50
        const trimmed = filtered.slice(0, 50);
        localStorage.setItem(this.KEYS.SEARCH_HISTORY, JSON.stringify(trimmed));
    },

    getDailyChallenge() {
        const data = localStorage.getItem(this.KEYS.DAILY_CHALLENGE);
        if (data) {
            const { challenge, date, progress } = JSON.parse(data);
            const today = new Date().toDateString();
            if (date === today) {
                return { challenge, progress };
            }
        }
        return null;
    },

    setDailyChallenge(challenge, progress = 0) {
        localStorage.setItem(this.KEYS.DAILY_CHALLENGE, JSON.stringify({
            challenge,
            progress,
            date: new Date().toDateString()
        }));
    },

    getSettings() {
        const data = localStorage.getItem(this.KEYS.SETTINGS);
        return data ? JSON.parse(data) : { sound: true };
    },

    updateSettings(settings) {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updated));
        return updated;
    }
};

// ========================
// Hindi Utilities + Common Dictionary
// ========================
const HindiUtils = {
    isDevanagari(text) { return /[ऀ-ॿ]/.test(text); },
    isJapanesePossible(text) { return /[぀-ヿ一-龯]/.test(text); },

    // Sync lookup for UI hint — checks local dict, returns Devanagari if known, else original word
    romanToDevanagari(word) {
        const key = word.toLowerCase().trim();
        const local = this.DICT[key];
        if (local) return local.split('|')[1];
        return word;
    },

    // 80+ most-searched Hindi words (Hinglish → English meaning + Devanagari)
    DICT: {
        'insaan':'human being|इंसान','insan':'human being|इंसान',
        'dil':'heart|दिल','pyaar':'love|प्यार','pyar':'love|प्यार',
        'mohabbat':'love, deep affection|मोहब्बत',
        'ishq':'passionate love|इश्क़',
        'dost':'friend|दोस्त','yaar':'friend, buddy|यार',
        'dushman':'enemy|दुश्मन','dushmann':'enemy|दुश्मन',
        'paani':'water|पानी','pani':'water|पानी',
        'khana':'food|खाना','khaana':'food|खाना',
        'ghar':'house, home|घर','makaan':'house|मकान',
        'sapna':'dream|सपना','khwab':'dream|ख़्वाब',
        'zindagi':'life|ज़िंदगी','jeevan':'life|जीवन',
        'maut':'death|मौत','mrityu':'death|मृत्यु',
        'aasman':'sky|आसमान','aakaash':'sky|आकाश',
        'zameen':'earth, ground|ज़मीन','dharti':'earth|धरती',
        'duniya':'world|दुनिया','sansar':'world|संसार',
        'khushi':'happiness, joy|ख़ुशी','sukh':'happiness|सुख',
        'dukh':'sorrow, pain|दुख','gham':'grief|ग़म',
        'baccha':'child|बच्चा','bacha':'child|बच्चा',
        'aurat':'woman|औरत','ladki':'girl|लड़की',
        'aadmi':'man|आदमी','ladka':'boy|लड़का',
        'beta':'son|बेटा','beti':'daughter|बेटी',
        'maa':'mother|माँ','mata':'mother|माता',
        'baap':'father|बाप','pita':'father|पिता',
        'bhai':'brother|भाई','behan':'sister|बहन',
        'naam':'name|नाम','kaam':'work, job|काम',
        'din':'day|दिन','raat':'night|रात',
        'subah':'morning|सुबह','shaam':'evening|शाम',
        'achha':'good|अच्छा','acha':'good|अच्छा',
        'bura':'bad|बुरा','buri':'bad (fem.)|बुरी',
        'bada':'big, great|बड़ा','chhota':'small|छोटा',
        'naya':'new|नया','purana':'old|पुराना',
        'sundar':'beautiful|सुन्दर','khubsoorat':'beautiful|ख़ूबसूरत',
        'tez':'fast, sharp|तेज़','dheela':'loose, slow|ढीला',
        'aaj':'today|आज','kal':'yesterday / tomorrow|कल',
        'abhi':'now, right now|अभी','phir':'then, again|फिर',
        'haan':'yes|हाँ','nahi':'no|नहीं','nahi':'no|नहीं',
        'shukriya':'thank you|शुक्रिया','dhanyawad':'thank you|धन्यवाद',
        'maafi':'sorry, forgiveness|माफ़ी','sorry':'sorry|माफ़ करना',
        'rishta':'relationship|रिश्ता','pyaari':'dear, beloved (fem.)|प्यारी',
        'awaaz':'voice, sound|आवाज़','tasveer':'picture, image|तस्वीर',
        'doston':'friends (plural)|दोस्तों','logo':'people|लोगों',
        'samay':'time|समय','waqt':'time|वक़्त',
        'khel':'game, play|खेल','geet':'song|गीत',
        'desh':'country|देश','gaon':'village|गाँव',
        'sheher':'city|शहर','school':'school|स्कूल',
        'kitab':'book|किताब','kaagaz':'paper|काग़ज़',
        'hawa':'air, breeze|हवा','aag':'fire|आग',
        'baarish':'rain|बारिश','barish':'rain|बारिश',
        'andheraa':'darkness|अंधेरा','roshan':'bright|रोशन',
        'shakti':'power, strength|शक्ति','bal':'strength|बल',
        'mann':'mind, heart|मन','dimag':'brain, mind|दिमाग़',
        'baat':'talk, matter|बात','bhaasha':'language|भाषा',
    },

    // Google Input Tools for precise romanized Hindi → Devanagari
    async getDevanagari(word) {
        // 1. Check local dictionary first (instant)
        const local = this.DICT[word.toLowerCase()];
        if (local) return local.split('|')[1];
        // 2. Google Input Tools transliteration (free, no key needed)
        try {
            const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&inputtype=transliteration&language=hi&num=1`;
            const r = await fetch(url);
            if (r.ok) {
                const d = await r.json();
                if (d[0] === 'SUCCESS' && d[1]?.[0]?.[1]?.[0]) return d[1][0][1][0];
            }
        } catch {}
        return null;
    }
};

// ========================
// Jisho — Japanese Dictionary API (via CORS proxy)
// Jisho is the gold-standard free Japanese-English dictionary.
// It handles romaji (neko), kana (ねこ), and kanji (猫) input.
// ========================
const JishoAPI = {
    // Multiple CORS proxies tried in order — if one is down or rate-limited, the next takes over
    PROXIES: [
        'https://corsproxy.io/?url=',
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://thingproxy.freeboard.io/fetch/',
    ],
    JISHO: 'https://jisho.org/api/v1/search/words?keyword=',

    // Common Japanese words fallback dictionary (for when APIs fail)
    COMMON_WORDS: {
        'neko': { kanji: '猫', kana: 'ねこ', meaning: 'cat', jlpt: 'N5', common: true },
        'inu': { kanji: '犬', kana: 'いぬ', meaning: 'dog', jlpt: 'N5', common: true },
        'watashi': { kanji: '私', kana: 'わたし', meaning: 'I, me', jlpt: 'N5', common: true },
        'anata': { kanji: 'あなた', kana: 'あなた', meaning: 'you', jlpt: 'N5', common: true },
        'arigatou': { kanji: 'ありがとう', kana: 'ありがとう', meaning: 'thank you', jlpt: 'N5', common: true },
        'sayounara': { kanji: 'さようなら', kana: 'さようなら', meaning: 'goodbye', jlpt: 'N5', common: true },
        'hai': { kanji: 'はい', kana: 'はい', meaning: 'yes', jlpt: 'N5', common: true },
        'iie': { kanji: 'いいえ', kana: 'いいえ', meaning: 'no', jlpt: 'N5', common: true },
        'sensei': { kanji: '先生', kana: 'せんせい', meaning: 'teacher', jlpt: 'N5', common: true },
        'gakusei': { kanji: '学生', kana: 'がくせい', meaning: 'student', jlpt: 'N5', common: true },
        'tomodachi': { kanji: '友達', kana: 'ともだち', meaning: 'friend', jlpt: 'N5', common: true },
        'kazoku': { kanji: '家族', kana: 'かぞく', meaning: 'family', jlpt: 'N5', common: true },
        'nihon': { kanji: '日本', kana: 'にほん', meaning: 'Japan', jlpt: 'N5', common: true },
        'tokyo': { kanji: '東京', kana: 'とうきょう', meaning: 'Tokyo', jlpt: 'N5', common: true },
        'sushi': { kanji: '寿司', kana: 'すし', meaning: 'sushi', jlpt: 'N5', common: true },
        'ramen': { kanji: 'ラーメン', kana: 'らーめん', meaning: 'ramen noodles', jlpt: 'N5', common: true },
        'sakura': { kanji: '桜', kana: 'さくら', meaning: 'cherry blossom', jlpt: 'N5', common: true },
        'yama': { kanji: '山', kana: 'やま', meaning: 'mountain', jlpt: 'N5', common: true },
        'kawa': { kanji: '川', kana: 'かわ', meaning: 'river', jlpt: 'N5', common: true },
        'umi': { kanji: '海', kana: 'うみ', meaning: 'sea, ocean', jlpt: 'N5', common: true },
        'tenki': { kanji: '天気', kana: 'てんき', meaning: 'weather', jlpt: 'N5', common: true },
        'ame': { kanji: '雨', kana: 'あめ', meaning: 'rain', jlpt: 'N5', common: true },
        'yuki': { kanji: '雪', kana: 'ゆき', meaning: 'snow', jlpt: 'N5', common: true },
        'kaze': { kanji: '風', kana: 'かぜ', meaning: 'wind', jlpt: 'N5', common: true },
        'hi': { kanji: '日', kana: 'ひ', meaning: 'day, sun', jlpt: 'N5', common: true },
        'tsuki': { kanji: '月', kana: 'つき', meaning: 'moon', jlpt: 'N5', common: true },
        'hoshi': { kanji: '星', kana: 'ほし', meaning: 'star', jlpt: 'N5', common: true },
        'mizu': { kanji: '水', kana: 'みず', meaning: 'water', jlpt: 'N5', common: true },
        'akai': { kanji: '赤い', kana: 'あかい', meaning: 'red', jlpt: 'N5', common: true },
        'aoi': { kanji: '青い', kana: 'あおい', meaning: 'blue', jlpt: 'N5', common: true },
        'shiroi': { kanji: '白い', kana: 'しろい', meaning: 'white', jlpt: 'N5', common: true },
        'kuroi': { kanji: '黒い', kana: 'くろい', meaning: 'black', jlpt: 'N5', common: true },
        'oishii': { kanji: '美味しい', kana: 'おいしい', meaning: 'delicious', jlpt: 'N5', common: true },
        'atsui': { kanji: '暑い', kana: 'あつい', meaning: 'hot (weather)', jlpt: 'N5', common: true },
        'samui': { kanji: '寒い', kana: 'さむい', meaning: 'cold (weather)', jlpt: 'N5', common: true },
        'atsui': { kanji: '熱い', kana: 'あつい', meaning: 'hot (temperature)', jlpt: 'N5', common: true },
        'tsumetai': { kanji: '冷たい', kana: 'つめたい', meaning: 'cold (temperature)', jlpt: 'N5', common: true },
        'ookii': { kanji: '大きい', kana: 'おおきい', meaning: 'big', jlpt: 'N5', common: true },
        'chiisai': { kanji: '小さい', kana: 'ちいさい', meaning: 'small', jlpt: 'N5', common: true },
        'atarashii': { kanji: '新しい', kana: 'あたらしい', meaning: 'new', jlpt: 'N5', common: true },
        'furui': { kanji: '古い', kana: 'ふるい', meaning: 'old', jlpt: 'N5', common: true },
        'ii': { kanji: '良い', kana: 'いい', meaning: 'good', jlpt: 'N5', common: true },
        'warui': { kanji: '悪い', kana: 'わるい', meaning: 'bad', jlpt: 'N5', common: true },
        'tanoshii': { kanji: '楽しい', kana: 'たのしい', meaning: 'fun, enjoyable', jlpt: 'N5', common: true },
        'muzukashii': { kanji: '難しい', kana: 'むずかしい', meaning: 'difficult', jlpt: 'N4', common: true },
        'kantan': { kanji: '簡単', kana: 'かんたん', meaning: 'simple, easy', jlpt: 'N4', common: true },
        'benkyou': { kanji: '勉強', kana: 'べんきょう', meaning: 'study', jlpt: 'N5', common: true },
        'shigoto': { kanji: '仕事', kana: 'しごと', meaning: 'work, job', jlpt: 'N5', common: true },
        'asa': { kanji: '朝', kana: 'あさ', meaning: 'morning', jlpt: 'N5', common: true },
        'yoru': { kanji: '夜', kana: 'よる', meaning: 'night', jlpt: 'N5', common: true },
        'gohan': { kanji: 'ご飯', kana: 'ごはん', meaning: 'meal, rice', jlpt: 'N5', common: true },
        'tabemono': { kanji: '食べ物', kana: 'たべもの', meaning: 'food', jlpt: 'N5', common: true },
        'nomimono': { kanji: '飲み物', kana: 'のみもの', meaning: 'drink', jlpt: 'N5', common: true },
        'ie': { kanji: '家', kana: 'いえ', meaning: 'house, home', jlpt: 'N5', common: true },
        'heya': { kanji: '部屋', kana: 'へや', meaning: 'room', jlpt: 'N5', common: true },
        'kuruma': { kanji: '車', kana: 'くるま', meaning: 'car', jlpt: 'N5', common: true },
        'densha': { kanji: '電車', kana: 'でんしゃ', meaning: 'train', jlpt: 'N5', common: true },
        'basu': { kanji: 'バス', kana: 'ばす', meaning: 'bus', jlpt: 'N5', common: true },
        'eki': { kanji: '駅', kana: 'えき', meaning: 'station', jlpt: 'N5', common: true },
        'michi': { kanji: '道', kana: 'みち', meaning: 'road, path', jlpt: 'N5', common: true },
        'machi': { kanji: '町', kana: 'まち', meaning: 'town, city', jlpt: 'N5', common: true },
        'hon': { kanji: '本', kana: 'ほん', meaning: 'book', jlpt: 'N5', common: true },
        'pen': { kanji: 'ペン', kana: 'ぺん', meaning: 'pen', jlpt: 'N5', common: true },
        'kami': { kanji: '紙', kana: 'かみ', meaning: 'paper', jlpt: 'N5', common: true },
        'enpitsu': { kanji: '鉛筆', kana: 'えんぴつ', meaning: 'pencil', jlpt: 'N5', common: true },
        'saifu': { kanji: '財布', kana: 'さいふ', meaning: 'wallet', jlpt: 'N5', common: true },
        'kagi': { kanji: '鍵', kana: 'かぎ', meaning: 'key', jlpt: 'N5', common: true },
        'megane': { kanji: '眼鏡', kana: 'めがね', meaning: 'glasses', jlpt: 'N5', common: true },
        'tokei': { kanji: '時計', kana: 'とけい', meaning: 'clock, watch', jlpt: 'N5', common: true },
        'denwa': { kanji: '電話', kana: 'でんわ', meaning: 'telephone', jlpt: 'N5', common: true },
        'keitai': { kanji: '携帯', kana: 'けいたい', meaning: 'mobile phone', jlpt: 'N5', common: true },
        'pasokon': { kanji: 'パソコン', kana: 'ぱそこん', meaning: 'computer', jlpt: 'N5', common: true },
        'intanetto': { kanji: 'インターネット', kana: 'いんたーねっと', meaning: 'internet', jlpt: 'N5', common: true },
        'eiga': { kanji: '映画', kana: 'えいが', meaning: 'movie', jlpt: 'N5', common: true },
        'ongaku': { kanji: '音楽', kana: 'おんがく', meaning: 'music', jlpt: 'N5', common: true },
        'supootsu': { kanji: 'スポーツ', kana: 'すぽーつ', meaning: 'sports', jlpt: 'N5', common: true },
        'geemu': { kanji: 'ゲーム', kana: 'げーむ', meaning: 'game', jlpt: 'N5', common: true },
        'ryokou': { kanji: '旅行', kana: 'りょこう', meaning: 'travel', jlpt: 'N5', common: true },
        'kaimono': { kanji: '買い物', kana: 'かいもの', meaning: 'shopping', jlpt: 'N5', common: true },
        'yasumi': { kanji: '休み', kana: 'やすみ', meaning: 'rest, holiday', jlpt: 'N5', common: true },
        'neru': { kanji: '寝る', kana: 'ねる', meaning: 'to sleep', jlpt: 'N5', common: true },
        'okiru': { kanji: '起きる', kana: 'おきる', meaning: 'to wake up', jlpt: 'N5', common: true },
        'taberu': { kanji: '食べる', kana: 'たべる', meaning: 'to eat', jlpt: 'N5', common: true },
        'nomu': { kanji: '飲む', kana: 'のむ', meaning: 'to drink', jlpt: 'N5', common: true },
        'miru': { kanji: '見る', kana: 'みる', meaning: 'to see, to watch', jlpt: 'N5', common: true },
        'kiku': { kanji: '聞く', kana: 'きく', meaning: 'to hear, to listen', jlpt: 'N5', common: true },
        'yomu': { kanji: '読む', kana: 'よむ', meaning: 'to read', jlpt: 'N5', common: true },
        'kaku': { kanji: '書く', kana: 'かく', meaning: 'to write', jlpt: 'N5', common: true },
        'hanasu': { kanji: '話す', kana: 'はなす', meaning: 'to speak, to talk', jlpt: 'N5', common: true },
        'iku': { kanji: '行く', kana: 'いく', meaning: 'to go', jlpt: 'N5', common: true },
        'kuru': { kanji: '来る', kana: 'くる', meaning: 'to come', jlpt: 'N5', common: true },
        'kaeru': { kanji: '帰る', kana: 'かえる', meaning: 'to return', jlpt: 'N5', common: true },
        'suru': { kanji: 'する', kana: 'する', meaning: 'to do', jlpt: 'N5', common: true },
        'aru': { kanji: 'ある', kana: 'ある', meaning: 'to exist (inanimate)', jlpt: 'N5', common: true },
        'iru': { kanji: 'いる', kana: 'いる', meaning: 'to exist (animate)', jlpt: 'N5', common: true },
        'desu': { kanji: 'です', kana: 'です', meaning: 'is, am, are (polite)', jlpt: 'N5', common: true },
        'masu': { kanji: 'ます', kana: 'ます', meaning: 'polite verb ending', jlpt: 'N5', common: true },
        'deshita': { kanji: 'でした', kana: 'でした', meaning: 'was, were (polite past)', jlpt: 'N5', common: true },
        'mashita': { kanji: 'ました', kana: 'ました', meaning: 'polite verb past ending', jlpt: 'N5', common: true },
        'kudasai': { kanji: 'ください', kana: 'ください', meaning: 'please', jlpt: 'N5', common: true },
        'sumimasen': { kanji: 'すみません', kana: 'すみません', meaning: 'excuse me, sorry', jlpt: 'N5', common: true },
        'gomen': { kanji: 'ごめん', kana: 'ごめん', meaning: 'sorry (casual)', jlpt: 'N5', common: true },
        'douitashimashite': { kanji: 'どういたしまして', kana: 'どういたしまして', meaning: 'you are welcome', jlpt: 'N5', common: true },
        'ohayou': { kanji: 'おはよう', kana: 'おはよう', meaning: 'good morning', jlpt: 'N5', common: true },
        'konnichiwa': { kanji: 'こんにちは', kana: 'こんにちは', meaning: 'hello, good afternoon', jlpt: 'N5', common: true },
        'konbanwa': { kanji: 'こんばんは', kana: 'こんばんは', meaning: 'good evening', jlpt: 'N5', common: true },
        'oyasumi': { kanji: 'おやすみ', kana: 'おやすみ', meaning: 'good night', jlpt: 'N5', common: true },
        'itadakimasu': { kanji: 'いただきます', kana: 'いただきます', meaning: 'let us eat (grace)', jlpt: 'N5', common: true },
        'gochisousama': { kanji: 'ごちそうさま', kana: 'ごちそうさま', meaning: 'thank you for the meal', jlpt: 'N5', common: true },
        'ittekimasu': { kanji: '行ってきます', kana: 'いってきます', meaning: 'I am leaving (see you later)', jlpt: 'N5', common: true },
        'itterasshai': { kanji: '行ってらっしゃい', kana: 'いってらっしゃい', meaning: 'have a good day', jlpt: 'N5', common: true },
        'tadaima': { kanji: 'ただいま', kana: 'ただいま', meaning: 'I am home', jlpt: 'N5', common: true },
        'okaeri': { kanji: 'お帰り', kana: 'おかえり', meaning: 'welcome back', jlpt: 'N5', common: true },
        'genki': { kanji: '元気', kana: 'げんき', meaning: 'healthy, energetic', jlpt: 'N5', common: true },
        'daijoubu': { kanji: '大丈夫', kana: 'だいじょうぶ', meaning: 'okay, alright', jlpt: 'N5', common: true },
        'yokatta': { kanji: 'よかった', kana: 'よかった', meaning: 'that was good, relief', jlpt: 'N5', common: true },
        'zannen': { kanji: '残念', kana: 'ざんねん', meaning: 'regrettable, unfortunate', jlpt: 'N4', common: true },
        'shiawase': { kanji: '幸せ', kana: 'しあわせ', meaning: 'happiness', jlpt: 'N4', common: true },
        'kanashii': { kanji: '悲しい', kana: 'かなしい', meaning: 'sad', jlpt: 'N4', common: true },
        'ureshii': { kanji: '嬉しい', kana: 'うれしい', meaning: 'happy, glad', jlpt: 'N4', common: true },
        'kowai': { kanji: '怖い', kana: 'こわい', meaning: 'scary', jlpt: 'N4', common: true },
        'sugoi': { kanji: '凄い', kana: 'すごい', meaning: 'amazing, terrible', jlpt: 'N4', common: true },
        'kakkouii': { kanji: '格好いい', kana: 'かっこいい', meaning: 'cool, handsome', jlpt: 'N4', common: true },
        'kawaii': { kanji: '可愛い', kana: 'かわいい', meaning: 'cute', jlpt: 'N4', common: true },
        'subarashii': { kanji: '素晴らしい', kana: 'すばらしい', meaning: 'wonderful', jlpt: 'N4', common: true },
        'suki': { kanji: '好き', kana: 'すき', meaning: 'to like', jlpt: 'N4', common: true },
        'kirai': { kanji: '嫌い', kana: 'きらい', meaning: 'to hate, dislike', jlpt: 'N4', common: true },
        'hoshii': { kanji: '欲しい', kana: 'ほしい', meaning: 'to want', jlpt: 'N4', common: true },
        'wakaru': { kanji: '分かる', kana: 'わかる', meaning: 'to understand', jlpt: 'N4', common: true },
        'shiru': { kanji: '知る', kana: 'しる', meaning: 'to know', jlpt: 'N4', common: true },
        'omou': { kanji: '思う', kana: 'おもう', meaning: 'to think', jlpt: 'N4', common: true },
        'kangaeru': { kanji: '考える', kana: 'かんがえる', meaning: 'to consider, think about', jlpt: 'N4', common: true },
        'motsu': { kanji: '持つ', kana: 'もつ', meaning: 'to hold, to possess', jlpt: 'N4', common: true },
        'erabu': { kanji: '選ぶ', kana: 'えらぶ', meaning: 'to choose, select', jlpt: 'N4', common: true },
        'tsukuru': { kanji: '作る', kana: 'つくる', meaning: 'to make, create', jlpt: 'N4', common: true },
        'au': { kanji: '会う', kana: 'あう', meaning: 'to meet', jlpt: 'N4', common: true },
        'matu': { kanji: '待つ', kana: 'まつ', meaning: 'to wait', jlpt: 'N4', common: true },
        'tasukeru': { kanji: '助ける', kana: 'たすける', meaning: 'to help, save', jlpt: 'N4', common: true },
        'tetsudau': { kanji: '手伝う', kana: 'てつだう', meaning: 'to help, assist', jlpt: 'N4', common: true },
        'narau': { kanji: '習う', kana: 'ならう', meaning: 'to learn', jlpt: 'N4', common: true },
        'oshieru': { kanji: '教える', kana: 'おしえる', meaning: 'to teach', jlpt: 'N4', common: true },
        'wasureru': { kanji: '忘れる', kana: 'わすれる', meaning: 'to forget', jlpt: 'N4', common: true },
        'oboeru': { kanji: '覚える', kana: 'おぼえる', meaning: 'to memorize', jlpt: 'N4', common: true },
        'ageru': { kanji: '上げる', kana: 'あげる', meaning: 'to give, to raise', jlpt: 'N4', common: true },
        'morau': { kanji: '貰う', kana: 'もらう', meaning: 'to receive', jlpt: 'N4', common: true },
        'kariru': { kanji: '借りる', kana: 'かりる', meaning: 'to borrow', jlpt: 'N4', common: true },
        'kasu': { kanji: '貸す', kana: 'かす', meaning: 'to lend', jlpt: 'N4', common: true },
        'kaeru': { kanji: '変える', kana: 'かえる', meaning: 'to change', jlpt: 'N4', common: true },
        'narau': { kanji: 'なる', kana: 'なる', meaning: 'to become', jlpt: 'N4', common: true },
        'tsukau': { kanji: '使う', kana: 'つかう', meaning: 'to use', jlpt: 'N4', common: true },
        'ireru': { kanji: '入れる', kana: 'いれる', meaning: 'to put in, insert', jlpt: 'N4', common: true },
        'dasu': { kanji: '出す', kana: 'だす', meaning: 'to take out, put out', jlpt: 'N4', common: true },
        'toru': { kanji: '取る', kana: 'とる', meaning: 'to take', jlpt: 'N4', common: true },
        'hairu': { kanji: '入る', kana: 'はいる', meaning: 'to enter', jlpt: 'N4', common: true },
        'deru': { kanji: '出る', kana: 'でる', meaning: 'to exit, go out', jlpt: 'N4', common: true },
        'kaeru': { kanji: '返る', kana: 'かえる', meaning: 'to return', jlpt: 'N4', common: true },
        'kaesu': { kanji: '返す', kana: 'かえす', meaning: 'to return something', jlpt: 'N4', common: true },
        ' hajimeru': { kanji: '始める', kana: 'はじめる', meaning: 'to start, begin', jlpt: 'N4', common: true },
        'owaru': { kanji: '終わる', kana: 'おわる', meaning: 'to end, finish', jlpt: 'N4', common: true },
        'tsuzuku': { kanji: '続く', kana: 'つづく', meaning: 'to continue', jlpt: 'N4', common: true },
        'yameru': { kanji: '止める', kana: 'やめる', meaning: 'to stop, quit', jlpt: 'N4', common: true },
        'mieru': { kanji: '見える', kana: 'みえる', meaning: 'to be visible', jlpt: 'N4', common: true },
        'kikoeru': { kanji: '聞こえる', kana: 'きこえる', meaning: 'to be audible', jlpt: 'N4', common: true },
        'dekiru': { kanji: 'できる', kana: 'できる', meaning: 'to be able to, can', jlpt: 'N4', common: true },
    },

    async search(query) {
        const normalizedQuery = query.toLowerCase().trim();
        
        // Check local dictionary first for instant results
        const localWord = this.COMMON_WORDS[normalizedQuery];
        if (localWord) {
            return this.buildFromLocal(localWord, query);
        }

        const jishoUrl = this.JISHO + encodeURIComponent(query);
        for (const proxy of this.PROXIES) {
            try {
                const r = await fetch(proxy + encodeURIComponent(jishoUrl));
                if (!r.ok) continue;
                const data = await r.json();
                if (data.data?.length) return this.parse(data.data[0], query);
            } catch { /* try next proxy */ }
        }
        // All proxies failed — fall back to Jotoba (direct API, no proxy needed)
        return await this.tryJotoba(query);
    },

    buildFromLocal(local, query) {
        const displayWord = local.kanji || local.kana || query;
        const diff = local.jlpt || 'N5';
        return {
            word: displayWord,
            nativeScript: displayWord,
            romaji: query,
            kana: local.kana,
            pronunciation: local.kana || displayWord,
            partOfSpeech: 'word',
            meaning: local.meaning,
            allMeanings: [local.meaning],
            example: `${displayWord} (${local.kana}) — ${local.meaning}`,
            synonyms: [], antonyms: [], relatedWords: [],
            popularity: local.common ? '★★★★★' : '★★★★☆',
            language: 'ja',
            contextExamples: { 
                formal: local.meaning, 
                casual: `${local.kana} — ${local.meaning}`, 
                academic: local.meaning 
            },
            wordRelationships: { synonyms: [], antonyms: [], wordFamily: [] },
            wordInsights: {
                difficulty: `JLPT ${diff}`,
                frequency: local.common ? 'Very Common' : 'Common',
                etymology: 'Japanese',
                partOfSpeech: 'Japanese word'
            },
            isJapanese: true,
            jlptLevel: diff
        };
    },

    async tryJotoba(query) {
        try {
            const r = await fetch('https://jotoba.de/api/search/words', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, language: 'English', no_english: false })
            });
            if (!r.ok) return null;
            const data = await r.json();
            if (!data.words?.length) return null;
            const w = data.words[0];
            const kanji = w.reading?.kanji || '';
            const kana  = w.reading?.kana  || '';
            const sense = w.senses?.[0] || {};
            const glosses = sense.glosses || ['No definition'];
            const partsOfSpeech = sense.parts_of_speech || [];
            return this._build(kanji, kana, query, glosses, [glosses.join(', ')], false, '', partsOfSpeech);
        } catch { return null; }
    },

    parse(entry, query) {
        const jp      = entry.japanese?.[0] || {};
        const kanji   = jp.word    || '';
        const kana    = jp.reading || '';
        const senses  = entry.senses || [];
        const sense   = senses[0]  || {};
        const glosses = sense.english_definitions || ['No definition'];
        const partsOfSpeech = sense.parts_of_speech || [];
        
        // Extract all meanings with POS
        const allMeanings = senses.slice(0, 4).map(s => {
            const pos = (s.parts_of_speech || [])[0] || '';
            const def = s.english_definitions.join(', ');
            return pos ? `(${pos}) ${def}` : def;
        });

        // Extract JLPT levels (can be multiple)
        const jlptLevels = entry.jlpt || [];
        const jlptDisplay = jlptLevels.length > 0 
            ? jlptLevels.map(j => j.replace('jlpt-', '').toUpperCase()).join(', ')
            : '';

        // Extract example sentences if available
        const exampleSentences = [];
        if (entry.japanese?.[0]?.sentences) {
            entry.japanese[0].sentences.slice(0, 3).forEach(s => {
                if (s.japanese && s.english) {
                    exampleSentences.push({
                        japanese: s.japanese,
                        english: s.english
                    });
                }
            });
        }

        // Extract word forms/inflections
        const wordForms = [];
        if (entry.japanese) {
            entry.japanese.forEach(j => {
                if (j.word && j.reading && (j.word !== kanji || j.reading !== kana)) {
                    wordForms.push({ kanji: j.word, kana: j.reading });
                }
            });
        }

        const common  = !!entry.is_common;
        return this._build(kanji, kana, query, glosses, allMeanings, common, jlptDisplay, partsOfSpeech, exampleSentences, wordForms);
    },

    _build(kanji, kana, query, glosses, allMeanings, isCommon, jlpt, partsOfSpeech = [], exampleSentences = [], wordForms = []) {
        const displayWord = kanji || kana || query;
        const pos = partsOfSpeech[0] || 'word';
        
        // Calculate difficulty based on JLPT or kanji complexity
        let diff;
        if (jlpt) {
            diff = `JLPT ${jlpt}`;
        } else if (!kanji) {
            diff = 'Beginner (N5)';
        } else if (kanji.length <= 2) {
            diff = 'Intermediate (N4)';
        } else if (kanji.length <= 4) {
            diff = 'Advanced (N3)';
        } else {
            diff = 'Expert (N2-N1)';
        }

        // Build example from API examples or fallback
        let example;
        if (exampleSentences.length > 0) {
            const ex = exampleSentences[0];
            example = `${ex.japanese} — ${ex.english}`;
        } else {
            example = kana ? `${displayWord} (${kana}) — ${glosses[0]}` : `${displayWord} — ${glosses[0]}`;
        }

        return {
            word: displayWord,
            nativeScript: displayWord,
            romaji: query,
            kana,
            pronunciation: kana || displayWord,
            partOfSpeech: pos,
            meaning: glosses.join('; '),
            allMeanings,
            example,
            exampleSentences,
            wordForms,
            synonyms: [], antonyms: [], relatedWords: [],
            popularity: isCommon ? '★★★★★' : '★★★★☆',
            language: 'ja',
            contextExamples: { 
                formal: glosses[0] || '', 
                casual: kana || query, 
                academic: glosses.join('; ') 
            },
            wordRelationships: { synonyms: [], antonyms: [], wordFamily: wordForms.map(f => f.kanji || f.kana) },
            wordInsights: {
                difficulty: diff,
                frequency: isCommon ? 'Very Common' : 'Common',
                etymology: 'Japanese',
                partOfSpeech: pos
            },
            isJapanese: true,
            jlptLevel: jlpt
        };
    }
};

// ========================
// Datamuse API
// ========================
const Datamuse = {
    BASE: 'https://api.datamuse.com/words',

    async _get(params) {
        try {
            const r = await fetch(`${this.BASE}?${params}`);
            return r.ok ? (await r.json()) : [];
        } catch { return []; }
    },

    async getSynonyms(word) {
        const d = await this._get(`rel_syn=${encodeURIComponent(word)}&max=8`);
        return d.map(w => w.word);
    },

    async getAntonyms(word) {
        const d = await this._get(`rel_ant=${encodeURIComponent(word)}&max=6`);
        return d.map(w => w.word);
    },

    async getRelated(word) {
        const d = await this._get(`rel_trg=${encodeURIComponent(word)}&max=8`);
        return d.map(w => w.word);
    },

    async getSuggestions(word) {
        const d = await this._get(`sp=${encodeURIComponent(word)}&max=6`);
        return d.map(w => w.word).filter(w => w !== word.toLowerCase());
    },

    async getFrequency(word) {
        const d = await this._get(`sp=${encodeURIComponent(word)}&md=f&max=1`);
        const tag = d[0]?.tags?.find(t => t.startsWith('f:'));
        return tag ? parseFloat(tag.slice(2)) : null;
    },

    freqToLabel(f) {
        if (f === null || f === undefined) return 'Unknown';
        if (f >= 50) return 'Very Common';
        if (f >= 10) return 'Common';
        if (f >= 2)  return 'Uncommon';
        return 'Rare';
    },

    freqToStars(f) {
        if (f === null || f === undefined) return '★★★☆☆';
        if (f >= 50) return '★★★★★';
        if (f >= 20) return '★★★★☆';
        if (f >= 10) return '★★★☆☆';
        if (f >= 2)  return '★★☆☆☆';
        return '★☆☆☆☆';
    }
};

// ========================
// API Module
// ========================
const API = {
    BASE_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
    LANGUAGE_URLS: {
        en: 'https://api.dictionaryapi.dev/api/v2/entries/en/',
        hi: 'https://api.dictionaryapi.dev/api/v2/entries/hi/',
        fr: 'https://api.dictionaryapi.dev/api/v2/entries/fr/',
        es: 'https://api.dictionaryapi.dev/api/v2/entries/es/',
        de: 'https://api.dictionaryapi.dev/api/v2/entries/de/',
        ja: null  // handled by JishoAPI
    },
    MYMEMORY_URL: 'https://api.mymemory.translated.net/get',
    LANG_NAMES:  { en:'English', hi:'Hindi', fr:'French', es:'Spanish', de:'German', ja:'Japanese' },
    LANG_VOICES: { en:'en-US',   hi:'hi-IN', fr:'fr-FR', es:'es-ES',   de:'de-DE', ja:'ja-JP'   },

    async searchWord(word, language = 'en') {

        // ── JAPANESE ── (Jisho API via CORS proxy, handles romaji/kana/kanji)
        if (language === 'ja') {
            return await JishoAPI.search(word);
        }

        // ── HINDI ── (3-step: local dict → dict API → Google transliterate + MyMemory)
        if (language === 'hi') {
            const isRoman = !HindiUtils.isDevanagari(word);
            const key = word.toLowerCase().trim();

            // Step 1: instant local dictionary lookup (common words)
            if (isRoman && HindiUtils.DICT[key]) {
                const [meaning, devanagari] = HindiUtils.DICT[key].split('|');
                return {
                    word: devanagari,
                    nativeScript: devanagari,
                    pronunciation: devanagari,
                    partOfSpeech: 'word',
                    meaning,
                    example: `"${devanagari}" (${word}) — ${meaning}`,
                    synonyms: [], antonyms: [], relatedWords: [],
                    popularity: '★★★★☆',
                    romanizationMeta: { original: word, devanagari },
                    contextExamples: { formal: devanagari, casual: word, academic: devanagari },
                    wordRelationships: { synonyms: [], antonyms: [], wordFamily: [] },
                    wordInsights: { difficulty: 'Common', frequency: 'Common', etymology: 'Hindi word', partOfSpeech: 'word' }
                };
            }

            // Step 2: try Free Dictionary Hindi endpoint (works for Devanagari input)
            const searchTerm = isRoman ? word : word;
            try {
                const r = await fetch(`${this.LANGUAGE_URLS.hi}${encodeURIComponent(searchTerm)}`);
                if (r.ok) {
                    const result = this.parseWordData(await r.json());
                    if (isRoman) result.romanizationMeta = { original: word, devanagari: word };
                    return result;
                }
            } catch {}

            // Step 3: Google Input Tools → get real Devanagari script
            let devanagari = null;
            if (isRoman) {
                devanagari = await HindiUtils.getDevanagari(word);
            }
            const searchWord = devanagari || word;

            // Helper to build the result object so we don't repeat it below
            const buildResult = (translation) => ({
                word: devanagari || word,
                nativeScript: devanagari || word,
                pronunciation: devanagari || word,
                partOfSpeech: 'word',
                meaning: translation,
                example: devanagari
                    ? `"${devanagari}" (${word}) — ${translation}`
                    : `"${word}" — ${translation}`,
                synonyms: [], antonyms: [], relatedWords: [],
                popularity: '★★★☆☆',
                romanizationMeta: isRoman ? { original: word, devanagari: devanagari || word } : null,
                contextExamples: { formal: devanagari || word, casual: word, academic: devanagari || word },
                wordRelationships: { synonyms: [], antonyms: [], wordFamily: [] },
                wordInsights: { difficulty: 'N/A', frequency: 'N/A', etymology: 'Hindi word', partOfSpeech: 'word' }
            });

            const isGood = (t) => t &&
                t.toLowerCase() !== word.toLowerCase() &&
                t.toLowerCase() !== searchWord.toLowerCase() &&
                !t.toLowerCase().includes('mymemory') &&
                !t.toLowerCase().includes('quota');

            // Step 4a: Google Translate unofficial API — handles both Roman and Devanagari naturally.
            // We fire two requests in parallel: one with auto-detect (good for Roman script like
            // "pyaar", "namaste") and one forcing Hindi source (good for Devanagari).
            try {
                const [tAuto, tHi] = await Promise.all([
                    this.googleTranslate(word, 'auto'),       // Roman input, auto-detect → usually detects Hindi
                    this.googleTranslate(searchWord, 'hi'),   // Devanagari (or Roman) with forced Hindi
                ]);
                const best = [tAuto, tHi].find(isGood);
                if (best) return buildResult(best);
            } catch {}

            // Step 4b: MyMemory fallback — works well with Devanagari input
            try {
                const res = await fetch(`${this.MYMEMORY_URL}?q=${encodeURIComponent(searchWord)}&langpair=hi|en`);
                if (res.ok) {
                    const data = await res.json();
                    const translation = data?.responseData?.translatedText;
                    if (isGood(translation)) return buildResult(translation);
                }
            } catch {}

            // Step 4c: Last resort — MyMemory with the raw Roman word
            if (isRoman) {
                try {
                    const res = await fetch(`${this.MYMEMORY_URL}?q=${encodeURIComponent(word)}&langpair=hi|en`);
                    if (res.ok) {
                        const data = await res.json();
                        const translation = data?.responseData?.translatedText;
                        if (isGood(translation)) return buildResult(translation);
                    }
                } catch {}
            }

            return null;
        }

        // ── ENGLISH (+ Datamuse enrichment) ──
        if (language === 'en') {
            try {
                const r = await fetch(`${this.BASE_URL}${encodeURIComponent(word)}`);
                if (r.ok) {
                    const result = this.parseWordData(await r.json());
                    // Fire all Datamuse calls in parallel
                    const [syns, ants, related, freq] = await Promise.all([
                        Datamuse.getSynonyms(word),
                        Datamuse.getAntonyms(word),
                        Datamuse.getRelated(word),
                        Datamuse.getFrequency(word)
                    ]);
                    if (syns.length > result.synonyms.length) result.synonyms = syns;
                    result.antonyms     = ants;
                    result.relatedWords = related;
                    result.popularity   = Datamuse.freqToStars(freq);
                    result.wordInsights.frequency = Datamuse.freqToLabel(freq);
                    if (result.wordRelationships) result.wordRelationships.antonyms = ants;
                    return result;
                }
            } catch (e) { console.error('Dict API:', e); }
            return null;
        }

        // ── EUROPEAN LANGUAGES (French, Spanish, German) ──
        const url = this.LANGUAGE_URLS[language];
        if (url) {
            try {
                const r = await fetch(`${url}${encodeURIComponent(word)}`);
                if (r.ok) return this.parseWordData(await r.json());
            } catch {}
        }
        return await this.translateWord(word, language);
    },

    // Unofficial Google Translate endpoint — free, no API key, handles Roman Hindi natively.
    // sl: source language code ('auto' for auto-detect, 'hi' for Hindi, etc.)
    async googleTranslate(word, sl = 'auto') {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=en&dt=t&q=${encodeURIComponent(word)}`;
            const r = await fetch(url);
            if (!r.ok) return null;
            const data = await r.json();
            const translation = data?.[0]?.[0]?.[0];
            if (translation && translation.toLowerCase() !== word.toLowerCase()) return translation;
        } catch {}
        return null;
    },

    async translateWord(word, language) {
        try {
            const langName = this.LANG_NAMES[language] || language;
            const res = await fetch(`${this.MYMEMORY_URL}?q=${encodeURIComponent(word)}&langpair=${language}|en`);
            if (!res.ok) return null;
            const data = await res.json();
            if (data.responseStatus !== 200 && data.responseStatus !== '200') return null;
            const translation = data.responseData.translatedText;
            if (!translation || translation.toLowerCase().includes('mymemory warning')) return null;
            return {
                word,
                pronunciation: '',
                partOfSpeech: 'word',
                meaning: translation,
                example: `"${word}" means "${translation}" in ${langName}`,
                synonyms: [],
                antonyms: [],
                relatedWords: [],
                popularity: this.calculatePopularity(word),
                contextExamples: { formal: word, casual: word, academic: word },
                wordRelationships: { synonyms: [], antonyms: [], wordFamily: [word] },
                wordInsights: {
                    difficulty: this.calculateDifficulty(word),
                    frequency: 'N/A',
                    etymology: `${langName} word`,
                    partOfSpeech: 'word'
                }
            };
        } catch (e) { console.error('MyMemory:', e); return null; }
    },

    parseWordData(data) {
        const entry    = data[0];
        const word     = entry.word;
        const phonetic = entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '';
        const meanings = entry.meanings[0];
        const defs     = meanings.definitions || [];
        
        // Extract multiple definitions/meanings
        const allDefinitions = defs.slice(0, 5).map(d => ({
            definition: d.definition,
            example: d.example,
            synonyms: d.synonyms || []
        }));

        // Extract etymology if available
        const etymology = entry.etymologies?.[0] || this.generateEtymology(word);

        return {
            word,
            pronunciation: phonetic,
            partOfSpeech:  meanings.partOfSpeech,
            meaning:       defs[0]?.definition || 'No definition available',
            allDefinitions,
            example:       defs[0]?.example    || '',
            synonyms:      meanings.synonyms?.slice(0, 8)  || [],
            antonyms:      meanings.antonyms?.slice(0, 6)  || [],
            relatedWords:  [],
            popularity:    this.calculatePopularity(word),
            contextExamples: {
                formal:   defs[0]?.example || word,
                casual:   defs[1]?.example || word,
                academic: defs[2]?.example || word
            },
            wordRelationships: {
                synonyms:   meanings.synonyms?.slice(0, 5) || [],
                antonyms:   meanings.antonyms?.slice(0, 4) || [],
                wordFamily: this.extractWordFamily(entry)
            },
            wordInsights: {
                difficulty: this.calculateDifficulty(word),
                frequency:  'Loading…',
                etymology:  etymology,
                partOfSpeech: meanings.partOfSpeech,
                alternateMeanings: allDefinitions.slice(1).map(d => d.definition)
            }
        };
    },

    extractWordFamily(entry) {
        const family = [];
        // Extract related words from the API if available
        if (entry.meanings) {
            entry.meanings.forEach(m => {
                if (m.synonyms) family.push(...m.synonyms.slice(0, 3));
            });
        }
        return [...new Set(family)].slice(0, 8);
    },

    calculatePopularity(word) {
        const common = ['the','be','to','of','and','a','in','that','have','i','it','for','not','on','with'];
        const w = word.toLowerCase();
        if (common.includes(w)) return '★★★★★';
        if (w.length <= 4)  return '★★★★☆';
        if (w.length <= 7)  return '★★★☆☆';
        if (w.length <= 11) return '★★☆☆☆';
        return '★☆☆☆☆';
    },

    calculateDifficulty(word) {
        if (word.length <= 4)  return 'Beginner';
        if (word.length <= 7)  return 'Intermediate';
        if (word.length <= 11) return 'Advanced';
        return 'Expert';
    },

    // BUG FIX: improved etymology heuristics
    generateEtymology(word) {
        const w = word.toLowerCase();
        if (w.endsWith('tion') || w.endsWith('sion') || w.endsWith('ment') || w.endsWith('ance') || w.endsWith('ence'))
            return 'Latin / Old French origin';
        if (w.startsWith('ph') || w.endsWith('logy') || w.endsWith('graphy') || w.endsWith('ism') || w.endsWith('phy'))
            return 'Greek origin';
        if (w.endsWith('que') || w.endsWith('eur') || w.endsWith('ois') || w.endsWith('ette'))
            return 'French origin';
        if (w.endsWith('schaft') || w.endsWith('heit') || w.endsWith('ung') || w.endsWith('keit'))
            return 'Germanic origin';
        if (w.endsWith('ka') || w.endsWith('ski') || w.endsWith('ov'))
            return 'Slavic origin';
        if (w.endsWith('ito') || w.endsWith('ita') || w.endsWith('ello'))
            return 'Italian/Spanish origin';
        if (w.endsWith('san') || w.endsWith('maru') || w.endsWith('ko'))
            return 'Japanese origin';
        return 'Old English / Proto-Germanic origin';
    },

    // BUG FIX: proper star count using regex instead of split
    calculateFrequency(word) {
        const popularity = this.calculatePopularity(word);
        const stars = (popularity.match(/★/g) || []).length;
        if (stars >= 4) return 'Very Common';
        if (stars >= 3) return 'Common';
        if (stars >= 2) return 'Uncommon';
        return 'Rare';
    }
};

// =====================
// Utility Module
// =====================
const Utils = {
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notificationText');
        
        notification.className = `notification ${type}`;
        notificationText.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 3000);
    },

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    playSound(type) {
        const settings = Storage.getSettings();
        if (!settings.sound) return;

        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'success') {
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
        } else if (type === 'error') {
            oscillator.frequency.value = 196.00; // G3
            oscillator.type = 'square';
            gainNode.gain.value = 0.1;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 300);
        } else if (type === 'click') {
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.05;
            oscillator.start();
            setTimeout(() => oscillator.stop(), 50);
        }
    }
};

// =====================
// Navigation Module
// =====================
const Navigation = {
    init() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navLinksContainer = document.querySelector('.nav-links');
        this.languageSelect = document.getElementById('languageSelect');

        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        this.navToggle.addEventListener('click', () => this.toggleMobileNav());

        // Language selector
        this.languageSelect.value = Storage.getCurrentLanguage();
        this.languageSelect.addEventListener('change', (e) => this.handleLanguageChange(e));

        // Handle initial hash
        this.handleInitialHash();
        window.addEventListener('hashchange', () => this.handleHashChange());
    },

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        this.navigateTo(targetId);
    },

    handleInitialHash() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.navigateTo(hash);
        }
    },

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.navigateTo(hash);
        }
    },

    handleLanguageChange(e) {
        const newLanguage = e.target.value;
        Storage.setCurrentLanguage(newLanguage);
        Utils.showNotification(`Language switched to ${e.target.options[e.target.selectedIndex].text}`);
        
        // Refresh all sections
        this.refreshSectionData('home');
        this.refreshSectionData('vocabulary');
        this.refreshSectionData('flashcards');
        this.refreshSectionData('quiz');
        this.refreshSectionData('statistics');
    },

    navigateTo(sectionId) {
        // Update nav links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Update sections
        this.sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        // Close mobile nav
        this.navLinksContainer.classList.remove('active');

        // Refresh section data
        this.refreshSectionData(sectionId);
    },

    toggleMobileNav() {
        this.navLinksContainer.classList.toggle('active');
    },

    refreshSectionData(sectionId) {
        switch (sectionId) {
            case 'home':
                Home.update();
                break;
            case 'vocabulary':
                Vocabulary.render();
                break;
            case 'flashcards':
                Flashcards.refresh(); // FIX: was Flashcards.init() — caused duplicate event listeners
                break;
            case 'quiz':
                Quiz.checkUnlock();
                break;
            case 'statistics':
                Statistics.update();
                break;
        }
    }
};

// =====================
// Search Module
// =====================
const Search = {
    currentWordData: null,

    init() {
        this.searchInput      = document.getElementById('searchInput');
        this.searchBtn        = document.getElementById('searchBtn');
        this.searchResults    = document.getElementById('searchResults');
        this.searchHistoryList = document.getElementById('searchHistoryList');
        this.searchHistory    = document.getElementById('searchHistory');
        this.romanHint        = document.getElementById('romanizationHint');
        this.hintScript       = document.getElementById('hintScript');

        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        const micBtn = document.getElementById('micBtn');
        if (micBtn) micBtn.addEventListener('click', () => this.startVoiceSearch());

        // Event delegation for history items — safely handles apostrophes via data attribute
        this.searchHistoryList.addEventListener('click', (e) => {
            const item = e.target.closest('.search-history-item');
            if (item) this.searchFromHistory(item.dataset.term);
        });

        this.renderSearchHistory();
    },

    async handleSearch() {
        const word = this.searchInput.value.trim();
        if (!word) { Utils.showNotification('Please enter a word', 'error'); return; }

        Storage.addSearchHistory(word);
        this.renderSearchHistory();

        this.searchBtn.disabled = true;
        this.searchBtn.textContent = 'Searching…';

        const lang = Storage.getCurrentLanguage();

        // ── Script-detection hint ──
        if (lang === 'hi' && !HindiUtils.isDevanagari(word)) {
            const deva = HindiUtils.romanToDevanagari(word);
            if (this.hintScript) this.hintScript.textContent = `"${word}" → ${deva} (Hindi)`;
            if (this.romanHint)  this.romanHint.classList.remove('hidden');
        } else if (lang === 'ja' && !HindiUtils.isJapanesePossible(word)) {
            if (this.hintScript) this.hintScript.textContent = `"${word}" (romaji → Japanese)`;
            if (this.romanHint)  this.romanHint.classList.remove('hidden');
        } else {
            if (this.romanHint) this.romanHint.classList.add('hidden');
        }

        const wordData = await API.searchWord(word, lang);

        this.searchBtn.disabled = false;
        this.searchBtn.textContent = 'Search';

        if (wordData) {
            this.displayResult(wordData);
            Storage.addXP(1);
            XPSystem.updateDisplay();
            DailyChallengeSystem.updateProgress('search');
        } else {
            // Show spelling suggestions for English failures
            let suggestions = [];
            if (lang === 'en') suggestions = await Datamuse.getSuggestions(word);
            this.displayError(word, suggestions);
        }
    },

    displayResult(wordData) {
        this.currentWordData = wordData;
        const lang = Storage.getCurrentLanguage();

        // ── Romanization badge (Hindi Roman input) ──
        const romanMeta = wordData.romanizationMeta;
        const romanBadge = romanMeta
            ? `<div class="script-badge">🔤 Roman: <strong>${romanMeta.original}</strong> → <span class="native-script">${romanMeta.devanagari}</span></div>`
            : '';

        // ── Japanese kana badge ──
        const kanaBadge = wordData.isJapanese && wordData.kana
            ? `<div class="script-badge">🔤 Romaji: <strong>${wordData.romaji}</strong> → <span class="native-script">${wordData.kana}</span></div>`
            : '';

        // ── Multiple meanings (Japanese) ──
        const allMeaningsHtml = wordData.allMeanings?.length > 1
            ? `<div class="all-meanings">${wordData.allMeanings.map((m, i) =>
                `<div class="meaning-row"><span class="meaning-num">${i + 1}.</span> ${m}</div>`
              ).join('')}</div>`
            : '';

        // ── Example ──
        const exampleHtml = wordData.example
            ? `<div class="result-example"><span class="eq">❝</span>${wordData.example}<span class="eq">❞</span></div>`
            : '';

        // ── Synonyms, Antonyms, Related ──
        const synonymsHtml = wordData.synonyms?.length
            ? `<div class="result-section"><span class="sbadge syn-badge">Synonyms</span>${wordData.synonyms.slice(0, 6).map(s =>
                `<span class="tag-chip" data-word="${s}">${s}</span>`).join('')}</div>` : '';

        const antonymsHtml = wordData.antonyms?.length
            ? `<div class="result-section"><span class="sbadge ant-badge">Antonyms</span>${wordData.antonyms.slice(0, 5).map(s =>
                `<span class="tag-chip ant-chip" data-word="${s}">${s}</span>`).join('')}</div>` : '';

        const relatedHtml = wordData.relatedWords?.length
            ? `<div class="result-section"><span class="sbadge rel-badge">Related</span>${wordData.relatedWords.slice(0, 6).map(s =>
                `<span class="tag-chip rel-chip" data-word="${s}">${s}</span>`).join('')}</div>` : '';

        // ── Word Insights ──
        const insightsHtml = wordData.wordInsights ? `
            <div class="word-insights-row">
                <span class="insight-pill">📊 ${wordData.wordInsights.difficulty}</span>
                <span class="insight-pill">📡 ${wordData.wordInsights.frequency}</span>
                <span class="insight-pill">🌐 ${wordData.wordInsights.etymology}</span>
            </div>` : '';

        const html = `
            <div class="result-card">
                ${romanBadge}${kanaBadge}
                <div class="result-header">
                    <div class="result-word-group">
                        <span class="result-word">${wordData.word}</span>
                        <button class="pronunciation-btn" id="pronounceBtn" title="Pronounce">🔊</button>
                    </div>
                    <div class="result-meta-col">
                        <span class="result-phonetic">${wordData.isJapanese ? (wordData.kana || '') : (wordData.pronunciation || '')}</span>
                        <span class="result-pos">${wordData.partOfSpeech}</span>
                        <span class="result-popularity">${wordData.popularity}</span>
                    </div>
                </div>
                <div class="result-meaning">${wordData.meaning}</div>
                ${allMeaningsHtml}
                ${exampleHtml}
                ${synonymsHtml}
                ${antonymsHtml}
                ${relatedHtml}
                ${insightsHtml}
                <div class="result-actions">
                    <button class="btn btn-primary" id="saveWordBtn">💾 Save Word</button>
                </div>
            </div>
        `;

        this.searchResults.innerHTML = html;

        // Listeners attached after render (no onclick encoding needed)
        document.getElementById('saveWordBtn')
            ?.addEventListener('click', () => this.saveWord());

        document.getElementById('pronounceBtn')
            ?.addEventListener('click', () => {
                // BUG FIX: Never pass IPA text like /ˈlæptɒp/ to TTS — it reads the symbols literally.
                // For Japanese: speak kana (the phonetic reading, not the kanji).
                // For all others: speak the plain word — the browser TTS handles pronunciation correctly.
                const speakText = wordData.isJapanese
                    ? (wordData.kana || wordData.nativeScript || wordData.word)
                    : wordData.word;
                this.playPronunciation(speakText, lang);
            });

        // Clicking a synonym/antonym/related chip searches it
        this.searchResults.querySelectorAll('.tag-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const w = chip.dataset.word;
                if (w) { this.searchInput.value = w; this.handleSearch(); }
            });
        });
    },

    displayError(word = '', suggestions = []) {
        const suggestHtml = suggestions.length
            ? `<div class="suggestions-box">
                 <p>Did you mean:</p>
                 <div class="suggestion-chips">
                     ${suggestions.map(s => `<span class="suggestion-chip" data-word="${s}">${s}</span>`).join('')}
                 </div>
               </div>`
            : '<p>Check the spelling or try a different word.</p>';

        this.searchResults.innerHTML = `
            <div class="error-card">
                <div class="error-icon">🔍</div>
                <h3>No results for "<em>${word}</em>"</h3>
                ${suggestHtml}
            </div>
        `;

        this.searchResults.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                this.searchInput.value = chip.dataset.word;
                this.handleSearch();
            });
        });
    },

    saveWord() {
        const wordData = this.currentWordData;
        if (!wordData) { Utils.showNotification('No word to save', 'error'); return; }

        if (Storage.addWord(wordData)) {
            Utils.showNotification('Word saved! ✓');
            Utils.playSound('success');
            const btn = document.getElementById('saveWordBtn');
            if (btn) { btn.textContent = '✓ Saved'; btn.disabled = true; }
            Storage.addXP(3);
            XPSystem.updateDisplay();
            AchievementsSystem.checkAchievements();
            DailyChallengeSystem.updateProgress('save');
            Statistics.update();
        } else {
            Utils.showNotification('Already saved!', 'error');
        }
    },

    renderSearchHistory() {
        const history = Storage.getSearchHistory();
        if (history.length === 0) { this.searchHistory.classList.add('hidden'); return; }
        this.searchHistory.classList.remove('hidden');
        this.searchHistoryList.innerHTML = history.slice(0, 10).map(term =>
            `<span class="search-history-item" data-term="${term.replace(/"/g, '&quot;')}">${term}</span>`
        ).join('');
    },

    searchFromHistory(term) {
        this.searchInput.value = term;
        this.handleSearch();
    },

    playPronunciation(word, lang = 'en') {
        if (!('speechSynthesis' in window)) {
            Utils.showNotification('Speech not supported in this browser', 'error');
            return;
        }
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang  = API.LANG_VOICES[lang] || 'en-US';
        utterance.rate  = lang === 'ja' ? 0.6 : 0.75;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    },

    startVoiceSearch() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            Utils.showNotification('Voice search not supported in this browser', 'error');
            return;
        }
        const micBtn = document.getElementById('micBtn');
        const lang   = Storage.getCurrentLanguage();
        const recognition = new SR();
        recognition.lang = API.LANG_VOICES[lang] || 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart  = () => {
            micBtn?.classList.add('listening');
            Utils.showNotification('🎤 Listening — speak now…');
        };
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            this.searchInput.value = text;
            this.handleSearch();
        };
        recognition.onerror  = () => {
            micBtn?.classList.remove('listening');
            Utils.showNotification('Voice search failed', 'error');
        };
        recognition.onend    = () => micBtn?.classList.remove('listening');
        recognition.start();
    }
};

// =====================
// Vocabulary Module
// =====================
const Vocabulary = {
    STARTER_WORDS: {
        en: ['serendipity', 'ephemeral', 'eloquent', 'resilient', 'ubiquitous'],
        hi: ['pyaar', 'dil', 'zindagi', 'khushi', 'sach'],
        fr: ['bonjour', 'amour', 'liberté', 'éphémère', 'résilient'],
        es: ['hola', 'amor', 'libertad', 'efímero', 'resiliente'],
        de: ['hallo', 'liebe', 'freiheit', 'vergänglich', 'widerstandsfähig'],
        ja: ['neko', 'sakura', 'arigatou', 'konnichiwa', 'genki']
    },

    init() {
        this.vocabSearch = document.getElementById('vocabSearch');
        this.sortSelect = document.getElementById('sortSelect');
        this.vocabularyList = document.getElementById('vocabularyList');
        this.emptyVocabulary = document.getElementById('emptyVocabulary');
        this.starterWordsEl = document.getElementById('starterWords');

        this.vocabSearch.addEventListener('input', () => this.render());
        this.sortSelect.addEventListener('change', () => this.render());
    },

    render() {
        let vocabulary = Storage.getVocabulary();
        const searchTerm = this.vocabSearch.value.toLowerCase();
        const sortBy = this.sortSelect.value;

        // Filter by search term
        if (searchTerm) {
            vocabulary = vocabulary.filter(word => 
                word.word.toLowerCase().includes(searchTerm) ||
                word.meaning.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        switch (sortBy) {
            case 'az':
                vocabulary.sort((a, b) => a.word.localeCompare(b.word));
                break;
            case 'za':
                vocabulary.sort((a, b) => b.word.localeCompare(a.word));
                break;
            case 'newest':
                vocabulary.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'oldest':
                vocabulary.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
                break;
        }

        // Display
        if (vocabulary.length === 0) {
            this.vocabularyList.innerHTML = '';
            this.emptyVocabulary.classList.remove('hidden');
            this.renderStarterWords();
        } else {
            this.emptyVocabulary.classList.add('hidden');
            this.vocabularyList.innerHTML = vocabulary.map(word => this.createWordCard(word)).join('');
        }
    },

    renderStarterWords() {
        const lang = Storage.getCurrentLanguage();
        const words = this.STARTER_WORDS[lang] || this.STARTER_WORDS.en;
        this.starterWordsEl.innerHTML = words.map(word => 
            `<span class="starter-chip" data-word="${word}">${word}</span>`
        ).join('');

        // Add click handlers
        this.starterWordsEl.querySelectorAll('.starter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const word = chip.dataset.word;
                // Switch to search section and search the word
                Navigation.navigateTo('search');
                Search.searchInput.value = word;
                Search.handleSearch();
            });
        });
    },

    createWordCard(word) {
        const learnedClass = word.learned ? 'learned' : '';
        const learnedBadge = word.learned ? '<div class="learned-badge">✓ Learned</div>' : '';
        const favoriteStar = word.favorite ? '⭐' : '☆';
        const popularityHtml = `<div class="vocab-popularity">${word.popularity}</div>`;

        return `
            <div class="vocab-card ${learnedClass}" data-id="${word.id}">
                ${learnedBadge}
                <div class="vocab-header">
                    <div class="vocab-word">${word.word} <span class="favorite-star" onclick="Vocabulary.toggleFavorite(${word.id})">${favoriteStar}</span></div>
                    <div class="vocab-date">${Utils.formatDate(word.dateAdded)}</div>
                </div>
                ${popularityHtml}
                <div class="vocab-meaning">${word.meaning}</div>
                <div class="vocab-example">"${word.example}"</div>
                <div class="vocab-actions">
                    <button class="btn btn-secondary" onclick="Vocabulary.toggleLearned(${word.id})">
                        ${word.learned ? 'Mark as Not Learned' : 'Mark as Learned'}
                    </button>
                    <button class="btn btn-secondary" onclick="Vocabulary.deleteWord(${word.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    },

    toggleLearned(wordId) {
        const vocabulary = Storage.getVocabulary();
        const word = vocabulary.find(w => w.id === wordId);
        
        if (word) {
            Storage.updateWord(wordId, { learned: !word.learned });
            this.render();
            Statistics.update();
            Utils.showNotification(word.learned ? 'Word marked as not learned' : 'Word marked as learned');
        }
    },

    toggleFavorite(wordId) {
        const vocabulary = Storage.getVocabulary();
        const word = vocabulary.find(w => w.id === wordId);
        
        if (word) {
            Storage.updateWord(wordId, { favorite: !word.favorite });
            this.render();
            Utils.showNotification(word.favorite ? 'Removed from favorites' : 'Added to favorites');
        }
    },

    deleteWord(wordId) {
        if (confirm('Are you sure you want to delete this word?')) {
            Storage.deleteWord(wordId);
            this.render();
            Statistics.update();
            Utils.showNotification('Word deleted');
        }
    }
};

// =====================
// Statistics Module
// =====================
const Statistics = {
    init() {
        this.update();
    },

    update() {
        const vocabulary = Storage.getVocabulary();
        const stats = Storage.getStatistics();

        // Calculate current stats
        const totalWords = vocabulary.length;
        const learnedWords = vocabulary.filter(w => w.learned).length;
        const pendingWords = totalWords - learnedWords;
        const difficultWords = vocabulary.filter(w => w.difficult).length;

        // Update stats object
        stats.totalWords = totalWords;
        stats.learnedWords = learnedWords;
        stats.pendingWords = pendingWords;

        Storage.saveStatistics(stats);

        // Update UI
        document.getElementById('totalWordsHome').textContent = totalWords;
        document.getElementById('learnedWordsHome').textContent = learnedWords;
        document.getElementById('statTotalWords').textContent = totalWords;
        document.getElementById('statLearned').textContent = learnedWords;
        document.getElementById('statPending').textContent = pendingWords;
        document.getElementById('statAccuracy').textContent = `${stats.quizAccuracy}%`;
        document.getElementById('statStreak').textContent = stats.currentStreak;

        // Update quiz progress
        this.updateQuizProgress(totalWords);
    },

    updateQuizProgress(totalWords) {
        const progressFill = document.getElementById('quizProgressFill');
        const progressText = document.getElementById('quizProgress');
        
        const percentage = Math.min((totalWords / 20) * 100, 100);
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = totalWords;
    },

    updateQuizAccuracy(accuracy) {
        const stats = Storage.getStatistics();
        stats.quizAccuracy = accuracy;
        
        if (accuracy > stats.bestQuizScore) {
            stats.bestQuizScore = accuracy;
        }

        Storage.saveStatistics(stats);
        this.update();
    },

    updateStreak() {
        const streak = Storage.getStreak();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (streak.lastActive === today) {
            // Already active today
            return;
        } else if (streak.lastActive === yesterday) {
            // Continue streak
            streak.current++;
        } else if (streak.lastActive !== today) {
            // Reset streak
            streak.current = 1;
        }

        streak.lastActive = today;
        Storage.setStreak(streak);
        this.update();
    }
};

// =====================
// Home Module
// =====================
const Home = {
    init() {
        this.update();
    },

    update() {
        Statistics.update();
        this.updateWordOfDay();
    },

    updateWordOfDay() {
        const vocabulary = Storage.getVocabulary();
        const wordOfDayCard = document.getElementById('wordOfDayCard');
        const savedWordOfDay = Storage.getWordOfDay();

        if (vocabulary.length === 0) {
            wordOfDayCard.innerHTML = '<div class="word-placeholder">Add words to see your word of the day</div>';
            return;
        }

        let word;
        if (savedWordOfDay) {
            word = vocabulary.find(w => w.word === savedWordOfDay);
        }

        if (!word) {
            word = Utils.getRandomItem(vocabulary);
            Storage.setWordOfDay(word.word);
        }

        wordOfDayCard.innerHTML = `
            <div class="result-word">${word.word}</div>
            <div class="result-meaning">${word.meaning}</div>
            <div class="result-example">"${word.example}"</div>
        `;
    }
};

// =====================
// Flashcards Module
// =====================
const Flashcards = {
    currentIndex: 0,
    cards: [],
    isFlipped: false,
    _listenersAttached: false, // FIX: guard against duplicate event listeners on nav

    init() {
        this.container = document.getElementById('flashcardContainer');
        this.emptyFlashcards = document.getElementById('emptyFlashcards');
        this.flashcard = document.getElementById('flashcard');
        this.flashcardWord = document.getElementById('flashcardWord');
        this.flashcardMeaning = document.getElementById('flashcardMeaning');
        this.flashcardExample = document.getElementById('flashcardExample');
        this.cardProgress = document.getElementById('cardProgress');
        this.flashcardRating = document.getElementById('flashcardRating');
        this.ratingButtons = document.querySelectorAll('.rating-btn');

        this.prevBtn = document.getElementById('prevCard');
        this.nextBtn = document.getElementById('nextCard');
        this.flipBtn = document.getElementById('flipCard');
        this.randomBtn = document.getElementById('randomCard');

        // FIX: Only bind event listeners once
        if (!this._listenersAttached) {
            this.flashcard.addEventListener('click', () => this.flip());
            this.prevBtn.addEventListener('click', () => this.previous());
            this.nextBtn.addEventListener('click', () => this.next());
            this.flipBtn.addEventListener('click', () => this.flip());
            this.randomBtn.addEventListener('click', () => this.random());
            this.ratingButtons.forEach(btn => {
                btn.addEventListener('click', (e) => this.handleRating(e.target.dataset.rating));
            });
            this._listenersAttached = true;
        }

        this.refresh();
    },

    // FIX: Separate data refresh from full init so navigation doesn't re-bind listeners
    refresh() {
        this.cards = Storage.getVocabulary();

        if (this.cards.length === 0) {
            this.container.classList.add('hidden');
            this.emptyFlashcards.classList.remove('hidden');
            return;
        }

        this.container.classList.remove('hidden');
        this.emptyFlashcards.classList.add('hidden');

        this.currentIndex = 0;
        this.isFlipped = false;
        this.renderCard();
        this.updateProgress();
    },

    renderCard() {
        const card = this.cards[this.currentIndex];
        this.flashcardWord.textContent = card.word;
        this.flashcardMeaning.textContent = card.meaning;
        this.flashcardExample.textContent = `"${card.example}"`;
        
        // Reset flip state and rating
        this.isFlipped = false;
        this.flashcard.classList.remove('flipped');
        this.flashcardRating.classList.add('hidden');
    },

    flip() {
        this.isFlipped = !this.isFlipped;
        this.flashcard.classList.toggle('flipped');
        
        // Show rating buttons when flipped to back
        if (this.isFlipped) {
            this.flashcardRating.classList.remove('hidden');
        }
    },

    previous() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderCard();
            this.updateProgress();
        }
    },

    next() {
        if (this.currentIndex < this.cards.length - 1) {
            this.currentIndex++;
            this.renderCard();
            this.updateProgress();
        }
    },

    random() {
        this.currentIndex = Math.floor(Math.random() * this.cards.length);
        this.renderCard();
        this.updateProgress();
    },

    handleRating(rating) {
        const card = this.cards[this.currentIndex];
        
        // Calculate next review date based on spaced repetition
        const now = new Date();
        let nextReview;
        
        switch (rating) {
            case 'forgot':
                nextReview = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
                Storage.updateWord(card.id, { difficult: true, rating: 'forgot', nextReview: nextReview.toISOString() });
                break;
            case 'hard':
                nextReview = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
                Storage.updateWord(card.id, { rating: 'hard', nextReview: nextReview.toISOString() });
                break;
            case 'medium':
                nextReview = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
                Storage.updateWord(card.id, { rating: 'medium', nextReview: nextReview.toISOString() });
                break;
            case 'easy':
                nextReview = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                Storage.updateWord(card.id, { rating: 'easy', nextReview: nextReview.toISOString(), difficult: false });
                break;
        }

        // Update review count
        Storage.updateWord(card.id, { reviewCount: (card.reviewCount || 0) + 1 });

        Utils.showNotification(`Rated as: ${rating}`);
        this.flashcardRating.classList.add('hidden');
        
        // Move to next card
        if (this.currentIndex < this.cards.length - 1) {
            this.next();
        }
    },

    updateProgress() {
        this.cardProgress.textContent = `${this.currentIndex + 1} / ${this.cards.length}`;
    }
};

// =====================
// Quiz Module
// =====================
const Quiz = {
    currentQuiz: null,
    currentQuestion: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    questions: [],

    init() {
        this.quizLocked = document.getElementById('quizLocked');
        this.quizContainer = document.getElementById('quizContainer');
        this.quizMenu = document.querySelector('.quiz-menu');
        this.quizArea = document.getElementById('quizArea');
        this.quizResults = document.getElementById('quizResults');
        this.quizFeedback = document.getElementById('quizFeedback');
        this.stopQuizBtn = document.getElementById('stopQuiz');
        this.quizExitModal = document.getElementById('quizExitModal');

        this.multipleChoiceBtn = document.getElementById('multipleChoiceQuiz');
        this.reverseQuizBtn = document.getElementById('reverseQuiz');
        this.learnedQuizBtn = document.getElementById('learnedQuiz');
        this.restartQuizBtn = document.getElementById('restartQuiz');
        this.backToMenuBtn = document.getElementById('backToMenu');
        this.continueQuizBtn = document.getElementById('continueQuiz');
        this.saveExitQuizBtn = document.getElementById('saveExitQuiz');
        this.discardQuizBtn = document.getElementById('discardQuiz');

        this.multipleChoiceBtn.addEventListener('click', () => this.startQuiz('multiple'));
        this.reverseQuizBtn.addEventListener('click', () => this.startQuiz('reverse'));
        this.learnedQuizBtn.addEventListener('click', () => this.startQuiz('learned'));
        this.restartQuizBtn.addEventListener('click', () => this.backToMenu());
        this.backToMenuBtn.addEventListener('click', () => this.backToMenu());

        this.stopQuizBtn.addEventListener('click', () => this.showExitModal());
        this.continueQuizBtn.addEventListener('click', () => this.hideExitModal());
        this.saveExitQuizBtn.addEventListener('click', () => this.saveAndExit());
        this.discardQuizBtn.addEventListener('click', () => this.discardQuiz());

        this.checkUnlock();
    },

    checkUnlock() {
        const vocabulary = Storage.getVocabulary();
        
        if (vocabulary.length < 20) {
            this.quizLocked.classList.remove('hidden');
            this.quizContainer.classList.add('hidden');
        } else {
            this.quizLocked.classList.add('hidden');
            this.quizContainer.classList.remove('hidden');
        }
    },

    startQuiz(type) {
        const vocabulary = Storage.getVocabulary();
        let quizWords = [];

        switch (type) {
            case 'multiple':
                quizWords = vocabulary;
                break;
            case 'reverse':
                quizWords = vocabulary;
                break;
            case 'learned':
                quizWords = vocabulary.filter(w => w.learned);
                if (quizWords.length < 4) {
                    Utils.showNotification('Need at least 4 learned words for this quiz', 'error');
                    return;
                }
                break;
        }

        if (quizWords.length < 4) {
            Utils.showNotification('Need at least 4 words for quiz', 'error');
            return;
        }

        this.currentQuiz = type;
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.questions = this.generateQuestions(quizWords, type, 10);

        this.quizMenu.classList.add('hidden');
        this.quizArea.classList.remove('hidden');
        this.quizResults.classList.add('hidden');

        this.renderQuestion();
    },

    generateQuestions(words, type, count) {
        const questions = [];
        const shuffledWords = Utils.shuffleArray(words);

        for (let i = 0; i < Math.min(count, shuffledWords.length); i++) {
            const correctWord = shuffledWords[i];
            const distractors = Utils.shuffleArray(
                words.filter(w => w.word !== correctWord.word)
            ).slice(0, 3);

            const options = Utils.shuffleArray([correctWord, ...distractors]);

            if (type === 'reverse') {
                questions.push({
                    question: correctWord.meaning,
                    options: options.map(w => w.word),
                    correctAnswer: correctWord.word,
                    wordId: correctWord.id
                });
            } else {
                questions.push({
                    question: `What does "${correctWord.word}" mean?`,
                    options: options.map(w => w.meaning),
                    correctAnswer: correctWord.meaning,
                    wordId: correctWord.id
                });
            }
        }

        return questions;
    },

    renderQuestion() {
        const question = this.questions[this.currentQuestion];
        const quizQuestion = document.getElementById('quizQuestion');
        const quizOptions = document.getElementById('quizOptions');
        const quizProgress = document.getElementById('quizQuestionProgress');
        const quizFeedback = document.getElementById('quizFeedback');

        quizQuestion.textContent = question.question;
        quizProgress.textContent = `Question ${this.currentQuestion + 1} of ${this.questions.length}`;
        quizFeedback.innerHTML = '';

        quizOptions.innerHTML = question.options.map((option, index) => `
            <button class="quiz-option" data-index="${index}" onclick="Quiz.selectAnswer(${index})">
                ${option}
            </button>
        `).join('');
    },

    selectAnswer(index) {
        const question = this.questions[this.currentQuestion];
        const selectedOption = question.options[index];
        const options = document.querySelectorAll('.quiz-option');
        const quizFeedback = document.getElementById('quizFeedback');

        // Disable all options
        options.forEach(opt => opt.disabled = true);

        if (selectedOption === question.correctAnswer) {
            options[index].classList.add('correct');
            this.correctAnswers++;
            
            // Play success sound
            Utils.playSound('success');
            
            // Show feedback
            quizFeedback.innerHTML = `
                <div class="quiz-feedback correct">
                    ✓ Correct! +5 XP
                </div>
            `;
            
            // Award XP
            const xp = Storage.addXP(5);
            XPSystem.updateDisplay();

            // Mark word as not difficult if correct
            Storage.updateWord(question.wordId, { difficult: false });
        } else {
            options[index].classList.add('wrong');
            // Highlight correct answer
            const correctIndex = question.options.indexOf(question.correctAnswer);
            options[correctIndex].classList.add('correct');
            this.wrongAnswers++;
            
            // Play error sound
            Utils.playSound('error');
            
            // Show feedback
            quizFeedback.innerHTML = `
                <div class="quiz-feedback wrong">
                    ✗ Incorrect. The correct answer is: ${question.correctAnswer}
                </div>
            `;
            
            // Mark word as difficult if wrong
            Storage.updateWord(question.wordId, { difficult: true });
        }

        // Move to next question after delay
        setTimeout(() => {
            this.currentQuestion++;

            if (this.currentQuestion < this.questions.length) {
                this.renderQuestion();
            } else {
                this.showResults();
            }
        }, 2000);
    },

    showResults() {
        const total = this.questions.length;
        const accuracy = Math.round((this.correctAnswers / total) * 100);
        const stats = Storage.getStatistics();

        this.quizArea.classList.add('hidden');
        this.quizResults.classList.remove('hidden');

        document.getElementById('resultCorrect').textContent = this.correctAnswers;
        document.getElementById('resultWrong').textContent = this.wrongAnswers;
        document.getElementById('resultAccuracy').textContent = `${accuracy}%`;
        document.getElementById('resultBest').textContent = `${stats.bestQuizScore}%`;

        // Save quiz result
        Storage.saveQuizResult({
            type: this.currentQuiz,
            correct: this.correctAnswers,
            wrong: this.wrongAnswers,
            accuracy,
            date: new Date().toISOString()
        });

        // Update statistics
        Statistics.updateQuizAccuracy(accuracy);
        Statistics.updateStreak();

        // Check for achievements
        AchievementsSystem.checkAchievements();

        // Update daily challenge
        DailyChallengeSystem.updateProgress('quiz');
    },

    showExitModal() {
        this.quizExitModal.classList.remove('hidden');
    },

    hideExitModal() {
        this.quizExitModal.classList.add('hidden');
    },

    saveAndExit() {
        // Save current progress and exit
        this.hideExitModal();
        this.backToMenu();
        Utils.showNotification('Quiz progress saved');
    },

    discardQuiz() {
        // Discard current quiz and exit
        this.hideExitModal();
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.questions = [];
        this.backToMenu();
        Utils.showNotification('Quiz discarded');
    },

    backToMenu() {
        this.quizMenu.classList.remove('hidden');
        this.quizArea.classList.add('hidden');
        this.quizResults.classList.add('hidden');
    }
};

// =====================
// Review Module
// =====================
const Review = {
    init() {
        this.tabs = document.querySelectorAll('.review-tab');
        this.content = document.getElementById('reviewContent');

        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        this.renderTab('recent');
    },

    switchTab(tabName) {
        this.tabs.forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        this.renderTab(tabName);
    },

    renderTab(tabName) {
        const vocabulary = Storage.getVocabulary();
        let words = [];

        switch (tabName) {
            case 'recent':
                words = [...vocabulary].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)).slice(0, 10);
                break;
            case 'difficult':
                words = vocabulary.filter(w => w.difficult);
                break;
            case 'forgotten':
                words = vocabulary.filter(w => w.rating === 'forgot');
                break;
            case 'learned':
                words = vocabulary.filter(w => w.learned).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);
                break;
            case 'random':
                words = Utils.shuffleArray([...vocabulary]).slice(0, 10);
                break;
            case 'favorites':
                words = vocabulary.filter(w => w.favorite);
                break;
        }

        if (words.length === 0) {
            this.content.innerHTML = '<p class="text-muted">No words to review in this category.</p>';
            return;
        }

        this.content.innerHTML = words.map(word => `
            <div class="vocab-card" onclick="Review.reviewWord(${word.id})">
                <div class="vocab-header">
                    <div class="vocab-word">${word.word}</div>
                    <div class="vocab-date">Reviewed: ${word.reviewCount} times</div>
                </div>
                <div class="vocab-meaning">${word.meaning}</div>
            </div>
        `).join('');
    },

    reviewWord(wordId) {
        Storage.updateWord(wordId, { reviewCount: (Storage.getVocabulary().find(w => w.id === wordId).reviewCount || 0) + 1 });
        this.renderTab(document.querySelector('.review-tab.active').dataset.tab);
        Utils.showNotification('Word reviewed');
        
        // Award XP for reviewing
        const xp = Storage.addXP(10);
        XPSystem.updateDisplay();
        
        // Update daily challenge
        DailyChallengeSystem.updateProgress('review');
    }
};

// =====================
// Export/Import Module
// =====================
const ExportImport = {
    init() {
        this.exportBtn = document.getElementById('exportBtn');
        this.importBtn = document.getElementById('importBtn');
        this.importFile = document.getElementById('importFile');

        this.exportBtn.addEventListener('click', () => this.export());
        this.importBtn.addEventListener('click', () => this.importFile.click());
        this.importFile.addEventListener('change', (e) => this.import(e));
    },

    export() {
        const currentLanguage = Storage.getCurrentLanguage();
        const vocabulary = Storage.getVocabulary(currentLanguage);
        const statistics = Storage.getStatistics();
        const quizResults = Storage.getQuizResults();
        const xp = Storage.getXP();
        const achievements = Storage.getAchievements();
        const settings = Storage.getSettings();

        const data = {
            language: currentLanguage,
            vocabulary,
            statistics,
            quizResults,
            xp,
            achievements,
            settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lexicon-vault-export-${currentLanguage}-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        Utils.showNotification('Vocabulary exported successfully!');
    },

    import(event) {
        const file = event.target.files[0];
        
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.language) {
                    Storage.setCurrentLanguage(data.language);
                }

                if (data.vocabulary) {
                    Storage.saveVocabulary(data.vocabulary, data.language);
                }

                if (data.statistics) {
                    Storage.saveStatistics(data.statistics);
                }

                if (data.quizResults) {
                    localStorage.setItem(Storage.KEYS.QUIZ_RESULTS, JSON.stringify(data.quizResults));
                }

                if (data.xp) {
                    localStorage.setItem(Storage.KEYS.XP, JSON.stringify(data.xp));
                }

                if (data.achievements) {
                    localStorage.setItem(Storage.KEYS.ACHIEVEMENTS, JSON.stringify(data.achievements));
                }

                if (data.settings) {
                    localStorage.setItem(Storage.KEYS.SETTINGS, JSON.stringify(data.settings));
                }

                Utils.showNotification('Vocabulary imported successfully!');
                Statistics.update();
                Vocabulary.render();
                XPSystem.updateDisplay();
                AchievementsSystem.render();
            } catch (error) {
                Utils.showNotification('Error importing file', 'error');
                console.error(error);
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    }
};

// =====================
// Notification Module
// =====================
const Notification = {
    init() {
        this.closeBtn = document.getElementById('closeNotification');
        this.notification = document.getElementById('notification');

        this.closeBtn.addEventListener('click', () => {
            this.notification.classList.add('hidden');
        });
    }
};

// =====================
// XP System Module
// =====================
const XPSystem = {
    init() {
        this.xpLevel = document.getElementById('xpLevel');
        this.xpPoints = document.getElementById('xpPoints');
        this.updateDisplay();
    },

    updateDisplay() {
        const xp = Storage.getXP();
        this.xpLevel.textContent = `Level ${xp.level}`;
        this.xpPoints.textContent = `${xp.total} XP`;
    }
};

// =====================
// Achievements System Module
// =====================
const AchievementsSystem = {
    ACHIEVEMENTS: [
        { id: 'first_word', name: 'First Word', icon: '📝', desc: 'Save your first word' },
        { id: 'ten_words', name: 'Word Collector', icon: '📚', desc: 'Save 10 words' },
        { id: 'fifty_words', name: 'Vocabulary Builder', icon: '🏗️', desc: 'Save 50 words' },
        { id: 'hundred_words', name: 'Lexicon Master', icon: '👑', desc: 'Save 100 words' },
        { id: 'quiz_master', name: 'Quiz Master', icon: '🎯', desc: 'Complete a quiz with 100% accuracy' },
        { id: 'seven_day_streak', name: 'Week Warrior', icon: '🔥', desc: 'Maintain a 7-day streak' },
        { id: 'vocabulary_scholar', name: 'Vocabulary Scholar', icon: '🎓', desc: 'Learn 50 words' }
    ],

    init() {
        this.achievementsGrid = document.getElementById('achievementsGrid');
        this.render();
    },

    render() {
        const unlockedAchievements = Storage.getAchievements();
        const vocabulary = Storage.getVocabulary();
        const stats = Storage.getStatistics();

        this.achievementsGrid.innerHTML = this.ACHIEVEMENTS.map(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            return `
                <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                </div>
            `;
        }).join('');
    },

    checkAchievements() {
        const vocabulary = Storage.getVocabulary();
        const stats = Storage.getStatistics();
        const xp = Storage.getXP();
        const streak = Storage.getStreak();

        // Check each achievement
        if (vocabulary.length >= 1) this.unlock('first_word');
        if (vocabulary.length >= 10) this.unlock('ten_words');
        if (vocabulary.length >= 50) this.unlock('fifty_words');
        if (vocabulary.length >= 100) this.unlock('hundred_words');
        if (stats.quizAccuracy === 100 && stats.totalWords > 0) this.unlock('quiz_master');
        if (streak.current >= 7) this.unlock('seven_day_streak');
        if (stats.learnedWords >= 50) this.unlock('vocabulary_scholar');

        this.render();
    },

    unlock(achievementId) {
        if (Storage.unlockAchievement(achievementId)) {
            const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
            Utils.showNotification(`Achievement Unlocked: ${achievement.name}!`);
            Utils.playSound('success');
            
            // Award bonus XP for achievement
            Storage.addXP(50);
            XPSystem.updateDisplay();
        }
    }
};

// =====================
// Daily Challenge System Module
// =====================
const DailyChallengeSystem = {
    CHALLENGES: [
        { id: 'save_5', title: 'Save 5 new words', target: 5, type: 'save', reward: 30 },
        { id: 'review_10', title: 'Review 10 words', target: 10, type: 'review', reward: 30 },
        { id: 'complete_quiz', title: 'Complete 1 quiz', target: 1, type: 'quiz', reward: 30 },
        { id: 'earn_30_xp', title: 'Earn 30 XP', target: 30, type: 'xp', reward: 20 }
    ],

    init() {
        this.challengeTitle = document.getElementById('challengeTitle');
        this.challengeProgress = document.getElementById('challengeProgress');
        this.dailyChallengeCard = document.getElementById('dailyChallengeCard');
        
        this.generateDailyChallenge();
    },

    generateDailyChallenge() {
        const existingChallenge = Storage.getDailyChallenge();
        
        if (existingChallenge) {
            this.displayChallenge(existingChallenge.challenge, existingChallenge.progress);
            return;
        }

        // Generate a new random challenge — BUG FIX: pass challenge.id (string), not the full object
        const challenge = Utils.getRandomItem(this.CHALLENGES);
        Storage.setDailyChallenge(challenge.id, 0);
        this.displayChallenge(challenge.id, 0);  // was: this.displayChallenge(challenge, 0)
    },

    displayChallenge(challenge, progress) {
        const challengeData = this.CHALLENGES.find(c => c.id === challenge);
        if (!challengeData) {
            this.generateDailyChallenge();
            return;
        }

        this.challengeTitle.textContent = challengeData.title;
        this.challengeProgress.textContent = `${progress} / ${challengeData.target} completed`;
    },

    updateProgress(type) {
        const dailyChallenge = Storage.getDailyChallenge();
        if (!dailyChallenge) return;

        const challengeData = this.CHALLENGES.find(c => c.id === dailyChallenge.challenge);
        if (!challengeData || challengeData.type !== type) return;

        let newProgress = dailyChallenge.progress;
        
        if (type === 'xp') {
            const xp = Storage.getXP();
            newProgress = Math.min(xp.total, challengeData.target);
        } else {
            newProgress = Math.min(dailyChallenge.progress + 1, challengeData.target);
        }

        Storage.setDailyChallenge(dailyChallenge.challenge, newProgress);
        this.displayChallenge(dailyChallenge.challenge, newProgress);

        // Check if challenge is complete
        if (newProgress >= challengeData.target) {
            this.completeChallenge(challengeData);
        }
    },

    completeChallenge(challenge) {
        Utils.showNotification(`Daily Challenge Complete! +${challenge.reward} XP`);
        Utils.playSound('success');
        
        const xp = Storage.addXP(challenge.reward);
        XPSystem.updateDisplay();
        
        AchievementsSystem.checkAchievements();
    }
};

// =====================
// Settings Module
// =====================
const Settings = {
    init() {
        this.soundToggle = document.getElementById('soundToggle');
        
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        this.updateDisplay();
    },

    updateDisplay() {
        const settings = Storage.getSettings();
        this.soundToggle.textContent = `Sound: ${settings.sound ? 'ON' : 'OFF'}`;
    },

    toggleSound() {
        const settings = Storage.getSettings();
        const newSettings = Storage.updateSettings({ sound: !settings.sound });
        this.soundToggle.textContent = `Sound: ${newSettings.sound ? 'ON' : 'OFF'}`;
        Utils.showNotification(`Sound ${newSettings.sound ? 'enabled' : 'disabled'}`);
    }
};

// =====================
// Application Initialization
// =====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Navigation.init();
    Search.init();
    Vocabulary.init();
    Statistics.init();
    Home.init();
    Flashcards.init();
    Quiz.init();
    Review.init();
    ExportImport.init();
    Notification.init();
    XPSystem.init();
    AchievementsSystem.init();
    DailyChallengeSystem.init();
    Settings.init();

    // Update streak on load
    Statistics.updateStreak();
});