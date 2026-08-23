/**
 * Mushaf rendering spike - /mushaf-spike
 *
 * Disposable experiment answering FEATURE_MAP open question §4.1: can a
 * page-faithful mushaf be rendered as TEXT (bundled UthmanicHafs_V22 +
 * line geometry from quran.db glyphs table) instead of page images?
 *
 * Verdict criteria (screenshot on iOS sim / Android device):
 *  1. Shaping correctness - joined letters, marks positioned, no tofu
 *  2. Line fidelity - print line breaks reproduced from geometry data
 *  3. Legibility at device width - and via zoom controls
 *
 * Native-only by design: web already has a known-good text path.
 */

import { useDatabase } from "@/hooks/useDatabase";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import type { SQLiteDatabase } from "expo-sqlite";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const FONT_FAMILY = "UthmanicHafs_V22";
/** ayahinfo geometry was authored on a 2048-wide grid */
const GRID_WIDTH = 2048;
const BASE_FONT_UNITS = 95;

type GlyphWord = {
  sura_number: number;
  ayah_number: number;
  position: number;
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
};

type LineWord = {
  key: string;
  text: string;
  glyph: GlyphWord;
};

type MushafLine = {
  lineNumber: number;
  words: LineWord[];
  minX: number;
  maxX: number;
};

type PageLayout = {
  lines: MushafLine[];
  warnings: string[];
  topY: number;
  bottomY: number;
};

async function fetchPageLayout(
  db: SQLiteDatabase,
  page: number,
): Promise<PageLayout> {
  const rows = await db.getAllAsync<
    Record<string, number | string> & { line_number: number }
  >(
    `SELECT g.sura_number, g.ayah_number, g.position,
            g.min_x, g.max_x, g.min_y, g.max_y, g.line_number,
            a.uthmani_text
     FROM glyphs g
     JOIN ayahs a ON a.sura_number = g.sura_number AND a.ayah_number = g.ayah_number
     WHERE g.page_number = ?
     ORDER BY g.line_number, g.sura_number, g.ayah_number, g.position`,
    [page],
  );

  const warnings: string[] = [];
  const linesByNumber = new Map<number, MushafLine>();
  let topY = Infinity;
  let bottomY = -Infinity;

  for (const row of rows) {
    const lineNumber = Number(row.line_number);
    const position = Number(row.position);

    const words = String(row.uthmani_text).split(/\s+/).filter(Boolean);
    const wordText = words[position - 1];
    if (wordText === undefined) {
      if (warnings.length < 5) {
        warnings.push(
          `p${position} missing in ${row.sura_number}:${row.ayah_number} (${words.length} words in text)`,
        );
      }
      continue;
    }

    const glyph: GlyphWord = {
      sura_number: Number(row.sura_number),
      ayah_number: Number(row.ayah_number),
      position,
      min_x: Number(row.min_x),
      max_x: Number(row.max_x),
      min_y: Number(row.min_y),
      max_y: Number(row.max_y),
    };

    let line = linesByNumber.get(lineNumber);
    if (!line) {
      line = { lineNumber, words: [], minX: Infinity, maxX: -Infinity };
      linesByNumber.set(lineNumber, line);
    }
    line.words.push({
      key: `${glyph.sura_number}:${glyph.ayah_number}:${position}`,
      text: wordText,
      glyph,
    });
    line.minX = Math.min(line.minX, glyph.min_x);
    line.maxX = Math.max(line.maxX, glyph.max_x);

    topY = Math.min(topY, glyph.min_y);
    bottomY = Math.max(bottomY, glyph.max_y);
  }

  return {
    lines: [...linesByNumber.values()],
    warnings,
    topY,
    bottomY,
  };
}

function usePageLayout(page: number) {
  const db = useDatabase();
  return useQuery({
    queryKey: ["mushaf-spike", page],
    queryFn: () => {
      if (!db) throw new Error("quran.db unavailable on this platform");
      return fetchPageLayout(db, page);
    },
    staleTime: Infinity,
  });
}

function SpikeButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

