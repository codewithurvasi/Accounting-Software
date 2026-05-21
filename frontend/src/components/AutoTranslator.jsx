import { useEffect } from "react";
import { translateBatch } from "../utils/translate";

const originalTexts = new WeakMap();
const memoryCache = new Map();

const skipTags = [
  "SCRIPT",
  "STYLE",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
  "SVG",
  "PATH",
];

const shouldSkipNode = (node) => {
  const text = node.nodeValue?.trim();
  const parent = node.parentElement;

  if (!text || !parent) return true;
  if (skipTags.includes(parent.tagName)) return true;
  if (parent.closest("[data-no-translate='true']")) return true;

  if (/^[₹$€£\d\s.,/%:-]+$/.test(text)) return true;
  if (text.length > 80) return true;

  return false;
};

const getTextNodes = () => {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) =>
        shouldSkipNode(node)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    }
  );

  const nodes = [];
  let node;

  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  return nodes;
};

export default function AutoTranslator({ language }) {
  useEffect(() => {
    let cancelled = false;

    const runTranslation = async () => {
      const nodes = getTextNodes();
      const textsToTranslate = [];

      nodes.forEach((node) => {
        const currentText = node.nodeValue.trim();

        if (!originalTexts.has(node)) {
          originalTexts.set(node, currentText);
        }

        const originalText = originalTexts.get(node);

        if (language === "en") {
          node.nodeValue = originalText;
          return;
        }

        const localKey = `hi:${originalText}`;
        const saved = localStorage.getItem(localKey);

        if (saved) {
          memoryCache.set(originalText, saved);
          node.nodeValue = saved;
          return;
        }

        if (!memoryCache.has(originalText)) {
          textsToTranslate.push(originalText);
        }
      });

      if (language !== "hi") return;

      const uniqueTexts = [...new Set(textsToTranslate)].slice(0, 25);

      if (uniqueTexts.length > 0) {
        const translatedMap = await translateBatch(uniqueTexts, "hi");

        translatedMap.forEach((value, key) => {
          memoryCache.set(key, value);
          localStorage.setItem(`hi:${key}`, value);
        });
      }

      if (cancelled) return;

      nodes.forEach((node) => {
        const originalText = originalTexts.get(node);
        const translatedText = memoryCache.get(originalText);

        if (translatedText) {
          node.nodeValue = translatedText;
        }
      });
    };

    const timer = setTimeout(runTranslation, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [language]);

  return null;
}