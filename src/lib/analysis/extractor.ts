import type { Page } from "playwright";

export type ExtractedElementStyles = {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  margins: string[];
  paddings: string[];
  gaps: string[];
  radii: string[];
  boxShadow: string;
  transition: string;
  animation: string;
};

export type ExtractionResult = {
  elements: ExtractedElementStyles[];
  totalVisibleElements: number;
};

export type ExtractStylesOptions = {
  nodeLimit: number;
};

export async function extractVisibleElementStyles(
  page: Page,
  options: ExtractStylesOptions,
): Promise<ExtractionResult> {
  return page.evaluate(({ nodeLimit }) => {
    const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK"]);
    const allElements = Array.from(document.body.querySelectorAll("*"));

    const visibleElements = allElements
      .map((element) => {
        const htmlElement = element as HTMLElement;
        const style = window.getComputedStyle(htmlElement);
        const rect = htmlElement.getBoundingClientRect();
        const textLength = (htmlElement.innerText || "").trim().length;
        const area = rect.width * rect.height;

        if (
          ignoredTags.has(htmlElement.tagName) ||
          style.display === "none" ||
          style.visibility === "hidden" ||
          Number.parseFloat(style.opacity || "1") < 0.05 ||
          rect.width < 4 ||
          rect.height < 4 ||
          area < 24
        ) {
          return null;
        }

        const hasVisualSystemSignal =
          style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
          style.boxShadow !== "none" ||
          style.borderRadius !== "0px" ||
          style.display.includes("flex") ||
          style.display.includes("grid");

        const score =
          Math.min(area / 40000, 6) +
          Math.min(textLength / 80, 4) +
          (hasVisualSystemSignal ? 2 : 0);

        return { element: htmlElement, score };
      })
      .filter((entry): entry is { element: HTMLElement; score: number } => entry !== null);

    const sampledElements = visibleElements
      .sort((a, b) => b.score - a.score)
      .slice(0, nodeLimit)
      .map(({ element }) => {
        const style = window.getComputedStyle(element);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          backgroundColor: style.backgroundColor,
          margins: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft],
          paddings: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
          gaps: [style.gap, style.rowGap, style.columnGap],
          radii: [
            style.borderTopLeftRadius,
            style.borderTopRightRadius,
            style.borderBottomRightRadius,
            style.borderBottomLeftRadius,
          ],
          boxShadow: style.boxShadow,
          transition: [
            style.transitionProperty,
            style.transitionDuration,
            style.transitionTimingFunction,
            style.transitionDelay,
          ].join(" "),
          animation: [
            style.animationName,
            style.animationDuration,
            style.animationTimingFunction,
            style.animationDelay,
          ].join(" "),
        };
      });

    return {
      elements: sampledElements,
      totalVisibleElements: visibleElements.length,
    };
  }, options);
}