export default function MushafSpike() {
  const params = useLocalSearchParams<{ page?: string }>();
  const [page, setPage] = useState(Number(params.page) || 2);
  const [zoom, setZoom] = useState(1);
  const [showDebug, setShowDebug] = useState(true);
  const { width: windowWidth } = useWindowDimensions();
  const { data, isLoading, isError } = usePageLayout(page);

  if (Platform.OS === "web") {
    return (
      <View style={styles.center}>
        <Text style={styles.debugText}>
          Native-only spike — run in dev build on simulator/device.
        </Text>
      </View>
    );
  }

  const horizontalPadding = 12;
  const scale = (windowWidth - horizontalPadding * 2) / GRID_WIDTH;
  const fontSize = BASE_FONT_UNITS * scale * zoom;

  // Vertical rhythm from the page's own geometry: content span divided
  // evenly across detected lines (adapts to 15/16-line pages).
  const linePitch =
    data && data.lines.length > 0 && Number.isFinite(data.topY)
      ? ((data.bottomY - data.topY) / data.lines.length) * scale * zoom
      : fontSize * 2;

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <SpikeButton
          label="‹"
          onPress={() => setPage((p) => Math.max(1, p - 1))}
        />
        <Text style={styles.pageIndicator}>{page}</Text>
        <SpikeButton
          label="›"
          onPress={() => setPage((p) => Math.min(604, p + 1))}
        />
        <SpikeButton
          label="A−"
          onPress={() => setZoom((z) => Math.max(0.5, z - 0.1))}
        />
        <SpikeButton
          label="A+"
          onPress={() => setZoom((z) => Math.min(3, z + 0.1))}
        />
        <SpikeButton label="dbg" onPress={() => setShowDebug((d) => !d)} />
      </View>

      {showDebug && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>
            w={Math.round(windowWidth)} scale={scale.toFixed(3)} fs=
            {fontSize.toFixed(1)} pitch={linePitch.toFixed(1)}
          </Text>
          {data && (
            <Text style={[styles.debugText, styles.debugAccent]}>
              {data.lines.length} lines ·{" "}
              {data.lines.reduce((n, l) => n + l.words.length, 0)} words
              {data.warnings.length > 0 &&
                ` · ⚠ ${data.warnings.length}+ mismatches: ${data.warnings[0]}`}
            </Text>
          )}
        </View>
      )}

      {isLoading && (
        <View style={styles.center}>
          <Text style={styles.debugText}>Loading page {page}…</Text>
        </View>
      )}
      {isError && (
        <View style={styles.center}>
          <Text style={styles.debugText}>Failed to load layout.</Text>
        </View>
      )}

      {data && (
        <ScrollView contentContainerStyle={styles.pageContent}>
          <View style={styles.page}>
            {data.lines.map((line) => (
              <View
                key={line.lineNumber}
                style={{
                  height: linePitch,
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                  alignItems: "center",
                  alignSelf: "stretch",
                  marginLeft: line.minX * scale,
                  marginRight:
                    GRID_WIDTH - line.maxX * scale > 0
                      ? (GRID_WIDTH - line.maxX) * scale
                      : 0,
                }}
              >
                {line.words.map((word) => (
                  <Text
                    key={word.key}
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize,
                      color: "#111",
                      writingDirection: "rtl",
                    }}
                    numberOfLines={1}
                  >
                    {word.text}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const horizontalPadding = 12;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8f4e8" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 48,
    paddingBottom: 8,
  },
  button: {
    backgroundColor: "#2a2a2a",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  buttonLabel: { color: "#fff", fontSize: 14, fontWeight: "600" },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "700",
    minWidth: 32,
    textAlign: "center",
  },
  debugPanel: { paddingHorizontal: 12, paddingBottom: 6 },
  debugText: { fontSize: 11, color: "#555" },
  debugAccent: { color: "#a33" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pageContent: { flexGrow: 1, justifyContent: "center" },
  page: {
    marginHorizontal: horizontalPadding,
    borderRadius: 4,
  },
});
