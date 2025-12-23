# Database Schema

**SQLite Database Path:** `assets/quran.db`

This document describes the structure and sample data of the Quran database.
It includes tables for Surahs, Ayahs, Sajdah markers, Page segments, Segment ranges, and also provides a query to generate Juz with their starting Surahs.

---

## 🕋 surahs Table

### DDL

```sql
CREATE TABLE surahs (
    id INTEGER PRIMARY KEY,
    revelation_place TEXT,
    revelation_order INTEGER,
    bismillah_pre INTEGER, /* 0 for false, 1 for true */
    name_simple TEXT,
    name_complex TEXT,
    name_arabic TEXT,
    verses_count INTEGER,
    pages_range TEXT /* Store as "start-end" string */
);
```

### Example

```csv
id	revelation_place	revelation_order	bismillah_pre	name_simple	name_complex	name_arabic	verses_count	pages_range
1	makkah	5	0	Al-Fatihah	Al-Fātiĥah	الفاتحة	7	1-1
2	madinah	87	1	Al-Baqarah	Al-Baqarah	البقرة	286	2-49
```

---

## 📖 ayahs Table

### DDL

```sql
CREATE TABLE ayahs (
    sura_number INTEGER,
    ayah_number INTEGER,
    uthmani_text TEXT,
    simple_text TEXT,
    PRIMARY KEY (sura_number, ayah_number),
    FOREIGN KEY (sura_number) REFERENCES surahs(id)
);
```

### Example

```csv
sura_number	ayah_number	uthmani_text	simple_text
1	1	بِسمِ اللَّهِ الرَّحمـٰنِ الرَّحيمِ	بسم الله الرحمن الرحيم
1	2	الحَمدُ لِلَّهِ رَبِّ العـٰلَمينَ	الحمد لله رب العالمين
1	3	الرَّحمـٰنِ الرَّحيمِ	الرحمن الرحيم
1	4	مـٰلِكِ يَومِ الدّينِ	مالك يوم الدين
1	5	إِيّاكَ نَعبُدُ وَإِيّاكَ نَستَعينُ	إياك نعبد وإياك نستعين
1	6	اهدِنَا الصِّرٰطَ المُستَقيمَ	اهدنا الصراط المستقيم
1	7	صِرٰطَ الَّذينَ أَنعَمتَ عَلَيهِم غَيرِ المَغضوبِ عَلَيهِم وَلَا الضّالّينَ	صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين
2	1	بِسمِ اللَّهِ الرَّحمـٰنِ الرَّحيمِ الم	بسم الله الرحمن الرحيم الم
2	2	ذٰلِكَ الكِتـٰبُ لا رَيبَ ۛ فيهِ ۛ هُدًى لِلمُتَّقينَ	ذلك الكتاب لا ريب ۛ فيه ۛ هدى للمتقين
```

### 🔍 Note

The **`simple_text` column** in the `ayahs` table **supports Full-Text Search (FTS)** for fast searching of Arabic text using SQLite FTS5 or FTS4. This allows efficient keyword search and text indexing.

---

## 📄 page_segments Table

### DDL

```sql
CREATE TABLE page_segments (
    page_number INTEGER PRIMARY KEY,
    juz_number INTEGER NOT NULL,
    hizb_number INTEGER NOT NULL,
    rub_number INTEGER NOT NULL,
    manzil_number INTEGER NOT NULL,
    sura_start INTEGER NOT NULL,
    ayah_start INTEGER NOT NULL,
    sura_end INTEGER NOT NULL,
    ayah_end INTEGER NOT NULL,
    FOREIGN KEY (sura_start, ayah_start) REFERENCES ayahs(sura_number, ayah_number),
    FOREIGN KEY (sura_end, ayah_end) REFERENCES ayahs(sura_number, ayah_number)
);
```

### Example

```csv
page_number	juz_number	hizb_number	rub_number	manzil_number	sura_start	ayah_start	sura_end	ayah_end
1	1	1	1	1	1	1	1	7
2	1	1	1	1	2	1	2	5
```

---

## 🙏 sajdah_markers Table

### DDL

```sql
CREATE TABLE sajdah_markers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sajdah_id INTEGER NOT NULL,
    sura_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    sajdah_type TEXT NOT NULL
);
```

### Example

```csv
id	sajdah_id	sura_number	ayah_number	sajdah_type
1	1	7	206	optional
2	2	13	15	optional
3	3	16	50	optional
4	4	17	109	optional
5	5	19	58	optional
6	6	22	18	optional
7	7	25	60	optional
8	8	27	26	optional
9	9	32	15	required
```

---

## 📚 segment_ranges Table

### DDL

```sql
CREATE TABLE segment_ranges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,             -- e.g., 'hizb', 'juz', 'rub', 'manzil'
    number INTEGER NOT NULL,
    sura_number INTEGER NOT NULL,
    ayah_start INTEGER NOT NULL,
    ayah_end INTEGER NOT NULL
);
```

### Example

```csv
id	type	number	sura_number	ayah_start	ayah_end
1	hizb	1	1	1	7
2	hizb	1	2	1	74
3	hizb	2	2	75	141
4	hizb	3	2	142	202
5	hizb	4	2	203	252
6	hizb	5	2	253	286
```

---

## 📌 Generating Juz with Surahs

To get the list of **Surahs that start in each Juz**, you can use the following SQLite query:

```sql
-- Step 1: Find the first page for each Surah
WITH surah_first_page AS (
  SELECT
    ps.sura_start AS surah_id,
    MIN(ps.page_number) AS first_page
  FROM page_segments ps
  GROUP BY ps.sura_start
),
-- Step 2: Get the Juz number for that first page
surah_first_juz AS (
  SELECT
    sfp.surah_id,
    ps.juz_number
  FROM surah_first_page sfp
  JOIN page_segments ps
    ON ps.page_number = sfp.first_page
)
-- Step 3: Group Surahs by their first Juz
SELECT
  sfj.juz_number,
  json_group_array(
    json_object(
      'id', s.id,
      'name_simple', s.name_simple,
      'name_arabic', s.name_arabic,
      'revelation_place', s.revelation_place,
      'verses_count', s.verses_count,
      'pages_range', s.pages_range
    )
  ) AS surahs
FROM surah_first_juz sfj
JOIN surahs s ON s.id = sfj.surah_id
GROUP BY sfj.juz_number
ORDER BY sfj.juz_number;
```

### 🔹 Explanation

1. **`surah_first_page`** – Finds the first page where each Surah appears (`MIN(page_number)` of `sura_start` in `page_segments`).
2. **`surah_first_juz`** – Maps each Surah’s first page to the corresponding `juz_number`.
3. **Final SELECT** – Joins with `surahs` to include metadata and groups the Surahs by `juz_number`.
4. The result is a **JSON array per Juz**, suitable for direct use in applications.

---

### Example Output

```json
[
  {
    "juz_number": 1,
    "surahs": [
      {"id":1,"name_simple":"Al-Fatihah","name_arabic":"الفاتحة","revelation_place":"makkah","verses_count":7,"pages_range":"1-1"},
      {"id":2,"name_simple":"Al-Baqarah","name_arabic":"البقرة","revelation_place":"madinah","verses_count":286,"pages_range":"2-49"}
    ]
  },
  {
    "juz_number": 2,
    "surahs": [
      {"id":3,"name_simple":"Aal-Imran","name_arabic":"آل عمران","revelation_place":"madinah", ... }
    ]
  }
]
```

---
