export const createSectionObserver = (
  sections: Element[],
  onVisible: (id: string) => void,
  options: IntersectionObserverInit
): IntersectionObserver => {
  const observer = new IntersectionObserver((entries) => {
    // find the entry with the highest intersection ratio
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target.id) {
      onVisible(visible.target.id);
    };
  }, options);

  sections.forEach(section => {
    observer.observe(section);
  });

  return observer;
};