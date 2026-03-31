export const createSectionObserver = (
  sections: Element[],
  onVisible: (id: string) => void,
  options: IntersectionObserverInit
): IntersectionObserver => {
  const observer = new IntersectionObserver((entries) => {
    // Prefer highest ratio, then earlier document order for deterministic ties.
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => {
        const ratioDiff = b.intersectionRatio - a.intersectionRatio;

        if (ratioDiff !== 0) return ratioDiff;

        const relativePosition = a.target.compareDocumentPosition(b.target);

        if (relativePosition & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
        if (relativePosition & Node.DOCUMENT_POSITION_PRECEDING) return 1;

        return 0;
      })[0];

    if (visible?.target.id) {
      onVisible(visible.target.id);
    }
  }, options);

  sections.forEach(section => {
    observer.observe(section);
  });

  return observer;
};